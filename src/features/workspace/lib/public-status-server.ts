import { createClient } from "@supabase/supabase-js";
import type { IndonesiaTimezone } from "@/lib/constants/work-hours";
import type { Database } from "@/types/database.types";

export interface PublicWorkspaceStatus {
  workspace_name: string;
  slug: string;
  work_pattern: string;
  work_start_time: string;
  work_end_time: string;
  work_days: number[];
  timezone: IndonesiaTimezone;
  digest_dispatch_time: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  non_urgent_sla_hours: number | null;
  emergency_criteria: string[];
}

function normalizeTimezone(value: string): IndonesiaTimezone {
  if (
    value === "Asia/Jakarta" ||
    value === "Asia/Makassar" ||
    value === "Asia/Jayapura"
  ) {
    return value;
  }
  return "Asia/Jakarta";
}

function normalizeCriteria(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export async function getPublicWorkspaceStatus(
  slug: string
): Promise<PublicWorkspaceStatus | null> {
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }

  const supabase = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.rpc("get_public_workspace_status", {
    p_slug: cleanSlug,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  const row = data[0];
  if (!row) return null;

  return {
    workspace_name: row.workspace_name,
    slug: row.slug,
    work_pattern: row.work_pattern,
    work_start_time: row.work_start_time,
    work_end_time: row.work_end_time,
    work_days:
      Array.isArray(row.work_days) && row.work_days.length > 0
        ? row.work_days
        : [1, 2, 3, 4, 5],
    timezone: normalizeTimezone(row.timezone),
    digest_dispatch_time: row.digest_dispatch_time,
    quiet_hours_start: row.quiet_hours_start ?? null,
    quiet_hours_end: row.quiet_hours_end ?? null,
    non_urgent_sla_hours:
      typeof row.non_urgent_sla_hours === "number"
        ? row.non_urgent_sla_hours
        : null,
    emergency_criteria: normalizeCriteria(row.emergency_criteria),
  };
}
