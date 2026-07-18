"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Mascot from "@/components/mascot";

const NAV = [
  { href: "/dashboard", label: "ภาพรวม" },
  { href: "/documents", label: "เอกสาร" },
  { href: "/customers", label: "ลูกค้า" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 bg-[var(--color-paper)]/90 backdrop-blur border-b border-[var(--color-rule)]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-[var(--color-accent-ink)]">
            <Mascot className="w-7 h-7" />
            baibillkub
          </Link>
          <div className="flex gap-1 text-[13px]">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 ${path.startsWith(n.href) ? "chip-active" : "chip"}`}
              >
                {n.label}
              </Link>
            ))}
          </div>
          <Link href="/documents/new" className="ml-auto btn-accent px-4 py-1.5 text-[13px] font-medium whitespace-nowrap">
            + สร้างเอกสาร
          </Link>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
