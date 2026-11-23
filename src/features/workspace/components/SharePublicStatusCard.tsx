"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  buildPublicStatusUrl,
  generateWhatsAppBioVariants,
} from "../lib/wa-bio-generator";
import type { WorkspaceDetail } from "../types";

interface SharePublicStatusCardProps {
  workspace: WorkspaceDetail;
}

const subscribeNoop = () => () => {};

export function SharePublicStatusCard({
  workspace,
}: SharePublicStatusCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const origin = useSyncExternalStore(
    subscribeNoop,
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    () => ""
  );

  const relativeUrl = `/status/${workspace.slug}`;
  const fullUrl = buildPublicStatusUrl(workspace.slug, origin);
  const variants = generateWhatsAppBioVariants({
    workspace_name: workspace.name,
    slug: workspace.slug,
    work_start_time: workspace.work_start_time,
    work_end_time: workspace.work_end_time,
    digest_dispatch_time: workspace.digest_dispatch_time,
    timezone: workspace.timezone,
    work_days: workspace.work_days,
    origin,
  });

  async function copyText(key: string, text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(successMessage);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    } catch {
      toast.error("Gagal menyalin ke clipboard.");
    }
  }

  return (
    <article
      aria-label="Bagikan Status Jam Kerja dan Bio WhatsApp"
      className="flex flex-col gap-4 rounded-lg border border-border-hairline bg-surface p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-brand">
            <Share2 className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>Status Publik &amp; Bio WhatsApp</span>
          </div>
          <h2 className="mt-1 text-base font-semibold text-ink-primary">
            Bagikan Status Jam Kerja
          </h2>
          <p className="mt-0.5 text-xs text-ink-secondary">
            Tautan publik tanpa login untuk klien dan rekan kerja, beserta
            pilihan bio WhatsApp 1-klik.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-border-hairline bg-canvas p-3">
        <span className="text-[11px] font-medium text-ink-secondary">
          Tautan Halaman Publik Divisi
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 truncate rounded border border-border-hairline bg-surface px-2.5 py-2 font-mono text-xs text-ink-primary">
            {fullUrl}
          </code>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void copyText(
                  "link",
                  fullUrl,
                  "Tautan halaman status publik disalin."
                )
              }
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted"
            >
              {copiedKey === "link" ? (
                <Check className="h-3.5 w-3.5 text-safe" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              )}
              <span>{copiedKey === "link" ? "Tersalin" : "Salin Tautan"}</span>
            </button>
            <Link
              href={relativeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover"
            >
              <span>Buka Halaman</span>
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-medium text-ink-secondary">
          Generator Bio Info / About WhatsApp (3 Variasi)
        </span>
        {variants.map((variant) => {
          const isCopied = copiedKey === variant.id;
          return (
            <div
              key={variant.id}
              className="flex flex-col gap-2 rounded-md border border-border-hairline bg-canvas p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink-primary">
                  {variant.label}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-ink-secondary">
                  {variant.char_count} karakter
                </span>
              </div>
              <p className="text-xs leading-relaxed text-ink-secondary">
                {variant.text}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    void copyText(
                      variant.id,
                      variant.text,
                      `Bio WhatsApp "${variant.label}" disalin ke clipboard.`
                    )
                  }
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted"
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-safe" strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  )}
                  <span>{isCopied ? "Tersalin" : "Salin Bio"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
