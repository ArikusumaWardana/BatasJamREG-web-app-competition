import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { createClient } from "@/lib/supabase/server";

function WorkspaceLayoutSkeleton() {
  return (
    <AppShell mode="loading">
      <PageLoadingOverlay
        variant="panel"
        message="Sedang menyiapkan workspace Anda..."
      />
    </AppShell>
  );
}

async function AuthenticatedWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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
    return [{ id: ws.id, name: ws.name, inviteCode: ws.invite_code, role: item.role }];
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

  return (
    <AppShell
      mode="authenticated"
      user={{
        id: user.id,
        fullName: profile?.full_name ?? fallbackName,
        roleTitle: profile?.role_title ?? "Anggota Tim",
      }}
      activeWorkspace={
        preferred
          ? { id: preferred.id, name: preferred.name, role: preferred.role }
          : null
      }
      queuedDigestCount={queuedDigestCount}
    >
      {children}
    </AppShell>
  );
}

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<WorkspaceLayoutSkeleton />}>
      <AuthenticatedWorkspaceShell>{children}</AuthenticatedWorkspaceShell>
    </Suspense>
  );
}
