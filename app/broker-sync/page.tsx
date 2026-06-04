"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Key,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function BrokerSyncPage() {
  const brokers = [
    { name: "Zerodha", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { name: "Upstox", color: "bg-purple-50 text-purple-600 border-purple-100" },
    { name: "Angel One", color: "bg-orange-50 text-orange-600 border-orange-100" },
    { name: "Dhan", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { name: "Fyers", color: "bg-sky-50 text-sky-600 border-sky-100" },
    { name: "Motilal Oswal", color: "bg-red-50 text-red-600 border-red-100" },
  ];

  const steps = [
    "Connect Broker",
    "Verify Account",
    "Import Trade History",
    "Analyze Performance"
  ];

  const security = [
    { title: "Encrypted Data", icon: <Lock className="w-6 h-6 text-[#6D4CFF]" /> },
    { title: "Read Only Access", icon: <Eye className="w-6 h-6 text-[#6D4CFF]" /> },
    { title: "No Trading Permissions", icon: <ShieldCheck className="w-6 h-6 text-[#6D4CFF]" /> },
    { title: "Secure Authentication", icon: <Key className="w-6 h-6 text-[#6D4CFF]" /> },
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
            Connect Your Broker <span className="text-[#6D4CFF]">In Minutes</span>
          </h1>
          <p className="text-[18px] text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Automatically import trades without manual entries. Spend less time logging and more time analyzing.
          </p>
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#6D4CFF] hover:bg-[#5b3ce0] text-white font-black text-[18px] rounded-[16px] shadow-[0_20px_60px_rgba(109,76,255,0.25)] transition-all group">
            Start Syncing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* SUPPORTED BROKERS */}
      <section className="py-[64px] px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[24px]">
            {brokers.map((broker, idx) => (
              <div key={idx} className={`p-[32px] rounded-[24px] border ${broker.color} flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm`}>
                <h3 className="text-[24px] font-black">{broker.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-[96px] px-6 bg-[#081329] text-white my-[64px]">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[48px] font-black tracking-tight leading-tight mb-16 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-[24px] relative">
            <div className="hidden md:block absolute top-[40px] left-0 w-full h-1 bg-white/10 -z-10"></div>
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-[80px] h-[80px] rounded-full bg-[#6D4CFF] flex items-center justify-center text-[32px] font-black shadow-[0_10px_30px_rgba(109,76,255,0.5)] mb-6 border-4 border-[#081329]">
                  {idx + 1}
                </div>
                <h4 className="text-[24px] font-bold">{step}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="py-[64px] px-6">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-[48px] font-black tracking-tight leading-tight mb-12 text-[#081329]">
            Bank-Level Security
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {security.map((sec, idx) => (
              <div key={idx} className="bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-[16px] bg-[#6D4CFF]/10 flex items-center justify-center mb-6">
                  {sec.icon}
                </div>
                <h3 className="text-[20px] font-black text-[#081329]">{sec.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
