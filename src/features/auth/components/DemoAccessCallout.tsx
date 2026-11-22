"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DEMO_ACTORS,
  type DemoActorConfig,
  type DemoActorRole,
} from "@/lib/constants/demo-actors";
import { clearShellContextCache } from "@/lib/storage/shell-context-cache";

interface DemoAccessCalloutProps {
  redirectTo?: string;
}

export function DemoAccessCallout({
  redirectTo = "/workspace",
}: DemoAccessCalloutProps) {
  const router = useRouter();
  const [loadingActor, setLoadingActor] = useState<DemoActorRole | null>(null);

  async function handleDemoAccess(actorConfig: DemoActorConfig) {
    if (loadingActor) return;
    setLoadingActor(actorConfig.actor);
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: actorConfig.actor }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };

      if (!response.ok || !payload.success) {
        toast.error(
          payload.error?.message ?? "Gagal masuk ke workspace demo."
        );
        return;
      }

      clearShellContextCache();
      toast.success(
        `Masuk sebagai ${actorConfig.fullName} (${actorConfig.shortLabel}).`
      );
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat membuka workspace demo.");
    } finally {
      setLoadingActor(null);
    }
  }

  return (
    <section
      aria-label="Akses Cepat Evaluasi"
      className="flex flex-col gap-3 rounded-lg border border-brand-border bg-brand-soft p-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-brand">
          Akses Cepat Evaluasi (Pilih Aktor Demo)
        </h2>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Masuk instan ke workspace Tim Kreatif Nusantara sesuai peran yang
          ingin diuji tanpa mendaftar akun.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {DEMO_ACTORS.map((item) => {
          const isThisLoading = loadingActor === item.actor;
          return (
            <button
              key={item.actor}
              type="button"
              onClick={() => handleDemoAccess(item)}
              disabled={loadingActor !== null}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-brand-border bg-surface px-3.5 py-2.5 text-left transition-colors hover:border-brand hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink-primary">
                    {item.fullName}
                  </span>
                  <span className="rounded bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand">
                    {item.actor}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {item.roleTitle}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  {item.description}
                </p>
              </div>

              {isThisLoading ? (
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin text-brand"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ) : (
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-brand"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
