"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatRupiah,
  formatRupiahCompact,
} from "../lib/presenteeism-formula";
import type { MonthlyProjectionPoint } from "../types";

interface ProjectionChartProps {
  data: MonthlyProjectionPoint[];
  projectedAnnualSavingsIdr: number;
  savingsPercentage: number;
}

const subscribeNoop = () => () => {};

export function ProjectionChart({
  data,
  projectedAnnualSavingsIdr,
  savingsPercentage,
}: ProjectionChartProps) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  return (
    <Card className="rounded-[24px] border-stone-200/80 bg-surface shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
      <CardContent className="flex flex-col gap-4 pt-5">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-ink-primary">
              Proyeksi Akumulasi Biaya 12 Bulan
            </h2>
            <p className="text-xs text-ink-secondary">
              Perbandingan kondisi Always-On vs setelah penerapan batas jam
              digital BatasJamREG.
            </p>
          </div>

          <Badge
            variant="outline"
            className="w-fit shrink-0 rounded-full border-safe/30 bg-safe-soft px-3 py-0.5 font-mono text-xs text-safe tabular-nums"
          >
            Potensi Hemat: {formatRupiahCompact(projectedAnnualSavingsIdr)} (
            {savingsPercentage.toLocaleString("id-ID")}%)
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs text-ink-secondary">
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-3.5 rounded-full bg-warn" aria-hidden="true" />
            <span>Status Quo (Always-On)</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-3.5 rounded-full bg-brand" aria-hidden="true" />
            <span>Dengan BatasJamREG (Morning Digest & Piagam)</span>
          </span>
        </div>

        <div className="h-64 w-full min-w-0 pt-1">
          {isClient ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#E7E5E4"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month_label"
                  tick={{
                    fill: "#78716C",
                    fontSize: 11,
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  axisLine={{ stroke: "#E7E5E4" }}
                  tickLine={false}
                />
                <YAxis
                  width={74}
                  tickFormatter={(value) => formatRupiahCompact(Number(value))}
                  tick={{
                    fill: "#78716C",
                    fontSize: 11,
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => formatRupiah(Number(value ?? 0))}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E7E5E4",
                    borderRadius: "14px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="status_quo_cumulative_idr"
                  name="Status Quo (Always-On)"
                  stroke="#B45309"
                  strokeWidth={2}
                  fill="#FEF6EB"
                  fillOpacity={0.75}
                />
                <Area
                  type="monotone"
                  dataKey="with_batasjam_cumulative_idr"
                  name="Dengan BatasJamREG"
                  stroke="#1E4E56"
                  strokeWidth={2}
                  fill="#EDF4F5"
                  fillOpacity={0.85}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
