import type {
  EmergencyAuditSummary,
  WellbeingWeekSummary,
} from "../types";

const WEEKDAY_OFFSET_FROM_MONDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function getCurrentWeekStartDate(
  timezone = "Asia/Jakarta",
  now: Date = new Date()
): string {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const weekday =
    dateParts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const year = Number(
    dateParts.find((part) => part.type === "year")?.value ?? "2026"
  );
  const month = Number(
    dateParts.find((part) => part.type === "month")?.value ?? "1"
  );
  const day = Number(
    dateParts.find((part) => part.type === "day")?.value ?? "1"
  );

  const offsetDays = WEEKDAY_OFFSET_FROM_MONDAY[weekday] ?? 0;
  const mondayUtc = new Date(Date.UTC(year, month - 1, day - offsetDays));
  return mondayUtc.toISOString().slice(0, 10);
}

export function computeWellbeingCompositeScore(
  avgRestQuality: number | null,
  avgReplyPressure: number | null,
  avgBoundaryClarity: number | null
): number | null {
  if (
    avgRestQuality === null ||
    avgReplyPressure === null ||
    avgBoundaryClarity === null
  ) {
    return null;
  }
  // Reply pressure uses inverse polarity (5 = very pressured, 1 = calm).
  const invertedPressure = 6 - avgReplyPressure;
  const raw = (avgRestQuality + invertedPressure + avgBoundaryClarity) / 3;
  return Math.round(raw * 10) / 10;
}

function toNullableMetric(value: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : null;
}

export interface RawWellbeingSummaryRpcRow {
  week_start_date: string;
  response_count: number;
  is_threshold_met: boolean;
  avg_rest_quality: number | string | null;
  avg_reply_pressure: number | string | null;
  avg_boundary_clarity: number | string | null;
}

export function mapWellbeingSummaryRow(
  row: RawWellbeingSummaryRpcRow
): WellbeingWeekSummary {
  const meetsThreshold =
    Boolean(row.is_threshold_met) && Number(row.response_count) >= 3;

  if (!meetsThreshold) {
    return {
      week_start_date: row.week_start_date,
      response_count: Number(row.response_count) || 0,
      is_threshold_met: false,
      avg_rest_quality: null,
      avg_reply_pressure: null,
      avg_boundary_clarity: null,
      composite_score: null,
    };
  }

  const avgRest = toNullableMetric(row.avg_rest_quality);
  const avgPressure = toNullableMetric(row.avg_reply_pressure);
  const avgClarity = toNullableMetric(row.avg_boundary_clarity);

  return {
    week_start_date: row.week_start_date,
    response_count: Number(row.response_count) || 0,
    is_threshold_met: true,
    avg_rest_quality: avgRest,
    avg_reply_pressure: avgPressure,
    avg_boundary_clarity: avgClarity,
    composite_score: computeWellbeingCompositeScore(
      avgRest,
      avgPressure,
      avgClarity
    ),
  };
}

export function summarizeEmergencyAudit(
  rows: { emergency_review_status?: string | null }[]
): EmergencyAuditSummary {
  let validCount = 0;
  let falseAlarmCount = 0;
  let pendingCount = 0;

  for (const row of rows) {
    if (row.emergency_review_status === "VALID_EMERGENCY") {
      validCount += 1;
    } else if (row.emergency_review_status === "SHOULD_BE_QUEUED") {
      falseAlarmCount += 1;
    } else {
      pendingCount += 1;
    }
  }

  const reviewedCount = validCount + falseAlarmCount;
  return {
    total_emergency: rows.length,
    valid_count: validCount,
    false_alarm_count: falseAlarmCount,
    pending_count: pendingCount,
    valid_ratio_pct:
      reviewedCount > 0 ? Math.round((validCount / reviewedCount) * 100) : null,
  };
}

export function computeCharterAdoptionPercentage(
  signedCount: number,
  totalMembers: number
): number {
  if (totalMembers <= 0 || signedCount <= 0) return 0;
  return Math.min(100, Math.round((signedCount / totalMembers) * 100));
}
