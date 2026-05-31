"use"
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, User, Mail, Lock, ShieldCheck, Sparkles, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    localStorage.setItem("ta_user_email", email);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF9FF]/40 selection:bg-brand-purple/20 font-sans w-full flex flex-col justify-center items-center p-6 py-20">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 noise-bg pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-emerald-100/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[20%] left-[-5%] w-[35%] h-[35%] bg-violet-100/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      
      {/* Header Logo */}
      <div className="mb-10 flex items-center gap-3 relative z-10">
        <div className="w-12 h-12 bg-brand-purple rounded-[20px] flex items-center justify-center shadow-2xl shadow-brand-purple/30 animate-float">
          <TrendingUp className="text-white w-7 h-7" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight block leading-none font-heading">
            Trade Adhyayan
          </span>
          <span className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em]">
            Scale Your Portfolio
          </span>
        </div>
      </div>

      {/* Form Container */}
      <div className="glass rounded-[28px] overflow-hidden w-full max-w-md p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight font-heading">Create Account</h1>
          <p className="text-slate-500 font-medium text-sm">Join 5,000+ disciplined Indian traders.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ajay Sharma"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white/60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white/60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="password"
                placeholder="Secure password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white/60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-start gap-3 mb-8 bg-brand-purple/5 p-4 rounded-2xl border border-brand-purple/10">
              <CheckCircle className="w-5 h-5 text-brand-purple mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                By signing up, you agree to our{" "}
                <a className="text-brand-purple font-bold hover:underline" href="#">
                  Terms
                </a>{" "}
                and{" "}
                <a className="text-brand-purple font-bold hover:underline" href="#">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-2xl shadow-xl shadow-brand-purple/20 transition-all active:scale-[0.98] text-base flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Start Journaling Now"
              )}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link
              className="text-brand-purple font-bold hover:underline decoration-2 underline-offset-4"
              href="/login"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Feature cards at the bottom */}
      <div className="mt-16 grid grid-cols-2 gap-6 w-full max-w-md text-center relative z-10">
        <div className="p-5 rounded-[24px] bg-white/40 backdrop-blur-md border border-white shadow-sm flex flex-col items-center">
          <ShieldCheck className="w-6 h-6 text-brand-purple mb-2" />
          <p className="text-xs font-bold text-slate-800">Cloud Sync</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Encrypted</p>
        </div>
        <div className="p-5 rounded-[24px] bg-white/40 backdrop-blur-md border border-white shadow-sm flex flex-col items-center">
          <Sparkles className="w-6 h-6 text-brand-green mb-2" />
          <p className="text-xs font-bold text-slate-800">AI Insights</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Beta Access</p>
        </div>
      </div>

    </div>
  );
}
