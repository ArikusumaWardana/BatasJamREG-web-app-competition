import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import type {
  AppShellUser,
  AppShellWorkspace,
} from "@/components/layout/SidebarNav";
import { createClient } from "@/lib/supabase/server";

interface ShellContext {
  mode: "authenticated" | "guest";
  user: AppShellUser | null;
  activeWorkspace: AppShellWorkspace | null;
  queuedDigestCount: number;
}

function PublicShellFallback() {
  return (
    <AppShell mode="loading">
      <PageLoadingOverlay variant="panel" />
    </AppShell>
  );
}

async function resolveShellContext(): Promise<ShellContext> {
  await connection();
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        mode: "guest",
        user: null,
        activeWorkspace: null,
        queuedDigestCount: 0,
      };
    }

    const [{ data: profile }, { data: memberships }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, role_title")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("workspace_members")
        .select("role, joined_at, workspaces(id, name, invite_code)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: true }),
    ]);

    const parsedMemberships = (memberships ?? []).flatMap((item) => {
      const ws = Array.isArray(item.workspaces)
        ? item.workspaces[0]
        : item.workspaces;
      if (!ws) return [];
      return [
        { id: ws.id, name: ws.name, inviteCode: ws.invite_code, role: item.role },
      ];
    });

    const preferred =
      parsedMemberships.find((item) => item.inviteCode === "REG-8492") ??
      parsedMemberships[0] ??
      null;

    let queuedDigestCount = 0;
    if (preferred) {
      const { count } = await supabase
        .from("digest_cards")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", preferred.id)
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
      activeWorkspace: preferred
        ? { id: preferred.id, name: preferred.name, role: preferred.role }
        : null,
      queuedDigestCount,
    };
  } catch {
    return {
      mode: "guest",
      user: null,
      activeWorkspace: null,
      queuedDigestCount: 0,
    };
  }
}

async function ResolvedAppShell({ children }: { children: React.ReactNode }) {
  const ctx = await resolveShellContext();

  return (
    <AppShell
      mode={ctx.mode}
      user={ctx.user}
      activeWorkspace={ctx.activeWorkspace}
      queuedDigestCount={ctx.queuedDigestCount}
    >
      {children}
    </AppShell>
  );
}

export function PublicAppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PublicShellFallback />}>
      <ResolvedAppShell>{children}</ResolvedAppShell>
    </Suspense>
  );
}
