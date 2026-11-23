"use client";

import { useState } from "react";
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  compareAuditSnapshots,
  type AuditComparisonResult,
} from "@/features/audit/lib/boundary-score";
import type { SnapshotSummary } from "../types";

interface SnapshotComparisonPanelProps {
  snapshots: SnapshotSummary[];
  workDays: number[];
}

type DeltaState = "improved" | "worsened" | "neutral";

function formatDec(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

function getDeltaStyle(state: DeltaState): string {
  if (state === "improved") return "border-safe/25 bg-safe-soft text-safe";
  if (state === "worsened") return "border-warn/25 bg-warn-soft text-warn";
  return "border-border-hairline bg-surface-muted text-ink-secondary";
}

function DeltaIcon({ state }: { state: DeltaState }) {
  if (state === "improved") {
    return <TrendingUp className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />;
  }
  if (state === "worsened") {
    return <TrendingDown className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />;
  }
  return <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />;
}

function buildComparisonCards(cmp: AuditComparisonResult) {
  const scoreState: DeltaState =
    cmp.score_delta > 0 ? "improved" : cmp.score_delta < 0 ? "worsened" : "neutral";
  const hoursState: DeltaState =
    cmp.shadow_hours_delta < 0 ? "improved" : cmp.shadow_hours_delta > 0 ? "worsened" : "neutral";
  const pctState: DeltaState =
    cmp.after_hours_pct_delta < 0 ? "improved" : cmp.after_hours_pct_delta > 0 ? "worsened" : "neutral";
  const urgencyState: DeltaState =
    cmp.false_urgency_delta < 0 ? "improved" : cmp.false_urgency_delta > 0 ? "worsened" : "neutral";

  const hoursPctLabel =
    cmp.shadow_hours_delta_pct !== null
      ? ` (${cmp.shadow_hours_delta_pct > 0 ? "+" : ""}${formatDec(cmp.shadow_hours_delta_pct)}%)`
      : "";

  return [
    {
      key: "score",
      title: "Skor Batas Digital",
      beforeValue: `${cmp.before_score.score} (${cmp.before_score.grade})`,
      afterValue: `${cmp.after_score.score} (${cmp.after_score.grade})`,
      deltaText:
        cmp.score_delta === 0
          ? "0 poin (Tetap)"
          : `${cmp.score_delta > 0 ? "+" : ""}${cmp.score_delta} poin (${cmp.score_delta > 0 ? "Membaik" : "Memburuk"})`,
      state: scoreState,
    },
    {
      key: "hours",
      title: "Jam Lembur Bayangan",
      beforeValue: `${formatDec(cmp.before_shadow_hours)} jam`,
      afterValue: `${formatDec(cmp.after_shadow_hours)} jam`,
      deltaText:
        cmp.shadow_hours_delta === 0
          ? "0,0 jam (Tetap)"
          : `${cmp.shadow_hours_delta > 0 ? "+" : ""}${formatDec(cmp.shadow_hours_delta)} jam${hoursPctLabel}`,
      state: hoursState,
    },
    {
      key: "pct",
      title: "Pesan Luar Jam Reguler",
      beforeValue: `${formatDec(cmp.before_after_hours_pct)}%`,
      afterValue: `${formatDec(cmp.after_after_hours_pct)}%`,
      deltaText:
        cmp.after_hours_pct_delta === 0
          ? "0,0% (Tetap)"
          : `${cmp.after_hours_pct_delta > 0 ? "+" : ""}${formatDec(cmp.after_hours_pct_delta)} poin %`,
      state: pctState,
    },
    {
      key: "urgency",
      title: "Pemicu False Urgency",
      beforeValue: `${cmp.before_false_urgency} kali`,
      afterValue: `${cmp.after_false_urgency} kali`,
      deltaText:
        cmp.false_urgency_delta === 0
          ? "0 kali (Tetap)"
          : `${cmp.false_urgency_delta > 0 ? "+" : ""}${cmp.false_urgency_delta} kali`,
      state: urgencyState,
    },
  ];
}

export function SnapshotComparisonPanel({
  snapshots,
  workDays,
}: SnapshotComparisonPanelProps) {
  const orderedAsc = [...snapshots].sort(
    (a, b) =>
      a.period_start.localeCompare(b.period_start) ||
      a.created_at.localeCompare(b.created_at)
  );

  const [beforeId, setBeforeId] = useState(orderedAsc[0]?.id ?? "");
  const [afterId, setAfterId] = useState(
    orderedAsc[orderedAsc.length - 1]?.id ?? ""
  );

  const beforeSnap =
    orderedAsc.find((item) => item.id === beforeId) ?? orderedAsc[0];
  const afterSnap =
    orderedAsc.find((item) => item.id === afterId) ??
    orderedAsc[orderedAsc.length - 1];

  if (!beforeSnap || !afterSnap) return null;

  const cmp = compareAuditSnapshots(
    { ...beforeSnap, shadow_overtime_hours: Number(beforeSnap.shadow_overtime_hours) },
    { ...afterSnap, shadow_overtime_hours: Number(afterSnap.shadow_overtime_hours) },
    workDays
  );
  const cards = buildComparisonCards(cmp);

  const selectors = [
    {
      id: "compare-before-select",
      label: "Periode Awal (Before)",
      value: beforeSnap.id,
      display: beforeSnap.label,
      onChange: setBeforeId,
    },
    {
      id: "compare-after-select",
      label: "Periode Pembanding (After)",
      value: afterSnap.id,
      display: afterSnap.label,
      onChange: setAfterId,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {selectors.map((sel) => (
          <div key={sel.id} className="flex flex-col gap-1.5">
            <label htmlFor={sel.id} className="text-xs font-medium text-ink-secondary">
              {sel.label}
            </label>
            <Select
              value={sel.value}
              onValueChange={(val) => {
                if (val) sel.onChange(val);
              }}
            >
              <SelectTrigger
                id={sel.id}
                className="w-full rounded-md border-border-hairline bg-canvas px-3 text-xs font-medium text-ink-primary data-[size=default]:h-11"
              >
                <SelectValue>{sel.display}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {orderedAsc.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border-hairline bg-canvas px-3.5 py-2.5 text-xs text-ink-secondary">
        {beforeSnap.id === afterSnap.id ? (
          <span>
            Anda memilih periode yang sama. Pilih dua snapshot berbeda untuk
            melihat perubahan progres tim.
          </span>
        ) : (
          <span>
            Perbandingan <strong className="text-ink-primary">{cmp.before_label}</strong>{" "}
            ke <strong className="text-ink-primary">{cmp.after_label}</strong>:{" "}
            <strong className="text-ink-primary">
              {cmp.improved_metrics_count} dari 4 metrik
            </strong>{" "}
            mengalami perbaikan.
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.key}
            className="flex flex-col justify-between gap-2.5 rounded-md border border-border-hairline bg-canvas p-3.5"
          >
            <span className="text-xs font-medium text-ink-secondary">
              {card.title}
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-sm tabular-nums text-ink-primary">
              <span className="text-ink-secondary">{card.beforeValue}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              <span className="font-semibold text-ink-primary">{card.afterValue}</span>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums ${getDeltaStyle(card.state)}`}
            >
              <DeltaIcon state={card.state} />
              <span>{card.deltaText}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
