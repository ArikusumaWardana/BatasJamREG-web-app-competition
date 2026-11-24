import { ShieldCheck } from "lucide-react";
import { calculateBoundaryScore } from "../lib/boundary-score";
import type { LocalAuditResult } from "../types";

interface BoundaryScoreCardProps {
  result: LocalAuditResult | null;
  workDays: number[];
}

const DEFAULT_WEIGHTS = [
  { key: "after_hours", label: "Pesan Luar Jam Reguler", weight: 45 },
  { key: "false_urgency", label: "Kepadatan False Urgency", weight: 30 },
  { key: "non_workday", label: "Pesan Hari Non-Kerja", weight: 25 },
];

function getBarColorClass(subScore: number): string {
  if (subScore >= 70) return "bg-safe";
  if (subScore >= 40) return "bg-warn";
  return "bg-danger";
}

function formatDecimalId(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function BoundaryScoreCard({
  result,
  workDays,
}: BoundaryScoreCardProps) {
  const scoreData = result
    ? calculateBoundaryScore({
        total_messages: result.total_messages,
        after_hours_messages: result.after_hours_messages,
        false_urgency_count: result.false_urgency_count,
        after_hours_percentage: result.after_hours_percentage,
        heatmap_matrix: result.heatmap_matrix,
        work_days: workDays,
      })
    : null;

  return (
    <article
      aria-label="Skor Kesehatan Batas Digital"
      className="flex h-full flex-col justify-between gap-4 rounded-[24px] border border-stone-200/80 bg-surface p-6 shadow-[0_1px_2px_rgba(28,25,23,0.03)]"
    >
      <div className="flex flex-col justify-between gap-3 rounded-[20px] bg-brand p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-white/85"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h2 className="text-sm font-semibold text-white">
              Skor Batas Digital
            </h2>
          </div>

          {scoreData ? (
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-0.5 font-mono text-xs font-semibold tabular-nums text-white">
              Grade {scoreData.grade} - {scoreData.status_label}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-white/12 px-3 py-0.5 text-xs font-medium text-white/85">
              Menunggu Audit
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-mono text-4xl font-bold leading-none tabular-nums text-white">
            {scoreData ? scoreData.score : "--"}
          </span>
          <span className="font-mono text-sm font-medium text-white/75">
            / 100
          </span>
        </div>

        <p className="text-xs leading-relaxed text-white/80">
          {scoreData
            ? "Skor komposit ketertiban komunikasi kerja berdasarkan jam reguler, false urgency, dan hari libur."
            : "Unggah ekspor chat WA atau muat simulasi untuk menghitung skor kesehatan batas kerja tim."}
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        {scoreData
          ? scoreData.components.map((comp) => {
              const unitText =
                comp.raw_unit === "%" ? "%" : ` ${comp.raw_unit}`;
              return (
                <div key={comp.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-ink-primary">
                      {comp.label}{" "}
                      <span className="font-mono text-[11px] text-ink-secondary">
                        ({comp.weight_pct}%)
                      </span>
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-ink-secondary">
                      {formatDecimalId(comp.raw_value)}
                      {unitText} | {Math.round(comp.sub_score)}/100
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full transition-all ${getBarColorClass(comp.sub_score)}`}
                      style={{ width: `${Math.round(comp.sub_score)}%` }}
                    />
                  </div>
                </div>
              );
            })
          : DEFAULT_WEIGHTS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 text-xs text-ink-secondary"
              >
                <span>{item.label}</span>
                <span className="font-mono tabular-nums">
                  Bobot {item.weight}%
                </span>
              </div>
            ))}
      </div>
    </article>
  );
}
