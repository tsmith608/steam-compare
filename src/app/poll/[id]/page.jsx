import { notFound } from "next/navigation";
import { getPoll } from "@/lib/shares";
import PollVote from "@/components/results/PollVote";
import ShareViewTracker from "@/components/results/ShareViewTracker";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const poll = await getPoll(id).catch(() => null);
  if (!poll) return { title: "Vote not found", robots: { index: false } };
  const names = poll.options.map((o) => o.name);
  return {
    title: "Vote: what are we playing tonight?",
    description: `${names.slice(0, 3).join(", ")}${names.length > 3 ? "…" : ""} — tap the ones you'd play. One veto each.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/poll/${id}` },
  };
}

export default async function PollPage({ params }) {
  const { id } = await params;
  const poll = await getPoll(id).catch(() => null);
  if (!poll) notFound();
  return (
    <main id="main" className="container-page py-10 sm:py-14">
      <ShareViewTracker />
      <PollVote id={id} initialOptions={poll.options} />
    </main>
  );
}
