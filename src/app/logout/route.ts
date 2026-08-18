import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ponytail: route handler ไม่ใช่ page — signOut + redirect ฝั่ง server ล้วน
// Set-Cookie (ล้าง session) ติด response กลับไป browser พร้อม 302 → ไม่มี loop
export async function GET(request: Request) {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {}
  const res = NextResponse.redirect(new URL("/login", request.url));
  // belt-and-suspenders: ล้าง cookie เองด้วย (Next อาจไม่ propagate จาก auth.api)
  for (const cookieName of [
    "better-auth.session_token",
    "better-auth.session_data",
    "__Secure-better-auth.session_token",
    "__Secure-better-auth.session_data",
  ]) {
    res.cookies.set(cookieName, "", {
      maxAge: 0,
      path: "/",
      secure: cookieName.startsWith("__Secure-"),
    });
  }
  return res;
}
