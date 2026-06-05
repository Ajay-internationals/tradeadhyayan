"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, Clock, CheckSquare, Calendar, MessagesSquare, Settings, UserCircle 
} from "lucide-react";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarItems = [
    { label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
    { label: "My Traders", href: "/mentor/my-traders", icon: Users },
    { label: "Review Queue", href: "/mentor/review-queue", icon: Clock },
    { label: "Completed Reviews", href: "/mentor/reviews", icon: CheckSquare },
    { label: "Sessions", href: "/mentor/sessions", icon: Calendar },
    { label: "Community", href: "/mentor/community", icon: MessagesSquare },
    { label: "Profile", href: "/mentor/profile", icon: UserCircle },
    { label: "Settings", href: "/mentor/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#FAFAFF] text-slate-800 font-sans overflow-hidden">
      {/* Mentor Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-white border-r border-[#E7EAF3] flex flex-col h-full shadow-sm">
        <div className="h-[76px] px-6 flex items-center border-b border-[#E7EAF3]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6D3DF5] flex items-center justify-center text-white font-black text-xs shadow-md">
              M
            </div>
            <span className="font-black text-[#0F172A] tracking-tight">Mentor Portal</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[13px] font-bold transition-all ${
                  isActive 
                    ? "bg-[#F1ECFF] text-[#6D3DF5]" 
                    : "text-[#64748B] hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-[#6D3DF5]" : "text-[#64748B]"} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-[#E7EAF3]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Mentor User</p>
              <p className="text-xs text-[#64748B]">Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#FAFAFF]">
        {children}
      </main>
    </div>
  );
}
