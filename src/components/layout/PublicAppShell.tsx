import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import {
  GUEST_SHELL_CONTEXT,
  resolveServerShellContext,
} from "@/lib/workspace/shell-server";

function PublicShellFallback() {
  return (
    <AppShell mode="loading">
      <PageLoadingOverlay variant="panel" />
    </AppShell>
  );
}

async function resolveSafeContext() {
  await connection();
  try {
    return await resolveServerShellContext();
  } catch {
    return GUEST_SHELL_CONTEXT;
  }
}

async function ResolvedAppShell({ children }: { children: React.ReactNode }) {
  const ctx = await resolveSafeContext();

  return (
    <AppShell
      mode={ctx.mode}
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

export function PublicAppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PublicShellFallback />}>
      <ResolvedAppShell>{children}</ResolvedAppShell>
    </Suspense>
  );
}
