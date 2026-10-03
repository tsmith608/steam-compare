import ClaimClient from "@/components/pricing/ClaimClient";

export const metadata = { title: "Claim a Ko-fi membership", robots: { index: false } };

export default function ClaimPage() {
  return (
    <main id="main">
      <ClaimClient />
    </main>
  );
}
