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
  generateOrganizationSlug,
  generateWorkspaceSlug,
} from "@/lib/workspace/slug";
import { fetchAccessibleWorkspaces } from "@/lib/workspace/workspace-list";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
  }

  const result = await fetchAccessibleWorkspaces(supabase, user.id);
  if (result.error) {
    return apiError(
      "INTERNAL_ERROR",
      "Gagal memuat daftar workspace Anda.",
      500
    );
  }

  return apiSuccess(result.workspaces);
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
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = createWorkspaceSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Data pembuatan workspace tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  let targetOrgId: string | null = parsed.data.organization_id ?? null;
  let targetOrgName: string | null = null;
  let targetOrgRole: "OWNER" | "MEMBER" | null = null;

  if (targetOrgId) {
    const { data: orgMem } = await supabase
      .from("organization_members")
      .select("role, organizations(name)")
      .eq("organization_id", targetOrgId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!orgMem) {
      return apiError(
        "FORBIDDEN",
        "Anda harus tergabung dalam organisasi ini untuk membuat divisi baru.",
        403
      );
    }
    const orgRel = Array.isArray(orgMem.organizations)
      ? orgMem.organizations[0]
      : orgMem.organizations;
    targetOrgName = orgRel?.name ?? null;
    targetOrgRole = orgMem.role === "OWNER" ? "OWNER" : "MEMBER";
  } else {
    const { data: orgMemberships } = await supabase
      .from("organization_members")
      .select("organization_id, role, joined_at, organizations(name)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: true });

    const preferredOrg =
      orgMemberships?.find((item) => item.role === "OWNER") ??
      orgMemberships?.[0] ??
      null;

    if (preferredOrg?.organization_id) {
      targetOrgId = preferredOrg.organization_id;
      const orgRel = Array.isArray(preferredOrg.organizations)
        ? preferredOrg.organizations[0]
        : preferredOrg.organizations;
      targetOrgName = orgRel?.name ?? null;
      targetOrgRole = preferredOrg.role === "OWNER" ? "OWNER" : "MEMBER";
    } else {
      for (let orgAttempt = 0; orgAttempt < 3; orgAttempt += 1) {
        const orgName = `Organisasi ${parsed.data.name}`.slice(0, 100);
        const { data: newOrg, error: newOrgErr } = await supabase
          .from("organizations")
          .insert({
            name: orgName,
            slug: generateOrganizationSlug(orgName),
            created_by: user.id,
          })
          .select("id, name")
          .single();

        if (!newOrgErr && newOrg) {
          targetOrgId = newOrg.id;
          targetOrgName = newOrg.name;
          targetOrgRole = "OWNER";
          break;
        }
        if (newOrgErr?.code !== "23505") {
          return apiError(
            "INTERNAL_ERROR",
            "Gagal menyiapkan organisasi untuk divisi baru.",
            500
          );
        }
      }
    }
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
        organization_id: targetOrgId,
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
      return apiSuccess(
        {
          ...data,
          organization_name: targetOrgName,
          org_role: targetOrgRole,
          role: targetOrgRole === "OWNER" ? ("OWNER" as const) : ("LEAD" as const),
          is_joined: true,
        },
        201
      );
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
