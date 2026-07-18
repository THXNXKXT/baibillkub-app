import { listCustomers, createCustomer, deleteCustomer } from "@/lib/actions";
import Mascot from "@/components/mascot";

export default async function CustomersPage() {
  const customers = await listCustomers();
  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-semibold">ลูกค้า</h1>

      <div className="grid lg:grid-cols-[minmax(320px,380px)_1fr] gap-6 items-start">
        {/* ฟอร์มเพิ่ม */}
        <form
          action={async (fd) => {
            "use server";
            await createCustomer({
              name: String(fd.get("name")),
              email: String(fd.get("email") || "") || undefined,
              phone: String(fd.get("phone") || "") || undefined,
              taxId: String(fd.get("taxId") || "") || undefined,
              address: String(fd.get("address") || "") || undefined,
            });
          }}
          className="card px-4 pt-4 pb-4 space-y-3 sticky top-6"
        >
          <p className="text-[13px] font-semibold">เพิ่มลูกค้า</p>
          <input name="name" required placeholder="ชื่อลูกค้า *" className="field w-full px-3 py-2 text-[13px]" />
          <div className="grid grid-cols-2 gap-2">
            <input name="phone" placeholder="เบอร์โทร" className="field px-3 py-2 text-[13px] tabular-nums" />
            <input name="email" placeholder="อีเมล" className="field px-3 py-2 text-[13px]" />
          </div>
          <input name="taxId" placeholder="เลขผู้เสียภาษี" className="field w-full px-3 py-2 text-[13px] tabular-nums" />
          <textarea name="address" placeholder="ที่อยู่ (พิมพ์ในบิล)" rows={2} className="field w-full px-3 py-2 text-[13px]" />
          <button className="btn-accent w-full py-2 text-[13px] font-medium">เพิ่ม</button>
        </form>

        {/* รายชื่อ */}
        {customers.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <Mascot className="w-16 h-16 mx-auto opacity-60" />
            <p className="text-[13px] text-[var(--color-muted)] mt-3">ยังไม่มีลูกค้า</p>
          </div>
        ) : (
          <ul className="card divide-y divide-[var(--color-rule)]">
            {customers.map((c) => (
              <li key={c.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{c.name}</p>
                  {c.address && <p className="text-[11px] text-[var(--color-muted)] truncate">{c.address}</p>}
                </div>
                <div className="text-right text-[11px] text-[var(--color-muted)] space-y-0.5 shrink-0">
                  {c.phone && <p className="tabular-nums">โทร.{c.phone}</p>}
                  {c.taxId && <p className="tabular-nums">ภาษี {c.taxId}</p>}
                </div>
                <form action={deleteCustomer.bind(null, c.id)}>
                  <button className="text-[11px] text-red-500 hover:underline shrink-0">ลบ</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
