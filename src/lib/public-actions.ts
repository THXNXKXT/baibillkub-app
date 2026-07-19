"use server";

import { db } from "@/db";
import { document } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ponytail: หา doc ด้วย token อย่างเดียว — ลิงก์สาธารณะ token คือสิทธิ์
export async function respondQuotation(token: string, accept: boolean) {
  const [d] = await db.select().from(document).where(eq(document.publicToken, token));
  if (!d || d.type !== "quotation" || d.status !== "sent") throw new Error("ตอบไม่ได้");
  await db.update(document).set({ status: accept ? "accepted" : "rejected" }).where(eq(document.id, d.id));
  revalidatePath(`/b/${token}`);
}

export async function reportPayment(token: string, slipImage?: string) {
  const [d] = await db.select().from(document).where(eq(document.publicToken, token));
  if (!d || d.type !== "invoice" || d.status !== "sent" || d.paidReportedAt) throw new Error("แจ้งไม่ได้");
  await db.update(document).set({ slipImage: slipImage || null, paidReportedAt: new Date() }).where(eq(document.id, d.id));
  revalidatePath(`/b/${token}`);
}

export async function markSent(token: string) {
  const [d] = await db.select().from(document).where(eq(document.publicToken, token));
  if (!d) throw new Error("ไม่พบเอกสาร");
  await db.update(document).set({ status: "sent" }).where(eq(document.id, d.id));
  revalidatePath(`/b/${token}`);
}
