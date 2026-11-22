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
  INDONESIA_TIMEZONES,
  WEEKDAY_OPTIONS,
  type IndonesiaTimezone,
} from "@/lib/constants/work-hours";
import { isEndTimeAfterStartTime } from "@/lib/validations/common";

interface WorkspaceTimeFieldsProps {
  isAdmin: boolean;
  startTime: string;
  endTime: string;
  digestTime: string;
  timezone: IndonesiaTimezone;
  workDays: number[];
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onDigestTimeChange: (value: string) => void;
  onTimezoneChange: (value: IndonesiaTimezone) => void;
  onToggleDay: (isoDay: number) => void;
}

export function WorkspaceTimeFields({
  isAdmin,
  startTime,
  endTime,
  digestTime,
  timezone,
  workDays,
  onStartTimeChange,
  onEndTimeChange,
  onDigestTimeChange,
  onTimezoneChange,
  onToggleDay,
}: WorkspaceTimeFieldsProps) {
  const selectedTzLabel =
    INDONESIA_TIMEZONES.find((item) => item.value === timezone)?.label ??
    timezone;
  const hasInvalidTimeOrder =
    startTime.length === 5 &&
    endTime.length === 5 &&
    !isEndTimeAfterStartTime(startTime, endTime);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ws-start" className="text-xs font-medium text-ink-secondary">
            Jam Mulai
          </Label>
          <Input
            id="ws-start"
            type="time"
            value={startTime}
            disabled={!isAdmin}
            onChange={(event) => onStartTimeChange(event.target.value)}
            className="h-10 rounded-md border-border-hairline bg-surface px-3 font-mono text-sm tabular-nums text-ink-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ws-end" className="text-xs font-medium text-ink-secondary">
            Jam Selesai
          </Label>
          <Input
            id="ws-end"
            type="time"
            value={endTime}
            disabled={!isAdmin}
            onChange={(event) => onEndTimeChange(event.target.value)}
            aria-invalid={hasInvalidTimeOrder}
            className="h-10 rounded-md border-border-hairline bg-surface px-3 font-mono text-sm tabular-nums text-ink-primary"
          />
        </div>
      </div>

      {hasInvalidTimeOrder ? (
        <p className="text-xs text-danger" role="alert">
          Jam selesai kerja harus lebih besar dari jam mulai kerja.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ws-digest" className="text-xs font-medium text-ink-secondary">
            Jadwal Kirim Digest
          </Label>
          <Input
            id="ws-digest"
            type="time"
            value={digestTime}
            disabled={!isAdmin}
            onChange={(event) => onDigestTimeChange(event.target.value)}
            className="h-10 rounded-md border-border-hairline bg-surface px-3 font-mono text-sm tabular-nums text-ink-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ws-tz" className="text-xs font-medium text-ink-secondary">
            Zona Waktu
          </Label>
          <Select
            value={timezone}
            onValueChange={(value) => {
              if (value) onTimezoneChange(value as IndonesiaTimezone);
            }}
            disabled={!isAdmin}
          >
            <SelectTrigger
              id="ws-tz"
              className="h-10 w-full rounded-md border-border-hairline bg-surface pr-8 pl-3 text-sm text-ink-primary"
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
        <span className="text-xs font-medium text-ink-secondary">
          Hari Kerja Aktif
        </span>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_OPTIONS.map((day) => {
            const active = workDays.includes(day.isoDay);
            return (
              <button
                key={day.isoDay}
                type="button"
                disabled={!isAdmin}
                aria-pressed={active}
                onClick={() => onToggleDay(day.isoDay)}
                className={
                  active
                    ? "min-h-[36px] rounded-md border border-brand-border bg-brand-soft text-xs font-medium text-brand"
                    : "min-h-[36px] rounded-md border border-border-hairline bg-surface text-xs text-ink-secondary hover:bg-surface-muted"
                }
              >
                {day.shortLabel}
              </button>
            );
          })}
        </div>
        {workDays.length === 0 ? (
          <p className="text-xs text-danger" role="alert">
            Pilih minimal satu hari kerja aktif.
          </p>
        ) : null}
      </div>
    </>
  );
}
