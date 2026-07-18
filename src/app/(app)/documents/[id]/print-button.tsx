"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-ghost px-3 py-1.5 text-[11px] flex items-center gap-1">
      <Printer className="w-3.5 h-3.5" /> Print
    </button>
  );
}
