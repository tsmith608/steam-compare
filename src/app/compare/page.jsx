import { Suspense } from "react";
import ResultsPage from "@/components/results/ResultsPage";

export const metadata = {
  title: "Your comparison",
  description: "Every game your group owns, sorted by what you actually play.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <main id="main" className="min-h-[70vh]">
      <Suspense fallback={null}>
        <ResultsPage />
      </Suspense>
    </main>
  );
}
