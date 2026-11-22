export type DigestTriageType = "MORNING_QUEUE" | "EMERGENCY_OPS";
export type DigestCardStatus = "QUEUED" | "DISPATCHED" | "ARCHIVED";
export type DigestTabKey = "MORNING_QUEUE" | "EMERGENCY_OPS" | "DISPATCHED";
export type RealtimeStatus = "CONNECTING" | "CONNECTED" | "DISCONNECTED";

export interface DigestCardItem {
  id: string;
  workspace_id: string;
  author_id: string;
  author_name: string;
  title: string;
  body: string;
  recipient_label: string;
  triage_type: DigestTriageType;
  emergency_reason: string | null;
  status: DigestCardStatus;
  scheduled_for: string;
  dispatched_at: string | null;
  created_at: string;
  updated_at: string;
}
