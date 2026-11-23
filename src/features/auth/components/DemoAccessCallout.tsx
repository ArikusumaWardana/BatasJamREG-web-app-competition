"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  DEMO_ACTORS,
  getDemoActorConfig,
  getDemoUsersByRole,
  type DemoActorRole,
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
  const [selectedRole, setSelectedRole] = useState<DemoActorRole | null>(null);
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
      setSelectedRole(null);
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat membuka workspace demo.");
    } finally {
      setLoadingEmail(null);
    }
  }

  const activeRoleConfig = selectedRole ? getDemoActorConfig(selectedRole) : null;
  const activeRoleUsers = selectedRole ? getDemoUsersByRole(selectedRole) : [];

  return (
    <>
      <section
        aria-label="Akses Cepat Evaluasi"
        className="flex flex-col gap-3 rounded-lg border border-brand-border bg-brand-soft p-4"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-brand">
            Akses Cepat Evaluasi (Pilih Role Aktor)
          </h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Pilih role aktor yang ingin diuji untuk melihat daftar pengguna demo
            dan langsung masuk tanpa mendaftar akun.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {DEMO_ACTORS.map((item) => {
            const roleCount = getDemoUsersByRole(item.actor).length;
            return (
              <button
                key={item.actor}
                type="button"
                onClick={() => setSelectedRole(item.actor)}
                disabled={loadingEmail !== null}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-brand-border bg-surface px-3.5 py-2.5 text-left transition-colors hover:border-brand hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-primary">
                      {item.shortLabel}
                    </span>
                    <span className="rounded bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand">
                      {item.actor}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-ink-muted">
                      {roleCount} pengguna
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-secondary">
                    {item.description}
                  </p>
                </div>

                <ChevronRight
                  className="h-4 w-4 shrink-0 text-brand"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </section>

      <DemoActorPickerDialog
        open={selectedRole !== null}
        onOpenChange={(open) => {
          if (!open && loadingEmail === null) {
            setSelectedRole(null);
          }
        }}
        roleConfig={activeRoleConfig}
        users={activeRoleUsers}
        loadingEmail={loadingEmail}
        onSelectUser={(user) => void handleSelectUser(user)}
      />
    </>
  );
}
