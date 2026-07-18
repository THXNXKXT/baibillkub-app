import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = ["/dashboard", "/documents", "/customers", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedPrefixes.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // ponytail: cookie check only — full session validation happens server-side in pages/actions
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/documents/:path*", "/customers/:path*", "/settings/:path*"],
};
