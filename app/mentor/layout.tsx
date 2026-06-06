"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, Clock, MessageSquare, Calendar, Users2, 
  User, Settings, Activity, Crown
} from "lucide-react";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
    { name: "My Traders", href: "/mentor/traders", icon: Users },
    { name: "Review Queue", href: "/mentor/queue", icon: Clock, badge: 8 },
    { name: "Reviews", href: "/mentor/reviews", icon: MessageSquare },
    { name: "Sessions", href: "/mentor/sessions", icon: Calendar },
    { name: "Community", href: "/mentor/community", icon: Users2 },
    { name: "Profile", href: "/mentor/profile", icon: User },
    { name: "Settings", href: "/mentor/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAFAFF] font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-[#E7EAF3] flex flex-col h-screen sticky top-0">
        
        {/* Logo Area */}
        <div className="h-[76px] flex items-center px-6 border-b border-[#E7EAF3]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-[#6D3DF5] to-[#4A1D96] flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-black text-[15px] text-[#0F172A] tracking-tight">Trade</span>
              <br/>
              <span className="font-black text-[15px] text-[#0F172A] tracking-tight">Adhyayan</span>
            </div>
          </Link>
        </div>

        <div className="px-6 py-6 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-[#6D3DF5] uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
            <Crown size={12} />
            MENTOR ARENA
          </p>

          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                    isActive 
                      ? "bg-[#F1ECFF] text-[#6D3DF5]" 
                      : "text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.icon size={18} />
                    {link.name}
                  </div>
                  {link.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-[#6D3DF5] text-white' : 'bg-[#F1ECFF] text-[#6D3DF5]'}`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-[#E7EAF3] bg-[#FAFAFF] flex flex-col items-center">
           <p className="text-[11px] font-bold text-[#0F172A] mb-1">Mentor Plan</p>
           <h4 className="text-[16px] font-black text-[#16A34A] mb-1">Active</h4>
           <p className="text-[10px] font-medium text-[#64748B] mb-4">Valid till 30 June 2025</p>
           
           <button className="w-full flex items-center justify-center gap-2 bg-[#F1ECFF] text-[#6D3DF5] py-2 rounded-full text-[11px] font-bold hover:bg-[#E4DEFF] transition-colors">
              <Crown size={14} />
              View Plan Details
           </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E7EAF3; border-radius: 4px; }
      `}} />
    </div>
  );
}
