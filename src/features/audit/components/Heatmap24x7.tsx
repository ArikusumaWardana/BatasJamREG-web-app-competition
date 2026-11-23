"use client";

import { useState } from "react";
import {
  formatTimeHHMM,
  getTimezoneShortLabel,
  parseTimeToMinutes,
  WEEKDAY_OPTIONS,
} from "@/lib/constants/work-hours";
import type { AuditConfig } from "../types";

interface Heatmap24x7Props {
  matrix: number[][] | null;
  config: AuditConfig;
  periodStart?: string;
  periodEnd?: string;
}

const SHORT_MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatPeriodDateId(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  const monthIdx = Number(m) - 1;
  const monthLabel = SHORT_MONTHS_ID[monthIdx] ?? m;
  return `${Number(d)} ${monthLabel} ${y}`;
}

const HOURS = Array.from({ length: 24 }, (_, idx) => idx);

function getHeatClass(count: number, maxAfterHours: number, isRegular: boolean): string {
  if (isRegular) {
    return count > 0
      ? "bg-safe-soft border border-dashed border-safe/60 text-safe"
      : "bg-safe-soft/40 border border-dashed border-safe/40 text-ink-muted";
  }

  if (count === 0) {
    return "bg-heat-0 border border-border-hairline/70 text-ink-muted";
  }

  const ratio = maxAfterHours > 0 ? count / maxAfterHours : 0;
  if (ratio >= 0.75) return "bg-heat-4 text-white";
  if (ratio >= 0.5) return "bg-heat-3 text-white";
  if (ratio >= 0.25) return "bg-heat-2 text-ink-primary";
  return "bg-heat-1 text-ink-primary";
}

export function Heatmap24x7({
  matrix,
  config,
  periodStart,
  periodEnd,
}: Heatmap24x7Props) {
  const [hoveredCell, setHoveredCell] = useState<{
    dayIdx: number;
    hour: number;
    count: number;
    isRegular: boolean;
  } | null>(null);

  const tzLabel = getTimezoneShortLabel(config.timezone);
  const startMin = parseTimeToMinutes(config.work_start_time);
  const endMin = parseTimeToMinutes(config.work_end_time);
  const activeDays = new Set(config.work_days);

  const safeMatrix =
    matrix ?? Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

  let maxAfterHours = 0;
  for (let d = 0; d < 7; d += 1) {
    for (let h = 0; h < 24; h += 1) {
      const hourMin = h * 60;
      const isReg =
        activeDays.has(d + 1) && hourMin >= startMin && hourMin < endMin;
      if (!isReg && safeMatrix[d][h] > maxAfterHours) {
        maxAfterHours = safeMatrix[d][h];
      }
    }
  }

  const hoveredDayLabel = hoveredCell
    ? (WEEKDAY_OPTIONS[hoveredCell.dayIdx]?.label ?? "Senin")
    : null;
  const hoveredHourStart = hoveredCell
    ? `${String(hoveredCell.hour).padStart(2, "0")}:00`
    : "";
  const hoveredHourEnd = hoveredCell
    ? `${String((hoveredCell.hour + 1) % 24).padStart(2, "0")}:00`
    : "";

  return (
    <section
      aria-label="Heatmap Interupsi 24x7"
      className="flex flex-col gap-4 rounded-lg border border-border-hairline bg-surface p-5"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-ink-primary">
              Heatmap Interupsi 24x7
            </h2>
            {periodStart && periodEnd ? (
              <span className="rounded-full border border-border-hairline bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums text-ink-secondary">
                Periode: {formatPeriodDateId(periodStart)} -{" "}
                {formatPeriodDateId(periodEnd)}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Kolom 00-23 menunjukkan jam (00:00-23:59 {tzLabel}) per hari.
            Koridor garis putus-putus menandai jam reguler (
            {formatTimeHHMM(config.work_start_time)}-
            {formatTimeHHMM(config.work_end_time)} {tzLabel}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-secondary">
          <span>Rendah</span>
          <span className="h-3.5 w-3.5 rounded-[4px] border border-border-hairline bg-heat-0" />
          <span className="h-3.5 w-3.5 rounded-[4px] bg-heat-1" />
          <span className="h-3.5 w-3.5 rounded-[4px] bg-heat-2" />
          <span className="h-3.5 w-3.5 rounded-[4px] bg-heat-3" />
          <span className="h-3.5 w-3.5 rounded-[4px] bg-heat-4" />
          <span>Tinggi</span>
        </div>
      </div>

      <div className="min-h-[28px] rounded-md border border-border-hairline bg-canvas px-3 py-1.5 font-mono text-xs text-ink-secondary">
        {hoveredCell ? (
          <span className="text-ink-primary">
            {hoveredDayLabel}, {hoveredHourStart}-{hoveredHourEnd} {tzLabel}:{" "}
            <strong className="font-semibold">
              {hoveredCell.count} pesan
            </strong>{" "}
            - {hoveredCell.isRegular ? "Jam Reguler" : "Luar Jam Reguler"}
          </span>
        ) : (
          <span>
            Arahkan kursor atau fokus keyboard ke sel untuk melihat rincian
            jumlah pesan per jam.
          </span>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-[760px] flex-col gap-1">
          <div className="grid grid-cols-[68px_repeat(24,minmax(0,1fr))] items-center gap-1 pb-1">
            <span className="font-mono text-[11px] font-medium text-ink-secondary">
              Hari / Jam
            </span>
            {HOURS.map((hour) => {
              const isStartRange = hour * 60 >= startMin && hour * 60 < endMin;
              return (
                <span
                  key={hour}
                  className={`text-center font-mono text-[11px] tabular-nums ${
                    isStartRange
                      ? "font-medium text-safe"
                      : hour >= 18
                        ? "text-warn"
                        : "text-ink-secondary"
                  }`}
                >
                  {String(hour).padStart(2, "0")}
                </span>
              );
            })}
          </div>

          {WEEKDAY_OPTIONS.map((day, dayIdx) => {
            const isWeekendRow = !activeDays.has(day.isoDay);
            return (
              <div
                key={day.isoDay}
                className="grid grid-cols-[68px_repeat(24,minmax(0,1fr))] items-center gap-1"
              >
                <span
                  className={`text-xs font-medium ${
                    isWeekendRow ? "text-warn" : "text-ink-primary"
                  }`}
                >
                  {day.label}
                </span>
                {HOURS.map((hour) => {
                  const count = safeMatrix[dayIdx]?.[hour] ?? 0;
                  const hourMin = hour * 60;
                  const isRegular =
                    !isWeekendRow && hourMin >= startMin && hourMin < endMin;
                  const nextHour = String((hour + 1) % 24).padStart(2, "0");
                  const curHour = String(hour).padStart(2, "0");

                  return (
                    <button
                      key={hour}
                      type="button"
                      onMouseEnter={() =>
                        setHoveredCell({ dayIdx, hour, count, isRegular })
                      }
                      onFocus={() =>
                        setHoveredCell({ dayIdx, hour, count, isRegular })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      aria-label={`${day.label}, ${curHour}:00-${nextHour}:00 ${tzLabel}: ${count} pesan, ${
                        isRegular ? "Jam Reguler" : "Luar Jam Reguler"
                      }`}
                      className={`h-6 rounded-[4px] font-mono text-[10px] tabular-nums transition-opacity hover:opacity-90 ${getHeatClass(
                        count,
                        maxAfterHours,
                        isRegular
                      )}`}
                    >
                      {count > 0 ? count : ""}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
