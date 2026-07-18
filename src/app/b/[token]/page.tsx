import { notFound } from "next/navigation";
import { db } from "@/db";
import { document, documentItem, customer, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import PublicDoc from "@/components/public-doc";

export default async function PublicDocPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [row] = await db
    .select({ doc: document, cust: customer, owner: user })
    .from(document)
    .leftJoin(customer, eq(document.customerId, customer.id))
    .leftJoin(user, eq(document.userId, user.id))
    .where(eq(document.publicToken, token));
  if (!row) notFound();
  const items = await db.select().from(documentItem).where(eq(documentItem.documentId, row.doc.id));
  return <PublicDoc doc={row.doc} cust={row.cust} owner={row.owner} items={items} />;
}
