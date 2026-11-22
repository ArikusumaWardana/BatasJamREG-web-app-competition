"use client";

import { useSyncExternalStore } from "react";
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

interface SnapshotTrendCardProps {
  snapshots: SnapshotSummary[];
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

function formatShortPeriod(start: string, end: string): string {
  const sParts = start.split("-");
  const eParts = end.split("-");
  const monthIdx = Number(eParts[1] ?? "1") - 1;
  const monthLabel = MONTH_NAMES[monthIdx] ?? eParts[1];
  return `${sParts[2]}-${eParts[2]} ${monthLabel}`;
}

function formatMonthLabel(periodEnd: string, fallback: string): string {
  const parts = periodEnd.split("-");
  const monthIdx = Number(parts[1] ?? "0") - 1;
  return MONTH_NAMES[monthIdx] ?? fallback.slice(0, 12);
}

function computeAfterHoursPct(item: SnapshotSummary): number {
  if (item.total_messages <= 0) return 0;
  return Number(
    ((item.after_hours_messages / item.total_messages) * 100).toFixed(1)
  );
}

const subscribeNoop = () => () => {};

export function SnapshotTrendCard({ snapshots }: SnapshotTrendCardProps) {
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

  return (
    <article className="flex flex-col gap-5 rounded-lg border border-border-hairline bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            Tren Lembur Bayangan Tim per Periode Audit
          </h2>
          <p className="text-xs text-ink-secondary">
            Agregat jam lembur bayangan dari snapshot anonim tanpa teks chat.
          </p>
        </div>
        <span className="font-mono text-xs tabular-nums text-ink-secondary">
          {snapshots.length} Snapshot Tersimpan
        </span>
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
            className="inline-flex min-h-[38px] items-center justify-center rounded-md bg-brand px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Mulai Audit WA Lokal
          </Link>
        </div>
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

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-hairline text-xs font-medium text-ink-secondary">
                  <th className="py-2 pr-3">Label Audit</th>
                  <th className="px-3 py-2">Periode</th>
                  <th className="px-3 py-2 text-right">Luar Jam (%)</th>
                  <th className="py-2 pl-3 text-right">Lembur Bayangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline text-sm">
                {snapshots.map((item) => {
                  const pct = computeAfterHoursPct(item);
                  return (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-3 font-medium text-ink-primary">
                        {item.label}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-ink-secondary">
                        {formatShortPeriod(item.period_start, item.period_end)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-mono text-xs font-medium tabular-nums ${
                          pct <= 30 ? "text-safe" : "text-warn"
                        }`}
                      >
                        {pct.toFixed(1).replace(".", ",")}%
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono text-xs font-semibold tabular-nums text-ink-primary">
                        {Number(item.shadow_overtime_hours)
                          .toFixed(1)
                          .replace(".", ",")}{" "}
                        Jam
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  );
}
