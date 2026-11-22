import type { WorkspaceDetail, WorkspaceListItem } from "../types";

export interface WorkspaceBundle {
  workspaces: WorkspaceListItem[];
  selectedId: string | null;
  detail: WorkspaceDetail | null;
  errorMsg: string | null;
}

export async function fetchWorkspaceBundle(
  preferredId?: string
): Promise<WorkspaceBundle> {
  try {
    const listRes = await fetch("/api/workspaces");
    const listPayload = (await listRes.json()) as {
      success?: boolean;
      data?: WorkspaceListItem[];
      error?: { message?: string };
    };

    if (!listRes.ok || !listPayload.success || !listPayload.data) {
      return {
        workspaces: [],
        selectedId: null,
        detail: null,
        errorMsg:
          listPayload.error?.message ?? "Gagal memuat daftar workspace Anda.",
      };
    }

    const items = listPayload.data;
    if (items.length === 0) {
      return {
        workspaces: [],
        selectedId: null,
        detail: null,
        errorMsg: null,
      };
    }

    const target =
      items.find((item) => item.id === preferredId) ??
      items.find((item) => item.invite_code === "REG-8492") ??
      items[0];

    const detailRes = await fetch(`/api/workspaces/${target.id}`);
    const detailPayload = (await detailRes.json()) as {
      success?: boolean;
      data?: WorkspaceDetail;
      error?: { message?: string };
    };

    if (!detailRes.ok || !detailPayload.success || !detailPayload.data) {
      return {
        workspaces: items,
        selectedId: target.id,
        detail: null,
        errorMsg:
          detailPayload.error?.message ?? "Gagal memuat detail workspace.",
      };
    }

    return {
      workspaces: items,
      selectedId: target.id,
      detail: detailPayload.data,
      errorMsg: null,
    };
  } catch {
    return {
      workspaces: [],
      selectedId: null,
      detail: null,
      errorMsg: "Koneksi bermasalah saat memuat dashboard workspace.",
    };
  }
}
