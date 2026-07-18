"use client";

import Link from "next/link";
import { useAppData } from "@/components/data-provider";
import { FilePlus2, Users, ArrowRight } from "lucide-react";
import Mascot from "@/components/mascot";

const TYPE_LABEL: Record<string, string> = { quotation: "เสนอราคา", invoice: "แจ้งหนี้", receipt: "เสร็จ", delivery_note: "ส่งของ" };

export default function DashboardPage() {
  const { documents, loading } = useAppData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 rounded bg-[var(--color-rule)]" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="card px-4 pt-4 pb-5 space-y-2"><div className="h-2.5 w-16 rounded bg-[var(--color-rule)]" /><div className="h-7 w-24 rounded bg-[var(--color-rule)]" /></div>)}
        </div>
      </div>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const invoices = documents.filter((d) => d.doc.type === "invoice");
  const pending = invoices.filter((d) => d.doc.status === "sent");
  const overdue = pending.filter((d) => d.doc.dueDate && new Date(d.doc.dueDate) < now);
  const paidMonth = documents.filter((d) => d.doc.status === "paid" && d.doc.confirmedAt && new Date(d.doc.confirmedAt) >= monthStart);
  const sum = (arr: typeof documents) => arr.reduce((s, d) => s + Number(d.doc.total), 0);

  const cards = [
    { label: "ค้างชำระ", value: sum(pending), sub: `${pending.length} ฉบับ`, cls: "text-amber-500", dot: "bg-amber-400" },
    { label: "เกินกำหนด", value: sum(overdue), sub: "ต้องตาม", cls: "text-red-500", dot: "bg-red-400" },
    { label: "เก็บแล้วเดือนนี้", value: sum(paidMonth), sub: "บาท", cls: "text-[var(--color-accent-ink)]", dot: "bg-[var(--color-accent)]" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Mascot className="w-14 h-14 shrink-0" />
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.01em]">ภาพรวม</h1>
          <p className="text-[13px] text-[var(--color-muted)]">
            {pending.length > 0 ? `มี ${pending.length} บิลรอเก็บเงินอยู่` : "ไม่มีบิลค้าง เก่งมาก"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card card-hover px-4 pt-4 pb-5">
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.08em]">
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              {c.label}
            </p>
            <p className={`text-[24px] font-semibold tracking-[-0.03em] leading-none mt-2 tabular-nums ${c.cls}`}>
              {c.value.toLocaleString()}
            </p>
            <p className="text-[10px] text-[var(--color-muted)] mt-1.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="card px-4 py-3 border-l-4 border-l-red-400 space-y-1">
          <p className="text-[13px] font-semibold text-red-500">เกินกำหนดชำระ</p>
          {overdue.slice(0, 3).map(({ doc, customerName }) => (
            <Link key={doc.id} href={`/documents/${doc.id}`} className="flex justify-between text-[12px] hover:text-[var(--color-accent-ink)]">
              <span>{doc.number} · {customerName}</span>
              <span className="tabular-nums text-[var(--color-muted)]">{Number(doc.total).toLocaleString()} ฿</span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-2 text-[13px]">
        <Link href="/documents/new" className="btn-accent px-4 py-2 font-medium flex items-center gap-1.5">
          <FilePlus2 className="w-4 h-4" /> สร้างเอกสาร
        </Link>
        <Link href="/customers" className="btn-ghost px-4 py-2 flex items-center gap-1.5">
          <Users className="w-4 h-4" /> ลูกค้า
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">ล่าสุด</h2>
          <Link href="/documents" className="text-[12px] text-[var(--color-accent-ink)] flex items-center gap-1 hover:underline">
            ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {documents.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <Mascot className="w-16 h-16 mx-auto opacity-60" />
            <p className="text-[13px] text-[var(--color-muted)] mt-3">ยังไม่มีเอกสาร — สร้างฉบับแรกเลย</p>
          </div>
        ) : (
          <ul className="card divide-y divide-[var(--color-rule)]">
            {documents.slice(0, 5).map(({ doc, customerName }) => (
              <li key={doc.id}>
                <Link href={`/documents/${doc.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-paper-2)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{doc.number} · {customerName}</p>
                    <p className="text-[11px] text-[var(--color-muted)]">{TYPE_LABEL[doc.type]}</p>
                  </div>
                  <p className="text-[13px] font-semibold tabular-nums">{Number(doc.total).toLocaleString()} ฿</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
