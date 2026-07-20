import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'baibillkub — ใบบิลคับ "บิลสวย เก็บเงินไว"',
  description: "ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ ใบส่งของ ส่งลิงก์ให้ลูกค้า สแกนพร้อมเพย์จ่ายได้เลย",
  // ponytail: SVG — iOS 15+ และ Android รับได้ iOS เก่ากว่าจะใช้ fallback default
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    title: 'baibillkub — ใบบิลคับ "บิลสวย เก็บเงินไว"',
    description: "ทำบิลใน 2 นาที ส่งลิงก์เดียว ลูกค้าสแกนพร้อมเพย์จ่ายได้เลย",
    images: ["/icon.svg"],
    type: "website",
  },
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
