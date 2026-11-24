"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Download, History, Loader2, LogIn, Save } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { createCharterSchema } from "@/lib/validations";
import { saveWorkspaceCharter } from "../lib/charter-api";
import { downloadCharterPdf } from "../lib/charter-pdf";
import type {
  CharterAdoptionSummary,
  CharterDraft,
  TeamCharterRecord,
} from "../types";
import { CharterFormPanel } from "./CharterFormPanel";
import { CharterLivePreview } from "./CharterLivePreview";
import { CharterSignOffCard } from "./CharterSignOffCard";

interface CharterBuilderTabProps {
  draft: CharterDraft;
  authStatus: "loading" | "authenticated" | "guest";
  workspaceId: string | null;
  savedCharters: TeamCharterRecord[];
  auditHandoffNote: string | null;
  onDraftChange: (nextDraft: CharterDraft) => void;
  onCharterSaved: (record: TeamCharterRecord) => void;
}

export function CharterBuilderTab({
  draft,
  authStatus,
  workspaceId,
  savedCharters,
  auditHandoffNote,
  onDraftChange,
  onCharterSaved,
}: CharterBuilderTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [adoptionSummary, setAdoptionSummary] =
    useState<CharterAdoptionSummary | null>(null);

  const activeSavedCharter =
    savedCharters.find((item) => item.is_active) ?? savedCharters[0] ?? null;

  const handleSummaryChange = useCallback((summary: CharterAdoptionSummary) => {
    setAdoptionSummary(summary);
  }, []);

  const isViewingActiveSavedCharter = Boolean(
    authStatus === "authenticated" &&
      workspaceId &&
      activeSavedCharter &&
      adoptionSummary &&
      (draft.version ?? activeSavedCharter.version) ===
        activeSavedCharter.version
  );

  const previewDraft: CharterDraft = isViewingActiveSavedCharter
    ? {
        ...draft,
        acknowledgements: adoptionSummary?.acknowledgements,
        total_members: adoptionSummary?.total_members,
      }
    : {
        ...draft,
        acknowledgements: undefined,
        total_members: undefined,
      };

  const validation = createCharterSchema.safeParse({
    title: draft.title,
    company_or_team_name: draft.company_or_team_name,
    quiet_hours_start: draft.quiet_hours_start,
    quiet_hours_end: draft.quiet_hours_end,
    non_urgent_sla_hours: draft.non_urgent_sla_hours,
    emergency_criteria: draft.emergency_criteria,
    baseline_shadow_hours: draft.baseline_shadow_hours,
  });
  const isDraftValid = validation.success;

  async function handleDownloadPdf() {
    if (!isDraftValid || isExporting) return;
    setIsExporting(true);
    try {
      const filename = await downloadCharterPdf(previewDraft);
      toast.success(`Piagam berhasil diunduh sebagai ${filename}.`);
    } catch {
      toast.error("Gagal membuat dokumen PDF piagam.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleSaveToWorkspace() {
    if (!isDraftValid || !workspaceId || isSaving) return;
    setIsSaving(true);
    const result = await saveWorkspaceCharter(workspaceId, draft);
    setIsSaving(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    setAdoptionSummary(null);
    onCharterSaved(result.data);
    toast.success(
      `Piagam versi ${result.data.version} berhasil disimpan ke workspace.`
    );
  }

  function handleSelectVersion(record: TeamCharterRecord) {
    onDraftChange({
      title: record.title,
      company_or_team_name: record.company_or_team_name,
      quiet_hours_start: record.quiet_hours_start,
      quiet_hours_end: record.quiet_hours_end,
      non_urgent_sla_hours: record.non_urgent_sla_hours,
      emergency_criteria:
        record.emergency_criteria.length > 0
          ? record.emergency_criteria
          : draft.emergency_criteria,
      baseline_shadow_hours: record.baseline_shadow_hours,
      version: record.version,
      effective_date: record.created_at,
      timezone: draft.timezone,
      organization_name: draft.organization_name,
      organization_stamp_url: draft.organization_stamp_url,
    });
    toast.success(`Memuat draf dari Piagam Versi ${record.version}.`);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <section className="flex min-w-0 flex-col gap-4 lg:col-span-5">
        <CharterFormPanel
          draft={draft}
          auditHandoffNote={auditHandoffNote}
          onChange={onDraftChange}
        />

        {authStatus === "authenticated" &&
        workspaceId &&
        activeSavedCharter ? (
          <CharterSignOffCard
            key={activeSavedCharter.id}
            workspaceId={workspaceId}
            charterId={activeSavedCharter.id}
            charterTitle={activeSavedCharter.title}
            version={activeSavedCharter.version}
            onSummaryChange={handleSummaryChange}
          />
        ) : null}

        {savedCharters.length > 0 ? (
          <div className="flex flex-col gap-2.5 rounded-[24px] border border-stone-200/80 bg-surface p-5 shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
              <History className="size-3.5 text-brand" />
              <span>Riwayat Versi Tersimpan ({savedCharters.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {savedCharters.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectVersion(item)}
                  className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-bento-canvas/60 px-3 py-1 font-mono text-xs text-ink-primary transition-colors hover:border-brand-border hover:bg-brand-soft"
                >
                  <span>v{item.version}</span>
                  {item.is_active ? (
                    <span className="text-[10px] text-safe">(Aktif)</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="flex min-w-0 flex-col gap-4 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-ink-secondary">
            Pratinjau Langsung Dokumen (A4)
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {authStatus === "authenticated" && workspaceId ? (
              <Button
                type="button"
                variant="outline"
                disabled={!isDraftValid || isSaving}
                onClick={handleSaveToWorkspace}
                className="rounded-full px-4"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                <span>Simpan ke Workspace</span>
              </Button>
            ) : (
              <Link
                href="/auth/login?next=/charter"
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-full px-4",
                })}
              >
                <LogIn className="size-4" />
                <span>Masuk untuk Simpan</span>
              </Link>
            )}

            <Button
              type="button"
              disabled={!isDraftValid || isExporting}
              onClick={handleDownloadPdf}
              className="rounded-full px-5"
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              <span>Unduh PDF</span>
            </Button>
          </div>
        </div>

        <CharterLivePreview draft={previewDraft} />
      </section>
    </div>
  );
}
