"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getDemoActorConfig,
  type DemoActorRole,
} from "@/lib/constants/demo-actors";
import { clearShellContextCache } from "@/lib/storage/shell-context-cache";
import { cn } from "@/lib/utils";

interface DemoLoginActionButtonProps {
  variant?: "solid" | "outline" | "outline-white";
  label?: string;
  loadingLabel?: string;
  actor?: DemoActorRole;
  showIcon?: boolean;
  className?: string;
}

export function DemoLoginActionButton({
  variant = "outline",
  label = "Masuk Workspace Demo",
  loadingLabel = "Membuka Demo...",
  actor = "OWNER",
  showIcon = true,
  className,
}: DemoLoginActionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleEnterDemo() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor }),
      });

      if (!response.ok) {
        toast.error("Gagal masuk ke workspace demo. Silakan coba lagi.");
        return;
      }

      const actorConfig = getDemoActorConfig(actor);
      clearShellContextCache();
      toast.success(
        `Masuk sebagai ${actorConfig.fullName} (${actorConfig.shortLabel}).`
      );
      router.push("/workspace");
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat membuka workspace demo.");
    } finally {
      setIsLoading(false);
    }
  }

  const variantClasses =
    variant === "solid"
      ? "bg-brand text-white hover:bg-brand-hover"
      : variant === "outline-white"
        ? "border border-white/70 bg-transparent text-white hover:bg-white/15"
        : "border border-brand/30 bg-surface text-brand hover:bg-brand-soft";

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => void handleEnterDemo()}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses,
        className
      )}
    >
      {isLoading ? (
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ) : showIcon ? (
        <LayoutDashboard
          className="h-4 w-4 shrink-0"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ) : null}
      <span>{isLoading ? loadingLabel : label}</span>
    </button>
  );
}
