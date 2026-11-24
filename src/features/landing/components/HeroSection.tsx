import Link from "next/link";
import { ArrowDown, Clock, Play, ShieldCheck } from "lucide-react";
import { DemoLoginActionButton } from "./DemoLoginActionButton";

const DAY_STRIPS = [
  { day: "Sen", regular: 72, after: 28 },
  { day: "Sel", regular: 54, after: 46 },
  { day: "Rab", regular: 78, after: 22 },
  { day: "Kam", regular: 68, after: 32 },
  { day: "Jum", regular: 74, after: 26 },
  { day: "Sab", regular: 48, after: 20 },
  { day: "Min", regular: 30, after: 14 },
];

export function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative overflow-x-clip bg-surface py-12 sm:py-16 lg:py-24"
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-8 left-4 h-28 w-28 text-stone-300 opacity-35 sm:left-10"
        viewBox="0 0 120 120"
        fill="none"
      >
        <circle cx="24" cy="24" r="4" fill="currentColor" />
        <circle cx="54" cy="18" r="2.5" fill="currentColor" />
        <circle cx="16" cy="58" r="3" fill="#1E4E56" />
        <circle cx="46" cy="48" r="2" fill="currentColor" />
      </svg>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-8 h-32 w-32 text-stone-300 opacity-35 sm:right-10"
        viewBox="0 0 120 120"
        fill="none"
      >
        <circle cx="96" cy="94" r="5" fill="#1E4E56" />
        <circle cx="64" cy="100" r="3" fill="currentColor" />
        <circle cx="102" cy="62" r="2.5" fill="currentColor" />
        <circle cx="74" cy="70" r="2" fill="currentColor" />
      </svg>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="flex flex-col gap-5 lg:col-span-6">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-border bg-brand-soft px-3.5 py-1 text-xs font-medium text-brand">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>SDG 3.4 - Smart Lifestyle &amp; Digital Wellbeing</span>
          </span>

          <h1 className="text-3xl leading-[1.15] font-bold tracking-tight text-ink-primary sm:text-4xl lg:text-[44px]">
            Akhiri <span className="text-brand">Lembur Bayangan</span> di Luar
            Jam Kerja Tim Anda
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-ink-secondary">
            Audit pola chat WhatsApp di luar jam kerja secara lokal di browser
            tanpa unggah ke server, tahan instruksi non-darurat malam hari ke
            Morning Digest 08:30 WIB, dan lindungi kesehatan mental pekerja
            Indonesia.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/audit?demo=true"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Play className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Coba Audit Demo 1-Klik</span>
            </Link>

            <DemoLoginActionButton
              variant="outline"
              label="Masuk Workspace Demo"
            />
          </div>

          <div className="pt-2">
            <a
              href="#fitur"
              className="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-surface text-ink-primary transition-colors group-hover:border-brand group-hover:bg-brand-soft group-hover:text-brand">
                <ArrowDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span>Pelajari lebih lanjut</span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:col-span-6 lg:max-w-none">
          <div className="relative flex flex-col gap-3 sm:py-4 sm:pr-3 sm:pl-4">
            <div className="self-end sm:relative sm:z-10 sm:-mb-5 sm:mr-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-safe/25 bg-safe-soft px-3.5 py-1.5 text-xs font-medium text-safe shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>100% Audit Lokal - 0 Byte Upload</span>
              </div>
            </div>

            <article className="rounded-[24px] border border-stone-200/80 bg-surface p-5 shadow-[0_12px_32px_rgba(28,25,23,0.06)] sm:p-6">
              <div className="flex flex-col gap-4 rounded-[18px] bg-brand p-5 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-white/80">
                    Skor Batas Digital
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-0.5 font-mono text-xs font-semibold text-white">
                    Grade A - Sehat
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-4xl font-bold tracking-tight tabular-nums">
                      86
                    </span>
                    <span className="font-mono text-sm text-white/75">/100</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-white/75">
                      Lembur Bayangan (90 Hari)
                    </p>
                    <p className="font-mono text-sm font-semibold tabular-nums">
                      42,5 Jam
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-ink-secondary">
                  <span className="font-medium text-ink-primary">
                    Distribusi Pesan 7 Hari
                  </span>
                  <span className="font-mono text-[11px] tabular-nums">
                    27% di luar jam kerja
                  </span>
                </div>

                <div className="grid grid-cols-7 items-end gap-2 rounded-2xl bg-[#F6F5F1] p-3">
                  {DAY_STRIPS.map((item) => (
                    <div key={item.day} className="flex flex-col items-center gap-1.5">
                      <div className="flex h-16 w-full flex-col justify-end gap-0.5 overflow-hidden rounded-full bg-stone-200/70 p-0.5">
                        <div
                          className="w-full rounded-full bg-warn/80"
                          style={{ height: `${item.after}%` }}
                        />
                        <div
                          className="w-full rounded-full bg-brand"
                          style={{ height: `${item.regular}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-ink-secondary">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <div className="sm:relative sm:z-10 sm:-mt-8 sm:ml-4 sm:max-w-xs">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-surface p-4 shadow-[0_10px_24px_rgba(28,25,23,0.08)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-safe-soft text-safe">
                    <Clock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink-primary">
                      Morning Digest
                    </p>
                    <p className="font-mono text-[11px] text-ink-secondary tabular-nums">
                      Antrean Pagi 08:30 WIB
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-safe-soft px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-safe">
                  <span className="h-1.5 w-1.5 rounded-full bg-safe" aria-hidden="true" />
                  <span>3 Tertahan</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
