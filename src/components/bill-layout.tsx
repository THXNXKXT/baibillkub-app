import { thaiBaht } from "@/lib/thai-baht";
import type { document as docTable, documentItem, customer, user } from "@/db/schema";

type Doc = typeof docTable.$inferSelect;
type Item = typeof documentItem.$inferSelect;
type Cust = typeof customer.$inferSelect | null;
type Owner = typeof user.$inferSelect | null;

const TYPE_LABEL: Record<string, string> = { quotation: "ใบเสนอราคา", invoice: "ใบแจ้งหนี้", receipt: "ใบเสร็จรับเงิน", delivery_note: "ใบส่งของ" };
const TYPE_EN: Record<string, string> = { quotation: "Quotation", invoice: "Invoice", receipt: "Receipt", delivery_note: "Delivery Note" };
const fmt = (n: string | number) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

// โครงบิลตาม reference: navy body + accent bar ตาราง + ยอดรวมคำไทย
export default function BillLayout({ doc, cust, owner, items }: { doc: Doc; cust: Cust; owner: Owner; items: Item[] }) {
  return (
    <div className="bg-[var(--color-surface)] text-[oklch(30%_0.05_240)] text-[13px] leading-relaxed">
      {/* header */}
      <div className="flex justify-between items-start px-6 pt-6">
        <div className="text-[11px] space-y-0.5">
          <p>เลขที่{TYPE_LABEL[doc.type]} : {doc.number.replace(/^[A-Z]+-/, "")}</p>
          <p>{new Date(doc.issueDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="text-right">
          <h1 className="text-[24px] font-bold leading-none">{TYPE_LABEL[doc.type]}</h1>
          <p className="text-[12px] mt-0.5">{TYPE_EN[doc.type]}</p>
        </div>
      </div>

      {/* ลูกค้า / ผู้ขาย */}
      <div className="grid grid-cols-2 gap-6 px-6 mt-6">
        <div className="text-[11px] space-y-0.5">
          <p className="font-semibold underline underline-offset-2 mb-1.5">ข้อมูลลูกค้า</p>
          <p>ชื่อลูกค้า : {cust?.name}</p>
          {cust?.taxId && <p className="tabular-nums">เลขประจำตัวผู้เสียภาษี : {cust.taxId}</p>}
          {cust?.phone && <p className="tabular-nums">เบอร์โทรศัพท์ : {cust.phone}</p>}
          {cust?.address && <p>ที่อยู่ : {cust.address}</p>}
        </div>
        <div className="text-[11px] space-y-0.5 text-right">
          <p className="font-semibold">{owner?.shopName || owner?.name}</p>
          {owner?.address && <p>{owner.address}</p>}
          {owner?.taxId && <p className="tabular-nums">ภาษี {owner.taxId}</p>}
          {owner?.phone && <p className="tabular-nums">โทร.{owner.phone}</p>}
        </div>
      </div>

      {/* ตาราง */}
      <div className="px-6 mt-5">
        <table className="w-full text-[12px] border border-[var(--color-rule)]">
          <thead>
            <tr className="bg-[var(--color-accent)] text-[var(--color-surface)]">
              <th className="py-2 w-10 font-medium">ลำดับ</th>
              <th className="py-2 text-left px-3 font-medium">รายการสินค้า</th>
              <th className="py-2 w-16 font-medium">จำนวน</th>
              <th className="py-2 w-24 font-medium">ราคา/หน่วย</th>
              <th className="py-2 w-24 font-medium">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id} className="border-b border-[var(--color-rule)]">
                <td className="py-2 text-center tabular-nums">{i + 1}</td>
                <td className="py-2 px-3">{it.description}</td>
                <td className="py-2 text-center tabular-nums">{Number(it.qty)}</td>
                <td className="py-2 text-right px-3 tabular-nums">{fmt(it.unitPrice)}.-</td>
                <td className="py-2 text-right px-3 tabular-nums">{fmt(Number(it.qty) * Number(it.unitPrice))}.-</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* totals */}
        <div className="ml-auto w-64 mt-3 space-y-1 text-[12px]">
          <div className="flex justify-between"><span>ราคารวม</span><span className="tabular-nums font-semibold">{fmt(doc.subtotal)}.-</span></div>
          {Number(doc.tax) > 0 && <div className="flex justify-between"><span>ภาษีมูลค่าเพิ่ม (7%)</span><span className="tabular-nums font-semibold">{fmt(doc.tax)}.-</span></div>}
          {Number(doc.discount) > 0 && (
            <div className="flex justify-between">
              <span>ส่วนลด{doc.discountType === "percent" ? ` (${Number(doc.discount)}%)` : ""}</span>
              <span className="tabular-nums font-semibold">
                {fmt(doc.discountType === "percent" ? (Number(doc.subtotal) * Number(doc.discount)) / 100 : Number(doc.discount))}.-
              </span>
            </div>
          )}
          {Number(doc.whtRate) > 0 && (
            <div className="flex justify-between">
              <span>หัก ณ ที่จ่าย ({Number(doc.whtRate)}%)</span>
              <span className="tabular-nums font-semibold">
                {fmt(((Number(doc.subtotal) - (doc.discountType === "percent" ? (Number(doc.subtotal) * Number(doc.discount)) / 100 : Number(doc.discount))) * Number(doc.whtRate)) / 100)}.-
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 -mx-6 bg-[var(--color-accent)] text-[var(--color-surface)] px-6 py-2.5 flex justify-between items-center">
          <span className="text-[12px]">{thaiBaht(doc.total)}</span>
          <span className="text-[13px]">ราคารวมทั้งหมด : <b className="tabular-nums">{fmt(doc.total)}.-</b></span>
        </div>
      </div>

      {/* footer */}
      <div className="grid grid-cols-2 gap-6 px-6 mt-5 pb-6 text-[11px]">
        {(doc.type === "invoice" || doc.type === "quotation") && doc.paymentMethod && (
          <div className="space-y-0.5">
            <p className="font-semibold underline underline-offset-2 mb-1.5">ช่องทางการชำระเงิน</p>
            {doc.paymentMethod === "promptpay" && owner?.promptpayId && (
              <>
                <p>ชื่อบัญชี : {owner.promptpayName || owner.shopName || owner.name}</p>
                <p className="tabular-nums">พร้อมเพย์ : {owner.promptpayId}</p>
                {doc.publicToken && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/qr?token=${doc.publicToken}`} alt="QR พร้อมเพย์" className="w-28 h-28 rounded border border-[var(--color-rule)] mt-1" />
                )}
              </>
            )}
            {doc.paymentMethod === "bank" && owner?.bankAccount && (
              <>
                <p>ชื่อบัญชี : {owner.bankAccountName || owner.shopName || owner.name}</p>
                <p className="tabular-nums">เลขบัญชี : {owner.bankAccount}{owner.bankName && ` (${owner.bankName})`}</p>
              </>
            )}
            {doc.paymentMethod === "cash" && <p>เงินสด</p>}
          </div>
        )}
        <div>
          {doc.terms && <p className="text-[var(--color-muted)]">{doc.terms}</p>}
          {doc.notes && <p className="text-[var(--color-muted)] mt-1">หมายเหตุ: {doc.notes}</p>}
        </div>
        <div className="text-center space-y-0.5 self-end">
          {doc.showSignature && (
            <>
              <p className="mt-8 border-b border-[var(--color-rule)] w-40 ml-auto" />
              <p>({owner?.name})</p>
              <p>ผู้มีอำนาจลงนาม</p>
              <p>{new Date(doc.issueDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
