import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocument, confirmPayment } from "@/lib/actions";
import PrintButton from "./print-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import DocPDFButton from "@/components/doc-pdf";
import BillLayout from "@/components/bill-layout";
import { ExternalLink } from "lucide-react";

const TYPE_LABEL: Record<string, string> = { quotation: "ใบเสนอราคา", invoice: "ใบแจ้งหนี้", receipt: "ใบเสร็จรับเงิน", delivery_note: "ใบส่งของ" };
const STATUS_LABEL: Record<string, string> = { draft: "ร่าง", sent: "รอชำระ", paid: "ชำระแล้ว", accepted: "ตกลง", rejected: "ไม่ตกลง", cancelled: "ยกเลิก" };

export default async function DocDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDocument(id);
  if (!data) notFound();
  const { doc, customer: cust, items } = data;
  const session = await auth.api.getSession({ headers: await headers() });
  const [owner] = await db.select().from(user).where(eq(user.id, session!.user.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 no-print">
        <div>
          <h1 className="text-[17px] font-semibold">{TYPE_LABEL[doc.type]} {doc.number}</h1>
          <p className="text-[11px] text-[var(--color-muted)]">{STATUS_LABEL[doc.status]} · {cust?.name}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Link href={`/b/${doc.publicToken}`} target="_blank" className="btn-ghost px-3 py-1.5 text-[11px] flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" /> ลิงก์
          </Link>
          <DocPDFButton doc={doc} cust={cust} owner={owner as never} items={items} />
          <PrintButton />
        </div>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <BillLayout doc={doc} cust={cust} owner={owner as never} items={items} />
      </div>
      {doc.paidReportedAt && (
        <div className="card px-4 py-3 border-l-4 border-l-amber-400 no-print">
          <p className="text-[13px] font-semibold text-amber-600">ลูกค้าแจ้งชำระแล้ว</p>
          {doc.slipImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doc.slipImage} alt="สลิป" className="w-40 rounded-lg border border-[var(--color-rule)] no-print mt-2" />
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-[13px] no-print">
        {doc.type === "invoice" && doc.status === "sent" && (
          <form action={confirmPayment.bind(null, doc.id)}>
            <button className="btn-accent px-4 py-2 font-medium">ยืนยันชำระ (ออกใบเสร็จ)</button>
          </form>
        )}
      </div>
    </div>
  );
}
