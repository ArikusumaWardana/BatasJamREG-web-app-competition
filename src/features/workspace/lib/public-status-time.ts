import {
  formatTimeHHMM,
  getWorkHoursStatus,
  parseTimeToMinutes,
  WEEKDAY_OPTIONS,
  type WorkHoursStatusConfig,
  type WorkHoursStatusResult,
} from "@/lib/constants/work-hours";

export interface PublicWorkClockInfo extends WorkHoursStatusResult {
  nextTransitionLabel: string;
  nextTransitionCountdown: string;
}

const WEEKDAY_SHORT_MAP: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function formatDeltaMinutes(deltaMinutes: number): string {
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

export function getPublicWorkClockInfo(
  config: WorkHoursStatusConfig,
  now: Date = new Date()
): PublicWorkClockInfo {
  const base = getWorkHoursStatus(config, now);

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
  const isoWeekday = WEEKDAY_SHORT_MAP[weekdayToken] ?? base.isoWeekday;
  const nowMinutes = hour * 60 + minute;

  const startMinutes = parseTimeToMinutes(config.work_start_time);
  const endMinutes = parseTimeToMinutes(config.work_end_time);
  const activeDays =
    config.work_days.length > 0 ? config.work_days : [1, 2, 3, 4, 5];

  if (base.isRegularHours) {
    const endClock = formatTimeHHMM(config.work_end_time);
    return {
      ...base,
      nextTransitionLabel: `Hari ini, ${endClock} ${base.timezoneLabel}`,
      nextTransitionCountdown: formatDeltaMinutes(Math.max(1, endMinutes - nowMinutes)),
    };
  }

  let nextOffset = 1;
  let nextIsoDay = ((isoWeekday - 1 + 1) % 7) + 1;
  for (let offset = 0; offset <= 7; offset += 1) {
    const candidateDay = ((isoWeekday - 1 + offset) % 7) + 1;
    if (!activeDays.includes(candidateDay)) continue;
    if (offset === 0 && startMinutes <= nowMinutes) continue;
    nextOffset = offset;
    nextIsoDay = candidateDay;
    break;
  }

  const deltaMinutes = nextOffset * 1440 + (startMinutes - nowMinutes);
  const startClock = formatTimeHHMM(config.work_start_time);
  const targetDayLabel =
    WEEKDAY_OPTIONS.find((item) => item.isoDay === nextIsoDay)?.label ??
    "Senin";
  const relativeDay =
    nextOffset === 0 ? "Hari ini" : nextOffset === 1 ? "Besok" : targetDayLabel;

  return {
    ...base,
    nextTransitionLabel: `${relativeDay}, ${startClock} ${base.timezoneLabel}`,
    nextTransitionCountdown: formatDeltaMinutes(deltaMinutes),
  };
}
