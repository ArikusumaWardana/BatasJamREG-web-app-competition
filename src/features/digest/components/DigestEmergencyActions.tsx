"use client";

import { CheckCircle2, Clock, Copy, Eye, Loader2 } from "lucide-react";
import type { DigestCardItem, EmergencyReviewStatus } from "../types";

interface DigestEmergencyActionsProps {
  card: DigestCardItem;
  isPreviewSelected: boolean;
  canReviewEmergency: boolean;
  isReviewing: boolean;
  onSelectPreview: (cardId: string) => void;
  onCopyEmergency: (card: DigestCardItem) => void;
  onReviewEmergency: (
    cardId: string,
    status: Exclude<EmergencyReviewStatus, "PENDING">
  ) => void;
}

export function DigestEmergencyActions({
  card,
  isPreviewSelected,
  canReviewEmergency,
  isReviewing,
  onSelectPreview,
  onCopyEmergency,
  onReviewEmergency,
}: DigestEmergencyActionsProps) {
  const reviewStatus = card.emergency_review_status ?? "PENDING";

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCopyEmergency(card);
        }}
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-danger/30 bg-danger-soft px-3.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/15"
      >
        <Copy className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>Salin Pesan WA</span>
      </button>

      <button
        type="button"
        aria-pressed={isPreviewSelected}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPreview(card.id);
        }}
        className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
          isPreviewSelected
            ? "border-danger bg-danger text-white"
            : "border-stone-200 bg-surface text-ink-primary hover:bg-surface-muted"
        }`}
      >
        <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>{isPreviewSelected ? "Sedang Dipratinjau" : "Pratinjau"}</span>
      </button>

      {canReviewEmergency ? (
        <>
          <button
            type="button"
            disabled={isReviewing || reviewStatus === "VALID_EMERGENCY"}
            onClick={(e) => {
              e.stopPropagation();
              onReviewEmergency(card.id, "VALID_EMERGENCY");
            }}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-safe/30 bg-safe-soft px-3.5 py-1.5 text-xs font-medium text-safe transition-colors hover:bg-safe-soft/80 disabled:opacity-50"
          >
            {isReviewing ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            )}
            <span>Tandai Darurat Valid</span>
          </button>

          <button
            type="button"
            disabled={isReviewing || reviewStatus === "SHOULD_BE_QUEUED"}
            onClick={(e) => {
              e.stopPropagation();
              onReviewEmergency(card.id, "SHOULD_BE_QUEUED");
            }}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-stone-200 bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            <Clock className="h-3.5 w-3.5 shrink-0 text-danger" strokeWidth={1.5} aria-hidden="true" />
            <span>Seharusnya Antrean Pagi</span>
          </button>
        </>
      ) : null}
    </div>
  );
}
