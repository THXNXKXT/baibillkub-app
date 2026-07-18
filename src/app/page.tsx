"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Mascot from "@/components/mascot";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 };

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-white to-white overflow-hidden">
      {/* hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <h1 className="text-4xl font-bold leading-tight">
            บิลสวย เก็บเงินไว<br />
            <span className="text-emerald-500">baibillkub</span>
          </h1>
          <p className="mt-4 text-[#6e6e73]">
            ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ ใบส่งของ — ส่งลิงก์ให้ลูกค้า สแกนพร้อมเพย์จ่ายได้เลย ไม่ต้องสมัคร
          </p>
          <Link href="/login" className="inline-block mt-6 rounded-xl bg-emerald-500 text-white px-6 py-3 font-medium hover:bg-emerald-600">
            เริ่มใช้ฟรี
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          className="relative"
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -top-8 -left-8 z-10">
            <Mascot className="w-24 h-24" />
          </motion.div>
          {/* mockup บิล */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 rotate-1">
            <div className="bg-emerald-500 rounded-lg h-10 mb-4" />
            {[80, 60, 70].map((w, i) => (
              <div key={i} className="h-3 bg-neutral-100 rounded mb-2" style={{ width: `${w}%` }} />
            ))}
            <div className="flex justify-end mt-4">
              <div className="h-5 w-24 bg-emerald-100 rounded" />
            </div>
          </div>
          <motion.div animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute -right-6 top-16 text-3xl">
            🪙
          </motion.div>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }} className="absolute -left-4 bottom-8 text-2xl">
            ✨
          </motion.div>
        </motion.div>
      </div>

      {/* features */}
      <div className="max-w-4xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-4">
        {[
          { icon: "🔗", t: "ลิงก์เดียวจบ", d: "ลูกค้าเปิดลิงก์เห็นบิล ไม่ต้องสมัคร" },
          { icon: "💸", t: "พร้อมเพย์ในบิล", d: "QR ฝังในบิล แจ้งชำระพร้อมสลิป" },
          { icon: "📄", t: "ครบ 4 เอกสาร", d: "เสนอราคา → แจ้งหนี้ → เสร็จ อัตโนมัติ" },
        ].map((f, i) => (
          <motion.div
            key={f.t}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: i * 0.1 }}
            className="bg-white rounded-xl border border-neutral-200 p-5 text-center"
          >
            <p className="text-2xl">{f.icon}</p>
            <p className="font-bold mt-2">{f.t}</p>
            <p className="text-sm text-[#6e6e73] mt-1">{f.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
