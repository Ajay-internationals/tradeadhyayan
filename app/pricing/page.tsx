import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, TrendingUp, ShieldCheck, Check, X, Globe, Headphones, Zap } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-purple/20">
      <Navbar />

      <main className="flex-1 pt-32 pb-32">
        <div className="container mx-auto px-6">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h1 className="text-5xl md:text-6xl font-heading font-black text-slate-900 tracking-tight">
              Choose Your <span className="text-brand-purple">Trading Plan</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Track trades, identify mistakes, and improve discipline with Trade Adhyayan.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Free Plan */}
            <div className="relative p-10 rounded-[3rem] bg-white border-2 border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-center mb-10 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center bg-brand-purple/10 text-brand-purple">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-brand-purple tracking-tight">FREE PLAN</h3>
                    <p className="text-slate-400 text-sm font-bold">For beginners</p>
                  </div>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-black text-slate-900">₹0</span>
                    <span className="text-slate-400 font-bold mb-1">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Includes:</div>
                  {[
                    { label: "30 Trades / Month", included: true },
                    { label: "Manual Trade Entry", included: true },
                    { label: "Excel Upload", included: true },
                    { label: "Basic Dashboard", included: true },
                    { label: "Calendar Tracking", included: true },
                    { label: "Basic Reports", included: true },
                    { label: "Unlimited Trades", included: false },
                    { label: "AI Mistake Detection", included: false },
                    { label: "Advanced Analytics", included: false },
                    { label: "Strategy Tracking", included: false },
                  ].map((feat, idx) => (
                    <div key={idx} className={`flex items-center gap-3 ${!feat.included && "opacity-40"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${feat.included ? "bg-brand-purple/10 text-brand-purple" : "bg-slate-100 text-slate-400"}`}>
                        {feat.included ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{feat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/signup"
                className="w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 bg-brand-purple/5 text-brand-purple border-2 border-brand-purple/20 hover:bg-brand-purple hover:text-white"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative p-10 rounded-[3rem] bg-white border-2 border-brand-green shadow-2xl shadow-brand-green/10 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-brand-green text-white text-xs font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2 shadow-sm">
                <Zap className="w-3 h-3 fill-white" /> Most Popular
              </div>
              
              <div>
                <div className="text-center mb-10 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center bg-brand-green/10 text-brand-green">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-brand-green tracking-tight">PRO PLAN</h3>
                    <p className="text-slate-400 text-sm font-bold">For serious traders</p>
                  </div>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-black text-slate-900">₹499</span>
                    <span className="text-slate-400 font-bold mb-1">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Includes:</div>
                  {[
                    { label: "Everything in Free +", included: true },
                    { label: "Unlimited Trades", included: true },
                    { label: "AI Mistake Detection", included: true },
                    { label: "Advanced Analytics", included: true },
                    { label: "Strategy Tracking", included: true },
                    { label: "Goal Tracking", included: true },
                    { label: "Performance Reports", included: true },
                    { label: "Trade Insights", included: true },
                    { label: "Broker Sync Integration", included: false },
                    { label: "Weekly Mentorship Call", included: false },
                  ].map((feat, idx) => (
                    <div key={idx} className={`flex items-center gap-3 ${!feat.included && "opacity-40"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${feat.included ? "bg-brand-green/10 text-brand-green" : "bg-slate-100 text-slate-400"}`}>
                        {feat.included ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{feat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/signup?plan=pro"
                className="w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 bg-brand-green text-white shadow-xl shadow-brand-green/25 hover:bg-brand-green/90"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Mentorship Plan */}
            <div className="relative p-10 rounded-[3rem] bg-white border-2 border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-center mb-10 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center bg-brand-orange/10 text-brand-orange">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-brand-orange tracking-tight">MENTORSHIP PLAN</h3>
                    <p className="text-slate-400 text-sm font-bold">For guidance seekers</p>
                  </div>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-black text-slate-900">₹4,999</span>
                    <span className="text-slate-400 font-bold mb-1">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Includes:</div>
                  {[
                    { label: "Everything in Pro +", included: true },
                    { label: "Broker Sync Integration", included: true },
                    { label: "Weekly Mentorship call", included: true },
                    { label: "Trade Reviews & Feedback", included: true },
                    { label: "Accountability Tracking", included: true },
                    { label: "Psychology Guidance", included: true },
                    { label: "Premium Support channel", included: true },
                    { label: "Community Access", included: true },
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-brand-orange/10 text-brand-orange">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{feat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/signup?plan=mentor"
                className="w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 bg-brand-orange text-white shadow-xl shadow-brand-orange/25 hover:bg-brand-orange/90"
              >
                Join Mentorship
              </Link>
            </div>

          </div>

          {/* Comparison Matrix */}
          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900">Compare Plans</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-8 text-left text-slate-400 font-black uppercase tracking-widest text-xs">Features</th>
                    <th className="py-8 text-center text-brand-purple font-black">Free</th>
                    <th className="py-8 text-center text-brand-green font-black">Pro</th>
                    <th className="py-8 text-center text-brand-orange font-black">Mentorship</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-semibold">
                  {[
                    { name: "Monthly Trade Limit", free: "30 Trades", pro: "Unlimited", mentor: "Unlimited" },
                    { name: "Manual Trade Entry", free: true, pro: true, mentor: true },
                    { name: "Excel Upload", free: true, pro: true, mentor: true },
                    { name: "Basic Dashboard", free: true, pro: true, mentor: true },
                    { name: "AI Mistake Detection", free: false, pro: true, mentor: true },
                    { name: "Advanced Analytics", free: false, pro: true, mentor: true },
                    { name: "Strategy Insights", free: false, pro: true, mentor: true },
                    { name: "Goal Tracking", free: false, pro: true, mentor: true },
                    { name: "Performance Reports", free: "Basic", pro: "Advanced", mentor: "Advanced" },
                    { name: "Broker Sync", free: false, pro: false, mentor: true },
                    { name: "Weekly Mentorship Calls", free: false, pro: false, mentor: true },
                    { name: "Community Access", free: false, pro: false, mentor: true },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-6 text-sm font-bold text-slate-700">{row.name}</td>
                      <td className="py-6 text-center text-sm">
                        {typeof row.free === "boolean" ? (
                          row.free ? <Check className="w-5 h-5 mx-auto text-brand-green" /> : <X className="w-5 h-5 mx-auto text-slate-200" />
                        ) : (
                          row.free
                        )}
                      </td>
                      <td className="py-6 text-center text-sm">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? <Check className="w-5 h-5 mx-auto text-brand-green" /> : <X className="w-5 h-5 mx-auto text-slate-200" />
                        ) : (
                          row.pro
                        )}
                      </td>
                      <td className="py-6 text-center text-sm">
                        {typeof row.mentor === "boolean" ? (
                          row.mentor ? <Check className="w-5 h-5 mx-auto text-brand-green" /> : <X className="w-5 h-5 mx-auto text-slate-200" />
                        ) : (
                          row.mentor
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Support and Safety badges */}
          <div className="mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Secure &amp; Private", desc: "Your data is 100% safe and encrypted." },
              { icon: <Globe className="w-6 h-6" />, title: "Access Anywhere", desc: "Web, iOS &amp; Android access on the go." },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Bank-Level Security", desc: "Enterprise grade security to protect your data." },
              { icon: <Headphones className="w-6 h-6" />, title: "Priority Support", desc: "Get help when you need it from our dedicated team." },
            ].map((badge, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 flex flex-col items-start">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-purple shadow-sm">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-black text-slate-900" dangerouslySetInnerHTML={{ __html: badge.title }} />
                  <p className="text-xs text-slate-500 font-medium mt-1" dangerouslySetInnerHTML={{ __html: badge.desc }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
