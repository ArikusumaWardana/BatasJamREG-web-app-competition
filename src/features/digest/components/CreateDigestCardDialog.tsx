"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { saveDigestCardRequest } from "../lib/digest-api";
import type { DigestCardItem, DigestTriageType } from "../types";
import { DigestTriageSelector } from "./DigestTriageSelector";

interface CreateDigestCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  editingCard: DigestCardItem | null;
  onSaved: () => void;
}

function getDefaultScheduledDate(): string {
  const tomorrow = new Date(Date.now() + 86400000);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CreateDigestCardDialog(props: CreateDigestCardDialogProps) {
  const formKey = `${props.open ? "open" : "closed"}:${props.editingCard?.id ?? "new"}`;
  return <DigestCardDialogInner key={formKey} {...props} />;
}

function DigestCardDialogInner({
  open,
  onOpenChange,
  workspaceId,
  editingCard,
  onSaved,
}: CreateDigestCardDialogProps) {
  const router = useRouter();
  const isEditing = editingCard !== null;

  const [title, setTitle] = useState(editingCard?.title ?? "");
  const [body, setBody] = useState(editingCard?.body ?? "");
  const [recipientLabel, setRecipientLabel] = useState(
    editingCard?.recipient_label ?? "Semua Tim"
  );
  const [triageType, setTriageType] = useState<DigestTriageType>(
    editingCard?.triage_type ?? "MORNING_QUEUE"
  );
  const [emergencyReason, setEmergencyReason] = useState(
    editingCard?.emergency_reason ?? ""
  );
  const [scheduledFor, setScheduledFor] = useState(
    editingCard?.scheduled_for ?? getDefaultScheduledDate()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const trimmedRecipient = recipientLabel.trim();
  const trimmedReason = emergencyReason.trim();
  const isEmergency = triageType === "EMERGENCY_OPS";

  const isFormValid =
    trimmedTitle.length >= 3 &&
    trimmedTitle.length <= 140 &&
    trimmedBody.length >= 3 &&
    trimmedBody.length <= 1000 &&
    trimmedRecipient.length >= 1 &&
    trimmedRecipient.length <= 60 &&
    (!isEmergency || trimmedReason.length >= 10) &&
    scheduledFor.length === 10;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    const result = await saveDigestCardRequest(
      workspaceId,
      editingCard?.id ?? null,
      {
        title: trimmedTitle,
        body: trimmedBody,
        recipient_label: trimmedRecipient,
        triage_type: triageType,
        emergency_reason: isEmergency ? trimmedReason : null,
        scheduled_for: scheduledFor,
      }
    );
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.errorMessage ?? "Gagal menyimpan kartu digest.");
      return;
    }

    toast.success(
      isEditing
        ? "Kartu instruksi berhasil diperbarui."
        : isEmergency
          ? "Kartu Darurat Operasional ditambahkan."
          : "Instruksi ditahan ke Antrean Pagi."
    );
    onOpenChange(false);
    onSaved();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border-hairline bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-ink-primary">
            {isEditing
              ? "Ubah Kartu Instruksi"
              : "Tambah Instruksi Morning Digest"}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-secondary">
            Tahan tugas non-darurat untuk dirangkum esok pagi, atau tandai
            darurat operasional dengan alasan terukur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-title" className="text-xs font-medium text-ink-primary">
              Judul Instruksi
            </Label>
            <Input
              id="card-title"
              type="text"
              placeholder="Contoh: Revisi salinan halaman FAQ klien"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 rounded-md border-border-hairline bg-surface px-3 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-body" className="text-xs font-medium text-ink-primary">
              Detail Tugas
            </Label>
            <Textarea
              id="card-body"
              rows={3}
              placeholder="Tuliskan konteks singkat dan ekspektasi hasil..."
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="rounded-md border-border-hairline bg-surface px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-recipient" className="text-xs font-medium text-ink-primary">
                Label Penerima
              </Label>
              <Input
                id="card-recipient"
                type="text"
                placeholder="Semua Tim"
                value={recipientLabel}
                onChange={(event) => setRecipientLabel(event.target.value)}
                className="h-10 rounded-md border-border-hairline bg-surface px-3 text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-date" className="text-xs font-medium text-ink-primary">
                Tanggal Jadwal
              </Label>
              <Input
                id="card-date"
                type="date"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
                className="h-10 rounded-md border-border-hairline bg-surface px-3 font-mono text-sm tabular-nums"
                required
              />
            </div>
          </div>

          <DigestTriageSelector
            triageType={triageType}
            emergencyReason={emergencyReason}
            onTriageChange={setTriageType}
            onReasonChange={setEmergencyReason}
          />

          <DialogFooter className="border-border-hairline bg-canvas">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                  <span>Menyimpan Instruksi...</span>
                </>
              ) : (
                <span>{isEditing ? "Simpan Perubahan" : "Simpan Instruksi"}</span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
