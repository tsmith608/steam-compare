export default function TermsPage() {
    return (
        <main className="min-h-screen w-full bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-light">Terms of Service</h1>
                <div className="space-y-4 text-gray-300 leading-relaxed text-sm">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-semibold text-white mt-6">1. Acceptance of Terms</h2>
                    <p>
                        By accessing We Both Play, you agree to be bound by these Terms of Service.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">2. Usage</h2>
                    <p>
                        You agree to use this tool for personal, non-commercial purposes. You must not abuse the Steam API or our internal APIs via automated scraping.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">3. Disclaimers</h2>
                    <p>
                        We are not affiliated with Valve Corporation or Steam. All game images and trademarks are property of their respective owners.
                        <br />
                        Affiliate links are provided for convenience; we are not responsible for transactions on third-party sites.
                    </p>
                </div>
            </div>
        </main>
    );
}
