import { formatMorningDigestWhatsApp } from "@/features/digest/lib/wa-formatter";
import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { requireWorkspaceMember } from "@/lib/api/workspace-auth";
import { dispatchDigestCardsSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

interface RawDispatchRow {
  id: string;
  title: string;
  body: string;
  recipient_label: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
}

export async function POST(request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = dispatchDigestCardsSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Daftar kartu untuk dikirim tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const [{ data: workspace }, { data: targetCards, error: fetchError }] =
    await Promise.all([
      auth.supabase
        .from("workspaces")
        .select("name, timezone")
        .eq("id", workspaceId)
        .maybeSingle(),
      auth.supabase
        .from("digest_cards")
        .select("id, title, body, recipient_label, profiles(full_name)")
        .eq("workspace_id", workspaceId)
        .eq("triage_type", "MORNING_QUEUE")
        .eq("status", "QUEUED")
        .in("id", parsed.data.card_ids)
        .order("created_at", { ascending: true }),
    ]);

  if (fetchError) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memverifikasi kartu antrean pagi.",
      500
    );
  }

  const cards = (targetCards as RawDispatchRow[] | null) ?? [];
  if (cards.length === 0) {
    return apiError(
      "VALIDATION_ERROR",
      "Tidak ada kartu Antrean Pagi berstatus QUEUED yang cocok untuk dikirim.",
      400
    );
  }

  const matchedIds = cards.map((item) => item.id);
  const nowIso = new Date().toISOString();

  const { error: updateError } = await auth.supabase
    .from("digest_cards")
    .update({
      status: "DISPATCHED",
      dispatched_at: nowIso,
    })
    .eq("workspace_id", workspaceId)
    .in("id", matchedIds);

  if (updateError) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal menandai kartu sebagai terkirim.",
      500
    );
  }

  const formattedText = formatMorningDigestWhatsApp({
    workspaceName: workspace?.name ?? "Workspace Tim",
    timezone: workspace?.timezone ?? "Asia/Jakarta",
    cards: cards.map((card) => {
      const profile = Array.isArray(card.profiles)
        ? card.profiles[0]
        : card.profiles;
      return {
        title: card.title,
        body: card.body,
        recipient_label: card.recipient_label,
        author_name: profile?.full_name ?? "Anggota Tim",
      };
    }),
  });

  return apiSuccess({
    dispatched_count: matchedIds.length,
    whatsapp_formatted_text: formattedText,
  });
}
