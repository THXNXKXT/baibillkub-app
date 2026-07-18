import { listCustomers, createCustomer, deleteCustomer } from "@/lib/actions";
import Mascot from "@/components/mascot";

export default async function CustomersPage() {
  const customers = await listCustomers();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-[17px] font-semibold">ลูกค้า</h1>

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
        className="card px-4 pt-4 pb-4 space-y-3"
      >
        <p className="text-[13px] font-semibold">เพิ่มลูกค้า</p>
        <div className="grid grid-cols-2 gap-2">
          <input name="name" required placeholder="ชื่อลูกค้า *" className="field col-span-2 px-3 py-2 text-[13px]" />
          <input name="email" placeholder="อีเมล" className="field px-3 py-2 text-[13px]" />
          <input name="phone" placeholder="เบอร์โทร" className="field px-3 py-2 text-[13px] tabular-nums" />
          <input name="taxId" placeholder="เลขผู้เสียภาษี" className="field col-span-2 px-3 py-2 text-[13px] tabular-nums" />
          <textarea name="address" placeholder="ที่อยู่ (พิมพ์ในบิล)" rows={2} className="field col-span-2 px-3 py-2 text-[13px]" />
        </div>
        <button className="btn-accent px-4 py-2 text-[13px] font-medium">เพิ่ม</button>
      </form>

      {customers.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <Mascot className="w-16 h-16 mx-auto opacity-60" />
          <p className="text-[13px] text-[var(--color-muted)] mt-3">ยังไม่มีลูกค้า</p>
        </div>
      ) : (
        <ul className="card divide-y divide-[var(--color-rule)]">
          {customers.map((c) => (
            <li key={c.id} className="px-4 py-3">
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold">{c.name}</p>
                  <p className="text-[11px] text-[var(--color-muted)] space-x-2">
                    {c.phone && <span className="tabular-nums">โทร.{c.phone}</span>}
                    {c.taxId && <span className="tabular-nums">ภาษี {c.taxId}</span>}
                  </p>
                  {c.address && <p className="text-[11px] text-[var(--color-muted)] whitespace-pre-line mt-0.5">{c.address}</p>}
                </div>
                <form action={deleteCustomer.bind(null, c.id)}>
                  <button className="text-[11px] text-red-500 hover:underline mt-0.5">ลบ</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
