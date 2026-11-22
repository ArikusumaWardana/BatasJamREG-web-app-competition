"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DigestTriageType } from "../types";

interface DigestTriageSelectorProps {
  triageType: DigestTriageType;
  emergencyReason: string;
  onTriageChange: (nextType: DigestTriageType) => void;
  onReasonChange: (nextReason: string) => void;
}

export function DigestTriageSelector({
  triageType,
  emergencyReason,
  onTriageChange,
  onReasonChange,
}: DigestTriageSelectorProps) {
  const isEmergency = triageType === "EMERGENCY_OPS";
  const trimmedLength = emergencyReason.trim().length;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-ink-primary">
          Protokol Triage
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={!isEmergency}
            onClick={() => onTriageChange("MORNING_QUEUE")}
            className={
              !isEmergency
                ? "min-h-[38px] rounded-md border border-brand bg-brand-soft px-3 py-2 text-xs font-medium text-brand"
                : "min-h-[38px] rounded-md border border-border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-surface-muted"
            }
          >
            Antrean Pagi (Non-Darurat)
          </button>
          <button
            type="button"
            aria-pressed={isEmergency}
            onClick={() => onTriageChange("EMERGENCY_OPS")}
            className={
              isEmergency
                ? "min-h-[38px] rounded-md border border-danger bg-danger-soft px-3 py-2 text-xs font-medium text-danger"
                : "min-h-[38px] rounded-md border border-border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-surface-muted"
            }
          >
            Darurat Operasional
          </button>
        </div>
      </div>

      {isEmergency ? (
        <div className="flex flex-col gap-1.5 rounded-md border border-danger/30 bg-danger-soft/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="card-emergency-reason"
              className="text-xs font-medium text-danger"
            >
              Alasan Darurat Operasional (Wajib)
            </Label>
            <span
              className={`font-mono text-[11px] tabular-nums ${
                trimmedLength >= 10 ? "text-safe" : "text-danger"
              }`}
            >
              {trimmedLength}/10 karakter minimal
            </span>
          </div>
          <Textarea
            id="card-emergency-reason"
            rows={2}
            placeholder="Jelaskan dampak operasional nyata (min. 10 karakter)..."
            value={emergencyReason}
            onChange={(event) => onReasonChange(event.target.value)}
            className="rounded-md border-danger/30 bg-surface px-3 py-2 text-sm"
            required
          />
        </div>
      ) : null}
    </>
  );
}
