import { FadeInSection } from "@/components/ui/FadeInSection";
import { INDONESIA_CRISIS_STATS } from "../lib/landing-content";

export function LandingCrisisSection() {
  return (
    <section className="border-b border-border-hairline py-16 lg:py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <FadeInSection className="flex max-w-2xl flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-[30px]">
            Mengapa Lembur Bayangan Menjadi Krisis Kerja Indonesia
          </h2>
          <p className="text-base leading-relaxed text-ink-secondary">
            Koordinasi kerja lewat WhatsApp di luar jam reguler menciptakan
            beban mental tersembunyi yang menurunkan produktivitas tim.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INDONESIA_CRISIS_STATS.map((stat, index) => (
            <FadeInSection
              key={stat.value}
              as="article"
              delayMs={index * 75}
              className="flex h-full flex-col justify-between gap-4 rounded-lg border border-border-hairline bg-surface p-6"
            >
              <div className="flex flex-col gap-2">
                <p className="font-mono text-2xl font-semibold text-ink-primary tabular-nums sm:text-[28px]">
                  {stat.value}
                </p>
                <h3 className="text-sm font-semibold text-ink-primary">
                  {stat.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-secondary">
                  {stat.description}
                </p>
              </div>
              <span className="border-t border-border-hairline pt-3 font-mono text-[11px] text-ink-muted">
                {stat.source}
              </span>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
