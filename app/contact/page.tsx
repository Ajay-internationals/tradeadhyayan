"use client";

import Link from "next/link";
import { 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin 
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#081329] selection:bg-[#6D4CFF]/20 selection:text-[#6D4CFF] font-['Quicksand'] pb-[96px]">
      
      {/* Navbar Minimal */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#081329] text-white flex items-center justify-center font-black text-sm">TA</div>
            <span className="font-black text-xl tracking-tight">Trade Adhyayan</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block font-bold text-sm text-[#081329] hover:text-[#6D4CFF] transition-colors">Login</Link>
            <Link href="/signup" className="px-5 py-2.5 bg-[#6D4CFF] hover:bg-[#5b3ce0] text-white font-bold text-sm rounded-[16px] transition-all shadow-md">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-[96px] pb-[64px] px-6 text-center">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-tight mb-6 text-[#081329]">
            We're Here <span className="text-[#6D4CFF]">To Help</span>
          </h1>
          <p className="text-[18px] text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Have a question about broker integration or need help reading your reports? Reach out to our team.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-[32px] px-6">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-[24px]">
          
          {/* CONTACT FORM */}
          <div className="bg-white p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100">
            <h3 className="text-[32px] font-black text-[#081329] mb-8">Send a Message</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Rahul Kumar"
                  className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 transition-all font-medium"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="rahul@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Message</label>
                <textarea 
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 transition-all font-medium resize-none"
                ></textarea>
              </div>
              <button className="w-full py-4 bg-[#6D4CFF] hover:bg-[#5b3ce0] text-white font-black text-[18px] rounded-[16px] transition-all shadow-md">
                Send Message
              </button>
            </form>
          </div>

          {/* CONTACT INFO */}
          <div className="bg-[#081329] p-[32px] rounded-[24px] shadow-[0_20px_60px_rgba(8,19,41,0.2)] text-white flex flex-col justify-center">
            <h3 className="text-[32px] font-black mb-10">Contact Information</h3>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] bg-[#6D4CFF]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-[#6D4CFF]" />
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-gray-300 mb-1">Email Support</h4>
                  <p className="text-[18px] font-medium text-white">support@tradeadhyayan.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] bg-[#6D4CFF]/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-[#6D4CFF]" />
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-gray-300 mb-1">WhatsApp</h4>
                  <p className="text-[18px] font-medium text-white">+91 73000 12345</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] bg-[#6D4CFF]/20 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-[#6D4CFF]" />
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-gray-300 mb-1">Support Hours</h4>
                  <p className="text-[18px] font-medium text-white">Monday - Saturday<br />10:00 AM - 7:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] bg-[#6D4CFF]/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[#6D4CFF]" />
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-gray-300 mb-1">Office</h4>
                  <p className="text-[18px] font-medium text-white">Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
