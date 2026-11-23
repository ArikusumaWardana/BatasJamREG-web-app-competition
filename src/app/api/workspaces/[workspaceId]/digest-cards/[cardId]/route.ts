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
import { updateDigestCardSchema, uuidSchema } from "@/lib/validations";

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

function mapDigestRow(row: RawDigestRow): DigestCardItem {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
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
}

export async function PATCH(request: Request, context: RouteContext) {
  const { workspaceId, cardId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const cardIdParsed = uuidSchema.safeParse(cardId);
  if (!cardIdParsed.success) {
    return apiError("VALIDATION_ERROR", "ID kartu tidak valid.", 400);
  }

  const { data: existing } = await auth.supabase
    .from("digest_cards")
    .select("id, author_id, triage_type, emergency_reason, status")
    .eq("id", cardId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!existing) {
    return apiError("NOT_FOUND", "Kartu digest tidak ditemukan.", 404);
  }

  const isAdmin = auth.role === "OWNER" || auth.role === "LEAD";
  if (existing.author_id !== auth.user.id && !isAdmin) {
    return apiError(
      "FORBIDDEN",
      "Hanya pembuat kartu atau Admin workspace yang dapat mengubah kartu ini.",
      403
    );
  }

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = updateDigestCardSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Data pembaruan kartu tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const nextTriage = parsed.data.triage_type ?? existing.triage_type;
  const nextReason =
    parsed.data.emergency_reason !== undefined
      ? parsed.data.emergency_reason
      : existing.emergency_reason;

  if (
    nextTriage === "EMERGENCY_OPS" &&
    (!nextReason || nextReason.trim().length < 10)
  ) {
    return apiError(
      "VALIDATION_ERROR",
      "Alasan darurat wajib diisi minimal 10 karakter untuk Darurat Operasional.",
      400,
      {
        emergency_reason: [
          "Alasan darurat wajib diisi minimal 10 karakter.",
        ],
      }
    );
  }

  const updatePayload = {
    ...parsed.data,
    emergency_reason:
      nextTriage === "MORNING_QUEUE"
        ? null
        : (nextReason?.trim() ?? null),
    dispatched_at:
      parsed.data.status === "DISPATCHED"
        ? new Date().toISOString()
        : parsed.data.status === "QUEUED"
          ? null
          : undefined,
  };

  const { data: updated, error } = await auth.supabase
    .from("digest_cards")
    .update(updatePayload)
    .eq("id", cardId)
    .eq("workspace_id", workspaceId)
    .select(
      "id, workspace_id, author_id, title, body, recipient_label, triage_type, emergency_reason, emergency_review_status, emergency_reviewed_by, emergency_reviewed_at, status, scheduled_for, dispatched_at, created_at, updated_at, profiles!digest_cards_author_id_fkey(full_name)"
    )
    .single();

  if (error || !updated) {
    return apiError("INTERNAL_ERROR", "Gagal memperbarui kartu digest.", 500);
  }

  return apiSuccess(mapDigestRow(updated as RawDigestRow));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { workspaceId, cardId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const cardIdParsed = uuidSchema.safeParse(cardId);
  if (!cardIdParsed.success) {
    return apiError("VALIDATION_ERROR", "ID kartu tidak valid.", 400);
  }

  const { data: existing } = await auth.supabase
    .from("digest_cards")
    .select("id, author_id")
    .eq("id", cardId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!existing) {
    return apiError("NOT_FOUND", "Kartu digest tidak ditemukan.", 404);
  }

  const isAdmin = auth.role === "OWNER" || auth.role === "LEAD";
  if (existing.author_id !== auth.user.id && !isAdmin) {
    return apiError(
      "FORBIDDEN",
      "Hanya pembuat kartu atau Admin workspace yang dapat menghapus kartu ini.",
      403
    );
  }

  const { error } = await auth.supabase
    .from("digest_cards")
    .delete()
    .eq("id", cardId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return apiError("INTERNAL_ERROR", "Gagal menghapus kartu digest.", 500);
  }

  return apiSuccess({ deleted_id: cardId });
}
