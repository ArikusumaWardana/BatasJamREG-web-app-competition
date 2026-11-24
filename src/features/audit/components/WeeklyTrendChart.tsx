"use client";

import { useSyncExternalStore } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyTrendPoint } from "../types";

interface WeeklyTrendChartProps {
  data: WeeklyTrendPoint[];
}

const subscribeNoop = () => () => {};

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  return (
    <article className="flex h-full min-w-0 flex-col justify-between gap-4 rounded-[24px] border border-stone-200/80 bg-surface p-6 shadow-[0_1px_2px_rgba(28,25,23,0.03)] lg:col-span-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink-primary">
          Tren Mingguan Pesan Reguler vs Luar Jam
        </h2>
        <div className="flex items-center gap-4 text-xs text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-3 rounded-full bg-brand" aria-hidden="true" />
            <span>Reguler</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-3 rounded-full bg-warn" aria-hidden="true" />
            <span>Luar Jam</span>
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-bento-canvas/50 p-4 text-center text-sm text-ink-secondary">
          Belum ada data tren mingguan. Unggah file ekspor WhatsApp atau muat
          dataset simulasi.
        </div>
      ) : (
        <div className="h-52 w-full min-w-0">
          {isClient ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 12, left: -14, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#E7E5E4"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="week_label"
                  tick={{
                    fill: "#78716C",
                    fontSize: 12,
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  axisLine={{ stroke: "#E7E5E4" }}
                  tickLine={false}
                />
                <YAxis
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
                />
                <Line
                  type="monotone"
                  dataKey="regular_messages"
                  name="Jam Reguler"
                  stroke="#1E4E56"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="after_hours_messages"
                  name="Luar Jam"
                  stroke="#B45309"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      )}
    </article>
  );
}
