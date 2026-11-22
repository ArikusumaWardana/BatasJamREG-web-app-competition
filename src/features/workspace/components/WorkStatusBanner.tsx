"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { getWorkHoursStatus } from "@/lib/constants/work-hours";
import type { WorkspaceDetail } from "../types";

interface WorkStatusBannerProps {
  workspace: WorkspaceDetail;
}

export function WorkStatusBanner({ workspace }: WorkStatusBannerProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const status = getWorkHoursStatus(
    {
      work_start_time: workspace.work_start_time,
      work_end_time: workspace.work_end_time,
      digest_dispatch_time: workspace.digest_dispatch_time,
      timezone: workspace.timezone,
      work_days: workspace.work_days,
    },
    now
  );

  return (
    <section
      aria-label="Status Jam Kerja Saat Ini"
      className={`flex flex-col justify-between gap-4 rounded-lg border border-border-hairline border-l-4 bg-surface p-5 md:flex-row md:items-center ${
        status.isRegularHours ? "border-l-safe" : "border-l-warn"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
            status.isRegularHours
              ? "bg-safe-soft text-safe"
              : "bg-warn-soft text-warn"
          }`}
        >
          {status.isRegularHours ? (
            <Sun className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold text-ink-primary">
              {status.isRegularHours
                ? `Status Saat Ini: Sedang Jam Reguler (${status.timezoneLabel})`
                : `Status Saat Ini: Di Luar Jam Reguler (${status.timezoneLabel})`}
            </h1>
            <span className="rounded bg-surface-muted px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-ink-primary">
              {status.dayLabel}, {status.currentTimeLabel} {status.timezoneLabel}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Jam reguler tim aktif {status.workWindowLabel}{" "}
            {status.timezoneLabel}. Morning Digest dijadwalkan{" "}
            <span className="font-mono font-medium tabular-nums text-ink-primary">
              {status.nextDigestLabel}
            </span>{" "}
            ({status.nextDigestCountdown}).
          </p>
        </div>
      </div>

      <Link
        href="/workspace/digest"
        className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
      >
        <span>Buka Morning Digest</span>
        <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </section>
  );
}
