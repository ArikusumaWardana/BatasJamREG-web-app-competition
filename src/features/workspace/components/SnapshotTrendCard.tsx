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
    <article className="flex flex-col gap-5 rounded-lg border border-border-hairline bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            Riwayat &amp; Perbandingan Audit Tim
          </h2>
          <p className="text-xs text-ink-secondary">
            Agregat jam lembur bayangan dari snapshot anonim tanpa teks chat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Mode tampilan snapshot"
            className="inline-flex rounded-md border border-border-hairline bg-canvas p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "trend"}
              onClick={() => setViewMode("trend")}
              className={`min-h-[36px] rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                activeMode === "trend"
                  ? "bg-surface text-brand shadow-2xs"
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
              className={`min-h-[36px] rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                activeMode === "compare"
                  ? "bg-surface text-brand shadow-2xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Bandingkan 2 Snapshot (Before vs After)
            </button>
          </div>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-border-strong bg-canvas p-6">
          <p className="text-sm font-medium text-ink-primary">
            Belum ada riwayat snapshot audit untuk workspace ini.
          </p>
          <p className="text-sm text-ink-secondary">
            Proses file ekspor WhatsApp secara lokal di browser, lalu simpan
            angka agregatnya untuk memantau tren penurunan lembur tim.
          </p>
          <Link
            href="/audit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Mulai Audit WA Lokal
          </Link>
        </div>
      ) : activeMode === "compare" ? (
        <SnapshotComparisonPanel snapshots={snapshots} workDays={workDays} />
      ) : (
        <>
          <div className="h-52 w-full min-w-0 rounded-md border border-border-hairline bg-canvas p-3">
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
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${String(value)} jam`, "Lembur Bayangan"]}
                  />
                  <Bar
                    dataKey="hours"
                    fill="#CBDCE0"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
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
