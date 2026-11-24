"use client";

import { useRef, useState } from "react";
import { Loader2, Stamp, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { BENTO_CARD_CLS } from "@/components/shared/BentoPrimitives";
import { DigitalStampSvg } from "@/components/shared/DigitalStampSvg";
import {
  deleteOrganizationStamp,
  uploadOrganizationStamp,
} from "../lib/organization-stamp-api";

interface OrgStampCardProps {
  organizationId: string;
  organizationName: string;
  stampUrl: string | null;
  onStampUpdated: (nextStampUrl: string | null) => void;
}

const MAX_STAMP_BYTES = 1_048_576;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/webp"]);

export function OrgStampCard({
  organizationId,
  organizationName,
  stampUrl,
  onStampUpdated,
}: OrgStampCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isBusy = isUploading || isDeleting;
  const inputId = `org-stamp-input-${organizationId}`;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      toast.error("Format file harus PNG atau WebP.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_STAMP_BYTES) {
      toast.error("Ukuran berkas stempel maksimal 1 MB.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile || isBusy) return;
    setIsUploading(true);
    const res = await uploadOrganizationStamp(organizationId, selectedFile);
    setIsUploading(false);

    if (!res.ok) {
      toast.error(res.errorMsg);
      return;
    }

    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onStampUpdated(res.stampUrl);
    toast.success("Stempel perusahaan berhasil diperbarui.");
  }

  async function handleDelete() {
    if (!stampUrl || isBusy) return;
    setIsDeleting(true);
    const res = await deleteOrganizationStamp(organizationId);
    setIsDeleting(false);

    if (!res.ok) {
      toast.error(res.errorMsg);
      return;
    }

    onStampUpdated(null);
    toast.success("Stempel dikembalikan ke stempel default otomatis.");
  }

  return (
    <section
      aria-label="Identitas dan Stempel Perusahaan"
      className={`flex h-full flex-col justify-between gap-4 ${BENTO_CARD_CLS}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-brand">
            <Stamp className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>Identitas Dokumen Resmi</span>
          </div>
          <h2 className="mt-1 text-base font-semibold text-ink-primary">
            Identitas &amp; Stempel Perusahaan
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
            Ditampilkan otomatis pada piagam /charter dan ekspor PDF.
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            stampUrl
              ? "bg-safe-soft text-safe"
              : "bg-brand-soft text-brand"
          }`}
        >
          {stampUrl ? "Stempel Kustom Aktif" : "Stempel Default Otomatis"}
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex min-h-[108px] items-center justify-center rounded-[18px] border border-stone-200/80 bg-white p-4">
          {stampUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={stampUrl}
              alt={`Stempel resmi ${organizationName}`}
              crossOrigin="anonymous"
              className="pointer-events-none max-h-[80px] w-auto -rotate-6 object-contain opacity-85 mix-blend-multiply select-none"
            />
          ) : (
            <DigitalStampSvg
              organizationName={organizationName}
              className="pointer-events-none h-[84px] w-[84px] shrink-0 -rotate-6 opacity-85 select-none"
            />
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <label
              htmlFor={inputId}
              className="text-xs font-medium text-ink-primary"
            >
              Berkas Stempel (PNG atau WebP, maks 1 MB)
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/png,image/webp"
              disabled={isBusy}
              onChange={handleFileChange}
              className="block w-full rounded-xl border border-stone-200 bg-canvas px-3 py-2 text-xs text-ink-primary file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-xs file:font-medium file:text-brand disabled:opacity-50"
            />
            <p className="truncate text-[11px] text-ink-secondary">
              {selectedFile
                ? `Dipilih: ${selectedFile.name}`
                : "Disarankan gambar berlatar transparan."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!selectedFile || isBusy}
              onClick={() => void handleUpload()}
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Upload className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              )}
              <span>{isUploading ? "Mengunggah..." : "Unggah Stempel"}</span>
            </button>

            <button
              type="button"
              disabled={!stampUrl || isBusy}
              onClick={() => void handleDelete()}
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 shrink-0 text-danger" strokeWidth={1.5} aria-hidden="true" />
              )}
              <span>{isDeleting ? "Menghapus..." : "Hapus / Pakai Default"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
