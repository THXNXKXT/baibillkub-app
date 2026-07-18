"use server";

import { db } from "@/db";
import { customer, document, documentItem } from "@/db/schema";
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
export async function createCustomer(data: { name: string; email?: string; phone?: string; address?: string }) {
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
  taxRate: number; // 0 หรือ 7
  paymentMethod?: "promptpay" | "cash";
  items: { description: string; qty: number; unitPrice: number }[];
};

function calc(items: DocInput["items"], taxRate: number) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = (subtotal * taxRate) / 100;
  return { subtotal, tax, total: subtotal + tax };
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
  const { subtotal, tax, total } = calc(data.items, data.taxRate);

  const [doc] = await db
    .insert(document)
    .values({
      id: nanoid(),
      userId,
      customerId: data.customerId,
      type: data.type,
      number,
      status: "draft",
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
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

export async function listDocuments(type?: string) {
  const userId = await uid();
  const cond = type ? and(eq(document.userId, userId), eq(document.type, type as never)) : eq(document.userId, userId);
  return db
    .select({ doc: document, customerName: customer.name })
    .from(document)
    .leftJoin(customer, eq(document.customerId, customer.id))
    .where(cond)
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

export async function deleteDocument(id: string) {
  const userId = await uid();
  const [d] = await db.select().from(document).where(and(eq(document.id, id), eq(document.userId, userId)));
  if (!d || d.status !== "draft") throw new Error("ลบได้เฉพาะแบบร่าง");
  await db.delete(document).where(eq(document.id, id));
  revalidatePath("/documents");
}
