export type WorkPatternCode = "FIVE_DAYS_8H" | "SIX_DAYS_7H" | "CUSTOM";
export type IndonesiaTimezone =
  | "Asia/Jakarta"
  | "Asia/Makassar"
  | "Asia/Jayapura";

export interface WorkPatternPreset {
  code: WorkPatternCode;
  label: string;
  description: string;
  startTime: string;
  endTime: string;
  workDays: number[];
}

export const WORK_PATTERNS: Record<WorkPatternCode, WorkPatternPreset> = {
  FIVE_DAYS_8H: {
    code: "FIVE_DAYS_8H",
    label: "5 Hari Kerja x 8 Jam (UU 13/2003 Pasal 77)",
    description: "Senin - Jumat, 09:00 - 17:00",
    startTime: "09:00:00",
    endTime: "17:00:00",
    workDays: [1, 2, 3, 4, 5],
  },
  SIX_DAYS_7H: {
    code: "SIX_DAYS_7H",
    label: "6 Hari Kerja x 7 Jam (UU 13/2003 Pasal 77)",
    description: "Senin - Sabtu, 09:00 - 16:00",
    startTime: "09:00:00",
    endTime: "16:00:00",
    workDays: [1, 2, 3, 4, 5, 6],
  },
  CUSTOM: {
    code: "CUSTOM",
    label: "Jadwal Kustom Tim",
    description: "Atur jam mulai, jam selesai, dan hari kerja secara manual",
    startTime: "09:00:00",
    endTime: "17:00:00",
    workDays: [1, 2, 3, 4, 5],
  },
};

export interface TimezoneOption {
  value: IndonesiaTimezone;
  shortLabel: "WIB" | "WITA" | "WIT";
  label: string;
}

export const INDONESIA_TIMEZONES: TimezoneOption[] = [
  { value: "Asia/Jakarta", shortLabel: "WIB", label: "WIB (Asia/Jakarta)" },
  { value: "Asia/Makassar", shortLabel: "WITA", label: "WITA (Asia/Makassar)" },
  { value: "Asia/Jayapura", shortLabel: "WIT", label: "WIT (Asia/Jayapura)" },
];

export interface WeekdayOption {
  isoDay: number;
  label: string;
  shortLabel: string;
}

export const WEEKDAY_OPTIONS: WeekdayOption[] = [
  { isoDay: 1, label: "Senin", shortLabel: "Sen" },
  { isoDay: 2, label: "Selasa", shortLabel: "Sel" },
  { isoDay: 3, label: "Rabu", shortLabel: "Rab" },
  { isoDay: 4, label: "Kamis", shortLabel: "Kam" },
  { isoDay: 5, label: "Jumat", shortLabel: "Jum" },
  { isoDay: 6, label: "Sabtu", shortLabel: "Sab" },
  { isoDay: 7, label: "Minggu", shortLabel: "Min" },
];

const WEEKDAY_SHORT_MAP: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export function formatTimeHHMM(timeValue: string): string {
  const parts = timeValue.split(":");
  const hh = (parts[0] ?? "09").padStart(2, "0");
  const mm = (parts[1] ?? "00").padStart(2, "0");
  return `${hh}:${mm}`;
}

export function parseTimeToMinutes(timeValue: string): number {
  const parts = timeValue.split(":");
  const hours = Number(parts[0] ?? 0);
  const minutes = Number(parts[1] ?? 0);
  return hours * 60 + minutes;
}

export function getTimezoneShortLabel(
  timezone: string
): "WIB" | "WITA" | "WIT" {
  const found = INDONESIA_TIMEZONES.find((item) => item.value === timezone);
  return found?.shortLabel ?? "WIB";
}

export interface WorkHoursStatusConfig {
  work_start_time: string;
  work_end_time: string;
  digest_dispatch_time: string;
  timezone: IndonesiaTimezone;
  work_days: number[];
}

export interface WorkHoursStatusResult {
  isRegularHours: boolean;
  isWorkDay: boolean;
  isoWeekday: number;
  dayLabel: string;
  timezoneLabel: "WIB" | "WITA" | "WIT";
  currentTimeLabel: string;
  workWindowLabel: string;
  digestTimeLabel: string;
  nextDigestLabel: string;
  nextDigestCountdown: string;
}

function formatCountdown(deltaMinutes: number): string {
  if (deltaMinutes <= 0) return "Sebentar lagi";
  const days = Math.floor(deltaMinutes / 1440);
  const hours = Math.floor((deltaMinutes % 1440) / 60);
  const minutes = deltaMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days} hari ${hours} jam lagi` : `${days} hari lagi`;
  }
  if (hours > 0) {
    return minutes > 0
      ? `${hours} jam ${minutes} menit lagi`
      : `${hours} jam lagi`;
  }
  return `${minutes} menit lagi`;
}

export function getWorkHoursStatus(
  config: WorkHoursStatusConfig,
  now: Date = new Date()
): WorkHoursStatusResult {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: config.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekdayToken = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const rawHour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const hour = rawHour === 24 ? 0 : rawHour;

  const isoWeekday = WEEKDAY_SHORT_MAP[weekdayToken] ?? 1;
  const nowMinutes = hour * 60 + minute;
  const activeDays =
    config.work_days.length > 0 ? config.work_days : [1, 2, 3, 4, 5];

  const startMinutes = parseTimeToMinutes(config.work_start_time);
  const endMinutes = parseTimeToMinutes(config.work_end_time);
  const digestMinutes = parseTimeToMinutes(config.digest_dispatch_time);

  const isWorkDay = activeDays.includes(isoWeekday);
  const isRegularHours =
    isWorkDay && nowMinutes >= startMinutes && nowMinutes < endMinutes;

  const tzLabel = getTimezoneShortLabel(config.timezone);
  const dayLabel =
    WEEKDAY_OPTIONS.find((item) => item.isoDay === isoWeekday)?.label ??
    "Senin";
  const currentTimeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const digestTimeLabel = formatTimeHHMM(config.digest_dispatch_time);
  const workWindowLabel = `${formatTimeHHMM(config.work_start_time)}-${formatTimeHHMM(config.work_end_time)}`;

  let nextOffset = 1;
  let nextIsoDay = ((isoWeekday - 1 + 1) % 7) + 1;
  for (let offset = 0; offset <= 7; offset += 1) {
    const candidateDay = ((isoWeekday - 1 + offset) % 7) + 1;
    if (!activeDays.includes(candidateDay)) continue;
    if (offset === 0 && digestMinutes <= nowMinutes) continue;
    nextOffset = offset;
    nextIsoDay = candidateDay;
    break;
  }

  const deltaMinutes = nextOffset * 1440 + (digestMinutes - nowMinutes);
  const targetDayLabel =
    WEEKDAY_OPTIONS.find((item) => item.isoDay === nextIsoDay)?.label ??
    "Senin";
  const relativeDay =
    nextOffset === 0 ? "Hari ini" : nextOffset === 1 ? "Besok" : targetDayLabel;

  return {
    isRegularHours,
    isWorkDay,
    isoWeekday,
    dayLabel,
    timezoneLabel: tzLabel,
    currentTimeLabel,
    workWindowLabel,
    digestTimeLabel,
    nextDigestLabel: `${relativeDay}, ${digestTimeLabel} ${tzLabel}`,
    nextDigestCountdown: formatCountdown(deltaMinutes),
  };
}
