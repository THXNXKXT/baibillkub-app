import { listCustomers, createCustomer, deleteCustomer } from "@/lib/actions";
import Mascot from "@/components/mascot";

export default async function CustomersPage() {
  const customers = await listCustomers();
  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-semibold">ลูกค้า</h1>

      <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-6 items-start">
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
            <input name="email" placeholder="อีเมล" className="field px-3 py-2 text-[13px]" />
            <input name="phone" placeholder="เบอร์โทร" className="field px-3 py-2 text-[13px] tabular-nums" />
          </div>
          <input name="taxId" placeholder="เลขผู้เสียภาษี" className="field w-full px-3 py-2 text-[13px] tabular-nums" />
          <textarea name="address" placeholder="ที่อยู่ (พิมพ์ในบิล)" rows={2} className="field w-full px-3 py-2 text-[13px]" />
          <button className="btn-accent w-full py-2 text-[13px] font-medium">เพิ่ม</button>
        </form>

        {customers.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <Mascot className="w-16 h-16 mx-auto opacity-60" />
            <p className="text-[13px] text-[var(--color-muted)] mt-3">ยังไม่มีลูกค้า</p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {customers.map((c) => (
              <li key={c.id} className="card card-hover px-4 pt-4 pb-4 flex flex-col">
                <p className="text-[13px] font-semibold">{c.name}</p>
                <p className="text-[11px] text-[var(--color-muted)] space-x-2 mt-1">
                  {c.phone && <span className="tabular-nums">โทร.{c.phone}</span>}
                  {c.taxId && <span className="tabular-nums">ภาษี {c.taxId}</span>}
                </p>
                {c.address && <p className="text-[11px] text-[var(--color-muted)] whitespace-pre-line mt-1 line-clamp-2">{c.address}</p>}
                <form action={deleteCustomer.bind(null, c.id)} className="mt-auto pt-2">
                  <button className="text-[11px] text-red-500 hover:underline">ลบ</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
