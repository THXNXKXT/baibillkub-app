"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
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
    const res = await fetch(`/api/auth/${mode === "login" ? "sign-in/email" : "sign-up/email"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-emerald-500 mb-1">baibillkub</h1>
        <p className="text-sm text-[#6e6e73] mb-6">
          {mode === "login" ? "เข้าสู่ระบบเพื่อจัดการเอกสาร" : "สมัครสมาชิกฟรี"}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <input name="name" required placeholder="ชื่อ" className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
          )}
          <input name="email" type="email" required placeholder="อีเมล" className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
          <input name="password" type="password" required minLength={8} placeholder="รหัสผ่าน (8+ ตัว)" className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-emerald-500 text-white py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
            {loading ? "กำลังโหลด..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 w-full text-center text-sm text-[#6e6e73] hover:text-emerald-500">
          {mode === "login" ? "ยังไม่มีบัญชี? สมัครเลย" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
        </button>
      </div>
    </div>
  );
}
