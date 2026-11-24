"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  BENTO_CARD_CLS,
  BENTO_PILL_PRIMARY_CLS,
  BentoCardHeader,
} from "@/components/shared/BentoPrimitives";
import {
  fetchWorkspaceWellbeingPulse,
  submitWorkspaceWellbeingPulse,
} from "../lib/wellbeing-api";
import type { WellbeingPulsePayload } from "../types";
import { WellbeingSliderField } from "./WellbeingSliderField";

interface WellbeingPulseCardProps {
  workspaceId: string;
}

function formatScoreId(value: number | null): string {
  if (value === null) return "-";
  return value.toFixed(1).replace(".", ",");
}

export function WellbeingPulseCard({ workspaceId }: WellbeingPulseCardProps) {
  const [pulseData, setPulseData] = useState<WellbeingPulsePayload | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [restQuality, setRestQuality] = useState(4);
  const [replyPressure, setReplyPressure] = useState(2);
  const [boundaryClarity, setBoundaryClarity] = useState(4);

  useEffect(() => {
    let active = true;
    void fetchWorkspaceWellbeingPulse(workspaceId).then((res) => {
      if (!active) return;
      if (res.ok) {
        setPulseData(res.data);
        if (res.data.own_current_pulse) {
          setRestQuality(res.data.own_current_pulse.rest_quality);
          setReplyPressure(res.data.own_current_pulse.reply_pressure);
          setBoundaryClarity(res.data.own_current_pulse.boundary_clarity);
        }
        setErrorMsg(null);
      } else {
        setErrorMsg(res.errorMsg);
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [workspaceId]);

  async function handleReload() {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await fetchWorkspaceWellbeingPulse(workspaceId);
    if (res.ok) {
      setPulseData(res.data);
    } else {
      setErrorMsg(res.errorMsg);
    }
    setIsLoading(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || isSubmitting) return;

    setIsSubmitting(true);
    const res = await submitWorkspaceWellbeingPulse(workspaceId, {
      rest_quality: restQuality,
      reply_pressure: replyPressure,
      boundary_clarity: boundaryClarity,
    });
    setIsSubmitting(false);

    if (!res.ok) {
      toast.error(res.errorMsg);
      return;
    }

    setPulseData(res.data);
    toast.success("Check-in kesejahteraan mingguan tersimpan secara anonim.");
  }

  const weekSummary = pulseData?.current_week_summary ?? null;

  return (
    <article className={`flex flex-col gap-4 ${BENTO_CARD_CLS}`}>
      <BentoCardHeader
        icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        iconToneClass="bg-safe-soft text-safe"
        title="Check-In Kesejahteraan Mingguan"
        subtitle="15 detik & anonim untuk memantau dampak jam kerja terhadap istirahat tim."
        rightSlot={
          pulseData?.has_submitted_this_week ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-safe-soft px-3 py-1 text-[11px] font-medium text-safe">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span>Sudah Mengisi</span>
            </span>
          ) : null
        }
      />

      <div className="flex items-start gap-2.5 rounded-2xl border border-safe/20 bg-safe-soft px-3.5 py-2.5 text-xs text-safe">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>
          Jaminan K-Anonymity: jawaban per individu tidak pernah dapat dibuka
          oleh Owner maupun Team Lead. Rata-rata divisi hanya tampil jika minimal{" "}
          <strong>3 anggota</strong> telah mengisi minggu ini.
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-stone-200/70 bg-bento-canvas/50 p-4 text-xs text-ink-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand" strokeWidth={1.5} aria-hidden="true" />
          <span>Memuat status check-in minggu ini...</span>
        </div>
      ) : errorMsg ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/70 bg-bento-canvas/50 p-4">
          <div className="flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => void handleReload()}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-stone-200 bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <WellbeingSliderField
            id="pulse-rest"
            label="Kualitas Istirahat Luar Jam"
            value={restQuality}
            lowLabel="1: Sering terganggu"
            highLabel="5: Tenang & pulih"
            onChange={setRestQuality}
          />
          <WellbeingSliderField
            id="pulse-pressure"
            label="Tekanan Balas Cepat di Malam/Akhir Pekan"
            value={replyPressure}
            lowLabel="1: Tidak ada tekanan"
            highLabel="5: Sangat tertekan"
            onChange={setReplyPressure}
          />
          <WellbeingSliderField
            id="pulse-clarity"
            label="Kejelasan Batas Kerja Tim"
            value={boundaryClarity}
            lowLabel="1: Batas kabur"
            highLabel="5: Sangat jelas"
            onChange={setBoundaryClarity}
          />

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`w-full ${BENTO_PILL_PRIMARY_CLS}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                <span>Menyimpan Check-In...</span>
              </>
            ) : (
              <span>
                {pulseData?.has_submitted_this_week
                  ? "Perbarui Check-In Minggu Ini"
                  : "Kirim Check-In Anonim"}
              </span>
            )}
          </button>

          <div className="rounded-2xl border border-stone-200/70 bg-bento-canvas/50 px-4 py-3 text-xs">
            {weekSummary?.is_threshold_met ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-ink-primary">
                  Skor Kesejahteraan Divisi Minggu Ini ({weekSummary.response_count}{" "}
                  responden):
                </span>
                <span className="rounded-full bg-brand-soft px-3 py-0.5 font-mono font-semibold tabular-nums text-brand">
                  {formatScoreId(weekSummary.composite_score)} / 5,0
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 text-ink-secondary">
                <span>Rekap skor minggu ini:</span>
                <span className="font-mono font-medium tabular-nums text-ink-primary">
                  Menunggu minimal 3 responden ({weekSummary?.response_count ?? 0}/3)
                </span>
              </div>
            )}
          </div>
        </form>
      )}
    </article>
  );
}
