export interface AuditHandoffData {
  avg_weekly_shadow_hours: number;
  shadow_overtime_hours: number;
  after_hours_percentage: number;
  work_start_time: string;
  work_end_time: string;
  peak_day_of_week: number;
  peak_hour: number;
  source_label: string;
  saved_at: string;
}

const HANDOFF_STORAGE_KEY = "batasjamreg:audit-handoff:v1";

export function saveAuditHandoff(data: AuditHandoffData): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function readAuditHandoff(): AuditHandoffData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as AuditHandoffData).avg_weekly_shadow_hours !== "number"
    ) {
      return null;
    }
    return parsed as AuditHandoffData;
  } catch {
    return null;
  }
}

export function clearAuditHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(HANDOFF_STORAGE_KEY);
  } catch {
    // Abaikan jika browser menonaktifkan sessionStorage
  }
}
