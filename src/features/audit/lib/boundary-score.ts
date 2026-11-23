export {
  compareAuditSnapshots,
  type AuditComparisonResult,
  type ComparableSnapshot,
} from "./boundary-score-compare";

export type BoundaryScoreGrade = "A" | "B" | "C" | "D" | "F";
export type BoundaryScoreTone = "safe" | "warn" | "danger";

export interface BoundaryScoreComponent {
  key: "after_hours" | "false_urgency" | "non_workday";
  label: string;
  weight_pct: number;
  raw_value: number;
  raw_unit: string;
  sub_score: number;
  weighted_points: number;
}

export interface BoundaryScoreResult {
  score: number;
  grade: BoundaryScoreGrade;
  status_label: string;
  tone: BoundaryScoreTone;
  after_hours_percentage: number;
  false_urgency_density: number;
  non_workday_percentage: number;
  components: BoundaryScoreComponent[];
}

export interface BoundaryScoreInput {
  total_messages: number;
  after_hours_messages: number;
  false_urgency_count: number;
  after_hours_percentage?: number;
  non_workday_percentage?: number;
  heatmap_matrix?: unknown;
  work_days?: number[];
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

export function extractHeatmapMatrix(raw: unknown): number[][] | null {
  if (!Array.isArray(raw) || raw.length !== 7) return null;

  const parsed: number[][] = [];
  for (const row of raw) {
    if (!Array.isArray(row) || row.length !== 24) return null;
    const numericRow: number[] = [];
    for (const cell of row) {
      if (typeof cell !== "number" || !Number.isFinite(cell) || cell < 0) {
        return null;
      }
      numericRow.push(cell);
    }
    parsed.push(numericRow);
  }
  return parsed;
}

export function computeNonWorkdayPercentage(
  heatmapMatrix: number[][],
  workDays: number[] = [1, 2, 3, 4, 5]
): number {
  const activeDays = new Set(workDays.length > 0 ? workDays : [1, 2, 3, 4, 5]);
  let totalInMatrix = 0;
  let nonWorkdayMessages = 0;

  for (let dayIdx = 0; dayIdx < 7; dayIdx += 1) {
    const isOffDay = !activeDays.has(dayIdx + 1);
    const row = heatmapMatrix[dayIdx] ?? [];
    for (let hour = 0; hour < 24; hour += 1) {
      const count = row[hour] ?? 0;
      totalInMatrix += count;
      if (isOffDay) nonWorkdayMessages += count;
    }
  }

  if (totalInMatrix <= 0) return 0;
  return round1((nonWorkdayMessages / totalInMatrix) * 100);
}

function resolveGradeMeta(score: number): {
  grade: BoundaryScoreGrade;
  status_label: string;
  tone: BoundaryScoreTone;
} {
  if (score >= 85) {
    return { grade: "A", status_label: "Sangat Sehat", tone: "safe" };
  }
  if (score >= 70) {
    return { grade: "B", status_label: "Sehat", tone: "safe" };
  }
  if (score >= 55) {
    return { grade: "C", status_label: "Perlu Perbaikan", tone: "warn" };
  }
  if (score >= 40) {
    return { grade: "D", status_label: "Rawan Burnout", tone: "warn" };
  }
  return { grade: "F", status_label: "Kritis", tone: "danger" };
}

function buildComponents(
  afterHoursPct: number,
  falseUrgencyDensity: number,
  nonWorkdayPct: number,
  sub1: number,
  sub2: number,
  sub3: number
): BoundaryScoreComponent[] {
  return [
    {
      key: "after_hours",
      label: "Pesan Luar Jam Reguler",
      weight_pct: 45,
      raw_value: afterHoursPct,
      raw_unit: "%",
      sub_score: sub1,
      weighted_points: round1(sub1 * 0.45),
    },
    {
      key: "false_urgency",
      label: "Kepadatan False Urgency",
      weight_pct: 30,
      raw_value: falseUrgencyDensity,
      raw_unit: "/100 pesan",
      sub_score: sub2,
      weighted_points: round1(sub2 * 0.3),
    },
    {
      key: "non_workday",
      label: "Pesan Hari Non-Kerja",
      weight_pct: 25,
      raw_value: nonWorkdayPct,
      raw_unit: "%",
      sub_score: sub3,
      weighted_points: round1(sub3 * 0.25),
    },
  ];
}

export function calculateBoundaryScore(
  metrics: BoundaryScoreInput
): BoundaryScoreResult {
  if (!Number.isFinite(metrics.total_messages) || metrics.total_messages <= 0) {
    return {
      score: 100,
      grade: "A",
      status_label: "Sangat Sehat",
      tone: "safe",
      after_hours_percentage: 0,
      false_urgency_density: 0,
      non_workday_percentage: 0,
      components: buildComponents(0, 0, 0, 100, 100, 100),
    };
  }

  const totalMessages = Math.max(1, metrics.total_messages);
  const afterHoursMessages = Math.max(0, metrics.after_hours_messages);
  const falseUrgencyCount = Math.max(0, metrics.false_urgency_count);

  const rawAfterHoursPct =
    metrics.after_hours_percentage ?? (afterHoursMessages / totalMessages) * 100;
  const afterHoursPct = round1(clamp(rawAfterHoursPct, 0, 100));

  const rawDensity =
    afterHoursMessages > 0
      ? (falseUrgencyCount / afterHoursMessages) * 100
      : falseUrgencyCount > 0
        ? 100
        : 0;
  const falseUrgencyDensity = round1(Math.max(0, rawDensity));

  const matrix = extractHeatmapMatrix(metrics.heatmap_matrix);
  const fallbackNonWorkday =
    afterHoursMessages <= 0 ? 0 : Math.min(100, afterHoursPct * 0.28);
  const rawNonWorkdayPct =
    metrics.non_workday_percentage ??
    (matrix
      ? computeNonWorkdayPercentage(matrix, metrics.work_days)
      : fallbackNonWorkday);
  const nonWorkdayPct = round1(clamp(rawNonWorkdayPct, 0, 100));

  const sub1 = round1(clamp(100 - afterHoursPct * 1.6, 0, 100));
  const sub2 = round1(clamp(100 - falseUrgencyDensity * 3, 0, 100));
  const sub3 = round1(clamp(100 - nonWorkdayPct * 3, 0, 100));

  const score = Math.round(
    clamp(sub1 * 0.45 + sub2 * 0.3 + sub3 * 0.25, 0, 100)
  );
  const meta = resolveGradeMeta(score);

  return {
    score,
    grade: meta.grade,
    status_label: meta.status_label,
    tone: meta.tone,
    after_hours_percentage: afterHoursPct,
    false_urgency_density: falseUrgencyDensity,
    non_workday_percentage: nonWorkdayPct,
    components: buildComponents(
      afterHoursPct,
      falseUrgencyDensity,
      nonWorkdayPct,
      sub1,
      sub2,
      sub3
    ),
  };
}
