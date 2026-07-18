"use client";

import dynamic from "next/dynamic";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { document as docTable, documentItem, customer, user } from "@/db/schema";

Font.register({ family: "Sukhumvit", src: "/fonts/SukhumvitSet-Text.ttf" });

const s = StyleSheet.create({
  page: { fontFamily: "Sukhumvit", fontSize: 10, padding: 40, color: "#171717" },
  header: { marginBottom: 20 },
  title: { fontSize: 18, color: "#10b981" },
  muted: { color: "#6e6e73", fontSize: 9 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 6 },
  desc: { flex: 1 },
  right: { width: 70, textAlign: "right" },
  total: { fontSize: 14, color: "#10b981", textAlign: "right", marginTop: 10 },
});

const TYPE_LABEL: Record<string, string> = { quotation: "ใบเสนอราคา", invoice: "ใบแจ้งหนี้", receipt: "ใบเสร็จรับเงิน", delivery_note: "ใบส่งของ" };
const fmt = (n: string | number) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

type Props = {
  doc: typeof docTable.$inferSelect;
  cust: typeof customer.$inferSelect | null;
  owner: typeof user.$inferSelect | null;
  items: (typeof documentItem.$inferSelect)[];
};

function DocPDF({ doc, cust, owner, items }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.muted}>{owner?.shopName || owner?.name}</Text>
          <Text style={s.title}>{TYPE_LABEL[doc.type]} #{doc.number}</Text>
          <Text style={s.muted}>ลูกค้า: {cust?.name} · {new Date(doc.issueDate).toLocaleDateString("th-TH")}</Text>
        </View>
        {items.map((it) => (
          <View key={it.id} style={s.row}>
            <Text style={s.desc}>{it.description} ×{Number(it.qty)}</Text>
            <Text style={s.right}>{fmt(it.unitPrice)}</Text>
          </View>
        ))}
        {Number(doc.tax) > 0 && <Text style={[s.right, { marginTop: 8 }]}>ภาษี {fmt(doc.tax)}</Text>}
        <Text style={s.total}>{fmt(doc.total)} บาท</Text>
        {doc.notes && <Text style={[s.muted, { marginTop: 16 }]}>{doc.notes}</Text>}
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
