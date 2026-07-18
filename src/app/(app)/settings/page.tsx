"use client";

import { saveSettings } from "@/lib/actions";
import { useAppData } from "@/components/data-provider";

export default function SettingsPage() {
  const { settings: u, loading, reload } = useAppData();
  const input = "field w-full px-3 py-2 text-[13px]";
  const label = "block text-[11px] text-[var(--color-muted)]";

  if (loading || !u) {
    return <div className="card px-4 py-6"><div className="h-3 w-40 rounded bg-[var(--color-rule)]" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-semibold">ตั้งค่าร้าน</h1>
      <form
        action={async (fd) => {
          await saveSettings({
            shopName: String(fd.get("shopName") || "") || undefined,
            taxId: String(fd.get("taxId") || "") || undefined,
            address: String(fd.get("address") || "") || undefined,
            phone: String(fd.get("phone") || "") || undefined,
            promptpayId: String(fd.get("promptpayId") || "") || undefined,
            promptpayName: String(fd.get("promptpayName") || "") || undefined,
            bankName: String(fd.get("bankName") || "") || undefined,
            bankAccount: String(fd.get("bankAccount") || "") || undefined,
            bankAccountName: String(fd.get("bankAccountName") || "") || undefined,
          });
          reload();
        }}
        className="card px-4 pt-4 pb-4 space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>ชื่อร้าน (พิมพ์ในบิล)
            <input name="shopName" defaultValue={u.shopName ?? ""} className={input} />
          </label>
          <label className={label}>เลขประจำตัวผู้เสียภาษี
            <input name="taxId" defaultValue={u.taxId ?? ""} placeholder="0-0000-00000-00-0" className={`${input} tabular-nums`} />
          </label>
          <label className={label}>เบอร์โทร
            <input name="phone" defaultValue={u.phone ?? ""} className={`${input} tabular-nums`} />
          </label>
          <label className={`${label} col-span-2`}>ที่อยู่
            <textarea name="address" defaultValue={u.address ?? ""} rows={2} className={input} />
          </label>
        </div>

        <div className="border-t border-[var(--color-rule)] pt-4 space-y-3">
          <p className="text-[13px] font-semibold">พร้อมเพย์</p>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>เลขพร้อมเพย์ (เบอร์/ปชช.)
              <input name="promptpayId" defaultValue={u.promptpayId ?? ""} className={`${input} tabular-nums`} />
            </label>
            <label className={label}>ชื่อบัญชีพร้อมเพย์
              <input name="promptpayName" defaultValue={u.promptpayName ?? ""} placeholder="ถ้าว่างจะใช้ชื่อร้าน" className={input} />
            </label>
          </div>
        </div>

        <div className="border-t border-[var(--color-rule)] pt-4 space-y-3">
          <p className="text-[13px] font-semibold">บัญชีธนาคาร</p>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>ธนาคาร
              <input name="bankName" defaultValue={u.bankName ?? ""} placeholder="กสิกรไทย / ไทยพาณิชย์ …" className={input} />
            </label>
            <label className={label}>เลขบัญชี
              <input name="bankAccount" defaultValue={u.bankAccount ?? ""} className={`${input} tabular-nums`} />
            </label>
            <label className={`${label} col-span-2`}>ชื่อบัญชี
              <input name="bankAccountName" defaultValue={u.bankAccountName ?? ""} placeholder="ถ้าว่างจะใช้ชื่อร้าน" className={input} />
            </label>
          </div>
        </div>

        <button className="btn-accent px-6 py-2 text-[13px] font-medium">บันทึก</button>
      </form>

      {/* เปลี่ยนรหัสผ่าน */}
      <form
        action={async (fd) => {
          const pw = String(fd.get("newPassword") || "");
          if (pw.length < 8) return;
          const { auth: a } = await import("@/lib/auth");
          const { headers } = await import("next/headers");
          await a.api.changePassword({ body: { newPassword: pw, currentPassword: String(fd.get("currentPassword") || ""), revokeOtherSessions: true }, headers: await headers() });
        }}
        className="card px-4 pt-4 pb-4 space-y-3"
      >
        <p className="text-[13px] font-semibold">เปลี่ยนรหัสผ่าน</p>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>รหัสผ่านปัจจุบัน
            <input name="currentPassword" type="password" required className={input} />
          </label>
          <label className={label}>รหัสผ่านใหม่ (8+ ตัว)
            <input name="newPassword" type="password" required minLength={8} className={input} />
          </label>
        </div>
        <button className="btn-ghost px-6 py-2 text-[13px]">เปลี่ยนรหัสผ่าน</button>
      </form>
    </div>
  );
}
