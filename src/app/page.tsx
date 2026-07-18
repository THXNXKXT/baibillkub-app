import Link from "next/link";

// ponytail: server-render ล้วน — เร็ว ไม่มี hydration pop ตาม validated pattern
const FEATURES = [
  { t: "ส่งลิงก์เดียวจบ", d: "ลูกค้าเปิดลิงก์เห็นบิล กดตกลงหรือจ่ายเงินได้เลย ไม่ต้องสมัครสมาชิก" },
  { t: "QR พร้อมเพย์ในบิล", d: "ใส่เลขพร้อมเพย์ครั้งเดียว ทุกบิลมี QR ยอดถูกต้องอัตโนมัติ" },
  { t: "ครบ 4 เอกสาร", d: "เสนอราคา → แจ้งหนี้ → เสร็จ → ส่งของ แปลงข้ามปุ่มเดียว" },
  { t: "ใบเสร็จออกเอง", d: "ยืนยันยอดแล้วระบบออกใบเสร็จให้ทันที ไม่ต้องพิมพ์ซ้ำ" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <div className="max-w-5xl mx-auto px-6">
        {/* hero: ซ้าย copy ขวา mockup — validated */}
        <div className="grid lg:grid-cols-2 gap-12 items-center pt-20 pb-16">
          <div>
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
          </div>

          {/* mockup บิล — เอกสารจริง ไม่ใช่กรอบ browser ปลอม */}
          <div className="relative">
            <div className="card rounded-2xl overflow-hidden rotate-1 shadow-float">
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
          </div>
        </div>

        {/* features: ข้อความล้วน ไม่มีไอคอน */}
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 py-14 border-t border-[var(--color-rule)]">
          {FEATURES.map((f) => (
            <div key={f.t}>
              <p className="text-[15px] font-semibold">{f.t}</p>
              <p className="text-[13px] text-[var(--color-muted)] mt-1.5 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>

        {/* CTA ปิด: ประโยคเดียว + ปุ่ม */}
        <div className="py-20 text-center border-t border-[var(--color-rule)]">
          <p className="text-[22px] font-semibold tracking-[-0.01em]">บิลฉบับแรกของคุณ รออยู่</p>
          <Link href="/login" className="btn-accent inline-block mt-6 px-8 py-3 text-[15px] font-medium">สร้างเลย</Link>
        </div>
      </div>

      <footer className="border-t border-[var(--color-rule)] py-6 text-center text-[11px] text-[var(--color-muted)]">
        baibillkub · 2026
      </footer>
    </div>
  );
}
