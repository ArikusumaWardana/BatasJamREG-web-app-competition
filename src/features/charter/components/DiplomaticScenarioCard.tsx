"use client";

import { Loader2, Lock, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DiplomaticReplyInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type {
  DiplomaticRecipient,
  DiplomaticTimeContext,
  DiplomaticTone,
} from "../types";

const RECIPIENT_OPTIONS: { value: DiplomaticRecipient; label: string }[] = [
  { value: "MANAGER", label: "Atasan" },
  { value: "CLIENT", label: "Klien" },
  { value: "PEER", label: "Rekan Tim" },
];

const TIME_CONTEXT_OPTIONS: { value: DiplomaticTimeContext; label: string }[] = [
  { value: "NIGHT", label: "Malam Hari" },
  { value: "WEEKEND", label: "Akhir Pekan" },
  { value: "HOLIDAY", label: "Hari Libur" },
];

const TONE_OPTIONS: { value: DiplomaticTone; label: string }[] = [
  { value: "FORMAL_CORPORATE", label: "Formal" },
  { value: "POLITE_STARTUP", label: "Sopan" },
  { value: "FIRM_PROFESSIONAL", label: "Tegas" },
];

const QUICK_SCENARIO_CHIPS: { label: string; preset: DiplomaticReplyInput }[] = [
  {
    label: "Revisi deck malam",
    preset: {
      recipient: "MANAGER",
      time_context: "NIGHT",
      tone: "POLITE_STARTUP",
      short_context: "Diminta revisi deck presentasi untuk rapat lusa jam 21.30 WIB",
      next_work_window: "Besok pukul 09.00 WIB",
    },
  },
  {
    label: "Laporan akhir pekan",
    preset: {
      recipient: "CLIENT",
      time_context: "WEEKEND",
      tone: "FORMAL_CORPORATE",
      short_context: "Permintaan rekap data performa kampanye di luar hari kerja",
      next_work_window: "Senin pukul 09.00 WIB",
    },
  },
  {
    label: "Koordinasi hari libur",
    preset: {
      recipient: "PEER",
      time_context: "HOLIDAY",
      tone: "FIRM_PROFESSIONAL",
      short_context: "Diskusi jadwal rilis fitur mingguan di tanggal merah",
      next_work_window: "Hari kerja berikutnya pukul 09.00 WIB",
    },
  },
];

interface SegmentedToggleProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (nextValue: T) => void;
}

function SegmentedToggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedToggleProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-1 rounded-full border border-stone-200 bg-stone-100/80 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-2 py-1.5 text-xs font-medium transition-colors",
              value === option.value
                ? "bg-brand text-white shadow-2xs"
                : "text-ink-secondary hover:text-ink-primary"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DiplomaticScenarioCardProps {
  formInput: DiplomaticReplyInput;
  isFormValid: boolean;
  isGenerating: boolean;
  onChange: (nextInput: DiplomaticReplyInput) => void;
  onRefineWithAi: () => void;
  onResetToTemplate: () => void;
}

export function DiplomaticScenarioCard({
  formInput,
  isFormValid,
  isGenerating,
  onChange,
  onRefineWithAi,
  onResetToTemplate,
}: DiplomaticScenarioCardProps) {
  return (
    <Card className="rounded-[24px] border-stone-200/80 bg-surface shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-ink-primary">
          Atur Skenario Pesan
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SCENARIO_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChange({ ...chip.preset })}
              className="rounded-full border border-stone-200 bg-bento-canvas/50 px-3 py-1 text-xs font-medium text-ink-secondary transition-colors hover:border-brand-border hover:bg-brand-soft hover:text-brand"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <SegmentedToggle
          label="Penerima Pesan"
          value={formInput.recipient}
          options={RECIPIENT_OPTIONS}
          onChange={(recipient) => onChange({ ...formInput, recipient })}
        />

        <SegmentedToggle
          label="Waktu Pesan Diterima"
          value={formInput.time_context}
          options={TIME_CONTEXT_OPTIONS}
          onChange={(time_context) => onChange({ ...formInput, time_context })}
        />

        <SegmentedToggle
          label="Gaya Bahasa"
          value={formInput.tone}
          options={TONE_OPTIONS}
          onChange={(tone) => onChange({ ...formInput, tone })}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="next-work-window">Jendela Kerja Berikutnya</Label>
          <Input
            id="next-work-window"
            maxLength={60}
            placeholder="Contoh: Besok pukul 09.00 WIB"
            value={formInput.next_work_window}
            onChange={(e) =>
              onChange({ ...formInput, next_work_window: e.target.value })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="short-context-input">Konteks Singkat</Label>
            <span className="font-mono text-xs text-ink-muted tabular-nums">
              {formInput.short_context.length} / 200
            </span>
          </div>
          <Textarea
            id="short-context-input"
            rows={3}
            maxLength={200}
            placeholder="Ringkas topik tugas tanpa nama asli atau data rahasia..."
            value={formInput.short_context}
            onChange={(e) =>
              onChange({ ...formInput, short_context: e.target.value })
            }
          />
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Lock className="size-3.5 shrink-0" />
            <span>Jangan masukkan nama asli atau data rahasia perusahaan.</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            disabled={!isFormValid || isGenerating}
            onClick={onRefineWithAi}
            className="w-full rounded-full"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            <span>Perhalus dengan AI</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!isFormValid || isGenerating}
            onClick={onResetToTemplate}
            className="w-full rounded-full"
          >
            <RefreshCw className="size-4" />
            <span>Gunakan Template Instan</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
