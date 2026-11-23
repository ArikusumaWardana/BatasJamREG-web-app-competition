import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { createOrganizationSchema } from "@/lib/validations";
import {
  generateInviteCode,
  generateOrganizationSlug,
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

  const [{ data: orgRows, error: orgError }, { data: wsRows }] =
    await Promise.all([
      supabase
        .from("organization_members")
        .select("role, joined_at, organizations(id, name, slug)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: true }),
      supabase.from("workspaces").select("id, organization_id"),
    ]);

  if (orgError) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat daftar organisasi Anda.",
      500
    );
  }

  const countsByOrg = new Map<string, number>();
  for (const ws of wsRows ?? []) {
    if (!ws.organization_id) continue;
    countsByOrg.set(
      ws.organization_id,
      (countsByOrg.get(ws.organization_id) ?? 0) + 1
    );
  }

  const list = (orgRows ?? []).flatMap((item) => {
    const org = Array.isArray(item.organizations)
      ? item.organizations[0]
      : item.organizations;
    if (!org) return [];
    return [
      {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: item.role === "OWNER" ? "OWNER" : "MEMBER",
        joined_at: item.joined_at,
        workspace_count: countsByOrg.get(org.id) ?? 0,
      },
    ];
  });

  return apiSuccess(list);
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

  const parsed = createOrganizationSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Data pendaftaran tempat kerja tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  let createdOrg: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
  } | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = generateOrganizationSlug(parsed.data.name);
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: parsed.data.name,
        slug,
        created_by: user.id,
      })
      .select("id, name, slug, created_at, updated_at")
      .single();

    if (!error && data) {
      createdOrg = data;
      break;
    }

    if (error?.code !== "23505") {
      return apiError(
        "INTERNAL_ERROR",
        "Gagal mendaftarkan tempat kerja baru.",
        500
      );
    }
  }

  if (!createdOrg) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal membuat identitas unik organisasi, silakan coba lagi.",
      500
    );
  }

  let initialWorkspace = null;
  if (parsed.data.initial_workspace_name) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const wsSlug = generateWorkspaceSlug(parsed.data.initial_workspace_name);
      const inviteCode = generateInviteCode();
      const { data: wsData, error: wsError } = await supabase
        .from("workspaces")
        .insert({
          name: parsed.data.initial_workspace_name,
          slug: wsSlug,
          invite_code: inviteCode,
          organization_id: createdOrg.id,
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

      if (!wsError && wsData) {
        initialWorkspace = { ...wsData, role: "OWNER" as const };
        break;
      }

      if (wsError?.code !== "23505") {
        return apiError(
          "INTERNAL_ERROR",
          "Organisasi dibuat, tetapi gagal membuat divisi pertama.",
          500
        );
      }
    }
  }

  return apiSuccess(
    {
      ...createdOrg,
      role: "OWNER" as const,
      initial_workspace: initialWorkspace,
    },
    201
  );
}
