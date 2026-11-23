import type { WellbeingPulsePayload } from "../types";

export interface SubmitWellbeingPulseInput {
  rest_quality: number;
  reply_pressure: number;
  boundary_clarity: number;
}

export async function fetchWorkspaceWellbeingPulse(
  workspaceId: string
): Promise<
  | { ok: true; data: WellbeingPulsePayload }
  | { ok: false; errorMsg: string }
> {
  try {
    const res = await fetch(`/api/workspaces/${workspaceId}/wellbeing-pulse`);
    const payload = (await res.json()) as {
      success?: boolean;
      data?: WellbeingPulsePayload;
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        ok: false,
        errorMsg:
          payload.error?.message ?? "Gagal memuat check-in kesejahteraan tim.",
      };
    }

    return { ok: true, data: payload.data };
  } catch {
    return {
      ok: false,
      errorMsg: "Koneksi bermasalah saat memuat check-in kesejahteraan.",
    };
  }
}

export async function submitWorkspaceWellbeingPulse(
  workspaceId: string,
  body: SubmitWellbeingPulseInput
): Promise<
  | { ok: true; data: WellbeingPulsePayload }
  | { ok: false; errorMsg: string }
> {
  try {
    const res = await fetch(`/api/workspaces/${workspaceId}/wellbeing-pulse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await res.json()) as {
      success?: boolean;
      data?: WellbeingPulsePayload;
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        ok: false,
        errorMsg:
          payload.error?.message ?? "Gagal menyimpan check-in kesejahteraan.",
      };
    }

    return { ok: true, data: payload.data };
  } catch {
    return {
      ok: false,
      errorMsg: "Koneksi terputus saat mengirim check-in kesejahteraan.",
    };
  }
}
