"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Star,
  Clock,
  TrendingUp,
  Brain,
  ShieldAlert,
} from "lucide-react";
import { initiateCashfreePayment } from "@/lib/payment-client";
import toast from "react-hot-toast";

// ─── DATA ────────────────────────────────────────────────────────────────────
const plans = [
  {
    id: "free",
    name: "Free",
    tagline: "Perfect for new traders exploring trade journaling.",
    price: "₹0",
    period: "Forever",
    cta: "Start Free",
    ctaHref: "/signup",
    highlight: false,
    badge: null,
    color: "border-white/10",
    btnClass: "bg-white/5 hover:bg-white/10 border border-white/10 text-white",
    features: [
      { text: "Up to 30 Trades", included: true },
      { text: "Manual Trade Entry", included: true },
      { text: "Dashboard Overview", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Trade Notes", included: true },
      { text: "Performance Calendar", included: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Everything you need to review, analyse, and improve your trading.",
    price: "₹499",
    period: "Month",
    cta: "Get Pro",
    ctaHref: null, // handled by JS
    highlight: true,
    badge: "Most Popular",
    color: "border-violet-500/40",
    btnClass: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25",
    features: [
      { text: "Unlimited Trades", included: true },
      { text: "Broker Integration", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Strategy Performance", included: true },
      { text: "Mistake Tracking", included: true },
      { text: "Goals & Discipline", included: true },
      { text: "Trade Reports", included: true },
      { text: "Trade Screenshots", included: true },
      { text: "Excel Import & Export", included: true },
      { text: "Priority Support", included: true },
    ],
  },
  {
    id: "mentor",
    name: "Mentor",
    tagline: "Designed for traders who want expert guidance and accountability.",
    price: "₹4,999",
    period: "Month",
    cta: "Get Mentor Plan",
    ctaHref: null, // handled by JS
    highlight: false,
    badge: null,
    color: "border-amber-500/30",
    btnClass: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25",
    features: [
      { text: "Personal Mentor", included: true },
      { text: "Monthly Trade Reviews", included: true },
      { text: "Performance Audit", included: true },
      { text: "Risk Management Review", included: true },
      { text: "Trading Psychology Sessions", included: true },
      { text: "Improvement Roadmap", included: true },
      { text: "Priority Support", included: true },
    ],
  },
];

const comparisons = [
  { feature: "Manual Trade Journal", free: "✓", pro: "✓", mentor: "✓" },
  { feature: "Dashboard", free: "✓", pro: "✓", mentor: "✓" },
  { feature: "Trade Notes", free: "✓", pro: "✓", mentor: "✓" },
  { feature: "Performance Analytics", free: "Basic", pro: "Advanced", mentor: "Advanced" },
  { feature: "Broker Integration", free: "—", pro: "✓", mentor: "✓" },
  { feature: "Unlimited Trades", free: "—", pro: "✓", mentor: "✓" },
  { feature: "Strategy Analysis", free: "—", pro: "✓", mentor: "✓" },
  { feature: "Mistake Tracking", free: "—", pro: "✓", mentor: "✓" },
  { feature: "Goals & Discipline", free: "—", pro: "✓", mentor: "✓" },
  { feature: "Reports", free: "—", pro: "✓", mentor: "✓" },
  { feature: "Excel Import", free: "—", pro: "✓", mentor: "✓" },
  { feature: "Mentor Review", free: "—", pro: "—", mentor: "✓" },
  { feature: "Monthly Performance Audit", free: "—", pro: "—", mentor: "✓" },
  { feature: "Trading Psychology Guidance", free: "—", pro: "—", mentor: "✓" },
  { feature: "Priority Support", free: "—", pro: "✓", mentor: "✓" },
];

const faqs = [
  {
    q: "Can I change my plan anytime?",
    a: "Yes. Upgrade, downgrade, or cancel your subscription whenever you want.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Our Free plan is permanent — no credit card required, no time limit. You can explore and log up to 30 trades completely free.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "UPI, Credit & Debit Cards, Net Banking, and major digital wallets via Cashfree.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes. There are no long-term commitments.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. Your trading data is encrypted and securely stored.",
  },
  {
    q: "Do you provide trading tips or recommendations?",
    a: "No. Trade Adhyayan is a trading journal and performance analytics platform. We do not provide investment advice or stock recommendations.",
  },
];

const whyUpgrade = [
  {
    title: "Save Time",
    desc: "Automatically import and organise your trades instead of maintaining spreadsheets.",
    icon: Clock,
  },
  {
    title: "Discover Patterns",
    desc: "See which strategies, setups, and habits consistently produce results.",
    icon: TrendingUp,
  },
  {
    title: "Improve Discipline",
    desc: "Track mistakes, follow your trading plan, and measure your consistency.",
    icon: Brain,
  },
  {
    title: "Grow with Confidence",
    desc: "Make decisions backed by your own trading data—not assumptions.",
    icon: ShieldAlert,
  },
];

// ─── FAQ ACCORDION ─────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
      >
        <span className="font-bold text-white/85 text-sm leading-snug">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-white/55 font-medium leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    setUserEmail(email);
  }, []);

  async function handlePlanCTA(planId: "pro" | "mentor") {
    if (!userEmail) {
      // Not logged in — redirect to signup with plan hint
      router.push(`/signup?plan=${planId}`);
      return;
    }
    setPaying(planId);
    try {
      await initiateCashfreePayment({ planId, email: userEmail });
    } finally {
      setPaying(null);
    }
  }

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
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
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
              Get Started →
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
            <span className="text-sm font-bold text-violet-400">Simple & Transparent Pricing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Choose the Right Plan
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              for Your Trading Journey
            </span>
          </h1>
          <p className="text-xl text-white/55 max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
            Whether you&apos;re just getting started or actively reviewing your trades every day, there&apos;s a plan designed to help you improve with confidence.
          </p>
        </div>
      </section>

      {/* ── PRICING CARDS ──────────────────────────────────────────────────── */}
      <section className="py-10 px-6" id="plans">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                id={`plan-${plan.id}`}
                className={`relative p-8 rounded-3xl border transition-all flex flex-col justify-between ${
                  plan.highlight
                    ? "bg-gradient-to-b from-violet-900/40 to-purple-900/30 border-violet-500/40 shadow-2xl shadow-violet-500/10 scale-[1.03]"
                    : "bg-white/[0.03] " + plan.color
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="mb-7">
                    <h2 className="text-2xl font-black text-white mb-1">{plan.name}</h2>
                    <p className="text-white/50 text-sm font-semibold">{plan.tagline}</p>
                  </div>

                  <div className="mb-8">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-white/40 font-semibold ml-2">/ {plan.period}</span>
                  </div>

                  {/* CTA Button */}
                  {plan.id === "free" ? (
                    <Link
                      href="/signup"
                      id="cta-free"
                      className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 mb-8 ${plan.btnClass}`}
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      id={`cta-${plan.id}`}
                      type="button"
                      onClick={() => handlePlanCTA(plan.id as "pro" | "mentor")}
                      disabled={paying === plan.id}
                      className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 mb-8 cursor-pointer disabled:opacity-60 disabled:cursor-wait ${plan.btnClass}`}
                    >
                      {paying === plan.id ? "Processing…" : plan.cta}
                    </button>
                  )}

                  <ul className="space-y-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-semibold leading-snug text-white/75">
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY UPGRADE ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-14 tracking-tight">
            Why Upgrade to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              Pro or Mentor?
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUpgrade.map((item) => (
              <div
                key={item.title}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:bg-white/[0.06] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-black text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white/[0.015]" id="compare">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-14 tracking-tight">
            Compare Plans
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-6 py-4 font-black text-white/70 w-1/2">Feature</th>
                  <th className="text-center px-6 py-4 font-black text-white/70">Free</th>
                  <th className="text-center px-6 py-4 font-black text-violet-400">Pro</th>
                  <th className="text-center px-6 py-4 font-black text-amber-400">Mentor</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`}>
                    <td className="px-6 py-3.5 font-semibold text-white/70">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center text-white/50 font-semibold">{row.free}</td>
                    <td className="px-6 py-3.5 text-center text-violet-300 font-semibold">{row.pro}</td>
                    <td className="px-6 py-3.5 text-center text-amber-300 font-semibold">{row.mentor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-14 tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Star className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-bold text-violet-400">Trusted by 100+ active traders</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Ready to Trade{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              Smarter?
            </span>
          </h2>
          <p className="text-white/55 text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">
            Join traders who have improved their performance by journaling, reviewing, and learning from every trade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black rounded-xl text-sm shadow-xl shadow-violet-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold rounded-xl text-sm transition-all"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs font-semibold">
          <span>© 2025 Trade Adhyayan. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
