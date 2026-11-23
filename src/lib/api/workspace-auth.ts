import type { User } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validations";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type WorkspaceMemberAuthResult =
  | {
      ok: true;
      supabase: SupabaseServerClient;
      user: User;
      role: string;
      isOrgOwner: boolean;
      isJoined: boolean;
      organizationId: string | null;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireWorkspaceMember(
  workspaceId: string
): Promise<WorkspaceMemberAuthResult> {
  const idParsed = uuidSchema.safeParse(workspaceId);
  if (!idParsed.success) {
    return {
      ok: false,
      response: apiError("VALIDATION_ERROR", "ID workspace tidak valid.", 400),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: apiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401),
    };
  }

  const [{ data: membership }, { data: workspace }] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("workspaces")
      .select("id, organization_id")
      .eq("id", workspaceId)
      .maybeSingle(),
  ]);

  const organizationId = workspace?.organization_id ?? null;
  let isOrgOwner = false;

  if (organizationId) {
    const { data: orgMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();

    isOrgOwner = orgMembership?.role === "OWNER";
  }

  if (!membership && !isOrgOwner) {
    return {
      ok: false,
      response: apiError(
        "FORBIDDEN",
        "Anda tidak memiliki akses ke workspace ini.",
        403
      ),
    };
  }

  return {
    ok: true,
    supabase,
    user,
    role: isOrgOwner ? "OWNER" : (membership?.role ?? "MEMBER"),
    isOrgOwner,
    isJoined: Boolean(membership),
    organizationId,
  };
}
