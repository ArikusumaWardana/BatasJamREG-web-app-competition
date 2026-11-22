"use client";

import { useState } from "react";
import { Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCharterTimeShort, type CharterDraft } from "../types";

interface CharterFormPanelProps {
  draft: CharterDraft;
  auditHandoffNote: string | null;
  onChange: (nextDraft: CharterDraft) => void;
}

export function CharterFormPanel({
  draft,
  auditHandoffNote,
  onChange,
}: CharterFormPanelProps) {
  const [newCriterion, setNewCriterion] = useState("");
  const canAddCriterion =
    newCriterion.trim().length >= 3 && draft.emergency_criteria.length < 12;

  function handleAddCriterion() {
    const trimmed = newCriterion.trim();
    if (trimmed.length < 3 || draft.emergency_criteria.length >= 12) {
      return;
    }
    onChange({
      ...draft,
      emergency_criteria: [...draft.emergency_criteria, trimmed.slice(0, 180)],
    });
    setNewCriterion("");
  }

  function handleRemoveCriterion(index: number) {
    if (draft.emergency_criteria.length <= 1) {
      return;
    }
    onChange({
      ...draft,
      emergency_criteria: draft.emergency_criteria.filter((_, i) => i !== index),
    });
  }

  return (
    <Card className="border-border-hairline bg-surface">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-ink-primary">
          Konfigurasi Piagam
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {auditHandoffNote ? (
          <div className="flex items-start gap-2 rounded-md border border-brand-border bg-brand-soft px-3 py-2 text-xs text-brand">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>{auditHandoffNote}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="charter-title">Judul Dokumen</Label>
          <Input
            id="charter-title"
            value={draft.title}
            maxLength={120}
            placeholder="Contoh: Piagam Jam Digital Tim Kreatif Nusantara"
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="charter-team-name">Nama Tim / Perusahaan</Label>
          <Input
            id="charter-team-name"
            value={draft.company_or_team_name}
            maxLength={100}
            placeholder="Contoh: Tim Kreatif Nusantara"
            onChange={(e) =>
              onChange({ ...draft, company_or_team_name: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quiet-hours-start">Mulai Jam Tenang</Label>
            <Input
              id="quiet-hours-start"
              type="time"
              className="font-mono tabular-nums"
              value={formatCharterTimeShort(draft.quiet_hours_start)}
              onChange={(e) =>
                onChange({
                  ...draft,
                  quiet_hours_start: e.target.value
                    ? `${e.target.value}:00`
                    : "18:00:00",
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quiet-hours-end">Selesai Jam Tenang</Label>
            <Input
              id="quiet-hours-end"
              type="time"
              className="font-mono tabular-nums"
              value={formatCharterTimeShort(draft.quiet_hours_end)}
              onChange={(e) =>
                onChange({
                  ...draft,
                  quiet_hours_end: e.target.value
                    ? `${e.target.value}:00`
                    : "08:00:00",
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="non-urgent-sla">SLA Balasan Non-Darurat (Jam)</Label>
            <Input
              id="non-urgent-sla"
              type="number"
              min={1}
              max={24}
              className="font-mono tabular-nums"
              value={draft.non_urgent_sla_hours}
              onChange={(e) => {
                const numeric = Number(e.target.value);
                onChange({
                  ...draft,
                  non_urgent_sla_hours: Number.isFinite(numeric)
                    ? Math.max(1, Math.min(24, Math.round(numeric)))
                    : 2,
                });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="baseline-shadow-hours">
              Baseline Lembur Bayangan (Jam)
            </Label>
            <Input
              id="baseline-shadow-hours"
              type="number"
              min={0}
              max={9999.99}
              step="0.5"
              placeholder="Opsional"
              className="font-mono tabular-nums"
              value={
                draft.baseline_shadow_hours === null
                  ? ""
                  : draft.baseline_shadow_hours
              }
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  onChange({ ...draft, baseline_shadow_hours: null });
                  return;
                }
                const numeric = Number(raw);
                if (Number.isFinite(numeric) && numeric >= 0) {
                  onChange({
                    ...draft,
                    baseline_shadow_hours: Math.min(9999.99, numeric),
                  });
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <Label>Kriteria Darurat Operasional Disepakati</Label>
            <span className="font-mono text-xs text-ink-muted tabular-nums">
              {draft.emergency_criteria.length} / 12
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {draft.emergency_criteria.map((criterion, index) => (
              <div
                key={`${index}-${criterion.slice(0, 18)}`}
                className="flex items-start justify-between gap-2 rounded-md border border-border-hairline bg-canvas px-3 py-2 text-sm text-ink-primary"
              >
                <span className="leading-snug">{criterion}</span>
                <button
                  type="button"
                  disabled={draft.emergency_criteria.length <= 1}
                  aria-label={`Hapus kriteria ${index + 1}`}
                  onClick={() => handleRemoveCriterion(index)}
                  className="mt-0.5 shrink-0 text-ink-muted transition-colors hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newCriterion}
              maxLength={180}
              placeholder="Tambahkan kriteria darurat operasional..."
              onChange={(e) => setNewCriterion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCriterion();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={!canAddCriterion}
              onClick={handleAddCriterion}
              className="shrink-0 border-border-strong text-brand hover:bg-brand-soft"
            >
              <Plus className="size-4" />
              <span>Tambah</span>
            </Button>
          </div>
          <p className="text-xs text-ink-muted">
            Minimal 1 kriteria darurat wajib dicantumkan untuk kejelasan eskalasi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
