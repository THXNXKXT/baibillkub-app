"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Mascot from "@/components/mascot";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 };

const STAGES = [
  { n: "01", t: "สร้างใบเสนอราคา", d: "เลือกลูกค้า ใส่รายการ ส่งลิงก์ — ลูกค้ากดตกลงได้เลย ไม่ต้องสมัคร" },
  { n: "02", t: "แปลงเป็นใบแจ้งหนี้", d: "ปุ่มเดียว ข้อมูลตามมาหมด QR พร้อมเพย์ฝังในบิลอัตโนมัติ" },
  { n: "03", t: "ลูกค้าสแกนจ่าย", d: "เปิดลิงก์เห็นบิล สแกนจ่าย แนบสลิปแจ้งชำระในหน้าเดียว" },
  { n: "04", t: "ใบเสร็จออกเอง", d: "ยืนยันยอดแล้วระบบออกใบเสร็จให้ทันที พร้อมส่งต่อ" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-accent-soft)] via-[var(--color-paper)] to-[var(--color-paper)]">
      {/* hero — H9: mascot เป็นศูนย์กลาง + headline สั้น */}
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex justify-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
            <Mascot className="w-28 h-28" />
          </motion.div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }}
          className="mt-6 text-[clamp(2rem,6vw,3.5rem)] font-bold tracking-[-0.02em] leading-[1.1]"
        >
          บิลสวย <span className="text-[var(--color-accent)]">เก็บเงินไว</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.2 }}
          className="mt-4 text-[15px] text-[var(--color-muted)] max-w-md mx-auto"
        >
          ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ ใบส่งของ — ส่งลิงก์ให้ลูกค้า สแกนพร้อมเพย์จ่ายได้เลย
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.3 }}>
          <Link href="/login" className="btn-accent inline-block mt-8 px-8 py-3 text-[15px] font-medium">
            เริ่มใช้ฟรี
          </Link>
        </motion.div>
      </div>

      {/* Narrative Workflow — 4 ขั้นตอน */}
      <div className="max-w-2xl mx-auto px-6 pb-24 space-y-0">
        {STAGES.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ ...spring, delay: i * 0.08 }}
            className="flex gap-4 pb-10 relative"
          >
            {i < STAGES.length - 1 && <span className="absolute left-[19px] top-10 bottom-0 w-px bg-[var(--color-rule)]" />}
            <span className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] text-[13px] font-bold flex items-center justify-center tabular-nums">
              {s.n}
            </span>
            <div className="card card-hover flex-1 px-4 pt-4 pb-5">
              <p className="text-[15px] font-semibold">{s.t}</p>
              <p className="text-[13px] text-[var(--color-muted)] mt-1">{s.d}</p>
            </div>
          </motion.div>
        ))}
        <div className="text-center pt-2">
          <Link href="/login" className="btn-ghost inline-block px-6 py-2.5 text-[13px]">
            เริ่มที่ขั้นตอน 01 →
          </Link>
        </div>
      </div>

      {/* footer Ft2: บรรทัดเดียว */}
      <footer className="border-t border-[var(--color-rule)] py-6 text-center text-[11px] text-[var(--color-muted)]">
        baibillkub · ใบบิลน่ารัก เก็บเงินไว · 2026
      </footer>
    </div>
  );
}
