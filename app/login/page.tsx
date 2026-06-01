"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import toast from "react-hot-toast";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    
    try {
      const result = await loginUser(email, password);

      if (!result.success) {
        toast.error(result.error || "Login failed");
        setLoading(false);
      } else {
        localStorage.setItem('trade_adhyayan_user', result.email!);
        toast.success("Successfully logged in");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center font-sans px-6 relative selection:bg-[#7C4DFF]/30 selection:text-white">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7C4DFF]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[28px] p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="p-2 bg-gradient-to-tr from-[#7C4DFF] to-[#E94B8A] rounded-xl text-white group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-sm uppercase tracking-wider text-slate-200">
              Trade Adhyayan
            </span>
          </Link>
          <h2 className="text-xl font-black text-slate-100">Welcome back</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sign in to your trading journal dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 h-11 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 h-11 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-[#7C4DFF] to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#7C4DFF]/15 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Journal"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-400 font-semibold border-t border-slate-850 pt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#7C4DFF] font-bold hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
}