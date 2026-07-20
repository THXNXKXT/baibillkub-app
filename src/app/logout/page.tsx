"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-actions";

// ponytail: server action redirect ไม่ทำงานใน form action — เรียกเองที่นี่ แล้ว push เอง
export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("baibillkub-data");
    signOut().finally(() => router.replace("/login"));
  }, [router]);
  return null;
}
