import {
  formatTimeHHMM,
  getTimezoneShortLabel,
  WEEKDAY_OPTIONS,
  type IndonesiaTimezone,
} from "@/lib/constants/work-hours";

export interface WaBioGeneratorInput {
  workspace_name: string;
  slug: string;
  work_start_time: string;
  work_end_time: string;
  digest_dispatch_time: string;
  timezone: IndonesiaTimezone | string;
  work_days: number[];
  origin?: string;
}

export interface WaBioVariant {
  id: "compact" | "client_friendly" | "focused";
  label: string;
  text: string;
  char_count: number;
}

function normalizeWorkDays(workDays: number[]): number[] {
  const unique = Array.from(
    new Set(workDays.filter((day) => Number.isInteger(day) && day >= 1 && day <= 7))
  ).sort((a, b) => a - b);

  return unique.length > 0 ? unique : [1, 2, 3, 4, 5];
}

export function formatWorkDaysLabel(
  workDays: number[],
  mode: "short" | "full" = "full"
): string {
  const days = normalizeWorkDays(workDays);
  const signature = days.join(",");

  if (signature === "1,2,3,4,5") {
    return mode === "short" ? "Sen-Jum" : "Senin - Jumat";
  }
  if (signature === "1,2,3,4,5,6") {
    return mode === "short" ? "Sen-Sab" : "Senin - Sabtu";
  }
  if (signature === "1,2,3,4,5,6,7") {
    return mode === "short" ? "Setiap hari" : "Senin - Minggu";
  }

  return days
    .map((isoDay) => {
      const found = WEEKDAY_OPTIONS.find((item) => item.isoDay === isoDay);
      if (!found) return String(isoDay);
      return mode === "short" ? found.shortLabel : found.label;
    })
    .join(", ");
}

export function buildPublicStatusUrl(slug: string, origin?: string): string {
  const cleanSlug = slug.trim().replace(/^\/+/, "");
  const relativePath = `/status/${cleanSlug}`;
  const cleanOrigin = origin?.trim().replace(/\/+$/, "");

  if (!cleanOrigin) {
    return relativePath;
  }

  return `${cleanOrigin}${relativePath}`;
}

export function generateWhatsAppBioVariants(
  input: WaBioGeneratorInput
): WaBioVariant[] {
  const daysShort = formatWorkDaysLabel(input.work_days, "short");
  const tz = getTimezoneShortLabel(input.timezone);
  const window = `${formatTimeHHMM(input.work_start_time)}-${formatTimeHHMM(input.work_end_time)}`;
  const digestTime = formatTimeHHMM(input.digest_dispatch_time);
  const statusUrl = buildPublicStatusUrl(input.slug, input.origin);
  const teamLabel = input.workspace_name.trim() || "Tim";

  const compactText = `Jam kerja ${teamLabel}: ${daysShort} ${window} ${tz}. Pesan malam masuk Digest ${digestTime} ${tz}. Status: ${statusUrl}`;
  const clientText = `Halo! Kami aktif ${daysShort}, ${window} ${tz}. Pesan di luar jam kerja diproses pukul ${digestTime} ${tz}. Cek status: ${statusUrl}`;
  const focusedText = `Fokus ${daysShort} ${window} ${tz}. Non-darurat dijawab di jam kerja (Digest ${digestTime} ${tz}). Panduan darurat: ${statusUrl}`;

  return [
    {
      id: "compact",
      label: "Ringkas & Profesional",
      text: compactText,
      char_count: compactText.length,
    },
    {
      id: "client_friendly",
      label: "Ramah untuk Klien",
      text: clientText,
      char_count: clientText.length,
    },
    {
      id: "focused",
      label: "Tegas & Fokus",
      text: focusedText,
      char_count: focusedText.length,
    },
  ];
}
