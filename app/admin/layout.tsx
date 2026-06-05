"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCheck, Shield, BookOpen, Clock, Settings, CreditCard, Activity 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Mentors", href: "/admin/mentors", icon: UserCheck },
    { label: "Client Allocation", href: "/admin/client-allocation", icon: Shield },
    { label: "Reviews", href: "/admin/reviews", icon: BookOpen },
    { label: "Sessions", href: "/admin/sessions", icon: Clock },
    { label: "Mentor Payouts", href: "/admin/mentor-payouts", icon: CreditCard },
    { label: "System Status", href: "/admin/status", icon: Activity },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#FAFAFF] text-[#0F172A] font-sans overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-[#0F172A] text-white flex flex-col h-full shadow-lg">
        <div className="h-[76px] px-6 flex items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-black text-xs shadow-md text-white">
              A
            </div>
            <span className="font-black tracking-tight text-white">Admin Control</span>
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
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-white" : "text-slate-400"} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#FAFAFF]">
        {children}
      </main>
    </div>
  );
}
