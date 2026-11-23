"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import { setStoredActiveWorkspaceId } from "@/lib/storage/active-workspace";
import type { DivisionOverviewItem } from "../types";
import { OrgDivisionsMobileList } from "./OrgDivisionsMobileList";

interface OrgDivisionsTableProps {
  divisions: DivisionOverviewItem[];
  onCreateDivision: () => void;
}

function formatShadowHours(hours: number): string {
  return `${hours.toFixed(1).replace(".", ",")} Jam`;
}

export function OrgDivisionsTable({
  divisions,
  onCreateDivision,
}: OrgDivisionsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopyCode(div: DivisionOverviewItem) {
    try {
      await navigator.clipboard.writeText(div.invite_code);
      setCopiedId(div.id);
      toast.success(`Kode undangan ${div.invite_code} (${div.name}) disalin.`);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === div.id ? null : prev));
      }, 1800);
    } catch {
      toast.error("Gagal menyalin kode undangan divisi.");
    }
  }

  return (
    <section
      aria-label="Daftar seluruh divisi perusahaan"
      className="rounded-lg border border-border-hairline bg-surface p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            Semua Divisi di Tempat Kerja
          </h2>
          <p className="text-xs text-ink-secondary">
            Bandingkan jam reguler, jumlah anggota, Team Lead, dan lembur
            bayangan terakhir tiap divisi.
          </p>
        </div>
        <span className="rounded-full border border-border-hairline bg-canvas px-2.5 py-0.5 font-mono text-xs tabular-nums text-ink-secondary">
          {divisions.length} Divisi
        </span>
      </div>

      {divisions.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-hairline bg-canvas p-6 text-center">
          <p className="text-sm font-medium text-ink-primary">
            Belum ada divisi terdaftar di organisasi ini.
          </p>
          <p className="mt-1 text-xs text-ink-secondary">
            Buat divisi pertama agar anggota dapat bergabung menggunakan kode
            undangan.
          </p>
          <button
            type="button"
            onClick={onCreateDivision}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Buat Divisi Pertama
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-hairline text-xs font-medium text-ink-secondary">
                  <th className="py-2.5 pr-4">Divisi &amp; Team Lead</th>
                  <th className="px-4 py-2.5">Jam Reguler</th>
                  <th className="px-4 py-2.5">Anggota</th>
                  <th className="px-4 py-2.5">Lembur Bayangan Terakhir</th>
                  <th className="px-4 py-2.5">Kode Undangan</th>
                  <th className="py-2.5 pl-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {divisions.map((div) => {
                  const isCopied = copiedId === div.id;
                  return (
                    <tr key={div.id} className="align-middle">
                      <td className="py-3.5 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-ink-primary">
                            {div.name}
                          </p>
                          {!div.is_joined ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border-hairline bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                              <Eye
                                className="h-3 w-3"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                              <span>Mode Pantau</span>
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-ink-secondary">
                          Lead:{" "}
                          {div.team_leads.length > 0
                            ? div.team_leads
                                .map((lead) => lead.full_name)
                                .join(", ")
                            : "Belum ditetapkan"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-ink-primary">
                        {div.regular_hours_label}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-ink-primary">
                        {div.member_count} orang
                      </td>
                      <td className="px-4 py-3.5">
                        {div.latest_snapshot ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex w-fit items-center rounded-full bg-warn-soft px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-warn">
                              {formatShadowHours(
                                div.latest_snapshot.shadow_overtime_hours
                              )}
                            </span>
                            <span className="text-[11px] text-ink-secondary">
                              {div.latest_snapshot.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-secondary">
                            Belum ada snapshot
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded border border-border-hairline bg-canvas px-2 py-1 font-mono text-xs font-medium tracking-wide tabular-nums text-ink-primary">
                            {div.invite_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleCopyCode(div)}
                            aria-label={`Salin kode undangan ${div.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-hairline bg-surface text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink-primary"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-safe" strokeWidth={1.75} aria-hidden="true" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <Link
                          href={`/workspace?ws=${div.id}`}
                          onClick={() => setStoredActiveWorkspaceId(div.id)}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted"
                        >
                          <span>Buka Divisi</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-brand" strokeWidth={1.5} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <OrgDivisionsMobileList
            divisions={divisions}
            copiedId={copiedId}
            onCopyCode={(div) => void handleCopyCode(div)}
          />
        </>
      )}
    </section>
  );
}
