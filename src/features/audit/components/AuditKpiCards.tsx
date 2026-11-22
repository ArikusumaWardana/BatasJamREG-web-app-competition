import { Activity, AlertTriangle, Clock, Moon } from "lucide-react";
import {
  getTimezoneShortLabel,
  WEEKDAY_OPTIONS,
} from "@/lib/constants/work-hours";
import type { LocalAuditResult } from "../types";

interface AuditKpiCardsProps {
  result: LocalAuditResult | null;
  timezone: string;
}

function formatDecimalId(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function AuditKpiCards({ result, timezone }: AuditKpiCardsProps) {
  const tzLabel = getTimezoneShortLabel(timezone);
  const peakDayLabel = result
    ? (WEEKDAY_OPTIONS.find((item) => item.isoDay === result.peak_day_of_week)
        ?.label ?? "Selasa")
    : "-";
  const peakHourLabel = result
    ? `${String(result.peak_hour).padStart(2, "0")}:00`
    : "--:--";

  return (
    <section
      aria-label="Ringkasan Metrik Audit"
      className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <article className="flex h-full flex-col justify-between gap-2 rounded-lg border border-border-hairline bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Estimasi Lembur Bayangan
          </span>
          <Clock className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="font-mono text-[28px] font-semibold leading-tight tabular-nums text-ink-primary">
          {result ? `${formatDecimalId(result.shadow_overtime_hours)} Jam` : "-"}
        </p>
        <p className="font-mono text-xs tabular-nums text-ink-secondary">
          {result
            ? `${result.period_start} s.d. ${result.period_end}`
            : "Belum ada file diaudit"}
        </p>
      </article>

      <article className="flex h-full flex-col justify-between gap-2 rounded-lg border border-border-hairline bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Pesan Luar Jam Reguler
          </span>
          <Moon className="h-4 w-4 shrink-0 text-warn" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="font-mono text-[28px] font-semibold leading-tight tabular-nums text-ink-primary">
          {result ? `${formatDecimalId(result.after_hours_percentage)}%` : "-"}
        </p>
        <div>
          {result ? (
            <span className="inline-flex items-center rounded-full bg-warn-soft px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums text-warn">
              {result.after_hours_messages.toLocaleString("id-ID")} dari{" "}
              {result.total_messages.toLocaleString("id-ID")} pesan
            </span>
          ) : (
            <span className="text-xs text-ink-secondary">
              Rasio pesan malam dan akhir pekan
            </span>
          )}
        </div>
      </article>

      <article className="flex h-full flex-col justify-between gap-2 rounded-lg border border-border-hairline bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Pemicu False Urgency
          </span>
          <AlertTriangle className="h-4 w-4 shrink-0 text-warn" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="font-mono text-[28px] font-semibold leading-tight tabular-nums text-ink-primary">
          {result ? `${result.false_urgency_count} Kali` : "-"}
        </p>
        <p className="text-xs text-ink-secondary">
          {result
            ? `${result.false_urgency_breakdown.length} kata kunci terdeteksi`
            : "Menunggu proses file lokal"}
        </p>
      </article>

      <article className="flex h-full flex-col justify-between gap-2 rounded-lg border border-border-hairline bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Hari & Jam Paling Rawan
          </span>
          <Activity className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="font-mono text-[24px] font-semibold leading-tight tabular-nums text-ink-primary">
          {result ? `${peakDayLabel}, ${peakHourLabel}` : "-"}
        </p>
        <p className="text-xs text-ink-secondary">
          {result
            ? `Puncak interupsi (${result.peak_slot_count} pesan, ${tzLabel})`
            : `Zona waktu aktif ${tzLabel}`}
        </p>
      </article>
    </section>
  );
}
