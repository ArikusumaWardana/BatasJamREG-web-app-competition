"use client";

import { Menu } from "lucide-react";
import { AppUserMenu } from "./AppUserMenu";
import { BrandLogo } from "./BrandLogo";
import type {
  AppShellOrganization,
  AppShellUser,
  AppShellWorkspace,
} from "./shell-types";
import { WorkHoursPopoverButton } from "./WorkHoursPopoverButton";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface AppTopbarProps {
  mode: "authenticated" | "guest" | "loading";
  user?: AppShellUser | null;
  organization?: AppShellOrganization | null;
  workspaces?: AppShellWorkspace[];
  activeWorkspace?: AppShellWorkspace | null;
  mobileOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onOpenMobile: () => void;
  onStartNavigation: (href: string) => void;
  onRequestLogout: () => void;
}

export function AppTopbar({
  mode,
  user,
  organization,
  workspaces = [],
  activeWorkspace,
  mobileOpen,
  triggerRef,
  onOpenMobile,
  onStartNavigation,
  onRequestLogout,
}: AppTopbarProps) {
  return (
    <header className="sticky top-3 z-30 w-full">
      <div className="flex items-center justify-between gap-2 rounded-full border border-stone-200/80 bg-surface px-2.5 py-2 shadow-[0_2px_12px_rgba(28,25,23,0.04)] sm:px-4">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <button
            ref={triggerRef}
            type="button"
            onClick={onOpenMobile}
            aria-label="Buka menu navigasi"
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar-drawer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200/80 text-ink-primary transition-colors hover:bg-surface-muted sm:h-10 sm:w-10 lg:hidden"
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>

          <BrandLogo href="/" size="sm" />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {mode === "authenticated" ? (
            <div className="hidden sm:block">
              <WorkspaceSwitcher
                variant="pill"
                organization={organization}
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
                onStartNavigation={onStartNavigation}
              />
            </div>
          ) : mode === "guest" ? (
            <span className="hidden items-center rounded-full border border-safe/25 bg-safe-soft px-3 py-1 font-mono text-[11px] font-medium text-safe sm:inline-flex">
              LOKAL 100%
            </span>
          ) : (
            <div
              aria-hidden="true"
              className="hidden h-10 w-36 animate-pulse rounded-full bg-stone-100 sm:block"
            />
          )}

          <div className={mode === "guest" ? "hidden sm:block" : undefined}>
            <WorkHoursPopoverButton
              mode={mode}
              activeWorkspace={activeWorkspace}
              onStartNavigation={onStartNavigation}
            />
          </div>

          <AppUserMenu
            mode={mode}
            user={user}
            organization={organization}
            onRequestLogout={onRequestLogout}
            onStartNavigation={onStartNavigation}
          />
        </div>
      </div>
    </header>
  );
}
