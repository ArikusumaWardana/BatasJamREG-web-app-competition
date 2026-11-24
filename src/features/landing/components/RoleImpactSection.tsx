import { Building2, Check, UserCheck, Users } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const ROLE_CARDS = [
  {
    id: "owner",
    badge: "OWNER & HRD",
    title: "Owner & HRD",
    description:
      "Memantau seluruh divisi tanpa ikut campur operasional harian, lengkap dengan laporan eksekutif PDF dan stempel resmi perusahaan.",
    icon: Building2,
    featured: false,
    points: [
      "Ringkasan skor batas kerja lintas divisi",
      "Unggah stempel resmi perusahaan pada piagam",
      "Ekspor laporan eksekutif PDF siap presentasi",
    ],
  },
  {
    id: "lead",
    badge: "TEAM LEAD",
    title: "Team Lead",
    description:
      "Mengelola Morning Digest, menyaring eskalasi darurat semu, dan memantau tren penurunan lembur bayangan tim.",
    icon: Users,
    featured: true,
    points: [
      "Kirim rangkuman antrean pagi pukul 08:30 WIB",
      "Evaluasi rasio darurat valid vs darurat semu",
      "Bandingkan skor audit Before vs After piagam",
    ],
  },
  {
    id: "member",
    badge: "ANGGOTA TIM",
    title: "Anggota Tim",
    description:
      "Mendapat kepastian jam istirahat, balasan diplomatis siap salin, tautan status publik untuk klien, serta check-in kesejahteraan anonim.",
    icon: UserCheck,
    featured: false,
    points: [
      "Balasan sopan siap salin untuk chat malam",
      "Tautan status jam kerja publik & bio WhatsApp",
      "Check-in 15 detik anonim terlindungi K-Anonymity",
    ],
  },
] as const;

export function RoleImpactSection() {
  return (
    <section
      id="dampak"
      className="scroll-mt-20 bg-[#F6F5F1] py-16 lg:py-24"
    >
      <ScrollReveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Dirancang untuk <span className="text-brand">Setiap Peran</span> di
            Perusahaan
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary sm:text-base">
            Seluruh anggota organisasi memiliki kejelasan hak dan tanggung jawab
            atas jam kerja digital yang sehat.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {ROLE_CARDS.map((role) => {
            const Icon = role.icon;
            return (
              <article
                key={role.id}
                className={`flex flex-col justify-between gap-5 rounded-2xl border bg-surface p-6 transition-all ${
                  role.featured
                    ? "border-brand/25 shadow-md ring-1 ring-brand/10 md:-translate-y-2"
                    : "border-stone-200/80 shadow-sm"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        role.featured
                          ? "bg-brand text-white"
                          : "bg-brand-soft text-brand"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 font-mono text-[10px] font-semibold tracking-wide text-ink-secondary">
                      {role.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-ink-primary">
                      {role.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                      {role.description}
                    </p>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 border-t border-stone-100 pt-4">
                  {role.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-xs text-ink-primary">
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-safe"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
}
