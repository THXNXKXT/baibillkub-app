import { listCustomers, createCustomer, deleteCustomer } from "@/lib/actions";

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
          });
        }}
        className="flex gap-2"
      >
        <input name="name" required placeholder="ชื่อลูกค้า" className="field flex-1 px-3 py-2 text-[13px]" />
        <input name="email" placeholder="อีเมล" className="field w-44 px-3 py-2 text-[13px]" />
        <input name="phone" placeholder="เบอร์" className="field w-32 px-3 py-2 text-[13px]" />
        <button className="btn-accent px-4 py-2 text-[13px] font-medium whitespace-nowrap">เพิ่ม</button>
      </form>
      {customers.length === 0 ? (
        <div className="card px-6 py-10 text-center">
          <p className="text-[13px] text-[var(--color-muted)]">ยังไม่มีลูกค้า</p>
        </div>
      ) : (
        <ul className="card divide-y divide-[var(--color-rule)]">
          {customers.map((c) => (
            <li key={c.id} className="flex items-center px-4 py-3">
              <div className="flex-1">
                <p className="text-[13px] font-semibold">{c.name}</p>
                <p className="text-[11px] text-[var(--color-muted)]">{[c.email, c.phone].filter(Boolean).join(" · ")}</p>
              </div>
              <form action={deleteCustomer.bind(null, c.id)}>
                <button className="text-[11px] text-red-500 hover:underline">ลบ</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
