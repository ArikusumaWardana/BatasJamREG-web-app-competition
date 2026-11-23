import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { resolveServerShellContext } from "@/lib/workspace/shell-server";

function OrganizationLayoutSkeleton() {
  return (
    <AppShell mode="loading">
      <PageLoadingOverlay
        variant="panel"
        message="Sedang menyiapkan ringkasan perusahaan..."
      />
    </AppShell>
  );
}

async function OwnerOrganizationShell({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const ctx = await resolveServerShellContext();

  if (ctx.mode !== "authenticated" || !ctx.user) {
    redirect("/auth/login?next=/organization");
  }

  if (ctx.organization?.role !== "OWNER") {
    redirect("/workspace");
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

export default function OrganizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<OrganizationLayoutSkeleton />}>
      <OwnerOrganizationShell>{children}</OwnerOrganizationShell>
    </Suspense>
  );
}
