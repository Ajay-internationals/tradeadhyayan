import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, Clock, MapPin, Sparkles, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — Trade Adhyayan",
  description: "Get in touch with the Trade Adhyayan support team. We're here to help you with broker integration, account setups, and general questions.",
  alternates: {
    canonical: "https://trade-adhyayan-next.vercel.app/contact",
  },
};

export default function ContactPage() {
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
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
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
            <span className="text-sm font-bold text-violet-400">Get in Touch</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            We're Here to Help
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              Your Trading Journey
            </span>
          </h1>
          <p className="text-xl text-white/55 max-w-2xl mx-auto leading-relaxed font-medium">
            Have questions about broker setup, manual logging, custom strategies, or our mentorship programs? Drop us a message.
          </p>
        </div>
      </section>

      {/* ── CONTACT GRID ───────────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          
          {/* Details Card */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black mb-4">Contact Information</h2>
              <p className="text-white/50 text-base font-semibold">Our customer success team will resolve your query within 24 hours.</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-violet-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Email Support</h4>
                  <a href="mailto:support@tradeadhyayan.com" className="text-white/60 hover:text-white transition-colors font-semibold text-sm">
                    support@tradeadhyayan.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Phone Helpline</h4>
                  <p className="text-white/60 font-semibold text-sm">+91 73000 12345</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Support Hours</h4>
                  <p className="text-white/60 font-semibold text-sm">Monday – Saturday</p>
                  <p className="text-white/40 font-semibold text-xs mt-0.5">10:00 AM – 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] shadow-xl shadow-black/30">
            <h3 className="text-2xl font-black mb-6">Send Message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Name</label>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:border-violet-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:border-violet-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  rows={4}
                  placeholder="How can we help you?" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:border-violet-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
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
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <p className="text-xs text-white/30 font-semibold">© {new Date().getFullYear()} Trade Adhyayan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
