"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clock,
  Copy,
  Loader2,
  MessageSquareText,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatTimeHHMM,
  getTimezoneShortLabel,
} from "@/lib/constants/work-hours";
import { formatMorningDigestWhatsApp } from "../lib/wa-formatter";
import type { DigestCardItem } from "../types";

interface DigestFormatterPanelProps {
  workspaceId: string | null;
  workspaceName: string;
  timezone: string;
  dispatchTime: string;
  queuedCards: DigestCardItem[];
  selectedCards: DigestCardItem[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDispatched: () => void;
}

export function DigestFormatterPanel({
  workspaceId,
  workspaceName,
  timezone,
  dispatchTime,
  queuedCards,
  selectedCards,
  onSelectAll,
  onClearSelection,
  onDispatched,
}: DigestFormatterPanelProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const previewText = formatMorningDigestWhatsApp({
    workspaceName,
    timezone,
    cards: selectedCards,
  });

  const hasSelection = selectedCards.length > 0;

  async function handleCopyOnly() {
    if (!hasSelection || !previewText || isDispatching) return;
    try {
      await navigator.clipboard.writeText(previewText);
      setCopied(true);
      toast.success("Teks Morning Digest disalin ke clipboard.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Gagal menyalin teks ke clipboard.");
    }
  }

  async function handleDispatch() {
    if (!workspaceId || !hasSelection || isDispatching) return;

    setIsDispatching(true);
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/digest-cards/dispatch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            card_ids: selectedCards.map((item) => item.id),
          }),
        }
      );

      const payload = (await response.json()) as {
        success?: boolean;
        data?: {
          dispatched_count: number;
          whatsapp_formatted_text: string;
        };
        error?: { message?: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        toast.error(
          payload.error?.message ?? "Gagal menandai kartu sebagai terkirim."
        );
        return;
      }

      try {
        await navigator.clipboard.writeText(
          payload.data.whatsapp_formatted_text
        );
      } catch {
        // Tetap lanjutkan feedback dispatch bila izin clipboard ditolak
      }

      toast.success(
        `${payload.data.dispatched_count} kartu dipindahkan ke Sudah Terkirim dan teks disalin.`
      );
      onDispatched();
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat mengirim Morning Digest.");
    } finally {
      setIsDispatching(false);
    }
  }

  const dispatchTimeLabel = `${formatTimeHHMM(dispatchTime)} ${getTimezoneShortLabel(timezone)}`;

  return (
    <aside className="lg:col-span-4 lg:sticky lg:top-8">
      <article className="flex flex-col gap-4 rounded-lg border border-brand-border bg-surface p-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-brand">
            Generator Morning Digest
          </span>
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink-primary">
              Format Morning Digest
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums text-brand">
                {selectedCards.length} Kartu Dipilih
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-soft px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums text-brand">
                <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>Jadwal {dispatchTimeLabel}</span>
              </span>
            </div>

            {queuedCards.length > 0 ? (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="font-medium text-brand hover:underline"
                >
                  Pilih Semua
                </button>
                <span className="text-border-strong">/</span>
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="text-ink-secondary hover:text-ink-primary"
                >
                  Kosongkan
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-md border border-border-hairline bg-surface-subtle p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-primary">
          {previewText ||
            "Pilih minimal satu kartu pada tab Antrean Pagi untuk melihat pratinjau pesan WhatsApp."}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!hasSelection || isDispatching}
            onClick={handleCopyOnly}
            className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-md border border-border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 shrink-0 text-safe" strokeWidth={1.5} aria-hidden="true" />
                <span>Teks Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
                <span>Salin Format Digest</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!hasSelection || isDispatching || !workspaceId}
            onClick={handleDispatch}
            className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            {isDispatching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>Mengirim Digest...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>Tandai Terkirim (Dispatch)</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs leading-relaxed text-ink-secondary">
          Menandai terkirim memindahkan kartu terpilih ke tab Sudah Terkirim
          secara realtime untuk seluruh anggota tim.
        </p>
      </article>
    </aside>
  );
}
