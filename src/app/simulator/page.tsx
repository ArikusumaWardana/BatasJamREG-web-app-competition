import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { PublicAppShell } from "@/components/layout/PublicAppShell";
import { SimulatorPageClient } from "@/features/simulator/components/SimulatorPageClient";

export const metadata: Metadata = {
  title: "Simulator Biaya - BatasJamREG",
  description:
    "Hitung estimasi kerugian finansial presenteeism, burnout, dan potensi penghematan penerapan BatasJamREG.",
};

function SimulatorFallback() {
  return (
    <PageLoadingOverlay
      variant="panel"
      message="Sedang menyiapkan Simulator Biaya..."
    />
  );
}

export default function SimulatorPage() {
  return (
    <PublicAppShell>
      <Suspense fallback={<SimulatorFallback />}>
        <SimulatorPageClient />
      </Suspense>
    </PublicAppShell>
  );
}
