import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";

export default function DigestLoading() {
  return (
    <PageLoadingOverlay
      variant="panel"
      message="Sedang memuat papan Morning Digest..."
    />
  );
}
