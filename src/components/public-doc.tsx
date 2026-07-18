"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { respondQuotation, reportPayment } from "@/lib/public-actions";
import type { document, documentItem, customer, user } from "@/db/schema";

type Doc = typeof document.$inferSelect;
type Item = typeof documentItem.$inferSelect;
type Cust = typeof customer.$inferSelect | null;
type Owner = typeof user.$inferSelect | null;

const TYPE_LABEL: Record<string, string> = {
  quotation: "ใบเสนอราคา",
  invoice: "ใบแจ้งหนี้",
  receipt: "ใบเสร็จรับเงิน",
  delivery_note: "ใบส่งของ",
};

const fmt = (n: string | number) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

export default function PublicDoc({ doc, cust, owner, items }: { doc: Doc; cust: Cust; owner: Owner; items: Item[] }) {
  const [slip, setSlip] = useState<string>();
  const [done, setDone] = useState<string>();
  const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 };

  async function respond(accept: boolean) {
    await respondQuotation(doc.publicToken, accept);
    setDone(accept ? "ตกลงแล้ว ขอบคุณครับ" : "บันทึกการปฏิเสธแล้ว");
  }

  async function pay() {
    await reportPayment(doc.publicToken, slip);
    setDone("แจ้งชำระแล้ว รอการยืนยัน");
  }

  function onSlip(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || f.size > 500 * 1024) return alert("ไฟล์ต้องไม่เกิน 500KB");
    const r = new FileReader();
    r.onload = () => setSlip(String(r.result));
    r.readAsDataURL(f);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-accent-soft)] via-[var(--color-paper)] to-[var(--color-paper)] py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="max-w-lg mx-auto card rounded-2xl overflow-hidden"
      >
        <div className="bg-[var(--color-accent)] px-6 py-5 text-[var(--color-surface)]">
          <p className="text-xs opacity-80">{owner?.shopName || owner?.name}</p>
          <h1 className="text-lg font-bold">{TYPE_LABEL[doc.type]} #{doc.number}</h1>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="text-sm">
            <p className="text-[var(--color-muted)] text-xs">ลูกค้า</p>
            <p className="font-medium">{cust?.name}</p>
            <p className="text-xs text-[var(--color-muted)]">
              วันที่ {new Date(doc.issueDate).toLocaleDateString("th-TH")}
              {doc.dueDate && ` · ครบกำหนด ${new Date(doc.dueDate).toLocaleDateString("th-TH")}`}
            </p>
          </div>

          <table className="w-full text-sm">
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-[var(--color-rule)]">
                  <td className="py-2">{it.description}</td>
                  <td className="py-2 text-right text-[var(--color-muted)] w-16">×{Number(it.qty)}</td>
                  <td className="py-2 text-right w-24">{fmt(it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-sm text-right space-y-1">
            <p className="text-[var(--color-muted)]">รวม {fmt(doc.subtotal)} บาท</p>
            {Number(doc.tax) > 0 && <p className="text-[var(--color-muted)]">ภาษี {fmt(doc.tax)} บาท</p>}
            <p className="text-xl font-bold text-[var(--color-accent-ink)]">{fmt(doc.total)} บาท</p>
          </div>

          {doc.notes && <p className="text-xs text-[var(--color-muted)] border-t border-[var(--color-rule)] pt-3">{doc.notes}</p>}

          {/* actions */}
          {done ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="text-center text-sm font-medium text-[var(--color-accent-ink)] py-2">
              {done}
            </motion.p>
          ) : doc.type === "quotation" && doc.status === "sent" ? (
            <div className="flex gap-2 pt-2">
              <button onClick={() => respond(true)} className="flex-1 rounded-lg bg-[var(--color-accent)] text-white py-2 text-sm font-medium">ตกลง</button>
              <button onClick={() => respond(false)} className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm text-[var(--color-muted)]">ไม่ตกลง</button>
            </div>
          ) : doc.type === "invoice" && doc.status === "sent" && doc.paymentMethod === "promptpay" && owner?.promptpayId ? (
            <div className="text-center space-y-3 pt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr?token=${doc.publicToken}`} alt="QR พร้อมเพย์" className="mx-auto w-48 h-48" />
              <p className="text-xs text-[var(--color-muted)]">สแกนจ่าย {fmt(doc.total)} บาท</p>
              <label className="block text-xs text-[var(--color-muted)]">
                แนบสลิป (ไม่บังคับ)
                <input type="file" accept="image/*" onChange={onSlip} className="block mx-auto mt-1 text-xs" />
              </label>
              <button onClick={pay} className="w-full rounded-lg bg-[var(--color-accent)] text-white py-2 text-sm font-medium">แจ้งชำระเงิน</button>
            </div>
          ) : doc.status === "paid" ? (
            <p className="text-center text-sm font-medium text-[var(--color-accent-ink)] py-2">ชำระเรียบร้อยแล้ว</p>
          ) : null}
        </div>
      </motion.div>
      <p className="text-center text-xs text-[var(--color-muted)] mt-4">สร้างด้วย baibillkub</p>
    </div>
  );
}
