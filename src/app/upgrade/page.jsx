import { Suspense } from "react";
import PricingClient from "@/components/pricing/PricingClient";
import { priceTable } from "@/lib/billing";

export const metadata = {
  title: "Premium",
  description: "WeBothPlay is free for most groups. Premium adds bigger groups, saved groups and Discord bot extras for $3.99/month.",
  alternates: { canonical: "/upgrade" },
};

export default function UpgradePage() {
  const prices = priceTable();
  const annualAvailable = !!(prices.Pro.year && prices.Hacker.year);
  const configured = !!(process.env.STRIPE_SECRET_KEY && prices.Pro.month);
  return (
    <main id="main">
      <Suspense fallback={null}>
        <PricingClient annualAvailable={annualAvailable} configured={configured} />
      </Suspense>
    </main>
  );
}
