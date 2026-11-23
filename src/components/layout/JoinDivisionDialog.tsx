"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinDivisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoined: (workspaceId: string) => void;
}

export function JoinDivisionDialog({
  open,
  onOpenChange,
  onJoined,
}: JoinDivisionDialogProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = inviteCode.trim().toUpperCase();
    if (cleaned.length < 4 || isJoining) return;

    setIsJoining(true);
    try {
      const response = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: cleaned }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: { workspace_id: string; role: string };
        error?: { message?: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        toast.error(
          payload.error?.message ?? "Kode undangan divisi tidak ditemukan."
        );
        return;
      }

      toast.success("Berhasil bergabung ke divisi melalui kode undangan.");
      setInviteCode("");
      onOpenChange(false);
      onJoined(payload.data.workspace_id);
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat memproses kode undangan.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isJoining) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="border border-border-hairline bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-ink-primary">
            <KeyRound
              className="h-4 w-4 text-brand"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Gabung Divisi via Kode Undangan</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-secondary">
            Masukkan kode undangan divisi dari Owner atau Team Lead Anda
            (misalnya REG-4105).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="switcher-join-code"
              className="text-xs font-medium text-ink-primary"
            >
              Kode Undangan Divisi
            </Label>
            <Input
              id="switcher-join-code"
              type="text"
              placeholder="Contoh: REG-4105"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              className="h-10 rounded-md border-border-hairline bg-surface px-3 font-mono text-sm uppercase"
              required
            />
          </div>

          <DialogFooter className="border-border-hairline bg-canvas">
            <button
              type="submit"
              disabled={inviteCode.trim().length < 4 || isJoining}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>Bergabung...</span>
                </>
              ) : (
                <span>Gabung ke Divisi</span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
