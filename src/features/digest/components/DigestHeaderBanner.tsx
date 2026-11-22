"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { WorkspaceListItem } from "@/features/workspace/types";
import { getWorkHoursStatus } from "@/lib/constants/work-hours";
import type { RealtimeStatus } from "../types";

interface DigestHeaderBannerProps {
  workspace: WorkspaceListItem | null;
  realtimeStatus: RealtimeStatus;
  onOpenCreate: () => void;
}

export function DigestHeaderBanner({
  workspace,
  realtimeStatus,
  onOpenCreate,
}: DigestHeaderBannerProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const workStatus = workspace
    ? getWorkHoursStatus(
        {
          work_start_time: workspace.work_start_time,
          work_end_time: workspace.work_end_time,
          digest_dispatch_time: workspace.digest_dispatch_time,
          timezone: workspace.timezone,
          work_days: workspace.work_days,
        },
        now
      )
    : null;

  const statusTone =
    realtimeStatus === "CONNECTED"
      ? {
          wrap: "bg-safe-soft text-safe",
          dot: "bg-safe",
          label: "Realtime Aktif",
        }
      : realtimeStatus === "CONNECTING"
        ? {
            wrap: "bg-warn-soft text-warn",
            dot: "bg-warn",
            label: "Menghubungkan...",
          }
        : {
            wrap: "bg-danger-soft text-danger",
            dot: "bg-danger",
            label: "Koneksi Terputus",
          };

  return (
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-[28px]">
          Async Morning Digest Board
        </h1>
        <p className="text-sm leading-relaxed text-ink-secondary">
          {workStatus
            ? `Tampung instruksi non-darurat di luar jam kerja untuk dikirim pukul ${workStatus.digestTimeLabel} ${workStatus.timezoneLabel} (${workStatus.nextDigestLabel}).`
            : "Tampung instruksi non-darurat malam hari agar dirangkum rapi pada awal jam kerja."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <span
          role="status"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${statusTone.wrap}`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${statusTone.dot}`}
            aria-hidden="true"
          />
          <span>{statusTone.label}</span>
        </span>

        <button
          type="button"
          disabled={!workspace}
          onClick={onOpenCreate}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span>Tambah Instruksi</span>
        </button>
      </div>
    </header>
  );
}
