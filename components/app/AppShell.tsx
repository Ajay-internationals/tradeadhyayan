"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { X } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-[#F7F8FC] text-[#111827] font-sans overflow-hidden">
      
      {/* Sidebar: Desktop View (pinned left) */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Sidebar: Drawer Slide-Over */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in bg-black/40 backdrop-blur-sm">
          {/* Slide panel */}
          <div className="relative flex flex-col w-[264px] h-full bg-white shadow-2xl animate-scale-up">
            {/* Close button inside mobile menu */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Render full Sidebar inside mobile container */}
            <Sidebar onClose={() => setMobileMenuOpen(false)} className="border-r-0 h-full" />
          </div>

          {/* Tap-out backdrop dismiss overlay */}
          <div className="flex-1 cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area Right */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Scrollable Container wrapper */}
        <div className="flex-1 overflow-y-auto px-6 py-6 lg:p-[28px]">
          {/* Centered Content Frame with Max Width 1440px */}
          <div className="max-w-[1440px] mx-auto flex flex-col h-full space-y-[24px]">
            {/* Topbar layout */}
            <Topbar onMenuToggle={() => setMobileMenuOpen(true)} />

            {/* Child content area */}
            <div className="flex-1 min-h-0 bg-transparent">
              {children}
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}
