"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  getServerShellContextSnapshot,
  getShellContextSnapshot,
  saveShellContextCache,
  subscribeShellContextCache,
} from "@/lib/storage/shell-context-cache";
import { BrandLogo } from "./BrandLogo";
import { PageLoadingOverlay } from "./PageLoadingOverlay";
import {
  SidebarNav,
  type AppShellUser,
  type AppShellWorkspace,
} from "./SidebarNav";

interface AppShellProps {
  children: React.ReactNode;
  mode: "authenticated" | "guest" | "loading";
  user?: AppShellUser | null;
  activeWorkspace?: AppShellWorkspace | null;
  queuedDigestCount?: number;
}

export function AppShell({
  children,
  mode,
  user,
  activeWorkspace,
  queuedDigestCount = 0,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const effectiveMode =
    mode === "loading" && cachedShell ? cachedShell.mode : mode;
  const effectiveUser =
    mode === "loading" && cachedShell ? cachedShell.user : user;
  const effectiveWorkspace =
    mode === "loading" && cachedShell
      ? cachedShell.activeWorkspace
      : activeWorkspace;
  const effectiveQueuedCount =
    mode === "loading" && cachedShell
      ? cachedShell.queuedDigestCount
      : queuedDigestCount;

  useEffect(() => {
    if (mode === "loading") return;
    saveShellContextCache({
      mode,
      user: user ?? null,
      activeWorkspace: activeWorkspace ?? null,
      queuedDigestCount,
    });
  }, [mode, user, activeWorkspace, queuedDigestCount]);

  const isNavigating =
    pendingNav !== null &&
    pendingNav.from === pathname &&
    pendingNav.to !== pathname;

  useEffect(() => {
    const clearTimer = window.setTimeout(() => {
      setPendingNav(null);
    }, 0);

    return () => {
      window.clearTimeout(clearTimer);
      window.setTimeout(() => {
        setPendingNav(null);
      }, 0);
    };
  }, [pathname]);

  useEffect(() => {
    if (!pendingNav) return;
    const safetyTimer = window.setTimeout(() => {
      setPendingNav(null);
    }, 8000);
    return () => window.clearTimeout(safetyTimer);
  }, [pendingNav]);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  function closeDrawer() {
    setMobileOpen(false);
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
    if (href) {
      handleStartNavigation(href);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink-primary lg:flex">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-border-hairline lg:bg-surface">
        <SidebarNav
          mode={effectiveMode}
          user={effectiveUser}
          activeWorkspace={effectiveWorkspace}
          queuedDigestCount={effectiveQueuedCount}
          onStartNavigation={handleStartNavigation}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-hairline bg-surface px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={mobileOpen}
              aria-controls="mobile-sidebar-drawer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-primary hover:bg-surface-muted"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <BrandLogo href="/" size="sm" />
          </div>

          {effectiveMode === "authenticated" && effectiveWorkspace ? (
            <span className="max-w-[140px] truncate rounded bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
              {effectiveWorkspace.name}
            </span>
          ) : null}
        </header>

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
              className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border-hairline bg-surface shadow-sm"
            >
              <div className="flex h-14 items-center justify-end border-b border-border-hairline px-3">
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Tutup menu navigasi"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-secondary hover:bg-surface-muted hover:text-ink-primary"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav
                  mode={effectiveMode}
                  user={effectiveUser}
                  activeWorkspace={effectiveWorkspace}
                  queuedDigestCount={effectiveQueuedCount}
                  onStartNavigation={handleStartNavigation}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </div>
          </div>
        ) : null}

        <main
          onClickCapture={handleMainClickCapture}
          className="relative flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div className="mx-auto w-full max-w-[1160px]">{children}</div>
          {isNavigating ? <PageLoadingOverlay variant="overlay" /> : null}
        </main>
      </div>
    </div>
  );
}
