import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { PublicStatusCard } from "@/features/workspace/components/PublicStatusCard";
import { getPublicWorkspaceStatus } from "@/features/workspace/lib/public-status-server";

export const metadata: Metadata = {
  title: "Status Jam Kerja Tim - BatasJamREG",
  description:
    "Informasi publik jam kerja reguler, jadwal Morning Digest, SLA balasan non-darurat, dan kriteria eskalasi darurat tim.",
};

async function PublicStatusLoader({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const status = await getPublicWorkspaceStatus(slug);

  if (!status) {
    notFound();
  }

  return (
    <PublicStatusCard
      status={status}
      initialNowIso={new Date().toISOString()}
    />
  );
}

export default function PublicWorkspaceStatusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center bg-canvas px-4 py-12">
          <PageLoadingOverlay
            variant="panel"
            message="Memuat status jam kerja tim..."
          />
        </main>
      }
    >
      <PublicStatusLoader params={params} />
    </Suspense>
  );
}
