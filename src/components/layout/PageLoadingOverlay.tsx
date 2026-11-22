import { Loader2 } from "lucide-react";

interface PageLoadingOverlayProps {
  variant?: "overlay" | "panel";
  title?: string;
  message?: string;
}

export function PageLoadingOverlay({
  title = "Mohon tunggu sebentar",
  message = "Sedang memproses halaman...",
}: PageLoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="fixed inset-x-0 bottom-0 top-14 z-20 flex items-center justify-center bg-canvas p-6 lg:left-60 lg:top-0"
    >
      <div className="flex flex-col items-center gap-3.5 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border-2 border-brand-border/80"
            aria-hidden="true"
          />
          <Loader2
            className="h-6 w-6 animate-spin text-brand"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold tracking-tight text-ink-primary">
            {title}
          </p>
          <p className="text-xs text-ink-secondary">{message}</p>
        </div>
      </div>
    </div>
  );
}
