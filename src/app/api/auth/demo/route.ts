import { z } from "zod";
import {
  DEMO_INVITE_CODE,
  ensureDemoAccountAndWorkspace,
} from "@/features/auth/lib/demo-provisioner";
import { apiError, apiSuccess, formatZodIssues } from "@/lib/api/response";
import {
  findDemoUserByEmail,
  getDemoActorConfig,
  type DemoActorRole,
} from "@/lib/constants/demo-actors";
import { createClient } from "@/lib/supabase/server";

const demoLoginRequestSchema = z.object({
  actor: z.enum(["OWNER", "LEAD", "MEMBER"]).default("OWNER"),
  email: z.string().email().optional(),
});

async function parseOptionalActorBody(
  request: Request
): Promise<
  | { ok: true; actor: DemoActorRole; email?: string }
  | { ok: false; response: ReturnType<typeof apiError> }
> {
  try {
    const rawText = await request.text();
    if (!rawText.trim()) {
      return { ok: true, actor: "OWNER" };
    }
    const parsedJson: unknown = JSON.parse(rawText);
    const validated = demoLoginRequestSchema.safeParse(parsedJson);
    if (!validated.success) {
      return {
        ok: false,
        response: apiError(
          "VALIDATION_ERROR",
          "Pilihan aktor demo tidak valid.",
          400,
          formatZodIssues(validated.error)
        ),
      };
    }
    return {
      ok: true,
      actor: validated.data.actor,
      email: validated.data.email,
    };
  } catch {
    return {
      ok: false,
      response: apiError(
        "VALIDATION_ERROR",
        "Format body JSON tidak valid.",
        400
      ),
    };
  }
}

export async function POST(request: Request) {
  const actorResult = await parseOptionalActorBody(request);
  if (!actorResult.ok) {
    return actorResult.response;
  }

  const matchedUser = actorResult.email
    ? findDemoUserByEmail(actorResult.email)
    : undefined;

  if (actorResult.email && !matchedUser) {
    return apiError(
      "VALIDATION_ERROR",
      "Akun demo yang dipilih tidak terdaftar.",
      400
    );
  }

  const actorConfig = getDemoActorConfig(
    matchedUser?.actor ?? actorResult.actor
  );
  const demoEmail = matchedUser
    ? matchedUser.email
    : actorConfig.actor === "OWNER"
      ? process.env.DEMO_USER_EMAIL?.trim() || actorConfig.defaultEmail
      : actorConfig.defaultEmail;
  const demoPassword = process.env.DEMO_USER_PASSWORD?.trim();

  if (!demoPassword) {
    return apiError(
      "INTERNAL_ERROR",
      "Konfigurasi akun demo belum lengkap pada server.",
      500
    );
  }

  const supabase = await createClient();
  let signInResult = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (signInResult.error || !signInResult.data.user) {
    const ensured = await ensureDemoAccountAndWorkspace(
      actorConfig,
      demoEmail,
      demoPassword
    );
    if (!ensured) {
      return apiError(
        "INTERNAL_ERROR",
        "Gagal menyiapkan sesi workspace demo.",
        500
      );
    }

    signInResult = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });
  }

  if (signInResult.error || !signInResult.data.user) {
    return apiError(
      "UNAUTHORIZED",
      "Kredensial akun demo tidak dapat diverifikasi.",
      401
    );
  }

  const user = signInResult.data.user;

  let [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role_title")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("workspace_members")
      .select("workspace_id, workspaces(id, invite_code)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: true }),
  ]);

  if (!memberships || memberships.length === 0) {
    await ensureDemoAccountAndWorkspace(actorConfig, demoEmail, demoPassword);
    const reloaded = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, role_title")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(id, invite_code)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: true }),
    ]);
    profile = reloaded[0].data;
    memberships = reloaded[1].data;
  }

  let defaultWorkspaceId: string | null = null;
  if (memberships && memberships.length > 0) {
    const demoMembership = memberships.find((item) => {
      const ws = Array.isArray(item.workspaces)
        ? item.workspaces[0]
        : item.workspaces;
      return ws?.invite_code === DEMO_INVITE_CODE;
    });
    defaultWorkspaceId =
      demoMembership?.workspace_id ?? memberships[0].workspace_id;
  }

  const fullName = profile
    ? `${profile.full_name} (${profile.role_title})`
    : `${actorConfig.fullName} (${actorConfig.roleTitle})`;

  return apiSuccess({
    user: {
      id: user.id,
      email: user.email ?? demoEmail,
      full_name: fullName,
    },
    actor: actorConfig.actor,
    default_workspace_id: defaultWorkspaceId,
  });
}
