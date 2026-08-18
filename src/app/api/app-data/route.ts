import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { customer, document, user } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const [customers, documents, settings] = await Promise.all([
    db.select().from(customer).where(eq(customer.userId, userId)).orderBy(desc(customer.createdAt)),
    db
      .select({ doc: document, customerName: customer.name })
      .from(document)
      .leftJoin(customer, eq(document.customerId, customer.id))
      .where(and(eq(document.userId, userId), sql`${document.deletedAt} IS NULL`))
      .orderBy(desc(document.createdAt)),
    db.select().from(user).where(eq(user.id, userId)).then(([row]) => row ?? null),
  ]);

  const cutoff = new Date(Date.now() - (settings?.trashDays ?? 14) * 86400000);
  await db.delete(document).where(and(eq(document.userId, userId), sql`${document.deletedAt} < ${cutoff}`));
  const trash = await db
    .select({ doc: document, customerName: customer.name })
    .from(document)
    .leftJoin(customer, eq(document.customerId, customer.id))
    .where(and(eq(document.userId, userId), sql`${document.deletedAt} IS NOT NULL`))
    .orderBy(desc(document.createdAt));

  return NextResponse.json({ customers, documents, trash, settings }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
