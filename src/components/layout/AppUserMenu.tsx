"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, LogIn, LogOut, Settings } from "lucide-react";
import { GuestDemoLoginPopover } from "./GuestDemoLoginPopover";
import type { AppShellOrganization, AppShellUser } from "./shell-types";

interface AppUserMenuProps {
  mode: "authenticated" | "guest" | "loading";
  user?: AppShellUser | null;
  organization?: AppShellOrganization | null;
  onRequestLogout: () => void;
  onStartNavigation?: (href: string) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BJ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AppUserMenu({
  mode,
  user,
  organization,
  onRequestLogout,
  onStartNavigation,
}: AppUserMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (mode === "loading") {
    return (
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-surface-muted">
        <Loader2 className="h-4 w-4 animate-spin text-brand" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }

  if (mode === "authenticated" && user) {
    const settingsHref =
      organization?.role === "OWNER"
        ? "/organization"
        : "/workspace#pengaturan-divisi";

    return (
      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`Menu profil ${user.fullName}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-surface p-0.5 transition-colors hover:bg-surface-muted sm:h-10 sm:w-auto sm:gap-1.5 sm:p-1 sm:pr-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-mono text-xs font-semibold text-white">
            {getInitials(user.fullName)}
          </span>
          <ChevronDown
            className="hidden h-3.5 w-3.5 text-ink-secondary sm:block"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>

        {open ? (
          <div
            role="menu"
            aria-label="Profil pengguna dan akun"
            className="absolute right-0 z-40 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-[20px] border border-stone-200/80 bg-surface p-2 shadow-[0_8px_24px_rgba(28,25,23,0.08)]"
          >
            <div className="border-b border-stone-200/70 px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-ink-primary">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-ink-secondary">
                {user.roleTitle}
                {organization ? ` - ${organization.name}` : ""}
              </p>
            </div>

            <div className="mt-1.5 flex flex-col gap-1">
              <Link
                href={settingsHref}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onStartNavigation?.(settingsHref);
                }}
                className="flex min-h-[38px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted"
              >
                <Settings className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
                <span>Pengaturan &amp; Identitas</span>
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onRequestLogout();
                }}
                className="flex min-h-[38px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Masuk atau coba workspace demo"
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover sm:min-h-[40px] sm:gap-2 sm:px-4 sm:py-2"
      >
        <LogIn className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>Masuk</span>
      </button>

      {open ? (
        <GuestDemoLoginPopover
          onClose={() => setOpen(false)}
          onStartNavigation={onStartNavigation}
        />
      ) : null}
    </div>
  );
}
