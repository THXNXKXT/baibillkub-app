"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocument, createCustomer, type DocInput } from "@/lib/actions";
import { Plus, Trash2 } from "lucide-react";

const TYPES = [
  { v: "quotation", label: "ใบเสนอราคา" },
  { v: "invoice", label: "ใบแจ้งหนี้" },
  { v: "receipt", label: "ใบเสร็จรับเงิน" },
  { v: "delivery_note", label: "ใบส่งของ" },
] as const;

type Item = { description: string; qty: number; unitPrice: number };
const input = "field w-full px-3 py-2 text-[13px]";

export default function DocForm({ customers }: { customers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [type, setType] = useState<string>("invoice");
  const [custMode, setCustMode] = useState<"pick" | "new">(customers.length ? "pick" : "new");
  const [items, setItems] = useState<Item[]>([{ description: "", qty: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = (subtotal * taxRate) / 100;
  const setItem = (idx: number, patch: Partial<Item>) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  async function submit(fd: FormData) {
    setError("");
    const validItems = items.filter((i) => i.description.trim() && i.unitPrice >= 0);
    if (!validItems.length) return setError("ใส่รายการอย่างน้อย 1 รายการ");
    setLoading(true);
    try {
      let customerId = String(fd.get("customerId") || "");
      if (custMode === "new") {
        const c = await createCustomer({
          name: String(fd.get("newName")),
          email: String(fd.get("newEmail") || "") || undefined,
          phone: String(fd.get("newPhone") || "") || undefined,
          taxId: String(fd.get("newTaxId") || "") || undefined,
          address: String(fd.get("newAddress") || "") || undefined,
        });
        customerId = c.id;
      }
      if (!customerId) { setLoading(false); return setError("เลือกหรือเพิ่มลูกค้า"); }
      const data: DocInput = {
        type: type as DocInput["type"],
        customerId,
        issueDate: new Date(String(fd.get("issueDate"))),
        dueDate: fd.get("dueDate") ? new Date(String(fd.get("dueDate"))) : undefined,
        notes: String(fd.get("notes") || "") || undefined,
        paymentMethod: (fd.get("paymentMethod") || undefined) as DocInput["paymentMethod"],
        taxRate,
        items: validItems,
      };
      await createDocument(data);
      router.push("/documents");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="space-y-5">
      {/* type chips */}
      <div className="flex gap-1 text-[13px]">
        {TYPES.map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setType(t.v)}
            className={`px-3 py-1.5 ${type === t.v ? "chip-active" : "chip"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ลูกค้า */}
      <div className="card px-4 pt-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold">ลูกค้า</p>
          {customers.length > 0 && (
            <button type="button" onClick={() => setCustMode(custMode === "pick" ? "new" : "pick")} className="text-[11px] text-[var(--color-accent-ink)] hover:underline">
              {custMode === "pick" ? "+ ลูกค้าใหม่" : "เลือกจากรายชื่อ"}
            </button>
          )}
        </div>
        {custMode === "pick" ? (
          <select name="customerId" required className={input}>
            <option value="">เลือกลูกค้า</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input name="newName" required placeholder="ชื่อลูกค้า *" className={`${input} col-span-2`} />
            <input name="newEmail" placeholder="อีเมล" className={input} />
            <input name="newPhone" placeholder="เบอร์โทร" className={input} />
            <input name="newTaxId" placeholder="เลขผู้เสียภาษี" className={`${input} col-span-2 tabular-nums`} />
            <textarea name="newAddress" placeholder="ที่อยู่ (พิมพ์ในบิล)" rows={2} className={`${input} col-span-2`} />
          </div>
        )}
      </div>

      {/* วันที่ */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] text-[var(--color-muted)]">วันที่ออก
          <input name="issueDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={input} />
        </label>
        <label className="text-[11px] text-[var(--color-muted)]">ครบกำหนด
          <input name="dueDate" type="date" className={input} />
        </label>
      </div>

      {/* รายการ */}
      <div className="card px-4 pt-4 pb-4 space-y-2">
        <p className="text-[13px] font-semibold">รายการ</p>
        <div className="grid grid-cols-[1fr_64px_96px_80px_28px] gap-2 text-[10px] text-[var(--color-muted)] uppercase tracking-[0.08em]">
          <span>รายละเอียด</span><span className="text-right">จำนวน</span><span className="text-right">ราคา/หน่วย</span><span className="text-right">รวม</span><span />
        </div>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_64px_96px_80px_28px] gap-2 items-center">
            <input value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="รายการ" className={input} />
            <input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: +e.target.value })} className={`${input} text-right tabular-nums`} />
            <input type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: +e.target.value })} className={`${input} text-right tabular-nums`} />
            <span className="text-right text-[13px] tabular-nums text-[var(--color-muted)]">{(it.qty * it.unitPrice).toFixed(2)}</span>
            <button type="button" onClick={() => setItems(items.filter((_, x) => x !== i))} className="text-[var(--color-muted)] hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setItems([...items, { description: "", qty: 1, unitPrice: 0 }])} className="flex items-center gap-1.5 text-[12px] text-[var(--color-accent-ink)] hover:underline pt-1">
          <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
        </button>
        <div className="border-t border-[var(--color-rule)] pt-3 space-y-1 text-[13px]">
          <div className="flex justify-between text-[var(--color-muted)]">
            <span>รวม</span><span className="tabular-nums">{subtotal.toFixed(2)}</span>
          </div>
          <label className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <input type="checkbox" checked={taxRate === 7} onChange={(e) => setTaxRate(e.target.checked ? 7 : 0)} /> VAT 7%
            </span>
            <span className="tabular-nums text-[var(--color-muted)]">{tax.toFixed(2)}</span>
          </label>
          <div className="flex justify-between text-[17px] font-bold text-[var(--color-accent-ink)]">
            <span>ยอดรวม</span><span className="tabular-nums">{(subtotal + tax).toFixed(2)} ฿</span>
          </div>
        </div>
      </div>

      {/* ชำระ + หมายเหตุ */}
      <div className="grid grid-cols-2 gap-3">
        <select name="paymentMethod" className={input}>
          <option value="">วิธีชำระเงิน</option>
          <option value="promptpay">พร้อมเพย์</option>
          <option value="cash">เงินสด</option>
        </select>
        <textarea name="notes" placeholder="หมายเหตุ" rows={1} className={input} />
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <button disabled={loading} className="btn-accent w-full py-2.5 text-[13px] font-medium disabled:opacity-50">
        {loading ? "กำลังบันทึก…" : "สร้างเอกสาร"}
      </button>
    </form>
  );
}
