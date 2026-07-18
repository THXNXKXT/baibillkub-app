"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/documents", label: "เอกสาร", icon: FileText },
  { href: "/customers", label: "ลูกค้า", icon: Users },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen flex">
      {/* side rail */}
      <aside className="hidden sm:flex w-56 shrink-0 flex-col border-r border-[var(--color-rule)] bg-[var(--color-surface)] px-3 py-5">
        <Link href="/dashboard" className="px-3 text-[15px] font-bold text-[var(--color-accent-ink)] tracking-[-0.01em]">
          baibillkub
        </Link>
        <nav className="mt-6 flex flex-col gap-0.5">
          {NAV.map((n) => {
            const active = path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  active ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] font-semibold" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <n.icon className="w-4 h-4" strokeWidth={active ? 2.4 : 2} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/documents/new" className="btn-accent mt-auto px-4 py-2 text-[13px] font-medium text-center">
          + สร้างเอกสาร
        </Link>
      </aside>

      {/* bottom tab — mobile */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur border-t border-[var(--color-rule)]">
        <div className="flex items-center justify-around h-16">
          {NAV.map((n) => {
            const active = path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-1 px-3 py-2 ${active ? "text-[var(--color-accent-ink)]" : "text-[var(--color-muted)]"}`}>
                <n.icon className="w-5 h-5" />
                <span className="text-[10px]">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 min-w-0 px-5 sm:px-8 py-6 pb-24 sm:pb-6 max-w-5xl">{children}</main>
    </div>
  );
}
