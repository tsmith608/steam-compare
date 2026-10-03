import Link from "next/link";
import { notFound } from "next/navigation";
import { getShare } from "@/lib/shares";
import { Avatar } from "@/components/compare/PlayerDot";
import { Icon } from "@/components/Icon";
import { funLine } from "@/lib/og";
import { steamHeader } from "@/lib/site";
import ShareViewTracker from "@/components/results/ShareViewTracker";

export const dynamic = "force-dynamic";

function title(s) {
  const names = s.players.map((p) => p.name);
  const who = names.length <= 2 ? names.join(" & ") : `${names[0]}, ${names[1]} & ${names.length - 2} more`;
  return `${who} own ${s.sharedCount} games in common`;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const share = await getShare(id).catch(() => null);
  if (!share) return { title: "Comparison not found", robots: { index: false } };
  const s = share.summary;
  return {
    title: title(s),
    description: funLine(s),
    robots: { index: false, follow: true },
    alternates: { canonical: `/s/${id}` },
    openGraph: { title: title(s), description: funLine(s), url: `/s/${id}` },
    twitter: { card: "summary_large_image", title: title(s), description: funLine(s) },
  };
}

export default async function SharePage({ params }) {
  const { id } = await params;
  const share = await getShare(id, { countView: true }).catch(() => null);
  if (!share) notFound();
  const s = share.summary;
  const openHref = `/compare?p=${share.steam_ids.join(",")}`;

  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <ShareViewTracker />
      <div className="mx-auto max-w-3xl">
        {s.demo && <p className="label mb-4">Example group</p>}
        <div className="flex -space-x-2">
          {s.players.map((p, i) => (
            <Avatar key={i} src={p.avatar} name={p.name} index={i} size={48} />
          ))}
        </div>
        <h1 className="display-wide mt-6 text-display-lg">
          <span className="text-accent-hi">{s.sharedCount.toLocaleString("en-US")}</span> games in common
        </h1>
        <p className="mt-3 text-body-lg text-ink-2">
          {s.players.map((p) => p.name).join(", ")} · {s.unionCount.toLocaleString("en-US")} games between them · {s.overlapPct}% overlap
        </p>
        <p className="mt-6 rounded-lg border border-line bg-surface-1 px-4 py-3 text-ink-1">{funLine(s)}</p>

        {s.top?.length > 0 && (
          <section className="mt-10" aria-label="Top shared games">
            <h2 className="label mb-3">What they play most</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {s.top.slice(0, 6).map((g) => (
                <li key={g.appid} className="overflow-hidden rounded-lg border border-line bg-surface-1">
                  <img src={steamHeader(g.appid)} alt="" width={460} height={215} loading="lazy" className="aspect-[460/215] w-full bg-surface-2 object-cover" />
                  <p className="truncate px-3 py-2 text-sm font-medium">{g.name}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={openHref} className="btn btn-primary btn-lg">
            Open the full comparison <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn btn-ghost btn-lg">Compare your own group</Link>
        </div>
        <p className="mt-4 text-xs text-ink-3">The full comparison is fetched live from Steam, so it reflects each library today.</p>
      </div>
    </main>
  );
}
