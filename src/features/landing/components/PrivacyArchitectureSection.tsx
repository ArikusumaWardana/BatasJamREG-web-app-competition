import Link from "next/link";
import { ArrowRight, Check, Database, Laptop, Lock } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const ZONE_A_POINTS = [
  "Parsing file .txt Android & .zip iOS murni di Web Worker lokal",
  "0 byte teks percakapan atau nama pengirim dikirim ke server/AI",
  "Data mentah langsung dibersihkan dari RAM setelah ringkasan jadi",
];

const ZONE_B_POINTS = [
  "Hanya menyimpan angka agregat, matriks 24x7, dan kartu digest",
  "Terisolasi ketat antar perusahaan/divisi via Row-Level Security",
  "Check-in kesejahteraan anonim dilindungi ambang K-Anonymity (>= 3)",
];

export function PrivacyArchitectureSection() {
  return (
    <section
      id="privasi"
      className="scroll-mt-20 bg-surface py-16 lg:py-24"
    >
      <ScrollReveal className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="flex flex-col gap-5 lg:col-span-6">
          <h2 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Arsitektur Privasi <span className="text-brand">Dua Zona</span>
          </h2>

          <p className="text-sm leading-relaxed text-ink-secondary sm:text-base">
            BatasJamREG memisahkan secara tegas{" "}
            <strong className="font-semibold text-ink-primary">
              Zona A (Browser Lokal / Web Worker)
            </strong>{" "}
            tempat file ekspor WhatsApp diproses di RAM lalu langsung dibuang,
            dengan{" "}
            <strong className="font-semibold text-ink-primary">
              Zona B (Cloud Terisolasi RLS)
            </strong>{" "}
            yang hanya menyimpan angka statistik agregat dan antrean kerja.
          </p>

          <p className="text-sm leading-relaxed text-ink-secondary">
            Pendekatan ini menjawab krisis kelelahan kerja di Indonesia yang
            mencatat kerugian produktivitas hingga Rp463 triliun per tahun dan
            risiko burnout 43% pekerja tanpa mengorbankan privasi percakapan
            pribadi maupun rahasia tim.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <span className="rounded-full border border-stone-200 bg-[#F6F5F1] px-3.5 py-1.5 font-mono text-xs font-medium text-ink-primary">
              Rp463 T / Tahun Kerugian Presenteeism
            </span>
            <span className="rounded-full border border-stone-200 bg-[#F6F5F1] px-3.5 py-1.5 font-mono text-xs font-medium text-warn">
              43% Pekerja Risiko Burnout
            </span>
          </div>

          <div className="pt-1">
            <Link
              href="/audit"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <span>Buktikan di Audit Lokal</span>
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-6">
          <article className="rounded-2xl border border-safe/30 bg-safe-soft/50 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-safe text-white">
                  <Laptop className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-safe">
                    Zona A - Browser Lokal
                  </p>
                  <h3 className="text-sm font-semibold text-ink-primary">
                    Lokal di Perangkat (0 Byte Chat Terkirim)
                  </h3>
                </div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[11px] font-semibold text-safe">
                Web Worker RAM
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-2">
              {ZONE_A_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs text-ink-primary sm:text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-safe" strokeWidth={1.75} aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <div className="flex items-center justify-center gap-2 py-0.5">
            <span className="h-px flex-1 bg-stone-200" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 font-mono text-[11px] font-semibold text-brand shadow-2xs">
              <Lock className="h-3.5 w-3.5 text-safe" strokeWidth={1.5} aria-hidden="true" />
              <span>Zero-Upload Privacy Firewall</span>
            </span>
            <span className="h-px flex-1 bg-stone-200" aria-hidden="true" />
          </div>

          <article className="rounded-2xl border border-brand/20 bg-[#F6F5F1] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                  <Database className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                    Zona B - Cloud Terisolasi
                  </p>
                  <h3 className="text-sm font-semibold text-ink-primary">
                    Supabase RLS (Hanya Angka &amp; Matriks 24x7)
                  </h3>
                </div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[11px] font-semibold text-brand">
                Opt-In Snapshot
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-2">
              {ZONE_B_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs text-ink-primary sm:text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </ScrollReveal>
    </section>
  );
}
