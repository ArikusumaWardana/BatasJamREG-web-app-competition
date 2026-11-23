import type {
  CharterAcknowledgementItem,
  CharterAdoptionSummary,
} from "@/features/charter/types";
import { computeCharterAdoptionPercentage } from "@/features/wellbeing/lib/wellbeing-metrics";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireWorkspaceMember } from "@/lib/api/workspace-auth";
import { uuidSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string; charterId: string }>;
}

interface RawAckRow {
  id: string;
  user_id: string;
  signed_at: string;
  profiles:
    | { full_name: string; role_title: string }
    | { full_name: string; role_title: string }[]
    | null;
}

async function buildAcknowledgementSummary(
  supabase: Extract<
    Awaited<ReturnType<typeof requireWorkspaceMember>>,
    { ok: true }
  >["supabase"],
  workspaceId: string,
  charterId: string,
  currentUserId: string
): Promise<CharterAdoptionSummary | null> {
  const [{ data: ackRows, error: ackErr }, { count: memberCount, error: memErr }] =
    await Promise.all([
      supabase
        .from("charter_acknowledgements")
        .select("id, user_id, signed_at, profiles(full_name, role_title)")
        .eq("charter_id", charterId)
        .eq("workspace_id", workspaceId)
        .order("signed_at", { ascending: true }),
      supabase
        .from("workspace_members")
        .select("user_id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId),
    ]);

  if (ackErr || memErr) return null;

  const acknowledgements: CharterAcknowledgementItem[] = (
    (ackRows ?? []) as RawAckRow[]
  ).map((row) => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    return {
      id: row.id,
      user_id: row.user_id,
      full_name: profile?.full_name ?? "Anggota Tim",
      role_title: profile?.role_title ?? "Anggota Tim",
      signed_at: row.signed_at,
    };
  });

  const signedCount = acknowledgements.length;
  const totalMembers = Math.max(memberCount ?? 0, signedCount);

  return {
    charter_id: charterId,
    signed_count: signedCount,
    total_members: totalMembers,
    adoption_percentage: computeCharterAdoptionPercentage(
      signedCount,
      totalMembers
    ),
    has_signed: acknowledgements.some(
      (item) => item.user_id === currentUserId
    ),
    acknowledgements,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { workspaceId, charterId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const charterParsed = uuidSchema.safeParse(charterId);
  if (!charterParsed.success) {
    return apiError("VALIDATION_ERROR", "ID piagam tidak valid.", 400);
  }

  const { data: charter } = await auth.supabase
    .from("team_charters")
    .select("id")
    .eq("id", charterId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!charter) {
    return apiError("NOT_FOUND", "Piagam tidak ditemukan di workspace ini.", 404);
  }

  const summary = await buildAcknowledgementSummary(
    auth.supabase,
    workspaceId,
    charterId,
    auth.user.id
  );
  if (!summary) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat daftar persetujuan digital piagam.",
      500
    );
  }

  return apiSuccess(summary);
}

export async function POST(_request: Request, context: RouteContext) {
  const { workspaceId, charterId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const charterParsed = uuidSchema.safeParse(charterId);
  if (!charterParsed.success) {
    return apiError("VALIDATION_ERROR", "ID piagam tidak valid.", 400);
  }

  const [{ data: charter }, { data: existingAck }] = await Promise.all([
    auth.supabase
      .from("team_charters")
      .select("id")
      .eq("id", charterId)
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
    auth.supabase
      .from("charter_acknowledgements")
      .select("id")
      .eq("charter_id", charterId)
      .eq("user_id", auth.user.id)
      .maybeSingle(),
  ]);

  if (!charter) {
    return apiError("NOT_FOUND", "Piagam tidak ditemukan di workspace ini.", 404);
  }

  if (!existingAck) {
    const { error: insertErr } = await auth.supabase
      .from("charter_acknowledgements")
      .upsert(
        {
          charter_id: charterId,
          workspace_id: workspaceId,
          user_id: auth.user.id,
        },
        { onConflict: "charter_id,user_id", ignoreDuplicates: true }
      );

    if (insertErr) {
      return apiError(
        "INTERNAL_ERROR",
        "Gagal menyimpan tanda tangan digital piagam.",
        500
      );
    }
  }

  const summary = await buildAcknowledgementSummary(
    auth.supabase,
    workspaceId,
    charterId,
    auth.user.id
  );
  if (!summary) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memperbarui ringkasan persetujuan piagam.",
      500
    );
  }

  return apiSuccess(summary, existingAck ? 200 : 201);
}
