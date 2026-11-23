import { getStoredActiveWorkspaceId } from "@/lib/storage/active-workspace";
import type { DiplomaticReplyInput } from "@/lib/validations";
import type {
  CharterAdoptionSummary,
  CharterDraft,
  DiplomaticReplyResult,
  TeamCharterRecord,
} from "../types";

export interface CharterWorkspaceOption {
  id: string;
  name: string;
  invite_code: string;
}

export async function fetchActiveCharterWorkspace(): Promise<{
  status: "authenticated" | "guest";
  workspace: CharterWorkspaceOption | null;
}> {
  try {
    const res = await fetch("/api/workspaces");
    if (res.status === 401) {
      return { status: "guest", workspace: null };
    }

    const payload = (await res.json()) as {
      success?: boolean;
      data?: CharterWorkspaceOption[];
    };

    if (!res.ok || !payload.success || !payload.data) {
      return { status: "guest", workspace: null };
    }

    const storedId = getStoredActiveWorkspaceId();
    const preferred =
      (storedId
        ? payload.data.find((ws) => ws.id === storedId)
        : undefined) ??
      payload.data.find((ws) => ws.invite_code === "REG-8492") ??
      payload.data[0] ??
      null;

    return { status: "authenticated", workspace: preferred };
  } catch {
    return { status: "guest", workspace: null };
  }
}

export async function fetchWorkspaceCharters(
  workspaceId: string
): Promise<TeamCharterRecord[]> {
  try {
    const res = await fetch(`/api/workspaces/${workspaceId}/charters`);
    const payload = (await res.json()) as {
      success?: boolean;
      data?: TeamCharterRecord[];
    };

    if (!res.ok || !payload.success || !payload.data) {
      return [];
    }

    return payload.data;
  } catch {
    return [];
  }
}

export async function saveWorkspaceCharter(
  workspaceId: string,
  draft: CharterDraft
): Promise<{ ok: true; data: TeamCharterRecord } | { ok: false; message: string }> {
  try {
    const res = await fetch(`/api/workspaces/${workspaceId}/charters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title.trim(),
        company_or_team_name: draft.company_or_team_name.trim(),
        quiet_hours_start: draft.quiet_hours_start,
        quiet_hours_end: draft.quiet_hours_end,
        non_urgent_sla_hours: draft.non_urgent_sla_hours,
        emergency_criteria: draft.emergency_criteria,
        baseline_shadow_hours: draft.baseline_shadow_hours,
      }),
    });

    const payload = (await res.json()) as {
      success?: boolean;
      data?: TeamCharterRecord;
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        ok: false,
        message:
          payload.error?.message ?? "Gagal menyimpan Piagam Jam Digital ke workspace.",
      };
    }

    return { ok: true, data: payload.data };
  } catch {
    return {
      ok: false,
      message: "Koneksi terputus saat menyimpan Piagam Jam Digital.",
    };
  }
}

export async function requestDiplomaticReplies(
  input: DiplomaticReplyInput
): Promise<
  | { ok: true; data: DiplomaticReplyResult; fallbackReason?: string }
  | { ok: false; message: string }
> {
  try {
    const res = await fetch("/api/ai/diplomatic-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await res.json()) as {
      success?: boolean;
      data?: DiplomaticReplyResult;
      meta?: { fallback_reason?: string };
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        ok: false,
        message:
          payload.error?.message ?? "Gagal menyusun variasi balasan diplomatis.",
      };
    }

    return {
      ok: true,
      data: payload.data,
      fallbackReason: payload.meta?.fallback_reason,
    };
  } catch {
    return {
      ok: false,
      message: "Koneksi terputus saat menghubungi penyusun balasan.",
    };
  }
}

export async function fetchCharterAcknowledgements(
  workspaceId: string,
  charterId: string
): Promise<
  | { ok: true; data: CharterAdoptionSummary }
  | { ok: false; message: string }
> {
  try {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/charters/${charterId}/acknowledge`
    );
    const payload = (await res.json()) as {
      success?: boolean;
      data?: CharterAdoptionSummary;
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        ok: false,
        message:
          payload.error?.message ?? "Gagal memuat status persetujuan piagam.",
      };
    }

    return { ok: true, data: payload.data };
  } catch {
    return {
      ok: false,
      message: "Koneksi terputus saat memuat persetujuan piagam.",
    };
  }
}

export async function signWorkspaceCharter(
  workspaceId: string,
  charterId: string
): Promise<
  | { ok: true; data: CharterAdoptionSummary }
  | { ok: false; message: string }
> {
  try {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/charters/${charterId}/acknowledge`,
      { method: "POST" }
    );
    const payload = (await res.json()) as {
      success?: boolean;
      data?: CharterAdoptionSummary;
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        ok: false,
        message:
          payload.error?.message ?? "Gagal menandatangani Piagam Jam Digital.",
      };
    }

    return { ok: true, data: payload.data };
  } catch {
    return {
      ok: false,
      message: "Koneksi terputus saat menandatangani piagam.",
    };
  }
}
