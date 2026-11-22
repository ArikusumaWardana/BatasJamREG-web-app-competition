import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { joinWorkspaceSchema } from "@/lib/validations";

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

  const parsed = joinWorkspaceSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Kode undangan tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const { data, error } = await supabase.rpc("join_workspace_by_invite_code", {
    p_invite_code: parsed.data.invite_code,
  });

  if (error) {
    if (error.message.includes("INVITE_CODE_NOT_FOUND")) {
      return apiError(
        "NOT_FOUND",
        "Kode undangan workspace tidak ditemukan.",
        404
      );
    }
    if (error.message.includes("UNAUTHORIZED")) {
      return apiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
    }
    return apiError(
      "INTERNAL_ERROR",
      "Gagal bergabung ke workspace melalui kode undangan.",
      500
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return apiError(
      "NOT_FOUND",
      "Kode undangan workspace tidak ditemukan.",
      404
    );
  }

  return apiSuccess({
    workspace_id: row.workspace_id,
    role: row.role,
  });
}
