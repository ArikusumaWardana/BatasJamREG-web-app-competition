import { Check, Lock } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

interface AuthSplitShellProps {
  children: React.ReactNode;
}

const VALUE_CHECKLIST = [
  "Pantau status jam reguler dan hitung mundur Morning Digest secara real-time.",
  "Tahan pesan non-darurat malam hari tanpa mengganggu WhatsApp pribadi.",
  "Simpan riwayat statistik audit anonim tanpa pernah mengunggah teks chat.",
];

export function AuthSplitShell({ children }: AuthSplitShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="flex flex-col justify-between gap-8 border-b border-border-hairline bg-surface-subtle p-6 sm:p-10 lg:border-r lg:border-b-0 lg:p-14">
        <div>
          <BrandLogo href="/" size="md" />
        </div>

        <div className="my-auto flex max-w-lg flex-col gap-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Bangun ritme kerja asinkron yang sehat untuk tim Anda.
          </h1>
          <ul className="flex flex-col gap-4">
            {VALUE_CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand">
                  <Check className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed text-ink-secondary sm:text-base">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
          <Lock className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span>Dilindungi Row-Level Security dan Zero-Upload Firewall</span>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-surface p-6 sm:p-10">
        <div className="flex w-full max-w-[420px] flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
