"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Users } from "lucide-react";
import { toast } from "sonner";
import {
  DEMO_ROLE_USERS,
  getDemoActorConfig,
  type DemoRoleUserOption,
} from "@/lib/constants/demo-actors";
import { clearShellContextCache } from "@/lib/storage/shell-context-cache";
import { DemoActorPickerDialog } from "./DemoActorPickerDialog";

interface DemoAccessCalloutProps {
  redirectTo?: string;
}

export function DemoAccessCallout({
  redirectTo = "/workspace",
}: DemoAccessCalloutProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  async function handleSelectUser(user: DemoRoleUserOption) {
    if (loadingEmail) return;
    setLoadingEmail(user.email);
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: user.actor, email: user.email }),
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
      const roleConfig = getDemoActorConfig(user.actor);
      toast.success(`Masuk sebagai ${user.fullName} (${roleConfig.shortLabel}).`);
      setDialogOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat membuka workspace demo.");
    } finally {
      setLoadingEmail(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        disabled={loadingEmail !== null}
        className="group flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-soft/80 px-4 py-3 text-left transition-all hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <Users className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink-primary">
                Masuk Workspace Demo
              </span>
              <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-brand">
                {DEMO_ROLE_USERS.length} Akun
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-ink-secondary">
              Pilih role Owner, Team Lead, atau Anggota tanpa daftar
            </p>
          </div>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </span>
      </button>

      <DemoActorPickerDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (loadingEmail === null) {
            setDialogOpen(open);
          }
        }}
        loadingEmail={loadingEmail}
        onSelectUser={(user) => void handleSelectUser(user)}
      />
    </>
  );
}
