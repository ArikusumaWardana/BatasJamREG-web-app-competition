"use client";

import { Plus, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  DigestCardItem,
  DigestTabKey,
  EmergencyReviewStatus,
} from "../types";
import { DigestCardRow } from "./DigestCardRow";

interface DigestCardListTabProps {
  items: DigestCardItem[];
  tab: DigestTabKey;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  isAdmin: boolean;
  deselectedIds: Set<string>;
  deletingCardId: string | null;
  reviewingCardId: string | null;
  onRetry: () => void;
  onCreateNew: () => void;
  onToggleSelect: (cardId: string, checked: boolean) => void;
  onEdit: (card: DigestCardItem) => void;
  onDelete: (cardId: string) => void;
  onReviewEmergency: (
    cardId: string,
    status: Exclude<EmergencyReviewStatus, "PENDING">
  ) => void;
}

export function DigestCardListTab({
  items,
  tab,
  isLoading,
  error,
  userId,
  isAdmin,
  deselectedIds,
  deletingCardId,
  reviewingCardId,
  onRetry,
  onCreateNew,
  onToggleSelect,
  onEdit,
  onDelete,
  onReviewEmergency,
}: DigestCardListTabProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-border-hairline bg-surface p-5">
        <p className="text-sm text-danger">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border-hairline px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          <span>Coba Lagi</span>
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-strong bg-surface p-6">
        <p className="text-sm font-medium text-ink-primary">
          {tab === "MORNING_QUEUE"
            ? "Belum ada instruksi dalam antrean pagi."
            : tab === "EMERGENCY_OPS"
              ? "Tidak ada insiden darurat operasional aktif."
              : "Belum ada kartu yang ditandai terkirim."}
        </p>
        {tab !== "DISPATCHED" ? (
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-xs font-medium text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Tambah Instruksi Baru</span>
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((card) => (
        <DigestCardRow
          key={card.id}
          card={card}
          selectable={tab === "MORNING_QUEUE"}
          isSelected={!deselectedIds.has(card.id)}
          canManage={card.author_id === userId || isAdmin}
          canReviewEmergency={isAdmin}
          isDeleting={deletingCardId === card.id}
          isReviewing={reviewingCardId === card.id}
          onToggleSelect={onToggleSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onReviewEmergency={onReviewEmergency}
        />
      ))}
    </div>
  );
}
