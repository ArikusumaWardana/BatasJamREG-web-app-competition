import type {
  AppShellOrganization,
  AppShellUser,
  AppShellWorkspace,
} from "@/components/layout/shell-types";
import { createClient } from "@/lib/supabase/server";
import { fetchAccessibleWorkspaces } from "@/lib/workspace/workspace-list";

export interface ResolvedShellContext {
  mode: "authenticated" | "guest";
  user: AppShellUser | null;
  organization: AppShellOrganization | null;
  workspaces: AppShellWorkspace[];
  activeWorkspace: AppShellWorkspace | null;
  queuedDigestCount: number;
}

export const GUEST_SHELL_CONTEXT: ResolvedShellContext = {
  mode: "guest",
  user: null,
  organization: null,
  workspaces: [],
  activeWorkspace: null,
  queuedDigestCount: 0,
};

export async function resolveServerShellContext(): Promise<ResolvedShellContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return GUEST_SHELL_CONTEXT;
  }

  const [{ data: profile }, accessible] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role_title")
      .eq("id", user.id)
      .maybeSingle(),
    fetchAccessibleWorkspaces(supabase, user.id),
  ]);

  const preferredOrg =
    accessible.organizations.find((item) => item.role === "OWNER") ??
    accessible.organizations[0] ??
    null;

  const shellWorkspaces: AppShellWorkspace[] = accessible.workspaces.map(
    (ws) => ({
      id: ws.id,
      name: ws.name,
      role: ws.role,
      inviteCode: ws.invite_code,
      organizationId: ws.organization_id,
      organizationName: ws.organization_name ?? preferredOrg?.name ?? null,
      orgRole: ws.org_role ?? null,
      isJoined: ws.is_joined,
    })
  );

  const activeWorkspace =
    shellWorkspaces.find((item) => item.inviteCode === "REG-8492") ??
    shellWorkspaces[0] ??
    null;

  let queuedDigestCount = 0;
  if (activeWorkspace) {
    const { count } = await supabase
      .from("digest_cards")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", activeWorkspace.id)
      .eq("status", "QUEUED")
      .eq("triage_type", "MORNING_QUEUE");
    queuedDigestCount = count ?? 0;
  }

  const fallbackName = user.email?.split("@")[0] ?? "Pengguna";

  return {
    mode: "authenticated",
    user: {
      id: user.id,
      fullName: profile?.full_name ?? fallbackName,
      roleTitle: profile?.role_title ?? "Anggota Tim",
    },
    organization: preferredOrg
      ? {
          id: preferredOrg.id,
          name: preferredOrg.name,
          role: preferredOrg.role,
        }
      : null,
    workspaces: shellWorkspaces,
    activeWorkspace,
    queuedDigestCount,
  };
}
