"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInHref, useSession } from "@/components/SessionProvider";

// /dashboard sends signed-in users to their profile page.
export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (user) router.replace(`/${user.steamid}`);
  }, [user, router]);

  return (
    <main id="main" className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      {loading || user ? (
        <p className="text-ink-3" aria-live="polite">Opening your profile…</p>
      ) : (
        <div>
          <h1 className="display-wide text-display-sm">Your profile</h1>
          <p className="mt-3 text-ink-2">Sign in through Steam to see and customize your profile.</p>
          <a href={signInHref("/dashboard")} className="btn btn-steam mt-6">Sign in through Steam</a>
        </div>
      )}
    </main>
  );
}
