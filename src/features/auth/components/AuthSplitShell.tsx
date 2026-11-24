import Link from "next/link";
import { ArrowLeft, Check, Lock, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

interface AuthSplitShellProps {
  children: React.ReactNode;
  activeMode?: "login" | "register";
}

const VALUE_CHECKLIST = [
  "Pantau status jam reguler dan hitung mundur Morning Digest secara real-time.",
  "Tahan pesan non-darurat malam hari tanpa mengganggu WhatsApp pribadi.",
  "Simpan riwayat statistik audit anonim tanpa pernah mengunggah teks chat.",
];

const MINI_BARS = [62, 84, 54, 72, 68, 40, 28];

export function AuthSplitShell({ children, activeMode }: AuthSplitShellProps) {
  return (
    <div className="min-h-screen overflow-x-clip bg-bento-canvas text-ink-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col gap-4 p-3 sm:gap-5 sm:p-5 lg:p-6">
        <header className="flex items-center justify-between gap-2 rounded-full border border-stone-200/80 bg-surface px-3.5 py-2 shadow-[0_2px_12px_rgba(28,25,23,0.04)] sm:px-5">
          <BrandLogo href="/" size="sm" />

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/audit?demo=true"
              className="hidden min-h-[38px] items-center justify-center rounded-full bg-brand-soft px-4 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand hover:text-white sm:inline-flex"
            >
              Audit Lokal
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Beranda</span>
            </Link>
          </div>
        </header>

        <div className="my-auto grid w-full grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          <aside className="order-2 flex flex-col justify-between gap-6 rounded-[24px] bg-brand p-6 text-white shadow-[0_2px_12px_rgba(28,25,23,0.04)] sm:p-8 lg:order-1 lg:col-span-5">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>Digital Wellbeing (SDG 3.4)</span>
              </span>

              <h1 className="text-2xl leading-snug font-semibold tracking-tight text-white sm:text-3xl">
                Bangun ritme kerja asinkron{" "}
                <span className="font-normal text-white/80">
                  yang sehat untuk tim Anda.
                </span>
              </h1>

              <div className="rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur-xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-medium text-white/75">
                      Skor Batas Digital
                    </p>
                    <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums">
                      86<span className="text-xs font-normal text-white/75">/100</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold">
                      Grade A
                    </span>
                    <span className="font-mono text-[11px] text-white/80 tabular-nums">
                      08:30 WIB - 3 Tertahan
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-7 items-end gap-1.5">
                  {MINI_BARS.map((height, idx) => (
                    <div
                      key={idx}
                      className="flex h-10 flex-col justify-end overflow-hidden rounded-full bg-white/15 p-0.5"
                    >
                      <div
                        className="w-full rounded-full bg-amber-300/80"
                        style={{ height: `${Math.max(18, Math.round(height * 0.28))}%` }}
                      />
                      <div
                        className="mt-0.5 w-full rounded-full bg-white/85"
                        style={{ height: `${Math.round(height * 0.72)}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <ul className="flex flex-col gap-3">
                {VALUE_CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                      <Check className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-xs leading-relaxed text-white/90 sm:text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/15 pt-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/12 px-3 py-1 font-mono text-[11px] font-medium text-white/95">
                  Zero-Upload Firewall
                </span>
                <span className="rounded-full bg-white/12 px-3 py-1 font-mono text-[11px] font-medium text-white/95">
                  Row-Level Security
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>Dilindungi Row-Level Security dan Zero-Upload Firewall</span>
              </div>
            </div>
          </aside>

          <main className="order-1 flex items-center justify-center rounded-[24px] border border-stone-200/80 bg-surface p-5 shadow-[0_2px_12px_rgba(28,25,23,0.03)] sm:p-8 lg:order-2 lg:col-span-7 lg:p-10">
            <div className="flex w-full max-w-[440px] flex-col gap-5">
              {activeMode ? (
                <nav
                  aria-label="Mode autentikasi"
                  className="grid grid-cols-2 gap-1 rounded-full border border-stone-200/80 bg-stone-100/80 p-1"
                >
                  <Link
                    href="/auth/login"
                    aria-current={activeMode === "login" ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-[38px] items-center justify-center rounded-full px-4 text-xs font-semibold transition-colors",
                      activeMode === "login"
                        ? "bg-brand text-white shadow-2xs"
                        : "text-ink-secondary hover:text-ink-primary"
                    )}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    aria-current={activeMode === "register" ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-[38px] items-center justify-center rounded-full px-4 text-xs font-semibold transition-colors",
                      activeMode === "register"
                        ? "bg-brand text-white shadow-2xs"
                        : "text-ink-secondary hover:text-ink-primary"
                    )}
                  >
                    Daftar
                  </Link>
                </nav>
              ) : null}

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
