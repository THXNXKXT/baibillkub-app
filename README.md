<div align="center">

# 🧾 baibillkub

### ใบบิลคับ — "บิลสวย เก็บเงินไว"

เว็บแอปทำเอกสารธุรกิจสำหรับฟรีแลนซ์/ร้านค้าเล็ก — ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ ใบส่งของ ส่งลิงก์ให้ลูกค้า สแกนพร้อมเพย์จ่ายได้เลย ไม่ต้องสมัคร

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Better-Auth](https://img.shields.io/badge/Better--Auth-18181B?style=flat-square&logo=authelia&logoColor=white)](https://www.better-auth.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## ✨ Features

| | Feature | Description |
|---|---------|-------------|
| 📄 | **เอกสาร 4 ประเภท** | ใบเสนอราคา / ใบแจ้งหนี้ / ใบเสร็จรับเงิน / ใบส่งของ — ตารางเดียว เลขที่รันแยก |
| 🔗 | **ลิงก์สาธารณะ** | ลูกค้าเปิดลิงก์เห็นบิล ตอบรับ/จ่ายเงินได้ทันที ไม่ต้องสมัครสมาชิก |
| 💸 | **PromptPay QR ในบิล** | ใส่เลขพร้อมเพย์ครั้งเดียว ทุกบิลมี QR ยอดถูกต้องอัตโนมัติ |
| 🔁 | **แปลงข้ามเอกสาร** | เสนอราคา → แจ้งหนี้ ปุ่มเดียว; ยืนยันยอดแล้วออกใบเสร็จอัตโนมัติ |
| 📊 | **Dashboard** | ค้างชำระ / เกินกำหนด / เก็บแล้วเดือนนี้ + เอกสารล่าสุด |
| 🖨 | **PDF** | ดาวน์โหลดเอกสารเป็น PDF ฟอนต์ไทย Sukhumvit |
| 👀 | **Live Preview** | ฟอร์มสร้างเอกสารมี preview บิลสดข้างๆ เห็นก่อนบันทึก |
| 🎨 | **Mascot + ธีมมินต์** | ใบบิลน้อย mascot ธีมเขียวมินต์นุ่มนวล framer-motion |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + Tailwind CSS v4 + Framer Motion + lucide-react |
| **Language** | TypeScript 5 (strict) |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **Auth** | Better-Auth (email/password) |
| **QR** | promptpay-qr + qrcode |
| **PDF** | @react-pdf/renderer (client-only) |
| **Font** | Sukhumvit Set (local TTF) |

---

## 🚀 Quick Start

```bash
# 1. Install
pnpm install

# 2. Configure environment
cp .env.example .env.local
# ใส่ DATABASE_URL (Neon) และ BETTER_AUTH_SECRET

# 3. Migrate
node scripts/migrate.mjs

# 4. Run
pnpm dev
```

→ **http://localhost:3000** → สมัครสมาชิก → ตั้งค่าร้าน (พร้อมเพย์) → สร้างเอกสารแรก

---

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://user:***@host/dbname?sslmode=require
BETTER_AUTH_SECRET=<random 32 chars>
BETTER_AUTH_URL=http://localhost:3000
```

---

## 📁 Structure

```
src/
├── app/
│   ├── (app)/          # หลัง login — dashboard / documents / customers / settings
│   ├── b/[token]/      # ลิงก์สาธารณะ (ไม่ต้อง login)
│   └── api/            # auth + QR
├── components/         # BillLayout (แชร์ทุกหน้า), mascot, app-shell
├── db/                 # schema + client
└── lib/                # actions (server), auth
```

---

## 📄 License

© THXNXKXT. All rights reserved.