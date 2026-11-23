"use client";

import { useMemo, useState } from "react";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { DivisionOverviewItem } from "../types";
import { OrgDivisionsPagination } from "./OrgDivisionsPagination";
import { OrgDivisionsSearchBar } from "./OrgDivisionsSearchBar";
import { OrgWellbeingMobileList } from "./OrgWellbeingMobileList";

interface OrgWellbeingComparisonProps {
  divisions: DivisionOverviewItem[];
}

const WELLBEING_PAGE_SIZE = 5;

function formatNumberId(val: number): string {
  return val.toFixed(1).replace(".", ",");
}

export function OrgWellbeingComparison({
  divisions,
}: OrgWellbeingComparisonProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const filteredDivisions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return divisions;
    return divisions.filter((div) => {
      const gradeLabel = div.boundary_score
        ? `grade ${div.boundary_score.grade} ${div.boundary_score.status_label}`
        : "";
      const haystack = `${div.name} ${gradeLabel}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [divisions, debouncedQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDivisions.length / WELLBEING_PAGE_SIZE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDivisions = filteredDivisions.slice(
    (safePage - 1) * WELLBEING_PAGE_SIZE,
    safePage * WELLBEING_PAGE_SIZE
  );

  return (
    <section
      aria-label="Perbandingan lembur bayangan dan kesejahteraan mental antar divisi"
      className="rounded-lg border border-border-hairline bg-surface p-5"
    >
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-brand">
            <HeartPulse className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Tata Kelola &amp; Kesejahteraan Lintas Divisi</span>
          </div>
          <h2 className="mt-1 text-base font-semibold text-ink-primary">
            Lembur Bayangan vs Kesejahteraan Mental &amp; Tata Kelola
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {divisions.length > 0 ? (
            <OrgDivisionsSearchBar
              inputId="org-wellbeing-search"
              placeholder="Cari divisi atau grade (A-F)..."
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              onClear={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
            />
          ) : null}

          <span className="inline-flex items-center gap-1.5 rounded-full border border-safe/25 bg-safe-soft px-2.5 py-1 text-[11px] font-medium text-safe">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>K-Anonymity Aktif (Minimal 3 Responden)</span>
          </span>
        </div>
      </div>

      {divisions.length === 0 ? (
        <p className="rounded-md border border-border-hairline bg-canvas p-4 text-xs text-ink-secondary">
          Belum ada divisi untuk dibandingkan.
        </p>
      ) : filteredDivisions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border-hairline bg-canvas p-6 text-center">
          <p className="text-sm font-medium text-ink-primary">
            Tidak ada divisi yang cocok dengan &quot;{debouncedQuery.trim()}&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="inline-flex min-h-[38px] items-center rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-muted"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-hairline text-xs font-medium text-ink-secondary">
                  <th className="py-2.5 pr-3">Divisi</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Lembur Bayangan</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Skor Batas</th>
                  <th className="px-3 py-2.5">Skor Kesejahteraan Mental</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Adopsi Piagam</th>
                  <th className="py-2.5 pl-3">Audit Darurat Valid vs Semu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {paginatedDivisions.map((div) => {
                  const wb = div.wellbeing;
                  const ea = div.emergency_audit;
                  const ca = div.charter_adoption;
                  return (
                    <tr key={div.id} className="align-middle">
                      <td className="py-3.5 pr-3 font-semibold text-ink-primary">
                        {div.name}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap font-mono text-xs tabular-nums text-warn">
                        {div.latest_snapshot
                          ? `${formatNumberId(div.latest_snapshot.shadow_overtime_hours)} Jam`
                          : "Belum ada"}
                      </td>
                      <td className="px-3 py-3.5">
                        {div.boundary_score ? (
                          <span
                            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                              div.boundary_score.tone === "safe"
                                ? "bg-safe-soft text-safe"
                                : div.boundary_score.tone === "warn"
                                  ? "bg-warn-soft text-warn"
                                  : "bg-danger-soft text-danger"
                            }`}
                          >
                            {div.boundary_score.score}/100 ({div.boundary_score.grade})
                          </span>
                        ) : (
                          <span className="text-xs text-ink-secondary">
                            Belum ada
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        {wb?.is_threshold_met && wb.composite_score !== null ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex w-fit items-center whitespace-nowrap rounded-full bg-safe-soft px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-safe">
                              {formatNumberId(wb.composite_score)} / 5,0
                            </span>
                            <span className="font-mono text-[11px] tabular-nums text-ink-secondary">
                              {wb.response_count} responden minggu ini
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-border-hairline bg-canvas px-2 py-1 text-xs text-ink-secondary">
                            Menunggu minimal 3 responden (
                            {wb?.response_count ?? 0}/3)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap font-mono text-xs tabular-nums text-ink-primary">
                        {ca.adoption_percentage !== null
                          ? `${ca.adoption_percentage}% (${ca.signed_count}/${ca.total_members})`
                          : "Belum ada piagam"}
                      </td>
                      <td className="py-3.5 pl-3 font-mono text-xs tabular-nums text-ink-secondary">
                        {ea.total_emergency > 0 ? (
                          <span>
                            <strong className="text-safe">
                              {ea.valid_count} Valid
                            </strong>{" "}
                            /{" "}
                            <strong className="text-danger">
                              {ea.false_alarm_count} Semu
                            </strong>
                            {ea.valid_ratio_pct !== null
                              ? ` (${ea.valid_ratio_pct}%)`
                              : " (Menunggu review)"}
                          </span>
                        ) : (
                          "Nol eskalasi darurat"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <OrgWellbeingMobileList divisions={paginatedDivisions} />
          <OrgDivisionsPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredDivisions.length}
            pageSize={WELLBEING_PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}
