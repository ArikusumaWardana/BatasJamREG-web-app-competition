import {
  normalizeEmergencyCriteria,
  type TeamCharterRecord,
} from "@/features/charter/types";
import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { requireWorkspaceMember } from "@/lib/api/workspace-auth";
import type { Json } from "@/types/database.types";
import { createCharterSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

interface RawCharterRow {
  id: string;
  workspace_id: string;
  created_by: string;
  title: string;
  company_or_team_name: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  non_urgent_sla_hours: number;
  emergency_criteria: Json;
  baseline_shadow_hours: number | null;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapCharterRow(row: RawCharterRow): TeamCharterRecord {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    created_by: row.created_by,
    title: row.title,
    company_or_team_name: row.company_or_team_name,
    quiet_hours_start: row.quiet_hours_start,
    quiet_hours_end: row.quiet_hours_end,
    non_urgent_sla_hours: row.non_urgent_sla_hours,
    emergency_criteria: normalizeEmergencyCriteria(row.emergency_criteria),
    baseline_shadow_hours: row.baseline_shadow_hours,
    version: row.version,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("team_charters")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("version", { ascending: false });

  if (error) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat daftar Piagam Jam Digital Tim.",
      500
    );
  }

  const charters = ((data ?? []) as RawCharterRow[]).map(mapCharterRow);
  return apiSuccess(charters);
}

export async function POST(request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const parsed = createCharterSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Data Piagam Jam Digital belum memenuhi ketentuan validasi.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const payload = parsed.data;
  const { data: inserted, error: insertError } = await auth.supabase
    .from("team_charters")
    .insert({
      workspace_id: workspaceId,
      created_by: auth.user.id,
      title: payload.title,
      company_or_team_name: payload.company_or_team_name,
      quiet_hours_start: payload.quiet_hours_start,
      quiet_hours_end: payload.quiet_hours_end,
      non_urgent_sla_hours: payload.non_urgent_sla_hours,
      emergency_criteria: payload.emergency_criteria,
      baseline_shadow_hours: payload.baseline_shadow_hours ?? null,
      is_active: true,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal menyimpan versi baru Piagam Jam Digital Tim.",
      500
    );
  }

  return apiSuccess(mapCharterRow(inserted as RawCharterRow), 201);
}
