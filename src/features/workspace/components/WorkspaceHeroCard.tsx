"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Clock,
  FileSignature,
  Inbox,
  Moon,
  Share2,
  Sun,
} from "lucide-react";
import {
  BENTO_CARD_CLS,
  BENTO_INNER_CARD_CLS,
  BentoCardHeader,
} from "@/components/shared/BentoPrimitives";
import { calculateBoundaryScore } from "@/features/audit/lib/boundary-score";
import {
  formatTimeHHMM,
  getTimezoneShortLabel,
  getWorkHoursStatus,
} from "@/lib/constants/work-hours";
import type { WorkspaceDetail } from "../types";

interface WorkspaceHeroCardProps {
  workspace: WorkspaceDetail;
}

function formatDecimalId(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function WorkspaceHeroCard({ workspace }: WorkspaceHeroCardProps) {
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

  const tzLabel = getTimezoneShortLabel(workspace.timezone);
  const digestTime = formatTimeHHMM(workspace.digest_dispatch_time);
  const snapshots = workspace.recent_snapshots;
  const latest = snapshots[0] ?? null;
  const previous = snapshots[1] ?? null;

  const boundaryScore = latest
    ? calculateBoundaryScore({
        total_messages: latest.total_messages,
        after_hours_messages: latest.after_hours_messages,
        false_urgency_count: latest.false_urgency_count,
        heatmap_matrix: latest.heatmap_matrix,
        work_days: workspace.work_days,
      })
    : null;

  let deltaPct: number | null = null;
  if (latest && previous && previous.shadow_overtime_hours > 0) {
    deltaPct = Math.round(
      ((latest.shadow_overtime_hours - previous.shadow_overtime_hours) /
        previous.shadow_overtime_hours) *
        100
    );
  }

  return (
    <article
      aria-label="Ringkasan Divisi"
      className={`flex h-full flex-col justify-between gap-4 ${BENTO_CARD_CLS}`}
    >
      <BentoCardHeader
        icon={<Activity className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        title="Kesehatan Batas Kerja"
        subtitle={`${status.dayLabel}, ${status.currentTimeLabel} ${status.timezoneLabel}`}
        actionHref="/audit"
        actionLabel="Audit WA baru"
      />

      <div className="flex flex-col justify-between gap-4 rounded-[20px] bg-brand p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                status.isRegularHours
                  ? "bg-white/15 text-white"
                  : "bg-amber-400/20 text-amber-100"
              }`}
            >
              {status.isRegularHours ? (
                <Sun className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              )}
              <span>
                {status.isRegularHours
                  ? "Sedang Jam Reguler"
                  : "Di Luar Jam Reguler"}
              </span>
            </span>

            <div className="mt-3 flex items-baseline gap-2">
              <p className="font-mono text-3xl font-bold tracking-tight tabular-nums">
                {boundaryScore ? `${boundaryScore.score}/100` : "--"}
              </p>
              <span className="text-xs font-medium text-white/80">
                {boundaryScore
                  ? `Grade ${boundaryScore.grade} (${boundaryScore.status_label})`
                  : "Belum Ada Audit"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/12 px-3 py-1.5 text-right">
            <p className="text-[10px] font-medium text-white/75 uppercase">
              Digest Berikutnya
            </p>
            <p className="font-mono text-xs font-semibold tabular-nums">
              {status.nextDigestLabel}
            </p>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-white/85">
          <Clock className="h-3.5 w-3.5 shrink-0 text-white/75" strokeWidth={1.5} aria-hidden="true" />
          <span>
            Jam reguler {status.workWindowLabel} {status.timezoneLabel} ({status.nextDigestCountdown})
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/15 pt-3">
          <Link
            href={`/workspace/digest?ws=${workspace.id}`}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand transition-opacity hover:opacity-95"
          >
            <span>Buka Digest</span>
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <a
            href="#status-publik"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>Bagikan Status</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={`/workspace/digest?ws=${workspace.id}`}
          className={`${BENTO_INNER_CARD_CLS} flex flex-col justify-between gap-1.5 transition-colors hover:bg-stone-100/80`}
        >
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-ink-secondary">
            <span>Antrean Pagi</span>
            <Inbox className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <p className="font-mono text-xl font-bold tabular-nums text-ink-primary">
            {workspace.queued_morning_count} Kartu
          </p>
          <span className="text-[11px] text-ink-secondary">
            Rangkuman pukul {digestTime} {tzLabel}
          </span>
        </Link>

        <div className={`${BENTO_INNER_CARD_CLS} flex flex-col justify-between gap-1.5`}>
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-ink-secondary">
            <span>Lembur Terakhir</span>
            <FileSignature className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="font-mono text-xl font-bold tabular-nums text-ink-primary">
              {latest
                ? `${formatDecimalId(Number(latest.shadow_overtime_hours))} Jam`
                : "Belum Ada"}
            </p>
            {deltaPct !== null ? (
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                  deltaPct <= 0
                    ? "bg-safe-soft text-safe"
                    : "bg-warn-soft text-warn"
                }`}
              >
                {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
              </span>
            ) : null}
          </div>
          <span className="truncate text-[11px] text-ink-secondary">
            {workspace.active_charter
              ? `Piagam v${workspace.active_charter.version} (${
                  workspace.charter_adoption?.adoption_percentage ?? 0
                }% setuju)`
              : "Belum ada piagam aktif"}
          </span>
        </div>
      </div>
    </article>
  );
}
