"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  getServerShellContextSnapshot,
  getShellContextSnapshot,
  saveShellContextCache,
  subscribeShellContextCache,
} from "@/lib/storage/shell-context-cache";
import { AppTopbar } from "./AppTopbar";
import { LeftIconRail } from "./LeftIconRail";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";
import { PageLoadingOverlay } from "./PageLoadingOverlay";
import type {
  AppShellOrganization,
  AppShellUser,
  AppShellWorkspace,
} from "./shell-types";
import { SidebarNav } from "./SidebarNav";

interface AppShellProps {
  children: React.ReactNode;
  mode: "authenticated" | "guest" | "loading";
  user?: AppShellUser | null;
  organization?: AppShellOrganization | null;
  workspaces?: AppShellWorkspace[];
  activeWorkspace?: AppShellWorkspace | null;
  queuedDigestCount?: number;
}

export function AppShell({
  children,
  mode,
  user,
  organization,
  workspaces = [],
  activeWorkspace,
  queuedDigestCount = 0,
}: AppShellProps) {
  const pathname = usePathname();
  const [drawerOpenedAtPath, setDrawerOpenedAtPath] = useState<string | null>(
    null
  );
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const cachedShell = useSyncExternalStore(
    subscribeShellContextCache,
    getShellContextSnapshot,
    getServerShellContextSnapshot
  );

  const mobileOpen = drawerOpenedAtPath === pathname;
  const useCache = mode === "loading" && cachedShell !== null;
  const effectiveMode = useCache ? cachedShell.mode : mode;
  const effectiveUser = useCache ? cachedShell.user : user;
  const effectiveOrg = useCache ? cachedShell.organization : organization;
  const effectiveWorkspaces = useCache ? cachedShell.workspaces : workspaces;
  const effectiveWorkspace = useCache
    ? cachedShell.activeWorkspace
    : activeWorkspace;
  const effectiveQueuedCount = useCache
    ? cachedShell.queuedDigestCount
    : queuedDigestCount;

  useEffect(() => {
    if (mode === "loading") return;
    saveShellContextCache({
      mode,
      user: user ?? null,
      organization: organization ?? null,
      workspaces,
      activeWorkspace: activeWorkspace ?? null,
      queuedDigestCount,
    });
  }, [
    mode,
    user,
    organization,
    workspaces,
    activeWorkspace,
    queuedDigestCount,
  ]);

  const isNavigating =
    pendingNav !== null &&
    pendingNav.from === pathname &&
    pendingNav.to !== pathname;

  useEffect(() => {
    const clearTimer = window.setTimeout(() => setPendingNav(null), 0);
    return () => {
      window.clearTimeout(clearTimer);
      window.setTimeout(() => setPendingNav(null), 0);
    };
  }, [pathname]);

  useEffect(() => {
    if (!pendingNav) return;
    const safetyTimer = window.setTimeout(() => setPendingNav(null), 8000);
    return () => window.clearTimeout(safetyTimer);
  }, [pendingNav]);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpenedAtPath(null);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  function closeDrawer() {
    setDrawerOpenedAtPath(null);
    triggerRef.current?.focus();
  }

  function handleStartNavigation(rawHref: string) {
    const targetPath = rawHref.split("?")[0]?.split("#")[0] ?? rawHref;
    if (!targetPath.startsWith("/") || targetPath === pathname) {
      return;
    }
    setPendingNav({ from: pathname, to: targetPath });
  }

  function handleMainClickCapture(event: React.MouseEvent<HTMLElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest("a[href]");
    if (!anchor) return;
    if (
      anchor.hasAttribute("download") ||
      anchor.getAttribute("target") === "_blank"
    ) {
      return;
    }
    const href = anchor.getAttribute("href");
    if (href) handleStartNavigation(href);
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-bento-canvas text-ink-primary">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-3 sm:gap-5 sm:p-5 lg:gap-6 lg:p-6">
        <AppTopbar
          mode={effectiveMode}
          user={effectiveUser}
          organization={effectiveOrg}
          workspaces={effectiveWorkspaces}
          activeWorkspace={effectiveWorkspace}
          mobileOpen={mobileOpen}
          triggerRef={triggerRef}
          onOpenMobile={() => setDrawerOpenedAtPath(pathname)}
          onStartNavigation={handleStartNavigation}
          onRequestLogout={() => setLogoutDialogOpen(true)}
        />

        <div className="flex items-start gap-5 lg:gap-6">
          <LeftIconRail
            mode={effectiveMode}
            organization={effectiveOrg}
            queuedDigestCount={effectiveQueuedCount}
            onStartNavigation={handleStartNavigation}
            onRequestLogout={() => setLogoutDialogOpen(true)}
          />

          <main
            onClickCapture={handleMainClickCapture}
            className="relative z-0 min-w-0 flex-1"
          >
            {children}
            {isNavigating ? <PageLoadingOverlay variant="overlay" /> : null}
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={closeDrawer}
            className="fixed inset-0 bg-ink-primary/30 backdrop-blur-[1px]"
            aria-hidden="true"
          />
          <div
            id="mobile-sidebar-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi BatasJamREG"
            className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col rounded-r-[24px] border-r border-stone-200 bg-surface shadow-lg"
          >
            <div className="flex h-14 items-center justify-end border-b border-stone-200/70 px-3">
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Tutup menu navigasi"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-muted hover:text-ink-primary"
              >
                <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav
                mode={effectiveMode}
                user={effectiveUser}
                organization={effectiveOrg}
                workspaces={effectiveWorkspaces}
                activeWorkspace={effectiveWorkspace}
                queuedDigestCount={effectiveQueuedCount}
                onStartNavigation={handleStartNavigation}
                onNavigate={() => setDrawerOpenedAtPath(null)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        userName={effectiveUser?.fullName}
      />
    </div>
  );
}
