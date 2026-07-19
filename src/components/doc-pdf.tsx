"use client";

import dynamic from "next/dynamic";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { thaiBaht } from "@/lib/thai-baht";
import type { document as docTable, documentItem, customer, user } from "@/db/schema";

Font.register({ family: "Sukhumvit", src: "/fonts/SukhumvitSet-Text.ttf" });
Font.register({ family: "Sukhumvit-Bold", src: "/fonts/SukhumvitSet-Bold.ttf" });

const ACCENT = "#10b981";
const NAVY = "#1e2a4a";
const MUTED = "#6e6e73";

const s = StyleSheet.create({
  page: { fontFamily: "Sukhumvit", fontSize: 10, padding: 40, color: NAVY },
  row: { flexDirection: "row", justifyContent: "space-between" },
  muted: { color: MUTED, fontSize: 8.5 },
  h1: { fontFamily: "Sukhumvit-Bold", fontSize: 20, color: NAVY },
  section: { fontFamily: "Sukhumvit-Bold", fontSize: 9, marginBottom: 3, textDecoration: "underline" },
  tableHeader: { flexDirection: "row", backgroundColor: ACCENT, color: "#fff", fontFamily: "Sukhumvit-Bold", paddingVertical: 5, fontSize: 9 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e5e5", paddingVertical: 5, fontSize: 9 },
  cIdx: { width: 28, textAlign: "center" },
  cDesc: { flex: 1, paddingHorizontal: 8 },
  cQty: { width: 40, textAlign: "center" },
  cNum: { width: 70, textAlign: "right", paddingRight: 8 },
  totalBar: { flexDirection: "row", justifyContent: "space-between", backgroundColor: ACCENT, color: "#fff", paddingVertical: 6, paddingHorizontal: 8, marginTop: 6, fontSize: 9 },
});

const TYPE_LABEL: Record<string, string> = { quotation: "ใบเสนอราคา", invoice: "ใบแจ้งหนี้", receipt: "ใบเสร็จรับเงิน", delivery_note: "ใบส่งของ" };
const TYPE_EN: Record<string, string> = { quotation: "Quotation", invoice: "Invoice", receipt: "Receipt", delivery_note: "Delivery Note" };
const fmt = (n: string | number) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

type Props = {
  doc: typeof docTable.$inferSelect;
  cust: typeof customer.$inferSelect | null;
  owner: typeof user.$inferSelect | null;
  items: (typeof documentItem.$inferSelect)[];
};

function DocPDF({ doc, cust, owner, items }: Props) {
  const d = new Date(doc.issueDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.row}>
          <View>
            <Text style={s.muted}>เลขที่{TYPE_LABEL[doc.type]} : {doc.number.replace(/^[A-Z]+-/, "")}</Text>
            <Text style={s.muted}>{d}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.h1}>{TYPE_LABEL[doc.type]}</Text>
            <Text style={s.muted}>{TYPE_EN[doc.type]}</Text>
          </View>
        </View>

        <View style={[s.row, { marginTop: 16 }]}>
          <View>
            <Text style={s.section}>ข้อมูลลูกค้า</Text>
            <Text style={s.muted}>ชื่อลูกค้า : {cust?.name}</Text>
            {cust?.taxId && <Text style={s.muted}>เลขประจำตัวผู้เสียภาษี : {cust.taxId}</Text>}
            {cust?.phone && <Text style={s.muted}>เบอร์โทรศัพท์ : {cust.phone}</Text>}
            {cust?.address && <Text style={s.muted}>ที่อยู่ : {cust.address}</Text>}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[s.muted, { fontFamily: "Sukhumvit-Bold" }]}>{owner?.shopName || owner?.name}</Text>
            {owner?.address && <Text style={s.muted}>{owner.address}</Text>}
            {owner?.phone && <Text style={s.muted}>{owner.phone}</Text>}
            {owner?.taxId && <Text style={s.muted}>ภาษี {owner.taxId}</Text>}
            {owner?.email && <Text style={s.muted}>{owner.email}</Text>}
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <View style={s.tableHeader}>
            <Text style={s.cIdx}>ลำดับ</Text>
            <Text style={s.cDesc}>รายการสินค้า</Text>
            <Text style={s.cQty}>จำนวน</Text>
            <Text style={s.cNum}>ราคา/หน่วย</Text>
            <Text style={s.cNum}>ราคารวม</Text>
          </View>
          {items.map((it, i) => (
            <View key={it.id} style={s.tableRow}>
              <Text style={s.cIdx}>{i + 1}</Text>
              <Text style={s.cDesc}>{it.description}</Text>
              <Text style={s.cQty}>{Number(it.qty)}</Text>
              <Text style={s.cNum}>{fmt(it.unitPrice)}.-</Text>
              <Text style={s.cNum}>{fmt(Number(it.qty) * Number(it.unitPrice))}.-</Text>
            </View>
          ))}
        </View>

        <View style={{ marginLeft: "auto", width: 180, marginTop: 8 }}>
          <View style={s.row}><Text>ราคารวม</Text><Text style={{ fontFamily: "Sukhumvit-Bold" }}>{fmt(doc.subtotal)}.-</Text></View>
          {Number(doc.tax) > 0 && <View style={s.row}><Text>ภาษีมูลค่าเพิ่ม (7%)</Text><Text style={{ fontFamily: "Sukhumvit-Bold" }}>{fmt(doc.tax)}.-</Text></View>}
          {Number(doc.discount) > 0 && <View style={s.row}><Text>ส่วนลด</Text><Text style={{ fontFamily: "Sukhumvit-Bold" }}>{fmt(doc.discount)}.-</Text></View>}
        </View>
        <View style={s.totalBar}>
          <Text>{thaiBaht(doc.total)}</Text>
          <Text>ราคารวมทั้งหมด : <Text style={{ fontFamily: "Sukhumvit-Bold" }}>{fmt(doc.total)}.-</Text></Text>
        </View>

        <View style={[s.row, { marginTop: 24 }]}>
          <View>
            <Text style={s.section}>ช่องทางการชำระเงิน</Text>
            <Text style={s.muted}>ชื่อบัญชี : {owner?.shopName || owner?.name}</Text>
            {owner?.promptpayId && <Text style={s.muted}>พร้อมเพย์ : {owner.promptpayId}</Text>}
            {doc.paymentMethod === "promptpay" && owner?.promptpayId && doc.publicToken && (
              <Image src={`/api/qr?token=${doc.publicToken}`} style={{ width: 72, height: 72, marginTop: 4 }} />
            )}
            {doc.notes && <Text style={[s.muted, { marginTop: 4 }]}>{doc.notes}</Text>}
          </View>
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <Text style={s.muted}>({owner?.name})</Text>
            <Text style={s.muted}>ผู้มีอำนาจลงนาม</Text>
            <Text style={s.muted}>{d}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

const Download = dynamic(
  async () => {
    const { PDFDownloadLink } = await import("@react-pdf/renderer");
    return function DL(props: Props) {
      return (
        <PDFDownloadLink document={<DocPDF {...props} />} fileName={`${props.doc.number}.pdf`} className="btn-ghost px-3 py-1.5 text-[11px]">
          PDF
        </PDFDownloadLink>
      );
    };
  },
  { ssr: false }
);

export default Download;
