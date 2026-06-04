"use client";

import Link from "next/link";
import { 
  Lock, 
  RefreshCw, 
  BarChart2, 
  BookOpen, 
  LineChart, 
  AlertTriangle, 
  Target, 
  Users, 
  Brain, 
  TrendingDown, 
  Crosshair, 
  Ban, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#0F172A] selection:bg-[#7C3AED]/20 selection:text-[#7C3AED]">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E9E6F5]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] text-white flex items-center justify-center font-black text-sm shadow-md shadow-[#7C3AED]/20">
              TA
            </div>
            <span className="font-black text-xl tracking-tight text-[#0F172A]">Trade Adhyayan</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-[#64748B]">
            <a href="#features" className="hover:text-[#7C3AED] transition-colors">Features</a>
            <a href="#problems" className="hover:text-[#7C3AED] transition-colors">Methodology</a>
            <a href="#dashboard" className="hover:text-[#7C3AED] transition-colors">Dashboard</a>
            <a href="#stats" className="hover:text-[#7C3AED] transition-colors">Impact</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block font-bold text-sm text-[#475569] hover:text-[#7C3AED] transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-sm rounded-xl transition-all shadow-md">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-24 pb-32 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED]/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E9E6F5] shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-sm font-bold text-[#475569]">Built for Traders. Designed for Growth.</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#0F172A] mb-6 leading-tight">
            The Ultimate Trading <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#DB2777]">Journal</span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-[#475569] mb-8">
            To Track, Review & Improve.
          </h2>

          <p className="text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto mb-12 leading-relaxed">
            Track trades, review mistakes, improve discipline, and build better trading habits through journaling and analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#7C3AED]/25 transition-all flex items-center justify-center gap-2 group">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-[#0F172A] border-2 border-[#E9E6F5] font-black text-lg rounded-2xl transition-all shadow-sm">
              Watch Demo
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E9E6F5]">
              <Lock className="w-6 h-6 text-[#15B77A] mb-3" />
              <h3 className="font-bold text-[#0F172A] mb-1">Secure & Private</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Your trading data is fully encrypted and protected.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E9E6F5]">
              <RefreshCw className="w-6 h-6 text-[#3B82F6] mb-3" />
              <h3 className="font-bold text-[#0F172A] mb-1">Auto Broker Sync</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Import trades automatically from supported brokers.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E9E6F5]">
              <BarChart2 className="w-6 h-6 text-[#7C3AED] mb-3" />
              <h3 className="font-bold text-[#0F172A] mb-1">Smart Insights</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Understand performance through meaningful analytics.</p>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/100?img=33" alt="Trader" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="https://i.pravatar.cc/100?img=47" alt="Trader" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="https://i.pravatar.cc/100?img=12" alt="Trader" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="https://i.pravatar.cc/100?img=59" alt="Trader" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-[#F4F0FF] flex items-center justify-center text-xs font-bold text-[#7C3AED]">+9k</div>
            </div>
            <p className="font-bold text-[#475569] text-sm">Trusted by <span className="text-[#0F172A]">10,000+</span> traders across India.</p>
          </div>

          <div className="mt-12 inline-flex items-start text-left gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-2xl mx-auto">
            <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <strong>Compliance Note:</strong> Trade Adhyayan is a trading journal and self-analysis platform designed for educational and review purposes. We do not provide investment advice, stock recommendations, or trading tips.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-white border-y border-[#E9E6F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight mb-4">Master Every Aspect of Your Trading</h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">Everything you need to turn raw data into actionable discipline.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-[#FAFBFF] p-6 rounded-3xl border border-[#E9E6F5] hover:shadow-lg hover:shadow-[#7C3AED]/5 transition-all">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-[#0F172A] mb-3">Journal Every Trade</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">Capture every trade with complete details and build a habit of reviewing your trading decisions.</p>
            </div>

            <div className="bg-[#FAFBFF] p-6 rounded-3xl border border-[#E9E6F5] hover:shadow-lg hover:shadow-[#7C3AED]/5 transition-all">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-[#0F172A] mb-3">Powerful Analytics</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">Advanced reports and visual analytics to help you understand your strengths and weaknesses.</p>
            </div>

            <div className="bg-[#FAFBFF] p-6 rounded-3xl border border-[#E9E6F5] hover:shadow-lg hover:shadow-[#7C3AED]/5 transition-all">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-[#0F172A] mb-3">Mistake Tracking</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">Identify recurring mistakes such as overtrading, emotional trading, and rule violations.</p>
            </div>

            <div className="bg-[#FAFBFF] p-6 rounded-3xl border border-[#E9E6F5] hover:shadow-lg hover:shadow-[#7C3AED]/5 transition-all">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-[#0F172A] mb-3">Goal & Discipline</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">Set measurable goals, monitor progress, and build long-term trading discipline.</p>
            </div>

            <div className="bg-[#FAFBFF] p-6 rounded-3xl border border-[#E9E6F5] hover:shadow-lg hover:shadow-[#7C3AED]/5 transition-all">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-[#0F172A] mb-3">Mentor Review</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">Receive structured feedback from experienced mentors and improve faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="problems" className="py-24 bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#7C3AED] font-bold tracking-wider uppercase text-sm mb-2 block">The Reality Check</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">The Problems Traders Face Every Day</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
              <Brain className="w-8 h-8 text-rose-400 mb-4" />
              <h3 className="font-black text-lg mb-2">Emotional Trading</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Fear, greed, and emotions often lead to poor trading decisions.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
              <TrendingDown className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="font-black text-lg mb-2">Overtrading</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Taking too many low-quality trades reduces overall profitability.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
              <RefreshCw className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="font-black text-lg mb-2">Revenge Trading</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Trying to recover losses quickly often creates larger losses.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm lg:col-start-2">
              <Ban className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="font-black text-lg mb-2">No Risk Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Poor position sizing and risk control damage trading accounts.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
              <Crosshair className="w-8 h-8 text-slate-300 mb-4" />
              <h3 className="font-black text-lg mb-2">No Review Process</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Most traders never review their trades and keep repeating the same mistakes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section id="stats" className="py-20 bg-[#7C3AED]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center divide-x divide-white/20">
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black text-white mb-2">10,000+</span>
              <span className="text-purple-200 font-bold text-sm uppercase tracking-wider">Active Traders</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black text-white mb-2">1 Lakh+</span>
              <span className="text-purple-200 font-bold text-sm uppercase tracking-wider">Trades Analyzed</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black text-[#15B77A] mb-2">78%</span>
              <span className="text-purple-200 font-bold text-sm uppercase tracking-wider">Improved Consistency</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-black text-white mb-2">4.8/5</span>
              <span className="text-purple-200 font-bold text-sm uppercase tracking-wider">Average Rating</span>
            </div>
            <div className="flex flex-col hidden md:flex border-none">
              <span className="text-3xl md:text-4xl font-black text-white mb-2">₹1.81 Cr+</span>
              <span className="text-purple-200 font-bold text-sm uppercase tracking-wider">P&L Tracked</span>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD SECTION */}
      <section id="dashboard" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight mb-8">
              Everything You Need To Review Your Trading
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4F0FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-[#0F172A] mb-1">Trade Journal</h4>
                  <p className="text-[#64748B] text-sm leading-relaxed">Add trades manually, upload Excel files, paste trade data, or sync directly from your broker.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4F0FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-[#0F172A] mb-1">Performance Analytics</h4>
                  <p className="text-[#64748B] text-sm leading-relaxed">Track P&L, win rate, risk-reward ratio, expectancy, profit factor, and drawdown.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4F0FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-[#0F172A] mb-1">Mistake Analysis</h4>
                  <p className="text-[#64748B] text-sm leading-relaxed">Understand where losses occur and identify patterns affecting performance.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4F0FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-[#0F172A] mb-1">Strategy Performance</h4>
                  <p className="text-[#64748B] text-sm leading-relaxed">Compare strategies and discover what actually works for your trading style.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4F0FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-[#0F172A] mb-1">Reports & Insights</h4>
                  <p className="text-[#64748B] text-sm leading-relaxed">Generate daily, weekly, monthly, and yearly performance reports.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4F0FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-[#0F172A] mb-1">Goals & Consistency</h4>
                  <p className="text-[#64748B] text-sm leading-relaxed">Stay accountable with measurable goals and progress tracking.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#FAFBFF] rounded-[2rem] border border-[#E9E6F5] p-8 shadow-xl shadow-[#7C3AED]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative z-10">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h5 className="font-black text-slate-800">Performance Mockup</h5>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Live Sync</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-bold text-slate-600">Total Net P&L</span>
                  <span className="font-black text-emerald-600">+₹1,42,500</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-bold text-slate-600">Win Rate</span>
                  <span className="font-black text-slate-800">68.4%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-bold text-slate-600">Profit Factor</span>
                  <span className="font-black text-slate-800">2.14</span>
                </div>
              </div>
              <div className="mt-6 h-32 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                <LineChart className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-xs font-bold text-slate-400">Equity Curve Visualization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MENTOR REVIEW SECTION */}
      <section className="py-24 bg-[#FAFBFF] border-t border-[#E9E6F5]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 bg-white rounded-[2rem] border border-[#E9E6F5] p-8 shadow-xl shadow-[#7C3AED]/5 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-6 relative z-10">
              <div className="flex gap-4 items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                  <span className="text-xl">👨‍🏫</span>
                </div>
                <div>
                  <h5 className="font-black text-slate-800">Mentor Feedback</h5>
                  <p className="text-xs text-slate-500 font-bold mt-1">Reviewing: Breakout Strategy</p>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed font-medium">
                "Your entry here was structurally perfect, but you exited prematurely due to the minor pullback. Next time, trust the 21 EMA trailing stop rule we discussed. Stop letting fear cut your winners short!"
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-[#7C3AED] font-bold tracking-wider uppercase text-sm mb-2 block">Professional Growth</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight mb-8">
              Learn From Your Trading Data
            </h2>
            <p className="text-[#64748B] text-lg mb-8 leading-relaxed">Get structured feedback on:</p>
            <ul className="space-y-4 mb-8">
              {['Trade execution', 'Risk management', 'Strategy selection', 'Discipline issues', 'Psychological mistakes', 'Performance improvement opportunities'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#15B77A] shrink-0" />
                  <span className="font-bold text-[#0F172A]">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-lg font-black text-[#7C3AED] bg-[#F4F0FF] inline-block px-4 py-2 rounded-xl">
              Turn your trading journal into a complete learning system.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-white border-y border-[#E9E6F5]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-6 leading-tight">
            Start Your Trading Improvement Journey Today
          </h2>
          <p className="text-[#64748B] text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of traders who are building consistency, improving discipline, and making better trading decisions through structured review.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-10 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#7C3AED]/25 transition-all">
              Start Free Trial
            </Link>
            <button className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-slate-50 text-[#0F172A] border-2 border-[#E9E6F5] font-black text-lg rounded-2xl transition-all shadow-sm">
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FAFBFF] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-sm">
                  TA
                </div>
                <span className="font-black text-xl tracking-tight text-[#0F172A]">Trade Adhyayan</span>
              </div>
              <p className="font-black text-[#7C3AED] mb-4">Track. Review. Improve.</p>
              <p className="text-sm text-[#64748B] leading-relaxed max-w-sm mb-6">
                A trading journal and analytics platform built for traders who want to learn, reflect, and grow consistently.
              </p>
              <div className="text-sm text-[#64748B]">
                <a href="mailto:support@tradeadhyayan.com" className="block hover:text-[#7C3AED] font-bold mb-1">support@tradeadhyayan.com</a>
                <p className="font-bold">+91 73000 12345</p>
                <p className="mt-2 text-xs">Monday – Saturday<br/>10:00 AM – 7:00 PM</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-black text-[#0F172A] mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-[#64748B]">
                <li><a href="#" className="hover:text-[#7C3AED]">Features</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Modules</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Pricing</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Updates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-[#0F172A] mb-6">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-[#64748B]">
                <li><a href="#" className="hover:text-[#7C3AED]">Blog</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Help Center</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Trading Guide</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Glossary</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-[#0F172A] mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-[#64748B]">
                <li><a href="#" className="hover:text-[#7C3AED]">About Us</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Careers</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E9E6F5] pt-10">
            <div className="bg-slate-100 p-6 rounded-2xl mb-8 border border-slate-200">
              <h5 className="font-black text-slate-800 mb-2 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-500" /> SEBI Compliance
              </h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Educational and self-analysis platform. No tips, recommendations, advisory services, portfolio management services, or investment advice are provided through Trade Adhyayan.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-[#64748B]">
              <p className="text-center md:text-left">Investment in securities markets is subject to market risks. Read all related documents carefully before investing.</p>
              <p className="shrink-0">© 2026 Trade Adhyayan. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
