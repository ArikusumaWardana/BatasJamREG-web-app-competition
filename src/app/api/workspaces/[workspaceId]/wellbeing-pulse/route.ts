import {
  getCurrentWeekStartDate,
  mapWellbeingSummaryRow,
  type RawWellbeingSummaryRpcRow,
} from "@/features/wellbeing/lib/wellbeing-metrics";
import type { WellbeingPulsePayload } from "@/features/wellbeing/types";
import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { requireWorkspaceMember } from "@/lib/api/workspace-auth";
import { wellbeingPulseSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

async function buildWellbeingPayload(
  supabase: Extract<
    Awaited<ReturnType<typeof requireWorkspaceMember>>,
    { ok: true }
  >["supabase"],
  workspaceId: string,
  userId: string
): Promise<WellbeingPulsePayload | null> {
  const { data: ws } = await supabase
    .from("workspaces")
    .select("timezone")
    .eq("id", workspaceId)
    .maybeSingle();

  const currentWeekStart = getCurrentWeekStartDate(
    ws?.timezone ?? "Asia/Jakarta"
  );

  const [rpcRes, ownRes] = await Promise.all([
    supabase.rpc("get_workspace_wellbeing_summary", {
      p_workspace_id: workspaceId,
    }),
    supabase
      .from("wellbeing_pulses")
      .select("rest_quality, reply_pressure, boundary_clarity, created_at")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .eq("week_start_date", currentWeekStart)
      .maybeSingle(),
  ]);

  if (rpcRes.error || ownRes.error) {
    return null;
  }

  const history = (
    (rpcRes.data ?? []) as RawWellbeingSummaryRpcRow[]
  ).map(mapWellbeingSummaryRow);

  const currentSummary =
    history.find((item) => item.week_start_date === currentWeekStart) ?? {
      week_start_date: currentWeekStart,
      response_count: 0,
      is_threshold_met: false,
      avg_rest_quality: null,
      avg_reply_pressure: null,
      avg_boundary_clarity: null,
      composite_score: null,
    };

  return {
    current_week_start: currentWeekStart,
    has_submitted_this_week: Boolean(ownRes.data),
    own_current_pulse: ownRes.data ?? null,
    current_week_summary: currentSummary,
    history,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const payload = await buildWellbeingPayload(
    auth.supabase,
    workspaceId,
    auth.user.id
  );
  if (!payload) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat ringkasan kesejahteraan tim.",
      500
    );
  }

  return apiSuccess(payload);
}

export async function POST(request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = wellbeingPulseSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Skor check-in kesejahteraan harus bilangan bulat 1 sampai 5.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const { data: ws } = await auth.supabase
    .from("workspaces")
    .select("timezone")
    .eq("id", workspaceId)
    .maybeSingle();

  const currentWeekStart = getCurrentWeekStartDate(
    ws?.timezone ?? "Asia/Jakarta"
  );

  const { error: upsertErr } = await auth.supabase
    .from("wellbeing_pulses")
    .upsert(
      {
        workspace_id: workspaceId,
        user_id: auth.user.id,
        week_start_date: currentWeekStart,
        rest_quality: parsed.data.rest_quality,
        reply_pressure: parsed.data.reply_pressure,
        boundary_clarity: parsed.data.boundary_clarity,
      },
      { onConflict: "workspace_id,user_id,week_start_date" }
    );

  if (upsertErr) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal menyimpan check-in kesejahteraan mingguan.",
      500
    );
  }

  const payload = await buildWellbeingPayload(
    auth.supabase,
    workspaceId,
    auth.user.id
  );
  if (!payload) {
    return apiError(
      "INTERNAL_ERROR",
      "Check-in tersimpan, tetapi gagal memuat ringkasan terbaru.",
      500
    );
  }

  return apiSuccess(payload, 201);
}
