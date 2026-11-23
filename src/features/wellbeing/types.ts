export interface OwnWellbeingPulse {
  rest_quality: number;
  reply_pressure: number;
  boundary_clarity: number;
  created_at: string;
}

export interface WellbeingWeekSummary {
  week_start_date: string;
  response_count: number;
  is_threshold_met: boolean;
  avg_rest_quality: number | null;
  avg_reply_pressure: number | null;
  avg_boundary_clarity: number | null;
  composite_score: number | null;
}

export interface WellbeingPulsePayload {
  current_week_start: string;
  has_submitted_this_week: boolean;
  own_current_pulse: OwnWellbeingPulse | null;
  current_week_summary: WellbeingWeekSummary | null;
  history: WellbeingWeekSummary[];
}

export interface EmergencyAuditSummary {
  total_emergency: number;
  valid_count: number;
  false_alarm_count: number;
  pending_count: number;
  valid_ratio_pct: number | null;
}

export interface WorkspaceCharterAdoptionMetric {
  charter_id: string;
  signed_count: number;
  total_members: number;
  adoption_percentage: number;
  has_signed: boolean;
}
