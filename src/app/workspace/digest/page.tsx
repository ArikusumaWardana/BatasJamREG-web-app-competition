import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { DigestBoardClient } from "@/features/digest/components/DigestBoardClient";

export const metadata: Metadata = {
  title: "Morning Digest Board - BatasJamREG",
  description:
    "Papan antrean instruksi asinkron malam hari dan generator rangkuman WhatsApp untuk dikirim pada jam kerja.",
};

export default function DigestPage() {
  return (
    <Suspense
      fallback={
        <PageLoadingOverlay
          variant="panel"
          message="Sedang memuat papan Morning Digest..."
        />
      }
    >
      <DigestBoardClient />
    </Suspense>
  );
}
