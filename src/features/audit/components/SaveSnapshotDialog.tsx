"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildSnapshotPayload } from "../lib/audit-metrics";
import {
  fetchUserWorkspacesForSnapshot,
  postAuditSnapshot,
  type WorkspaceOption,
} from "../lib/snapshot-client";
import type { LocalAuditResult } from "../types";

interface SaveSnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: LocalAuditResult | null;
}

export function SaveSnapshotDialog({
  open,
  onOpenChange,
  result,
}: SaveSnapshotDialogProps) {
  const [label, setLabel] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [selectedWsId, setSelectedWsId] = useState("");
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "guest"
  >("loading");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !result) return;
    let active = true;

    void fetchUserWorkspacesForSnapshot().then((res) => {
      if (!active) return;
      setAuthStatus(res.status);
      setWorkspaces(res.workspaces);
      const preferred =
        res.workspaces.find((w) => w.invite_code === "REG-8492") ??
        res.workspaces[0];
      setSelectedWsId(preferred?.id ?? "");
    });

    return () => {
      active = false;
    };
  }, [open, result]);

  const effectiveLabel =
    label.trim() ||
    (result ? `Audit ${result.source_label}`.slice(0, 100) : "Audit Tim");
  const snapshotPayload = result
    ? buildSnapshotPayload(result, effectiveLabel)
    : null;

  const canSubmit =
    authStatus === "authenticated" &&
    selectedWsId.length > 0 &&
    effectiveLabel.length >= 2 &&
    snapshotPayload !== null &&
    !isSaving;

  async function handleSave() {
    if (!canSubmit || !snapshotPayload) return;
    setIsSaving(true);
    const saveRes = await postAuditSnapshot(selectedWsId, snapshotPayload);
    setIsSaving(false);

    if (!saveRes.ok) {
      toast.error(saveRes.errorMessage ?? "Gagal menyimpan snapshot.");
      return;
    }

    toast.success("Snapshot angka anonim berhasil disimpan ke workspace.");
    setLabel("");
    onOpenChange(false);
  }

  const selectedWsName =
    workspaces.find((w) => w.id === selectedWsId)?.name ?? "Pilih Workspace";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border-hairline bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-ink-primary">
            Pratinjau Payload JSON Snapshot Anonim
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-secondary">
            Verifikasi bahwa hanya angka agregat dan matriks 7x24 yang dikirim
            ke server (nol teks chat dan nol nama pengirim).
          </DialogDescription>
        </DialogHeader>

        {authStatus === "loading" ? (
          <div className="flex items-center gap-2 py-4 text-sm text-ink-secondary">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
            <span>Memeriksa sesi workspace Anda...</span>
          </div>
        ) : authStatus === "guest" ? (
          <div className="flex flex-col gap-3 rounded-md border border-brand-border bg-brand-soft p-4">
            <p className="text-sm text-ink-primary">
              Menyimpan snapshot ke riwayat tim memerlukan akun workspace. Anda
              tetap bisa memakai hasil audit ini di Simulator dan Piagam tanpa
              login.
            </p>
            <Link
              href="/auth/login?next=/audit"
              className="inline-flex min-h-[38px] items-center justify-center rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover"
            >
              Masuk atau Buka Workspace Demo
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {workspaces.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="snapshot-ws" className="text-xs font-medium text-ink-primary">
                  Workspace Tujuan
                </Label>
                <Select
                  value={selectedWsId}
                  onValueChange={(value) => {
                    if (value) setSelectedWsId(value);
                  }}
                >
                  <SelectTrigger
                    id="snapshot-ws"
                    className="h-10 w-full rounded-md border-border-hairline bg-surface pr-8 pl-3 text-sm"
                  >
                    <SelectValue>{selectedWsName}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-xs text-danger">
                Anda belum memiliki workspace. Buat workspace di menu Ringkasan
                Tim terlebih dahulu.
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="snapshot-label" className="text-xs font-medium text-ink-primary">
                Label Snapshot
              </Label>
              <Input
                id="snapshot-label"
                type="text"
                placeholder={effectiveLabel}
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className="h-10 rounded-md border-border-hairline bg-surface px-3 text-sm"
              />
            </div>
          </div>
        )}

        {snapshotPayload ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-safe">
              <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>Payload Terverifikasi (Hanya Numerik)</span>
            </div>
            <pre className="max-h-48 overflow-auto rounded-md border border-border-hairline bg-canvas p-3 font-mono text-[11px] leading-relaxed text-ink-primary">
              {JSON.stringify(snapshotPayload, null, 2)}
            </pre>
          </div>
        ) : null}

        <DialogFooter className="border-border-hairline bg-canvas">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSave}
            className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                <span>Menyimpan Snapshot...</span>
              </>
            ) : (
              <span>Simpan Snapshot Anonim</span>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
