import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { PublicAppShell } from "@/components/layout/PublicAppShell";
import { AuditPageClient } from "@/features/audit/components/AuditPageClient";

export const metadata: Metadata = {
  title: "Audit WA Lokal - BatasJamREG",
  description:
    "Audit lembur bayangan dan pola interupsi luar jam kerja dari ekspor chat WhatsApp secara lokal tanpa unggah ke server.",
};

function AuditPageFallback() {
  return (
    <PageLoadingOverlay
      variant="panel"
      message="Sedang menyiapkan halaman Audit WA Lokal..."
    />
  );
}

export default function AuditPage() {
  return (
    <PublicAppShell>
      <Suspense fallback={<AuditPageFallback />}>
        <AuditPageClient />
      </Suspense>
    </PublicAppShell>
  );
}
