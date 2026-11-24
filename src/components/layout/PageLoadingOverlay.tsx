import { Loader2 } from "lucide-react";

interface PageLoadingOverlayProps {
  variant?: "overlay" | "panel";
  title?: string;
  message?: string;
}

export function PageLoadingOverlay({
  variant = "panel",
  title = "Mohon tunggu sebentar",
  message = "Sedang memproses halaman...",
}: PageLoadingOverlayProps) {
  const isOverlay = variant === "overlay";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={
        isOverlay
          ? "absolute inset-0 z-20 flex min-h-[68vh] items-start justify-center rounded-[24px] bg-bento-canvas/75 px-4 backdrop-blur-[2px]"
          : "flex min-h-[68vh] w-full items-start justify-center px-4 pt-[20vh]"
      }
    >
      <div
        className={
          isOverlay
            ? "sticky top-[34vh] mt-[20vh] flex w-full max-w-xs flex-col items-center gap-3.5 rounded-[24px] border border-stone-200/80 bg-surface px-7 py-6 text-center shadow-[0_8px_28px_rgba(28,25,23,0.06)]"
            : "flex w-full max-w-xs flex-col items-center gap-3.5 rounded-[24px] border border-stone-200/80 bg-surface px-7 py-6 text-center shadow-[0_8px_28px_rgba(28,25,23,0.06)]"
        }
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border/70 bg-brand-soft">
          <Loader2
            className="h-5 w-5 animate-spin text-brand"
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
