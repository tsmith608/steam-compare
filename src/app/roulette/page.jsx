import ToolLanding from "@/components/content/ToolLanding";

export const metadata = {
  title: "Steam game roulette for groups",
  description: "Spin a random game that everyone in your group already owns on Steam. Filter to co-op first, then let the roulette decide.",
  alternates: { canonical: "/roulette" },
};

export default function Page() {
  return (
    <ToolLanding
      path="/roulette"
      eyebrow="Group roulette"
      title="Can't decide? Spin a game you all own."
      lede="Most random game pickers spin your own library. This one only lands on games every person in your group already owns — so nobody has to buy anything."
      extraQuery="spin=1"
      submitLabel="Compare and spin"
      points={[
        ["Only shared games.", "The wheel is built from the overlap of everyone's Steam libraries."],
        ["Filter first.", "Narrow to co-op, PvP, couch or games nobody's played, then spin."],
        ["Fair by design.", "Prefer a vote? Shortlist a few and send a link — one veto each."],
      ]}
      faq={[
        ["Is the roulette random?", "Yes. Each spin picks uniformly from the games currently shown, so apply filters first if you want co-op only."],
        ["Can it skip single-player games?", "Yes — games Steam marks as single-player only are hidden from the shared list by default."],
        ["Does everyone need an account?", "No. Paste profile links or custom URL names. Each person's Steam game details just need to be public."],
      ]}
      related={[["/guides/pick-a-game-with-friends", "How to pick a game with friends"], ["/coop", "Co-op finder"]]}
    />
  );
}
