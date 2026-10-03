#!/usr/bin/env node
// Applies db/migrations/*.sql in filename order, once each.
//   DATABASE_URL=postgres://... node scripts/migrate.mjs
// Every migration is additive and idempotent, so re-running is safe.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
  console.error("Set DATABASE_URL (or POSTGRES_URL) first.");
  process.exit(1);
}

const local = /localhost|127\.0\.0\.1/.test(connectionString);
const client = new pg.Client({ connectionString, ssl: local ? undefined : { rejectUnauthorized: false } });
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");

await client.connect();
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
