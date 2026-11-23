import type {
  DiplomaticRecipientSchema,
  DiplomaticTimeContextSchema,
  DiplomaticToneSchema,
} from "./schema-types";

export type DiplomaticRecipient = DiplomaticRecipientSchema;
export type DiplomaticTimeContext = DiplomaticTimeContextSchema;
export type DiplomaticTone = DiplomaticToneSchema;

export interface TeamCharterRecord {
  id: string;
  workspace_id: string;
  created_by: string;
  title: string;
  company_or_team_name: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  non_urgent_sla_hours: number;
  emergency_criteria: string[];
  baseline_shadow_hours: number | null;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CharterSignerRole = "OWNER" | "LEAD" | "MEMBER";

export interface CharterAcknowledgementItem {
  id: string;
  user_id: string;
  full_name: string;
  role_title: string;
  workspace_role?: CharterSignerRole;
  signed_at: string;
}

export interface CharterAdoptionSummary {
  charter_id: string;
  signed_count: number;
  total_members: number;
  adoption_percentage: number;
  has_signed: boolean;
  acknowledgements: CharterAcknowledgementItem[];
}

export interface CharterDraft {
  title: string;
  company_or_team_name: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  non_urgent_sla_hours: number;
  emergency_criteria: string[];
  baseline_shadow_hours: number | null;
  version?: number;
  effective_date?: string;
  total_members?: number;
  timezone?: string;
  organization_name?: string | null;
  organization_stamp_url?: string | null;
  acknowledgements?: CharterAcknowledgementItem[];
}

export interface DiplomaticReplyDraft {
  label: string;
  text: string;
}

export type DiplomaticReplySource = "AI" | "TEMPLATE_FALLBACK";

export interface DiplomaticReplyResult {
  source: DiplomaticReplySource;
  replies: DiplomaticReplyDraft[];
}

export function normalizeEmergencyCriteria(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function formatCharterTimeShort(timeValue: string): string {
  return timeValue.slice(0, 5);
}
