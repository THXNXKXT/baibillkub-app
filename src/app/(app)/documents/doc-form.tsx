"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocument, createCustomer, listCustomers, type DocInput } from "@/lib/actions";
import type { auth } from "@/lib/auth";
import { Plus, Trash2 } from "lucide-react";
import BillLayout from "@/components/bill-layout";

const TYPES = [
  { v: "quotation", label: "ใบเสนอราคา" },
  { v: "invoice", label: "ใบแจ้งหนี้" },
  { v: "receipt", label: "ใบเสร็จรับเงิน" },
  { v: "delivery_note", label: "ใบส่งของ" },
] as const;

type Item = { description: string; qty: number; unitPrice: number };
const input = "field w-full px-3 py-2 text-[13px]";
const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

export default function DocForm({ customers, owner }: { customers: Awaited<ReturnType<typeof listCustomers>>; owner: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"] }) {
  const router = useRouter();
  const [type, setTypeRaw] = useState<string>("invoice");
  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");
  const DEFAULT_NOTES: Record<string, string> = {
    quotation: "",
    invoice: "",
    receipt: "ได้รับเงินเรียบร้อยแล้ว",
    delivery_note: "กรุณาตรวจสอบสินค้าภายใน 7 วัน",
  };
  function setType(t: string) {
    setTypeRaw(t);
    setTerms((n) => (Object.values(DEFAULT_NOTES).includes(n) ? DEFAULT_NOTES[t] : n));
  }
  const [custMode, setCustMode] = useState<"pick" | "new">(customers.length ? "pick" : "new");
  const [custId, setCustId] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTaxId, setNewTaxId] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [items, setItems] = useState<Item[]>([{ description: "", qty: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = ((subtotal - discount) * taxRate) / 100;
  const total = subtotal - discount + tax;
  const setItem = (idx: number, patch: Partial<Item>) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  async function submit(fd: FormData) {
    setError("");
    const validItems = items.filter((i) => i.description.trim() && i.unitPrice >= 0);
    if (!validItems.length) return setError("ใส่รายการอย่างน้อย 1 รายการ");
    setLoading(true);
    try {
      let customerId = custId;
      if (custMode === "new") {
        const c = await createCustomer({
          name: newName,
          email: newEmail || undefined,
          phone: newPhone || undefined,
          taxId: newTaxId || undefined,
          address: newAddress || undefined,
        });
        customerId = c.id;
      }
      if (!customerId) { setLoading(false); return setError("เลือกหรือเพิ่มลูกค้า"); }
      const data: DocInput = {
        type: type as DocInput["type"],
        customerId,
        issueDate: new Date(String(fd.get("issueDate"))),
        dueDate: fd.get("dueDate") ? new Date(String(fd.get("dueDate"))) : undefined,
        terms: terms || undefined,
        notes: notes || undefined,
        paymentMethod: (paymentMethod || undefined) as DocInput["paymentMethod"],
        taxRate,
        discount,
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

  const formEl = (
    <form action={submit} className="space-y-5">
      {/* type chips */}
      <div className="flex gap-1 text-[13px]">
        {TYPES.map((t) => (
          <button key={t.v} type="button" onClick={() => setType(t.v)} className={`px-3 py-1.5 ${type === t.v ? "chip-active" : "chip"}`}>
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
          <select value={custId} onChange={(e) => setCustId(e.target.value)} required className={input}>
            <option value="">เลือกลูกค้า</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="ชื่อลูกค้า *" className={`${input} col-span-2`} />
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="อีเมล" className={input} />
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="เบอร์โทร" className={input} />
            <input value={newTaxId} onChange={(e) => setNewTaxId(e.target.value)} placeholder="เลขผู้เสียภาษี" className={`${input} col-span-2 tabular-nums`} />
            <textarea value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="ที่อยู่ (พิมพ์ในบิล)" rows={2} className={`${input} col-span-2`} />
          </div>
        )}
      </div>

      {/* ชำระ + หมายเหตุ */}
      <div className="card px-4 pt-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-[11px] text-[var(--color-muted)]">วันที่ออก
            <input name="issueDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={input} />
          </label>
          <label className="text-[11px] text-[var(--color-muted)]">ครบกำหนด
            <input name="dueDate" type="date" className={input} />
          </label>
        </div>
        {(type === "invoice" || type === "quotation") && (
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] text-[var(--color-muted)]">ช่องทางการชำระเงิน
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={input}>
                <option value="">ไม่ระบุ (ปล่อยว่าง)</option>
                <option value="promptpay">พร้อมเพย์</option>
                <option value="bank">โอนธนาคาร</option>
                <option value="cash">เงินสด</option>
              </select>
            </label>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="รายละเอียดเงื่อนไข" rows={2} className={input} />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="หมายเหตุ" rows={2} className={input} />
        </div>
      </div>
      {/* รายการ */}
      <div className="card px-4 pt-4 pb-4 space-y-2">
        <p className="text-[13px] font-semibold">รายการ</p>
        <div className="grid grid-cols-[1fr_56px_88px_28px] gap-2 text-[10px] text-[var(--color-muted)] uppercase tracking-[0.08em]">
          <span>รายละเอียด</span><span className="text-right">จำนวน</span><span className="text-right">ราคา/หน่วย</span><span />
        </div>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_56px_88px_28px] gap-2 items-center">
            <input value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="รายการ" className={input} />
            <input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: +e.target.value })} className={`${input} text-right tabular-nums`} />
            <input type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: +e.target.value })} className={`${input} text-right tabular-nums`} />
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
            <span>รวม</span><span className="tabular-nums">{fmt(subtotal)}</span>
          </div>
          <label className="flex justify-between items-center">
            <span>ส่วนลด</span>
            <input type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(+e.target.value)} className={`${input} w-20 text-right tabular-nums py-1`} placeholder="0.00" />
          </label>
          <label className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <input type="checkbox" checked={taxRate === 7} onChange={(e) => setTaxRate(e.target.checked ? 7 : 0)} /> VAT 7%
            </span>
            <span className="tabular-nums text-[var(--color-muted)]">{fmt(tax)}</span>
          </label>
          <div className="flex justify-between text-[17px] font-bold text-[var(--color-accent-ink)]">
            <span>ยอดรวม</span><span className="tabular-nums">{fmt(total)} ฿</span>
          </div>
        </div>
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <button disabled={loading} className="btn-accent w-full py-2.5 text-[13px] font-medium disabled:opacity-50">
        {loading ? "กำลังบันทึก…" : "สร้างเอกสาร"}
      </button>
    </form>
  );

  // preview — BillLayout เดียวกับของจริง (mock doc)
  const validItems = items.filter((i) => i.description.trim());
  const mockDoc = {
    id: "", userId: "", customerId: "", type: type as never, number: "0000", status: "draft" as const,
    issueDate: new Date(), dueDate: null, terms: terms || null, notes: notes || null,
    subtotal: subtotal.toFixed(2), tax: tax.toFixed(2), discount: discount.toFixed(2), total: total.toFixed(2),
    paymentMethod: (paymentMethod || null) as never, publicToken: "", convertedFromId: null, slipImage: null, confirmedAt: null,
    createdAt: new Date(), updatedAt: new Date(),
  };
  const custPreview = custMode === "new"
    ? { id: "", userId: "", name: newName, email: newEmail || null, phone: newPhone || null, address: newAddress || null, taxId: newTaxId || null, createdAt: new Date() }
    : customers.find((c) => c.id === custId) ?? null;
  const preview = (
    <div className="card rounded-2xl overflow-hidden sticky top-6">
      <BillLayout
        doc={mockDoc}
        cust={custPreview && custPreview.name ? custPreview as never : null}
        owner={owner as never}
        items={validItems.map((it, i) => ({ id: String(i), documentId: "", description: it.description, qty: String(it.qty), unitPrice: it.unitPrice.toFixed(2) }))}
      />
    </div>
  );

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(480px,560px)] gap-6 items-start">
      {formEl}
      <div className="hidden lg:block">{preview}</div>
    </div>
  );
}
