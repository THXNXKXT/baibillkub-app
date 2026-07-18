// ponytail: drizzle-kit CLI กับ Neon มีปัญหา ("install latest drizzle-orm") — รัน SQL ตรงๆ
// usage: node scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import { config } from "dotenv";

config({ path: ".env.local" });

const journal = JSON.parse(fs.readFileSync("drizzle/meta/_journal.json", "utf8"));
const sql = neon(process.env.DATABASE_URL);

await sql.query(`CREATE TABLE IF NOT EXISTS __migrations (tag text PRIMARY KEY, applied_at timestamptz DEFAULT now())`);
const done = (await sql.query(`SELECT tag FROM __migrations`)).map((r) => r.tag);

for (const entry of journal.entries) {
  if (done.includes(entry.tag)) continue;
  const ddl = fs.readFileSync(`drizzle/${entry.tag}.sql`, "utf8");
  const stmts = ddl.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
  for (const s of stmts) await sql.query(s);
  await sql.query(`INSERT INTO __migrations (tag) VALUES ($1)`, [entry.tag]);
  console.log("applied", entry.tag);
}
console.log("done");
