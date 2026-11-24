"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import {
  BENTO_CARD_CLS,
  BENTO_PILL_PRIMARY_CLS,
  BentoCardHeader,
} from "@/components/shared/BentoPrimitives";
import type { SnapshotSummary } from "../types";
import { SnapshotComparisonPanel } from "./SnapshotComparisonPanel";
import {
  computeAfterHoursPct,
  SnapshotHistoryTable,
} from "./SnapshotHistoryTable";

interface SnapshotTrendCardProps {
  snapshots: SnapshotSummary[];
  workDays?: number[];
}

interface ChartPoint {
  name: string;
  hours: number;
  afterHoursPct: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function formatMonthLabel(periodEnd: string, fallback: string): string {
  const parts = periodEnd.split("-");
  const monthIdx = Number(parts[1] ?? "0") - 1;
  return MONTH_NAMES[monthIdx] ?? fallback.slice(0, 12);
}

const subscribeNoop = () => () => {};

export function SnapshotTrendCard({
  snapshots,
  workDays = [1, 2, 3, 4, 5],
}: SnapshotTrendCardProps) {
  const [viewMode, setViewMode] = useState<"trend" | "compare">("trend");
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const orderedAsc = [...snapshots].sort((a, b) =>
    a.period_start.localeCompare(b.period_start)
  );

  const chartData: ChartPoint[] = orderedAsc.map((item) => ({
    name: formatMonthLabel(item.period_end, item.label),
    hours: Number(item.shadow_overtime_hours),
    afterHoursPct: computeAfterHoursPct(item),
  }));

  const canCompare = snapshots.length >= 2;
  const activeMode = viewMode === "compare" && canCompare ? "compare" : "trend";

  return (
    <article className={`flex h-full flex-col gap-5 ${BENTO_CARD_CLS}`}>
      <BentoCardHeader
        icon={<BarChart3 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        title="Riwayat & Perbandingan Audit Tim"
        subtitle="Agregat jam lembur bayangan dari snapshot anonim tanpa teks chat."
        rightSlot={
          <div
            role="tablist"
            aria-label="Mode tampilan snapshot"
            className="grid w-full grid-cols-2 gap-1 rounded-full border border-stone-200 bg-stone-100/80 p-1 sm:inline-flex sm:w-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "trend"}
              onClick={() => setViewMode("trend")}
              className={`min-h-[34px] rounded-full px-3 py-1 text-center text-xs font-medium whitespace-nowrap transition-colors sm:px-3.5 ${
                activeMode === "trend"
                  ? "bg-brand text-white shadow-2xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Tren &amp; Riwayat
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "compare"}
              disabled={!canCompare}
              onClick={() => setViewMode("compare")}
              title={
                canCompare
                  ? "Bandingkan 2 periode audit"
                  : "Simpan minimal 2 snapshot untuk membandingkan"
              }
              className={`min-h-[34px] rounded-full px-3 py-1 text-center text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5 ${
                activeMode === "compare"
                  ? "bg-brand text-white shadow-2xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <span className="sm:hidden">Bandingkan</span>
              <span className="hidden sm:inline">Bandingkan 2 Snapshot</span>
            </button>
          </div>
        }
      />

      {snapshots.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-stone-300 bg-bento-canvas/50 p-6">
          <p className="text-sm font-medium text-ink-primary">
            Belum ada riwayat snapshot audit untuk workspace ini.
          </p>
          <p className="text-sm text-ink-secondary">
            Proses file ekspor WhatsApp secara lokal di browser, lalu simpan
            angka agregatnya untuk memantau tren penurunan lembur tim.
          </p>
          <Link href="/audit" className={BENTO_PILL_PRIMARY_CLS}>
            Mulai Audit WA Lokal
          </Link>
        </div>
      ) : activeMode === "compare" ? (
        <SnapshotComparisonPanel snapshots={snapshots} workDays={workDays} />
      ) : (
        <>
          <div className="h-52 w-full min-w-0 rounded-2xl border border-stone-200/70 bg-bento-canvas/40 p-3">
            {isClient ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#E7E5E4"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#78716C",
                      fontSize: 12,
                      fontFamily: "var(--font-jetbrains-mono)",
                    }}
                    axisLine={{ stroke: "#E7E5E4" }}
                    tickLine={false}
                  />
                  <YAxis
                    unit="j"
                    tick={{
                      fill: "#78716C",
                      fontSize: 12,
                      fontFamily: "var(--font-jetbrains-mono)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E7E5E4",
                      borderRadius: "14px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${String(value)} jam`, "Lembur Bayangan"]}
                  />
                  <Bar
                    dataKey="hours"
                    fill="#CBDCE0"
                    radius={[999, 999, 999, 999]}
                    barSize={32}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#1E4E56"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#FFFFFF", stroke: "#1E4E56", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <SnapshotHistoryTable snapshots={snapshots} />
        </>
      )}
    </article>
  );
}
