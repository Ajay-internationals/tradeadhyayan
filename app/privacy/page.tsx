import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Clock, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Trade Adhyayan",
  description: "Read our privacy guidelines, cookie practices, encryption protocols, and user data options.",
  alternates: {
    canonical: "https://trade-adhyayan-next.vercel.app/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#060918] text-white overflow-x-hidden font-sans">
      
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060918]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: "72px" }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/30">
              TA
            </div>
            <span className="font-black text-xl tracking-tight text-white">Trade Adhyayan</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-semibold text-white/60 hover:text-white transition-colors px-4 py-2">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5"
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-violet-400">Data Guidelines</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Privacy Policy
          </h1>
          <div className="inline-flex items-center gap-2 text-white/50 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Last Updated: July 2026
          </div>
        </div>
      </section>

      {/* ── PRIVACY CONTENT ────────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-12 text-white/70 leading-relaxed font-semibold">
          
          <div>
            <h2 className="text-2xl font-black text-white mb-4">1. Information Collection</h2>
            <p>
              We collect information that you directly provide to us, such as your name, email address, password, profile settings, and manual trade logs. We also store read-only broker API tokens if you explicitly authorize broker synchronization.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">2. Broker Sync Security</h2>
            <p>
              When you connect broker accounts, we only requests read-only permissions (accessing historical trade logs, transaction history, and contract notes). We cannot transfer funds, execute orders, or access your broker login credentials.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">3. Data Usage</h2>
            <p>
              Your personal data and trade details are used strictly to populate your performance dashboard, calculate statistics (expectancy, win rate, profit factor), detect behavioral mistakes, and generate custom performance calendars. We never sell your data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">4. Security Standards</h2>
            <p>
              We enforce strong security layers to protect your private records. Data transmission between your browser and our servers is encrypted using industry-standard TLS protocols.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">5. Cookies & Analytics</h2>
            <p>
              We use functional cookies to manage your login sessions and remember preference configurations. We also run basic anonymized analytics to measure interface performance and latency.
            </p>
          </div>

        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/30">
              TA
            </div>
            <span className="font-black text-xl tracking-tight text-white">Trade Adhyayan</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-white/30 font-semibold">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-xs text-white/30 font-semibold">© {new Date().getFullYear()} Trade Adhyayan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
