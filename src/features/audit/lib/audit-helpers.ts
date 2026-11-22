import type { CreateAuditSnapshotInput } from "@/lib/validations";
import type { LocalAuditResult } from "../types";

const SESSION_GAP_MINUTES = 30;
const SESSION_BASE_MINUTES = 10;
const MIN_REPLY_MINUTES = 2;
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function createEmptyMatrix(): number[][] {
  return Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
}

export function getIsoWeekday(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMondayKey(date: Date): { key: string; label: string } {
  const isoDay = getIsoWeekday(date);
  const monday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - (isoDay - 1)
  );
  const key = formatDateYMD(monday);
  const dayStr = String(monday.getDate()).padStart(2, "0");
  const monthStr = SHORT_MONTHS[monday.getMonth()] ?? "Jan";
  return { key, label: `${dayStr} ${monthStr}` };
}

export function estimateShadowOvertimeHours(afterHoursTimes: number[]): number {
  if (afterHoursTimes.length === 0) return 0;

  let totalMinutes = 0;
  let prevTime: number | null = null;

  for (const currentTime of afterHoursTimes) {
    if (prevTime === null) {
      totalMinutes += SESSION_BASE_MINUTES;
    } else {
      const gapMinutes = (currentTime - prevTime) / 60000;
      if (gapMinutes > SESSION_GAP_MINUTES) {
        totalMinutes += SESSION_BASE_MINUTES;
      } else {
        totalMinutes += Math.max(MIN_REPLY_MINUTES, gapMinutes);
      }
    }
    prevTime = currentTime;
  }

  return Number((totalMinutes / 60).toFixed(2));
}

export function findPeakSlot(
  heatmapMatrix: number[][],
  afterHoursMatrix: number[][]
): { day: number; hour: number; count: number } {
  let bestDay = 1;
  let bestHour = 0;
  let bestAfterHours = -1;

  for (let d = 0; d < 7; d += 1) {
    for (let h = 0; h < 24; h += 1) {
      const val = afterHoursMatrix[d][h];
      if (val > bestAfterHours) {
        bestAfterHours = val;
        bestDay = d + 1;
        bestHour = h;
      }
    }
  }

  if (bestAfterHours > 0) {
    return {
      day: bestDay,
      hour: bestHour,
      count: heatmapMatrix[bestDay - 1][bestHour],
    };
  }

  let bestOverall = -1;
  for (let d = 0; d < 7; d += 1) {
    for (let h = 0; h < 24; h += 1) {
      const val = heatmapMatrix[d][h];
      if (val > bestOverall) {
        bestOverall = val;
        bestDay = d + 1;
        bestHour = h;
      }
    }
  }

  return {
    day: bestDay,
    hour: bestHour,
    count: Math.max(0, bestOverall),
  };
}

export function buildSnapshotPayload(
  result: LocalAuditResult,
  label: string
): CreateAuditSnapshotInput {
  return {
    label: label.trim(),
    period_start: result.period_start,
    period_end: result.period_end,
    total_messages: result.total_messages,
    after_hours_messages: result.after_hours_messages,
    shadow_overtime_hours: result.shadow_overtime_hours,
    false_urgency_count: result.false_urgency_count,
    peak_day_of_week: result.peak_day_of_week,
    peak_hour: result.peak_hour,
    heatmap_matrix: result.heatmap_matrix,
  };
}
