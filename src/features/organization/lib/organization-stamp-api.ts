export async function uploadOrganizationStamp(
  orgId: string,
  file: File
): Promise<{ ok: true; stampUrl: string } | { ok: false; errorMsg: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/organizations/${orgId}/stamp`, {
      method: "POST",
      body: formData,
    });
    const payload = (await res.json()) as {
      success?: boolean;
      data?: { stamp_url?: string | null };
      error?: { message?: string };
    };

    if (!res.ok || !payload.success || !payload.data?.stamp_url) {
      return {
        ok: false,
        errorMsg: payload.error?.message ?? "Gagal mengunggah stempel perusahaan.",
      };
    }

    return { ok: true, stampUrl: payload.data.stamp_url };
  } catch {
    return {
      ok: false,
      errorMsg: "Koneksi terputus saat mengunggah stempel perusahaan.",
    };
  }
}

export async function deleteOrganizationStamp(
  orgId: string
): Promise<{ ok: true } | { ok: false; errorMsg: string }> {
  try {
    const res = await fetch(`/api/organizations/${orgId}/stamp`, {
      method: "DELETE",
    });
    const payload = (await res.json()) as {
      success?: boolean;
      error?: { message?: string };
    };

    if (!res.ok || !payload.success) {
      return {
        ok: false,
        errorMsg: payload.error?.message ?? "Gagal menghapus stempel perusahaan.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      errorMsg: "Koneksi terputus saat menghapus stempel perusahaan.",
    };
  }
}
