import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { createAuditSnapshotSchema, uuidSchema } from "@/lib/validations";

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

  const { data, error } = await supabase
    .from("audit_snapshots")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat riwayat snapshot audit.",
      500
    );
  }

  return apiSuccess(data ?? []);
}

export async function POST(request: Request, context: RouteContext) {
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

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const parsed = createAuditSnapshotSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Payload snapshot ditolak karena tidak sesuai skema numerik anonim.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("audit_snapshots")
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      label: parsed.data.label,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      total_messages: parsed.data.total_messages,
      after_hours_messages: parsed.data.after_hours_messages,
      shadow_overtime_hours: parsed.data.shadow_overtime_hours,
      false_urgency_count: parsed.data.false_urgency_count,
      peak_day_of_week: parsed.data.peak_day_of_week,
      peak_hour: parsed.data.peak_hour,
      heatmap_matrix: parsed.data.heatmap_matrix,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal menyimpan snapshot audit ke workspace.",
      500
    );
  }

  return apiSuccess(inserted, 201);
}
