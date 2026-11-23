"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface WellbeingSliderFieldProps {
  id: string;
  label: string;
  value: number;
  lowLabel: string;
  highLabel: string;
  onChange: (nextValue: number) => void;
}

function extractSliderScore(
  val: number | readonly number[],
  fallback: number
): number {
  const first = Array.isArray(val) ? val[0] : val;
  return typeof first === "number" && Number.isFinite(first)
    ? Math.min(5, Math.max(1, Math.round(first)))
    : fallback;
}

export function WellbeingSliderField({
  id,
  label,
  value,
  lowLabel,
  highLabel,
  onChange,
}: WellbeingSliderFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-medium text-ink-primary">
          {label}
        </Label>
        <span className="font-mono text-xs font-semibold tabular-nums text-brand">
          {value} / 5
        </span>
      </div>
      <Slider
        id={id}
        min={1}
        max={5}
        step={1}
        value={[value]}
        onValueChange={(val) => onChange(extractSliderScore(val, value))}
      />
      <div className="flex items-center justify-between text-[11px] text-ink-secondary">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
