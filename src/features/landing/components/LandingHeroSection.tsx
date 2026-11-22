import { Lock, ShieldCheck } from "lucide-react";
import { FadeInSection } from "@/components/ui/FadeInSection";
import { HERO_PREVIEW_METRICS } from "../lib/landing-content";
import { LandingDemoButton } from "./LandingDemoButton";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function getHeatCellClass(level: number, colIndex: number): string {
  const isRegularSlot = colIndex >= 2 && colIndex <= 4;
  if (isRegularSlot && level <= 1) {
    return "border border-dashed border-safe/40 bg-safe-soft/70";
  }
  switch (level) {
    case 4:
      return "bg-heat-4";
    case 3:
      return "bg-heat-3";
    case 2:
      return "bg-heat-2";
    case 1:
      return "bg-heat-1";
    default:
      return "bg-heat-0";
  }
}

export function LandingHeroSection() {
  return (
    <section className="border-b border-border-hairline py-14 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <FadeInSection className="flex flex-col items-start gap-6 lg:col-span-6">
          <span
            role="status"
            className="inline-flex items-center gap-2 rounded-full border border-border-hairline bg-brand-soft px-3 py-1 text-xs font-medium text-brand"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>100% Pemrosesan Lokal di Browser - Zero Upload</span>
          </span>

          <div className="flex flex-col gap-4">
            <h1 className="text-[34px] font-bold leading-[1.15] tracking-tight text-ink-primary sm:text-[44px]">
              Hentikan Lembur Bayangan WhatsApp. Kembalikan Batas Jam Kerja Tim.
            </h1>
            <p className="max-w-prose text-base leading-relaxed text-ink-secondary">
              Audit pola pesan kerja di luar jam reguler langsung di browser tanpa
              mengunggah chat ke server, tahan instruksi malam lewat Morning
              Digest, dan susun Piagam Jam Digital tim.
            </p>
          </div>

          <div className="pt-1">
            <LandingDemoButton showAuditCta />
          </div>
        </FadeInSection>

        <FadeInSection delayMs={100} className="lg:col-span-6">
          <article className="flex flex-col gap-5 rounded-lg border border-border-hairline bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline pb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-safe-soft px-2.5 py-1 text-xs font-medium text-safe">
                <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>0 Byte Chat Terkirim ke Server</span>
              </span>
              <span className="font-mono text-xs text-ink-secondary tabular-nums">
                Zona Reguler: 09:00-17:00 WIB
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink-primary">
                  Peta Interupsi Pesan 7 Hari x Slot Jam
                </span>
                <span className="font-mono text-[11px] text-ink-muted">
                  {HERO_PREVIEW_METRICS.team_label}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 rounded-md border border-border-hairline bg-canvas p-3.5">
                <div className="mb-1 grid grid-cols-[32px_repeat(8,minmax(0,1fr))] gap-1.5 font-mono text-[10px] text-ink-muted tabular-nums">
                  <span />
                  <span>00</span>
                  <span>04</span>
                  <span className="col-span-3 text-center text-safe">
                    09:00-17:00
                  </span>
                  <span className="text-warn">18</span>
                  <span className="text-warn">20</span>
                  <span className="text-right text-warn">23</span>
                </div>

                {HERO_PREVIEW_METRICS.mini_heatmap.map((row, rowIndex) => (
                  <div
                    key={DAY_LABELS[rowIndex]}
                    className="grid grid-cols-[32px_repeat(8,minmax(0,1fr))] items-center gap-1.5"
                  >
                    <span className="font-mono text-[11px] text-ink-secondary">
                      {DAY_LABELS[rowIndex]}
                    </span>
                    {row.map((level, colIndex) => (
                      <span
                        key={`${rowIndex}-${colIndex}`}
                        className={`h-4 rounded-[4px] ${getHeatCellClass(level, colIndex)}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-border-hairline pt-4">
              <div>
                <p className="text-[11px] text-ink-muted">Lembur Bayangan</p>
                <p className="font-mono text-sm font-semibold text-warn tabular-nums">
                  {HERO_PREVIEW_METRICS.shadow_overtime_label}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted">Luar Jam Kerja</p>
                <p className="font-mono text-sm font-semibold text-ink-primary tabular-nums">
                  {HERO_PREVIEW_METRICS.after_hours_share}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted">Puncak Rawan</p>
                <p className="font-mono text-sm font-semibold text-ink-primary tabular-nums">
                  {HERO_PREVIEW_METRICS.peak_window}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border-hairline pt-3 font-mono text-xs text-ink-muted tabular-nums">
              <span>Urgensi Semu: {HERO_PREVIEW_METRICS.false_urgency_count}</span>
              <span>{HERO_PREVIEW_METRICS.period_label}</span>
            </div>
          </article>
        </FadeInSection>
      </div>
    </section>
  );
}
