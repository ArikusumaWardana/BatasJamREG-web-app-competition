"use client";

import { useRef, useState } from "react";
import { ChevronDown, Database, Loader2, UploadCloud } from "lucide-react";

interface UploadDropzoneCardProps {
  isProcessing: boolean;
  sourceLabel: string | null;
  totalMessages: number | null;
  onSelectFile: (file: File) => void;
  onLoadDemo: () => void;
}

export function UploadDropzoneCard({
  isProcessing,
  sourceLabel,
  totalMessages,
  onSelectFile,
  onLoadDemo,
}: UploadDropzoneCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    const dropped = event.dataTransfer.files[0];
    if (dropped) {
      onSelectFile(dropped);
    }
  }

  return (
    <article className="flex flex-col justify-between gap-4 rounded-lg border border-border-hairline bg-surface p-5 lg:col-span-7">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!isProcessing) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-1 flex-col items-center justify-center gap-4 rounded-md border border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-brand bg-brand-soft/60"
            : "border-border-strong bg-canvas"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <UploadCloud className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          )}
        </div>

        <div className="flex max-w-md flex-col gap-1">
          <p className="text-base font-semibold text-ink-primary">
            Seret file ekspor WhatsApp (.txt Android atau .zip iOS)
          </p>
          {sourceLabel && totalMessages !== null ? (
            <div className="mt-1 inline-flex items-center justify-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-safe" aria-hidden="true" />
              <span className="font-mono text-xs tabular-nums text-ink-secondary">
                {sourceLabel} ({totalMessages.toLocaleString("id-ID")} pesan)
              </span>
            </div>
          ) : (
            <p className="text-xs text-ink-secondary">
              File dibaca langsung di memori browser melalui Web Worker tanpa
              mengirim satu byte pun ke server.
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".txt,.zip"
          className="sr-only"
          aria-label="Pilih file ekspor WhatsApp .txt atau .zip"
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            if (chosen) {
              onSelectFile(chosen);
              event.target.value = "";
            }
          }}
        />

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-border-hairline bg-surface px-3.5 py-2 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            <span>{sourceLabel ? "Pilih File Lain" : "Pilih File Lokal"}</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={onLoadDemo}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-brand-border bg-brand-soft px-3.5 py-2 text-sm font-medium text-brand transition-colors hover:bg-surface disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>Memproses Audit...</span>
              </>
            ) : (
              <>
                <Database className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>Muat Dataset Simulasi 90 Hari</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-border-hairline pt-2.5">
        <button
          type="button"
          aria-expanded={guideOpen}
          onClick={() => setGuideOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2 rounded py-1 text-left text-xs font-medium text-ink-secondary hover:text-ink-primary"
        >
          <span>Panduan 3 Langkah Ekspor Chat Tanpa Media</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${
              guideOpen ? "rotate-180" : ""
            }`}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
        {guideOpen ? (
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-ink-secondary">
            <li>Buka grup kerja atau chat proyek di aplikasi WhatsApp.</li>
            <li>Ketuk menu Lainnya (ikon titik tiga / info grup) lalu pilih Ekspor Chat.</li>
            <li>Pilih Tanpa Media untuk menghasilkan file .txt atau arsip .zip ringan.</li>
          </ol>
        ) : null}
      </div>
    </article>
  );
}
