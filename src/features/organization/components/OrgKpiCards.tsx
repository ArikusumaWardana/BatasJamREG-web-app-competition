"use client";

import { AlertTriangle, Building2, Clock, Users } from "lucide-react";
import type { OrganizationSummaryKpi } from "../types";

interface OrgKpiCardsProps {
  kpis: OrganizationSummaryKpi;
}

function formatHours(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function OrgKpiCards({ kpis }: OrgKpiCardsProps) {
  const highest = kpis.highest_burnout_division;

  return (
    <section
      aria-label="Ringkasan indikator organisasi"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <article className="rounded-lg border border-border-hairline bg-surface p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-ink-secondary">
          <span>Total Divisi Aktif</span>
          <Building2
            className="h-4 w-4 text-brand"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-ink-primary">
          {kpis.total_divisions}
        </p>
        <p className="mt-1 text-xs text-ink-secondary">
          Ruang kerja tim di bawah perusahaan
        </p>
      </article>

      <article className="rounded-lg border border-border-hairline bg-surface p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-ink-secondary">
          <span>Total Anggota</span>
          <Users
            className="h-4 w-4 text-brand"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-ink-primary">
          {kpis.total_members}
        </p>
        <p className="mt-1 text-xs text-ink-secondary">
          Akun aktif terhubung di organisasi
        </p>
      </article>

      <article className="rounded-lg border border-border-hairline bg-surface p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-ink-secondary">
          <span>Lembur Bayangan Lintas Divisi</span>
          <Clock
            className="h-4 w-4 text-warn"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-ink-primary">
          {formatHours(kpis.total_shadow_overtime_hours)}{" "}
          <span className="font-sans text-sm font-normal text-ink-secondary">
            Jam
          </span>
        </p>
        <p className="mt-1 text-xs text-ink-secondary">
          Akumulasi snapshot terbaru tiap divisi
        </p>
      </article>

      <article className="rounded-lg border border-border-hairline bg-surface p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-ink-secondary">
          <span>Divisi Paling Rawan Burnout</span>
          <AlertTriangle
            className="h-4 w-4 text-warn"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        {highest ? (
          <>
            <p className="mt-3 truncate text-lg font-semibold text-ink-primary">
              {highest.name}
            </p>
            <p className="mt-1 inline-flex items-center rounded-full bg-warn-soft px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-warn">
              {formatHours(highest.shadow_overtime_hours)} Jam luar reguler
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-base font-semibold text-ink-primary">
              Belum Ada Snapshot
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Simpan audit lokal pada divisi terlebih dahulu
            </p>
          </>
        )}
      </article>
    </section>
  );
}
