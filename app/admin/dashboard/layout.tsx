"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCheck, ShieldCheck, Crown, 
  MessageSquare, Calendar, Users2, IndianRupee, CreditCard, Settings, Activity, Plus
} from "lucide-react";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/dashboard/users", icon: Users },
    { name: "Mentors", href: "/admin/dashboard/mentors", icon: UserCheck },
    { name: "Client Allocation", href: "/admin/dashboard/allocation", icon: ShieldCheck },
    { name: "Mentorship Clients", href: "/admin/dashboard/clients", icon: Crown },
    { name: "Reviews", href: "/admin/dashboard/reviews", icon: MessageSquare },
    { name: "Sessions", href: "/admin/dashboard/sessions", icon: Calendar },
    { name: "Community", href: "/admin/dashboard/community", icon: Users2 },
    { name: "Mentor Payouts", href: "/admin/dashboard/payouts", icon: IndianRupee },
    { name: "Transactions", href: "/admin/dashboard/transactions", icon: CreditCard },
    { name: "Plans & Pricing", href: "/admin/dashboard/pricing", icon: Activity },
    { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
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
            <ShieldCheck size={12} />
            ADMIN ARENA
          </p>

          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                    isActive 
                      ? "bg-[#F1ECFF] text-[#6D3DF5]" 
                      : "text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
                  }`}
                >
                  <link.icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">
             <p className="text-[10px] font-bold text-[#6D3DF5] uppercase tracking-[0.1em] mb-4">Quick Actions</p>
             <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-bold text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors text-left">
                  <Plus size={18} className="text-[#6D3DF5]" />
                  Add Mentor
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-bold text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors text-left">
                  <UserCheck size={18} className="text-[#6D3DF5]" />
                  Allocate Clients
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-bold text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors text-left">
                  <Calendar size={18} className="text-[#6D3DF5]" />
                  Create Session
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-bold text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors text-left">
                  <MessageSquare size={18} className="text-[#6D3DF5]" />
                  Broadcast Message
                </button>
             </nav>
          </div>
        </div>

        <div className="p-6 border-t border-[#E7EAF3] bg-[#FAFAFF]">
           <div className="flex items-center gap-3 mb-1">
             <ShieldCheck size={18} className="text-[#16A34A]" />
             <span className="text-[13px] font-bold text-[#0F172A]">System Status</span>
           </div>
           <p className="text-[11px] font-medium text-[#64748B] pl-7">All Systems Operational</p>
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
