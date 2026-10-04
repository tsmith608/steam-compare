#!/usr/bin/env node
// Applies db/migrations/*.sql in filename order, once each.
//   npm run db:migrate            (reads DATABASE_URL from .env.local / .env, like the app)
//   DATABASE_URL=postgres://... node scripts/migrate.mjs
// Every migration is additive and idempotent, so re-running is safe.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import pg from "pg";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
// Same loader Next.js uses, so this sees exactly what `npm run dev` sees.
// Variables already set in the shell win over the files.
nextEnv.loadEnvConfig(root, false, { info: () => {}, error: console.error });

const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
if (!raw) {
  console.error("No database to migrate: put DATABASE_URL in .env.local (or set it in your shell) and run this again.");
  process.exit(1);
}

const local = /localhost|127\.0\.0\.1/.test(raw);
// sslmode in the URL would override the ssl option below (and fail on Supabase's
// certificate chain), so drop it: the connection is still encrypted.
const connectionString = raw.replace(/([?&])sslmode=[^&]*(&|$)/, (_, a, b) => (b ? a : "")).replace(/[?&]$/, "");
let target = "the database in DATABASE_URL";
try {
  const u = new URL(connectionString);
  target = `${decodeURIComponent(u.username)}@${u.host}${u.pathname}`;
} catch {
  console.error("DATABASE_URL isn't a valid connection string. Copy it again from Supabase → Connect, and URL-encode special characters in the password (@ → %40, # → %23, / → %2F, : → %3A).");
  process.exit(1);
}
console.log(`Migrating ${target}`);

const client = new pg.Client({ connectionString, ssl: local ? undefined : { rejectUnauthorized: false } });
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");

// Plain-language help for the usual connection problems (the password is never printed).
function explain(err) {
  const m = `${err.code || ""} ${err.message || ""}`;
  if (/28P01|password authentication failed/i.test(m)) return "The database rejected the password. Check it in DATABASE_URL, and URL-encode special characters (@ → %40, # → %23, / → %2F, : → %3A).";
  if (/Tenant or user not found/i.test(m)) return "Supabase didn't recognise the user. Use the exact pooler string from Supabase → Connect (the user looks like postgres.<project-ref>).";
  if (/ENOTFOUND|EAI_AGAIN/.test(m)) return "Couldn't find the database host. Copy the connection string again from Supabase → Connect.";
  if (/ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|ECONNREFUSED/.test(m)) return "Couldn't reach the database. If the host starts with db. (Supabase's direct connection, IPv6 only), use the Session pooler string from Supabase → Connect instead.";
  if (/certificate/i.test(m)) return "TLS certificate problem. Remove any ?sslmode=... from DATABASE_URL and run this again.";
  return null;
}

try {
  await client.connect();
} catch (err) {
  console.error(`Couldn't connect: ${err.message}`);
  const hint = explain(err);
  if (hint) console.error(hint);
  process.exit(1);
}
try {
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"
  );
  const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (done.has(file)) {
      console.log(`  skip  ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`  apply ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  FAIL  ${file}: ${err.message}`);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  await client.end();
}
