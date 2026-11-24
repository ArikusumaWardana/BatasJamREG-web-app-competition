"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatEmergencyWhatsAppMessage } from "../lib/wa-formatter";
import type { DigestCardItem } from "../types";

interface EmergencyWhatsAppPreviewProps {
  workspaceName: string;
  card: DigestCardItem | null;
}

export function EmergencyWhatsAppPreview({
  workspaceName,
  card,
}: EmergencyWhatsAppPreviewProps) {
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const previewText = card
    ? formatEmergencyWhatsAppMessage(card, workspaceName)
    : "";
  const isCopied = Boolean(card && copiedCardId === card.id);
  const picLabel = card?.recipient_label?.trim() || "Tim terkait";

  async function handleCopyEmergency() {
    if (!card || !previewText) return;
    try {
      await navigator.clipboard.writeText(previewText);
      const targetId = card.id;
      setCopiedCardId(targetId);
      toast.success("Pesan darurat WhatsApp berhasil disalin");
      window.setTimeout(() => {
        setCopiedCardId((prev) => (prev === targetId ? null : prev));
      }, 1800);
    } catch {
      toast.error("Gagal menyalin pesan darurat ke clipboard.");
    }
  }

  return (
    <aside className="min-w-0 lg:col-span-5 lg:sticky lg:top-8">
      <article className="flex flex-col gap-4 rounded-[24px] border border-danger/30 bg-surface p-6 shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-danger">
            Jalur Darurat Operasional
          </span>
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-danger"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold leading-snug text-ink-primary">
              Pratinjau Pesan Darurat (Kirim Segera)
            </h2>
          </div>

          {card ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center rounded-full bg-danger-soft px-3 py-0.5 text-xs font-medium text-danger">
                PIC: {picLabel}
              </span>
              <span className="max-w-full truncate text-xs text-ink-secondary">
                {card.title}
              </span>
            </div>
          ) : null}
        </div>

        {card && previewText ? (
          <div className="max-h-72 overflow-y-auto rounded-2xl border border-danger/20 bg-danger-soft/40 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-primary">
            {previewText}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-danger/25 bg-danger-soft/30 p-4 text-xs leading-relaxed text-ink-secondary">
            Belum ada kartu darurat operasional yang aktif untuk dipratinjau.
            Pilih atau tambahkan kartu darurat terlebih dahulu untuk membuat
            pesan WhatsApp cepat.
          </div>
        )}

        <button
          type="button"
          disabled={!card || !previewText}
          onClick={handleCopyEmergency}
          className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full bg-danger px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Pesan Darurat Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Salin Pesan WA</span>
            </>
          )}
        </button>

        <p className="text-xs leading-relaxed text-ink-secondary">
          Pesan darurat dikirim segera ke PIC terkait melalui WhatsApp dan
          tidak digabung ke dalam antrean rangkuman pagi massal.
        </p>
      </article>
    </aside>
  );
}
