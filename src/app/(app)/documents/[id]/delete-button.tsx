"use client";

import { useState } from "react";
import { deleteDocument } from "@/lib/actions";

export default function DeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost px-4 py-2 text-red-500 border-red-200">ลบ</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" onClick={() => setOpen(false)}>
          <div className="card max-w-sm w-full px-5 pt-5 pb-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[15px] font-semibold">ลบเอกสารนี้?</p>
            <p className="text-[13px] text-[var(--color-muted)]">ลบแล้วกู้ไม่ได้</p>
            <div className="flex gap-2 text-[13px]">
              <button
                disabled={busy}
                onClick={async () => { setBusy(true); await deleteDocument(id); }}
                className="flex-1 rounded-lg bg-red-500 text-white py-2 font-medium disabled:opacity-50"
              >
                {busy ? "กำลังลบ…" : "ลบเลย"}
              </button>
              <button onClick={() => setOpen(false)} className="btn-ghost flex-1 py-2">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
