import Link from "next/link";
import {
  formatTimeHHMM,
  getTimezoneShortLabel,
} from "@/lib/constants/work-hours";
import type { WorkspaceDetail } from "../types";

interface WorkspaceSummaryCardsProps {
  workspace: WorkspaceDetail;
}

function formatDecimalId(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function WorkspaceSummaryCards({
  workspace,
}: WorkspaceSummaryCardsProps) {
  const tzLabel = getTimezoneShortLabel(workspace.timezone);
  const digestTime = formatTimeHHMM(workspace.digest_dispatch_time);

  const snapshots = workspace.recent_snapshots;
  const latestSnapshot = snapshots[0] ?? null;
  const previousSnapshot = snapshots[1] ?? null;

  let deltaPct: number | null = null;
  if (
    latestSnapshot &&
    previousSnapshot &&
    previousSnapshot.shadow_overtime_hours > 0
  ) {
    deltaPct = Math.round(
      ((latestSnapshot.shadow_overtime_hours -
        previousSnapshot.shadow_overtime_hours) /
        previousSnapshot.shadow_overtime_hours) *
        100
    );
  }

  return (
    <section
      aria-label="Ringkasan Workspace"
      className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3"
    >
      <article className="flex h-full flex-col justify-between gap-2 rounded-lg border border-border-hairline bg-surface p-5">
        <span className="text-xs font-medium text-ink-secondary">
          Antrean Pagi Aktif
        </span>
        <p className="font-mono text-[28px] font-semibold leading-tight tabular-nums text-ink-primary">
          {workspace.queued_morning_count} Kartu
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-ink-secondary">
            Siap dirangkum pukul {digestTime} {tzLabel}
          </span>
          <Link
            href="/workspace/digest"
            className="shrink-0 text-xs font-medium text-brand hover:underline"
          >
            Kelola
          </Link>
        </div>
      </article>

      <article className="flex h-full flex-col justify-between gap-2 rounded-lg border border-border-hairline bg-surface p-5">
        <span className="text-xs font-medium text-ink-secondary">
          Lembur Bayangan Terakhir
        </span>
        <p className="font-mono text-[28px] font-semibold leading-tight tabular-nums text-ink-primary">
          {latestSnapshot
            ? `${formatDecimalId(Number(latestSnapshot.shadow_overtime_hours))} Jam`
            : "Belum Ada"}
        </p>
        <div className="flex items-center justify-between gap-2">
          {deltaPct !== null ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${
                deltaPct <= 0
                  ? "bg-safe-soft text-safe"
                  : "bg-warn-soft text-warn"
              }`}
            >
              {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`} dari periode
              sebelumnya
            </span>
          ) : (
            <span className="text-sm text-ink-secondary">
              {latestSnapshot
                ? latestSnapshot.label
                : "Mulai audit file chat lokal"}
            </span>
          )}
          <Link
            href="/audit"
            className="shrink-0 text-xs font-medium text-brand hover:underline"
          >
            Audit Baru
          </Link>
        </div>
      </article>

      <article className="flex h-full flex-col justify-between gap-2 rounded-lg border border-border-hairline bg-surface p-5">
        <span className="text-xs font-medium text-ink-secondary">
          Piagam Jam Digital
        </span>
        <p className="font-mono text-[28px] font-semibold leading-tight text-ink-primary">
          {workspace.active_charter
            ? `Versi ${workspace.active_charter.version} Aktif`
            : "Belum Disusun"}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-ink-secondary">
            {workspace.active_charter
              ? `Jam Tenang ${formatTimeHHMM(
                  workspace.active_charter.quiet_hours_start
                )}-${formatTimeHHMM(workspace.active_charter.quiet_hours_end)} ${tzLabel}`
              : "Tetapkan jam tenang tim"}
          </span>
          <Link
            href="/charter"
            className="shrink-0 text-xs font-medium text-brand hover:underline"
          >
            {workspace.active_charter ? "Lihat Piagam" : "Buat Piagam"}
          </Link>
        </div>
      </article>
    </section>
  );
}
