# baibillkub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development หรือ superpowers:executing-plans — ทำทีละ task ตาม checkbox

**Goal:** เว็บแอปทำเอกสาร 4 ประเภท (เสนอราคา/แจ้งหนี้/เสร็จ/ส่งของ) ลิงก์สาธารณะ + PromptPay QR สำหรับฟรีแลนซ์/ร้านค้าเล็ก

**Architecture:** Next.js 16 App Router แอปเดียวจบ — auth (Better-Auth), Drizzle+Neon, ลิงก์สาธารณะ `/b/[token]` ไม่มี auth

**Tech Stack:** Next.js 16, Drizzle, Neon, Better-Auth, Tailwind v4, framer-motion, promptpay-qr, qrcode, Sukhumvit Set TTF (local), @react-pdf/renderer (client-only, dynamic ssr:false)

## Global Constraints
- Windows + pnpm; pnpm-workspace.yaml ต้องมี allowBuilds flags
- middleware ใช้ `src/proxy.ts` (ไม่ใช่ middleware.ts)
- Better-Auth: scrypt, session+account ต้องมี createdAt/updatedAt
- PDF: client PDFDownloadLink ใน dynamic(ssr:false) เท่านั้น
- Motion: framer-motion spring stiffness=300 damping=30 mass=0.8
- สี: mint primary, ink, muted #6e6e73, semantic green/red/amber
- Font: Sukhumvit Set TTF local @font-face

---

### Task 1: Scaffold + DB + Auth
**Files:** package.json, pnpm-workspace.yaml, next.config.ts, tailwind/PostCSS config, drizzle.config.ts, src/db/schema.ts, src/db/index.ts, src/lib/auth.ts, src/app/api/auth/[...all]/route.ts, src/proxy.ts

- [ ] pnpm dlx create-next-app@latest baibillkub-app --ts --tailwind --app --src-dir --turbopack
- [ ] pnpm add drizzle-orm @neondatabase/serverless better-auth nanoid promptpay-qr qrcode framer-motion @react-pdf/renderer; pnpm add -D drizzle-kit @types/qrcode
- [ ] pnpm-workspace.yaml: `onlyBuiltDependencies: [better-sqlite3, esbuild, sharp]`
- [ ] schema.ts: user/session/account (Better-Auth shape + createdAt/updatedAt ครบ) + customer + document + document_item ตาม spec; user เพิ่ม shopName, logo, promptpayId
- [ ] .env.local: DATABASE_URL (Neon), BETTER_AUTH_SECRET; drizzle-kit generate + migrate
- [ ] auth.ts: betterAuth({ database: drizzleAdapter, emailAndPassword: true, trustedOrigins: ["http://localhost:3000"] })
- [ ] proxy.ts ที่ src/proxy.ts: protect /dashboard ฯลฯ redirect /login
- [ ] Run: pnpm dev เปิด /login สมัคร+ล็อกอินได้ → commit `feat: scaffold + auth`

### Task 2: Customer + Document CRUD (server actions)
**Files:** src/app/(app)/customers/*, src/app/(app)/documents/*, src/lib/actions.ts

- [ ] "use server" actions: createCustomer, listCustomers, createDocument (gen number รันแยกตาม type QT/INV/RC/DN, gen publicToken nanoid(21)), updateDocument, deleteDocument (draft เท่านั้น)
- [ ] ฟอร์มเอกสาร: เลือก type, customer, items dynamic rows, คำนวณ subtotal/tax(7% toggle)/total ฝั่ง client
- [ ] หน้า list: tabs ตาม type, badge status สีตาม semantic
- [ ] Test: สร้างเอกสารแต่ละ type ได้ เลขที่รันถูก → commit `feat: document CRUD`

### Task 3: หน้าสาธารณะ /b/[token] + PromptPay
**Files:** src/app/b/[token]/page.tsx, src/components/public-doc.tsx, src/components/promptpay-qr.tsx

- [ ] page.tsx: fetch doc by publicToken, 404 ถ้าไม่เจอ; render บิลการ์ดลอยบน gradient, mint accent, Sukhumvit, framer-motion fade+rise
- [ ] invoice + promptpay: QR จาก promptpay-qr(payload(user.promptpayId, total)) → qrcode.toDataURL
- [ ] quotation: ปุ่ม ตกลง/ไม่ตกลง (server action set status)
- [ ] ปุ่มแจ้งชำระ: form แนบสลิป (base64 ≤ 500KB) → status sent→รอยืนยัน
- [ ] Test: เปิดลิงก์ไม่ต้อง login, QR render, ตกลง/แจ้งชำระทำงาน → commit `feat: public doc + promptpay`

### Task 4: Pay/Convert flow ฝั่งเจ้าของ
**Files:** src/app/(app)/documents/[id]/page.tsx, src/lib/actions.ts (เพิ่ม)

- [ ] confirmPayment: ยืนยันสลิป → paid + auto-create receipt (clone items, convertedFromId)
- [ ] markPaid (cash): paid เหมือนกัน + receipt
- [ ] convert: quotation→invoice, invoice→delivery_note (clone)
- [ ] Test: quotation ตกลง → แปลง invoice → แจ้งชำระ → ยืนยัน → receipt ออกเอง → commit `feat: pay + convert flow`

### Task 5: Dashboard + PDF
**Files:** src/app/(app)/dashboard/page.tsx, src/components/doc-pdf.tsx

- [ ] Dashboard: การ์ดสถิติ (ค้างชำระ/เกินกำหนด/เก็บแล้วเดือนนี้) query จาก document ของ user
- [ ] doc-pdf.tsx: @react-pdf/renderer Document render เอกสาร; ปุ่มดาวน์โหลดใช้ PDFDownloadLink ใน dynamic(ssr:false) component — ห้าม typeof window branch; Font.register Sukhumvit client-side
- [ ] ปุ่ม PDF ทั้งหน้า detail และ /b/[token]
- [ ] Test: PDF โหลดได้ font ไทยไม่เพี้ยน → commit `feat: dashboard + pdf`

### Task 6: Landing + Mascot
**Files:** src/app/page.tsx, src/components/landing/*, src/assets/mascot.svg

- [ ] Mascot: ตัวการ์ตูนใบบิล/เหรียญโทนมินต์ (SVG) — ใช้ hero, empty state, หน้า public
- [ ] Landing: hero ซ้าย copy ขวา mockup บิล, mascot + เหรียญลอย + sparkles, scroll-reveal stagger, spring 300/30/0.8
- [ ] Test: เปิด / แล้วไม่ hydration flash → commit `feat: landing + mascot`

---

## Notes
- ponytail: ไม่มี test framework — check ด้วยการรัน dev จริงตาม step "Test:" (ตามที่ skill อนุญาต YAGNI บน tests)
- Stripe/email/ใบกำกับภาษีเต็มรูป = phase 2 ไม่อยู่ใน plan นี้
