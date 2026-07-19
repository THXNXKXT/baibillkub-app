import { pgTable, text, timestamp, boolean, numeric, index } from "drizzle-orm/pg-core";

// ---------- Better-Auth ----------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // settings (per spec: ไม่มีตารางแยก)
  shopName: text("shop_name"),
  logo: text("logo"),
  promptpayId: text("promptpay_id"),
  promptpayName: text("promptpay_name"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  bankAccountName: text("bank_account_name"),
  taxId: text("tax_id"),
  address: text("address"),
  phone: text("phone"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- App ----------
export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  taxId: text("tax_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("customer_user_idx").on(t.userId)]);

export const document = pgTable("document", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => customer.id, { onDelete: "set null" }),
  type: text("type", { enum: ["quotation", "invoice", "receipt", "delivery_note"] }).notNull(),
  number: text("number").notNull(),
  status: text("status", { enum: ["draft", "sent", "paid", "accepted", "rejected", "cancelled"] }).notNull().default("draft"),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  terms: text("terms"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  tax: numeric("tax", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  discountType: text("discount_type", { enum: ["amount", "percent"] }).notNull().default("amount"),
  whtRate: numeric("wht_rate", { precision: 4, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentMethod: text("payment_method", { enum: ["promptpay", "cash", "bank"] }),
  publicToken: text("public_token").notNull().unique(),
  convertedFromId: text("converted_from_id"),
  slipImage: text("slip_image"),
  paidReportedAt: timestamp("paid_reported_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("document_user_idx").on(t.userId),
  index("document_token_idx").on(t.publicToken),
]);

export const documentItem = pgTable("document_item", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => document.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  qty: numeric("qty", { precision: 12, scale: 2 }).notNull().default("1"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
}, (t) => [index("document_item_doc_idx").on(t.documentId)]);
