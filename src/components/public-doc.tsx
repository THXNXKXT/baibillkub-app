"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { respondQuotation, reportPayment } from "@/lib/public-actions";
import BillLayout from "@/components/bill-layout";
import type { document, documentItem, customer, user } from "@/db/schema";

type Doc = typeof document.$inferSelect;
type Item = typeof documentItem.$inferSelect;
type Cust = typeof customer.$inferSelect | null;
type Owner = typeof user.$inferSelect | null;

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
    <div className="min-h-screen bg-[var(--color-paper)] py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="max-w-2xl mx-auto card rounded-2xl overflow-hidden"
      >
        <BillLayout doc={doc} cust={cust} owner={owner} items={items} />

        {/* actions นอกตัวบิล */}
        <div className="px-6 pb-6">
          {done ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring} className="text-center text-[13px] font-semibold text-[var(--color-accent-ink)] py-2">
              {done}
            </motion.p>
          ) : doc.type === "quotation" && doc.status === "sent" ? (
            <div className="flex gap-2 pt-1 text-[13px]">
              <button onClick={() => respond(true)} className="btn-accent flex-1 py-2.5 font-medium">ตกลง</button>
              <button onClick={() => respond(false)} className="btn-ghost flex-1 py-2.5">ไม่ตกลง</button>
            </div>
          ) : doc.type === "invoice" && doc.status === "sent" && doc.paidReportedAt ? (
            <p className="text-center text-[13px] font-semibold text-[var(--color-accent-ink)] py-2">แจ้งชำระแล้ว รอการยืนยัน</p>
          ) : doc.type === "invoice" && doc.status === "sent" && doc.paymentMethod === "promptpay" && owner?.promptpayId ? (
            <div className="text-center space-y-3 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr?token=${doc.publicToken}`} alt="QR พร้อมเพย์" className="mx-auto w-44 h-44 rounded-lg border border-[var(--color-rule)]" />
              <p className="text-[11px] text-[var(--color-muted)]">สแกนจ่าย {fmt(doc.total)} บาท</p>
              <label className="block text-[11px] text-[var(--color-muted)]">
                แนบสลิป (ไม่บังคับ)
                <input type="file" accept="image/*" onChange={onSlip} className="block mx-auto mt-1 text-[11px]" />
              </label>
              <button onClick={pay} className="btn-accent w-full py-2.5 text-[13px] font-medium">แจ้งชำระเงิน</button>
            </div>
          ) : doc.status === "paid" ? (
            <p className="text-center text-[13px] font-semibold text-[var(--color-accent-ink)] py-2">ชำระเรียบร้อยแล้ว</p>
          ) : null}
        </div>
      </motion.div>
      <p className="text-center text-[11px] text-[var(--color-muted)] mt-4">สร้างด้วย baibillkub</p>
    </div>
  );
}
