import { listCustomers, createCustomer, deleteCustomer } from "@/lib/actions";

export default async function CustomersPage() {
  const customers = await listCustomers();
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">ลูกค้า</h1>
      <form
        action={async (fd) => {
          "use server";
          await createCustomer({
            name: String(fd.get("name")),
            email: String(fd.get("email") || "") || undefined,
            phone: String(fd.get("phone") || "") || undefined,
          });
        }}
        className="flex gap-2 mb-6"
      >
        <input name="name" required placeholder="ชื่อลูกค้า" className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
        <input name="email" placeholder="อีเมล" className="w-40 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
        <input name="phone" placeholder="เบอร์" className="w-32 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
        <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600">เพิ่ม</button>
      </form>
      {customers.length === 0 ? (
        <p className="text-sm text-[#6e6e73]">ยังไม่มีลูกค้า</p>
      ) : (
        <ul className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {customers.map((c) => (
            <li key={c.id} className="flex items-center px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-[#6e6e73]">{[c.email, c.phone].filter(Boolean).join(" · ")}</p>
              </div>
              <form action={deleteCustomer.bind(null, c.id)}>
                <button className="text-xs text-red-500 hover:underline">ลบ</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
