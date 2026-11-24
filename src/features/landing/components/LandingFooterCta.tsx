import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { DemoLoginActionButton } from "./DemoLoginActionButton";

const PRODUCT_LINKS = [
  { href: "/audit", label: "Audit WA Lokal" },
  { href: "/simulator", label: "Simulator Biaya" },
  { href: "/charter", label: "Piagam & Balasan" },
  { href: "/workspace/digest", label: "Morning Digest" },
];

const WORKSPACE_LINKS = [
  { href: "/workspace", label: "Ringkasan Tim" },
  { href: "/organization", label: "Ringkasan Perusahaan" },
  { href: "/auth/login", label: "Masuk" },
  { href: "/auth/register", label: "Daftar" },
];

const COMMITMENTS = [
  "Zero-Upload Privacy",
  "K-Anonymity Wellbeing Pulse",
  "Multi-Tenant RLS",
];

export function LandingFooterCta() {
  return (
    <div className="bg-surface">
      <div className="relative z-10 mx-auto -mb-12 max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand p-6 text-white shadow-lg sm:p-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Siap Membangun Budaya Kerja yang Lebih Sehat?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80">
              Mulai dari audit chat lokal di perangkat atau masuk langsung ke
              workspace demo untuk melihat alur kerja lengkap tim Anda.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <DemoLoginActionButton
              variant="outline-white"
              label="Coba Demo 1-Klik"
              showIcon={false}
            />
            <Link
              href="/auth/register"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-brand transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-[#EDEBE4]/80 pt-24 pb-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="flex flex-col gap-3">
            <BrandLogo href="/" size="sm" />
            <p className="text-xs leading-relaxed text-ink-secondary sm:text-sm">
              Platform pengukur lembur bayangan dan penegak batas jam kerja
              digital untuk mendukung SDG 3 Good Health and Well-being bagi
              pekerja Indonesia.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
              Produk
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {PRODUCT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-secondary transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
              Workspace
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {WORKSPACE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-secondary transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
              Komitmen
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {COMMITMENTS.map((item) => (
                <li
                  key={item}
                  className="text-sm font-medium text-ink-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>

      <div className="bg-brand py-3.5 text-center text-xs text-white/90">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          © 2026 BatasJamREG. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </div>
  );
}
