// Builds the weekly owner report (Discord markdown + raw numbers).
import { billingEvents, change, compareFailures, errorSummary, featureUsage, funnel, newAccounts, pct, stripeMrr, topSources } from "@/lib/metrics";
import { SITE_URL } from "@/lib/site";

export async function buildWeeklyReport() {
  const [now, before, sources, features, errors, failures, billing, accounts, mrr] = await Promise.all([
    funnel(7, 0),
    funnel(7, 7),
    topSources(7),
    featureUsage(7),
    errorSummary(24 * 7),
    compareFailures(7),
    billingEvents(7),
    newAccounts(7),
    stripeMrr().catch(() => null),
  ]);
  const get = (list, name) => list.find((s) => s.name === name)?.n || 0;
  const visits = get(now, "landing_viewed");
  const started = get(now, "comparison_started");
  const done = get(now, "comparison_succeeded");

  const anomalies = [];
  for (const step of now) {
    const prev = get(before, step.name);
    if (prev >= 20 && Math.abs(step.n - prev) / prev >= 0.4) anomalies.push(`${step.label}: ${change(step.n, prev)} week over week`);
  }
  if (started >= 20 && done / started < 0.6) anomalies.push(`Only ${pct(done, started)}% of started comparisons finished — check failures below.`);
  if (billing.payment_failed > 0) anomalies.push(`${billing.payment_failed} failed payment(s) — Stripe is retrying and emailing customers.`);

  const lines = [
    `**WeBothPlay — week ending ${new Date().toISOString().slice(0, 10)}**`,
    "",
    `**Funnel (7 days, vs previous week)**`,
    ...now.map((s) => `• ${s.label}: **${s.n}** (${change(s.n, get(before, s.name))})`),
    `• Visit → results: ${pct(done, visits)}% · started → results: ${pct(done, started)}%`,
    "",
    `**Revenue**`,
    mrr ? `• MRR **$${mrr.mrr.toFixed(2)}** · ${mrr.active} active · ${mrr.pastDue} past due` : "• MRR: Stripe not configured",
    `• New Premium: ${billing.checkout_succeeded} · cancellations: ${billing.subscription_canceled} · failed payments: ${billing.payment_failed}`,
    `• New accounts: ${accounts}`,
    "",
    `**Top sources**: ${sources.map((s) => `${s.source} ${s.visitors}`).join(" · ") || "no data"}`,
    `**Most used**: ${features.slice(0, 6).map((f) => `${f.name.replace(/_/g, " ")} ${f.n}`).join(" · ") || "no data"}`,
    failures.length ? `**Comparison failures**: ${failures.map((f) => `${f.code} ${f.n}`).join(" · ")}` : null,
    errors.length ? `**Errors**: ${errors.map((e) => `${e.name}/${e.source} ${e.n}`).join(" · ")}` : "**Errors**: none",
    "",
    anomalies.length ? `**Needs a look**\n${anomalies.map((a) => `• ${a}`).join("\n")}` : "**Needs a look**: nothing — enjoy your week.",
    "",
    `TikTok + Search Console aren't connected: log them in docs/retrofit/OWNER_OPERATIONS_GUIDE.md. Funnel: ${SITE_URL}/admin`,
  ].filter((l) => l !== null);
  return { text: lines.join("\n"), data: { now, before, sources, features, errors, failures, billing, accounts, mrr, anomalies } };
}
