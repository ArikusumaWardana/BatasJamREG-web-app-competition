import type { CreateAuditSnapshotInput } from "@/lib/validations";

export interface WorkspaceOption {
  id: string;
  name: string;
  invite_code: string;
}

export async function fetchUserWorkspacesForSnapshot(): Promise<{
  status: "authenticated" | "guest";
  workspaces: WorkspaceOption[];
}> {
  try {
    const res = await fetch("/api/workspaces");
    if (res.status === 401) {
      return { status: "guest", workspaces: [] };
    }

    const payload = (await res.json()) as {
      success?: boolean;
      data?: WorkspaceOption[];
    };

    if (!res.ok || !payload.success || !payload.data) {
      return { status: "guest", workspaces: [] };
    }

    return { status: "authenticated", workspaces: payload.data };
  } catch {
    return { status: "guest", workspaces: [] };
  }
}

export async function postAuditSnapshot(
  workspaceId: string,
  payload: CreateAuditSnapshotInput
): Promise<{ ok: boolean; errorMessage?: string }> {
  try {
    const response = await fetch(
      `/api/workspaces/${workspaceId}/audit-snapshots`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const resData = (await response.json()) as {
      success?: boolean;
      error?: { message?: string };
    };

    if (!response.ok || !resData.success) {
      return {
        ok: false,
        errorMessage:
          resData.error?.message ?? "Gagal menyimpan snapshot ke workspace.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      errorMessage: "Koneksi terputus saat menyimpan snapshot.",
    };
  }
}
