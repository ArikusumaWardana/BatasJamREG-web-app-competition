"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  INDONESIA_TIMEZONES,
  WORK_PATTERNS,
  type IndonesiaTimezone,
  type WorkPatternCode,
} from "@/lib/constants/work-hours";

interface CreateWorkspaceDialogProps {
  organizationId?: string | null;
  onCreated: (workspaceId: string) => void;
}

export function CreateWorkspaceDialog({
  organizationId,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState<WorkPatternCode>("FIVE_DAYS_8H");
  const [timezone, setTimezone] = useState<IndonesiaTimezone>("Asia/Jakarta");
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || isCreating) return;

    const preset = WORK_PATTERNS[pattern];
    setIsCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          ...(organizationId ? { organization_id: organizationId } : {}),
          work_pattern: pattern,
          work_start_time: preset.startTime,
          work_end_time: preset.endTime,
          digest_dispatch_time: "08:30:00",
          timezone,
          work_days: preset.workDays,
        }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: { id: string; name: string };
        error?: { message?: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        toast.error(payload.error?.message ?? "Gagal membuat workspace baru.");
        return;
      }

      toast.success(`Workspace "${payload.data.name}" berhasil dibuat.`);
      setName("");
      setOpen(false);
      onCreated(payload.data.id);
      router.refresh();
    } catch {
      toast.error("Koneksi terputus saat membuat workspace baru.");
    } finally {
      setIsCreating(false);
    }
  }

  const selectedTzLabel =
    INDONESIA_TIMEZONES.find((item) => item.value === timezone)?.label ??
    timezone;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-bento-canvas/60 px-4 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted"
          />
        }
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        <span>
          {organizationId ? "Buat Divisi Baru" : "Buat Workspace Tim Baru"}
        </span>
      </DialogTrigger>
      <DialogContent className="rounded-[24px] border border-stone-200/80 bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-ink-primary">
            Buat Workspace Baru
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-secondary">
            Tetapkan jam reguler tim untuk mengelola Morning Digest dan riwayat
            snapshot audit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-ws-name" className="text-xs font-medium text-ink-primary">
              Nama Tim atau Divisi
            </Label>
            <Input
              id="new-ws-name"
              type="text"
              placeholder="Contoh: Divisi Produk Digital"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 rounded-md border-border-hairline bg-surface px-3 text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-ws-pattern" className="text-xs font-medium text-ink-primary">
              Pola Jam Kerja
            </Label>
            <Select
              value={pattern}
              onValueChange={(value) => {
                if (value) setPattern(value as WorkPatternCode);
              }}
            >
              <SelectTrigger
                id="new-ws-pattern"
                className="h-10 w-full rounded-md border-border-hairline bg-surface pr-8 pl-3 text-sm"
              >
                <SelectValue>{WORK_PATTERNS[pattern].label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIVE_DAYS_8H">
                  {WORK_PATTERNS.FIVE_DAYS_8H.label}
                </SelectItem>
                <SelectItem value="SIX_DAYS_7H">
                  {WORK_PATTERNS.SIX_DAYS_7H.label}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-ws-tz" className="text-xs font-medium text-ink-primary">
              Zona Waktu
            </Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                if (value) setTimezone(value as IndonesiaTimezone);
              }}
            >
              <SelectTrigger
                id="new-ws-tz"
                className="h-10 w-full rounded-md border-border-hairline bg-surface pr-8 pl-3 text-sm"
              >
                <SelectValue>{selectedTzLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {INDONESIA_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="border-border-hairline bg-canvas">
            <button
              type="submit"
              disabled={name.trim().length < 2 || isCreating}
              className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                  <span>Membuat Workspace...</span>
                </>
              ) : (
                <span>Buat Workspace</span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
