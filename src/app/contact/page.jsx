"use client";

import GoogleAdSense from "../components/GoogleAdSense";

export default function ContactPage() {
    return (
        <main className="min-h-screen w-full flex flex-col bg-black relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
            {/* Background radial gradient sync */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 opacity-70"
                style={{
                    background: "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(800px 400px at 20% 20%, rgba(147,197,253,0.12), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(99,102,241,0.12), transparent 60%)",
                }}
            />

            <div className="flex-grow w-full max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10 flex flex-col items-center">
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-5xl md:text-7xl font-extralight tracking-tight bg-gradient-to-b from-white via-white/80 to-white/50 bg-clip-text text-transparent">
                        Contact <span className="font-semibold block mt-2 text-blue-400">Us</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Have a question, feedback, or need support? We're here to help.
                    </p>
                </div>

                <div className="w-full max-w-2xl space-y-8 text-sm md:text-base">
                    <div className="glass-panel p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.6c1.1 0 2 .9 2 2z" /><path d="M16 5l-2 2 2 2" /><path d="M20 7l-2 2 2 2" /></svg>
                            </span>
                            Support Channels
                        </h2>
                        <div className="space-y-6 text-gray-300 leading-relaxed">
                            <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                                    Discord Community
                                </h3>
                                <p className="text-gray-400 mb-4 text-sm">Join our server for the fastest support, bug reporting, and feature suggestions.</p>
                                <a href="https://discord.gg/uBUYgE75" target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-sm font-medium transition-colors">
                                    Join Discord
                                </a>
                            </div>

                            <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    Email Support
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">For privacy inquiries or business matters, you can email us directly.</p>
                                <a href="mailto:trentonsmith608@gmail.com" className="text-blue-400 hover:underline font-medium">trentonsmith608@gmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-20 text-xs text-gray-500 uppercase tracking-widest mb-10">
                    <p>We Both Play is not affiliated with Valve Corporation.</p>
                </div>

                {/* Bottom Ad Slot */}
                <div className="w-full max-w-xl mx-auto py-10 opacity-50 hover:opacity-100 transition-opacity">
                    <GoogleAdSense slot="8627342981" />
                </div>
            </div>
        </main>
    );
}
