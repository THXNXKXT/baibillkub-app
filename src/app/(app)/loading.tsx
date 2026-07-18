"use client";

import { motion } from "framer-motion";

// ponytail: loading.tsx เป็น RSC — motion ต้อง client ตัวเล็กตัวเดียว
export default function Loading() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        className="space-y-6"
      >
        <div className="h-6 w-32 rounded bg-[var(--color-rule)]" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8, delay: i * 0.07 }}
              className="card px-4 pt-4 pb-5 space-y-2"
            >
              <div className="h-2.5 w-16 rounded bg-[var(--color-rule)]" />
              <div className="h-7 w-24 rounded bg-[var(--color-rule)]" />
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card divide-y divide-[var(--color-rule)]"
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-3 flex justify-between">
              <div className="h-3 w-40 rounded bg-[var(--color-rule)]" />
              <div className="h-3 w-16 rounded bg-[var(--color-rule)]" />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
