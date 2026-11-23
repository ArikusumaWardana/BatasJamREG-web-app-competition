import type { WorkspaceRole } from "@/features/workspace/types";
import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { requireWorkspaceMember } from "@/lib/api/workspace-auth";
import { updateWorkspaceMemberRoleSchema, uuidSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ workspaceId: string; userId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { workspaceId, userId } = await context.params;
  const userIdParsed = uuidSchema.safeParse(userId);
  if (!userIdParsed.success) {
    return apiError("VALIDATION_ERROR", "ID anggota tidak valid.", 400);
  }

  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  if (!auth.isOrgOwner) {
    return apiError(
      "FORBIDDEN",
      "Hanya Owner organisasi yang dapat mengubah peran anggota divisi.",
      403
    );
  }

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = updateWorkspaceMemberRoleSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Peran anggota baru tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const { data: existingMember } = await auth.supabase
    .from("workspace_members")
    .select("workspace_id, user_id, role, joined_at")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existingMember) {
    return apiError(
      "NOT_FOUND",
      "Anggota tidak ditemukan pada divisi ini.",
      404
    );
  }

  if (existingMember.role === "OWNER") {
    return apiError(
      "FORBIDDEN",
      "Peran Owner organisasi tidak dapat diturunkan melalui pengaturan divisi.",
      403
    );
  }

  const { data: updated, error: updateError } = await auth.supabase
    .from("workspace_members")
    .update({ role: parsed.data.role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .select("workspace_id, user_id, role, joined_at, profiles(full_name, role_title)")
    .single();

  if (updateError || !updated) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memperbarui peran anggota divisi.",
      500
    );
  }

  const profile = Array.isArray(updated.profiles)
    ? updated.profiles[0]
    : updated.profiles;

  return apiSuccess({
    workspace_id: updated.workspace_id,
    user_id: updated.user_id,
    full_name: profile?.full_name ?? "Anggota Tim",
    role_title: profile?.role_title ?? "Anggota Tim",
    role: updated.role as WorkspaceRole,
    joined_at: updated.joined_at,
  });
}
