import { CheckCircle2, Cloud, HardDrive } from "lucide-react";
import { FadeInSection } from "@/components/ui/FadeInSection";
import { PRIVACY_ZONES } from "../lib/landing-content";

export function LandingFirewallSection() {
  return (
    <section
      id="arsitektur"
      className="border-b border-border-hairline py-16 lg:py-20"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <FadeInSection className="flex max-w-2xl flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-[30px]">
            Arsitektur Privasi Two-Zone Firewall
          </h2>
          <p className="text-base leading-relaxed text-ink-secondary">
            Pemisahan tegas antara pembacaan chat pribadi secara offline di
            perangkat Anda dan tata kelola batas kerja tim yang terstruktur.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          {PRIVACY_ZONES.map((zone, index) => {
            const isLocal = zone.zone_code === "ZONE_A";
            return (
              <FadeInSection
                key={zone.zone_code}
                as="article"
                delayMs={index * 75}
                className="flex h-full flex-col gap-5 rounded-lg border border-border-hairline bg-surface p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      isLocal
                        ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-safe-soft text-safe"
                        : "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand"
                    }
                  >
                    {isLocal ? (
                      <HardDrive className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Cloud className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </div>

                  <span
                    className={
                      isLocal
                        ? "rounded-full bg-safe-soft px-3 py-1 font-mono text-xs font-medium text-safe"
                        : "rounded-full bg-brand-soft px-3 py-1 font-mono text-xs font-medium text-brand"
                    }
                  >
                    {zone.badge}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-ink-primary">
                    {zone.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-secondary">
                    {zone.summary}
                  </p>
                </div>

                <ul className="flex flex-col gap-2 border-t border-border-hairline pt-4">
                  {zone.guarantees.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-ink-secondary"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-safe"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
