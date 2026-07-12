import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Users, Award, ShieldCheck, Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Trade Adhyayan",
  description: "Learn more about our mission to help retail traders build discipline, track performance metrics, and gain confidence.",
  alternates: {
    canonical: "https://trade-adhyayan-next.vercel.app/about",
  },
};

export default function AboutPage() {
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
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-violet-400">Our Mission</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Empowering Traders to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              Build Discipline & Consistency
            </span>
          </h1>
          <p className="text-xl text-white/55 max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
            We believe that consistent trading is a result of structural review and tracking. Trade Adhyayan was created to bridge the gap between emotional trading and analytical decision-making.
          </p>
        </div>
      </section>

      {/* ── STORY/MISSION SECTION ──────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-8 text-center">Who We Are</h2>
          <div className="space-y-6 text-white/70 text-lg leading-relaxed font-medium">
            <p>
              Trade Adhyayan is a specialized performance analytics ecosystem designed by traders, for traders in India. We recognized early on that retail traders rarely fail due to a lack of strategies; they fail due to lack of risk controls and emotional pattern awareness.
            </p>
            <p>
              By offering automated broker imports, visual equity graphs, mistake tracking modules, and personalized trading statistics, we help traders understand their true numbers.
            </p>
            <p>
              We do not provide tips, recommendations, or advisory services. We are fully committed to self-directed education, giving you the software suite to inspect your own parameters with integrity.
            </p>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-14">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all text-center">
              <Award className="w-10 h-10 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">Transparency</h3>
              <p className="text-white/50 text-sm font-semibold leading-relaxed">No hidden fees, no claims of guaranteed profits. We offer analytics software and nothing more.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">Data Integrity</h3>
              <p className="text-white/50 text-sm font-semibold leading-relaxed">Your data is fully encrypted and private. We use AES-256 standard encryption keys.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all text-center">
              <Heart className="w-10 h-10 text-rose-400 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">Trader Success</h3>
              <p className="text-white/50 text-sm font-semibold leading-relaxed">We measure our performance based on your growth in discipline and consistency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEBI DISCLAIMER ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <h3 className="text-lg font-black mb-3 text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-400" /> SEBI Compliance & Policy Notice
          </h3>
          <p className="text-sm text-white/50 leading-relaxed font-semibold">
            Trade Adhyayan operates strictly as an educational utility platform and self-analysis trade logging system. We do not provide tips, trading suggestions, stock advisories, research papers, or options trading signals. We strongly advice studying proper risk management methods before trading in index futures & options.
          </p>
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
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-white/30 font-semibold">© {new Date().getFullYear()} Trade Adhyayan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
