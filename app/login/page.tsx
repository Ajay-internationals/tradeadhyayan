"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Mail, Lock, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { loginUser } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await loginUser(email, password);
      if (res.success && res.user) {
        localStorage.setItem("ta_user_email", res.user.email);
        localStorage.setItem("ta_user_name", res.user.name);
        router.push("/dashboard");
      } else {
        setError(res.error || "Invalid email or password.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login client error:", err);
      setError("Failed to connect to the authentication server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF9FF]/40 selection:bg-brand-purple/20 font-sans w-full flex flex-col justify-center items-center p-6">
      
      {/* Background blobs */}
      <div className="absolute inset-0 noise-bg pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-brand-purple/8 to-transparent blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-brand-blue/8 to-transparent blur-[130px] pointer-events-none z-0"></div>
      
      {/* Brand logo header */}
      <div className="mb-10 flex items-center gap-3 relative z-10">
        <div className="w-12 h-12 bg-brand-purple rounded-[20px] flex items-center justify-center shadow-2xl shadow-brand-purple/30 animate-float">
          <TrendingUp className="text-white w-7 h-7" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight block leading-none font-heading">
            Trade Adhyayan
          </span>
          <span className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em]">
            Master Your Mind
          </span>
        </div>
      </div>

      {/* Login Box */}
      <div className="glass rounded-[28px] overflow-hidden w-full max-w-md p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight font-heading">Welcome Back</h1>
          <p className="text-slate-500 font-medium text-sm">Log in to your professional trading desk.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                placeholder="ajay@trader.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white/60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Password
              </label>
              <a
                href="#"
                className="text-[10px] text-brand-purple font-bold hover:underline uppercase tracking-widest"
              >
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white/60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-2xl shadow-xl shadow-brand-purple/20 transition-all active:scale-[0.98] mt-4 text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                Continue to Dashboard <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New to Adhyayan?{" "}
            <Link
              className="text-brand-purple font-bold hover:underline decoration-2 underline-offset-4"
              href="/signup"
            >
              Create free account
            </Link>
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-12 flex items-center gap-8 text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-purple" />
          <span className="text-[10px] font-bold uppercase tracking-widest">SEBI Aware</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-blue" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Instant Sync</span>
        </div>
      </div>

    </div>
  );
}
