"use"
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-4"
          : "bg-white/50 backdrop-blur-md py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-purple rounded-2xl flex items-center justify-center shadow-xl shadow-brand-purple/20">
            <span className="text-white font-black text-2xl tracking-tighter">TA</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl leading-none tracking-tight text-slate-900">
              Trade Adhyayan
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
              Track. Review. Improve.
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/#features"
            className="text-sm font-bold flex items-center gap-1 transition-colors hover:text-brand-purple text-[#0F172A]"
          >
            Features
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Link>
          <Link
            href="/#modules"
            className="text-sm font-bold flex items-center gap-1 transition-colors hover:text-brand-purple text-[#0F172A]"
          >
            Modules
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-bold flex items-center gap-1 transition-colors hover:text-brand-purple text-[#0F172A]"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className="text-sm font-bold flex items-center gap-1 transition-colors hover:text-brand-purple text-[#0F172A]"
          >
            Resources
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Link>
          <Link
            href="/about"
            className="text-sm font-bold flex items-center gap-1 transition-colors hover:text-brand-purple text-[#0F172A]"
          >
            About Us
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-gradient-to-r from-[#6C3BFF] to-[#5B2EFF] text-white rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-purple/20 flex items-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-800 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-lg animate-fadeIn">
          <Link
            href="/#features"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold text-slate-800 hover:text-brand-purple"
          >
            Features
          </Link>
          <Link
            href="/#modules"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold text-slate-800 hover:text-brand-purple"
          >
            Modules
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold text-slate-800 hover:text-brand-purple"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold text-slate-800 hover:text-brand-purple"
          >
            Resources
          </Link>
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold text-slate-800 hover:text-brand-purple"
          >
            About Us
          </Link>
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 text-center text-sm font-bold text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 text-center text-sm font-bold text-white bg-brand-purple rounded-xl shadow-lg shadow-brand-purple/20"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
