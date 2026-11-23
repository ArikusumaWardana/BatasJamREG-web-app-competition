import type {
  RawActiveCharterInput,
  RawCharterAckRef,
  RawDivisionWellbeingInput,
  RawEmergencyCardRef,
} from "@/features/organization/lib/governance-metrics";
import { buildOrganizationOverview } from "@/features/organization/lib/overview-metrics";
import type { RawWellbeingSummaryRpcRow } from "@/features/wellbeing/lib/wellbeing-metrics";
import { requireOrgOwner } from "@/lib/api/organization-auth";
import { apiError, apiSuccess } from "@/lib/api/response";

interface RouteContext {
  params: Promise<{ orgId: string }>;
}

interface RawMemberWithProfile {
  workspace_id: string;
  user_id: string;
  role: string;
  profiles:
    | { full_name: string; role_title: string }
    | { full_name: string; role_title: string }[]
    | null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { orgId } = await context.params;
  const auth = await requireOrgOwner(orgId);
  if (!auth.ok) return auth.response;

  const [
    { data: organization, error: orgErr },
    { data: workspaces, error: wsErr },
    { data: orgMembers, error: orgMemErr },
  ] = await Promise.all([
    auth.supabase
      .from("organizations")
      .select("id, name, slug, stamp_url")
      .eq("id", orgId)
      .maybeSingle(),
    auth.supabase
      .from("workspaces")
      .select(
        "id, name, slug, invite_code, work_pattern, work_start_time, work_end_time, digest_dispatch_time, timezone, work_days, created_at"
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true }),
    auth.supabase
      .from("organization_members")
      .select("user_id, role")
      .eq("organization_id", orgId),
  ]);

  if (orgErr || wsErr || orgMemErr) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat ringkasan perusahaan.",
      500
    );
  }

  if (!organization) {
    return apiError("NOT_FOUND", "Organisasi tidak ditemukan.", 404);
  }

  const workspaceIds = (workspaces ?? []).map((ws) => ws.id);
  let divisionMembers: {
    workspace_id: string;
    user_id: string;
    role: string;
    full_name: string;
    role_title: string;
  }[] = [];
  let snapshots: {
    id: string;
    workspace_id: string;
    label: string;
    period_start: string;
    period_end: string;
    total_messages: number;
    after_hours_messages: number;
    shadow_overtime_hours: number;
    false_urgency_count: number;
    heatmap_matrix?: unknown;
    created_at: string;
  }[] = [];
  let activeCharters: RawActiveCharterInput[] = [];
  let acknowledgements: RawCharterAckRef[] = [];
  let emergencyCards: RawEmergencyCardRef[] = [];
  let wellbeingByWorkspace: RawDivisionWellbeingInput[] = [];

  if (workspaceIds.length > 0) {
    const [
      { data: memberRows, error: memErr },
      { data: snapRows, error: snapErr },
      { data: charterRows },
      { data: ackRows },
      { data: emergencyRows },
      ...wellbeingRpcResults
    ] = await Promise.all([
      auth.supabase
        .from("workspace_members")
        .select("workspace_id, user_id, role, profiles(full_name, role_title)")
        .in("workspace_id", workspaceIds)
        .order("joined_at", { ascending: true }),
      auth.supabase
        .from("audit_snapshots")
        .select(
          "id, workspace_id, label, period_start, period_end, total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count, heatmap_matrix, created_at"
        )
        .in("workspace_id", workspaceIds)
        .order("period_end", { ascending: false })
        .order("created_at", { ascending: false }),
      auth.supabase
        .from("team_charters")
        .select("id, workspace_id, version")
        .in("workspace_id", workspaceIds)
        .eq("is_active", true),
      auth.supabase
        .from("charter_acknowledgements")
        .select("charter_id, workspace_id, user_id")
        .in("workspace_id", workspaceIds),
      auth.supabase
        .from("digest_cards")
        .select("workspace_id, emergency_review_status")
        .in("workspace_id", workspaceIds)
        .eq("triage_type", "EMERGENCY_OPS")
        .neq("status", "ARCHIVED"),
      ...workspaceIds.map((wsId) =>
        auth.supabase
          .rpc("get_workspace_wellbeing_summary", { p_workspace_id: wsId })
          .then((res) => ({
            workspace_id: wsId,
            rows: ((res.data ?? []) as RawWellbeingSummaryRpcRow[]),
          }))
      ),
    ]);

    if (memErr || snapErr) {
      return apiError(
        "INTERNAL_ERROR",
        "Gagal memuat metrik divisi organisasi.",
        500
      );
    }

    divisionMembers = ((memberRows ?? []) as RawMemberWithProfile[]).map(
      (row) => {
        const profile = Array.isArray(row.profiles)
          ? row.profiles[0]
          : row.profiles;
        return {
          workspace_id: row.workspace_id,
          user_id: row.user_id,
          role: row.role,
          full_name: profile?.full_name ?? "Anggota Tim",
          role_title: profile?.role_title ?? "Anggota Tim",
        };
      }
    );
    snapshots = snapRows ?? [];
    activeCharters = charterRows ?? [];
    acknowledgements = ackRows ?? [];
    emergencyCards = emergencyRows ?? [];
    wellbeingByWorkspace = wellbeingRpcResults;
  }

  const overview = buildOrganizationOverview({
    organization,
    viewerUserId: auth.user.id,
    orgMembers: orgMembers ?? [],
    workspaces: workspaces ?? [],
    divisionMembers,
    snapshots,
    activeCharters,
    acknowledgements,
    emergencyCards,
    wellbeingByWorkspace,
  });

  return apiSuccess(overview);
}
