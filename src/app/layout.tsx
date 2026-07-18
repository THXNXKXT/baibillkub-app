import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "baibillkub — บิลสวย เก็บเงินไว",
  description: "ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ ใบส่งของ ส่งลิงก์ให้ลูกค้า สแกนพร้อมเพย์จ่ายได้เลย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
