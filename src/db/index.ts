import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// ponytail: lazy init so build/dev without DATABASE_URL doesn't crash on import
export const db = drizzle(neon(process.env.DATABASE_URL ?? "postgres://placeholder"), { schema });
