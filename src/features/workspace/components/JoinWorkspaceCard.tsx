"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  BENTO_CARD_CLS,
  BENTO_PILL_OUTLINE_CLS,
  BentoCardHeader,
} from "@/components/shared/BentoPrimitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

interface JoinWorkspaceCardProps {
  inviteCode?: string | null;
  memberCount?: number;
  organizationId?: string | null;
  canCreateDivision?: boolean;
  onWorkspaceSelected: (workspaceId: string) => void;
}

export function JoinWorkspaceCard({
  inviteCode,
  memberCount,
  organizationId,
  canCreateDivision = true,
  onWorkspaceSelected,
}: JoinWorkspaceCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function handleCopyInvite() {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success(`Kode undangan ${inviteCode} disalin ke clipboard.`);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Gagal menyalin kode undangan.");
    }
  }

  async function handleJoinSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length < 4 || isJoining) return;

    setIsJoining(true);
    try {
      const response = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: trimmed }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: { workspace_id: string; role: string };
        error?: { message?: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        toast.error(
          payload.error?.message ?? "Kode undangan workspace tidak ditemukan."
        );
        return;
      }

      setJoinCode("");
      toast.success("Berhasil bergabung ke workspace tim.");
      onWorkspaceSelected(payload.data.workspace_id);
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat memproses kode undangan.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <article className={`flex h-full flex-col gap-4 ${BENTO_CARD_CLS}`}>
      <BentoCardHeader
        icon={<Users className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        title="Akses Anggota Tim"
        rightSlot={
          typeof memberCount === "number" ? (
            <span className="rounded-full bg-stone-100 px-3 py-1 font-mono text-xs font-medium tabular-nums text-ink-secondary">
              {memberCount} Anggota
            </span>
          ) : null
        }
      />

      {inviteCode ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-secondary">
            Kode Undangan Workspace
          </span>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-full border border-stone-200 bg-bento-canvas/50 px-4 py-2 font-mono text-sm font-medium tracking-wider tabular-nums text-ink-primary">
              {inviteCode}
            </div>
            <button
              type="button"
              onClick={handleCopyInvite}
              className={BENTO_PILL_OUTLINE_CLS}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-safe" strokeWidth={1.5} aria-hidden="true" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-ink-secondary" strokeWidth={1.5} aria-hidden="true" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleJoinSubmit}
        className={`flex flex-col gap-1.5 ${
          inviteCode ? "border-t border-stone-100 pt-4" : ""
        }`}
      >
        <Label
          htmlFor="join-invite-code"
          className="text-xs font-medium text-ink-secondary"
        >
          Gabung Workspace dengan Kode Undangan
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="join-invite-code"
            type="text"
            placeholder="Contoh: REG-8492"
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-full border-stone-200 bg-surface px-4 font-mono text-sm uppercase text-ink-primary"
          />
          <button
            type="submit"
            disabled={joinCode.trim().length < 4 || isJoining}
            className={BENTO_PILL_OUTLINE_CLS}
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                <span>Bergabung...</span>
              </>
            ) : (
              <span>Gabung</span>
            )}
          </button>
        </div>
      </form>

      {canCreateDivision ? (
        <div className="mt-auto border-t border-stone-100 pt-3">
          <CreateWorkspaceDialog
            organizationId={organizationId}
            onCreated={onWorkspaceSelected}
          />
        </div>
      ) : null}
    </article>
  );
}
