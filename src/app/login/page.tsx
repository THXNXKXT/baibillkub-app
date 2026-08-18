"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Mascot from "@/components/mascot";
import { signIn, signUp } from "@/lib/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      email: form.get("email"),
      password: form.get("password"),
      ...(mode === "signup" ? { name: form.get("name") } : {}),
    };
    // ponytail: raw fetch — client SDK มีปัญหา cross-origin/port
    const result = mode === "login"
      ? await signIn(String(body.email), String(body.password))
      : await signUp(String(body.name), String(body.email), String(body.password));
    setLoading(false);
    if (!result.ok) {
      setError(result.message ?? "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    // Confirm the session cookie is usable before entering the protected app.
    const sessionRes = await fetch("/api/auth/get-session", {
      credentials: "include",
      cache: "no-store",
    });
    const sessionData = await sessionRes.json().catch(() => null);
    if (!sessionRes.ok || !sessionData?.user) {
      setError("เข้าสู่ระบบสำเร็จแต่สร้าง session ไม่ได้ กรุณาตรวจค่า BETTER_AUTH_SECRET และ BETTER_AUTH_URL");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-4">
      <div className="w-full max-w-sm text-center">
        <Mascot className="w-16 h-16 mx-auto" />
        <h1 className="text-[22px] font-bold mt-3">baibillkub</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6">
          {mode === "login" ? "เข้าสู่ระบบเพื่อจัดการเอกสาร" : "สมัครสมาชิกฟรี"}
        </p>
        <form onSubmit={onSubmit} className="space-y-3 text-left">
          {mode === "signup" && (
            <input name="name" required placeholder="ชื่อ" className="field w-full px-3 py-2.5 text-[13px]" />
          )}
          <input name="email" type="email" required placeholder="อีเมล" className="field w-full px-3 py-2.5 text-[13px]" />
          <input name="password" type="password" required minLength={8} placeholder="รหัสผ่าน (8+ ตัว)" className="field w-full px-3 py-2.5 text-[13px]" />
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <button disabled={loading} className="btn-accent w-full py-2.5 text-[13px] font-medium disabled:opacity-50">
            {loading ? "กำลังโหลด…" : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 text-[12px] text-[var(--color-muted)] hover:text-[var(--color-accent-ink)] transition-colors">
          {mode === "login" ? "ยังไม่มีบัญชี? สมัครเลย" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
        </button>
      </div>
    </div>
  );
}
