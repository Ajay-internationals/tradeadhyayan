import Link from "next/link";
import { Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white pt-24 pb-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-12 mb-20">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center shadow-lg shadow-brand-purple/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">TA</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg leading-none tracking-tight">
                  Trade Adhyayan
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
                  Track. Review. Improve.
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium">
              A trading journal and analytics platform built for traders who want to learn, reflect, and grow consistently.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Send className="w-5 h-5 fill-current" />
              </a>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="font-bold text-white mb-8 text-sm uppercase tracking-widest">
              Product
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#modules" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Modules
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Updates
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="font-bold text-white mb-8 text-sm uppercase tracking-widest">
              Resources
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Trading Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Glossary
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h4 className="font-bold text-white mb-8 text-sm uppercase tracking-widest">
              Company
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Support */}
          <div>
            <h4 className="font-bold text-white mb-8 text-sm uppercase tracking-widest">
              Support
            </h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>support@tradeadhyayan.com</li>
              <li>+91 73000 12345</li>
              <li>Mon - Sat (10 AM - 7 PM)</li>
            </ul>
            <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl border border-white/5">
              <h5 className="font-bold text-xs uppercase tracking-widest mb-3 text-white">
                SEBI Compliance
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Educational & self-analysis platform. No tips or investment advice.
              </p>
            </div>
          </div>

        </div>

        {/* Disclaimer Footer */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-slate-500 font-medium">
          <p>
            Investment in securities markets is subject to market risks. Read all related documents carefully before investing.
          </p>
          <p>© 2026 Trade Adhyayan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
