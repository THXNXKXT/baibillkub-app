"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function signIn(email: string, password: string) {
  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ" };
  }
}

export async function signUp(name: string, email: string, password: string) {
  try {
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "สมัครสมาชิกไม่สำเร็จ" };
  }
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
}
