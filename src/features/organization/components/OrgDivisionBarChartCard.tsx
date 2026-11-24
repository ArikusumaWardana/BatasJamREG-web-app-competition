"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { BENTO_CARD_CLS, BentoCardHeader } from "@/components/shared/BentoPrimitives";
import type { DivisionOverviewItem } from "../types";

interface OrgDivisionBarChartCardProps {
  divisions: DivisionOverviewItem[];
}

type BarMetricMode = "overtime" | "wellbeing";

function shortDivisionName(name: string): string {
  const clean = name.replace(/^Tim\s+/i, "").trim();
  return clean.length > 9 ? `${clean.slice(0, 8)}.` : clean;
}

export function OrgDivisionBarChartCard({
  divisions,
}: OrgDivisionBarChartCardProps) {
  const [metric, setMetric] = useState<BarMetricMode>("overtime");

  const items = divisions.slice(0, 6).map((div) => {
    if (metric === "overtime") {
      const value = div.latest_snapshot
        ? Number(div.latest_snapshot.shadow_overtime_hours)
        : 0;
      return {
        id: div.id,
        label: shortDivisionName(div.name),
        fullName: div.name,
        value,
        displayValue: `${value.toFixed(1).replace(".", ",")}j`,
      };
    }
    const wbScore =
      div.wellbeing?.is_threshold_met && div.wellbeing.composite_score !== null
        ? Number(div.wellbeing.composite_score)
        : 0;
    return {
      id: div.id,
      label: shortDivisionName(div.name),
      fullName: div.name,
      value: wbScore,
      displayValue: wbScore > 0 ? wbScore.toFixed(1).replace(".", ",") : "-",
    };
  });

  const maxVal =
    metric === "wellbeing"
      ? 5
      : Math.max(...items.map((item) => item.value), 10);

  let peakId: string | null = null;
  let peakVal = -1;
  for (const item of items) {
    if (item.value > peakVal && item.value > 0) {
      peakVal = item.value;
      peakId = item.id;
    }
  }

  return (
    <article className={`flex h-full flex-col justify-between gap-5 ${BENTO_CARD_CLS}`}>
      <BentoCardHeader
        icon={<BarChart3 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        title="Perbandingan Divisi"
        subtitle={
          metric === "overtime"
            ? "Jam lembur bayangan terbaru"
            : "Indeks kesejahteraan (skala 5,0)"
        }
        rightSlot={
          <div
            role="tablist"
            aria-label="Pilih metrik grafik divisi"
            className="inline-flex rounded-full border border-stone-200 bg-stone-100/80 p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={metric === "overtime"}
              onClick={() => setMetric("overtime")}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                metric === "overtime"
                  ? "bg-brand text-white"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Lembur
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={metric === "wellbeing"}
              onClick={() => setMetric("wellbeing")}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                metric === "wellbeing"
                  ? "bg-brand text-white"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Wellbeing
            </button>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-[18px] border border-dashed border-stone-200 bg-canvas p-4 text-center text-xs text-ink-secondary">
          Belum ada divisi untuk dibandingkan.
        </div>
      ) : (
        <div className="flex h-52 items-end justify-between gap-2.5 px-1 pt-7">
          {items.map((item) => {
            const isPeak = item.id === peakId;
            const heightPct =
              item.value > 0
                ? Math.max(18, Math.round((item.value / maxVal) * 100))
                : 10;

            return (
              <div
                key={item.id}
                title={`${item.fullName}: ${item.displayValue}`}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="relative flex h-full w-full items-end justify-center">
                  <div
                    className={`relative w-full max-w-[34px] rounded-full transition-all ${
                      item.value <= 0
                        ? "bg-stone-200/70"
                        : isPeak
                          ? metric === "overtime"
                            ? "bg-warn"
                            : "bg-brand"
                          : "bg-brand-border"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  >
                    {isPeak ? (
                      <span
                        className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-white ${
                          metric === "overtime" ? "bg-warn" : "bg-brand"
                        }`}
                      >
                        {item.displayValue}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="max-w-full truncate font-mono text-[11px] text-ink-secondary">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
