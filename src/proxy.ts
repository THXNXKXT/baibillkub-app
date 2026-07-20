import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = ["/dashboard", "/documents", "/customers", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ponytail: ไม่ redirect /login → /dashboard ที่ proxy เด็ดขาด
  // เหตุผล: หลัง signOut cookie อาจยังค้างใน browser แว็ปนึง
  // → proxy เห็น cookie เก่า → redirect กลับ dashboard → loop
  // ให้ login page ตัดสินใจเองฝั่ง client แทน

  if (!protectedPrefixes.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/documents/:path*", "/customers/:path*", "/settings/:path*"],
};
