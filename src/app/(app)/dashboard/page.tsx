import Link from "next/link";
import { db } from "@/db";
import { document, customer } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql, desc } from "drizzle-orm";

export default async function DashboardPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  const userId = s!.user.id;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [stats] = await db
    .select({
      pending: sql<number>`coalesce(sum(case when ${document.status} = 'sent' and ${document.type} = 'invoice' then ${document.total}::numeric end), 0)`,
      overdue: sql<number>`coalesce(sum(case when ${document.status} = 'sent' and ${document.type} = 'invoice' and ${document.dueDate} < now() then ${document.total}::numeric end), 0)`,
      paidMonth: sql<number>`coalesce(sum(case when ${document.status} = 'paid' and ${document.confirmedAt} >= ${monthStart} then ${document.total}::numeric end), 0)`,
      pendingCount: sql<number>`count(*) filter (where ${document.status} = 'sent' and ${document.type} = 'invoice')`,
    })
    .from(document)
    .where(eq(document.userId, userId));

  const recent = await db
    .select({ doc: document, customerName: customer.name })
    .from(document)
    .leftJoin(customer, eq(document.customerId, customer.id))
    .where(eq(document.userId, userId))
    .orderBy(desc(document.createdAt))
    .limit(5);

  const TYPE_LABEL: Record<string, string> = { quotation: "เสนอราคา", invoice: "แจ้งหนี้", receipt: "เสร็จ", delivery_note: "ส่งของ" };

  const cards = [
    { label: "ค้างชำระ", value: Number(stats.pending), sub: `${stats.pendingCount} ฉบับ`, cls: "text-amber-500" },
    { label: "เกินกำหนด", value: Number(stats.overdue), sub: "ต้องตาม", cls: "text-red-500" },
    { label: "เก็บแล้วเดือนนี้", value: Number(stats.paidMonth), sub: "บาท", cls: "text-[var(--color-accent-ink)]" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-[17px] font-semibold">สวัสดี, {s!.user.name}</h1>

      {/* KPI — ตัวเลขคือฮีโร่ ไม่มีไอคอน */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card px-4 pt-4 pb-5">
            <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-[0.08em]">{c.label}</p>
            <p className={`text-[24px] font-semibold tracking-[-0.03em] leading-none mt-2 tabular-nums ${c.cls}`}>
              {c.value.toLocaleString()}
            </p>
            <p className="text-[10px] text-[var(--color-muted)] mt-1.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 text-[13px]">
        <Link href="/documents" className="btn-ghost px-4 py-2">เอกสารทั้งหมด</Link>
        <Link href="/customers" className="btn-ghost px-4 py-2">ลูกค้า</Link>
      </div>

      {recent.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[13px] font-semibold">ล่าสุด</h2>
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
        </div>
      )}
    </div>
  );
}
