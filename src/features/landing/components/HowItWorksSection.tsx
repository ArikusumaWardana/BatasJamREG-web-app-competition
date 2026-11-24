import Link from "next/link";
import { CheckCircle2, Clock, FileCheck2, Play } from "lucide-react";
import { DigitalStampSvg } from "@/components/shared/DigitalStampSvg";
import { DemoLoginActionButton } from "./DemoLoginActionButton";
import { ScrollReveal } from "./ScrollReveal";

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Audit Lokal Tanpa Upload",
    description:
      "Ekspor chat WA kerja dan ukur lembur bayangan secara lokal di browser.",
  },
  {
    step: 2,
    title: "Hitung Biaya & Sepakati Piagam",
    description:
      "Konversi jam lembur ke estimasi kerugian lalu terbitkan Piagam Tim berstempel.",
  },
  {
    step: 3,
    title: "Alihkan Chat Malam ke Digest",
    description:
      "Simpan ide atau instruksi malam di Antrean Pagi agar baru terkirim jam 08:30 WIB.",
  },
  {
    step: 4,
    title: "Pantau Kesehatan Lintas Divisi",
    description:
      "Owner memantau skor batas digital dan wellbeing pulse seluruh divisi di satu tempat.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="cara-kerja"
      className="scroll-mt-20 bg-[#EDEBE4]/70 py-16 lg:py-24"
    >
      <ScrollReveal className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <article className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-xs font-semibold text-ink-primary">
                  Morning Digest Triage
                </span>
              </div>
              <span className="rounded-full bg-safe-soft px-2.5 py-0.5 font-mono text-[11px] font-medium text-safe">
                08:30 WIB
              </span>
            </div>

            <div className="mt-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F6F5F1] px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-ink-primary">
                    Revisi materi presentasi klien
                  </p>
                  <p className="font-mono text-[11px] text-ink-secondary">
                    Masuk 21:14 WIB - Non-Darurat
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 font-mono text-[10px] font-medium text-brand">
                  Terkirim 08:30 WIB
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F6F5F1] px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-ink-primary">
                    Sinkronisasi jadwal sprint mingguan
                  </p>
                  <p className="font-mono text-[11px] text-ink-secondary">
                    Masuk 22:05 WIB - Non-Darurat
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-warn-soft px-2.5 py-0.5 font-mono text-[10px] font-medium text-warn">
                  Darurat Teraudit
                </span>
              </div>
            </div>
          </article>

          <article className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-sm">
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-safe-soft px-2.5 py-0.5 font-mono text-[10px] font-semibold text-safe">
                <CheckCircle2 className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>TERVERIFIKASI DIGITAL</span>
              </span>
              <h3 className="text-sm font-semibold text-ink-primary">
                Piagam Jam Digital Tim v1.0
              </h3>
              <p className="text-xs text-ink-secondary">
                Jam Tenang: 18:00 - 08:00 WIB
              </p>
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-brand">
                <FileCheck2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>6/7 Anggota Menyetujui</span>
              </div>
            </div>

            <DigitalStampSvg
              organizationName="PT NUSANTARA DIGITAL"
              className="h-16 w-16 shrink-0"
            />
          </article>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
              Alur Kerja Sederhana,{" "}
              <span className="text-brand">Dampak Terukur</span>
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary sm:text-base">
              Empat langkah praktis untuk memulihkan batas waktu istirahat tanpa
              mengorbankan responsivitas tim Anda.
            </p>
          </div>

          <ol className="relative flex flex-col gap-5">
            {WORKFLOW_STEPS.map((item, idx) => (
              <li key={item.step} className="relative flex items-start gap-4">
                {idx < WORKFLOW_STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-9 left-[17px] h-[calc(100%+4px)] w-px bg-brand/25"
                  />
                ) : null}
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-sm font-bold text-white shadow-2xs">
                  {item.step}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-base font-semibold text-ink-primary">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-secondary">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/audit?demo=true"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Play className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Mulai Audit Sekarang</span>
            </Link>

            <DemoLoginActionButton
              variant="outline"
              label="Lihat Demo Workspace"
            />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
