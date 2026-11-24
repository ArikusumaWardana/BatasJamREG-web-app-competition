"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DEMO_ACTORS,
  getDemoActorConfig,
  type DemoActorRole,
} from "@/lib/constants/demo-actors";
import { clearStoredActiveWorkspaceId } from "@/lib/storage/active-workspace";
import { clearShellContextCache } from "@/lib/storage/shell-context-cache";
import { cn } from "@/lib/utils";

interface GuestDemoLoginPopoverProps {
  onClose: () => void;
  onStartNavigation?: (href: string) => void;
}

export function GuestDemoLoginPopover({
  onClose,
  onStartNavigation,
}: GuestDemoLoginPopoverProps) {
  const router = useRouter();
  const [selectedActor, setSelectedActor] = useState<DemoActorRole>("OWNER");
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);

  const actorConfig = getDemoActorConfig(selectedActor);

  async function handleDemoLogin() {
    if (isEnteringDemo) return;
    setIsEnteringDemo(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: selectedActor }),
      });
      if (!res.ok) {
        toast.error("Gagal masuk ke workspace demo.");
        return;
      }
      clearShellContextCache();
      clearStoredActiveWorkspaceId();
      onClose();
      toast.success(
        `Masuk sebagai ${actorConfig.fullName} (${actorConfig.shortLabel}).`
      );
      router.push("/workspace");
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat membuka workspace demo.");
    } finally {
      setIsEnteringDemo(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Akses Workspace Demo atau Login"
      className="absolute right-0 z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-[20px] border border-stone-200/80 bg-surface p-4 shadow-[0_8px_24px_rgba(28,25,23,0.08)]"
    >
      <p className="text-xs font-semibold text-ink-primary">
        Mode Tamu (Audit 100% Lokal)
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
        Pilih peran untuk masuk instan ke Workspace Demo atau login dengan email.
      </p>

      <div
        role="group"
        aria-label="Pilih aktor demo"
        className="mt-3 grid grid-cols-3 gap-1 rounded-full border border-stone-200 bg-stone-100/80 p-1"
      >
        {DEMO_ACTORS.map((item) => (
          <button
            key={item.actor}
            type="button"
            disabled={isEnteringDemo}
            aria-pressed={selectedActor === item.actor}
            onClick={() => setSelectedActor(item.actor)}
            className={cn(
              "rounded-full px-2 py-1 text-[11px] font-medium transition-colors",
              selectedActor === item.actor
                ? "bg-surface text-ink-primary shadow-2xs"
                : "text-ink-secondary hover:text-ink-primary"
            )}
          >
            {item.shortLabel === "Team Lead" ? "Lead" : item.shortLabel}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={isEnteringDemo}
        onClick={() => void handleDemoLogin()}
        className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
      >
        {isEnteringDemo ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} aria-hidden="true" />
            <span>Membuka Demo...</span>
          </>
        ) : (
          <span>Masuk Demo ({actorConfig.shortLabel})</span>
        )}
      </button>

      <Link
        href="/auth/login"
        onClick={() => {
          onClose();
          onStartNavigation?.("/auth/login");
        }}
        className="mt-2 block py-1 text-center text-xs font-medium text-brand hover:underline"
      >
        Masuk dengan Email
      </Link>
    </div>
  );
}
