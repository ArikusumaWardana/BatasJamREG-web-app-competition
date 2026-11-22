import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { createWorkspaceSchema } from "@/lib/validations";
import {
  generateInviteCode,
  generateWorkspaceSlug,
} from "@/lib/workspace/slug";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      "role, joined_at, workspaces(id, name, slug, invite_code, work_pattern, work_start_time, work_end_time, digest_dispatch_time, timezone, work_days, created_at, updated_at)"
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true });

  if (error) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat daftar workspace Anda.",
      500
    );
  }

  const workspaces = (data ?? []).flatMap((item) => {
    const ws = Array.isArray(item.workspaces)
      ? item.workspaces[0]
      : item.workspaces;
    if (!ws) return [];
    return [{ ...ws, role: item.role }];
  });

  return apiSuccess(workspaces);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
  }

  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const parsed = createWorkspaceSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Data pembuatan workspace tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = generateWorkspaceSlug(parsed.data.name);
    const inviteCode = generateInviteCode();

    const { data, error } = await supabase
      .from("workspaces")
      .insert({
        name: parsed.data.name,
        slug,
        invite_code: inviteCode,
        work_pattern: parsed.data.work_pattern,
        work_start_time: parsed.data.work_start_time,
        work_end_time: parsed.data.work_end_time,
        digest_dispatch_time: parsed.data.digest_dispatch_time,
        timezone: parsed.data.timezone,
        work_days: parsed.data.work_days,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (!error && data) {
      return apiSuccess({ ...data, role: "OWNER" }, 201);
    }

    if (error?.code !== "23505") {
      return apiError(
        "INTERNAL_ERROR",
        "Gagal membuat workspace baru.",
        500
      );
    }
  }

  return apiError(
    "INTERNAL_ERROR",
    "Gagal membuat kode unik workspace, silakan coba lagi.",
    500
  );
}
