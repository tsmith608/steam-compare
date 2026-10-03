#!/usr/bin/env node
// Fails if any tracked file contains something that looks like a credential.
// Runs in CI (and with `npm run check:secrets`) so a pasted connection string
// or API key can't reach the public repository again. Secrets belong in
// .env.local (ignored by git) and in Vercel's environment variables.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const PATTERNS = [
  ["Postgres URL with a password", /postgres(?:ql)?:\/\/[^\s:@/'"`]+:[^\s@'"`]{6,}@[^\s'"`]+/],
  ["Stripe secret key", /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/],
  ["Stripe webhook secret", /\bwhsec_[A-Za-z0-9]{16,}/],
  ["Discord bot token", /\b[MNO][A-Za-z\d_-]{23,25}\.[A-Za-z\d_-]{6}\.[A-Za-z\d_-]{27,}/],
  ["Discord webhook URL", /discord(?:app)?\.com\/api\/webhooks\/\d{6,}\/[A-Za-z0-9_-]{20,}/],
  // Steam keys are 32 uppercase hex characters, often pasted as a fallback:
  // process.env.STEAM_API_KEY || "…" or ?key=… in a URL.
  ["Steam Web API key", /(?:['"`][A-F0-9]{32}['"`]|[?&]key=[A-F0-9]{32}\b)/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["Private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

// Local placeholders used in docs and tests are fine.
const ALLOWED = [/postgres:postgres@localhost/, /postgresql:\/\/postgres:postgres@/, /postgresql:\/\/user:password@/];
const SKIP = [/^package-lock\.json$/, /\.(png|jpe?g|gif|webp|mp4|woff2?|ttf|ico|zip)$/i];

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const hits = [];
for (const file of files) {
  if (SKIP.some((re) => re.test(file)) || !fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (text.includes("\0")) continue; // binary
  text.split("\n").forEach((line, i) => {
    for (const [label, re] of PATTERNS) {
      const m = line.match(re);
      if (m && !ALLOWED.some((ok) => ok.test(m[0]))) hits.push(`${file}:${i + 1}  ${label}`);
    }
  });
}

if (hits.length) {
  console.error("Possible secrets in tracked files (move them to environment variables):\n" + hits.map((h) => `  ${h}`).join("\n"));
  process.exit(1);
}
console.log(`No secrets found in ${files.length} tracked files.`);
