"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const NAV_LINKS = [
  { href: "#beranda", label: "Beranda" },
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#privasi", label: "Privasi" },
  { href: "#dampak", label: "Dampak" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" size="sm" />

        <nav
          aria-label="Navigasi halaman utama"
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-sm text-sm font-medium text-ink-secondary transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            href="/auth/login"
            prefetch={false}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-stone-100 hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Masuk
          </Link>
          <Link
            href="/audit?demo=true"
            className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Coba Demo
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="landing-mobile-menu"
          aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-surface text-ink-primary transition-colors hover:bg-surface-muted md:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen ? (
        <div
          id="landing-mobile-menu"
          className="border-t border-stone-200/70 bg-white px-4 py-4 shadow-sm md:hidden"
        >
          <nav
            aria-label="Menu navigasi seluler"
            className="flex flex-col gap-1"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[42px] items-center rounded-xl px-3 text-sm font-medium text-ink-primary transition-colors hover:bg-stone-100 hover:text-brand"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-3 flex flex-col gap-2 border-t border-stone-200/70 pt-3">
            <Link
              href="/auth/login"
              prefetch={false}
              onClick={() => setMobileOpen(false)}
              className="inline-flex min-h-[42px] w-full items-center justify-center rounded-full border border-stone-200 bg-surface px-4 py-2 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-muted"
            >
              Masuk
            </Link>
            <Link
              href="/audit?demo=true"
              onClick={() => setMobileOpen(false)}
              className="inline-flex min-h-[42px] w-full items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              Coba Demo
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
