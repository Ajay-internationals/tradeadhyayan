"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Contact,
  UserCheck,
  Award,
  ClipboardList,
  Video,
  MessageSquare,
  CreditCard,
  History,
  Tag,
  Settings,
  Plus,
  ArrowLeftRight,
  ShieldCheck,
  UserPlus,
  Volume2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Exclude login/landing pages (e.g. root /admin) from sidebar layout
  const isLoginPage = pathname === "/admin" || pathname === "/admin/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Mentors", href: "/admin/mentors", icon: Contact },
    { label: "Client Allocation", href: "/admin/client-allocation", icon: ArrowLeftRight },
    { label: "Mentorship Clients", href: "/admin/mentorship-clients", icon: Award },
    { label: "Reviews", href: "/admin/reviews", icon: ClipboardList },
    { label: "Sessions", href: "/admin/sessions", icon: Video },
    { label: "Community", href: "/admin/community", icon: MessageSquare },
    { label: "Mentor Payouts", href: "/admin/mentor-payouts", icon: CreditCard },
    { label: "Transactions", href: "/admin/transactions", icon: History },
    { label: "Plans & Pricing", href: "/admin/plans-pricing", icon: Tag },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleQuickAction = (action: string) => {
    toast.success(`${action} action triggered (Admin Arena)`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="w-[264px] bg-white border-r border-[#EEF0F4] flex flex-col h-full shrink-0 shadow-[0_12px_30px_rgba(15,23,42,0.02)] select-none">
        {/* Brand Logo & Header */}
        <div className="p-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradPurple" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6D3DF5" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
                <path d="M6 8L14 16L6 24V8Z" fill="url(#logoGradPurple)" fillOpacity="0.85" />
                <path d="M26 8L18 16L26 24V8Z" fill="url(#logoGradPurple)" />
                <path d="M10 16H22" stroke="url(#logoGradPurple)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span className="font-black text-base text-[#0F172A] tracking-wider block leading-none">
                Trade Adhyayan
              </span>
              <span className="inline-block bg-[#F1ECFF] text-[#6D3DF5] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px] mt-1.5 leading-none">
                Admin Arena
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-[12px] text-[13px] font-bold tracking-tight transition-all duration-200 ${
                  active
                    ? "bg-[#F1ECFF] text-[#6D3DF5] shadow-[0_2px_8px_rgba(109,61,245,0.04)]"
                    : "text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
                }`}
              >
                <item.icon
                  size={16}
                  className={`transition-colors duration-200 ${
                    active ? "text-[#6D3DF5]" : "text-[#64748B]"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions Panel */}
        <div className="px-5 py-4 border-t border-[#EEF0F4] shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] block mb-3 pl-1">
            Quick Actions
          </span>
          <div className="space-y-1.5">
            <button
              onClick={() => handleQuickAction("Add Mentor")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-dashed border-[#E9E6F5] transition-colors"
            >
              <Plus size={14} className="text-[#6D3DF5]" />
              <span>Add Mentor</span>
            </button>
            <button
              onClick={() => handleQuickAction("Allocate Clients")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-dashed border-[#E9E6F5] transition-colors"
            >
              <UserPlus size={14} className="text-[#6D3DF5]" />
              <span>Allocate Clients</span>
            </button>
            <button
              onClick={() => handleQuickAction("Create Session")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-dashed border-[#E9E6F5] transition-colors"
            >
              <Video size={14} className="text-[#6D3DF5]" />
              <span>Create Session</span>
            </button>
            <button
              onClick={() => handleQuickAction("Broadcast Message")}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 border border-dashed border-[#E9E6F5] transition-colors"
            >
              <Volume2 size={14} className="text-[#6D3DF5]" />
              <span>Broadcast Message</span>
            </button>
          </div>
        </div>

        {/* System Status Panel */}
        <div className="p-5 mt-auto shrink-0 pt-0">
          <div className="p-4 bg-[#F8FAFC] border border-[#EEF0F4] rounded-[20px] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-[#16A34A]" />
            </div>
            <div>
              <span className="text-[11px] font-black text-[#0F172A] block leading-tight">
                System Status
              </span>
              <span className="text-[10px] font-bold text-[#16A34A] block mt-0.5">
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

