"use client";

import { useState } from "react";
import { createCustomer, deleteCustomer } from "@/lib/actions";
import { useAppData } from "@/components/data-provider";
import { ChevronDown, Trash2 } from "lucide-react";
import Mascot from "@/components/mascot";
import type { listCustomers } from "@/lib/actions";

type Cust = Awaited<ReturnType<typeof listCustomers>>[number];

function CustomerRow({ c }: { c: Cust }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { reload } = useAppData();
  return (
    <li>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--color-paper-2)] transition-colors text-left">
        <p className="flex-1 text-[13px] font-semibold truncate">{c.name}</p>
        <ChevronDown className={`w-4 h-4 text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 pt-2 flex items-start gap-x-6 gap-y-1 flex-wrap text-[12px] text-[var(--color-muted)] border-t border-[var(--color-rule)]">
          {c.phone && <span className="tabular-nums">โทร.{c.phone}</span>}
          {c.email && <span>{c.email}</span>}
          {c.taxId && <span className="tabular-nums">ภาษี {c.taxId}</span>}
          {c.address && <span className="whitespace-pre-line">{c.address}</span>}
          <button onClick={() => setConfirm(true)} className="ml-auto w-7 h-7 grid place-items-center rounded-md text-[var(--color-muted)] hover:bg-red-50 hover:text-red-500 transition-colors" title="ลบ">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center px-4" onClick={() => setConfirm(false)}>
          <div className="card px-5 py-5 max-w-sm w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-semibold">ลบ {c.name}?</p>
            <p className="text-[13px] text-[var(--color-muted)]">ลูกค้าจะหายไปถาวร</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirm(false)} className="btn-ghost px-4 py-1.5 text-[13px]">ยกเลิก</button>
              <form action={async () => { await deleteCustomer(c.id); reload(); setConfirm(false); }}>
                <button className="rounded-lg bg-red-500 text-white px-4 py-1.5 text-[13px] font-medium">ลบ</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default function CustomersClient() {
  const { customers, loading, reload } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold">ลูกค้า</h1>
        <button
          onClick={() => setOpen(!open)}
          className="btn-accent px-4 py-1.5 text-[13px] font-medium flex items-center gap-1.5"
        >
          + เพิ่มลูกค้า
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <form
          action={async (fd) => {
            await createCustomer({
              name: String(fd.get("name")),
              email: String(fd.get("email") || "") || undefined,
              phone: String(fd.get("phone") || "") || undefined,
              taxId: String(fd.get("taxId") || "") || undefined,
              address: String(fd.get("address") || "") || undefined,
            });
            reload();
            setOpen(false);
          }}
          className="card px-4 pt-4 pb-4 space-y-3"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input name="name" required placeholder="ชื่อลูกค้า *" className="field px-3 py-2 text-[13px]" />
            <input name="phone" placeholder="เบอร์โทร" className="field px-3 py-2 text-[13px] tabular-nums" />
            <input name="email" placeholder="อีเมล" className="field px-3 py-2 text-[13px]" />
            <input name="taxId" placeholder="เลขผู้เสียภาษี" className="field px-3 py-2 text-[13px] tabular-nums" />
          </div>
          <textarea name="address" placeholder="ที่อยู่ (พิมพ์ในบิล)" rows={2} className="field w-full px-3 py-2 text-[13px]" />
          <button className="btn-accent px-6 py-2 text-[13px] font-medium">เพิ่ม</button>
        </form>
      )}

      {loading ? (
        <div className="card px-4 py-3"><div className="h-3 w-40 rounded bg-[var(--color-rule)]" /></div>
      ) : customers.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <Mascot className="w-16 h-16 mx-auto opacity-60" />
          <p className="text-[13px] text-[var(--color-muted)] mt-3">ยังไม่มีลูกค้า</p>
        </div>
      ) : (
        <ul className="card divide-y divide-[var(--color-rule)]">
          {customers.map((c) => (
            <CustomerRow key={c.id} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
