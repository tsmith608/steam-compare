import Link from "next/link";
import { getSessionSteamId } from "@/lib/session";
import { botComparisons, change, compareFailures, errorSummary, featureUsage, funnel, pct, stripeMrr, topSources } from "@/lib/metrics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Owner dashboard", robots: { index: false, follow: false } };

const admins = () => (process.env.ADMIN_STEAM_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);

function Tile({ label, value, delta, hero }) {
  return (
    <div className="rounded-lg border border-line bg-surface-1 p-4">
      <p className="text-sm text-ink-3">{label}</p>
      <p className={`mt-1 font-sans font-semibold text-ink-1 ${hero ? "text-5xl" : "text-3xl"}`}>{value}</p>
      {delta && <p className="mt-1 text-xs text-ink-3">{delta} vs previous 7 days</p>}
    </div>
  );
}

/** Single-series funnel: one hue, bars <= 24px, 4px rounded data-end, value at the tip, hover tooltip, table view. */
function FunnelChart({ steps }) {
  const top = Math.max(1, steps[0]?.n || 0, ...steps.map((s) => s.n));
  return (
    <figure>
      <figcaption className="sr-only">Funnel, last 7 days</figcaption>
      <ul className="space-y-3">
        {steps.map((s, i) => {
          const prev = i > 0 ? steps[i - 1].n : null;
          const w = Math.max(0.5, (s.n / top) * 100);
          return (
            <li key={s.name} className="grid grid-cols-1 items-center gap-1 sm:grid-cols-[13rem_1fr]">
              <span className="text-sm text-ink-2">{s.label}</span>
              <div className="group relative flex h-6 items-center" tabIndex={0} aria-label={`${s.label}: ${s.n}`}>
                <span className="block h-[18px] rounded-r-[4px]" style={{ width: `${w}%`, background: "var(--accent)" }} />
                <span className="ml-2 whitespace-nowrap text-sm text-ink-1">
                  {s.n.toLocaleString("en-US")}
                  {prev !== null && <span className="ml-2 text-ink-3">{pct(s.n, prev)}% of previous</span>}
                </span>
                <span className="pointer-events-none absolute -top-9 left-0 z-10 hidden whitespace-nowrap rounded-md border border-line-strong bg-surface-2 px-2.5 py-1.5 text-xs text-ink-1 shadow-lg group-hover:block group-focus:block">
                  {s.label}: {s.n.toLocaleString("en-US")} · {pct(s.n, steps[0].n)}% of visitors
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-ink-3">Show as table</summary>
        <table className="mt-3 w-full text-left">
          <thead className="text-ink-3"><tr><th className="py-1 font-medium">Step</th><th className="py-1 font-medium">Count</th><th className="py-1 font-medium">% of visitors</th></tr></thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.name} className="border-t border-line"><td className="py-1.5">{s.label}</td><td>{s.n}</td><td>{pct(s.n, steps[0].n)}%</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function SmallTable({ title, rows, cols }) {
  return (
    <section className="rounded-lg border border-line bg-surface-1 p-4">
      <h2 className="text-sm font-semibold text-ink-1">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-ink-3">No data yet.</p>
      ) : (
        <table className="mt-2 w-full text-left text-sm">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line first:border-0">
                {cols.map((c) => (
                  <td key={c} className={`py-1.5 ${c === cols[cols.length - 1] ? "text-right text-ink-1" : "text-ink-2"}`}>{String(r[c] ?? "").replace(/_/g, " ")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default async function AdminPage() {
  const steamid = await getSessionSteamId();
  if (!steamid || !admins().includes(steamid)) {
    return (
      <main id="main" className="container-page py-16">
        <h1 className="display-wide text-display-sm">Owner dashboard</h1>
        <p className="mt-3 text-ink-2">
          {steamid ? "This Steam account isn't on the owner list (ADMIN_STEAM_IDS)." : "Sign in through Steam with an owner account to view this page."}
        </p>
        {/* An API route that redirects to Steam, so a plain link (next/link would try to prefetch it). */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        {!steamid && <a href="/api/compare/auth/steam/start?next=/admin" className="btn btn-steam mt-6">Sign in through Steam</a>}
      </main>
    );
  }

  let data;
  try {
    const [now, before, sources, features, failures, errors, mrr, bot, botBefore] = await Promise.all([
      funnel(7, 0),
      funnel(7, 7),
      topSources(7, 10),
      featureUsage(7),
      compareFailures(7),
      errorSummary(24 * 7),
      stripeMrr().catch(() => null),
      botComparisons(7, 0),
      botComparisons(7, 7),
    ]);
    data = { now, before, sources, features, failures, errors, mrr, bot, botBefore };
  } catch (err) {
    return (
      <main id="main" className="container-page py-16">
        <h1 className="display-wide text-display-sm">Owner dashboard</h1>
        <p className="mt-3 text-ink-2">Couldn't read metrics: {err.message}. Run <code className="kbd">npm run db:migrate</code> against the production database.</p>
      </main>
    );
  }

  const get = (list, name) => list.find((s) => s.name === name)?.n || 0;
  return (
    <main id="main" className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Owner dashboard · last 7 days</p>
          <h1 className="display-wide mt-2 text-display-sm">Where people drop out</h1>
        </div>
        <Link href="/" className="btn btn-ghost btn-sm">Back to site</Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Tile hero label="Monthly recurring revenue" value={data.mrr ? `$${data.mrr.mrr.toFixed(2)}` : "—"} />
        <Tile label="Active subscriptions" value={data.mrr ? `${data.mrr.active}${data.mrr.pastDue ? ` (+${data.mrr.pastDue} past due)` : ""}` : "—"} />
        <Tile label="Website comparisons with results" value={get(data.now, "comparison_succeeded").toLocaleString("en-US")} delta={change(get(data.now, "comparison_succeeded"), get(data.before, "comparison_succeeded"))} />
        <Tile label="Visit → results" value={`${pct(get(data.now, "comparison_succeeded"), get(data.now, "landing_viewed"))}%`} />
        <Tile label="Discord bot comparisons" value={data.bot.toLocaleString("en-US")} delta={change(data.bot, data.botBefore)} />
      </div>

      <section className="mt-10 rounded-lg border border-line bg-surface-1 p-5">
        <h2 className="mb-5 text-sm font-semibold text-ink-1">Funnel</h2>
        <FunnelChart steps={data.now} />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SmallTable title="Top sources (unique visitors)" rows={data.sources} cols={["source", "visitors"]} />
        <SmallTable title="Feature usage" rows={data.features} cols={["name", "n"]} />
        <SmallTable title="Why comparisons failed" rows={data.failures} cols={["code", "n"]} />
        <SmallTable title="Errors" rows={data.errors} cols={["name", "source", "n"]} />
      </div>
      <p className="mt-8 text-xs text-ink-3">Queries: docs/retrofit/ANALYTICS.md. The same numbers go to Discord every Monday.</p>
    </main>
  );
}
