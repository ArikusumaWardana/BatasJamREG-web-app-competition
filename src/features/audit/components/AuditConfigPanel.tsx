"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatTimeHHMM,
  INDONESIA_TIMEZONES,
  WEEKDAY_OPTIONS,
  WORK_PATTERNS,
  type IndonesiaTimezone,
  type WorkPatternCode,
} from "@/lib/constants/work-hours";
import type { AuditConfig } from "../types";
import { KeywordChipsEditor } from "./KeywordChipsEditor";

interface AuditConfigPanelProps {
  config: AuditConfig;
  disabled?: boolean;
  onChange: (nextConfig: AuditConfig) => void;
}

const PRESET_BUTTONS: { code: WorkPatternCode; label: string }[] = [
  { code: "FIVE_DAYS_8H", label: "5 Hari x 8 Jam" },
  { code: "SIX_DAYS_7H", label: "6 Hari x 7 Jam" },
  { code: "CUSTOM", label: "Kustom" },
];

export function AuditConfigPanel({
  config,
  disabled = false,
  onChange,
}: AuditConfigPanelProps) {
  function selectPreset(code: WorkPatternCode) {
    if (code === "CUSTOM") {
      onChange({ ...config, work_pattern: "CUSTOM" });
      return;
    }
    const preset = WORK_PATTERNS[code];
    onChange({
      ...config,
      work_pattern: code,
      work_start_time: preset.startTime,
      work_end_time: preset.endTime,
      work_days: [...preset.workDays],
    });
  }

  function toggleWorkDay(isoDay: number) {
    const exists = config.work_days.includes(isoDay);
    if (exists && config.work_days.length === 1) return;
    const nextDays = exists
      ? config.work_days.filter((item) => item !== isoDay)
      : [...config.work_days, isoDay].sort((a, b) => a - b);

    onChange({
      ...config,
      work_pattern: "CUSTOM",
      work_days: nextDays,
    });
  }

  const selectedTzLabel =
    INDONESIA_TIMEZONES.find((item) => item.value === config.timezone)?.label ??
    config.timezone;

  return (
    <article className="flex flex-col gap-3.5 rounded-lg border border-border-hairline bg-surface p-5 lg:col-span-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink-primary">
          Konfigurasi Jam Reguler
        </h2>
        <span className="font-mono text-xs text-ink-secondary">
          UU 13/2003 Ps. 77
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-md border border-border-hairline bg-surface-muted p-1">
        {PRESET_BUTTONS.map((preset) => {
          const active = config.work_pattern === preset.code;
          return (
            <button
              key={preset.code}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => selectPreset(preset.code)}
              className={
                active
                  ? "min-h-[34px] rounded bg-brand px-2 py-1 text-xs font-medium text-white"
                  : "min-h-[34px] rounded px-2 py-1 text-xs font-medium text-ink-secondary hover:text-ink-primary"
              }
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-2.5">
        <div className="col-span-6 flex flex-col gap-1 sm:col-span-3">
          <Label htmlFor="audit-start" className="text-[11px] font-medium text-ink-secondary">
            Jam Mulai
          </Label>
          <Input
            id="audit-start"
            type="time"
            disabled={disabled}
            value={formatTimeHHMM(config.work_start_time)}
            onChange={(event) =>
              onChange({
                ...config,
                work_pattern: "CUSTOM",
                work_start_time: `${event.target.value}:00`,
              })
            }
            className="h-9 rounded-md border-border-hairline bg-surface px-2 font-mono text-xs tabular-nums"
          />
        </div>

        <div className="col-span-6 flex flex-col gap-1 sm:col-span-3">
          <Label htmlFor="audit-end" className="text-[11px] font-medium text-ink-secondary">
            Jam Selesai
          </Label>
          <Input
            id="audit-end"
            type="time"
            disabled={disabled}
            value={formatTimeHHMM(config.work_end_time)}
            onChange={(event) =>
              onChange({
                ...config,
                work_pattern: "CUSTOM",
                work_end_time: `${event.target.value}:00`,
              })
            }
            className="h-9 rounded-md border-border-hairline bg-surface px-2 font-mono text-xs tabular-nums"
          />
        </div>

        <div className="col-span-12 flex flex-col gap-1 sm:col-span-6">
          <Label htmlFor="audit-tz" className="text-[11px] font-medium text-ink-secondary">
            Zona Waktu
          </Label>
          <Select
            value={config.timezone}
            disabled={disabled}
            onValueChange={(value) => {
              if (value) {
                onChange({ ...config, timezone: value as IndonesiaTimezone });
              }
            }}
          >
            <SelectTrigger
              id="audit-tz"
              className="h-9 w-full rounded-md border-border-hairline bg-surface pr-8 pl-2.5 text-xs text-ink-primary"
            >
              <SelectValue>{selectedTzLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {INDONESIA_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-ink-secondary">
          Hari Kerja Reguler
        </span>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_OPTIONS.map((day) => {
            const active = config.work_days.includes(day.isoDay);
            return (
              <button
                key={day.isoDay}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => toggleWorkDay(day.isoDay)}
                className={
                  active
                    ? "min-h-[34px] rounded-md bg-brand text-xs font-medium text-white"
                    : "min-h-[34px] rounded-md border border-border-hairline bg-surface-muted text-xs text-ink-secondary hover:text-ink-primary"
                }
              >
                {day.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      <KeywordChipsEditor
        keywords={config.keywords}
        disabled={disabled}
        onChange={(keywords) => onChange({ ...config, keywords })}
      />
    </article>
  );
}
