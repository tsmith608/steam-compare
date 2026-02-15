export default function PrivacyPage() {
    return (
        <main className="min-h-screen w-full bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-light">Privacy Policy</h1>
                <div className="space-y-4 text-gray-300 leading-relaxed text-sm">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-semibold text-white mt-6">1. Data We Collect</h2>
                    <p>
                        We exclusively process public Steam ID information that you voluntarily provide. This includes:
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>Steam profile names and avatars</li>
                            <li>Public game library data (playtime, game ownership)</li>
                        </ul>
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">2. How We Use Data</h2>
                    <p>
                        This data is used solely to generate the comparison view for your session. We do not store your Steam library data permanently on our servers.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">3. Third-Party Services</h2>
                    <p>
                        We use Google AdSense/AdMob to display advertisements. These services may use cookies to serve ads based on your prior visits to this website or other websites.
                        <br />
                        We participate in affiliate programs (such as CDKeys/Impact Radius) and may earn a commission if you purchase through our links.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">4. Contact</h2>
                    <p>
                        For privacy concerns, please reach out via our GitHub repository or contact the site administrator.
                    </p>
                </div>
            </div>
        </main>
    );
}
