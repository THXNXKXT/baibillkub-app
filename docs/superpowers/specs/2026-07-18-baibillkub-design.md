# baibillkub — Design Spec (2026-07-18)

## Concept
เว็บแอปทำเอกสารธุรกิจสำหรับฟรีแลนซ์/ร้านค้าเล็ก จุดขาย: ลิงก์เอกสารสวย ลูกค้าไม่ต้องสมัคร จ่าย PromptPay ผ่าน QR ในบิล ดูพรีเมียมกว่าแอปทำบิลทั่วไป

## Stack
Next.js 16 (App Router) + Drizzle (Neon) + Better-Auth + Tailwind v4 + framer-motion + Sukhumvit Set TTF (local @font-face)

## เอกสาร 4 ประเภท (table เดียว)
`type: quotation | invoice | receipt | delivery_note`
- เลขที่รันแยกตาม type: QT-0001, INV-0001, RC-0001, DN-0001
- แปลงข้าม type ปุ่มเดียว: quotation → invoice, invoice mark paid → ออก receipt อัตโนมัติ, delivery_note สร้างจาก invoice
- ลิงก์สาธารณะ `/b/[token]`:
  - quotation: ดู + ปุ่ม ตกลง/ไม่ตกลง
  - invoice: ดู + QR PromptPay + แจ้งชำระ + PDF
  - receipt/delivery_note: ดู + PDF

## Schema (Drizzle)
- `user/session/account` — Better-Auth (createdAt/updatedAt ครบ)
- `customer` — userId, name, email, phone, address
- `document` — userId, customerId, type, number, status (draft|sent|paid|accepted|rejected|cancelled), issueDate, dueDate, notes, subtotal, tax, total, paymentMethod (promptpay|cash), publicToken (nanoid 21), convertedFromId, slipImage (base64), confirmedAt
- `document_item` — documentId, description, qty, unitPrice
- `settings` columns บน user — shopName, logo (base64), promptpayId (ไม่มีตารางแยก)

## DB
Neon (serverless postgres) + drizzle-kit migrate

## Flow ชำระเงิน (MVP)
- PromptPay: QR จาก promptpay-qr + qrcode lib → ลูกค้าสแกน → กดแจ้งชำระ (แนบสลิป optional) → เจ้าของยืนยัน → paid → ออก receipt
- เงินสด: เจ้าของ mark paid เอง
- Stripe: phase 2 ไม่แตะ schema หลัก

## หน้าแอป (login แล้ว)
Dashboard (ค้าง/เกินกำหนด/เก็บแล้วเดือนนี้) / รายการเอกสาร (filter ตาม type) / สร้าง-แก้เอกสาร / ลูกค้า / Settings

## Design (ออกแบบใหม่หมด ไม่เอาแบบ BaiBill เดิม)
- **โทนเขียวมินต์** — primary mint (#34d399-ish), ink, muted #6e6e73; semantic green/red/amber
- **Mascot** — ตัวการ์ตูนโทนมินต์ (ใบบิล/เหรียญ character) ใช้บน landing, ลิงก์สาธารณะ, empty states
- หน้าแอป: flat/minimal, radius 12px
- ลิงก์สาธารณะ + landing: หวือหวา — การ์ดลอย, gradient พื้น, mascot, framer-motion spring 300/30/0.8, mobile-first
- Landing: hero ซ้าย copy ขวา mockup, scroll-reveal

## Project
`D:\Projects\baibillkub-app`

## Out of scope (phase 2+)
Stripe, ใบกำกับภาษีเต็มรูป, recurring, email auto, รายงาน
