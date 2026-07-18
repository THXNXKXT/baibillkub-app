"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocument, type DocInput } from "@/lib/actions";

const TYPES = [
  { v: "quotation", label: "ใบเสนอราคา" },
  { v: "invoice", label: "ใบแจ้งหนี้" },
  { v: "receipt", label: "ใบเสร็จรับเงิน" },
  { v: "delivery_note", label: "ใบส่งของ" },
] as const;

type Item = { description: string; qty: number; unitPrice: number };

export default function DocForm({ customers }: { customers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([{ description: "", qty: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = (subtotal * taxRate) / 100;

  function setItem(idx: number, patch: Partial<Item>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function submit(fd: FormData) {
    setLoading(true);
    try {
      const data: DocInput = {
        type: fd.get("type") as DocInput["type"],
        customerId: String(fd.get("customerId")),
        issueDate: new Date(String(fd.get("issueDate"))),
        dueDate: fd.get("dueDate") ? new Date(String(fd.get("dueDate"))) : undefined,
        notes: String(fd.get("notes") || "") || undefined,
        paymentMethod: (fd.get("paymentMethod") || undefined) as DocInput["paymentMethod"],
        taxRate,
        items: items.filter((i) => i.description.trim()),
      };
      await createDocument(data);
      router.push("/documents");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400";

  return (
    <form action={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <select name="type" required className={input}>
          {TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
        </select>
        <select name="customerId" required className={input}>
          <option value="">เลือกลูกค้า</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="text-xs text-[#6e6e73]">วันที่ออก
          <input name="issueDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={input} />
        </label>
        <label className="text-xs text-[#6e6e73]">ครบกำหนด
          <input name="dueDate" type="date" className={input} />
        </label>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 px-3 py-2 border-b border-neutral-100 last:border-0">
            <input value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="รายการ" className={input} />
            <input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: +e.target.value })} className={`${input} w-20`} />
            <input type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: +e.target.value })} placeholder="ราคา" className={`${input} w-28`} />
            <button type="button" onClick={() => setItems(items.filter((_, x) => x !== i))} className="text-red-400 text-sm px-1">×</button>
          </div>
        ))}
        <button type="button" onClick={() => setItems([...items, { description: "", qty: 1, unitPrice: 0 }])} className="w-full py-2 text-sm text-emerald-500 hover:bg-emerald-50 rounded-b-xl">
          + เพิ่มรายการ
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={taxRate === 7} onChange={(e) => setTaxRate(e.target.checked ? 7 : 0)} /> VAT 7%
        </label>
        <select name="paymentMethod" className={`${input} w-auto`}>
          <option value="">วิธีชำระ</option>
          <option value="promptpay">พร้อมเพย์</option>
          <option value="cash">เงินสด</option>
        </select>
        <div className="ml-auto text-sm text-right">
          <p>รวม {subtotal.toFixed(2)} · ภาษี {tax.toFixed(2)}</p>
          <p className="font-bold">{(subtotal + tax).toFixed(2)} บาท</p>
        </div>
      </div>

      <textarea name="notes" placeholder="หมายเหตุ" rows={2} className={input} />
      <button disabled={loading} className="w-full rounded-lg bg-emerald-500 text-white py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
        {loading ? "กำลังบันทึก..." : "สร้างเอกสาร"}
      </button>
    </form>
  );
}
