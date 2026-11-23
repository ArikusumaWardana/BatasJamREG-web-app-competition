import type { BoundaryScoreResult } from "@/features/audit/lib/boundary-score";
import type {
  EmergencyAuditSummary,
  WellbeingWeekSummary,
} from "@/features/wellbeing/types";
import type { WorkspaceRole } from "@/features/workspace/types";
import type {
  IndonesiaTimezone,
  WorkPatternCode,
} from "@/lib/constants/work-hours";

export type OrganizationRole = "OWNER" | "MEMBER";

export interface OrganizationListItem {
  id: string;
  name: string;
  slug: string;
  stamp_url?: string | null;
  organization_name?: string;
  organization_stamp_url?: string | null;
  role: OrganizationRole;
  joined_at: string;
  workspace_count: number;
}

export interface DivisionLeadInfo {
  user_id: string;
  full_name: string;
  role_title: string;
}

export interface DivisionLatestSnapshot {
  id: string;
  label: string;
  period_start: string;
  period_end: string;
  total_messages: number;
  after_hours_messages: number;
  shadow_overtime_hours: number;
  false_urgency_count: number;
  created_at: string;
}

export interface DivisionCharterAdoptionSummary {
  charter_id: string | null;
  version: number | null;
  signed_count: number;
  total_members: number;
  adoption_percentage: number | null;
}

export interface DivisionOverviewItem {
  id: string;
  name: string;
  slug: string;
  invite_code: string;
  work_pattern: WorkPatternCode;
  work_start_time: string;
  work_end_time: string;
  digest_dispatch_time: string;
  timezone: IndonesiaTimezone;
  work_days: number[];
  regular_hours_label: string;
  member_count: number;
  is_joined: boolean;
  team_leads: DivisionLeadInfo[];
  latest_snapshot: DivisionLatestSnapshot | null;
  boundary_score: BoundaryScoreResult | null;
  charter_adoption: DivisionCharterAdoptionSummary;
  wellbeing: WellbeingWeekSummary | null;
  emergency_audit: EmergencyAuditSummary;
  created_at: string;
}

export interface HighestBurnoutDivision {
  workspace_id: string;
  name: string;
  shadow_overtime_hours: number;
}

export interface OrganizationSummaryKpi {
  total_divisions: number;
  total_members: number;
  total_shadow_overtime_hours: number;
  highest_burnout_division: HighestBurnoutDivision | null;
  emergency_audit: EmergencyAuditSummary;
}

export interface OrganizationOverviewData {
  organization: {
    id: string;
    name: string;
    slug: string;
    stamp_url: string | null;
    organization_name: string;
    organization_stamp_url: string | null;
    role: "OWNER";
  };
  kpis: OrganizationSummaryKpi;
  divisions: DivisionOverviewItem[];
}

export interface WorkspaceMemberItem {
  workspace_id: string;
  user_id: string;
  full_name: string;
  role_title: string;
  role: WorkspaceRole;
  joined_at: string;
}
