import type { Metadata } from "next";
import { WorkspaceDashboardClient } from "@/features/workspace/components/WorkspaceDashboardClient";

export const metadata: Metadata = {
  title: "Ringkasan Tim - BatasJamREG",
  description:
    "Pantau status jam kerja reguler, riwayat snapshot lembur bayangan, kode undangan tim, dan pengaturan workspace.",
};

export default function WorkspacePage() {
  return <WorkspaceDashboardClient />;
}
