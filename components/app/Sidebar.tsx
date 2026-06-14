"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  AlertTriangle,
  UserCheck,
  BarChart2,
  Target,
  Wrench,
  Trophy,
  Calendar,
  Settings,
  Plus,
  RefreshCw
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export default function Sidebar({ onClose, className = "" }: SidebarProps) {
  const pathname = usePathname();

  const mainNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Market View", href: "/dashboard/market", icon: LineChart },
    { label: "Trade Journal", href: "/dashboard/trade-journal", icon: BookOpen },
    { label: "Add Trade", href: "/dashboard/trade-journal/manual-add", icon: Plus },
    { label: "Broker Sync", href: "/dashboard/trade-journal/broker-sync", icon: RefreshCw },
    { label: "Mistakes", href: "/dashboard/mistakes", icon: AlertTriangle },
    { label: "Mentor Review", href: "/dashboard/mentor-review", icon: UserCheck },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart2 },
    { label: "Strategies", href: "/dashboard/strategies", icon: Target },
    { label: "Tools", href: "/dashboard/tools", icon: Wrench },
  ];

  const subNavItems = [
    { label: "Goals", href: "/dashboard/goals", icon: Trophy },
    { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/dashboard/trade-journal") {
      return pathname === "/dashboard/trade-journal";
    }
    return pathname.startsWith(href);
  };

  const renderNavLinks = (items: typeof mainNavItems) => {
    return items.map((item) => {
      const active = isLinkActive(item.href);
      return (
        <Link
          key={item.label}
          href={item.href}
          onClick={onClose}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 ${
            active
              ? "bg-[#EFF6FF] text-[#2563EB] shadow-[0_2px_8px_rgba(37,99,235,0.04)]"
              : "text-[#6B7280] hover:bg-slate-50 hover:text-[#111827]"
          }`}
        >
          <item.icon
            size={18}
            className={`transition-colors duration-200 ${
              active ? "text-[#2563EB]" : "text-[#6B7280] group-hover:text-[#111827]"
            }`}
            strokeWidth={active ? 2.5 : 2}
          />
          <span>{item.label}</span>
        </Link>
      );
    });
  };

  return (
    <aside
      className={`w-[264px] flex-shrink-0 bg-white border-r border-[#EEF0F4] flex flex-col h-full shadow-[0_12px_30px_rgba(15,23,42,0.02)] ${className}`}
    >
      {/* Sidebar Header & Brand Logo */}
      <div className="p-6 pb-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Stylized Wings Logo representing T & A */}
          <div className="shrink-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transform group-hover:scale-105 transition-transform"
            >
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              {/* Stylized Left Wing */}
              <path
                d="M6 8L14 16L6 24V8Z"
                fill="url(#logoGrad)"
                fillOpacity="0.85"
              />
              {/* Stylized Right Wing */}
              <path
                d="M26 8L18 16L26 24V8Z"
                fill="url(#logoGrad)"
              />
              {/* Middle horizontal sync bar */}
              <path
                d="M10 16H22"
                stroke="url(#logoGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <span className="font-black text-base text-[#111827] tracking-wider block leading-none">
              TRADE ADHYAYAN
            </span>
            <span className="text-[10px] font-bold text-[#6B7280] tracking-wide block mt-1">
              Track. Learn. Improve.
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {renderNavLinks(mainNavItems)}

        {/* Separator spacing block */}
        <div className="h-4 my-2 border-t border-[#EEF0F4] opacity-50" />

        {renderNavLinks(subNavItems)}
      </nav>

      {/* Bottom Motivation Card */}
      <div className="p-5 mt-auto shrink-0">
        <div className="p-5 bg-gradient-to-br from-[#EFF6FF] via-[#F4F6FF] to-[#FAF5FF] rounded-[24px] border border-[#EEF0F4] relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.02)]">
          {/* Subtle purple-blue gradient circle blur */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="space-y-1">
              <p className="text-[13px] font-black text-[#111827] leading-snug">
                Consistency today,
              </p>
              <p className="text-[13px] font-black text-[#111827] leading-snug">
                freedom tomorrow.
              </p>
            </div>
            
            <p className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
              Keep going! 🚀
            </p>
          </div>

          {/* Inline SVG Plant Illustration placed at bottom right */}
          <div className="absolute right-3 bottom-0 opacity-80 pointer-events-none">
            <svg width="45" height="50" viewBox="0 0 45 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Pot */}
              <path d="M12 42C12 40 14 38 18 38H27C31 38 33 40 33 42L31 48H14L12 42Z" fill="#E2E8F0" />
              {/* Leaves */}
              <path d="M22.5 15C22.5 15 28 20 28 25C28 30 22.5 35 22.5 35C22.5 35 17 30 17 25C17 20 22.5 15 22.5 15Z" fill="#C7D2FE" />
              <path d="M15 10C15 10 20 12 21 18C22 24 16 28 16 28C16 28 11 25 11 20C11 15 15 10 15 10Z" fill="#A5B4FC" opacity="0.8" />
              <path d="M30 10C30 10 25 12 24 18C23 24 29 28 29 28C29 28 34 25 34 20C34 15 30 10 30 10Z" fill="#A5B4FC" opacity="0.8" />
              {/* Stem */}
              <path d="M22.5 34V38" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}
