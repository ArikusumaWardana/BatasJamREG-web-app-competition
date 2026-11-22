"use client";

import { AlertTriangle, Loader2, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { DigestCardItem } from "../types";

interface DigestCardRowProps {
  card: DigestCardItem;
  selectable: boolean;
  isSelected: boolean;
  canManage: boolean;
  isDeleting: boolean;
  onToggleSelect: (cardId: string, checked: boolean) => void;
  onEdit: (card: DigestCardItem) => void;
  onDelete: (cardId: string) => void;
}

function formatShortTimestamp(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function DigestCardRow({
  card,
  selectable,
  isSelected,
  canManage,
  isDeleting,
  onToggleSelect,
  onEdit,
  onDelete,
}: DigestCardRowProps) {
  const isEmergency = card.triage_type === "EMERGENCY_OPS";
  const isDispatched = card.status === "DISPATCHED";

  const badgeStyle = isDispatched
    ? "bg-safe-soft text-safe"
    : isEmergency
      ? "bg-danger-soft text-danger"
      : "bg-brand-soft text-brand";

  const badgeLabel = isDispatched
    ? "Sudah Terkirim"
    : isEmergency
      ? "Darurat Operasional"
      : "Antrean Pagi";

  return (
    <article className="flex flex-col gap-2.5 rounded-lg border border-border-hairline bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {selectable ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onToggleSelect(card.id, Boolean(checked))
              }
              aria-label={`Pilih instruksi ${card.title}`}
            />
          ) : null}

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badgeStyle}`}
          >
            {badgeLabel}
          </span>

          <span className="inline-flex items-center rounded-full border border-border-hairline bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary">
            {card.recipient_label}
          </span>
        </div>

        {canManage ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onEdit(card)}
              aria-label={`Ubah instruksi ${card.title}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink-primary disabled:opacity-50"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(card.id)}
              aria-label={`Hapus instruksi ${card.title}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-secondary transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
        ) : null}
      </div>

      <h2 className="text-base font-semibold leading-snug text-ink-primary">
        {card.title}
      </h2>

      <p className="text-sm leading-relaxed text-ink-secondary">{card.body}</p>

      {isEmergency && card.emergency_reason ? (
        <div className="flex items-start gap-2 rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span>
            <strong className="font-semibold">Alasan Darurat:</strong>{" "}
            {card.emergency_reason}
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline pt-2 font-mono text-[11px] tabular-nums text-ink-secondary">
        <span>
          Ditulis oleh {card.author_name} - {formatShortTimestamp(card.created_at)}
        </span>
        <span>
          {isDispatched && card.dispatched_at
            ? `Terkirim: ${formatShortTimestamp(card.dispatched_at)}`
            : `Target: ${card.scheduled_for}`}
        </span>
      </div>
    </article>
  );
}
