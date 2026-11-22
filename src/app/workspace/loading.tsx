import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";

export default function WorkspaceLoading() {
  return (
    <PageLoadingOverlay
      variant="panel"
      message="Sedang memuat ringkasan workspace..."
    />
  );
}
