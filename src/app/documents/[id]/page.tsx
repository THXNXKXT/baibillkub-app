import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocument, confirmPayment, convertDocument, deleteDocument, sendDocument } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DocPDFButton from "@/components/doc-pdf";

const TYPE_LABEL: Record<string, string> = { quotation: "ใบเสนอราคา", invoice: "ใบแจ้งหนี้", receipt: "ใบเสร็จรับเงิน", delivery_note: "ใบส่งของ" };
const fmt = (n: string | number) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

export default async function DocDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDocument(id);
  if (!data) notFound();
  const { doc, customer: cust, items } = data;
  const session = await auth.api.getSession({ headers: await headers() });
  const owner = session?.user ?? null;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{TYPE_LABEL[doc.type]} {doc.number}</h1>
        <Link href={`/b/${doc.publicToken}`} target="_blank" className="text-sm text-emerald-600 hover:underline">ลิงก์สาธารณะ ↗</Link>
        <DocPDFButton doc={doc} cust={cust} owner={owner as never} items={items} />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 px-4 py-3 text-sm space-y-2">
        <p>ลูกค้า: {cust?.name}</p>
        <p className="text-[#6e6e73]">สถานะ: {doc.status} · ยอด {fmt(doc.total)} บาท</p>
        {items.map((i) => (
          <p key={i.id} className="text-[#6e6e73]">— {i.description} ×{Number(i.qty)} · {fmt(i.unitPrice)}</p>
        ))}
        {doc.slipImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.slipImage} alt="สลิป" className="w-40 rounded-lg border border-neutral-200" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {doc.type === "invoice" && doc.status === "sent" && (
          <form action={confirmPayment.bind(null, doc.id)}>
            <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 font-medium">ยืนยันชำระ (ออกใบเสร็จ)</button>
          </form>
        )}
        {doc.type === "invoice" && doc.status !== "paid" && doc.paymentMethod === "cash" && (
          <form action={confirmPayment.bind(null, doc.id)}>
            <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 font-medium">รับเงินสดแล้ว</button>
          </form>
        )}
        {doc.type === "quotation" && doc.status === "accepted" && (
          <form action={convertDocument.bind(null, doc.id, "invoice")}>
            <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 font-medium">แปลงเป็นใบแจ้งหนี้</button>
          </form>
        )}
        {doc.type === "invoice" && (
          <form action={convertDocument.bind(null, doc.id, "delivery_note")}>
            <button className="rounded-lg border border-neutral-200 px-4 py-2 text-[#6e6e73]">ออกใบส่งของ</button>
          </form>
        )}
        {doc.status === "draft" && (
          <>
            <form action={sendDocument.bind(null, doc.id)}>
              <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 font-medium">ส่ง</button>
            </form>
            <form action={deleteDocument.bind(null, doc.id)}>
              <button className="rounded-lg border border-red-200 text-red-500 px-4 py-2">ลบ</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
