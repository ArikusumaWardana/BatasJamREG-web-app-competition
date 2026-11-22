import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import {
  isEndTimeAfterStartTime,
  updateWorkspaceSchema,
  uuidSchema,
} from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const idParsed = uuidSchema.safeParse(workspaceId);
  if (!idParsed.success) {
    return apiError("VALIDATION_ERROR", "ID workspace tidak valid.", 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return apiError(
      "FORBIDDEN",
      "Anda tidak memiliki akses ke workspace ini.",
      403
    );
  }

  const [
    { data: workspace, error: wsError },
    { count: memberCount },
    { count: queuedMorningCount },
    { data: activeCharter },
    { data: recentSnapshots },
  ] = await Promise.all([
    supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .maybeSingle(),
    supabase
      .from("workspace_members")
      .select("user_id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("digest_cards")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "QUEUED")
      .eq("triage_type", "MORNING_QUEUE"),
    supabase
      .from("team_charters")
      .select("id, title, version, quiet_hours_start, quiet_hours_end, updated_at")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("audit_snapshots")
      .select(
        "id, label, period_start, period_end, total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count, peak_day_of_week, peak_hour, created_at"
      )
      .eq("workspace_id", workspaceId)
      .order("period_start", { ascending: false })
      .limit(6),
  ]);

  if (wsError || !workspace) {
    return apiError("NOT_FOUND", "Workspace tidak ditemukan.", 404);
  }

  return apiSuccess({
    ...workspace,
    role: membership.role,
    member_count: memberCount ?? 0,
    queued_morning_count: queuedMorningCount ?? 0,
    active_charter: activeCharter ?? null,
    recent_snapshots: recentSnapshots ?? [],
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const idParsed = uuidSchema.safeParse(workspaceId);
  if (!idParsed.success) {
    return apiError("VALIDATION_ERROR", "ID workspace tidak valid.", 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return apiError(
      "FORBIDDEN",
      "Anda tidak memiliki akses ke workspace ini.",
      403
    );
  }

  if (membership.role !== "OWNER" && membership.role !== "LEAD") {
    return apiError(
      "FORBIDDEN",
      "Hanya Owner atau Lead yang dapat mengubah pengaturan workspace.",
      403
    );
  }

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const parsed = updateWorkspaceSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Data pembaruan workspace tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const { data: existing } = await supabase
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
      { work_end_time: ["Jam selesai kerja harus lebih besar dari jam mulai kerja."] }
    );
  }

  const { data: updated, error: updateError } = await supabase
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

  return apiSuccess({ ...updated, role: membership.role });
}
