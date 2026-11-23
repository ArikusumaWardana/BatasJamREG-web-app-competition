import {
  computeCharterAdoptionPercentage,
  summarizeEmergencyAudit,
} from "@/features/wellbeing/lib/wellbeing-metrics";
import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { requireWorkspaceMember } from "@/lib/api/workspace-auth";
import {
  isEndTimeAfterStartTime,
  updateWorkspaceSchema,
} from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const [
    { data: workspace, error: wsError },
    { count: memberCount },
    { count: queuedMorningCount },
    { data: activeCharter },
    { data: recentSnapshots },
    { data: emergencyCards },
    orgRes,
  ] = await Promise.all([
    auth.supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .maybeSingle(),
    auth.supabase
      .from("workspace_members")
      .select("user_id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    auth.supabase
      .from("digest_cards")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "QUEUED")
      .eq("triage_type", "MORNING_QUEUE"),
    auth.supabase
      .from("team_charters")
      .select("id, title, version, quiet_hours_start, quiet_hours_end, updated_at")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .maybeSingle(),
    auth.supabase
      .from("audit_snapshots")
      .select(
        "id, label, period_start, period_end, total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count, peak_day_of_week, peak_hour, heatmap_matrix, created_at"
      )
      .eq("workspace_id", workspaceId)
      .order("period_start", { ascending: false })
      .limit(6),
    auth.supabase
      .from("digest_cards")
      .select("emergency_review_status")
      .eq("workspace_id", workspaceId)
      .eq("triage_type", "EMERGENCY_OPS")
      .neq("status", "ARCHIVED"),
    auth.organizationId
      ? auth.supabase
          .from("organizations")
          .select("name")
          .eq("id", auth.organizationId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (wsError || !workspace) {
    return apiError("NOT_FOUND", "Workspace tidak ditemukan.", 404);
  }

  let charterAdoption = null;
  if (activeCharter) {
    const { data: ackRows } = await auth.supabase
      .from("charter_acknowledgements")
      .select("user_id")
      .eq("charter_id", activeCharter.id)
      .eq("workspace_id", workspaceId);

    const signedCount = ackRows?.length ?? 0;
    const totalMembers = Math.max(memberCount ?? 0, signedCount);
    charterAdoption = {
      charter_id: activeCharter.id,
      signed_count: signedCount,
      total_members: totalMembers,
      adoption_percentage: computeCharterAdoptionPercentage(
        signedCount,
        totalMembers
      ),
      has_signed: (ackRows ?? []).some((row) => row.user_id === auth.user.id),
    };
  }

  return apiSuccess({
    ...workspace,
    organization_name: orgRes.data?.name ?? null,
    org_role: auth.isOrgOwner ? "OWNER" : auth.organizationId ? "MEMBER" : null,
    role: auth.role,
    is_joined: auth.isJoined,
    member_count: memberCount ?? 0,
    queued_morning_count: queuedMorningCount ?? 0,
    active_charter: activeCharter ?? null,
    charter_adoption: charterAdoption,
    emergency_audit_summary: summarizeEmergencyAudit(emergencyCards ?? []),
    recent_snapshots: recentSnapshots ?? [],
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  if (auth.role !== "OWNER" && auth.role !== "LEAD") {
    return apiError(
      "FORBIDDEN",
      "Hanya Owner atau Lead yang dapat mengubah pengaturan workspace.",
      403
    );
  }

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = updateWorkspaceSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Data pembaruan workspace tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const { data: existing } = await auth.supabase
    .from("workspaces")
    .select("work_start_time, work_end_time")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!existing) {
    return apiError("NOT_FOUND", "Workspace tidak ditemukan.", 404);
  }

  const nextStart = parsed.data.work_start_time ?? existing.work_start_time;
  const nextEnd = parsed.data.work_end_time ?? existing.work_end_time;

  if (!isEndTimeAfterStartTime(nextStart, nextEnd)) {
    return apiError(
      "VALIDATION_ERROR",
      "Jam selesai kerja harus lebih besar dari jam mulai kerja.",
      400,
      {
        work_end_time: [
          "Jam selesai kerja harus lebih besar dari jam mulai kerja.",
        ],
      }
    );
  }

  const { data: updated, error: updateError } = await auth.supabase
    .from("workspaces")
    .update(parsed.data)
    .eq("id", workspaceId)
    .select("*")
    .single();

  if (updateError || !updated) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal menyimpan pengaturan workspace.",
      500
    );
  }

  return apiSuccess({ ...updated, role: auth.role });
}
