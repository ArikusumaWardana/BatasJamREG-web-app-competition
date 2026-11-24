"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Building2 } from "lucide-react";
import {
  BENTO_CARD_CLS,
  BENTO_INNER_CARD_CLS,
  BentoCardHeader,
} from "@/components/shared/BentoPrimitives";
import type { DivisionOverviewItem, OrganizationSummaryKpi } from "../types";

interface OrgHeroBentoCardProps {
  organizationName: string;
  kpis: OrganizationSummaryKpi;
  divisions: DivisionOverviewItem[];
}

function formatHours(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function OrgHeroBentoCard({
  organizationName,
  kpis,
  divisions,
}: OrgHeroBentoCardProps) {
  const scoredDivisions = divisions.filter((d) => d.boundary_score !== null);
  const avgScore =
    scoredDivisions.length > 0
      ? Math.round(
          scoredDivisions.reduce(
            (sum, d) => sum + (d.boundary_score?.score ?? 0),
            0
          ) / scoredDivisions.length
        )
      : null;

  const highest = kpis.highest_burnout_division;
  const isCritical =
    highest !== null && highest.shadow_overtime_hours >= 45;

  return (
    <article className={`flex h-full flex-col justify-between gap-4 ${BENTO_CARD_CLS}`}>
      <BentoCardHeader
        icon={<Building2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        title="Kesehatan Perusahaan"
        subtitle={organizationName}
        actionHref="#daftar-divisi"
        actionLabel="Lihat semua divisi"
      />

      <div className="flex flex-col justify-between gap-4 rounded-[20px] bg-brand p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-white/80">
              Total Lembur Bayangan
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-tight tabular-nums">
              {formatHours(kpis.total_shadow_overtime_hours)}{" "}
              <span className="font-sans text-sm font-normal text-white/80">
                Jam
              </span>
            </p>
          </div>
          <div className="rounded-2xl bg-white/12 px-3 py-1.5 text-right">
            <p className="text-[10px] font-medium text-white/75 uppercase">
              Skor Rata-rata
            </p>
            <p className="font-mono text-lg font-bold tabular-nums">
              {avgScore !== null ? `${avgScore}/100` : "--"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/15 pt-3 text-xs">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 font-mono tabular-nums">
            {kpis.total_divisions} Divisi Aktif
          </span>
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 font-mono tabular-nums">
            {kpis.total_members} Anggota
          </span>
        </div>
      </div>

      <div className={BENTO_INNER_CARD_CLS}>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            <AlertTriangle
              className={`h-3.5 w-3.5 ${isCritical ? "text-danger" : "text-warn"}`}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Divisi Paling Rawan Burnout</span>
          </span>
          {highest ? (
            <Link
              href={`/workspace?ws=${highest.workspace_id}`}
              aria-label={`Buka divisi ${highest.name}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-surface text-ink-secondary transition-colors hover:bg-brand-soft hover:text-brand"
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        {highest ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-ink-primary">
              {highest.name}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums ${
                isCritical
                  ? "bg-danger-soft text-danger"
                  : "bg-warn-soft text-warn"
              }`}
            >
              {formatHours(highest.shadow_overtime_hours)} Jam
            </span>
          </div>
        ) : (
          <p className="mt-2 text-xs text-ink-secondary">
            Belum ada snapshot audit tersimpan di divisi mana pun.
          </p>
        )}
      </div>
    </article>
  );
}
