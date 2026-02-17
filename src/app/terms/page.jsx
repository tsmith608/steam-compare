import GoogleAdSense from "../components/GoogleAdSense";

export default function TermsPage() {
    return (
        <main className="min-h-screen w-full bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-light">Terms of Service</h1>
                <div className="space-y-4 text-gray-300 leading-relaxed text-sm">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-semibold text-white mt-6">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using "We Both Play" (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">2. User Accounts & Security</h2>
                    <p>
                        You are responsible for maintaining the security of your Steam account. We authenticate users via Steam OpenID and do not store your Steam password. You agree not to share your Premium account access with others.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">3. Premium Memberships</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><strong>Tiers:</strong> We offer various Premium tiers (e.g., Noob, Pro, Hacker) that unlock additional features such as unlimited library syncing, advanced filtering, and badge customization.</li>
                        <li><strong>Payments:</strong> All payments are processed securely via Ko-fi. We do not handle payment processing directly.</li>
                        <li><strong>Refunds:</strong> As our services are digital goods with immediate access, all sales are final. Exceptions may be made at our sole discretion for technical failures.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-white mt-6">4. User Conduct</h2>
                    <p>
                        When using our "User Collections" feature or other interactive parts of the Service, you agree not to:
                    </p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>Post content that is illegal, abusive, harassing, or hateful.</li>
                        <li>Attempt to scrape, overload, or disrupt our servers or APIs.</li>
                        <li>Reverse engineer or exploit any part of the Service.</li>
                    </ul>
                    <p className="mt-2">We reserve the right to terminate your access or ban your account if you violate these rules.</p>

                    <h2 className="text-xl font-semibold text-white mt-6">5. Disclaimers & Limitation of Liability</h2>
                    <p>
                        <strong>Not Affiliated with Valve:</strong> We are a third-party tool and are not affiliated with, endorsed by, or sponsored by Valve Corporation or Steam.
                        <br /><br />
                        <strong>"As Is" Service:</strong> The Service is provided on an "as is" and "as available" basis without warranties of any kind. We do not guarantee that the Service will be uninterrupted or error-free.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6">6. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
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
