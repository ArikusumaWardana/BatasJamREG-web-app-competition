import type { WorkspaceListItem } from "@/features/workspace/types";
import { createClient } from "@/lib/supabase/client";
import type { DigestTriageType } from "../types";

export interface SaveDigestCardPayload {
  title: string;
  body: string;
  recipient_label: string;
  triage_type: DigestTriageType;
  emergency_reason: string | null;
  scheduled_for: string;
}

export async function loadActiveWorkspaceContext(): Promise<{
  workspace: WorkspaceListItem | null;
  userId: string | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    const [{ data: userData }, res] = await Promise.all([
      supabase.auth.getUser(),
      fetch("/api/workspaces"),
    ]);

    const payload = (await res.json()) as {
      success?: boolean;
      data?: WorkspaceListItem[];
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        workspace: null,
        userId: userData.user?.id ?? null,
        error: payload.error?.message ?? "Gagal memuat data workspace aktif.",
      };
    }

    const active =
      payload.data.find((item) => item.invite_code === "REG-8492") ??
      payload.data[0] ??
      null;

    return { workspace: active, userId: userData.user?.id ?? null, error: null };
  } catch {
    return {
      workspace: null,
      userId: null,
      error: "Koneksi bermasalah saat memuat workspace.",
    };
  }
}

export async function saveDigestCardRequest(
  workspaceId: string,
  cardId: string | null,
  body: SaveDigestCardPayload
): Promise<{ ok: boolean; errorMessage?: string }> {
  try {
    const endpoint = cardId
      ? `/api/workspaces/${workspaceId}/digest-cards/${cardId}`
      : `/api/workspaces/${workspaceId}/digest-cards`;
    const response = await fetch(endpoint, {
      method: cardId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as {
      success?: boolean;
      error?: { message?: string };
    };

    if (!response.ok || !payload.success) {
      return {
        ok: false,
        errorMessage:
          payload.error?.message ?? "Gagal menyimpan kartu instruksi.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      errorMessage: "Koneksi terputus saat menyimpan kartu.",
    };
  }
}

export async function deleteDigestCardRequest(
  workspaceId: string,
  cardId: string
): Promise<{ ok: boolean; errorMessage?: string }> {
  try {
    const response = await fetch(
      `/api/workspaces/${workspaceId}/digest-cards/${cardId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      return { ok: false, errorMessage: "Gagal menghapus kartu instruksi." };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      errorMessage: "Koneksi terputus saat menghapus kartu.",
    };
  }
}
