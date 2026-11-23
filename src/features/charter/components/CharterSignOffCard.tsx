"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileSignature,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchCharterAcknowledgements,
  signWorkspaceCharter,
} from "../lib/charter-api";
import type { CharterAdoptionSummary } from "../types";

interface CharterSignOffCardProps {
  workspaceId: string;
  charterId: string;
  charterTitle?: string;
  version?: number;
  onSummaryChange?: (summary: CharterAdoptionSummary) => void;
}

function formatSignDate(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function CharterSignOffCard({
  workspaceId,
  charterId,
  charterTitle,
  version,
  onSummaryChange,
}: CharterSignOffCardProps) {
  const [summary, setSummary] = useState<CharterAdoptionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchCharterAcknowledgements(workspaceId, charterId).then((res) => {
      if (!active) return;
      if (res.ok) {
        setSummary(res.data);
        setErrorMsg(null);
        onSummaryChange?.(res.data);
      } else {
        setErrorMsg(res.message);
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [workspaceId, charterId, onSummaryChange]);

  async function handleReload() {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await fetchCharterAcknowledgements(workspaceId, charterId);
    if (res.ok) {
      setSummary(res.data);
      onSummaryChange?.(res.data);
    } else {
      setErrorMsg(res.message);
    }
    setIsLoading(false);
  }

  async function handleSign() {
    if (!summary || summary.has_signed || isSigning) return;
    setIsSigning(true);
    const res = await signWorkspaceCharter(workspaceId, charterId);
    setIsSigning(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    setSummary(res.data);
    onSummaryChange?.(res.data);
    toast.success("Piagam Jam Digital berhasil disetujui dan ditandatangani.");
  }

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border-hairline bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-brand">
            <FileSignature className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Persetujuan Digital Piagam</span>
          </div>
          <h2 className="mt-1 text-base font-semibold text-ink-primary">
            {charterTitle ?? "Piagam Jam Digital Aktif"}
            {version ? ` (v${version})` : ""}
          </h2>
        </div>

        {summary ? (
          <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums text-brand">
            {summary.signed_count}/{summary.total_members} Anggota Menyetujui (
            {summary.adoption_percentage}%)
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-md border border-border-hairline bg-canvas p-4 text-xs text-ink-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand" strokeWidth={1.5} aria-hidden="true" />
          <span>Memuat status persetujuan anggota...</span>
        </div>
      ) : errorMsg || !summary ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-hairline bg-canvas p-4">
          <div className="flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{errorMsg ?? "Data persetujuan belum tersedia."}</span>
          </div>
          <button
            type="button"
            onClick={() => void handleReload()}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-safe transition-all"
              style={{ width: `${summary.adoption_percentage}%` }}
            />
          </div>

          {summary.acknowledgements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {summary.acknowledgements.map((ack) => (
                <div
                  key={ack.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border-hairline bg-canvas px-2.5 py-1.5 text-xs"
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 text-safe"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-ink-primary">
                    {ack.full_name}
                  </span>
                  <span className="font-mono text-[11px] text-ink-secondary tabular-nums">
                    ({formatSignDate(ack.signed_at)})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-secondary">
              Belum ada anggota tim yang menandatangani versi piagam ini. Jadilah
              yang pertama menyetujui.
            </p>
          )}

          <button
            type="button"
            disabled={summary.has_signed || isSigning}
            onClick={() => void handleSign()}
            className={
              summary.has_signed
                ? "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-safe/30 bg-safe-soft px-4 py-2 text-sm font-medium text-safe disabled:opacity-90"
                : "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            }
          >
            {isSigning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                <span>Menyimpan Tanda Tangan...</span>
              </>
            ) : summary.has_signed ? (
              <>
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                <span>Sudah Anda Tandatangani</span>
              </>
            ) : (
              <>
                <FileSignature className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                <span>Setujui &amp; Tandatangani Piagam</span>
              </>
            )}
          </button>
        </>
      )}
    </article>
  );
}
