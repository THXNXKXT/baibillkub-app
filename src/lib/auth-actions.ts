"use server";

import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { parseSetCookieHeader, splitSetCookieHeader, toCookieOptions } from "better-auth/cookies";

type AuthResponse = {
  user?: unknown;
  message?: string;
};

/**
 * Direct Better Auth API calls return Set-Cookie headers, but a Server Action
 * must copy those headers into Next's cookie store for the browser to receive
 * them. The nextCookies plugin does this too; keeping this explicit copy here
 * makes the login contract observable and protects against framework changes.
 */
async function persistAuthCookies(response: Response) {
  const responseHeaders = response.headers as Headers & { getSetCookie?: () => string[] };
  const setCookies = responseHeaders.getSetCookie?.() ?? [];
  if (setCookies.length === 0) {
    setCookies.push(...splitSetCookieHeader(response.headers.get("set-cookie") ?? ""));
  }
  if (setCookies.length === 0) return false;

  const cookieStore = await cookies();
  let hasSessionCookie = false;
  for (const setCookie of setCookies) {
    for (const [name, attributes] of parseSetCookieHeader(setCookie)) {
      if (name === "better-auth.session_token" || name === "__Secure-better-auth.session_token") {
        hasSessionCookie = true;
      }
      cookieStore.set(name, attributes.value, toCookieOptions(attributes));
    }
  }
  return hasSessionCookie;
}

export async function signIn(email: string, password: string) {
  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      asResponse: true,
    });
    const result = await response.json().catch(() => ({})) as AuthResponse;
    if (!response.ok) return { ok: false, message: result.message ?? "เข้าสู่ระบบไม่สำเร็จ" };
    if (!result.user || !(await persistAuthCookies(response))) {
      return { ok: false, message: "เข้าสู่ระบบสำเร็จแต่เซิร์ฟเวอร์ไม่ส่ง session cookie" };
    }
    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ" };
  }
}

export async function signUp(name: string, email: string, password: string) {
  try {
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
      asResponse: true,
    });
    const result = await response.json().catch(() => ({})) as AuthResponse;
    if (!response.ok) return { ok: false, message: result.message ?? "สมัครสมาชิกไม่สำเร็จ" };
    if (!result.user || !(await persistAuthCookies(response))) {
      return { ok: false, message: "สมัครสมาชิกสำเร็จแต่เซิร์ฟเวอร์ไม่ส่ง session cookie" };
    }
    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "สมัครสมาชิกไม่สำเร็จ" };
  }
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
}
