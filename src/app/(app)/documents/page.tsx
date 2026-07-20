"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppData } from "@/components/data-provider";
import { FilePlus2, Pencil, Trash2 } from "lucide-react";
import Mascot from "@/components/mascot";
import { Suspense, useState } from "react";
import { deleteDocument } from "@/lib/actions";

const TYPE_LABEL: Record<string, string> = { quotation: "เสนอราคา", invoice: "แจ้งหนี้", receipt: "เสร็จ", delivery_note: "ส่งของ" };
const STATUS_DOT: Record<string, string> = {
  draft: "bg-neutral-300", sent: "bg-amber-400", paid: "bg-[var(--color-accent)]",
  accepted: "bg-[var(--color-accent)]", rejected: "bg-red-400", cancelled: "bg-neutral-300",
};
const STATUS_LABEL: Record<string, string> = { draft: "ร่าง", sent: "รอชำระ", paid: "ชำระแล้ว", accepted: "ตกลง", rejected: "ไม่ตกลง", cancelled: "ยกเลิก" };

// ponytail: ลูกค้าแจ้งชำระแล้ว — ขึ้น badge เตือนในลิสต์ ไม่ต้องกดเข้าไปดู
function statusOf(doc: { status: string; paidReportedAt: Date | null }) {
  if (doc.paidReportedAt && doc.status === "sent") return { dot: "bg-amber-500", label: "แจ้งชำระแล้ว" };
  return { dot: STATUS_DOT[doc.status], label: STATUS_LABEL[doc.status] };
}

function List() {
  const type = useSearchParams().get("type") ?? undefined;
  const { documents, loading } = useAppData();
  const docs = type ? documents.filter((d) => d.doc.type === type) : documents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold">เอกสาร</h1>
        <div className="flex items-center gap-3">
          <Link href="/documents/trash" className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-ink)]">ถังขยะ</Link>
          <Link href="/documents/new" className="btn-accent px-4 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
            <FilePlus2 className="w-4 h-4" /> สร้าง
          </Link>
        </div>
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
          {docs.map(({ doc, customerName }) => {
            const st = statusOf(doc);
            return (
              <li key={doc.id}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-paper-2)] transition-colors">
                  <Link href={`/documents/${doc.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">{doc.number} · {customerName}</p>
                      <p className="text-[11px] text-[var(--color-muted)]">{TYPE_LABEL[doc.type]} · {st.label}</p>
                    </div>
                    <p className="text-[13px] font-semibold tabular-nums">{Number(doc.total).toLocaleString()} ฿</p>
                  </Link>
                  {(doc.status === "draft" || doc.status !== "paid") && !doc.deletedAt && (
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.status === "draft" && (
                        <Link href={`/documents/${doc.id}/edit`} className="w-7 h-7 grid place-items-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent-ink)] transition-colors" title="แก้ไข">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <DeleteButton id={doc.id} number={doc.number} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return <Suspense><List /></Suspense>;
}

function DeleteButton({ id, number }: { id: string; number: string }) {
  const [open, setOpen] = useState(false);
  const { reload } = useAppData();
  return (
    <>
      <button onClick={() => setOpen(true)} className="w-7 h-7 grid place-items-center rounded-md text-[var(--color-muted)] hover:bg-red-50 hover:text-red-500 transition-colors" title="ลบ">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center px-4" onClick={() => setOpen(false)}>
          <div className="card px-5 py-5 max-w-sm w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-semibold">ลบ {number}?</p>
            <p className="text-[13px] text-[var(--color-muted)]">เอกสารจะไปถังขยะ กู้คืนได้ภายหลัง</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} className="btn-ghost px-4 py-1.5 text-[13px]">ยกเลิก</button>
              <form action={async () => { await deleteDocument(id); reload(); setOpen(false); }}>
                <button className="rounded-lg bg-red-500 text-white px-4 py-1.5 text-[13px] font-medium">ลบ</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
