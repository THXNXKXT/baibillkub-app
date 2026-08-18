import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { customer, document, user } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeaders = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) authHeaders.set("cookie", cookie);
  const session = await auth.api.getSession({ headers: authHeaders });
  if (!session) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    return NextResponse.json({
      error: "unauthorized",
      reason: cookieHeader ? "session-cookie-invalid" : "session-cookie-missing",
    }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
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
