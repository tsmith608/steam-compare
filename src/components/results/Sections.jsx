"use client";
import { useState } from "react";
import { Avatar } from "@/components/compare/PlayerDot";
import { Cover, hours } from "@/components/results/GameCard";
import { Icon } from "@/components/Icon";
import { formatPrice, supportsRemotePlay } from "@/lib/game-filters";
import { dealLinks, hasAffiliates } from "@/lib/deals";
import { steamStore } from "@/lib/site";
import { track } from "@/lib/track";

const short = (name) => name.replace(/^Demo · /, "");

function StoreLinks({ appid, name }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {dealLinks(appid, name).map((l) => (
        <a
          key={l.store}
          href={l.url}
          target="_blank"
          rel={l.sponsored ? "sponsored noopener noreferrer" : "noopener noreferrer"}
          onClick={() => track("deal_clicked", { store: l.store, sponsored: l.sponsored })}
          className="btn btn-ghost btn-sm"
        >
          {l.store} <Icon name="external" className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}

export function AffiliateNote() {
  if (!hasAffiliates()) return null;
  return <p className="text-xs text-ink-3">Some store links are affiliate links — buying through them may earn WeBothPlay a small commission at no extra cost to you.</p>;
}

export function BacklogNote() {
  return (
    <p className="rounded-lg border border-line bg-surface-1 px-4 py-3 text-sm text-ink-2">
      Games everyone owns where nobody has more than two hours. Heads-up: players who hide their playtime in Steam show as zero.
    </p>
  );
}

export function NearMissList({ items, profiles, meta }) {
  const [shown, setShown] = useState(24);
  const byId = Object.fromEntries(profiles.map((p) => [p.steamid, p]));
  if (!items.length) {
    return <p className="rounded-lg border border-dashed border-line-strong p-10 text-center text-ink-3">No near misses — when someone's missing a game the rest of you own, it shows up here.</p>;
  }
  return (
    <section aria-label="One copy away" className="space-y-4">
      <p className="text-ink-2">Everyone owns these except one person. One purchase and the whole group can play.</p>
      <ul className="space-y-2">
        {items.slice(0, shown).map((g) => {
          const who = byId[g.missing[0]];
          const m = meta[g.appid];
          const price = formatPrice(m?.price);
          return (
            <li key={g.appid} className="flex flex-col gap-3 rounded-lg border border-line bg-surface-1 p-3 sm:flex-row sm:items-center">
              <Cover appid={g.appid} name={g.name} className="h-[56px] w-[120px] shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-1">{g.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-3">
                  {who && (
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar src={who.avatar} name={who.username} index={who.index} size={18} /> {short(who.username)} is missing it
                    </span>
                  )}
                  <span>· {hours(g.ownersMinutes)} played by the rest</span>
                  {price && <span>· {m.price.discount ? `${price} (−${m.price.discount}%)` : price} on Steam</span>}
                  {m && supportsRemotePlay(m) && <span className="text-accent-hi">· Remote Play Together</span>}
                </p>
              </div>
              <StoreLinks appid={g.appid} name={g.name} />
            </li>
          );
        })}
      </ul>
      {shown < items.length && (
        <button type="button" className="btn btn-ghost" onClick={() => setShown((s) => s + 24)}>Show more</button>
      )}
      <AffiliateNote />
    </section>
  );
}

export function OnlyOwnsList({ unique, profiles }) {
  const [open, setOpen] = useState(profiles[0]?.steamid);
  const [limit, setLimit] = useState(30);
  const list = unique[open] || [];
  return (
    <section aria-label="Only one person owns" className="space-y-4">
      <p className="text-ink-2">Games only one of you owns — handy for gifting, or for Remote Play Together, where only the host needs a copy.</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a friend">
        {profiles.map((p) => (
          <button key={p.steamid} type="button" className="chip" aria-pressed={open === p.steamid} onClick={() => { setOpen(p.steamid); setLimit(30); }}>
            <Avatar src={p.avatar} name={p.username} index={p.index} size={20} />
            {short(p.username)} <span className="count">{(unique[p.steamid] || []).length}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-ink-3">Nothing unique here — everything they own, someone else owns too.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, limit).map((g) => (
            <li key={g.appid} className="flex items-center gap-3 rounded-lg border border-line bg-surface-1 p-2">
              <Cover appid={g.appid} name={g.name} className="h-[40px] w-[86px] shrink-0 rounded" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-1">{g.name}</p>
                <p className="text-xs text-ink-3">{hours(g.playtime_forever)} played</p>
              </div>
              <a href={steamStore(g.appid)} target="_blank" rel="noopener noreferrer" className="btn btn-quiet btn-sm !px-2" aria-label={`${g.name} on Steam`}>
                <Icon name="external" className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {limit < list.length && (
        <button type="button" className="btn btn-ghost" onClick={() => setLimit((l) => l + 60)}>Show more ({list.length - limit} left)</button>
      )}
    </section>
  );
}

export function WishlistPanel({ data, profiles }) {
  const byId = Object.fromEntries(profiles.map((p) => [p.steamid, p]));
  const gifts = profiles.flatMap((p) => (data.wishlistMatches?.[p.steamid] || []).map((m) => ({ ...m, wanter: p })));
  return (
    <section className="space-y-8">
      {data.sharedWishlist?.length > 0 && (
        <div>
          <h2 className="display text-xl">Everyone wants these</h2>
          <p className="mt-1 text-sm text-ink-3">On every wishlist in the group — a good one to buy together when it's on sale.</p>
          <ul className="mt-4 space-y-2">
            {data.sharedWishlist.map((g) => (
              <li key={g.appid} className="flex flex-col gap-3 rounded-lg border border-line bg-surface-1 p-3 sm:flex-row sm:items-center">
                <Cover appid={g.appid} name={g.name} className="h-[48px] w-[104px] shrink-0 rounded-md" />
                <p className="min-w-0 flex-1 truncate font-semibold">{g.name}</p>
                <StoreLinks appid={g.appid} name={g.name} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {gifts.length > 0 && (
        <div>
          <h2 className="display text-xl">Gift ideas</h2>
          <p className="mt-1 text-sm text-ink-3">Someone wants it, someone else in the group already owns it (and can vouch for it).</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {gifts.slice(0, 30).map((g) => (
              <li key={`${g.wanter.steamid}-${g.appid}`} className="flex items-center gap-3 rounded-lg border border-line bg-surface-1 p-2">
                <Cover appid={g.appid} name={g.name} className="h-[40px] w-[86px] shrink-0 rounded" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-1">{g.name}</p>
                  <p className="truncate text-xs text-ink-3">
                    {short(g.wanter.username)} wants it · {g.owners.map((o) => short(byId[o]?.username || "a friend")).join(", ")} owns it
                  </p>
                </div>
                <a href={steamStore(g.appid)} target="_blank" rel="noopener noreferrer" className="btn btn-quiet btn-sm">Gift on Steam</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <AffiliateNote />
    </section>
  );
}
