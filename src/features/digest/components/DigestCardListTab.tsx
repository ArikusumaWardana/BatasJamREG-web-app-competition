"use client";

import { useMemo, useState } from "react";
import { Calendar, Plus, RefreshCw, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgDivisionsPagination } from "@/features/organization/components/OrgDivisionsPagination";
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
  selectedEmergencyCardId?: string | null;
  deletingCardId: string | null;
  reviewingCardId: string | null;
  onRetry: () => void;
  onCreateNew: () => void;
  onToggleSelect: (cardId: string, checked: boolean) => void;
  onSelectEmergencyCard?: (cardId: string) => void;
  onCopyEmergencyCard?: (card: DigestCardItem) => void;
  onEdit: (card: DigestCardItem) => void;
  onDelete: (cardId: string) => void;
  onReviewEmergency: (
    cardId: string,
    status: Exclude<EmergencyReviewStatus, "PENDING">
  ) => void;
}

const DIGEST_PAGE_SIZE = 3;

function getCardDateYmd(card: DigestCardItem, tab: DigestTabKey): string {
  if (tab === "DISPATCHED" && card.dispatched_at) {
    const dt = new Date(card.dispatched_at);
    if (!Number.isNaN(dt.getTime())) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
      }).format(dt);
    }
  }
  return card.scheduled_for.slice(0, 10);
}

export function DigestCardListTab({
  items,
  tab,
  isLoading,
  error,
  userId,
  isAdmin,
  deselectedIds,
  selectedEmergencyCardId = null,
  deletingCardId,
  reviewingCardId,
  onRetry,
  onCreateNew,
  onToggleSelect,
  onSelectEmergencyCard,
  onCopyEmergencyCard,
  onEdit,
  onDelete,
  onReviewEmergency,
}: DigestCardListTabProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!selectedDate) return items;
    return items.filter((card) => getCardDateYmd(card, tab) === selectedDate);
  }, [items, selectedDate, tab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / DIGEST_PAGE_SIZE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (safePage - 1) * DIGEST_PAGE_SIZE,
    safePage * DIGEST_PAGE_SIZE
  );

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

  const filterInputId = `digest-date-filter-${tab.toLowerCase()}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-fit flex-wrap items-center gap-2.5 self-start rounded-lg border border-border-hairline bg-surface px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <Calendar className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} aria-hidden="true" />
          <label htmlFor={filterInputId} className="font-medium text-ink-primary">
            Filter Tanggal:
          </label>
        </div>

        <input
          id={filterInputId}
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-md border border-border-hairline bg-canvas px-2.5 font-mono text-xs text-ink-primary focus:border-brand focus:outline-none"
        />
        {selectedDate ? (
          <button
            type="button"
            onClick={() => {
              setSelectedDate("");
              setCurrentPage(1);
            }}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-border-hairline bg-surface px-2.5 py-1 text-xs font-medium text-ink-primary hover:bg-surface-muted"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>Semua Tanggal</span>
          </button>
        ) : null}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-hairline bg-surface p-6 text-center">
          <p className="text-sm font-medium text-ink-primary">
            Tidak ada kartu pada tanggal{" "}
            <span className="font-mono">{selectedDate}</span>.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedDate("");
              setCurrentPage(1);
            }}
            className="inline-flex min-h-[36px] items-center rounded-md border border-border-hairline bg-canvas px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-muted"
          >
            Tampilkan Semua Tanggal
          </button>
        </div>
      ) : (
        <>
          {paginatedItems.map((card) => (
            <DigestCardRow
              key={card.id}
              card={card}
              selectable={tab === "MORNING_QUEUE"}
              isSelected={!deselectedIds.has(card.id)}
              isPreviewSelected={
                tab === "EMERGENCY_OPS" && selectedEmergencyCardId === card.id
              }
              canManage={card.author_id === userId || isAdmin}
              canReviewEmergency={isAdmin}
              isDeleting={deletingCardId === card.id}
              isReviewing={reviewingCardId === card.id}
              onToggleSelect={onToggleSelect}
              onSelectPreview={
                tab === "EMERGENCY_OPS" ? onSelectEmergencyCard : undefined
              }
              onCopyEmergency={
                tab === "EMERGENCY_OPS" ? onCopyEmergencyCard : undefined
              }
              onEdit={onEdit}
              onDelete={onDelete}
              onReviewEmergency={onReviewEmergency}
            />
          ))}

          <OrgDivisionsPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            pageSize={DIGEST_PAGE_SIZE}
            itemLabel="kartu"
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
