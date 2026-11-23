"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOrganizationRequest } from "@/features/organization/lib/organization-api";
import {
  INDONESIA_TIMEZONES,
  WORK_PATTERNS,
  type IndonesiaTimezone,
  type WorkPatternCode,
} from "@/lib/constants/work-hours";
import { setStoredActiveWorkspaceId } from "@/lib/storage/active-workspace";

interface CreateOrganizationOnboardingCardProps {
  onCompleted: (workspaceId?: string) => void;
}

export function CreateOrganizationOnboardingCard({
  onCompleted,
}: CreateOrganizationOnboardingCardProps) {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [divisionName, setDivisionName] = useState("");
  const [pattern, setPattern] = useState<WorkPatternCode>("FIVE_DAYS_8H");
  const [timezone, setTimezone] = useState<IndonesiaTimezone>("Asia/Jakarta");
  const [isCreating, setIsCreating] = useState(false);

  const canCreate =
    orgName.trim().length >= 2 && divisionName.trim().length >= 2 && !isCreating;
  const selectedTzLabel =
    INDONESIA_TIMEZONES.find((item) => item.value === timezone)?.label ??
    timezone;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate) return;
    const preset = WORK_PATTERNS[pattern];

    setIsCreating(true);
    const result = await createOrganizationRequest({
      name: orgName.trim(),
      initial_workspace_name: divisionName.trim(),
      work_pattern: pattern,
      work_start_time: preset.startTime,
      work_end_time: preset.endTime,
      digest_dispatch_time: "08:30:00",
      timezone,
      work_days: preset.workDays,
    });
    setIsCreating(false);

    if (!result.ok) {
      toast.error(result.errorMsg);
      return;
    }

    if (result.initialWorkspaceId) {
      setStoredActiveWorkspaceId(result.initialWorkspaceId);
    }
    toast.success(
      `Tempat kerja "${result.organizationName}" dan divisi pertama siap digunakan.`
    );
    router.refresh();
    onCompleted(result.initialWorkspaceId ?? undefined);
  }

  return (
    <article className="flex flex-col justify-between gap-5 rounded-lg border border-border-hairline bg-surface p-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-brand">
          <Building2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>Untuk Pendiri / Manajemen / HR</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-ink-primary">
          Daftarkan Tempat Kerja Baru (Menjadi Owner)
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
          Buat organisasi perusahaan dan divisi pertama Anda untuk memantau
          lembur bayangan lintas tim serta menetapkan Team Lead.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="onboard-org-name"
            className="text-xs font-medium text-ink-primary"
          >
            Nama Perusahaan atau Tempat Kerja
          </Label>
          <Input
            id="onboard-org-name"
            type="text"
            placeholder="Contoh: PT Karya Sejahtera"
            value={orgName}
            onChange={(event) => setOrgName(event.target.value)}
            className="h-10 rounded-md border-border-hairline bg-surface px-3 text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="onboard-division-name"
            className="text-xs font-medium text-ink-primary"
          >
            Nama Divisi Pertama
          </Label>
          <Input
            id="onboard-division-name"
            type="text"
            placeholder="Contoh: Tim Produk & Teknologi"
            value={divisionName}
            onChange={(event) => setDivisionName(event.target.value)}
            className="h-10 rounded-md border-border-hairline bg-surface px-3 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="onboard-pattern"
              className="text-xs font-medium text-ink-primary"
            >
              Pola Jam Kerja
            </Label>
            <Select
              value={pattern}
              onValueChange={(value) => {
                if (value) setPattern(value as WorkPatternCode);
              }}
            >
              <SelectTrigger
                id="onboard-pattern"
                className="w-full rounded-md border-border-hairline bg-surface px-3 text-xs data-[size=default]:h-10"
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
            <Label
              htmlFor="onboard-tz"
              className="text-xs font-medium text-ink-primary"
            >
              Zona Waktu
            </Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                if (value) setTimezone(value as IndonesiaTimezone);
              }}
            >
              <SelectTrigger
                id="onboard-tz"
                className="w-full rounded-md border-border-hairline bg-surface px-3 text-xs data-[size=default]:h-10"
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
        </div>

        <button
          type="submit"
          disabled={!canCreate}
          className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
              <span>Mendaftarkan Tempat Kerja...</span>
            </>
          ) : (
            <span>Daftarkan Tempat Kerja Baru</span>
          )}
        </button>
      </form>
    </article>
  );
}
