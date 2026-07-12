import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, Clock, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Trade Adhyayan",
  description: "Read our terms of service, platform rules, SEBI disclaimers, and user agreements.",
  alternates: {
    canonical: "https://trade-adhyayan-next.vercel.app/terms",
  },
};

export default function TermsPage() {
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
            <span className="text-sm font-bold text-violet-400">Legal Agreement</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Terms & Conditions
          </h1>
          <div className="inline-flex items-center gap-2 text-white/50 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Last Updated: July 2026
          </div>
        </div>
      </section>

      {/* ── TERMS CONTENT ──────────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-12 text-white/70 leading-relaxed font-semibold">
          
          <div>
            <h2 className="text-2xl font-black text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using Trade Adhyayan, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, you are prohibited from using the platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">2. Account Responsibility</h2>
            <p>
              To access most features, you must register for an account. You are responsible for safeguarding your credentials and for all activities that occur under your account. Ensure that you provide accurate email information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">3. Broker Integration</h2>
            <p>
              Trade Adhyayan provides read-only integrations with compatible Indian brokers (e.g., Zerodha, Upstox, Fyers). We do not place orders, initiate trades, or access your funds. All API tokens and credentials are processed strictly in accordance with read-only limits.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">4. Compliance & Advisory Disclaimer</h2>
            <p>
              Trade Adhyayan is exclusively a performance tracking, data analytics, and educational logging utility.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60 font-medium">
              <li>We do not offer buy or sell recommendations.</li>
              <li>We do not offer SEBI-registered advisory, financial planning, or tips services.</li>
              <li>No material on this platform should be construed as investment advice.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">5. Subscription & Refunds</h2>
            <p>
              We offer free trials and subscription plans. All billing transactions are handled securely. Downgrades and cancellations take effect at the end of the billing period. We provide a 7-day money-back refund guarantee.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Trade Adhyayan shall not be liable for any financial losses, trading losses, system outages, or data inaccuracies arising out of your use of the service.
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-white/30 font-semibold">© {new Date().getFullYear()} Trade Adhyayan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
