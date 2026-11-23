import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import type { DemoActorConfig } from "@/lib/constants/demo-actors";
import type { Database } from "@/types/database.types";

export const DEMO_INVITE_CODE = "REG-8492";
export const DEMO_ORG_SLUG = "pt-nusantara-digital";

export async function ensureDemoAccountAndWorkspace(
  actorConfig: DemoActorConfig,
  demoEmail: string,
  demoPassword: string
): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return false;
  }

  const admin = createSupabaseAdminClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: usersData, error: listError } =
    await admin.auth.admin.listUsers({ page: 1, perPage: 200 });

  if (listError) {
    return false;
  }

  const existingUser = usersData.users.find(
    (item) => item.email?.toLowerCase() === demoEmail.toLowerCase()
  );

  let userId: string | null = existingUser?.id ?? null;

  if (!existingUser) {
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { full_name: actorConfig.fullName },
      });
    if (createErr || !created.user) {
      return false;
    }
    userId = created.user.id;
  } else {
    const { error: updateErr } = await admin.auth.admin.updateUserById(
      existingUser.id,
      { password: demoPassword, email_confirm: true }
    );
    if (updateErr) {
      return false;
    }
  }

  if (!userId) return false;

  await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: actorConfig.fullName,
      role_title: actorConfig.roleTitle,
    },
    { onConflict: "id" }
  );

  const { data: existingOrg } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", DEMO_ORG_SLUG)
    .maybeSingle();

  let orgId = existingOrg?.id ?? null;

  if (!orgId) {
    const { data: insertedOrg } = await admin
      .from("organizations")
      .insert({
        name: "PT Nusantara Digital",
        slug: DEMO_ORG_SLUG,
        created_by: userId,
      })
      .select("id")
      .single();
    orgId = insertedOrg?.id ?? null;
  }

  const { data: existingWs } = await admin
    .from("workspaces")
    .select("id, organization_id")
    .eq("invite_code", DEMO_INVITE_CODE)
    .maybeSingle();

  let workspaceId = existingWs?.id ?? null;

  if (!workspaceId) {
    const { data: insertedWs } = await admin
      .from("workspaces")
      .insert({
        name: "Tim Kreatif Nusantara",
        slug: "tim-kreatif-nusantara",
        invite_code: DEMO_INVITE_CODE,
        organization_id: orgId,
        work_pattern: "FIVE_DAYS_8H",
        work_start_time: "09:00:00",
        work_end_time: "17:00:00",
        digest_dispatch_time: "08:30:00",
        timezone: "Asia/Jakarta",
        work_days: [1, 2, 3, 4, 5],
        created_by: userId,
      })
      .select("id")
      .single();
    workspaceId = insertedWs?.id ?? null;
  } else if (orgId && !existingWs?.organization_id) {
    await admin
      .from("workspaces")
      .update({ organization_id: orgId })
      .eq("id", workspaceId);
  }

  if (orgId) {
    await admin.from("organization_members").upsert(
      {
        organization_id: orgId,
        user_id: userId,
        role: actorConfig.actor === "OWNER" ? "OWNER" : "MEMBER",
      },
      { onConflict: "organization_id,user_id" }
    );
  }

  if (workspaceId) {
    await admin.from("workspace_members").upsert(
      {
        workspace_id: workspaceId,
        user_id: userId,
        role: actorConfig.actor,
      },
      { onConflict: "workspace_id,user_id" }
    );
  }

  return true;
}
