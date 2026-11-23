import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

export default function PublicStatusNotFound() {
  return (
    <main className="min-h-screen bg-canvas px-4 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
        <header>
          <BrandLogo href="/" size="sm" />
        </header>

        <section className="flex flex-col items-start gap-3 rounded-lg border border-border-hairline bg-surface p-6">
          <div className="flex items-center gap-2 text-warn">
            <AlertCircle
              className="h-5 w-5 shrink-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h1 className="text-lg font-semibold text-ink-primary">
              Halaman Status Divisi Tidak Ditemukan
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Tautan status komunikasi ini tidak terdaftar atau slug divisi telah
            berubah. Pastikan alamat tautan sesuai dengan yang dibagikan tim
            terkait.
          </p>
          <Link
            href="/"
            className="mt-1 inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Kembali ke Beranda
          </Link>
        </section>
      </div>
    </main>
  );
}
