"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  WORK_PATTERNS,
  type IndonesiaTimezone,
  type WorkPatternCode,
} from "@/lib/constants/work-hours";
import { isEndTimeAfterStartTime } from "@/lib/validations/common";
import type { WorkspaceDetail } from "../types";
import { WorkspaceTimeFields } from "./WorkspaceTimeFields";

interface WorkspaceSettingsCardProps {
  workspace: WorkspaceDetail;
  onUpdated: (updated: WorkspaceDetail) => void;
}

function normalizeDaysKey(days: number[]): string {
  return [...days].sort((a, b) => a - b).join(",");
}

export function WorkspaceSettingsCard({
  workspace,
  onUpdated,
}: WorkspaceSettingsCardProps) {
  return (
    <WorkspaceSettingsForm
      key={`${workspace.id}:${workspace.updated_at}`}
      workspace={workspace}
      onUpdated={onUpdated}
    />
  );
}

function WorkspaceSettingsForm({
  workspace,
  onUpdated,
}: WorkspaceSettingsCardProps) {
  const router = useRouter();
  const isAdmin = workspace.role === "OWNER" || workspace.role === "LEAD";

  const initialName = workspace.name;
  const initialPattern = workspace.work_pattern;
  const initialStart = formatTimeHHMM(workspace.work_start_time);
  const initialEnd = formatTimeHHMM(workspace.work_end_time);
  const initialDigest = formatTimeHHMM(workspace.digest_dispatch_time);
  const initialTimezone = workspace.timezone;
  const initialDays = [...workspace.work_days].sort((a, b) => a - b);

  const [name, setName] = useState(initialName);
  const [workPattern, setWorkPattern] =
    useState<WorkPatternCode>(initialPattern);
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(initialEnd);
  const [digestTime, setDigestTime] = useState(initialDigest);
  const [timezone, setTimezone] = useState<IndonesiaTimezone>(initialTimezone);
  const [workDays, setWorkDays] = useState<number[]>(initialDays);
  const [isSaving, setIsSaving] = useState(false);

  const trimmedName = name.trim();
  const isNameValid = trimmedName.length >= 2 && trimmedName.length <= 80;
  const isTimeValid =
    startTime.length === 5 &&
    endTime.length === 5 &&
    digestTime.length === 5 &&
    isEndTimeAfterStartTime(startTime, endTime);
  const isDaysValid = workDays.length > 0;

  const isDirty =
    trimmedName !== initialName ||
    workPattern !== initialPattern ||
    startTime !== initialStart ||
    endTime !== initialEnd ||
    digestTime !== initialDigest ||
    timezone !== initialTimezone ||
    normalizeDaysKey(workDays) !== normalizeDaysKey(initialDays);

  const canSubmit =
    isAdmin && isDirty && isNameValid && isTimeValid && isDaysValid && !isSaving;

  function handlePatternChange(nextValue: string | null) {
    if (!nextValue) return;
    const code = nextValue as WorkPatternCode;
    setWorkPattern(code);
    if (code === "FIVE_DAYS_8H" || code === "SIX_DAYS_7H") {
      const preset = WORK_PATTERNS[code];
      setStartTime(formatTimeHHMM(preset.startTime));
      setEndTime(formatTimeHHMM(preset.endTime));
      setWorkDays([...preset.workDays]);
    }
  }

  function handleToggleDay(isoDay: number) {
    if (!isAdmin) return;
    setWorkPattern("CUSTOM");
    setWorkDays((prev) =>
      prev.includes(isoDay)
        ? prev.filter((item) => item !== isoDay)
        : [...prev, isoDay].sort((a, b) => a - b)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          work_pattern: workPattern,
          work_start_time: startTime,
          work_end_time: endTime,
          digest_dispatch_time: digestTime,
          timezone,
          work_days: workDays,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        data?: Partial<WorkspaceDetail>;
        error?: { message?: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        toast.error(
          payload.error?.message ?? "Gagal menyimpan pengaturan workspace."
        );
        return;
      }

      onUpdated({ ...workspace, ...payload.data });
      toast.success("Pengaturan jam reguler workspace berhasil disimpan.");
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border-hairline bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink-primary">
          Pengaturan Jam Reguler
        </h2>
        {!isAdmin ? (
          <span className="rounded bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
            Hanya Lihat ({workspace.role})
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ws-name" className="text-xs font-medium text-ink-secondary">
            Nama Workspace
          </Label>
          <Input
            id="ws-name"
            type="text"
            value={name}
            disabled={!isAdmin}
            onChange={(event) => setName(event.target.value)}
            className="h-10 rounded-md border-border-hairline bg-surface px-3 text-sm text-ink-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ws-pattern" className="text-xs font-medium text-ink-secondary">
            Pola Jam Kerja
          </Label>
          <Select
            value={workPattern}
            onValueChange={handlePatternChange}
            disabled={!isAdmin}
          >
            <SelectTrigger
              id="ws-pattern"
              className="h-10 w-full rounded-md border-border-hairline bg-surface pr-8 pl-3 text-sm text-ink-primary"
            >
              <SelectValue>{WORK_PATTERNS[workPattern].label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(WORK_PATTERNS).map((preset) => (
                <SelectItem key={preset.code} value={preset.code}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <WorkspaceTimeFields
          isAdmin={isAdmin}
          startTime={startTime}
          endTime={endTime}
          digestTime={digestTime}
          timezone={timezone}
          workDays={workDays}
          onStartTimeChange={(value) => {
            setWorkPattern("CUSTOM");
            setStartTime(value);
          }}
          onEndTimeChange={(value) => {
            setWorkPattern("CUSTOM");
            setEndTime(value);
          }}
          onDigestTimeChange={setDigestTime}
          onTimezoneChange={setTimezone}
          onToggleDay={handleToggleDay}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>Simpan Pengaturan</span>
          )}
        </button>
      </form>
    </article>
  );
}
