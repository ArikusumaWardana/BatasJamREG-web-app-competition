import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export function apiSuccess<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>
) {
  return NextResponse.json(
    meta ? { success: true, data, meta } : { success: true, data },
    { status }
  );
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      error: details ? { code, message, details } : { code, message },
    },
    { status }
  );
}

export function formatZodIssues(error: ZodError): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(issue.message);
  }
  return grouped;
}

export async function parseJsonBody(
  request: Request
): Promise<
  { ok: true; data: unknown } | { ok: false; response: NextResponse }
> {
  try {
    const data: unknown = await request.json();
    return { ok: true, data };
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
