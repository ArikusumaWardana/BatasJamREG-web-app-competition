import type {
  EmergencyAuditSummary,
  WorkspaceCharterAdoptionMetric,
} from "@/features/wellbeing/types";
import type {
  IndonesiaTimezone,
  WorkPatternCode,
} from "@/lib/constants/work-hours";

export type WorkspaceRole = "OWNER" | "LEAD" | "MEMBER";
export type OrganizationRole = "OWNER" | "MEMBER";

export interface WorkspaceListItem {
  id: string;
  organization_id: string | null;
  organization_name?: string | null;
  organization_stamp_url?: string | null;
  org_role?: OrganizationRole | null;
  name: string;
  slug: string;
  invite_code: string;
  work_pattern: WorkPatternCode;
  work_start_time: string;
  work_end_time: string;
  digest_dispatch_time: string;
  timezone: IndonesiaTimezone;
  work_days: number[];
  role: WorkspaceRole;
  is_joined?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SnapshotSummary {
  id: string;
  label: string;
  period_start: string;
  period_end: string;
  total_messages: number;
  after_hours_messages: number;
  shadow_overtime_hours: number;
  false_urgency_count: number;
  peak_day_of_week: number;
  peak_hour: number;
  heatmap_matrix?: number[][] | null;
  created_at: string;
}

export interface CharterSummary {
  id: string;
  title: string;
  version: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  updated_at: string;
}

export interface WorkspaceDetail extends WorkspaceListItem {
  member_count: number;
  queued_morning_count: number;
  active_charter: CharterSummary | null;
  charter_adoption?: WorkspaceCharterAdoptionMetric | null;
  emergency_audit_summary?: EmergencyAuditSummary;
  recent_snapshots: SnapshotSummary[];
}
