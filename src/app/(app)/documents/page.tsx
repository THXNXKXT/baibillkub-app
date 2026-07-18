"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppData } from "@/components/data-provider";
import { FilePlus2 } from "lucide-react";
import Mascot from "@/components/mascot";
import { Suspense } from "react";

const TYPE_LABEL: Record<string, string> = { quotation: "เสนอราคา", invoice: "แจ้งหนี้", receipt: "เสร็จ", delivery_note: "ส่งของ" };
const STATUS_DOT: Record<string, string> = {
  draft: "bg-neutral-300", sent: "bg-amber-400", paid: "bg-[var(--color-accent)]",
  accepted: "bg-[var(--color-accent)]", rejected: "bg-red-400", cancelled: "bg-neutral-300",
};
const STATUS_LABEL: Record<string, string> = { draft: "ร่าง", sent: "รอชำระ", paid: "ชำระแล้ว", accepted: "ตกลง", rejected: "ไม่ตกลง", cancelled: "ยกเลิก" };

function List() {
  const type = useSearchParams().get("type") ?? undefined;
  const { documents, loading } = useAppData();
  const docs = type ? documents.filter((d) => d.doc.type === type) : documents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold">เอกสาร</h1>
        <Link href="/documents/new" className="btn-accent px-4 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
          <FilePlus2 className="w-4 h-4" /> สร้าง
        </Link>
      </div>

      <div className="flex gap-1 text-[13px] overflow-x-auto">
        <Link href="/documents" className={`px-3 py-1.5 whitespace-nowrap ${!type ? "chip-active" : "chip"}`}>ทั้งหมด</Link>
        {Object.entries(TYPE_LABEL).map(([v, l]) => (
          <Link key={v} href={`/documents?type=${v}`} className={`px-3 py-1.5 whitespace-nowrap ${type === v ? "chip-active" : "chip"}`}>{l}</Link>
        ))}
      </div>

      {loading ? (
        <div className="card divide-y divide-[var(--color-rule)]">
          {[0, 1, 2].map((i) => <div key={i} className="px-4 py-3"><div className="h-3 w-40 rounded bg-[var(--color-rule)]" /></div>)}
        </div>
      ) : docs.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <Mascot className="w-16 h-16 mx-auto opacity-60" />
          <p className="text-[13px] text-[var(--color-muted)] mt-3">ยังไม่มีเอกสาร — สร้างฉบับแรกเลย</p>
        </div>
      ) : (
        <ul className="card divide-y divide-[var(--color-rule)]">
          {docs.map(({ doc, customerName }) => (
            <li key={doc.id}>
              <Link href={`/documents/${doc.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-paper-2)] transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[doc.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{doc.number} · {customerName}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">{TYPE_LABEL[doc.type]} · {STATUS_LABEL[doc.status]}</p>
                </div>
                <p className="text-[13px] font-semibold tabular-nums">{Number(doc.total).toLocaleString()} ฿</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return <Suspense><List /></Suspense>;
}
