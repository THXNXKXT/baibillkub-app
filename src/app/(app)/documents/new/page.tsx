import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { customer, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import DocForm from "../doc-form";

export default async function NewDocumentPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const customers = await db.select().from(customer).where(eq(customer.userId, session.user.id)).orderBy(desc(customer.createdAt));
  const [owner] = await db.select().from(user).where(eq(user.id, session!.user.id));
  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-semibold">สร้างเอกสาร</h1>
      <DocForm customers={customers} owner={owner as never} />
    </div>
  );
}
