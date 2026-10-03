"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/SessionProvider";
import { Icon } from "@/components/Icon";
import { BOT_INSTALL_URL } from "@/lib/site";

// Stripe's webhook usually lands within seconds; poll until the plan shows up.
export default function SuccessClient() {
  const { refresh } = useSession();
  const [user, setUser] = useState(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    let alive = true;
    let n = 0;
    const tick = async () => {
      const u = await refresh();
      if (!alive) return;
      setUser(u);
      setTries(++n);
      if (!u?.isPremium && n < 15) setTimeout(tick, 2000);
    };
    tick();
    return () => {
      alive = false;
    };
  }, [refresh]);

  const ready = user?.isPremium;
  return (
    <div className="container-page py-16">
      <div className="surface-raised mx-auto max-w-xl p-8 text-center sm:p-10">
        <Icon name={ready ? "check" : "clock"} className={`mx-auto h-10 w-10 ${ready ? "text-success" : "text-amber-hi"}`} />
        <h1 className="display-wide mt-5 text-display-sm">{ready ? `You're ${user.tier}. Thank you.` : "Payment received — activating…"}</h1>
        <p className="mt-3 text-ink-2" aria-live="polite">
          {ready
            ? "Bigger groups, saved groups and the full Discord bot are unlocked. A receipt is on its way to your email."
            : tries >= 15
              ? "This is taking longer than usual. Your payment is safe — Premium will appear within a few minutes. If it doesn't, contact us and we'll fix it."
              : "This usually takes a few seconds."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Compare a big group</Link>
          <a href={BOT_INSTALL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><Icon name="discord" className="h-4 w-4" /> Add the bot</a>
        </div>
      </div>
    </div>
  );
}
