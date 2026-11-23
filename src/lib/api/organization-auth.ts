import type { User } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validations";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type OrgOwnerAuthResult =
  | {
      ok: true;
      supabase: SupabaseServerClient;
      user: User;
      orgId: string;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireOrgOwner(
  orgId: string
): Promise<OrgOwnerAuthResult> {
  const idParsed = uuidSchema.safeParse(orgId);
  if (!idParsed.success) {
    return {
      ok: false,
      response: apiError("VALIDATION_ERROR", "ID organisasi tidak valid.", 400),
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

  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!orgMember || orgMember.role !== "OWNER") {
    return {
      ok: false,
      response: apiError(
        "FORBIDDEN",
        "Hanya Owner organisasi yang dapat mengakses ringkasan perusahaan.",
        403
      ),
    };
  }

  return {
    ok: true,
    supabase,
    user,
    orgId,
  };
}
