"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { AppNavIcon } from "./AppNavIcon";
import { BrandLogo } from "./BrandLogo";
import { getAppNavItems } from "./nav-items";
import type {
  AppShellOrganization,
  AppShellUser,
  AppShellWorkspace,
} from "./shell-types";
import { SidebarFooter } from "./SidebarFooter";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export type {
  AppShellOrganization,
  AppShellUser,
  AppShellWorkspace,
} from "./shell-types";

export interface SidebarNavProps {
  mode: "authenticated" | "guest" | "loading";
  user?: AppShellUser | null;
  organization?: AppShellOrganization | null;
  workspaces?: AppShellWorkspace[];
  activeWorkspace?: AppShellWorkspace | null;
  queuedDigestCount?: number;
  onNavigate?: () => void;
  onStartNavigation?: (href: string) => void;
}

export function SidebarNav({
  mode,
  user,
  organization,
  workspaces = [],
  activeWorkspace,
  queuedDigestCount = 0,
  onNavigate,
  onStartNavigation,
}: SidebarNavProps) {
  const pathname = usePathname();
  const isOrgOwner = mode === "authenticated" && organization?.role === "OWNER";
  const navItems = getAppNavItems(isOrgOwner);

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex flex-col gap-5">
        <div className="px-2 pt-1">
          <BrandLogo href="/" size="sm" />
        </div>

        {mode === "loading" ? (
          <div className="flex items-center justify-between gap-2 rounded-md border border-border-hairline bg-canvas p-2.5">
            <span className="truncate text-xs font-medium text-ink-secondary">
              Memeriksa sesi...
            </span>
            <span className="inline-flex shrink-0 items-center rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[10px] font-medium text-brand">
              MEMUAT
            </span>
          </div>
        ) : mode === "authenticated" ? (
          <WorkspaceSwitcher
            organization={organization}
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onStartNavigation={onStartNavigation}
            onNavigate={onNavigate}
          />
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-md border border-border-hairline bg-canvas p-2.5">
            <span className="truncate text-xs font-medium text-ink-primary">
              Mode Tamu (Lokal)
            </span>
            <span className="inline-flex shrink-0 items-center rounded-full bg-safe-soft px-2 py-0.5 font-mono text-[11px] font-medium text-safe">
              OFFLINE
            </span>
          </div>
        )}

        <nav aria-label="Navigasi utama aplikasi" className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isLocked = mode === "guest" && Boolean(item.requiresAuth);
            const targetHref = isLocked ? "/auth/login" : item.href;
            const isActive = !isLocked && pathname === item.href;

            return (
              <Link
                key={item.href}
                href={targetHref}
                onClick={() => {
                  onStartNavigation?.(targetHref);
                  onNavigate?.();
                }}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "flex min-h-[40px] items-center justify-between gap-2 rounded-full bg-brand px-3.5 py-2 text-sm font-medium text-white transition-colors"
                    : "flex min-h-[40px] items-center justify-between gap-2 rounded-full px-3.5 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink-primary"
                }
              >
                <span className="flex items-center gap-2.5 truncate">
                  <AppNavIcon kind={item.icon} />
                  <span className="truncate">{item.label}</span>
                </span>

                {item.icon === "digest" && mode === "authenticated" ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-border-hairline bg-surface-muted px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums text-ink-primary">
                    {queuedDigestCount}
                  </span>
                ) : null}

                {isLocked ? (
                  <Lock
                    className="h-3.5 w-3.5 shrink-0 text-ink-muted"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <SidebarFooter mode={mode} user={user} onNavigate={onNavigate} />
    </div>
  );
}
