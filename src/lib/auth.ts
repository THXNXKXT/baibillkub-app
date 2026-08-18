import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

const baseURL = process.env.BETTER_AUTH_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const vercelOrigins = [
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [
    baseURL,
    "https://baibillkub-app.vercel.app",
    ...vercelOrigins,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
});
