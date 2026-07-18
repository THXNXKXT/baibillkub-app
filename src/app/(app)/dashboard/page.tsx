import Link from "next/link";
import { db } from "@/db";
import { document, customer } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql, desc, and } from "drizzle-orm";
import Mascot from "@/components/mascot";
import { FilePlus2, Users, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  const userId = s!.user.id;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [stats, recent, overdue] = await Promise.all([
    db
      .select({
        pending: sql<number>`coalesce(sum(case when ${document.status} = 'sent' and ${document.type} = 'invoice' then ${document.total}::numeric end), 0)`,
        overdue: sql<number>`coalesce(sum(case when ${document.status} = 'sent' and ${document.type} = 'invoice' and ${document.dueDate} < now() then ${document.total}::numeric end), 0)`,
        paidMonth: sql<number>`coalesce(sum(case when ${document.status} = 'paid' and ${document.confirmedAt} >= ${monthStart} then ${document.total}::numeric end), 0)`,
        pendingCount: sql<number>`count(*) filter (where ${document.status} = 'sent' and ${document.type} = 'invoice')`,
      })
      .from(document)
      .where(eq(document.userId, userId))
      .then((r) => r[0]),
    db
      .select({ doc: document, customerName: customer.name })
      .from(document)
      .leftJoin(customer, eq(document.customerId, customer.id))
      .where(eq(document.userId, userId))
      .orderBy(desc(document.createdAt))
      .limit(5),
    db
      .select({ doc: document, customerName: customer.name })
      .from(document)
      .leftJoin(customer, eq(document.customerId, customer.id))
      .where(and(eq(document.userId, userId), eq(document.status, "sent"), eq(document.type, "invoice"), sql`${document.dueDate} < now()`))
      .orderBy(document.dueDate)
      .limit(3),
  ]);

  const TYPE_LABEL: Record<string, string> = { quotation: "เสนอราคา", invoice: "แจ้งหนี้", receipt: "เสร็จ", delivery_note: "ส่งของ" };
  const cards = [
    { label: "ค้างชำระ", value: Number(stats.pending), sub: `${stats.pendingCount} ฉบับ`, cls: "text-amber-500", dot: "bg-amber-400" },
    { label: "เกินกำหนด", value: Number(stats.overdue), sub: "ต้องตาม", cls: "text-red-500", dot: "bg-red-400" },
    { label: "เก็บแล้วเดือนนี้", value: Number(stats.paidMonth), sub: "บาท", cls: "text-[var(--color-accent-ink)]", dot: "bg-[var(--color-accent)]" },
  ];

  return (
    <div className="space-y-8">
      {/* greeting + mascot */}
      <div className="flex items-center gap-4">
        <Mascot className="w-14 h-14 shrink-0" />
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.01em]">สวัสดี, {s!.user.name}</h1>
          <p className="text-[13px] text-[var(--color-muted)]">
            {stats.pendingCount > 0 ? `มี ${stats.pendingCount} บิลรอเก็บเงินอยู่` : "ไม่มีบิลค้าง เก่งมาก"}
          </p>
        </div>
      </div>

      {/* KPI — การ์ดนุ่มๆ มินต์ */}
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

      {/* overdue nudge */}
      {overdue.length > 0 && (
        <div className="card px-4 py-3 border-l-4 border-l-red-400 space-y-1">
          <p className="text-[13px] font-semibold text-red-500">เกินกำหนดชำระ</p>
          {overdue.map(({ doc, customerName }) => (
            <Link key={doc.id} href={`/documents/${doc.id}`} className="flex justify-between text-[12px] hover:text-[var(--color-accent-ink)]">
              <span>{doc.number} · {customerName}</span>
              <span className="tabular-nums text-[var(--color-muted)]">{Number(doc.total).toLocaleString()} ฿</span>
            </Link>
          ))}
        </div>
      )}

      {/* quick actions */}
      <div className="flex gap-2 text-[13px]">
        <Link href="/documents/new" className="btn-accent px-4 py-2 font-medium flex items-center gap-1.5">
          <FilePlus2 className="w-4 h-4" /> สร้างเอกสาร
        </Link>
        <Link href="/customers" className="btn-ghost px-4 py-2 flex items-center gap-1.5">
          <Users className="w-4 h-4" /> ลูกค้า
        </Link>
      </div>

      {/* recent */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">ล่าสุด</h2>
          <Link href="/documents" className="text-[12px] text-[var(--color-accent-ink)] flex items-center gap-1 hover:underline">
            ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <Mascot className="w-16 h-16 mx-auto opacity-60" />
            <p className="text-[13px] text-[var(--color-muted)] mt-3">ยังไม่มีเอกสาร — สร้างฉบับแรกเลย</p>
          </div>
        ) : (
          <ul className="card divide-y divide-[var(--color-rule)]">
            {recent.map(({ doc, customerName }) => (
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
