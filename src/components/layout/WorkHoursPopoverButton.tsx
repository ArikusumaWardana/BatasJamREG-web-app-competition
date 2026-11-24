"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, Moon, Sun } from "lucide-react";
import { getWorkHoursStatus } from "@/lib/constants/work-hours";
import type { AppShellWorkspace } from "./shell-types";

interface WorkHoursPopoverButtonProps {
  mode: "authenticated" | "guest" | "loading";
  activeWorkspace?: AppShellWorkspace | null;
  onStartNavigation?: (href: string) => void;
}

export function WorkHoursPopoverButton({
  mode,
  activeWorkspace,
  onStartNavigation,
}: WorkHoursPopoverButtonProps) {
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

  const status =
    mode === "authenticated" &&
    activeWorkspace?.workStartTime &&
    activeWorkspace?.workEndTime &&
    activeWorkspace?.digestDispatchTime
      ? getWorkHoursStatus({
          work_start_time: activeWorkspace.workStartTime,
          work_end_time: activeWorkspace.workEndTime,
          digest_dispatch_time: activeWorkspace.digestDispatchTime,
          timezone: activeWorkspace.timezone ?? "Asia/Jakarta",
          work_days: activeWorkspace.workDays ?? [1, 2, 3, 4, 5],
        })
      : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Status jam kerja dan jadwal Morning Digest"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-surface text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink-primary sm:h-10 sm:w-10"
      >
        {status ? (
          status.isRegularHours ? (
            <Sun className="h-4 w-4 text-safe" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 text-warn" strokeWidth={1.5} aria-hidden="true" />
          )
        ) : (
          <Bell className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        )}
        {status ? (
          <span
            className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-surface sm:top-2 sm:right-2 ${
              status.isRegularHours ? "bg-safe" : "bg-warn"
            }`}
            aria-hidden="true"
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Status jam kerja divisi"
          className="fixed inset-x-3 top-[4.75rem] z-40 mt-0 rounded-[20px] border border-stone-200/80 bg-surface p-4 shadow-[0_8px_24px_rgba(28,25,23,0.08)] sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-72"
        >
          {status && activeWorkspace ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-ink-primary">
                  {activeWorkspace.name}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    status.isRegularHours
                      ? "bg-safe-soft text-safe"
                      : "bg-warn-soft text-warn"
                  }`}
                >
                  {status.isRegularHours ? "Jam Reguler" : "Jam Tenang"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Jam aktif:{" "}
                <span className="font-mono font-medium text-ink-primary">
                  {status.workWindowLabel} {status.timezoneLabel}
                </span>
                . Morning Digest berikutnya:{" "}
                <span className="font-mono font-medium text-ink-primary">
                  {status.nextDigestLabel}
                </span>{" "}
                ({status.nextDigestCountdown}).
              </p>
              <Link
                href="/workspace/digest"
                onClick={() => {
                  setOpen(false);
                  onStartNavigation?.("/workspace/digest");
                }}
                className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover"
              >
                <span>Buka Morning Digest</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-ink-primary">
                Mode Tamu (Audit Lokal)
              </span>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Semua analisis file WhatsApp diproses 100% lokal di perangkat
                Anda tanpa unggah ke server.
              </p>
              <Link
                href="/auth/login"
                onClick={() => {
                  setOpen(false);
                  onStartNavigation?.("/auth/login");
                }}
                className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-stone-200 bg-canvas px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-muted"
              >
                Masuk untuk Kelola Tim
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
