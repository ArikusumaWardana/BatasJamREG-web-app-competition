import {
  computeCharterAdoptionPercentage,
  mapWellbeingSummaryRow,
  summarizeEmergencyAudit,
  type RawWellbeingSummaryRpcRow,
} from "@/features/wellbeing/lib/wellbeing-metrics";
import type {
  EmergencyAuditSummary,
  WellbeingWeekSummary,
} from "@/features/wellbeing/types";
import type { DivisionCharterAdoptionSummary } from "../types";

export interface RawActiveCharterInput {
  id: string;
  workspace_id: string;
  version: number;
}

export interface RawCharterAckRef {
  charter_id: string;
  workspace_id: string;
  user_id: string;
}

export interface RawEmergencyCardRef {
  workspace_id: string;
  emergency_review_status: string;
}

export interface RawDivisionWellbeingInput {
  workspace_id: string;
  rows: RawWellbeingSummaryRpcRow[];
}

export function buildDivisionCharterAdoption(
  workspaceId: string,
  memberCount: number,
  activeCharters: RawActiveCharterInput[],
  acknowledgements: RawCharterAckRef[]
): DivisionCharterAdoptionSummary {
  const activeCharter = activeCharters.find(
    (item) => item.workspace_id === workspaceId
  );

  if (!activeCharter) {
    return {
      charter_id: null,
      version: null,
      signed_count: 0,
      total_members: memberCount,
      adoption_percentage: null,
    };
  }

  const signedCount = acknowledgements.filter(
    (ack) => ack.charter_id === activeCharter.id
  ).length;

  return {
    charter_id: activeCharter.id,
    version: activeCharter.version,
    signed_count: signedCount,
    total_members: memberCount,
    adoption_percentage: computeCharterAdoptionPercentage(
      signedCount,
      memberCount
    ),
  };
}

export function buildDivisionWellbeingLatest(
  workspaceId: string,
  wellbeingByWorkspace: RawDivisionWellbeingInput[]
): WellbeingWeekSummary | null {
  const entry = wellbeingByWorkspace.find(
    (item) => item.workspace_id === workspaceId
  );
  const latestRow = entry?.rows[0];
  if (!latestRow) return null;
  return mapWellbeingSummaryRow(latestRow);
}

export function buildDivisionEmergencySummary(
  workspaceId: string,
  emergencyCards: RawEmergencyCardRef[]
): EmergencyAuditSummary {
  const divisionCards = emergencyCards.filter(
    (item) => item.workspace_id === workspaceId
  );
  return summarizeEmergencyAudit(divisionCards);
}
