import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL("/auth/login?confirm_error=true", request.url)
    );
  }

  const supabase = await createClient();
  let verified = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  } else if (
    tokenHash &&
    typeParam &&
    ALLOWED_OTP_TYPES.has(typeParam as EmailOtpType)
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeParam as EmailOtpType,
    });
    verified = !error;
  }

  if (!verified) {
    return NextResponse.redirect(
      new URL("/auth/login?confirm_error=true", request.url)
    );
  }

  // Akhiri sesi sementara agar pengguna diarahkan langsung ke halaman login untuk masuk manual.
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL("/auth/login?confirmed=true", request.url)
  );
}
