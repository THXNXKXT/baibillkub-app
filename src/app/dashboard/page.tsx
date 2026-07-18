import Link from "next/link";
import { db } from "@/db";
import { document } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

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

  const card = "bg-white rounded-xl border border-neutral-200 p-5";
  const num = "text-2xl font-bold";
  const label = "text-xs text-[#6e6e73] mt-1";

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">สวัสดี, {s!.user.name}</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className={card}>
          <p className={`${num} text-amber-500`}>{Number(stats.pending).toLocaleString()}</p>
          <p className={label}>ค้างชำระ ({stats.pendingCount} ฉบับ)</p>
        </div>
        <div className={card}>
          <p className={`${num} text-red-500`}>{Number(stats.overdue).toLocaleString()}</p>
          <p className={label}>เกินกำหนด</p>
        </div>
        <div className={card}>
          <p className={`${num} text-emerald-500`}>{Number(stats.paidMonth).toLocaleString()}</p>
          <p className={label}>เก็บแล้วเดือนนี้</p>
        </div>
      </div>
      <div className="flex gap-2 text-sm">
        <Link href="/documents/new" className="rounded-lg bg-emerald-500 text-white px-4 py-2 font-medium">+ สร้างเอกสาร</Link>
        <Link href="/documents" className="rounded-lg border border-neutral-200 px-4 py-2 text-[#6e6e73]">เอกสารทั้งหมด</Link>
        <Link href="/customers" className="rounded-lg border border-neutral-200 px-4 py-2 text-[#6e6e73]">ลูกค้า</Link>
      </div>
    </div>
  );
}
