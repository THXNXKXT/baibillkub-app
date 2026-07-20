import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// ponytail: route handler ไม่ใช่ page — signOut + redirect ฝั่ง server ล้วน
// Set-Cookie (ล้าง session) ติด response กลับไป browser พร้อม 302 → ไม่มี loop
export async function GET() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {}
  const res = NextResponse.redirect(new URL("/login", process.env.BETTER_AUTH_URL ?? "http://localhost:3000"));
  // belt-and-suspenders: ล้าง cookie เองด้วย (Next อาจไม่ propagate จาก auth.api)
  res.cookies.delete("better-auth.session_token");
  res.cookies.delete("better-auth.session_data");
  return res;
}
