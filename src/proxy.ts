import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = ["/dashboard", "/documents", "/customers", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // login แล้วแต่เข้าหน้า login → กลับ dashboard
  if (pathname === "/login") {
    const sessionCookie = getSessionCookie(request);
    if (sessionCookie) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

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
  matcher: ["/login", "/dashboard/:path*", "/documents/:path*", "/customers/:path*", "/settings/:path*"],
};
