"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { DigestCardItem, EmergencyReviewStatus } from "../types";

interface DigestCardRowProps {
  card: DigestCardItem;
  selectable: boolean;
  isSelected: boolean;
  canManage: boolean;
  canReviewEmergency: boolean;
  isDeleting: boolean;
  isReviewing: boolean;
  onToggleSelect: (cardId: string, checked: boolean) => void;
  onEdit: (card: DigestCardItem) => void;
  onDelete: (cardId: string) => void;
  onReviewEmergency: (
    cardId: string,
    status: Exclude<EmergencyReviewStatus, "PENDING">
  ) => void;
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

function getReviewMeta(status?: EmergencyReviewStatus) {
  if (status === "VALID_EMERGENCY") {
    return { label: "Darurat Valid", cls: "bg-safe-soft text-safe" };
  }
  if (status === "SHOULD_BE_QUEUED") {
    return {
      label: "Seharusnya Antrean Pagi",
      cls: "bg-danger-soft text-danger",
    };
  }
  return { label: "Menunggu Review", cls: "bg-warn-soft text-warn" };
}

export function DigestCardRow({
  card,
  selectable,
  isSelected,
  canManage,
  canReviewEmergency,
  isDeleting,
  isReviewing,
  onToggleSelect,
  onEdit,
  onDelete,
  onReviewEmergency,
}: DigestCardRowProps) {
  const isEmergency = card.triage_type === "EMERGENCY_OPS";
  const isDispatched = card.status === "DISPATCHED";
  const reviewStatus = card.emergency_review_status ?? "PENDING";
  const reviewMeta = getReviewMeta(reviewStatus);

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

          {isEmergency ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${reviewMeta.cls}`}
            >
              {reviewMeta.label}
            </span>
          ) : null}

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

      {isEmergency && canReviewEmergency ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            disabled={isReviewing || reviewStatus === "VALID_EMERGENCY"}
            onClick={() => onReviewEmergency(card.id, "VALID_EMERGENCY")}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-safe/30 bg-safe-soft px-3 py-1.5 text-xs font-medium text-safe transition-colors hover:bg-safe-soft/80 disabled:opacity-50"
          >
            {isReviewing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            )}
            <span>Tandai Darurat Valid</span>
          </button>

          <button
            type="button"
            disabled={isReviewing || reviewStatus === "SHOULD_BE_QUEUED"}
            onClick={() => onReviewEmergency(card.id, "SHOULD_BE_QUEUED")}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border-hairline bg-canvas px-3 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            <Clock className="h-3.5 w-3.5 text-danger" strokeWidth={1.5} aria-hidden="true" />
            <span>Seharusnya Antrean Pagi</span>
          </button>
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
