import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileSignature,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const FEATURE_CARDS = [
  {
    id: "audit",
    title: "Audit WA Lokal",
    description:
      "Analisis file ekspor chat WhatsApp (.txt/.zip) 100% di memori browser tanpa mengunggah teks percakapan ke server.",
    href: "/audit",
    icon: ShieldCheck,
    iconBoxClass: "bg-brand text-white",
    cta: "Buka Audit WA",
  },
  {
    id: "digest",
    title: "Morning Digest",
    description:
      "Tahan instruksi non-darurat malam hari ke Antrean Pagi 08:30 WIB lengkap dengan protokol darurat operasional teraudit.",
    href: "/workspace/digest",
    icon: Inbox,
    iconBoxClass: "bg-safe text-white",
    cta: "Lihat Digest Board",
  },
  {
    id: "charter",
    title: "Piagam & Balasan",
    description:
      "Susun Piagam Jam Digital Tim berstempel perusahaan dalam PDF dan siapkan balasan diplomatis untuk di luar jam kerja.",
    href: "/charter",
    icon: FileSignature,
    iconBoxClass: "bg-warn text-white",
    cta: "Susun Piagam",
  },
  {
    id: "simulator",
    title: "Simulator & Wellbeing",
    description:
      "Konversi lembur bayangan ke estimasi kerugian presenteeism Rupiah dan pantau check-in anonim K-Anonymity mingguan.",
    href: "/simulator",
    icon: BarChart3,
    iconBoxClass: "bg-[#44403C] text-white",
    cta: "Buka Simulator",
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      id="fitur"
      className="scroll-mt-20 bg-surface py-16 lg:py-24"
    >
      <ScrollReveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Ekosistem <span className="text-brand">Batas Digital</span> Terpadu
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary sm:text-base">
            Empat modul praktis untuk mengubah kebiasaan kerja always-on menjadi
            ritme komunikasi tim yang terukur dan sehat.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.id}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-4">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBoxClass}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>

                  <div>
                    <h3 className="text-base font-semibold text-ink-primary">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                      {card.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={card.href}
                  className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span>{card.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
}
