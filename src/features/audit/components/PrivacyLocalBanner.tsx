import { Lock } from "lucide-react";

export function PrivacyLocalBanner() {
  return (
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
          Audit WA Lokal,{" "}
          <span className="font-normal text-ink-secondary">
            Analisis 100% Di Perangkat
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Pola interupsi di luar jam reguler diproses langsung melalui Web Worker
          di browser Anda.
        </p>
      </div>

      <div
        role="status"
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-safe/20 bg-safe-soft px-3.5 py-2 text-xs font-medium text-safe md:self-auto"
      >
        <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>100% Lokal - Zero Upload (0 Byte)</span>
      </div>
    </section>
  );
}
