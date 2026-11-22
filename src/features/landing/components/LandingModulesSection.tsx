import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  FileSearch,
  FileText,
  HeartPulse,
  Sunrise,
} from "lucide-react";
import { FadeInSection } from "@/components/ui/FadeInSection";
import { CORE_MODULES, SDG_MAPPING_POINTS } from "../lib/landing-content";
import { LandingDemoButton } from "./LandingDemoButton";

function ModuleIcon({ id }: { id: string }) {
  const cls = "h-5 w-5";
  switch (id) {
    case "audit":
      return <FileSearch className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case "digest":
      return <Sunrise className={cls} strokeWidth={1.5} aria-hidden="true" />;
    case "charter":
      return <FileText className={cls} strokeWidth={1.5} aria-hidden="true" />;
    default:
      return <Calculator className={cls} strokeWidth={1.5} aria-hidden="true" />;
  }
}

export function LandingModulesSection() {
  return (
    <>
      <section id="modul" className="border-b border-border-hairline py-16 lg:py-20">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <FadeInSection className="flex max-w-2xl flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-[30px]">
              Empat Modul Inti BatasJamREG
            </h2>
            <p className="text-base leading-relaxed text-ink-secondary">
              Alat audit, penyangga komunikasi asinkron, kesepakatan tim, dan
              kalkulasi dampak biaya dalam satu alur kerja yang tenang.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
            {CORE_MODULES.map((mod, index) => (
              <FadeInSection key={mod.id} delayMs={index * 75} className="h-full">
                <Link
                  href={mod.href}
                  className="group flex h-full flex-col justify-between gap-6 rounded-lg border border-border-hairline bg-surface p-6 transition-colors hover:border-border-strong sm:p-8"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-soft text-brand">
                        <ModuleIcon id={mod.id} />
                      </div>
                      <span className="font-mono text-xs text-ink-muted">
                        {mod.badge}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-semibold text-ink-primary">
                        {mod.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-ink-secondary">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    <span>{mod.cta_label}</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <FadeInSection className="flex flex-col gap-6 rounded-lg border border-border-hairline bg-surface p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-border-hairline pb-5 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-safe-soft text-safe">
                  <HeartPulse className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <span className="font-mono text-xs font-medium text-safe">
                    KESELARASAN DAMPAK SOSIAL
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-ink-primary">
                    SDG 3: Good Health and Well-being (Target 3.4)
                  </h2>
                </div>
              </div>
              <span className="w-fit rounded-full bg-safe-soft px-3 py-1 font-mono text-xs text-safe">
                Smart Lifestyle & Digital Wellbeing
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {SDG_MAPPING_POINTS.map((point) => (
                <div key={point.code} className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs font-semibold text-brand">
                    {point.code}
                  </span>
                  <h3 className="text-sm font-semibold text-ink-primary">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-secondary">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-start justify-between gap-4 border-t border-border-hairline pt-6 lg:flex-row lg:items-center">
              <p className="text-sm text-ink-secondary">
                Siap menguji seluruh alur sesuai peran Owner, Team Lead, atau
                Anggota tanpa mendaftar akun?
              </p>
              <LandingDemoButton showAuditCta />
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
