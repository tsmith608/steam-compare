"use client";
import { useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/track";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    track("client_error", { message: String(error?.message || "render error").slice(0, 80), page: "boundary" });
  }, [error]);
  return (
    <main id="main" className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <h1 className="display-wide text-display-md">Something broke on our side.</h1>
        <p className="mt-3 text-ink-2">It's been logged. Try again — it usually works the second time.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/" className="btn btn-ghost">Home</Link>
        </div>
      </div>
    </main>
  );
}
