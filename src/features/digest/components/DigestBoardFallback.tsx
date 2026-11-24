"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";

interface DigestBoardFallbackProps {
  wsLoading: boolean;
  wsError: string | null;
}

export function DigestBoardFallback({
  wsLoading,
  wsError,
}: DigestBoardFallbackProps) {
  if (wsLoading) {
    return (
      <PageLoadingOverlay
        variant="panel"
        message="Sedang memuat papan Morning Digest..."
      />
    );
  }

  if (wsError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[24px] border border-stone-200/80 bg-surface p-6 shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-base font-semibold">Gagal Memuat Papan Digest</h1>
        </div>
        <p className="text-sm text-ink-secondary">{wsError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-[24px] border border-stone-200/80 bg-surface p-6 shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
      <h1 className="text-xl font-bold text-ink-primary">
        Belum Ada Workspace Aktif
      </h1>
      <p className="mt-2 text-sm text-ink-secondary">
        Bergabung ke workspace atau buat tim baru terlebih dahulu di halaman
        Ringkasan Tim sebelum mengelola Morning Digest.
      </p>
      <Link
        href="/workspace"
        className="mt-4 inline-flex min-h-[40px] items-center rounded-full bg-brand px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-hover"
      >
        Buka Ringkasan Tim
      </Link>
    </div>
  );
}
