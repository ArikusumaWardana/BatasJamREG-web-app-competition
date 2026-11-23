import {
  calculateBoundaryScore,
  type BoundaryScoreResult,
} from "./boundary-score";

export interface ComparableSnapshot {
  id?: string;
  label: string;
  period_start: string;
  period_end: string;
  total_messages: number;
  after_hours_messages: number;
  shadow_overtime_hours: number;
  false_urgency_count: number;
  heatmap_matrix?: unknown;
}

export interface AuditComparisonResult {
  before_label: string;
  after_label: string;
  before_score: BoundaryScoreResult;
  after_score: BoundaryScoreResult;
  score_delta: number;
  before_after_hours_pct: number;
  after_after_hours_pct: number;
  after_hours_pct_delta: number;
  before_shadow_hours: number;
  after_shadow_hours: number;
  shadow_hours_delta: number;
  shadow_hours_delta_pct: number | null;
  before_false_urgency: number;
  after_false_urgency: number;
  false_urgency_delta: number;
  improved_metrics_count: number;
}

function round1(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

export function compareAuditSnapshots(
  before: ComparableSnapshot,
  after: ComparableSnapshot,
  workDays?: number[]
): AuditComparisonResult {
  const beforeScore = calculateBoundaryScore({
    total_messages: before.total_messages,
    after_hours_messages: before.after_hours_messages,
    false_urgency_count: before.false_urgency_count,
    heatmap_matrix: before.heatmap_matrix,
    work_days: workDays,
  });
  const afterScore = calculateBoundaryScore({
    total_messages: after.total_messages,
    after_hours_messages: after.after_hours_messages,
    false_urgency_count: after.false_urgency_count,
    heatmap_matrix: after.heatmap_matrix,
    work_days: workDays,
  });

  const beforeShadowHours = round1(
    Math.max(0, Number(before.shadow_overtime_hours) || 0)
  );
  const afterShadowHours = round1(
    Math.max(0, Number(after.shadow_overtime_hours) || 0)
  );
  const shadowHoursDelta = round1(afterShadowHours - beforeShadowHours);
  const shadowHoursDeltaPct =
    beforeShadowHours > 0
      ? round1(((afterShadowHours - beforeShadowHours) / beforeShadowHours) * 100)
      : null;

  const scoreDelta = afterScore.score - beforeScore.score;
  const afterHoursPctDelta = round1(
    afterScore.after_hours_percentage - beforeScore.after_hours_percentage
  );
  const falseUrgencyDelta =
    after.false_urgency_count - before.false_urgency_count;

  let improvedMetricsCount = 0;
  if (scoreDelta > 0) improvedMetricsCount += 1;
  if (shadowHoursDelta < 0) improvedMetricsCount += 1;
  if (afterHoursPctDelta < 0) improvedMetricsCount += 1;
  if (falseUrgencyDelta < 0) improvedMetricsCount += 1;

  return {
    before_label: before.label,
    after_label: after.label,
    before_score: beforeScore,
    after_score: afterScore,
    score_delta: scoreDelta,
    before_after_hours_pct: beforeScore.after_hours_percentage,
    after_after_hours_pct: afterScore.after_hours_percentage,
    after_hours_pct_delta: afterHoursPctDelta,
    before_shadow_hours: beforeShadowHours,
    after_shadow_hours: afterShadowHours,
    shadow_hours_delta: shadowHoursDelta,
    shadow_hours_delta_pct: shadowHoursDeltaPct,
    before_false_urgency: before.false_urgency_count,
    after_false_urgency: after.false_urgency_count,
    false_urgency_delta: falseUrgencyDelta,
    improved_metrics_count: improvedMetricsCount,
  };
}
