import type { Metadata } from "next";
import { OrganizationPageClient } from "@/features/organization/components/OrganizationPageClient";

export const metadata: Metadata = {
  title: "Ringkasan Perusahaan - BatasJamREG",
  description:
    "Pantau seluruh divisi, beban lembur bayangan lintas tim, kode undangan, dan penetapan Team Lead dalam satu organisasi.",
};

export default function OrganizationPage() {
  return <OrganizationPageClient />;
}
