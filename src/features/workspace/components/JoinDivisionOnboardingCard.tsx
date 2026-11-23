"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setStoredActiveWorkspaceId } from "@/lib/storage/active-workspace";

interface JoinDivisionOnboardingCardProps {
  onCompleted: (workspaceId?: string) => void;
}

export function JoinDivisionOnboardingCard({
  onCompleted,
}: JoinDivisionOnboardingCardProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const canJoin = inviteCode.trim().length >= 4 && !isJoining;

  async function handleJoinSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canJoin) return;

    setIsJoining(true);
    try {
      const response = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
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

      setStoredActiveWorkspaceId(payload.data.workspace_id);
      toast.success("Berhasil bergabung ke divisi tim.");
      router.refresh();
      onCompleted(payload.data.workspace_id);
    } catch {
      toast.error("Koneksi terputus saat memproses kode undangan.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <article className="flex flex-col justify-between gap-5 rounded-lg border border-border-hairline bg-surface p-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-safe">
          <KeyRound className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>Untuk Anggota Tim</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-ink-primary">
          Gabung ke Divisi dengan Kode Undangan (Menjadi Member)
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
          Sudah mendapat kode undangan seperti REG-8492 atau REG-4105 dari
          Owner atau Team Lead? Masukkan kodenya di sini untuk langsung masuk ke
          divisi Anda.
        </p>
      </div>

      <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="onboard-invite-code"
            className="text-xs font-medium text-ink-primary"
          >
            Kode Undangan Divisi
          </Label>
          <Input
            id="onboard-invite-code"
            type="text"
            placeholder="Contoh: REG-8492"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            className="h-10 rounded-md border-border-hairline bg-surface px-3 font-mono text-sm uppercase"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!canJoin}
          className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
        >
          {isJoining ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
              <span>Memverifikasi Kode...</span>
            </>
          ) : (
            <span>Gabung ke Divisi</span>
          )}
        </button>
      </form>
    </article>
  );
}
