import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { resolveServerShellContext } from "@/lib/workspace/shell-server";

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
  const ctx = await resolveServerShellContext();

  if (ctx.mode !== "authenticated" || !ctx.user) {
    redirect("/auth/login");
  }

  return (
    <AppShell
      mode="authenticated"
      user={ctx.user}
      organization={ctx.organization}
      workspaces={ctx.workspaces}
      activeWorkspace={ctx.activeWorkspace}
      queuedDigestCount={ctx.queuedDigestCount}
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
