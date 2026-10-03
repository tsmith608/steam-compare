import ToolLanding from "@/components/content/ToolLanding";

export const metadata = {
  title: "Shared backlog finder — games your group owns but never played",
  description: "Find the Steam games everyone in your group owns and nobody has really played. Your next game night might already be paid for.",
  alternates: { canonical: "/backlog" },
};

export default function Page() {
  return (
    <ToolLanding
      path="/backlog"
      eyebrow="Shared backlog"
      title="You already own your next game night."
      lede="Bundles, sales and freebies add up. This finds the games every one of you owns where nobody has more than two hours — the shared pile of shame."
      extraQuery="view=backlog"
      submitLabel="Find our backlog"
      points={[
        ["Everyone owns it.", "Only games in every library count, so you can start tonight."],
        ["Nobody's really played it.", "Two hours or less for every player — beyond a quick look."],
        ["Sorted least-played first.", "Then filter to co-op or spin to pick one."],
      ]}
      faq={[
        ["Why do some played games show up?", "If a friend keeps their playtime private in Steam, their hours read as zero, so those games can look unplayed."],
        ["Does it include free games?", "Free-to-play games only appear in a Steam library after they've been launched, so they rarely show up here."],
        ["How many friends can I add?", "Up to 8 for free, and up to 16 when someone in the group has Premium."],
      ]}
      related={[["/guides/compare-steam-libraries", "Compare Steam libraries"], ["/roulette", "Group roulette"]]}
    />
  );
}
