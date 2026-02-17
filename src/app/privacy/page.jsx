import GoogleAdSense from "../components/GoogleAdSense";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen w-full bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-light">Privacy Policy</h1>
                <div className="space-y-4 text-gray-300 leading-relaxed text-sm">
                    <p>Last Updated: February 17, 2026</p>

                    <h2 className="text-xl font-semibold text-white mt-6">1. Data We Collect</h2>
                    <div className="space-y-2">
                        <p>We collect and process the following types of data:</p>
                        <ul className="list-disc ml-5 space-y-1">
                            <li><strong>Steam Account Data:</strong> When you sign in via Steam, we receive your publicly available Steam ID, Persona Name, Avatar, and Game Library information. We also fetch your public Friends List to facilitate the "Compare with Friends" feature.</li>
                            <li><strong>User-Generated Content:</strong> If you create "User Collections," we store the titles, descriptions, and lists of games associated with your Steam ID.</li>
                            <li><strong>Payment Information:</strong> For Premium upgrades, we process payments via Ko-fi. We store your specific Transaction ID, Payment Amount, Tier, Supporter Name, and Email Address to verify and maintain your membership status. We <strong>do not</strong> access or store your credit card or banking details directly.</li>
                            <li><strong>Technical Data:</strong> We use session cookies (e.g., `steam_nonce`) to secure your login and local storage to remember your preferences (like recently compared friends).</li>
                        </ul>
                    </div>

                    <h2 className="text-xl font-semibold text-white mt-6">2. How We Use Your Data</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><strong>Core Functionality:</strong> To generate compatibility reports, game roulettes, and multiplayer suggestions based on your Steam library.</li>
                        <li><strong>Account Management:</strong> To associate your Premium status and User Collections with your specific Steam account.</li>
                        <li><strong>Communication:</strong> Your email (from Ko-fi) is stored solely for transaction verification and support purposes. We do not use it for marketing newsletters unless explicitly opted-in elsewhere.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-white mt-6">3. Data Retention & Sharing</h2>
                    <p>
                        <strong>Retention:</strong> Your "User Collections" and Premium membership records are stored indefinitely in our secure database to provide these services. Steam Library data is cached temporarily for performance but is not permanently archived for historical tracking.
                        <br /><br />
                        <strong>Sharing:</strong> We do not sell your personal data. We share data only with necessary third-party service providers:
                    </p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><strong>Valve Corporation:</strong> For Steam OpenID authentication and public data retrieval.</li>
                        <li><strong>Ko-fi:</strong> For processing payments and verifying subscriptions.</li>
                        <li><strong>Google:</strong> For site analytics and serving advertisements (AdSense).</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-white mt-6">4. Third-Party Links & Ads</h2>
                    <p>
                        Our site contains links to third-party websites (e.g., Steam store, CDKeys). We are not responsible for the privacy practices or content of these external sites.
                        <br />
                        We use Google AdSense to display ads. Google may use cookies to serve ads based on your prior visits to our website or other websites on the internet.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">5. Your Rights</h2>
                    <p>
                        You have the right to request the deletion of your "User Collections" or account data stored on our servers. To do so, please contact us. Note that we cannot delete data held by Valve Corporation (Steam) or Ko-fi; you must contact them directly for their respective data.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">6. Contact</h2>
                    <p>
                        For privacy concerns, questions, or data deletion requests, please reach out via our <a href="https://discord.gg/uBUYgE75" className="text-blue-400 hover:underline">Discord server</a> or visit our <a href="/contact" className="text-blue-400 hover:underline">Contact page</a> to reach the site administrator directly.
                    </p>
                </div>

                {/* Bottom Ad Slot */}
                <div className="w-full max-w-xl mx-auto py-10 opacity-50 hover:opacity-100 transition-opacity">
                    <GoogleAdSense slot="8627342981" />
                </div>
            </div>
        </main>
    );
}
