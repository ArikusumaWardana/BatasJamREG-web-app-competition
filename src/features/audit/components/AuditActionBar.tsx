"use client";

import { Calculator, FileText, Save } from "lucide-react";

interface AuditActionBarProps {
  hasResult: boolean;
  onSendToSimulator: () => void;
  onSendToCharter: () => void;
  onOpenSaveDialog: () => void;
}

export function AuditActionBar({
  hasResult,
  onSendToSimulator,
  onSendToCharter,
  onOpenSaveDialog,
}: AuditActionBarProps) {
  return (
    <section
      aria-label="Tindakan Lanjutan Hasil Audit"
      className="flex flex-col justify-between gap-3 rounded-[24px] border border-stone-200/80 bg-surface p-5 shadow-[0_1px_2px_rgba(28,25,23,0.03)] lg:flex-row lg:items-center"
    >
      <p className="text-sm text-ink-secondary">
        Gunakan angka agregat ini untuk langkah berikutnya (tanpa teks chat):
      </p>

      <div className="flex flex-wrap items-center gap-2.5 lg:flex-nowrap">
        <button
          type="button"
          disabled={!hasResult}
          onClick={onSendToSimulator}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-stone-200 bg-surface px-4 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
        >
          <Calculator className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
          <span>Kirim ke Simulator Biaya</span>
        </button>

        <button
          type="button"
          disabled={!hasResult}
          onClick={onSendToCharter}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-stone-200 bg-surface px-4 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
        >
          <FileText className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
          <span>Buat Piagam Tim</span>
        </button>

        <button
          type="button"
          disabled={!hasResult}
          onClick={onOpenSaveDialog}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          <Save className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span>Simpan Snapshot Anonim</span>
        </button>
      </div>
    </section>
  );
}
