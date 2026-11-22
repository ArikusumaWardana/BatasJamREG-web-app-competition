"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  FileSearch,
  FileText,
  LayoutDashboard,
  Lock,
  Sunrise,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { SidebarFooter } from "./SidebarFooter";

export interface AppShellUser {
  id: string;
  fullName: string;
  roleTitle: string;
}

export interface AppShellWorkspace {
  id: string;
  name: string;
  role: string;
}

export interface SidebarNavProps {
  mode: "authenticated" | "guest" | "loading";
  user?: AppShellUser | null;
  activeWorkspace?: AppShellWorkspace | null;
  queuedDigestCount?: number;
  onNavigate?: () => void;
  onStartNavigation?: (href: string) => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: "dashboard" | "digest" | "audit" | "charter" | "simulator";
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/workspace",
    label: "Ringkasan Tim",
    icon: "dashboard",
    requiresAuth: true,
  },
  {
    href: "/workspace/digest",
    label: "Morning Digest",
    icon: "digest",
    requiresAuth: true,
  },
  { href: "/audit", label: "Audit WA Lokal", icon: "audit" },
  { href: "/charter", label: "Piagam & Balasan", icon: "charter" },
  { href: "/simulator", label: "Simulator Biaya", icon: "simulator" },
];

function NavIcon({ kind }: { kind: NavItem["icon"] }) {
  const cls = "h-[18px] w-[18px] shrink-0";
  switch (kind) {
    case "dashboard":
      return <LayoutDashboard className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case "digest":
      return <Sunrise className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case "audit":
      return <FileSearch className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case "charter":
      return <FileText className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case "simulator":
      return <Calculator className={cls} strokeWidth={1.5} aria-hidden="true" />;
  }
}

export function SidebarNav({
  mode,
  user,
  activeWorkspace,
  queuedDigestCount = 0,
  onNavigate,
  onStartNavigation,
}: SidebarNavProps) {
  const pathname = usePathname();

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
          <div className="rounded-md border border-border-hairline bg-canvas p-2.5">
            <p className="truncate text-xs font-medium text-ink-primary">
              {activeWorkspace?.name ?? "Belum ada workspace"}
            </p>
            <span className="mt-1 inline-flex items-center rounded bg-brand-soft px-1.5 py-0.5 font-mono text-[11px] font-medium text-brand">
              {activeWorkspace?.role ?? "TANPA TIM"}
            </span>
          </div>
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
          {NAV_ITEMS.map((item) => {
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
                    ? "flex min-h-[40px] items-center justify-between gap-2 rounded-md bg-brand-soft px-2.5 py-2 text-sm font-medium text-brand transition-colors"
                    : "flex min-h-[40px] items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink-primary"
                }
              >
                <span className="flex items-center gap-2.5 truncate">
                  <NavIcon kind={item.icon} />
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
