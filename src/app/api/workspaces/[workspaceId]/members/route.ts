import type { WorkspaceMemberItem } from "@/features/organization/types";
import type { WorkspaceRole } from "@/features/workspace/types";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireWorkspaceMember } from "@/lib/api/workspace-auth";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

interface RawWorkspaceMemberRow {
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles:
    | { full_name: string; role_title: string }
    | { full_name: string; role_title: string }[]
    | null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireWorkspaceMember(workspaceId);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("workspace_members")
    .select("workspace_id, user_id, role, joined_at, profiles(full_name, role_title)")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });

  if (error) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat daftar anggota divisi.",
      500
    );
  }

  const members: WorkspaceMemberItem[] = (
    (data ?? []) as RawWorkspaceMemberRow[]
  ).map((row) => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    return {
      workspace_id: row.workspace_id,
      user_id: row.user_id,
      full_name: profile?.full_name ?? "Anggota Tim",
      role_title: profile?.role_title ?? "Anggota Tim",
      role: row.role as WorkspaceRole,
      joined_at: row.joined_at,
    };
  });

  return apiSuccess(members, 200, { can_manage_roles: auth.isOrgOwner });
}
