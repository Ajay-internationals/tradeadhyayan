"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  LineChart, 
  BookOpen, 
  PlusCircle, 
  RefreshCw, 
  AlertTriangle, 
  UserCheck, 
  BarChart2, 
  Crosshair, 
  Wrench, 
  Target, 
  Calendar, 
  Settings,
  Video
} from "lucide-react";

export default function TradeJournalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Market View", href: "/dashboard/market", icon: LineChart },
    { label: "Trade Journal", href: "/dashboard/trade-journal", icon: BookOpen },
    { label: "Add Trade", href: "/dashboard/trade-journal/manual-add", icon: PlusCircle },
    { label: "Broker Sync", href: "/dashboard/trade-journal/broker-sync", icon: RefreshCw },
    { label: "Mistakes", href: "/dashboard/mistakes", icon: AlertTriangle },
    { label: "Mentorship", href: "/dashboard/mentorship", icon: UserCheck },
    { label: "Sessions", href: "/dashboard/sessions", icon: Video },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart2 },
    { label: "Strategies", href: "/dashboard/strategies", icon: Crosshair },
    { label: "Tools", href: "/dashboard/tools", icon: Wrench },
    { label: "Goals", href: "/dashboard/goals", icon: Target },
    { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#FAFBFF] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[250px] flex-shrink-0 bg-white border-r border-[#E9E6F5] flex flex-col h-full shadow-[0px_8px_24px_rgba(15,23,42,0.02)]">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              TA
            </div>
            <span className="font-black text-slate-900 tracking-tight">Trade Adhyayan</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.label === "Trade Journal" && pathname === "/dashboard/trade-journal");
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-[14px] text-[13px] font-bold transition-all ${
                  isActive 
                    ? "bg-[#F4F0FF] text-[#7C3AED]" 
                    : "text-[#64748B] hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-[#7C3AED]" : "text-[#64748B]"} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Motivation Card */}
        <div className="p-4">
          <div className="p-5 bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] rounded-[20px] text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <p className="text-xs font-semibold leading-relaxed mb-4 relative z-10">
              Every trade is a lesson. Track it well, grow consistently.
            </p>
            <Link 
              href="/dashboard/trade-journal/manual-add" 
              className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-purple-100 hover:text-white transition-colors relative z-10"
            >
              Keep journaling <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#FAFBFF]">
        {children}
      </main>
    </div>
  );
}
