import type {
  IndonesiaTimezone,
  WorkPatternCode,
} from "@/lib/constants/work-hours";

export interface AuditConfig {
  work_pattern: WorkPatternCode;
  work_start_time: string;
  work_end_time: string;
  timezone: IndonesiaTimezone;
  work_days: number[];
  keywords: string[];
}

export interface WeeklyTrendPoint {
  week_key: string;
  week_label: string;
  regular_messages: number;
  after_hours_messages: number;
}

export interface FalseUrgencyHit {
  keyword: string;
  count: number;
  after_hours_count: number;
}

export interface LocalAuditResult {
  source_label: string;
  period_start: string;
  period_end: string;
  total_messages: number;
  regular_messages: number;
  after_hours_messages: number;
  after_hours_percentage: number;
  shadow_overtime_hours: number;
  avg_weekly_shadow_hours: number;
  false_urgency_count: number;
  peak_day_of_week: number;
  peak_hour: number;
  peak_slot_count: number;
  heatmap_matrix: number[][];
  weekly_trend: WeeklyTrendPoint[];
  false_urgency_breakdown: FalseUrgencyHit[];
}

export type WaWorkerRequest =
  | {
      type: "PARSE_FILE";
      fileName: string;
      buffer: ArrayBuffer;
      config: AuditConfig;
    }
  | {
      type: "REANALYZE";
      config: AuditConfig;
    };

export type WaWorkerResponse =
  | {
      type: "RESULT";
      result: LocalAuditResult;
    }
  | {
      type: "ERROR";
      message: string;
    };
