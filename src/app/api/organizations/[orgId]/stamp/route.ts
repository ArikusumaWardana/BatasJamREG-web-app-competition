import { requireOrgOwner } from "@/lib/api/organization-auth";
import { apiError, apiSuccess } from "@/lib/api/response";

interface RouteContext {
  params: Promise<{ orgId: string }>;
}

const STAMP_BUCKET = "org-assets";
const MAX_STAMP_BYTES = 1_048_576;

const ALLOWED_STAMP_MIME: Record<string, "png" | "webp"> = {
  "image/png": "png",
  "image/webp": "webp",
};

function hasValidStampMagicBytes(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (mime === "image/webp") {
    return (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }
  return false;
}

export async function POST(request: Request, context: RouteContext) {
  const { orgId } = await context.params;
  const auth = await requireOrgOwner(orgId);
  if (!auth.ok) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError(
      "VALIDATION_ERROR",
      "Permintaan unggah file harus berformat multipart/form-data.",
      400
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return apiError(
      "VALIDATION_ERROR",
      "Pilih berkas gambar stempel PNG atau WebP terlebih dahulu.",
      400
    );
  }

  const ext = ALLOWED_STAMP_MIME[file.type];
  if (!ext) {
    return apiError(
      "VALIDATION_ERROR",
      "Format gambar tidak didukung. Gunakan berkas PNG atau WebP.",
      400
    );
  }

  if (file.size > MAX_STAMP_BYTES) {
    return apiError(
      "VALIDATION_ERROR",
      "Ukuran berkas stempel maksimal 1 MB.",
      400
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidStampMagicBytes(bytes, file.type)) {
    return apiError(
      "VALIDATION_ERROR",
      "Isi berkas tidak cocok dengan format PNG atau WebP yang valid.",
      400
    );
  }

  const objectPath = `${orgId}/stamp.${ext}`;
  const altPath = `${orgId}/stamp.${ext === "png" ? "webp" : "png"}`;

  const { error: uploadErr } = await auth.supabase.storage
    .from(STAMP_BUCKET)
    .upload(objectPath, bytes, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadErr) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal mengunggah gambar stempel ke penyimpanan.",
      500
    );
  }

  await auth.supabase.storage.from(STAMP_BUCKET).remove([altPath]);

  const { data: pubData } = auth.supabase.storage
    .from(STAMP_BUCKET)
    .getPublicUrl(objectPath);
  const stampUrl = `${pubData.publicUrl}?v=${Date.now()}`;

  const { error: updateErr } = await auth.supabase
    .from("organizations")
    .update({ stamp_url: stampUrl })
    .eq("id", orgId);

  if (updateErr) {
    return apiError(
      "INTERNAL_ERROR",
      "Stempel terunggah, namun gagal menyimpan tautan ke profil organisasi.",
      500
    );
  }

  return apiSuccess({ stamp_url: stampUrl });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { orgId } = await context.params;
  const auth = await requireOrgOwner(orgId);
  if (!auth.ok) return auth.response;

  const { error: removeErr } = await auth.supabase.storage
    .from(STAMP_BUCKET)
    .remove([`${orgId}/stamp.png`, `${orgId}/stamp.webp`]);

  if (removeErr) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal menghapus berkas stempel dari penyimpanan.",
      500
    );
  }

  const { error: updateErr } = await auth.supabase
    .from("organizations")
    .update({ stamp_url: null })
    .eq("id", orgId);

  if (updateErr) {
    return apiError(
      "INTERNAL_ERROR",
      "Berkas terhapus, namun gagal memperbarui data organisasi.",
      500
    );
  }

  return apiSuccess({ stamp_url: null });
}
