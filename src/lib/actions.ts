"use server";

import { db } from "@/db";
import { customer, document, documentItem, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function uid() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) throw new Error("unauthorized");
  return s.user.id;
}

const PREFIX: Record<string, string> = { quotation: "QT", invoice: "INV", receipt: "RC", delivery_note: "DN" };

// ---------- Customer ----------
export async function createCustomer(data: { name: string; email?: string; phone?: string; address?: string; taxId?: string }) {
  const userId = await uid();
  const [c] = await db.insert(customer).values({ id: nanoid(), userId, ...data }).returning();
  revalidatePath("/customers");
  return c;
}

export async function listCustomers() {
  const userId = await uid();
  return db.select().from(customer).where(eq(customer.userId, userId)).orderBy(desc(customer.createdAt));
}

export async function deleteCustomer(id: string) {
  const userId = await uid();
  await db.delete(customer).where(and(eq(customer.id, id), eq(customer.userId, userId)));
  revalidatePath("/customers");
}

// ---------- Document ----------
export type DocInput = {
  type: "quotation" | "invoice" | "receipt" | "delivery_note";
  customerId: string;
  issueDate: Date;
  dueDate?: Date;
  notes?: string;
  terms?: string;
  showSignature?: boolean;
  signatureName?: string;
  taxRate: number; // 0 หรือ 7
  discount?: number;
  discountType?: "amount" | "percent";
  whtRate?: number;
  paymentMethod?: "promptpay" | "cash" | "bank";
  items: { description: string; qty: number; unitPrice: number }[];
};

function calc(items: DocInput["items"], taxRate: number, discount = 0, discountType: "amount" | "percent" = "amount", whtRate = 0) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const disc = discountType === "percent" ? (subtotal * discount) / 100 : discount;
  const tax = ((subtotal - disc) * taxRate) / 100;
  const wht = ((subtotal - disc) * whtRate) / 100;
  return { subtotal, tax, wht, total: subtotal - disc + tax - wht };
}

export async function createDocument(data: DocInput) {
  const userId = await uid();
  const [last] = await db
    .select({ number: document.number })
    .from(document)
    .where(and(eq(document.userId, userId), eq(document.type, data.type)))
    .orderBy(desc(document.createdAt))
    .limit(1);
  const seq = last ? parseInt(last.number.split("-")[1]) + 1 : 1;
  const number = `${PREFIX[data.type]}-${String(seq).padStart(4, "0")}`;
  const { subtotal, tax, total } = calc(data.items, data.taxRate, data.discount, data.discountType, data.whtRate);

  const [doc] = await db
    .insert(document)
    .values({
      id: nanoid(),
      userId,
      customerId: data.customerId,
      type: data.type,
      number,
      status: "sent",
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      notes: data.notes,
      terms: data.terms,
      showSignature: data.showSignature ?? true,
      signatureName: data.signatureName,
      paymentMethod: data.paymentMethod,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: (data.discount ?? 0).toFixed(2),
      discountType: data.discountType ?? "amount",
      whtRate: (data.whtRate ?? 0).toFixed(2),
      total: total.toFixed(2),
      publicToken: nanoid(21),
    })
    .returning();
  await db.insert(documentItem).values(
    data.items.map((i) => ({
      id: nanoid(),
      documentId: doc.id,
      description: i.description,
      qty: String(i.qty),
      unitPrice: i.unitPrice.toFixed(2),
    }))
  );
  revalidatePath("/documents");
  return doc;
}

export async function listDocuments(type?: string, trash = false) {
  const userId = await uid();
  const conds = [eq(document.userId, userId), trash ? sql`${document.deletedAt} IS NOT NULL` : sql`${document.deletedAt} IS NULL`];
  if (type) conds.push(eq(document.type, type as never));
  return db
    .select({ doc: document, customerName: customer.name })
    .from(document)
    .leftJoin(customer, eq(document.customerId, customer.id))
    .where(and(...conds))
    .orderBy(desc(document.createdAt));
}

export async function getDocument(id: string) {
  const userId = await uid();
  const [row] = await db
    .select({ doc: document, customer: customer })
    .from(document)
    .leftJoin(customer, eq(document.customerId, customer.id))
    .where(and(eq(document.id, id), eq(document.userId, userId)));
  if (!row) return null;
  const items = await db.select().from(documentItem).where(eq(documentItem.documentId, id));
  return { ...row, items };
}

// ponytail: soft delete — ไปถังขยะก่อน กู้ได้; purge ตาม trashDays ตอน listTrash
export async function deleteDocument(id: string) {
  const userId = await uid();
  const [d] = await db.select().from(document).where(and(eq(document.id, id), eq(document.userId, userId)));
  if (!d || d.status === "paid") throw new Error("ลบใบที่ชำระแล้วไม่ได้");
  await db.update(document).set({ deletedAt: new Date() }).where(eq(document.id, id));
  revalidatePath("/documents");
}

export async function restoreDocument(id: string) {
  const userId = await uid();
  await db.update(document).set({ deletedAt: null }).where(and(eq(document.id, id), eq(document.userId, userId)));
  revalidatePath("/documents/trash");
}

export async function purgeDocument(id: string) {
  const userId = await uid();
  await db.delete(document).where(and(eq(document.id, id), eq(document.userId, userId)));
  revalidatePath("/documents/trash");
}

export async function listTrash() {
  const userId = await uid();
  // auto-purge เกิน trashDays
  const [u] = await db.select({ trashDays: user.trashDays }).from(user).where(eq(user.id, userId));
  const cutoff = new Date(Date.now() - (u?.trashDays ?? 14) * 86400000);
  await db.delete(document).where(and(eq(document.userId, userId), sql`${document.deletedAt} < ${cutoff}`));
  return listDocuments(undefined, true);
}

export async function saveTrashDays(days: number) {
  const userId = await uid();
  await db.update(user).set({ trashDays: days }).where(eq(user.id, userId));
  revalidatePath("/settings");
}

// ponytail: แก้ไข draft เท่านั้น — ลบ items เก่าแล้วเขียนใหม่ (ง่ายกว่า diff)
export async function updateDocument(id: string, data: DocInput) {
  const userId = await uid();
  const [d] = await db.select().from(document).where(and(eq(document.id, id), eq(document.userId, userId)));
  if (!d || d.status !== "draft") throw new Error("แก้ไขได้เฉพาะร่าง");
  const { subtotal, tax, total } = calc(data.items, data.taxRate, data.discount, data.discountType, data.whtRate);
  await db.delete(documentItem).where(eq(documentItem.documentId, id));
  await db.update(document).set({
    customerId: data.customerId, issueDate: new Date(data.issueDate), dueDate: data.dueDate ? new Date(data.dueDate) : null,
    notes: data.notes, terms: data.terms, showSignature: data.showSignature ?? true, signatureName: data.signatureName,
    paymentMethod: data.paymentMethod, subtotal: subtotal.toFixed(2), tax: tax.toFixed(2),
    discount: (data.discount ?? 0).toFixed(2), discountType: data.discountType ?? "amount",
    whtRate: (data.whtRate ?? 0).toFixed(2), total: total.toFixed(2), updatedAt: new Date(),
  }).where(eq(document.id, id));
  if (data.items.length) {
    await db.insert(documentItem).values(data.items.map((i) => ({ id: nanoid(), documentId: id, description: i.description, qty: String(i.qty), unitPrice: i.unitPrice.toFixed(2) })));
  }
  revalidatePath("/documents");
}

// ---------- Pay / Convert ----------
async function nextNumber(userId: string, type: string) {
  const [last] = await db
    .select({ number: document.number })
    .from(document)
    .where(and(eq(document.userId, userId), eq(document.type, type as never)))
    .orderBy(desc(document.createdAt))
    .limit(1);
  const seq = last ? parseInt(last.number.split("-")[1]) + 1 : 1;
  return `${PREFIX[type]}-${String(seq).padStart(4, "0")}`;
}

async function convert(srcId: string, userId: string, type: "invoice" | "receipt" | "delivery_note") {
  const [src] = await db.select().from(document).where(and(eq(document.id, srcId), eq(document.userId, userId)));
  if (!src) throw new Error("ไม่พบเอกสารต้นทาง");
  const [doc] = await db
    .insert(document)
    .values({
      id: nanoid(), userId, customerId: src.customerId, type,
      number: await nextNumber(userId, type),
      status: type === "receipt" ? "paid" : "draft",
      issueDate: new Date(), notes: src.notes, terms: src.terms, showSignature: src.showSignature, signatureName: src.signatureName,
      subtotal: src.subtotal, tax: src.tax, discount: src.discount, discountType: src.discountType, whtRate: src.whtRate, total: src.total,
      paymentMethod: src.paymentMethod, publicToken: nanoid(21), convertedFromId: src.id,
    })
    .returning();
  const items = await db.select().from(documentItem).where(eq(documentItem.documentId, srcId));
  if (items.length)
    await db.insert(documentItem).values(items.map((i) => ({ id: nanoid(), documentId: doc.id, description: i.description, qty: i.qty, unitPrice: i.unitPrice })));
  return doc;
}

export async function convertDocument(id: string, type: "invoice" | "delivery_note") {
  const userId = await uid();
  await convert(id, userId, type);
  revalidatePath("/documents");
}

export async function confirmPayment(id: string) {
  const userId = await uid();
  await db.update(document).set({ status: "paid", confirmedAt: new Date() }).where(and(eq(document.id, id), eq(document.userId, userId)));
  // ออกใบเสร็จอัตโนมัติ ถ้ายังไม่มี
  const [rc] = await db.select().from(document).where(and(eq(document.convertedFromId, id), eq(document.type, "receipt")));
  if (!rc) await convert(id, userId, "receipt");
  revalidatePath("/documents");
}

export async function sendDocument(id: string) {
  const userId = await uid();
  await db.update(document).set({ status: "sent" }).where(and(eq(document.id, id), eq(document.userId, userId)));
  revalidatePath("/documents");
}

export async function markPaid(id: string) {
  return confirmPayment(id);
}

// ---------- Settings ----------
export async function getSettings() {
  const userId = await uid();
  const [u] = await db.select().from(user).where(eq(user.id, userId));
  return u;
}

export async function saveSettings(data: { shopName?: string; promptpayId?: string; promptpayName?: string; bankName?: string; bankAccount?: string; bankAccountName?: string; taxId?: string; address?: string; phone?: string }) {
  const userId = await uid();
  await db.update(user).set(data).where(eq(user.id, userId));
  revalidatePath("/settings");
}
