import ToolLanding from "@/components/content/ToolLanding";

export const metadata = {
  title: "Co-op game finder for your Steam group",
  description: "See every co-op game your friends all own on Steam — online, couch and Remote Play — sorted by what you actually play.",
  alternates: { canonical: "/coop" },
};

export default function Page() {
  return (
    <ToolLanding
      path="/coop"
      eyebrow="Co-op finder"
      title="Every co-op game your group already owns."
      lede="Compare everyone's Steam libraries and filter straight to co-op — online, couch or Remote Play Together — using the store's own multiplayer tags."
      extraQuery="filter=coop"
      submitLabel="Find our co-op games"
      points={[
        ["Real store tags.", "Co-op, online co-op, split screen and Remote Play come from Steam's categories."],
        ["Who's played what.", "Each game shows every friend's hours, so you can tell a group favourite from a forgotten one."],
        ["One copy away.", "For three or more, see co-op games only one person is missing."],
      ]}
      faq={[
        ["Does it know player limits?", "No — Steam doesn't publish max player counts in its data, so check the store page for big groups."],
        ["What about Remote Play Together?", "Games tagged Remote Play Together let one owner host local multiplayer for friends who don't own it."],
        ["Is it free?", "Yes, for groups of up to 8."],
      ]}
      related={[["/guides/pick-a-game-with-friends", "Picking a game as a group"], ["/backlog", "Shared backlog"]]}
    />
  );
}
