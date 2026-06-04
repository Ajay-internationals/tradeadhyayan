"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Book, Activity, Link as LinkIcon, HelpCircle, ChevronDown, ChevronUp, Mail, MessageSquare } from "lucide-react";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Auto Broker Sync work?",
      answer: "Trade Adhyayan securely connects to your broker via OAuth. We do not store your credentials. Once connected, we automatically pull your trades, positions, and ledger data in the background based on your Sync Frequency settings (15 Min, 30 Min, 1 Hour, or Manual)."
    },
    {
      question: "Why is my Broker Sync failing or showing 'Token Expired'?",
      answer: "For security reasons, broker access tokens expire at the end of the trading day (usually around 11:59 PM). You must reconnect your broker every morning before trading begins to ensure your data syncs properly."
    },
    {
      question: "How do I format my CSV for Manual Upload?",
      answer: "Your CSV or pasted data must include 7 columns in this exact order: Date, Time, Symbol, Direction (LONG/SHORT), Quantity, Entry Price, Exit Price. You can download the Example Template from the Manual Add Trade page to see the exact format."
    },
    {
      question: "Can I delete a specific sync or revert imported trades?",
      answer: "Yes. Go to Trade Journal > Broker Sync, scroll down to 'Recent Sync Activity', and click 'View Logs' on the sync you want to remove. A details window will pop up with a red 'Delete Sync Data' button at the bottom."
    },
    {
      question: "How is my Risk:Reward calculated?",
      answer: "Planned R:R is calculated using your Stop Loss and Target prices at the time of entry. Actual R:R is calculated using your final Exit Price. If you don't input a Stop Loss, we cannot calculate R:R accurately."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-[28px] max-w-[1440px] mx-auto space-y-[24px]">
      
      {/* Header */}
      <header className="flex items-center gap-4 pb-4 border-b border-[#E9E6F5]">
        <Link href="/dashboard" className="w-10 h-10 bg-white border border-[#E9E6F5] rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[24px] font-[600] text-[#0F172A] tracking-tight">Help Center</h1>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-1">Support & Documentation</p>
        </div>
      </header>

      {/* Hero Search Section */}
      <div className="w-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-[24px] p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981] opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <h2 className="text-[28px] font-[700] text-white mb-2 relative z-10 text-center">How can we help you today?</h2>
        <p className="text-[14px] text-purple-200 mb-8 relative z-10 text-center max-w-lg">Search for guides, tutorials, and troubleshooting steps to make the most out of your trading journal.</p>
        
        <div className="relative w-full max-w-2xl z-10">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input 
            type="text" 
            placeholder="Search for 'Broker Sync', 'CSV Upload', etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl border-none focus:outline-none focus:ring-4 focus:ring-white/20 text-[15px] font-[500] text-[#0F172A] shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] pt-4">
        
        {/* Left Column: Quick Topics */}
        <div className="col-span-1 space-y-4">
          <h3 className="text-[18px] font-[600] text-[#0F172A] px-1">Quick Topics</h3>
          
          <div className="space-y-3">
            {[
              { icon: <LinkIcon size={18} />, title: "Broker Synchronization", desc: "Connecting and managing APIs" },
              { icon: <Book size={18} />, title: "Trade Journaling", desc: "Manual entry and CSV imports" },
              { icon: <Activity size={18} />, title: "Analytics & Metrics", desc: "Understanding PnL and R:R" },
            ].map((topic, i) => (
              <div key={i} className="bg-white border border-[#E9E6F5] hover:border-[#7C3AED]/50 p-4 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md flex items-center gap-4 group">
                <div className="w-10 h-10 bg-[#FBF8FF] text-[#7C3AED] rounded-xl flex items-center justify-center group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                  {topic.icon}
                </div>
                <div>
                  <h4 className="text-[14px] font-[600] text-[#0F172A]">{topic.title}</h4>
                  <p className="text-[12px] font-[500] text-[#64748B]">{topic.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#FBF8FF] border border-[#8B5CF6]/20 p-6 rounded-[24px] mt-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-[#7C3AED] flex items-center justify-center mb-4">
              <MessageSquare size={20} />
            </div>
            <h4 className="text-[16px] font-[600] text-[#0F172A] mb-2">Still need help?</h4>
            <p className="text-[13px] font-[500] text-[#64748B] mb-4">Our support team is available 24/7 to assist you with any technical issues.</p>
            <button className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-[600] text-[13px] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
              <Mail size={16} /> Contact Support
            </button>
          </div>
        </div>

        {/* Right Column: FAQ Accordion */}
        <div className="col-span-1 lg:col-span-2">
          <h3 className="text-[18px] font-[600] text-[#0F172A] px-1 mb-4">Frequently Asked Questions</h3>
          
          <div className="bg-white border border-[#E9E6F5] rounded-[24px] overflow-hidden shadow-sm">
            {filteredFaqs.length === 0 ? (
              <div className="p-10 text-center text-[#64748B] text-[14px] font-[500]">
                No articles found matching "{searchQuery}".
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="border-b border-[#E9E6F5] last:border-0">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className={`text-[15px] font-[600] ${openFaq === index ? "text-[#7C3AED]" : "text-[#0F172A]"}`}>
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${openFaq === index ? "bg-[#FBF8FF] text-[#7C3AED]" : "bg-slate-50 text-[#64748B]"}`}>
                      {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-6 text-[14px] font-[500] text-[#64748B] leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
