import Link from "next/link";
import KofiButton from "./KofiButton";

export default function SiteFooter() {
    return (
        <footer className="w-full bg-[#0a0a0c] border-t border-white/5 py-12 mt-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">

                {/* Brand */}
                <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 justify-center md:justify-start">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        We Both Play
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                        The easiest way to find shared Steam games.
                    </p>
                </div>

                {/* Links - Placeholders for now */}
                <nav className="flex gap-8 text-sm text-gray-400 font-medium">
                    <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                </nav>

                {/* Copyright */}
                <div className="text-xs text-gray-600 font-mono">
                    &copy; {new Date().getFullYear()} We Both Play
                </div>
            </div>

            <KofiButton />
        </footer>
    );
}
