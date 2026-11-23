"use client";

import { CreateOrganizationOnboardingCard } from "./CreateOrganizationOnboardingCard";
import { JoinDivisionOnboardingCard } from "./JoinDivisionOnboardingCard";

interface WorkspaceOnboardingProps {
  onCompleted: (workspaceId?: string) => void;
}

export function WorkspaceOnboarding({ onCompleted }: WorkspaceOnboardingProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <section className="rounded-lg border border-border-hairline bg-surface p-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink-primary">
          Selamat Datang di Workspace BatasJamREG
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Pilih jalur penyiapan sesuai peran Anda di perusahaan: daftarkan
          tempat kerja baru sebagai Owner untuk mengelola multi-divisi, atau
          gabung ke divisi yang sudah dibuat dengan kode undangan.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CreateOrganizationOnboardingCard onCompleted={onCompleted} />
        <JoinDivisionOnboardingCard onCompleted={onCompleted} />
      </div>
    </div>
  );
}
