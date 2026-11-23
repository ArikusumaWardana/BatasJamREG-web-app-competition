import type {
  DigestCardItem,
  DigestCardStatus,
  DigestTriageType,
  EmergencyReviewStatus,
} from "@/features/digest/types";
import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { requireWorkspaceMember } from "@/lib/api/workspace-auth";
import { emergencyReviewSchema, uuidSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string; cardId: string }>;
}

interface RawDigestRow {
  id: string;
  workspace_id: string;
  author_id: string;
  title: string;
  body: string;
  recipient_label: string;
  triage_type: string;
  emergency_reason: string | null;
  emergency_review_status: string;
  emergency_reviewed_by: string | null;
  emergency_reviewed_at: string | null;
  status: string;
  scheduled_for: string;
  dispatched_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { workspaceId, cardId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const isLeadOrOwner =
    auth.role === "LEAD" || auth.role === "OWNER" || auth.isOrgOwner;
  if (!isLeadOrOwner) {
    return apiError(
      "FORBIDDEN",
      "Hanya Team Lead atau Owner yang dapat menilai status darurat operasional.",
      403
    );
  }

  const cardIdParsed = uuidSchema.safeParse(cardId);
  if (!cardIdParsed.success) {
    return apiError("VALIDATION_ERROR", "ID kartu tidak valid.", 400);
  }

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = emergencyReviewSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Status review darurat tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const { data: existing } = await auth.supabase
    .from("digest_cards")
    .select("id, triage_type")
    .eq("id", cardId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!existing) {
    return apiError("NOT_FOUND", "Kartu digest tidak ditemukan.", 404);
  }

  if (existing.triage_type !== "EMERGENCY_OPS") {
    return apiError(
      "VALIDATION_ERROR",
      "Audit status darurat hanya berlaku untuk kartu Darurat Operasional.",
      400
    );
  }

  const { data: updated, error: updateErr } = await auth.supabase
    .from("digest_cards")
    .update({
      emergency_review_status: parsed.data.emergency_review_status,
      emergency_reviewed_by: auth.user.id,
      emergency_reviewed_at: new Date().toISOString(),
    })
    .eq("id", cardId)
    .eq("workspace_id", workspaceId)
    .select(
      "id, workspace_id, author_id, title, body, recipient_label, triage_type, emergency_reason, emergency_review_status, emergency_reviewed_by, emergency_reviewed_at, status, scheduled_for, dispatched_at, created_at, updated_at, profiles!digest_cards_author_id_fkey(full_name)"
    )
    .single();

  if (updateErr || !updated) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal menyimpan hasil evaluasi kartu darurat.",
      500
    );
  }

  const row = updated as RawDigestRow;
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const mapped: DigestCardItem = {
    id: row.id,
    workspace_id: row.workspace_id,
    author_id: row.author_id,
    author_name: profile?.full_name ?? "Anggota Tim",
    title: row.title,
    body: row.body,
    recipient_label: row.recipient_label,
    triage_type: row.triage_type as DigestTriageType,
    emergency_reason: row.emergency_reason,
    emergency_review_status:
      row.emergency_review_status as EmergencyReviewStatus,
    emergency_reviewed_by: row.emergency_reviewed_by,
    emergency_reviewed_at: row.emergency_reviewed_at,
    status: row.status as DigestCardStatus,
    scheduled_for: row.scheduled_for,
    dispatched_at: row.dispatched_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  return apiSuccess(mapped);
}
