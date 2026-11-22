import { Lock } from "lucide-react";

export function PrivacyLocalBanner() {
  return (
    <section className="flex flex-col justify-between gap-4 pb-2 md:flex-row md:items-end">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-[28px]">
          Audit Lembur Bayangan WhatsApp
        </h1>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Analisis pola interupsi di luar jam reguler secara lokal di browser
          Anda.
        </p>
      </div>

      <div
        role="status"
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-safe-soft px-3 py-1.5 text-xs font-medium text-safe md:self-auto"
      >
        <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>Pemrosesan 100% Lokal - 0 Byte Terunggah</span>
      </div>
    </section>
  );
}
