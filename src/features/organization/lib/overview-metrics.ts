import { calculateBoundaryScore } from "@/features/audit/lib/boundary-score";
import { summarizeEmergencyAudit } from "@/features/wellbeing/lib/wellbeing-metrics";
import {
  formatTimeHHMM,
  getTimezoneShortLabel,
  type IndonesiaTimezone,
  type WorkPatternCode,
} from "@/lib/constants/work-hours";
import type {
  DivisionLatestSnapshot,
  DivisionLeadInfo,
  DivisionOverviewItem,
  HighestBurnoutDivision,
  OrganizationOverviewData,
} from "../types";
import {
  buildDivisionCharterAdoption,
  buildDivisionEmergencySummary,
  buildDivisionWellbeingLatest,
  type RawActiveCharterInput,
  type RawCharterAckRef,
  type RawDivisionWellbeingInput,
  type RawEmergencyCardRef,
} from "./governance-metrics";

export interface RawOrgWorkspaceInput {
  id: string;
  name: string;
  slug: string;
  invite_code: string;
  work_pattern: string;
  work_start_time: string;
  work_end_time: string;
  digest_dispatch_time: string;
  timezone: string;
  work_days: number[];
  created_at: string;
}

export interface RawOrgMemberRef {
  user_id: string;
  role: string;
}

export interface RawDivisionMemberInput {
  workspace_id: string;
  user_id: string;
  role: string;
  full_name: string;
  role_title: string;
}

export interface RawDivisionSnapshotInput {
  id: string;
  workspace_id: string;
  label: string;
  period_start: string;
  period_end: string;
  total_messages: number;
  after_hours_messages: number;
  shadow_overtime_hours: number | string;
  false_urgency_count: number;
  heatmap_matrix?: unknown;
  created_at: string;
}

export function formatWorkHoursRange(
  startTime: string,
  endTime: string,
  timezone: string
): string {
  return `${formatTimeHHMM(startTime)}-${formatTimeHHMM(endTime)} ${getTimezoneShortLabel(timezone)}`;
}

function compareSnapshotDesc(
  a: DivisionLatestSnapshot,
  b: DivisionLatestSnapshot
): number {
  const periodDiff = b.period_end.localeCompare(a.period_end);
  if (periodDiff !== 0) return periodDiff;
  return b.created_at.localeCompare(a.created_at);
}

export function buildOrganizationOverview(params: {
  organization: { id: string; name: string; slug: string };
  viewerUserId?: string;
  orgMembers: RawOrgMemberRef[];
  workspaces: RawOrgWorkspaceInput[];
  divisionMembers: RawDivisionMemberInput[];
  snapshots: RawDivisionSnapshotInput[];
  activeCharters?: RawActiveCharterInput[];
  acknowledgements?: RawCharterAckRef[];
  emergencyCards?: RawEmergencyCardRef[];
  wellbeingByWorkspace?: RawDivisionWellbeingInput[];
}): OrganizationOverviewData {
  const uniqueMemberIds = new Set<string>();
  for (const orgMember of params.orgMembers) {
    uniqueMemberIds.add(orgMember.user_id);
  }
  for (const wsMember of params.divisionMembers) {
    uniqueMemberIds.add(wsMember.user_id);
  }

  const membersByWorkspace = new Map<string, RawDivisionMemberInput[]>();
  for (const member of params.divisionMembers) {
    const bucket = membersByWorkspace.get(member.workspace_id) ?? [];
    bucket.push(member);
    membersByWorkspace.set(member.workspace_id, bucket);
  }

  const latestByWorkspace = new Map<
    string,
    { snapshot: DivisionLatestSnapshot; heatmapMatrix: unknown }
  >();
  for (const rawSnap of params.snapshots) {
    const parsedHours = Number(rawSnap.shadow_overtime_hours);
    const candidate: DivisionLatestSnapshot = {
      id: rawSnap.id,
      label: rawSnap.label,
      period_start: rawSnap.period_start,
      period_end: rawSnap.period_end,
      total_messages: rawSnap.total_messages,
      after_hours_messages: rawSnap.after_hours_messages,
      shadow_overtime_hours: Number.isFinite(parsedHours) ? parsedHours : 0,
      false_urgency_count: rawSnap.false_urgency_count,
      created_at: rawSnap.created_at,
    };
    const current = latestByWorkspace.get(rawSnap.workspace_id);
    if (!current || compareSnapshotDesc(candidate, current.snapshot) < 0) {
      latestByWorkspace.set(rawSnap.workspace_id, {
        snapshot: candidate,
        heatmapMatrix: rawSnap.heatmap_matrix,
      });
    }
  }

  const activeCharters = params.activeCharters ?? [];
  const acknowledgements = params.acknowledgements ?? [];
  const emergencyCards = params.emergencyCards ?? [];
  const wellbeingByWorkspace = params.wellbeingByWorkspace ?? [];

  let totalShadowHours = 0;
  let highestBurnout: HighestBurnoutDivision | null = null;

  const divisions: DivisionOverviewItem[] = params.workspaces.map((ws) => {
    const wsMembers = membersByWorkspace.get(ws.id) ?? [];
    const leads: DivisionLeadInfo[] = wsMembers
      .filter((m) => m.role === "LEAD")
      .map((m) => ({
        user_id: m.user_id,
        full_name: m.full_name,
        role_title: m.role_title,
      }));

    const latestEntry = latestByWorkspace.get(ws.id) ?? null;
    const latestSnapshot = latestEntry?.snapshot ?? null;
    if (latestSnapshot) {
      totalShadowHours += latestSnapshot.shadow_overtime_hours;
      if (
        latestSnapshot.shadow_overtime_hours > 0 &&
        (!highestBurnout ||
          latestSnapshot.shadow_overtime_hours >
            highestBurnout.shadow_overtime_hours)
      ) {
        highestBurnout = {
          workspace_id: ws.id,
          name: ws.name,
          shadow_overtime_hours: latestSnapshot.shadow_overtime_hours,
        };
      }
    }

    const boundaryScore = latestSnapshot
      ? calculateBoundaryScore({
          total_messages: latestSnapshot.total_messages,
          after_hours_messages: latestSnapshot.after_hours_messages,
          false_urgency_count: latestSnapshot.false_urgency_count,
          heatmap_matrix: latestEntry?.heatmapMatrix,
          work_days: ws.work_days,
        })
      : null;

    return {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      invite_code: ws.invite_code,
      work_pattern: ws.work_pattern as WorkPatternCode,
      work_start_time: ws.work_start_time,
      work_end_time: ws.work_end_time,
      digest_dispatch_time: ws.digest_dispatch_time,
      timezone: ws.timezone as IndonesiaTimezone,
      work_days: ws.work_days,
      regular_hours_label: formatWorkHoursRange(
        ws.work_start_time,
        ws.work_end_time,
        ws.timezone
      ),
      member_count: wsMembers.length,
      is_joined: params.viewerUserId
        ? wsMembers.some((m) => m.user_id === params.viewerUserId)
        : false,
      team_leads: leads,
      latest_snapshot: latestSnapshot,
      boundary_score: boundaryScore,
      charter_adoption: buildDivisionCharterAdoption(
        ws.id,
        wsMembers.length,
        activeCharters,
        acknowledgements
      ),
      wellbeing: buildDivisionWellbeingLatest(ws.id, wellbeingByWorkspace),
      emergency_audit: buildDivisionEmergencySummary(ws.id, emergencyCards),
      created_at: ws.created_at,
    };
  });

  return {
    organization: {
      id: params.organization.id,
      name: params.organization.name,
      slug: params.organization.slug,
      role: "OWNER",
    },
    kpis: {
      total_divisions: divisions.length,
      total_members: uniqueMemberIds.size,
      total_shadow_overtime_hours: Math.round(totalShadowHours * 10) / 10,
      highest_burnout_division: highestBurnout,
      emergency_audit: summarizeEmergencyAudit(emergencyCards),
    },
    divisions,
  };
}
