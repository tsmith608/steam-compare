import Link from "next/link";
import OverlapMark from "@/components/home/OverlapMark";

export const metadata = { title: "Not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="container-page relative grid min-h-[70vh] place-items-center overflow-hidden py-16 text-center">
      <OverlapMark className="pointer-events-none absolute left-1/2 top-1/2 w-[640px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-40" label={false} />
      <div className="relative">
        <p className="num text-stat font-bold text-accent-hi">404</p>
        <h1 className="display-wide mt-4 text-display-md">No overlap here.</h1>
        <p className="mt-3 text-ink-2">That page doesn't exist — but your group's shared games do.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Compare libraries</Link>
          <Link href="/help" className="btn btn-ghost">Help</Link>
        </div>
      </div>
    </main>
  );
}
