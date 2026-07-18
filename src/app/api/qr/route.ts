import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { document, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as QRCode from "qrcode";

// ponytail: CJS lib ไม่มี types — แค่ wrap
// eslint-disable-next-line @typescript-eslint/no-require-imports
const promptpay = require("promptpay-qr");

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return new NextResponse("bad request", { status: 400 });
  const [row] = await db
    .select({ doc: document, owner: user })
    .from(document)
    .leftJoin(user, eq(document.userId, user.id))
    .where(eq(document.publicToken, token));
  if (!row?.owner?.promptpayId || row.doc.type !== "invoice")
    return new NextResponse("not found", { status: 404 });
  const payload = promptpay(row.owner.promptpayId, { amount: Number(row.doc.total) });
  const png = await QRCode.toBuffer(payload, { width: 384, margin: 1 });
  return new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
}
