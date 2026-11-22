"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEMO_ACTORS,
  getDemoActorConfig,
  type DemoActorRole,
} from "@/lib/constants/demo-actors";
import { clearShellContextCache } from "@/lib/storage/shell-context-cache";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AppShellUser } from "./SidebarNav";

interface SidebarFooterProps {
  mode: "authenticated" | "guest" | "loading";
  user?: AppShellUser | null;
  onNavigate?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BJ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function SidebarFooter({ mode, user, onNavigate }: SidebarFooterProps) {
  const router = useRouter();
  const [selectedActor, setSelectedActor] = useState<DemoActorRole>("OWNER");
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);

  const actorConfig = getDemoActorConfig(selectedActor);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Gagal keluar akun. Silakan coba lagi.");
        return;
      }
      clearShellContextCache();
      setConfirmLogoutOpen(false);
      toast.success("Berhasil keluar dari workspace.");
      onNavigate?.();
      router.push("/auth/login");
      router.refresh();
    } catch {
      toast.error("Terjadi gangguan jaringan saat keluar akun.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleDemoLogin() {
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
      toast.success(
        `Masuk sebagai ${actorConfig.fullName} (${actorConfig.shortLabel}).`
      );
      onNavigate?.();
      router.push("/workspace");
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat membuka workspace demo.");
    } finally {
      setIsEnteringDemo(false);
    }
  }

  if (mode === "loading") {
    return (
      <div className="mt-6 flex items-center gap-2.5 border-t border-border-hairline pt-4 text-xs text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin text-brand" strokeWidth={1.5} aria-hidden="true" />
        <span>Menyiapkan sesi...</span>
      </div>
    );
  }

  if (mode === "authenticated" && user) {
    return (
      <>
        <div className="mt-6 flex items-center justify-between gap-2 border-t border-border-hairline pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-soft font-mono text-xs font-medium text-brand">
              {getInitials(user.fullName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink-primary">
                {user.fullName}
              </p>
              <p className="truncate text-[11px] text-ink-secondary">
                {user.roleTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmLogoutOpen(true)}
            disabled={isLoggingOut}
            aria-label="Keluar dari akun"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink-primary disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>

        <Dialog
          open={confirmLogoutOpen}
          onOpenChange={(nextOpen) => {
            if (!isLoggingOut) {
              setConfirmLogoutOpen(nextOpen);
            }
          }}
        >
          <DialogContent className="border border-border-hairline bg-surface sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-ink-primary">
                Konfirmasi Keluar Akun
              </DialogTitle>
              <DialogDescription className="text-sm text-ink-secondary">
                Apakah Anda yakin ingin keluar dari akun {user.fullName}? Sesi
                workspace saat ini akan diakhiri.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="border-border-hairline bg-canvas">
              <Button
                type="button"
                variant="outline"
                disabled={isLoggingOut}
                onClick={() => setConfirmLogoutOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="bg-danger text-white hover:bg-danger/90"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                    <span>Keluar...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    <span>Ya, Logout</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-2 border-t border-border-hairline pt-4">
      <div
        role="group"
        aria-label="Pilih aktor demo"
        className="grid grid-cols-3 gap-1 rounded-md border border-border-hairline bg-surface-muted p-0.5"
      >
        {DEMO_ACTORS.map((item) => (
          <button
            key={item.actor}
            type="button"
            disabled={isEnteringDemo}
            aria-pressed={selectedActor === item.actor}
            onClick={() => setSelectedActor(item.actor)}
            className={cn(
              "rounded-sm px-1.5 py-1 text-[11px] font-medium transition-colors",
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
        onClick={handleDemoLogin}
        disabled={isEnteringDemo}
        className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
      >
        {isEnteringDemo ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
            <span>Membuka Demo...</span>
          </>
        ) : (
          <span>Masuk Demo ({actorConfig.shortLabel})</span>
        )}
      </button>
      <Link
        href="/auth/login"
        onClick={onNavigate}
        className="py-1 text-center text-xs font-medium text-brand hover:underline"
      >
        Masuk dengan Email
      </Link>
    </div>
  );
}
