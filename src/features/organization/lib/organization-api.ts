import type {
  OrganizationListItem,
  OrganizationOverviewData,
  WorkspaceMemberItem,
} from "../types";

export interface CreateOrganizationPayload {
  name: string;
  initial_workspace_name: string;
  work_pattern: string;
  work_start_time: string;
  work_end_time: string;
  digest_dispatch_time: string;
  timezone: string;
  work_days: number[];
}

export async function fetchOrganizations(): Promise<{
  organizations: OrganizationListItem[];
  errorMsg: string | null;
}> {
  try {
    const res = await fetch("/api/organizations");
    const payload = (await res.json()) as {
      success?: boolean;
      data?: OrganizationListItem[];
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        organizations: [],
        errorMsg:
          payload.error?.message ?? "Gagal memuat daftar organisasi Anda.",
      };
    }

    return { organizations: payload.data, errorMsg: null };
  } catch {
    return {
      organizations: [],
      errorMsg: "Koneksi bermasalah saat memuat data perusahaan.",
    };
  }
}

export async function fetchOrganizationOverview(orgId: string): Promise<{
  data: OrganizationOverviewData | null;
  forbidden?: boolean;
  errorMsg: string | null;
}> {
  try {
    const res = await fetch(`/api/organizations/${orgId}/overview`);
    const payload = (await res.json()) as {
      success?: boolean;
      data?: OrganizationOverviewData;
      error?: { message?: string };
    };

    if (res.status === 403) {
      return {
        data: null,
        forbidden: true,
        errorMsg:
          payload.error?.message ??
          "Hanya Owner organisasi yang dapat mengakses halaman ini.",
      };
    }

    if (!res.ok || !payload.success || !payload.data) {
      return {
        data: null,
        errorMsg:
          payload.error?.message ?? "Gagal memuat ringkasan divisi perusahaan.",
      };
    }

    return { data: payload.data, errorMsg: null };
  } catch {
    return {
      data: null,
      errorMsg: "Koneksi bermasalah saat memuat ringkasan perusahaan.",
    };
  }
}

export async function fetchWorkspaceMembers(workspaceId: string): Promise<{
  members: WorkspaceMemberItem[];
  canManageRoles: boolean;
  errorMsg: string | null;
}> {
  try {
    const res = await fetch(`/api/workspaces/${workspaceId}/members`);
    const payload = (await res.json()) as {
      success?: boolean;
      data?: WorkspaceMemberItem[];
      meta?: { can_manage_roles?: boolean };
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        members: [],
        canManageRoles: false,
        errorMsg:
          payload.error?.message ?? "Gagal memuat daftar anggota divisi.",
      };
    }

    return {
      members: payload.data,
      canManageRoles: Boolean(payload.meta?.can_manage_roles),
      errorMsg: null,
    };
  } catch {
    return {
      members: [],
      canManageRoles: false,
      errorMsg: "Koneksi terputus saat memuat anggota divisi.",
    };
  }
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
  role: "MEMBER" | "LEAD"
): Promise<
  | { ok: true; member: WorkspaceMemberItem }
  | { ok: false; errorMsg: string }
> {
  try {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/members/${userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      }
    );
    const payload = (await res.json()) as {
      success?: boolean;
      data?: WorkspaceMemberItem;
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        ok: false,
        errorMsg:
          payload.error?.message ?? "Gagal mengubah peran anggota divisi.",
      };
    }

    return { ok: true, member: payload.data };
  } catch {
    return {
      ok: false,
      errorMsg: "Koneksi terputus saat menyimpan peran anggota.",
    };
  }
}

export async function createOrganizationRequest(
  body: CreateOrganizationPayload
): Promise<
  | {
      ok: true;
      organizationId: string;
      initialWorkspaceId: string | null;
      organizationName: string;
    }
  | { ok: false; errorMsg: string }
> {
  try {
    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await res.json()) as {
      success?: boolean;
      data?: {
        id: string;
        name: string;
        initial_workspace?: { id: string } | null;
      };
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data) {
      return {
        ok: false,
        errorMsg:
          payload.error?.message ?? "Gagal mendaftarkan tempat kerja baru.",
      };
    }

    return {
      ok: true,
      organizationId: payload.data.id,
      organizationName: payload.data.name,
      initialWorkspaceId: payload.data.initial_workspace?.id ?? null,
    };
  } catch {
    return {
      ok: false,
      errorMsg: "Koneksi terputus saat mendaftarkan tempat kerja baru.",
    };
  }
}
