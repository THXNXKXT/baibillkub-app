import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocument, confirmPayment, convertDocument, deleteDocument, sendDocument } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DocPDFButton from "@/components/doc-pdf";

const TYPE_LABEL: Record<string, string> = { quotation: "ใบเสนอราคา", invoice: "ใบแจ้งหนี้", receipt: "ใบเสร็จรับเงิน", delivery_note: "ใบส่งของ" };
const STATUS_LABEL: Record<string, string> = { draft: "ร่าง", sent: "รอชำระ", paid: "ชำระแล้ว", accepted: "ตกลง", rejected: "ไม่ตกลง", cancelled: "ยกเลิก" };
const fmt = (n: string | number) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

export default async function DocDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDocument(id);
  if (!data) notFound();
  const { doc, customer: cust, items } = data;
  const session = await auth.api.getSession({ headers: await headers() });
  const owner = session?.user ?? null;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[17px] font-semibold">{TYPE_LABEL[doc.type]} {doc.number}</h1>
          <p className="text-[11px] text-[var(--color-muted)]">{STATUS_LABEL[doc.status]} · {cust?.name}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Link href={`/b/${doc.publicToken}`} target="_blank" className="btn-ghost px-3 py-1.5 text-[11px]">ลิงก์ ↗</Link>
          <DocPDFButton doc={doc} cust={cust} owner={owner as never} items={items} />
        </div>
      </div>

      <div className="card px-4 pt-4 pb-5 text-[13px] space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex justify-between">
            <span>{i.description} <span className="text-[var(--color-muted)]">×{Number(i.qty)}</span></span>
            <span className="tabular-nums">{fmt(i.unitPrice)}</span>
          </div>
        ))}
        <div className="border-t border-[var(--color-rule)] pt-2 text-right space-y-0.5">
          {Number(doc.tax) > 0 && <p className="text-[var(--color-muted)] tabular-nums">ภาษี {fmt(doc.tax)}</p>}
          <p className="text-[17px] font-semibold text-[var(--color-accent-ink)] tabular-nums">{fmt(doc.total)} ฿</p>
        </div>
        {doc.notes && <p className="text-[11px] text-[var(--color-muted)] border-t border-[var(--color-rule)] pt-2">{doc.notes}</p>}
        {doc.slipImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.slipImage} alt="สลิป" className="w-40 rounded-lg border border-[var(--color-rule)]" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-[13px]">
        {doc.type === "invoice" && doc.status === "sent" && (
          <form action={confirmPayment.bind(null, doc.id)}>
            <button className="btn-accent px-4 py-2 font-medium">ยืนยันชำระ (ออกใบเสร็จ)</button>
          </form>
        )}
        {doc.type === "invoice" && doc.status !== "paid" && doc.paymentMethod === "cash" && doc.status !== "sent" && (
          <form action={confirmPayment.bind(null, doc.id)}>
            <button className="btn-accent px-4 py-2 font-medium">รับเงินสดแล้ว</button>
          </form>
        )}
        {doc.type === "quotation" && doc.status === "accepted" && (
          <form action={convertDocument.bind(null, doc.id, "invoice")}>
            <button className="btn-accent px-4 py-2 font-medium">แปลงเป็นใบแจ้งหนี้</button>
          </form>
        )}
        {doc.type === "invoice" && (
          <form action={convertDocument.bind(null, doc.id, "delivery_note")}>
            <button className="btn-ghost px-4 py-2">ออกใบส่งของ</button>
          </form>
        )}
        {doc.status === "draft" && (
          <>
            <form action={sendDocument.bind(null, doc.id)}>
              <button className="btn-accent px-4 py-2 font-medium">ส่ง</button>
            </form>
            <form action={deleteDocument.bind(null, doc.id)}>
              <button className="btn-ghost px-4 py-2 text-red-500 border-red-200">ลบ</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
