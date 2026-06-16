"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Calendar as CalendarIcon, Bell, ChevronDown } from "lucide-react";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Trader");
  const [userRole, setUserRole] = useState("Pro Trader");

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (email) {
      fetch(`/api/user/me?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.name) {
            setUserName(data.name);
            // Format role or map it nicely
            if (data.role === "CLIENT") {
              setUserRole("Pro Trader");
            } else if (data.role === "MENTOR") {
              setUserRole("Professional Mentor");
            } else {
              setUserRole(data.role || "Pro Trader");
            }
          }
        })
        .catch((err) => console.error("Error loading user info in topbar:", err));
    }
  }, []);

  // Map path to Header Titles & Subtitles
  const getHeaderInfo = () => {
    if (pathname === "/dashboard") {
      return {
        title: `Good morning, ${userName}! 👋`,
        subtitle: "Here's how your trading journey looks today."
      };
    }
    if (pathname === "/dashboard/trade-journal/manual-add") {
      return {
        title: "Manual Add Trade",
        subtitle: "Trade Journal > Manual Add Trade"
      };
    }
    if (pathname === "/dashboard/trade-journal/broker-sync") {
      return {
        title: "Broker Sync",
        subtitle: "Connect your broker account and automatically import your trades."
      };
    }
    if (pathname.startsWith("/dashboard/trade-journal")) {
      return {
        title: "Trade Journal",
        subtitle: "Track every trade. Reflect. Improve."
      };
    }
    if (pathname.startsWith("/dashboard/market")) {
      return {
        title: "Market View",
        subtitle: "Live market snapshot, option chain, and technical setup scanner."
      };
    }
    if (pathname.startsWith("/dashboard/mistakes")) {
      return {
        title: "Mistake Tracker",
        subtitle: "Find repeated trading mistakes before they damage your capital."
      };
    }
    if (pathname.startsWith("/dashboard/mentorship") || pathname.startsWith("/dashboard/mentor-review")) {
      return {
        title: "Mentor Review",
        subtitle: "Share your best trades and get expert feedback."
      };
    }
    if (pathname.startsWith("/dashboard/reports")) {
      return {
        title: "Reports",
        subtitle: "Detailed reports to help you analyze and improve."
      };
    }
    if (pathname.startsWith("/dashboard/strategies")) {
      return {
        title: "Strategies Library",
        subtitle: "Analyze, compare, and refine your trading setup configurations."
      };
    }
    if (pathname.startsWith("/dashboard/tools")) {
      return {
        title: "Trading Tools",
        subtitle: "Position size calculator, margin tools, and mental logs."
      };
    }
    if (pathname.startsWith("/dashboard/goals")) {
      return {
        title: "Goals & Streaks",
        subtitle: "Set milestones, track performance metrics, and build discipline."
      };
    }
    if (pathname.startsWith("/dashboard/calendar")) {
      return {
        title: "Calendar",
        subtitle: "Plan your trading activities, review events and stay consistent."
      };
    }
    if (pathname.startsWith("/dashboard/settings")) {
      return {
        title: "Settings",
        subtitle: "Configure preferences, notification triggers, and API credentials."
      };
    }

    return {
      title: "Performance Workspace",
      subtitle: "Review verify snapshots and journal logs."
    };
  };

  const { title, subtitle } = getHeaderInfo();

  // Helper for user avatar initials
  const getInitials = (name: string) => {
    if (!name) return "T";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <header className="flex items-center justify-between pb-4 border-b border-[#EEF0F4] shrink-0 bg-transparent gap-4">
      
      {/* Page Title Header */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger toggle */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer shrink-0 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight truncate leading-tight">
            {title}
          </h1>
        </div>
        <p className="text-[11px] md:text-xs font-semibold text-[#6B7280] mt-1 truncate">
          {subtitle}
        </p>
      </div>

      {/* Topbar Actions Right */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date Dropdown card */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-[#EEF0F4] rounded-xl hover:border-slate-300 transition-colors shadow-[0_2px_8px_rgba(15,23,42,0.02)] cursor-pointer">
          <CalendarIcon size={14} className="text-[#6B7280]" />
          <span className="text-[11px] font-bold text-[#111827]">May 12 - May 18, 2024</span>
          <ChevronDown size={14} className="text-[#6B7280] ml-1" />
        </div>

        {/* Notifications Icon Button */}
        <button className="w-10 h-10 bg-white border border-[#EEF0F4] rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:border-slate-300 transition-all shadow-[0_2px_8px_rgba(15,23,42,0.02)] relative cursor-pointer">
          <Bell size={16} />
          {/* Notification Red dot indicator */}
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
        </button>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-[#EEF0F4] hidden xs:block" />

        {/* Profile Card details */}
        <div className="flex items-center gap-2.5">
          {/* Avatar Icon */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2563EB]/10 to-[#8B5CF6]/10 border border-[#EEF0F4] flex items-center justify-center text-[#2563EB] font-black text-xs shadow-sm shrink-0">
            {getInitials(userName)}
          </div>
          {/* Details name and role */}
          <div className="hidden xs:flex flex-col text-left">
            <span className="text-xs font-black text-[#111827] leading-none truncate max-w-[80px]">
              {userName}
            </span>
            <span className="text-[9px] font-bold text-[#6B7280] mt-1 leading-none">
              {userRole}
            </span>
          </div>
        </div>
      </div>

    </header>
  );
}
