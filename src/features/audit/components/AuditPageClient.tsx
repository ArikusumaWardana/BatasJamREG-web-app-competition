"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { WORK_PATTERNS } from "@/lib/constants/work-hours";
import { saveAuditHandoff } from "@/lib/storage/audit-handoff";
import { useWaAuditWorker } from "../hooks/useWaAuditWorker";
import { DEFAULT_FALSE_URGENCY_KEYWORDS } from "../lib/false-urgency";
import type { AuditConfig } from "../types";
import { AuditActionBar } from "./AuditActionBar";
import { AuditConfigPanel } from "./AuditConfigPanel";
import { AuditKpiCards } from "./AuditKpiCards";
import { BoundaryScoreCard } from "./BoundaryScoreCard";
import { FalseUrgencyTable } from "./FalseUrgencyTable";
import { Heatmap24x7 } from "./Heatmap24x7";
import { PrivacyLocalBanner } from "./PrivacyLocalBanner";
import { SaveSnapshotDialog } from "./SaveSnapshotDialog";
import { UploadDropzoneCard } from "./UploadDropzoneCard";
import { WeeklyTrendChart } from "./WeeklyTrendChart";

const INITIAL_CONFIG: AuditConfig = {
  work_pattern: "FIVE_DAYS_8H",
  work_start_time: WORK_PATTERNS.FIVE_DAYS_8H.startTime,
  work_end_time: WORK_PATTERNS.FIVE_DAYS_8H.endTime,
  timezone: "Asia/Jakarta",
  work_days: [...WORK_PATTERNS.FIVE_DAYS_8H.workDays],
  keywords: [...DEFAULT_FALSE_URGENCY_KEYWORDS],
};

export function AuditPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoQuery = searchParams.get("demo") === "true";

  const [config, setConfig] = useState<AuditConfig>(INITIAL_CONFIG);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const demoTriggeredRef = useRef(false);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const {
    result,
    isProcessing,
    error,
    hasLoadedSource,
    processFile,
    loadDemoDataset,
    reanalyze,
  } = useWaAuditWorker({
    onSuccess: (auditResult, mode) => {
      if (mode === "load") {
        toast.success(
          `Audit selesai: ${auditResult.total_messages.toLocaleString("id-ID")} pesan diproses secara lokal.`
        );
      }
    },
    onError: (message) => {
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!isDemoQuery || demoTriggeredRef.current) return;
    demoTriggeredRef.current = true;
    const timer = window.setTimeout(() => {
      void loadDemoDataset(configRef.current);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isDemoQuery, loadDemoDataset]);

  function handleConfigChange(nextConfig: AuditConfig) {
    setConfig(nextConfig);
    if (hasLoadedSource) {
      reanalyze(nextConfig);
    }
  }

  function handleHandoff(targetRoute: "/simulator" | "/charter", label: string) {
    if (!result) return;
    saveAuditHandoff({
      avg_weekly_shadow_hours: result.avg_weekly_shadow_hours,
      shadow_overtime_hours: result.shadow_overtime_hours,
      after_hours_percentage: result.after_hours_percentage,
      work_start_time: config.work_start_time,
      work_end_time: config.work_end_time,
      peak_day_of_week: result.peak_day_of_week,
      peak_hour: result.peak_hour,
      source_label: result.source_label,
      saved_at: new Date().toISOString(),
    });
    toast.success(`Angka ringkasan audit diterapkan ke ${label}.`);
    router.push(targetRoute);
  }

  return (
    <div className="flex flex-col gap-6">
      <PrivacyLocalBanner />

      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <UploadDropzoneCard
          isProcessing={isProcessing}
          sourceLabel={result?.source_label ?? null}
          totalMessages={result?.total_messages ?? null}
          onSelectFile={(file) => void processFile(file, config)}
          onLoadDemo={() => void loadDemoDataset(config)}
        />
        <AuditConfigPanel
          config={config}
          disabled={isProcessing}
          onChange={handleConfigChange}
        />
      </section>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-danger/30 bg-danger-soft p-5 text-sm text-danger"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadDemoDataset(config)}
            className="shrink-0 rounded-full border border-danger/30 bg-surface px-4 py-1.5 text-xs font-medium text-danger hover:bg-canvas"
          >
            Muat Simulasi
          </button>
        </div>
      ) : null}

      <section
        aria-label="Skor Batas Digital dan Ringkasan KPI"
        className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12"
      >
        <div className="min-w-0 lg:col-span-5">
          <BoundaryScoreCard result={result} workDays={config.work_days} />
        </div>
        <div className="min-w-0 lg:col-span-7">
          <AuditKpiCards result={result} timezone={config.timezone} />
        </div>
      </section>

      <Heatmap24x7
        matrix={result?.heatmap_matrix ?? null}
        config={config}
        periodStart={result?.period_start}
        periodEnd={result?.period_end}
      />

      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <WeeklyTrendChart data={result?.weekly_trend ?? []} />
        <FalseUrgencyTable
          items={result?.false_urgency_breakdown ?? []}
          totalHits={result?.false_urgency_count ?? 0}
          hasResult={result !== null}
        />
      </section>

      <AuditActionBar
        hasResult={result !== null && !isProcessing}
        onSendToSimulator={() => handleHandoff("/simulator", "Simulator Biaya")}
        onSendToCharter={() => handleHandoff("/charter", "Piagam Tim")}
        onOpenSaveDialog={() => setSaveDialogOpen(true)}
      />

      <SaveSnapshotDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        result={result}
      />
    </div>
  );
}
