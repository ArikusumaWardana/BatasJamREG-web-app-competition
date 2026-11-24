"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Copy, Eye } from "lucide-react";
import { setStoredActiveWorkspaceId } from "@/lib/storage/active-workspace";
import type { DivisionOverviewItem } from "../types";

interface OrgDivisionsMobileListProps {
  divisions: DivisionOverviewItem[];
  copiedId: string | null;
  onCopyCode: (div: DivisionOverviewItem) => void;
}

function formatShadowHours(hours: number): string {
  return `${hours.toFixed(1).replace(".", ",")} Jam`;
}

export function OrgDivisionsMobileList({
  divisions,
  copiedId,
  onCopyCode,
}: OrgDivisionsMobileListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {divisions.map((div) => {
        const isCopied = copiedId === div.id;
        return (
          <article
            key={div.id}
            className="flex flex-col gap-3 rounded-[18px] border border-stone-200/70 bg-canvas p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="truncate text-sm font-semibold text-ink-primary">
                    {div.name}
                  </h3>
                  {!div.is_joined ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border-hairline bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-secondary">
                      <Eye className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden="true" />
                      <span>Mode Pantau</span>
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Lead:{" "}
                  {div.team_leads.length > 0
                    ? div.team_leads.map((lead) => lead.full_name).join(", ")
                    : "Belum ditetapkan"}
                </p>
              </div>
              {div.latest_snapshot ? (
                <span className="shrink-0 rounded-full bg-warn-soft px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-warn">
                  {formatShadowHours(div.latest_snapshot.shadow_overtime_hours)}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-secondary">
                  Belum diaudit
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
              <span className="font-mono tabular-nums">
                {div.regular_hours_label}
              </span>
              <span className="font-mono tabular-nums">
                {div.member_count} Anggota
              </span>
              <span className="font-mono tabular-nums text-ink-primary">
                {div.invite_code}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onCopyCode(div)}
                className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-surface px-3 py-2 text-xs font-medium text-ink-primary hover:bg-surface-muted"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-safe" strokeWidth={1.75} aria-hidden="true" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
              <Link
                href={`/workspace?ws=${div.id}`}
                onClick={() => setStoredActiveWorkspaceId(div.id)}
                className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"
              >
                <span>Buka Divisi</span>
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
