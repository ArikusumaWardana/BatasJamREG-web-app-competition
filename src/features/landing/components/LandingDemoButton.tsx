"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DEMO_ACTORS,
  getDemoActorConfig,
  type DemoActorRole,
} from "@/lib/constants/demo-actors";
import { clearShellContextCache } from "@/lib/storage/shell-context-cache";
import { cn } from "@/lib/utils";

interface LandingDemoButtonProps {
  showAuditCta?: boolean;
}

export function LandingDemoButton({
  showAuditCta = false,
}: LandingDemoButtonProps) {
  const router = useRouter();
  const [selectedActor, setSelectedActor] = useState<DemoActorRole>("OWNER");
  const [isLoading, setIsLoading] = useState(false);

  const actorConfig = getDemoActorConfig(selectedActor);

  async function handleEnterDemo() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: selectedActor }),
      });
      if (!res.ok) {
        toast.error("Gagal masuk ke workspace demo. Silakan coba lagi.");
        return;
      }
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {showAuditCta ? (
          <Link
            href="/audit?demo=true"
            className={buttonVariants({
              size: "lg",
              className: "min-h-[44px] px-5",
            })}
          >
            <Play className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>Coba Audit Demo 1-Klik</span>
          </Link>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isLoading}
          onClick={handleEnterDemo}
          className="min-h-[44px] px-4 text-ink-primary"
        >
          {isLoading ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>Membuka Demo...</span>
            </>
          ) : (
            <>
              <LayoutDashboard
                className="h-4 w-4 text-ink-secondary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>Masuk Demo ({actorConfig.shortLabel})</span>
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-secondary">
        <span className="mr-1">Aktor demo:</span>
        {DEMO_ACTORS.map((item) => (
          <button
            key={item.actor}
            type="button"
            disabled={isLoading}
            aria-pressed={selectedActor === item.actor}
            onClick={() => setSelectedActor(item.actor)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
              selectedActor === item.actor
                ? "border-brand-border bg-brand-soft text-brand"
                : "border-border-hairline bg-surface text-ink-secondary hover:text-ink-primary"
            )}
          >
            {item.shortLabel} ({item.fullName.split(" ")[0]})
          </button>
        ))}
      </div>
    </div>
  );
}
