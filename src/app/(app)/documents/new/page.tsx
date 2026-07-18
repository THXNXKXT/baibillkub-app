import { listCustomers } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import DocForm from "../doc-form";

export default async function NewDocumentPage() {
  const [customers, session] = await Promise.all([listCustomers(), auth.api.getSession({ headers: await headers() })]);
  const [owner] = await db.select().from(user).where(eq(user.id, session!.user.id));
  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-semibold">สร้างเอกสาร</h1>
      <DocForm customers={customers} owner={owner as never} />
    </div>
  );
}
