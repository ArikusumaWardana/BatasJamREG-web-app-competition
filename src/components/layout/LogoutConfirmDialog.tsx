"use client";

import { useState } from "react";
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
import { clearStoredActiveWorkspaceId } from "@/lib/storage/active-workspace";
import { clearShellContextCache } from "@/lib/storage/shell-context-cache";
import { createClient } from "@/lib/supabase/client";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  userName?: string;
  onLoggedOut?: () => void;
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  userName,
  onLoggedOut,
}: LogoutConfirmDialogProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      clearStoredActiveWorkspaceId();
      onOpenChange(false);
      toast.success("Berhasil keluar dari workspace.");
      onLoggedOut?.();
      router.push("/auth/login");
      router.refresh();
    } catch {
      toast.error("Terjadi gangguan jaringan saat keluar akun.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isLoggingOut) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="rounded-[24px] border border-stone-200/80 bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-ink-primary">
            Konfirmasi Keluar Akun
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-secondary">
            Apakah Anda yakin ingin keluar
            {userName ? ` dari akun ${userName}` : ""}? Sesi workspace saat ini
            akan diakhiri.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="border-stone-200/70 bg-canvas">
          <Button
            type="button"
            variant="outline"
            disabled={isLoggingOut}
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            className="rounded-full bg-danger text-white hover:bg-danger/90"
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
  );
}
