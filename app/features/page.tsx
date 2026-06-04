"use client";

import Link from "next/link";
import { 
  BookOpen, 
  RefreshCw, 
  LineChart, 
  AlertTriangle, 
  Target, 
  FileText, 
  Users,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      title: "Trade Journal",
      icon: <BookOpen className="w-8 h-8 text-[#6D4CFF]" />,
      items: ["Manual Trade Entry", "Excel Upload", "Trade Notes", "Screenshots", "Tags", "Trade Classification"]
    },
    {
      title: "Broker Sync",
      icon: <RefreshCw className="w-8 h-8 text-[#6D4CFF]" />,
      items: ["Zerodha", "Upstox", "Dhan", "Angel One", "Fyers", "Motilal Oswal"]
    },
    {
      title: "Performance Analytics",
      icon: <LineChart className="w-8 h-8 text-[#6D4CFF]" />,
      items: ["Win Rate", "P&L", "Profit Factor", "Risk Reward", "Drawdown", "Expectancy"]
    },
    {
      title: "Mistake Tracking",
      icon: <AlertTriangle className="w-8 h-8 text-[#6D4CFF]" />,
      items: ["Revenge Trading", "Overtrading", "FOMO", "Early Exit", "Rule Violations"]
    },
    {
      title: "Goals",
      icon: <Target className="w-8 h-8 text-[#6D4CFF]" />,
      items: ["Daily Goals", "Weekly Goals", "Monthly Goals"]
    },
    {
      title: "Reports",
      icon: <FileText className="w-8 h-8 text-[#6D4CFF]" />,
      items: ["Daily Reports", "Weekly Reports", "Monthly Reports", "Yearly Reports"]
    },
    {
      title: "Mentor Review",
      icon: <Users className="w-8 h-8 text-[#6D4CFF]" />,
      items: ["Trade Review", "Performance Feedback", "Discipline Tracking"]
    }
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
            Everything You Need To <br className="hidden md:block" />
            <span className="text-[#6D4CFF]">Become A Better Trader</span>
          </h1>
          <p className="text-[18px] text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            A complete trading improvement platform designed to help traders review performance, identify mistakes, build discipline, and improve consistency.
          </p>
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#6D4CFF] hover:bg-[#5b3ce0] text-white font-black text-[18px] rounded-[16px] shadow-[0_20px_60px_rgba(109,76,255,0.25)] transition-all group">
            Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-[96px] px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 transition-all hover:translate-y-[-4px]">
                <div className="w-16 h-16 rounded-[16px] bg-[#6D4CFF]/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-[32px] font-black text-[#081329] leading-snug mb-6">{feature.title}</h3>
                <ul className="space-y-4">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[18px] text-gray-600 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#6D4CFF] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
