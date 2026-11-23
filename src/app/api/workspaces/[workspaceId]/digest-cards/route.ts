import type {
  DigestCardStatus,
  DigestCardItem,
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
import {
  createDigestCardSchema,
  digestCardQuerySchema,
} from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
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

export async function GET(request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const queryParsed = digestCardQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    triage_type: url.searchParams.get("triage_type") ?? undefined,
  });

  if (!queryParsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Parameter filter kartu digest tidak valid.",
      400,
      formatZodIssues(queryParsed.error)
    );
  }

  let query = auth.supabase
    .from("digest_cards")
    .select(
      "id, workspace_id, author_id, title, body, recipient_label, triage_type, emergency_reason, emergency_review_status, emergency_reviewed_by, emergency_reviewed_at, status, scheduled_for, dispatched_at, created_at, updated_at, profiles!digest_cards_author_id_fkey(full_name)"
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (queryParsed.data.status) {
    query = query.eq("status", queryParsed.data.status);
  }
  if (queryParsed.data.triage_type) {
    query = query.eq("triage_type", queryParsed.data.triage_type);
  }

  const { data, error } = await query;
  if (error) {
    return apiError("INTERNAL_ERROR", "Gagal memuat kartu Morning Digest.", 500);
  }

  const cards = (data as RawDigestRow[] | null)?.map(mapDigestRow) ?? [];
  return apiSuccess(cards);
}

export async function POST(request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = createDigestCardSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Data kartu digest tidak memenuhi aturan triage.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const emergencyReason =
    parsed.data.triage_type === "EMERGENCY_OPS"
      ? (parsed.data.emergency_reason?.trim() ?? null)
      : null;

  const { data, error } = await auth.supabase
    .from("digest_cards")
    .insert({
      workspace_id: workspaceId,
      author_id: auth.user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      recipient_label: parsed.data.recipient_label,
      triage_type: parsed.data.triage_type,
      emergency_reason: emergencyReason,
      scheduled_for: parsed.data.scheduled_for,
    })
    .select(
      "id, workspace_id, author_id, title, body, recipient_label, triage_type, emergency_reason, emergency_review_status, emergency_reviewed_by, emergency_reviewed_at, status, scheduled_for, dispatched_at, created_at, updated_at, profiles!digest_cards_author_id_fkey(full_name)"
    )
    .single();

  if (error || !data) {
    return apiError("INTERNAL_ERROR", "Gagal menyimpan kartu digest baru.", 500);
  }

  return apiSuccess(mapDigestRow(data as RawDigestRow), 201);
}
