"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrgDivisionsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export function OrgDivisionsPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "divisi",
  onPageChange,
}: OrgDivisionsPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <nav
      aria-label={`Navigasi halaman daftar ${itemLabel}`}
      className="mt-4 flex flex-col gap-3 border-t border-border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="font-mono text-xs tabular-nums text-ink-secondary">
        Menampilkan {startItem}-{endItem} dari {totalItems} {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Halaman sebelumnya"
          className="inline-flex min-h-[38px] items-center gap-1 rounded-md border border-border-hairline bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          <span>Sebelumnya</span>
        </button>

        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Halaman ${page}`}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md border px-2.5 font-mono text-xs font-medium tabular-nums transition-colors ${
                isActive
                  ? "border-brand bg-brand text-white"
                  : "border-border-hairline bg-surface text-ink-primary hover:bg-surface-muted"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman berikutnya"
          className="inline-flex min-h-[38px] items-center gap-1 rounded-md border border-border-hairline bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Berikutnya</span>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
