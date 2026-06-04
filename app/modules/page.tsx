"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  BookOpen, 
  LineChart, 
  AlertTriangle, 
  Target, 
  FileText, 
  Layers, 
  Users, 
  RefreshCw 
} from "lucide-react";

export default function ModulesPage() {
  const modules = [
    { title: "Dashboard", desc: "Track performance at a glance.", icon: <LayoutDashboard className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Trade Journal", desc: "Capture every trade.", icon: <BookOpen className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Analytics", desc: "Understand performance.", icon: <LineChart className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Mistakes", desc: "Find recurring errors.", icon: <AlertTriangle className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Goals", desc: "Build consistency.", icon: <Target className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Reports", desc: "Generate detailed reviews.", icon: <FileText className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Strategies", desc: "Measure setup performance.", icon: <Layers className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Mentor Review", desc: "Receive expert feedback.", icon: <Users className="w-8 h-8 text-[#6D4CFF]" /> },
    { title: "Broker Sync", desc: "Automate trade imports.", icon: <RefreshCw className="w-8 h-8 text-[#6D4CFF]" /> },
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
            Explore Every Module Inside <br className="hidden md:block" />
            <span className="text-[#6D4CFF]">Trade Adhyayan</span>
          </h1>
        </div>
      </section>

      {/* MODULES GRID */}
      <section className="py-[32px] px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-3 gap-[24px]">
            {modules.map((mod, idx) => (
              <div key={idx} className="bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_60px_rgba(109,76,255,0.15)] cursor-pointer">
                <div className="w-16 h-16 rounded-[16px] bg-[#6D4CFF]/10 flex items-center justify-center mb-6">
                  {mod.icon}
                </div>
                <h3 className="text-[32px] font-black text-[#081329] leading-snug mb-3">{mod.title}</h3>
                <p className="text-[18px] text-gray-500 font-medium leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
