"use client";

import { Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { NightInterruptionIntensity, SimulatorInput } from "../types";

const INTENSITY_OPTIONS: {
  value: NightInterruptionIntensity;
  label: string;
}[] = [
  { value: "LOW", label: "Rendah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HIGH", label: "Tinggi" },
];

interface SimulatorInputPanelProps {
  input: SimulatorInput;
  canCopySummary: boolean;
  onChange: (nextInput: SimulatorInput) => void;
  onReset: () => void;
  onCopySummary: () => void;
}

function extractSliderNumber(
  value: number | readonly number[],
  fallback: number
): number {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "number" && Number.isFinite(first) ? first : fallback;
}

export function SimulatorInputPanel({
  input,
  canCopySummary,
  onChange,
  onReset,
  onCopySummary,
}: SimulatorInputPanelProps) {
  return (
    <Card className="rounded-[24px] border-stone-200/80 bg-surface shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-ink-primary">
          Parameter Tim
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="sim-team-size">Jumlah Anggota Tim</Label>
            <span className="font-mono text-xs font-medium text-brand tabular-nums">
              {input.team_size.toLocaleString("id-ID")} Orang
            </span>
          </div>
          <Slider
            min={1}
            max={200}
            step={1}
            value={[Math.min(200, Math.max(1, input.team_size))]}
            onValueChange={(val) =>
              onChange({
                ...input,
                team_size: extractSliderNumber(val, input.team_size),
              })
            }
          />
          <Input
            id="sim-team-size"
            type="number"
            min={0}
            max={10000}
            className="font-mono tabular-nums"
            value={input.team_size}
            onChange={(e) => {
              const numeric = Number(e.target.value);
              onChange({
                ...input,
                team_size: Number.isFinite(numeric)
                  ? Math.max(0, Math.min(10000, Math.round(numeric)))
                  : 0,
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="sim-avg-salary">Rata-Rata Gaji Bulanan (IDR)</Label>
          </div>
          <Slider
            min={3_000_000}
            max={50_000_000}
            step={500_000}
            value={[
              Math.min(50_000_000, Math.max(3_000_000, input.avg_monthly_salary_idr)),
            ]}
            onValueChange={(val) =>
              onChange({
                ...input,
                avg_monthly_salary_idr: extractSliderNumber(
                  val,
                  input.avg_monthly_salary_idr
                ),
              })
            }
          />
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3 font-mono text-xs text-ink-muted">
              Rp
            </span>
            <Input
              id="sim-avg-salary"
              type="text"
              inputMode="numeric"
              className="pl-9 font-mono tabular-nums"
              value={input.avg_monthly_salary_idr.toLocaleString("id-ID")}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                const numeric = digitsOnly ? Number(digitsOnly) : 0;
                onChange({
                  ...input,
                  avg_monthly_salary_idr: Number.isFinite(numeric)
                    ? Math.max(0, Math.min(500_000_000, Math.round(numeric)))
                    : 0,
                });
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="sim-weekly-hours">
              Lembur Bayangan / Minggu (Jam)
            </Label>
            <span className="font-mono text-xs font-medium text-brand tabular-nums">
              {input.weekly_shadow_overtime_hours.toLocaleString("id-ID", {
                maximumFractionDigits: 1,
              })}{" "}
              Jam
            </span>
          </div>
          <Slider
            min={0}
            max={20}
            step={0.5}
            value={[Math.min(20, Math.max(0, input.weekly_shadow_overtime_hours))]}
            onValueChange={(val) =>
              onChange({
                ...input,
                weekly_shadow_overtime_hours: extractSliderNumber(
                  val,
                  input.weekly_shadow_overtime_hours
                ),
              })
            }
          />
          <Input
            id="sim-weekly-hours"
            type="number"
            min={0}
            max={60}
            step={0.5}
            className="font-mono tabular-nums"
            value={input.weekly_shadow_overtime_hours}
            onChange={(e) => {
              const numeric = Number(e.target.value);
              onChange({
                ...input,
                weekly_shadow_overtime_hours: Number.isFinite(numeric)
                  ? Math.max(0, Math.min(60, numeric))
                  : 0,
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Intensitas Interupsi Malam</Label>
          <div className="grid grid-cols-3 gap-1 rounded-full border border-stone-200 bg-stone-100/80 p-1">
            {INTENSITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={input.night_interruption_intensity === option.value}
                onClick={() =>
                  onChange({
                    ...input,
                    night_interruption_intensity: option.value,
                  })
                }
                className={cn(
                  "rounded-full px-2 py-1.5 text-xs font-medium transition-colors",
                  input.night_interruption_intensity === option.value
                    ? "bg-brand text-white shadow-2xs"
                    : "text-ink-secondary hover:text-ink-primary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-stone-100 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={!canCopySummary}
            onClick={onCopySummary}
            className="w-full rounded-full"
          >
            <Copy className="size-4" />
            <span>Salin Ringkasan Advokasi</span>
          </Button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset ke Nilai Default</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
