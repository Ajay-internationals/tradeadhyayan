"use client";

import Link from "next/link";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Link2, 
  Upload, 
  User, 
  CheckCircle, 
  BookOpen, 
  Lightbulb, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden selection:bg-[#7C4DFF]/30 selection:text-white">
      {/* Header / Nav */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-[#7C4DFF] to-[#E94B8A] rounded-xl text-white shadow-lg shadow-[#7C4DFF]/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-lg tracking-tight uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Trade Adhyayan
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-xs font-bold uppercase text-slate-300 hover:text-white transition-colors tracking-wider"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-[#7C4DFF] hover:bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#7C4DFF]/15 cursor-pointer"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 max-w-7xl mx-auto px-6 text-center">
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#7C4DFF]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-10 left-1/3 w-[300px] h-[300px] bg-[#E94B8A]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-6 max-w-4xl mx-auto relative z-10">
          <span className="px-3.5 py-1.5 bg-[#7C4DFF]/10 border border-[#7C4DFF]/30 text-[#7C4DFF] text-[10px] font-black uppercase tracking-wider rounded-full inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#7C4DFF] rounded-full animate-pulse" />
            Rule-Based Trading Analytics
          </span>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-slate-100">
            Fix Emotional Mistakes.<br />
            <span className="bg-gradient-to-r from-[#7C4DFF] via-indigo-400 to-[#E94B8A] bg-clip-text text-transparent">
              Elevate Your Trading.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 font-semibold max-w-2xl mx-auto leading-relaxed">
            The ultimate rule-based trading journal for Indian markets. Automate your calculations, scan options and stocks, and let the <strong>Mistake Detection Engine</strong> find your discipline lapses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#7C4DFF] to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#7C4DFF]/25"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700/80 text-white font-bold border border-slate-700/50 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Dashboard Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-20 bg-slate-950 border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black uppercase text-[#7C4DFF] tracking-wider">Features</h2>
            <h3 className="text-2xl md:text-3xl font-black text-slate-100">Engineered for Disciplined Execution</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[24px] space-y-4 hover:border-slate-750 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-[#E94B8A]/10 rounded-xl text-[#E94B8A] w-fit group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Mistake Detection Engine</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Automatically scans trades for 11 core emotional patterns. Instantly flags revenge trading, overtrading, early exits, and poor risk-to-reward ratios.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[24px] space-y-4 hover:border-slate-750 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-[#7C4DFF]/10 rounded-xl text-[#7C4DFF] w-fit group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Automatic Analytics</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Say goodbye to manually managing excel sheets. Generates win rates, gross/net P&L, averages, and streak metrics on-the-fly from actual trade records.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[24px] space-y-4 hover:border-slate-750 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-[#15B77A] w-fit group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Broker Sync & Manual Upload</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Connect and sync from Zerodha, Upstox, and AngelOne connection logs. You can also import CSV reports or paste trade lists manually.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-slate-850 py-16 bg-slate-950 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#7C4DFF]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 space-y-6 relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-100">Ready to build your discipline?</h2>
          <p className="text-xs md:text-sm text-slate-400 font-semibold max-w-lg mx-auto">
            Join other Indian traders who journal daily, track their mistakes, and execute with absolute clarity.
          </p>
          <div className="pt-4">
            <Link 
              href="/signup" 
              className="px-8 py-3.5 bg-gradient-to-r from-[#7C4DFF] to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-[#7C4DFF]/25"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-[10px] text-slate-600 font-bold pt-8">
            © 2026 Trade Adhyayan. Engineered for Indian Markets. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}