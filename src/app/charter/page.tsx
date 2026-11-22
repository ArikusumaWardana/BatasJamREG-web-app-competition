import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { PublicAppShell } from "@/components/layout/PublicAppShell";
import { CharterPageClient } from "@/features/charter/components/CharterPageClient";

export const metadata: Metadata = {
  title: "Piagam & Balasan - BatasJamREG",
  description:
    "Susun Piagam Jam Digital Tim (PDF) dan variasi balasan diplomatis di luar jam kerja reguler.",
};

function CharterPageFallback() {
  return (
    <PageLoadingOverlay
      variant="panel"
      message="Sedang menyiapkan Studio Piagam & Balasan..."
    />
  );
}

export default function CharterPage() {
  return (
    <PublicAppShell>
      <Suspense fallback={<CharterPageFallback />}>
        <CharterPageClient />
      </Suspense>
    </PublicAppShell>
  );
}
