"use client";

import Link from "next/link";
import { 
  ShieldAlert, 
  Award, 
  Brain, 
  Crosshair, 
  Layers, 
  TrendingUp,
  ArrowRight,
  ArrowDown
} from "lucide-react";

export default function MentorProgramPage() {
  const reviews = [
    { title: "Risk Management", icon: <ShieldAlert className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Trade Quality", icon: <Award className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Psychology", icon: <Brain className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Discipline", icon: <Crosshair className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Strategy Selection", icon: <Layers className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Consistency", icon: <TrendingUp className="w-8 h-8 text-[#6D4CFF]" /> },
  ];

  const steps = [
    { step: "Step 1", title: "Submit Trades", desc: "Share your journaled data securely." },
    { step: "Step 2", title: "Mentor Review", desc: "Expert analysis of your execution." },
    { step: "Step 3", title: "Feedback Report", desc: "Detailed breakdown of mistakes." },
    { step: "Step 4", title: "Improvement Plan", desc: "Actionable goals for next week." },
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
            Trade With <span className="text-[#6D4CFF]">Accountability</span>
          </h1>
          <p className="text-[18px] text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Get personalized reviews from experienced mentors and stop repeating the same costly mistakes.
          </p>
          <Link href="/mentor/landing" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#081329] hover:bg-[#111827] text-white font-black text-[18px] rounded-[16px] shadow-[0_20px_60px_rgba(8,19,41,0.25)] transition-all group">
            Apply For Mentorship <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* WHAT MENTORS REVIEW */}
      <section className="py-[96px] px-6 bg-white border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[48px] font-black tracking-tight leading-tight mb-12 text-[#081329] text-center">
            What Mentors Review
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-[#FAFAFC] p-[32px] rounded-[24px] border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="w-16 h-16 rounded-[16px] bg-white shadow-sm flex items-center justify-center mb-6">
                  {rev.icon}
                </div>
                <h3 className="text-[24px] font-black text-[#081329]">{rev.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-[96px] px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-[48px] font-black tracking-tight leading-tight mb-16 text-[#081329]">
            The Process
          </h2>
          
          <div className="flex flex-col items-center gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="w-full flex flex-col items-center">
                <div className="w-full bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#6D4CFF]/20 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6D4CFF] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                    {step.step}
                  </div>
                  <h3 className="text-[32px] font-black text-[#081329] leading-snug mb-2 mt-2">{step.title}</h3>
                  <p className="text-[18px] text-gray-500 font-medium">{step.desc}</p>
                </div>
                {idx !== steps.length - 1 && (
                  <ArrowDown className="w-8 h-8 text-gray-300 my-4" />
                )}
              </div>
            ))}
          </div>
          
        </div>
      </section>

    </div>
  );
}
