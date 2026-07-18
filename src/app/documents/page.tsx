import Link from "next/link";
import { listDocuments } from "@/lib/actions";

const TYPE_LABEL: Record<string, string> = {
  quotation: "เสนอราคา",
  invoice: "แจ้งหนี้",
  receipt: "เสร็จ",
  delivery_note: "ส่งของ",
};
const STATUS_STYLE: Record<string, string> = {
  draft: "bg-neutral-100 text-[#6e6e73]",
  sent: "bg-amber-100 text-amber-600",
  paid: "bg-emerald-100 text-emerald-600",
  accepted: "bg-emerald-100 text-emerald-600",
  rejected: "bg-red-100 text-red-500",
  cancelled: "bg-neutral-100 text-[#6e6e73]",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "ร่าง", sent: "รอชำระ", paid: "ชำระแล้ว", accepted: "ตกลง", rejected: "ไม่ตกลง", cancelled: "ยกเลิก",
};

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const docs = await listDocuments(type);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">เอกสาร</h1>
        <Link href="/documents/new" className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600">
          + สร้างเอกสาร
        </Link>
      </div>
      <div className="flex gap-2 mb-4 text-sm">
        <Link href="/documents" className={!type ? "font-bold text-emerald-600" : "text-[#6e6e73]"}>ทั้งหมด</Link>
        {Object.entries(TYPE_LABEL).map(([v, l]) => (
          <Link key={v} href={`/documents?type=${v}`} className={type === v ? "font-bold text-emerald-600" : "text-[#6e6e73]"}>{l}</Link>
        ))}
      </div>
      {docs.length === 0 ? (
        <p className="text-sm text-[#6e6e73]">ยังไม่มีเอกสาร</p>
      ) : (
        <ul className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {docs.map(({ doc, customerName }) => (
            <li key={doc.id} className="flex items-center px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{doc.number} · {customerName}</p>
                <p className="text-xs text-[#6e6e73]">{TYPE_LABEL[doc.type]} · {Number(doc.total).toLocaleString()} บาท</p>
              </div>
              <span className={`text-xs rounded-full px-2 py-0.5 ${STATUS_STYLE[doc.status]}`}>{STATUS_LABEL[doc.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
