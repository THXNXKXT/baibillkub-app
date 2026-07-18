"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="h-6 w-32 rounded bg-[var(--color-rule)]" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card px-4 pt-4 pb-5 space-y-2">
            <div className="h-2.5 w-16 rounded bg-[var(--color-rule)]" />
            <div className="h-7 w-24 rounded bg-[var(--color-rule)]" />
          </div>
        ))}
      </div>
      <div className="card divide-y divide-[var(--color-rule)]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-3 flex justify-between">
            <div className="h-3 w-40 rounded bg-[var(--color-rule)]" />
            <div className="h-3 w-16 rounded bg-[var(--color-rule)]" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
