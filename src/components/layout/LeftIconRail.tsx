"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavIcon } from "./AppNavIcon";
import { getAppNavItems } from "./nav-items";
import type { AppShellOrganization } from "./shell-types";

interface LeftIconRailProps {
  mode: "authenticated" | "guest" | "loading";
  organization?: AppShellOrganization | null;
  queuedDigestCount?: number;
  onStartNavigation: (href: string) => void;
  onRequestLogout: () => void;
}

interface RailTooltipProps {
  label: string;
}

function RailTooltip({ label }: RailTooltipProps) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full z-40 ml-3 hidden whitespace-nowrap rounded-full border border-stone-200 bg-ink-primary px-3 py-1 text-[11px] font-medium text-white shadow-md group-hover/rail:inline-flex group-focus-within/rail:inline-flex"
    >
      {label}
    </span>
  );
}

export function LeftIconRail({
  mode,
  organization,
  queuedDigestCount = 0,
  onStartNavigation,
  onRequestLogout,
}: LeftIconRailProps) {
  const pathname = usePathname();
  const isOrgOwner = mode === "authenticated" && organization?.role === "OWNER";
  const navItems = getAppNavItems(isOrgOwner);

  return (
    <aside
      aria-label="Bilah navigasi vertikal"
      className="sticky top-24 z-20 hidden w-[64px] shrink-0 flex-col items-center gap-3.5 self-start lg:flex"
    >
      <div className="flex flex-col items-center gap-2 rounded-full border border-stone-200/80 bg-surface px-2 py-2.5 shadow-[0_2px_12px_rgba(28,25,23,0.04)]">
        {navItems.map((item) => {
          const isLocked = mode === "guest" && Boolean(item.requiresAuth);
          const targetHref = isLocked ? "/auth/login" : item.href;
          const isActive = !isLocked && pathname === item.href;
          const showDigestBadge =
            item.icon === "digest" &&
            mode === "authenticated" &&
            queuedDigestCount > 0;
          const tooltipLabel = showDigestBadge
            ? `${item.label} (${queuedDigestCount})`
            : item.label;

          return (
            <Link
              key={item.href}
              href={targetHref}
              onClick={() => onStartNavigation(targetHref)}
              aria-label={tooltipLabel}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group/rail relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                isActive
                  ? "bg-brand text-white"
                  : "text-ink-secondary hover:bg-stone-100 hover:text-ink-primary"
              )}
            >
              <AppNavIcon kind={item.icon} />
              {showDigestBadge ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] font-semibold tabular-nums",
                    isActive
                      ? "bg-surface text-brand ring-2 ring-brand"
                      : "bg-brand text-white ring-2 ring-surface"
                  )}
                >
                  {queuedDigestCount}
                </span>
              ) : null}
              <RailTooltip label={tooltipLabel} />
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2 rounded-full border border-stone-200/80 bg-surface px-2 py-2.5 shadow-[0_2px_12px_rgba(28,25,23,0.04)]">
        {mode === "authenticated" ? (
          <button
            type="button"
            onClick={onRequestLogout}
            aria-label="Keluar dari akun"
            className="group/rail relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
            <RailTooltip label="Keluar Akun" />
          </button>
        ) : (
          <Link
            href="/auth/login"
            onClick={() => onStartNavigation("/auth/login")}
            aria-label="Masuk ke Akun"
            className="group/rail relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand transition-colors hover:bg-brand-soft"
          >
            <LogIn className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
            <RailTooltip label="Masuk Akun" />
          </Link>
        )}
      </div>
    </aside>
  );
}
