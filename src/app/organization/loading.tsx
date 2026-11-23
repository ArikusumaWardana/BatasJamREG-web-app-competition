import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";

export default function OrganizationLoading() {
  return (
    <PageLoadingOverlay
      variant="panel"
      message="Sedang memuat ringkasan perusahaan..."
    />
  );
}
