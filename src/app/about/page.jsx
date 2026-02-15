export default function AboutPage() {
    return (
        <main className="min-h-screen w-full bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-light">About We Both Play</h1>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                    <p>
                        We Both Play was built to solve a simple problem: figuring out what games you and your friends can play together without scrolling through hundreds of library items manually.
                    </p>
                    <p>
                        Simply enter your Steam IDs, and we'll instantly compare your libraries to find common ground. Whether you're looking for a co-op adventure, a competitive shooter, or just checking out who owns what, we've got you covered.
                    </p>
                    <p>
                        This tool is built by gamers, for gamers. We respect your privacy and only use public Steam data to generate comparisons.
                    </p>
                </div>
            </div>
        </main>
    );
}
