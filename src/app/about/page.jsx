import Link from "next/link";
import PageHeader from "@/components/content/PageHeader";

export const metadata = {
  title: "About",
  description: "WeBothPlay is an independent tool for figuring out what you and your friends can play together on Steam.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main" className="container-page py-12 sm:py-16">
      <PageHeader eyebrow="About" title="Built to end the “what do we play” argument." />
      <div className="prose-wbp mt-10">
        <p>
          WeBothPlay was built to solve a simple but frustrating problem: figuring out what you and your friends can play together without manually
          scrolling through hundreds of games in each other's libraries.
        </p>
        <p>
          Whether you're after a co-op campaign for the weekend, a competitive game to grind, or proof that someone really does own that one niche
          indie game, WeBothPlay shows you the overlap in seconds — then helps you actually decide, with filters, a roulette and group votes.
        </p>
        <h2>How we treat your data</h2>
        <p>
          We only use public Steam data, fetched through Steam's official Web API when you compare. We don't store your library, we never ask for your
          password, and we don't sell data. The <Link href="/privacy">privacy page</Link> spells out exactly what we keep.
        </p>
        <h2>Independent</h2>
        <p>
          WeBothPlay is a small independent project, made by gamers for gamers. It's free for most groups and funded by people who choose{" "}
          <Link href="/upgrade">Premium</Link>. It isn't affiliated with Valve.
        </p>
      </div>
      <Link href="/" className="btn btn-primary btn-lg mt-10">Start comparing</Link>
    </main>
  );
}
