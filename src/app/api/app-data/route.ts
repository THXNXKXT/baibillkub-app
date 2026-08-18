import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { customer, document, user } from "@/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  // Pass the original request headers through. Better Auth can use the host
  // and forwarded headers to resolve the deployment origin; copying only the
  // cookie drops that context on Vercel and can make a valid cookie look stale.
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const response = NextResponse.json({
      error: "unauthorized",
      reason: cookieHeader ? "session-cookie-invalid" : "session-cookie-missing",
    }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
    // Remove an expired/invalid token before the client returns to login. This
    // prevents a legacy cookie from shadowing the fresh cookie on next login.
    for (const cookieName of [
      "better-auth.session_token",
      "better-auth.session_data",
      "__Secure-better-auth.session_token",
      "__Secure-better-auth.session_data",
    ]) {
      response.cookies.set(cookieName, "", {
        maxAge: 0,
        path: "/",
        secure: cookieName.startsWith("__Secure-"),
      });
    }
    return response;
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
