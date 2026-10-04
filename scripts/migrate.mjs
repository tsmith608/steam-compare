#!/usr/bin/env node
// Applies db/migrations/*.sql in filename order, once each.
//   npm run db:migrate            (reads DATABASE_URL from .env.local / .env, like the app)
//   DATABASE_URL=postgres://... node scripts/migrate.mjs
//   npm run db:sql                (no connection: writes db-migrate.sql to paste into Supabase → SQL Editor)
// Every migration is additive and idempotent, so re-running is safe.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import pg from "pg";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "db", "migrations");
const migrationFiles = () => fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

// --sql: one script for Supabase's SQL Editor, for when connecting from this
// machine isn't possible. Same migrations, one transaction, and it records
// what ran so `npm run db:migrate` skips them later.
if (process.argv.includes("--sql")) {
  const parts = [
    "-- WeBothPlay database migrations. Paste all of this into Supabase → SQL Editor and click Run.",
    "-- Additive only and safe to re-run; one transaction, so an error leaves the database unchanged.",
    "BEGIN;",
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());",
  ];
  for (const f of migrationFiles()) {
    parts.push(`\n-- ---------------------------------------------------------------- ${f}`, fs.readFileSync(path.join(dir, f), "utf8").trim());
    parts.push(`INSERT INTO schema_migrations (name) VALUES ('${f}') ON CONFLICT (name) DO NOTHING;`);
  }
  parts.push("\nCOMMIT;\n");
  const out = path.join(root, "db-migrate.sql");
  fs.writeFileSync(out, parts.join("\n"));
  console.log(`Wrote ${path.relative(process.cwd(), out) || out}: open it, copy everything, paste into Supabase → SQL Editor, then Run.`);
  process.exit(0);
}
// Same loader Next.js uses, so this sees exactly what `npm run dev` sees.
// Variables already set in the shell win over the files.
const fromShell = process.env.DATABASE_URL;
const { loadedEnvFiles } = nextEnv.loadEnvConfig(root, false, { info: () => {}, error: console.error });
// A file's DATABASE_URL lines as written (the loader reports the shell's value when both are set).
const fileLines = (contents = "") =>
  [...contents.matchAll(/^[ \t]*(?:export[ \t]+)?DATABASE_URL[ \t]*=[ \t]*(.*)$/gm)].map(([, line]) => {
    const v = line.trim(), q = v.match(/^(['"`])([\s\S]*?)\1/);
    return q ? q[2] : v.replace(/\s+#.*$/, "").trim();
  });
const file = loadedEnvFiles.find((f) => fileLines(f.contents).length); // first file wins, like Next.js
const lines = file ? fileLines(file.contents) : [];
const fileValue = lines.at(-1); // and within a file, the last line wins

const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
if (!raw) {
  console.error("No database to migrate: put DATABASE_URL in .env.local (or set it in your shell) and run this again.");
  process.exit(1);
}
const source = fromShell ? "your terminal / system environment" : file ? file.path : "POSTGRES_URL";
if (fromShell && file && fileValue !== fromShell) {
  console.warn(
    `Note: DATABASE_URL is set both in your terminal/system environment and in ${file.path}, and the terminal one wins.\n` +
      "      If that's an old value, clear it (PowerShell: Remove-Item Env:DATABASE_URL · macOS/Linux: unset DATABASE_URL,\n" +
      "      and remove it from Windows' Environment Variables settings if it's there), then run this again."
  );
}
if (!fromShell && lines.length > 1)
  console.warn(`Note: ${file.path} has ${lines.length} DATABASE_URL lines, and only the last one is used (the app does the same). Delete the others.`);
if (!fromShell && fileValue?.includes("$") && fileValue !== process.env.DATABASE_URL)
  console.warn(
    `Note: DATABASE_URL in ${file.path} contains a $, which is read as the start of a variable name (the app does the same),\n` +
      "      so part of it is dropped. If the $ is part of your password, write it as %24 instead."
  );

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
console.log(`Migrating ${target} (DATABASE_URL from ${source})`);

const ssl = local ? undefined : { rejectUnauthorized: false };
const connect = async (cs, extra) => {
  const c = new pg.Client({ connectionString: cs, ssl, ...extra });
  await c.connect();
  return c;
};

// Supabase: the shared pooler (user postgres.<ref>) fronts the direct connection,
// db.<ref>.supabase.co (user postgres), and both take the same password.
function supabase(cs) {
  try {
    const u = new URL(cs);
    const pooled = /\.pooler\.supabase\.com$/i.test(u.hostname) && decodeURIComponent(u.username).match(/^(.+)\.([a-z0-9]+)$/);
    if (pooled) {
      u.username = pooled[1];
      u.hostname = `db.${pooled[2]}.supabase.co`;
      u.port = "5432";
      return { ref: pooled[2], direct: u.toString() };
    }
    const ref = u.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)?.[1];
    return ref ? { ref, direct: null } : null;
  } catch {
    return null;
  }
}
const sb = supabase(connectionString);

const said = (err) => `${err.code || ""} ${err.message || ""}`;
const wrongPassword = (err) => /28P01|password authentication failed/i.test(said(err));
const banned =
  "Supabase refused the connection, which usually means it has blocked your IP for 30 minutes after repeated wrong passwords.\n" +
  "To lift it sooner, open Database Settings in the Supabase dashboard and click Unban IP.";

// Plain-language help for the usual connection problems (the password is never printed).
function explain(err) {
  const m = said(err);
  if (wrongPassword(err)) return "The database rejected the password. Check it in DATABASE_URL, and URL-encode special characters (@ → %40, # → %23, / → %2F, : → %3A).";
  if (/Tenant or user not found/i.test(m)) return "Supabase didn't recognise the user. Use the exact pooler string from Supabase → Connect (the user looks like postgres.<project-ref>).";
  if (/circuit breaker/i.test(m)) return "Supabase's pooler is turning your IP away for up to 2 minutes after repeated failed logins. Wait 2 minutes, then run this once.";
  if (/ENOTFOUND|EAI_AGAIN/.test(m)) return "Couldn't find the database host. Copy the connection string again from Supabase → Connect.";
  if (sb && /ECONNREFUSED/.test(m)) return banned;
  if (/ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|ECONNREFUSED/.test(m)) return "Couldn't reach the database. If the host starts with db. (Supabase's direct connection, IPv6 only), use the Session pooler string from Supabase → Connect instead.";
  if (/certificate/i.test(m)) return "TLS certificate problem. Remove any ?sslmode=... from DATABASE_URL and run this again.";
  return null;
}

// What usually goes wrong with a pasted password. Reports its length, never its contents.
function passwordChecks() {
  let pw = "";
  try {
    pw = decodeURIComponent(new URL(connectionString).password);
  } catch {
    return ["The password part of DATABASE_URL couldn't be read: URL-encode any special characters."];
  }
  const out = [];
  if (!pw) out.push("There's no password in DATABASE_URL.");
  else if (/YOUR-PASSWORD/i.test(pw)) out.push("The [YOUR-PASSWORD] placeholder is still there: replace it (brackets included) with the database password.");
  else if (/^\[.*\]$/.test(pw)) out.push("The password is wrapped in square brackets: remove the [ and ].");
  if (/^\s|\s$/.test(pw)) out.push("The password starts or ends with a space.");
  if (/["'“”‘’]/.test(pw)) out.push("The password contains quote marks (often picked up when copying from a notes app).");
  if (pw) out.push(`The password being sent is ${pw.length} characters long; compare that with the one you set.`);
  out.push("It must be the database password (Supabase → Project Settings → Database), not your Supabase login or an API key.");
  if (sb) out.push(`It must be this project's password: the project's address in the Supabase dashboard contains ${sb.ref}.`);
  return out;
}
const list = (items) => items.forEach((item) => console.error(`  - ${item}`));

let client, viaDirect = false;
try {
  client = await connect(connectionString);
} catch (err) {
  console.error(`Couldn't connect: ${err.message}`);
  if (!wrongPassword(err) || !sb?.direct) {
    const hint = explain(err);
    if (hint) console.error(hint);
    if (wrongPassword(err)) list(passwordChecks());
    process.exit(1);
  }
  // Supabase's pooler caches passwords and can keep rejecting a new one for a while
  // after a reset, so try the same password where the pooler isn't involved.
  console.error(`Supabase's pooler rejected the password, so trying it on the direct connection (${new URL(sb.direct).hostname}), which skips the pooler…`);
  try {
    client = await connect(sb.direct, { connectionTimeoutMillis: 10_000 });
  } catch (err2) {
    if (wrongPassword(err2)) {
      console.error("The direct connection rejected it too, so it's not the pooler: the password in DATABASE_URL isn't the database's current password.");
      list(passwordChecks());
      process.exit(1);
    }
    const m = said(err2);
    if (/ECONNREFUSED/.test(m)) console.error(banned);
    else if (/ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|EADDRNOTAVAIL|ETIMEDOUT|timeout/i.test(m))
      console.error("Couldn't reach it to double-check: the direct connection needs IPv6, which this network doesn't seem to have.");
    else console.error(`Couldn't double-check there: ${err2.message}${explain(err2) ? `\n${explain(err2)}` : ""}`);
    console.error("So either the password is wrong, or the pooler hasn't caught up with a recent password reset yet.");
    list([...passwordChecks(), "Just reset it? Don't reset it again: each reset restarts the wait. Give it a few minutes, then run this again."]);
    console.error("To apply the migrations without connecting from here: npm run db:sql, then paste db-migrate.sql into Supabase → SQL Editor.");
    process.exit(1);
  }
  console.log("The direct connection accepted it, so your password is right: the pooler just hasn't caught up with it yet.\nMigrating over the direct connection instead.");
  viaDirect = true;
}
try {
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"
  );
  const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
  for (const file of migrationFiles()) {
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
if (viaDirect && !process.exitCode)
  console.log(
    "Done. The site connects through the pooler, which should catch up within a few minutes. If it still rejects\n" +
      "the password after that, contact Supabase support and tell them the direct connection works."
  );
