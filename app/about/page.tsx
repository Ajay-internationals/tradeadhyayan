"use client";

import Link from "next/link";
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  ShieldCheck
} from "lucide-react";

export default function AboutPage() {
  const values = [
    { title: "Discipline", desc: "We believe discipline is the only true edge in the market.", icon: <Target className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Consistency", desc: "Small, consistent actions lead to massive long-term results.", icon: <TrendingUp className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Continuous Learning", desc: "Every trade is a lesson, whether it hits stop loss or target.", icon: <BookOpen className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Accountability", desc: "Taking full responsibility for your actions is the first step to growth.", icon: <ShieldCheck className="w-8 h-8 text-[#6D4CFF]" /> },
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
          <span className="text-[#6D4CFF] font-bold tracking-wider uppercase text-sm mb-4 block">Our Mission</span>
          <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-tight mb-6 text-[#081329]">
            Help traders learn from their own data <br className="hidden md:block" />
            <span className="text-[#6D4CFF]">instead of repeating mistakes.</span>
          </h1>
        </div>
      </section>

      {/* VISION & STORY */}
      <section className="py-[64px] px-6">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-[96px] items-center">
          <div>
            <h2 className="text-[32px] md:text-[48px] font-black tracking-tight leading-tight mb-6 text-[#081329]">
              India's First Trading Improvement Platform
            </h2>
            <p className="text-[18px] text-gray-600 leading-relaxed font-medium mb-6">
              Trade Adhyayan was born out of frustration. After years of trading, we realized that the single biggest difference between profitable traders and losing traders isn't the strategy they use—it's their ability to follow rules.
            </p>
            <p className="text-[18px] text-gray-600 leading-relaxed font-medium">
              We built this platform to give retail traders the same level of analytical rigor and accountability that institutional desks demand from their prop traders.
            </p>
          </div>
          <div className="bg-[#081329] rounded-[24px] p-[32px] shadow-[0_20px_60px_rgba(8,19,41,0.2)] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D4CFF]/20 blur-[80px] rounded-full pointer-events-none"></div>
            <h3 className="text-[32px] font-black mb-6 relative z-10">The Gap</h3>
            <p className="text-[18px] text-gray-300 leading-relaxed font-medium relative z-10 italic">
              "Most traders spend 90% of their time looking for a new setup, and 10% of their time reviewing their own execution. We want to flip that ratio."
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-[96px] px-6">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-[48px] font-black tracking-tight leading-tight mb-12 text-[#081329]">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 gap-[24px]">
            {values.map((val, idx) => (
              <div key={idx} className="bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 flex gap-6 text-left items-start">
                <div className="w-16 h-16 rounded-[16px] bg-[#6D4CFF]/10 flex items-center justify-center shrink-0">
                  {val.icon}
                </div>
                <div>
                  <h3 className="text-[24px] font-black text-[#081329] mb-2">{val.title}</h3>
                  <p className="text-[18px] text-gray-600 font-medium leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
