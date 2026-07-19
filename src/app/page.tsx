"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, QrCode, FileCheck2, Repeat2 } from "lucide-react";
import Mascot from "@/components/mascot";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 };

const FEATURES = [
  { icon: Link2, t: "ส่งลิงก์เดียวจบ", d: "ลูกค้าเปิดลิงก์เห็นบิล กดตกลงหรือจ่ายเงินได้เลย ไม่ต้องสมัครสมาชิก" },
  { icon: QrCode, t: "QR พร้อมเพย์ในบิล", d: "ใส่เลขพร้อมเพย์ครั้งเดียว ทุกบิลมี QR ยอดถูกต้องอัตโนมัติ" },
  { icon: Repeat2, t: "ครบ 4 เอกสาร", d: "เสนอราคา → แจ้งหนี้ → เสร็จ → ส่งของ แปลงข้ามปุ่มเดียว" },
  { icon: FileCheck2, t: "ใบเสร็จออกเอง", d: "ยืนยันยอดแล้วระบบออกใบเสร็จให้ทันที ไม่ต้องพิมพ์ซ้ำ" },
];

const STATS = [
  { n: "4", l: "ประเภทเอกสาร" },
  { n: "2 นาที", l: "ต่อบิลหนึ่งฉบับ" },
  { n: "1 ลิงก์", l: "ลูกค้าเปิดแล้วจ่ายได้เลย" },
];

const COMPARE = [
  ["ส่ง PDF ในแชท", "ไฟล์หายในแชท อ่านยากในมือถือ ไม่รู้ว่าจ่ายหรือยัง"],
  ["ส่งลิงก์ baibillkub", "เปิดเห็นบิลสวย สแกนจ่ายได้เลย ระบบจำสถานะให้"],
];

const FAQ = [
  { q: "ลูกค้าต้องสมัครสมาชิกไหม?", a: "ไม่ต้อง เปิดลิงก์เห็นบิล ตอบรับหรือจ่ายเงินได้ทันที" },
  { q: "ใช้ฟรีจริงไหม?", a: "ฟรี สร้างเอกสารได้ไม่จำกัด" },
  { q: "รับเงินช่องทางไหนได้บ้าง?", a: "พร้อมเพย์ (QR ในบิลอัตโนมัติ) โอนธนาคาร และเงินสด" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* nav บางๆ */}
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-[var(--color-accent-ink)]">
          <Mascot className="w-7 h-7" /> baibillkub
        </span>
        <Link href="/login" className="text-[13px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">เข้าสู่ระบบ</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6">
        {/* hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center pt-10 pb-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
            <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-bold tracking-[-0.02em] leading-[1.15]">
              ออกบิลใน 2 นาที<br />
              <span className="text-[var(--color-accent)]">เก็บเงินได้เลย</span>
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--color-muted)] max-w-sm">
              baibillkub ทำใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ ใบส่งของ — ส่งลิงก์ให้ลูกค้า สแกนพร้อมเพย์จ่ายได้ทันที
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link href="/login" className="btn-accent px-7 py-3 text-[15px] font-medium">เริ่มใช้ฟรี</Link>
              <span className="text-[12px] text-[var(--color-muted)]">ไม่ต้องใช้บัตร</span>
            </div>
          </motion.div>

          {/* mockup บิล 3D tilt */}
          <motion.div
            initial={{ opacity: 0, y: 32, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 1 }}
            transition={{ ...spring, delay: 0.15 }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            className="relative"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4.5 }} className="absolute -top-10 -left-8 z-10">
              <Mascot className="w-20 h-20" />
            </motion.div>
            <div className="card rounded-2xl overflow-hidden shadow-float">
              <div className="pt-1.5 bg-[var(--color-accent)]" />
              <div className="p-6">
                <div className="flex justify-between items-baseline">
                  <p className="text-[13px] font-bold">ใบแจ้งหนี้ INV-0042</p>
                  <p className="text-[11px] text-[var(--color-muted)]">ร้านตัวอย่าง</p>
                </div>
                <div className="mt-4 divide-y divide-[var(--color-rule)]">
                  {[["ค่าออกแบบโลโก้", "5,500"], ["ทำเว็บไซต์", "12,000"], ["โดเมน (1 ปี)", "890"]].map(([d, p]) => (
                    <div key={d} className="flex justify-between py-2.5 text-[13px]">
                      <span>{d}</span>
                      <span className="tabular-nums text-[var(--color-muted)]">{p}.00</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--color-rule)]">
                  <span className="text-[12px] text-[var(--color-muted)]">ยอดรวม</span>
                  <span className="text-[19px] font-bold text-[var(--color-accent-ink)] tabular-nums">18,390.00 ฿</span>
                </div>
                <div className="mt-4 mx-auto w-24 h-24 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule)] grid place-items-center">
                  <div className="grid grid-cols-3 gap-0.5">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span key={i} className={`w-2 h-2 ${i % 2 ? "bg-[var(--color-ink)]" : "bg-[var(--color-rule)]"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-center text-[10px] text-[var(--color-muted)] mt-2">สแกนจ่ายด้วยพร้อมเพย์</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* stats strip */}
        <motion.div {...fadeUp} transition={spring} className="grid grid-cols-3 gap-3 py-10 border-t border-[var(--color-rule)]">
          {STATS.map((s) => (
            <div key={s.l} className="card px-4 py-5 text-center card-hover">
              <p className="text-[26px] font-bold text-[var(--color-accent-ink)] tabular-nums leading-none">{s.n}</p>
              <p className="text-[12px] text-[var(--color-muted)] mt-2">{s.l}</p>
            </div>
          ))}
        </motion.div>

        {/* flow: เสนอราคา → แจ้งหนี้ → เสร็จ */}
        <motion.div {...fadeUp} transition={spring} className="py-12 border-t border-[var(--color-rule)]">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[13px]">
            {["ใบเสนอราคา", "ใบแจ้งหนี้", "ใบเสร็จรับเงิน", "ใบส่งของ"].map((t, i) => (
              <motion.span
                key={t}
                {...fadeUp}
                transition={{ ...spring, delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="card px-4 py-2 font-semibold text-[var(--color-accent-ink)]">{t}</span>
                {i < 3 && <span className="text-[var(--color-rule)]">→</span>}
              </motion.span>
            ))}
          </div>
          <p className="text-center text-[12px] text-[var(--color-muted)] mt-4">แปลงข้ามเอกสารปุ่มเดียว ข้อมูลตามมาหมด</p>
        </motion.div>

        {/* features: icon tiles + stagger */}
        <div className="grid sm:grid-cols-2 gap-4 py-14 border-t border-[var(--color-rule)]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.t}
              {...fadeUp}
              transition={{ ...spring, delay: i * 0.08 }}
              className="card card-hover px-5 pt-5 pb-6 flex gap-4"
            >
              <span className="shrink-0 w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] grid place-items-center">
                <f.icon className="w-5 h-5 text-[var(--color-accent-ink)]" />
              </span>
              <div>
                <p className="text-[15px] font-semibold">{f.t}</p>
                <p className="text-[13px] text-[var(--color-muted)] mt-1 leading-relaxed">{f.d}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* comparison */}
        <motion.div {...fadeUp} transition={spring} className="grid sm:grid-cols-2 gap-4 py-14 border-t border-[var(--color-rule)]">
          {COMPARE.map(([t, d], i) => (
            <div key={t} className={`card px-5 pt-5 pb-6 relative overflow-hidden ${i === 0 ? "opacity-60" : ""}`}>
              {i === 1 && <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-accent)]" />}
              <p className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-[0.08em]">{i === 0 ? "แบบเดิม" : "baibillkub"}</p>
              <p className={`text-[15px] font-semibold mt-1.5 ${i === 1 ? "text-[var(--color-accent-ink)]" : ""}`}>{t}</p>
              <p className="text-[13px] text-[var(--color-muted)] mt-1 leading-relaxed">{d}</p>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div {...fadeUp} transition={spring} className="max-w-2xl mx-auto py-14 border-t border-[var(--color-rule)] space-y-3">
          <h2 className="text-[17px] font-semibold text-center mb-6">คำถามที่พบบ่อย</h2>
          {FAQ.map((f) => (
            <details key={f.q} className="card px-5 py-4 group">
              <summary className="flex items-center justify-between cursor-pointer list-none text-[14px] font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-[var(--color-muted)] transition-transform group-open:rotate-45 text-[18px] leading-none">+</span>
              </summary>
              <p className="text-[13px] text-[var(--color-muted)] mt-2">{f.a}</p>
            </details>
          ))}
        </motion.div>

        {/* CTA ปิด */}
        <motion.div {...fadeUp} transition={spring} className="py-20 text-center border-t border-[var(--color-rule)]">
          <Mascot className="w-16 h-16 mx-auto" />
          <p className="text-[22px] font-semibold tracking-[-0.01em] mt-4">บิลฉบับแรกของคุณ รออยู่</p>
          <p className="text-[13px] text-[var(--color-muted)] mt-2">ฟรี · ไม่ต้องใช้บัตร · ใช้ได้เลย</p>
          <Link href="/login" className="btn-accent inline-block mt-6 px-10 py-3.5 text-[15px] font-medium">เริ่มใช้ฟรี</Link>
        </motion.div>
      </div>

      <footer className="border-t border-[var(--color-rule)] py-6 text-center text-[11px] text-[var(--color-muted)]">
        baibillkub · 2026
      </footer>
    </div>
  );
}
