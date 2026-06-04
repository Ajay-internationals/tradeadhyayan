"use client";

import Link from "next/link";
import { CheckCircle2, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const faqs = [
    { q: "Is the free trial really free?", a: "Yes, you get full access to the Pro features for 14 days without entering a credit card." },
    { q: "Can I connect multiple brokers?", a: "Yes, on the Pro and Mentorship plans, you can connect as many supported brokers as you want." },
    { q: "Is my trading data secure?", a: "Absolutely. We use bank-level encryption and we only require read-only access to your broker." },
    { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee on all our paid plans if you are not satisfied." },
    { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel your subscription from your dashboard at any time with one click." },
    { q: "What happens to my data if I cancel?", a: "Your data remains safe. You will be downgraded to the Free tier, which has limits on trade history visibility." },
    { q: "Do you support international brokers?", a: "Currently, we specialize in major Indian brokers, but international support is on our roadmap." },
    { q: "What is included in Mentorship?", a: "You get 1-on-1 monthly reviews, strategy feedback, and direct accountability sessions with experienced traders." },
    { q: "How does the mistake tracking work?", a: "You tag your trades with mistakes (or our AI flags them), and we generate reports showing exactly how much those mistakes cost you." },
    { q: "Is there a discount for annual billing?", a: "Yes, we offer two months free if you choose to pay annually instead of monthly." },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#081329] selection:bg-[#6D4CFF]/20 selection:text-[#6D4CFF] font-['Quicksand'] pb-[96px]">
      
      {/* Navbar Minimal */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#081329] text-white flex items-center justify-center font-black text-sm">TA</div>
            <span className="font-black text-xl tracking-tight">Trade Adhyayan</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block font-bold text-sm text-[#081329] hover:text-[#6D4CFF] transition-colors">Login</Link>
            <Link href="/signup" className="px-5 py-2.5 bg-[#6D4CFF] hover:bg-[#5b3ce0] text-white font-bold text-sm rounded-[16px] transition-all shadow-md">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-[96px] pb-[64px] px-6 text-center">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-tight mb-6 text-[#081329]">
            Simple Pricing For Serious Traders
          </h1>
          <p className="text-[18px] text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Start free and upgrade when you're ready to improve faster.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-[32px] px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-3 gap-[24px] items-center">
            
            {/* FREE */}
            <div className="bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 h-full flex flex-col">
              <h3 className="text-[32px] font-black text-[#081329] leading-snug mb-2">Free</h3>
              <div className="text-[48px] font-black text-[#081329] mb-8 leading-tight">₹0<span className="text-[18px] text-gray-400 font-bold">/forever</span></div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /> 30 Trades</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /> Manual Journal</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /> Basic Dashboard</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /> Basic Analytics</li>
              </ul>
              <Link href="/signup" className="block w-full py-4 bg-gray-100 hover:bg-gray-200 text-[#081329] font-black text-[18px] text-center rounded-[16px] transition-all">
                Get Started
              </Link>
            </div>

            {/* PRO (Highlighted) */}
            <div className="bg-[#081329] p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(109,76,255,0.4)] border-2 border-[#6D4CFF] h-full flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6D4CFF] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">Most Popular</div>
              <h3 className="text-[32px] font-black text-white leading-snug mb-2">Pro</h3>
              <div className="text-[48px] font-black text-white mb-8 leading-tight">₹499<span className="text-[18px] text-gray-400 font-bold">/month</span></div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-[18px] text-gray-300 font-medium"><CheckCircle2 className="w-5 h-5 text-[#6D4CFF] shrink-0" /> Unlimited Trades</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-300 font-medium"><CheckCircle2 className="w-5 h-5 text-[#6D4CFF] shrink-0" /> Broker Sync</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-300 font-medium"><CheckCircle2 className="w-5 h-5 text-[#6D4CFF] shrink-0" /> Advanced Analytics</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-300 font-medium"><CheckCircle2 className="w-5 h-5 text-[#6D4CFF] shrink-0" /> Reports & Goal Tracking</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-300 font-medium"><CheckCircle2 className="w-5 h-5 text-[#6D4CFF] shrink-0" /> Mistake Tracking</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-300 font-medium"><CheckCircle2 className="w-5 h-5 text-[#6D4CFF] shrink-0" /> Strategy Analysis</li>
              </ul>
              <Link href="/signup" className="block w-full py-4 bg-[#6D4CFF] hover:bg-[#5b3ce0] text-white font-black text-[18px] text-center rounded-[16px] transition-all shadow-[0_10px_20px_rgba(109,76,255,0.3)]">
                Start Free Trial
              </Link>
            </div>

            {/* MENTORSHIP */}
            <div className="bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 h-full flex flex-col">
              <h3 className="text-[32px] font-black text-[#081329] leading-snug mb-2">Mentorship</h3>
              <div className="text-[48px] font-black text-[#081329] mb-8 leading-tight">₹4999<span className="text-[18px] text-gray-400 font-bold">/month</span></div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-[18px] font-bold text-[#6D4CFF] mb-4">Everything in Pro, plus:</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-[#081329] shrink-0" /> Monthly Review</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-[#081329] shrink-0" /> Strategy Feedback</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-[#081329] shrink-0" /> Psychology Review</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-[#081329] shrink-0" /> Mentor Sessions</li>
                <li className="flex items-center gap-3 text-[18px] text-gray-600 font-medium"><CheckCircle2 className="w-5 h-5 text-[#081329] shrink-0" /> Accountability System</li>
              </ul>
              <Link href="/mentor/landing" className="block w-full py-4 bg-white border-2 border-[#081329] hover:bg-gray-50 text-[#081329] font-black text-[18px] text-center rounded-[16px] transition-all">
                Apply For Mentorship
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-[96px] px-6">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[48px] font-black tracking-tight leading-tight mb-12 text-[#081329] text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-[24px]">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100">
                <h4 className="text-[20px] font-black text-[#081329] mb-3 flex gap-3 items-start">
                  <HelpCircle className="w-6 h-6 text-[#6D4CFF] shrink-0 mt-0.5" />
                  {faq.q}
                </h4>
                <p className="text-[18px] text-gray-600 font-medium pl-9 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
