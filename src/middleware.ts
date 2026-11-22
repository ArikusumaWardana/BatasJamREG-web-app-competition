import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const isAuthRoute =
    pathname === "/auth/login" || pathname === "/auth/register";

  if (isAuthRoute && user) {
    const requestedNext = request.nextUrl.searchParams.get("next");
    const safeNext =
      requestedNext &&
      requestedNext.startsWith("/") &&
      !requestedNext.startsWith("//") &&
      !requestedNext.startsWith("/auth")
        ? requestedNext
        : "/workspace";
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  if (pathname.startsWith("/workspace") && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    const nextPath = `${pathname}${search}`;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|demo/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
