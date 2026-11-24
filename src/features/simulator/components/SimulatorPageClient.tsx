"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  readAuditHandoff,
  type AuditHandoffData,
} from "@/lib/storage/audit-handoff";
import {
  calculatePresenteeismCost,
  DEFAULT_SIMULATOR_INPUT,
  formatRupiah,
  mapHandoffToSimulatorInput,
} from "../lib/presenteeism-formula";
import type { SimulatorInput } from "../types";
import { CostSummaryCards } from "./CostSummaryCards";
import { MethodologyPanel } from "./MethodologyPanel";
import { ProjectionChart } from "./ProjectionChart";
import { SimulatorInputPanel } from "./SimulatorInputPanel";

export function SimulatorPageClient() {
  const [input, setInput] = useState<SimulatorInput>(DEFAULT_SIMULATOR_INPUT);
  const [auditHandoff, setAuditHandoff] = useState<AuditHandoffData | null>(
    null
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const handoff = readAuditHandoff();
      if (!handoff) return;
      setAuditHandoff(handoff);
      setInput((prev) => mapHandoffToSimulatorInput(handoff, prev));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const output = calculatePresenteeismCost(input);

  function handleApplyHandoff() {
    if (!auditHandoff) return;
    const mapped = mapHandoffToSimulatorInput(auditHandoff, input);
    setInput(mapped);
    toast.success(
      `Data Audit WA Lokal (${mapped.weekly_shadow_overtime_hours} jam/minggu) diterapkan.`
    );
  }

  function handleResetDefault() {
    setInput(DEFAULT_SIMULATOR_INPUT);
    toast.info("Parameter simulator dikembalikan ke nilai default.");
  }

  async function handleCopySummary() {
    if (output.annual_loss_idr <= 0 || output.sanitized_input.team_size <= 0) {
      return;
    }

    const lines = [
      `Ringkasan Estimasi Biaya Presenteeism (${output.sanitized_input.team_size} anggota tim):`,
      `- Lembur bayangan rata-rata: ${output.sanitized_input.weekly_shadow_overtime_hours} jam/minggu`,
      `- Risiko penurunan efektivitas (presenteeism): ${output.presenteeism_risk_pct}% (${output.risk_level})`,
      `- Estimasi kerugian produktivitas: ${formatRupiah(output.annual_loss_idr)}/tahun (${formatRupiah(output.monthly_loss_idr)}/bulan)`,
      `- Estimasi hari kerja efektif hilang: ${output.lost_workdays_per_year} hari/tahun`,
      `- Potensi penghematan tahunan dengan BatasJamREG: ${formatRupiah(output.projected_annual_savings_idr)} (${output.savings_percentage}%)`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Ringkasan advokasi untuk manajemen disalin ke clipboard.");
    } catch {
      toast.error("Gagal menyalin ringkasan ke clipboard.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
            Simulator Biaya,{" "}
            <span className="font-normal text-ink-secondary">
              Presenteeism &amp; Burnout
            </span>
          </h1>
          <p className="text-sm text-ink-secondary">
            Hitung estimasi dampak finansial lembur bayangan sebagai dasar
            diskusi berbasis data dengan manajemen atau HR.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-3 rounded-[24px] border border-brand-border bg-brand-soft/80 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-2.5 text-sm text-brand sm:items-center">
            <Info className="mt-0.5 size-4 shrink-0 sm:mt-0" />
            <span>
              {auditHandoff
                ? `Angka ${auditHandoff.avg_weekly_shadow_hours.toLocaleString(
                    "id-ID",
                    { maximumFractionDigits: 1 }
                  )} jam/minggu dari Audit WA Lokal (${auditHandoff.source_label}) tersedia.`
                : "Belum ada ringkasan dari Audit WA Lokal. Anda dapat menjalankan demo audit atau mengatur slider secara langsung."}
            </span>
          </div>

          {auditHandoff ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyHandoff}
              className="w-fit shrink-0 rounded-full border-brand-border bg-surface px-4 text-brand hover:bg-surface-subtle"
            >
              Terapkan Data Audit
            </Button>
          ) : (
            <Link
              href="/audit?demo=true"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className:
                  "w-fit shrink-0 rounded-full border-brand-border bg-surface px-4 text-brand hover:bg-surface-subtle",
              })}
            >
              Jalankan Audit Demo
            </Link>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="min-w-0 lg:col-span-5">
          <SimulatorInputPanel
            input={input}
            canCopySummary={
              output.sanitized_input.team_size > 0 && output.annual_loss_idr > 0
            }
            onChange={setInput}
            onReset={handleResetDefault}
            onCopySummary={handleCopySummary}
          />
        </section>

        <section className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          <CostSummaryCards output={output} />
          <ProjectionChart
            data={output.monthly_projections}
            projectedAnnualSavingsIdr={output.projected_annual_savings_idr}
            savingsPercentage={output.savings_percentage}
          />
          <MethodologyPanel />
        </section>
      </div>
    </div>
  );
}
