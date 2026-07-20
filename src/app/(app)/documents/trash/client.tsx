"use client";

import { useState } from "react";
import { restoreDocument, purgeDocument } from "@/lib/actions";
import { useAppData } from "@/components/data-provider";
import Mascot from "@/components/mascot";
import { RotateCcw, Trash2 } from "lucide-react";

const TYPE_LABEL: Record<string, string> = { quotation: "เสนอราคา", invoice: "แจ้งหนี้", receipt: "เสร็จ", delivery_note: "ส่งของ" };

export default function TrashClient() {
  const { trash, loading, reload } = useAppData();
  const [confirm, setConfirm] = useState<string | null>(null);
  const trashed = trash;

  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-semibold">ถังขยะ</h1>
      {loading ? (
        <div className="card px-4 py-3"><div className="h-3 w-40 rounded bg-[var(--color-rule)]" /></div>
      ) : trashed.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <Mascot className="w-16 h-16 mx-auto opacity-60" />
          <p className="text-[13px] text-[var(--color-muted)] mt-3">ถังขยะว่าง</p>
        </div>
      ) : (
        <ul className="card divide-y divide-[var(--color-rule)]">
          {trashed.map(({ doc, customerName }) => (
            <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">{doc.number} · {customerName}</p>
                <p className="text-[11px] text-[var(--color-muted)]">{TYPE_LABEL[doc.type]}</p>
              </div>
              <p className="text-[13px] font-semibold tabular-nums">{Number(doc.total).toLocaleString()} ฿</p>
              <form action={async () => { await restoreDocument(doc.id); reload(); }}>
                <button className="text-[11px] text-[var(--color-accent-ink)] hover:underline flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> กู้คืน</button>
              </form>
              <button onClick={() => setConfirm(doc.id)} className="text-[11px] text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> ลบถาวร</button>
            </li>
          ))}
        </ul>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center px-4" onClick={() => setConfirm(null)}>
          <div className="card px-5 py-5 max-w-sm w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-semibold">ลบถาวร?</p>
            <p className="text-[13px] text-[var(--color-muted)]">เอกสารนี้จะหายไปเลย กู้คืนไม่ได้</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-ghost px-4 py-1.5 text-[13px]">ยกเลิก</button>
              <form action={async () => { await purgeDocument(confirm); reload(); setConfirm(null); }}>
                <button className="rounded-lg bg-red-500 text-white px-4 py-1.5 text-[13px] font-medium">ลบถาวร</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
