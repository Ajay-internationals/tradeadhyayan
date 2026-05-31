import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  ArrowRight,
  Star,
  BookOpen,
  ShieldCheck,
  Zap,
  BarChart2,
  AlertTriangle,
  Target,
  CheckCircle,
  TrendingUp,
  Lock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-purple/20">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-[#FFFFFF] font-sans min-h-screen text-slate-800 relative overflow-hidden">
          {/* Ambient Background Blur Blobs */}
          <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[160px] pointer-events-none z-0"></div>
          <div className="absolute top-[25%] right-[-10%] w-[700px] h-[700px] bg-violet-100/40 rounded-full blur-[180px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[150px] pointer-events-none z-0"></div>
          <div className="absolute inset-0 noise-bg z-0 pointer-events-none"></div>

          <section className="relative pt-36 pb-24 overflow-hidden z-10">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                
                {/* Hero Text */}
                <div className="lg:col-span-6 space-y-8 text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> The Ultimate Trading Journal
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] font-heading">
                    Track, Review &amp; Improve <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-500">
                      Your Trading
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                    Trade Adhyayan helps traders journal trades, identify mistakes, measure performance, improve discipline, and grow with AI-powered insights.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                      href="/signup"
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      Start Free Trial <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/dashboard"
                      className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200/80 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      View Dashboard
                    </Link>
                  </div>

                  {/* Rating/Trust Badge */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100 max-w-md">
                    <div className="flex -space-x-3">
                      <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-100 shrink-0">
                        <img src="https://i.pravatar.cc/100?u=user-13" alt="Trader profile" />
                      </div>
                      <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-100 shrink-0">
                        <img src="https://i.pravatar.cc/100?u=user-14" alt="Trader profile" />
                      </div>
                      <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-100 shrink-0">
                        <img src="https://i.pravatar.cc/100?u=user-15" alt="Trader profile" />
                      </div>
                      <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-100 shrink-0">
                        <img src="https://i.pravatar.cc/100?u=user-16" alt="Trader profile" />
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 mt-1">
                        10,000+ Traders <span className="text-slate-400 font-medium">improving every single day</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hero Dashboard Preview */}
                <div className="lg:col-span-6 relative">
                  <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full"></div>
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-[32px] shadow-[0_30px_70px_rgba(30,41,59,0.08)] border border-white/60 p-6 overflow-hidden">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                        <span className="w-3 h-3 rounded-full bg-green-400"></span>
                        <span className="text-[11px] font-bold text-slate-400 ml-2">trade-adhyayan.app/dashboard</span>
                      </div>
                      <div className="h-6 px-2.5 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Account
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Win Rate</span>
                        <span className="text-lg font-bold text-slate-800 mt-1 block">68.4%</span>
                      </div>
                      <div className="bg-violet-50/50 border border-violet-100/50 p-4 rounded-2xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Net P&amp;L</span>
                        <span className="text-lg font-bold text-emerald-600 mt-1 block">+₹32,400</span>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-2xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Trades</span>
                        <span className="text-lg font-bold text-slate-800 mt-1 block">142</span>
                      </div>
                    </div>

                    {/* SVG Equity growth representation */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-800">Equity Growth Curve</span>
                        <span className="text-[10px] text-slate-400 font-bold">Past 30 Days</span>
                      </div>
                      <div className="h-28 flex items-end justify-between px-1 relative">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <path d="M 0,90 Q 60,85 110,60 T 220,30 T 300,10" fill="none" stroke="#2563EB" strokeWidth="4"></path>
                          <path d="M 0,90 Q 60,85 110,60 T 220,30 T 300,10 L 300,100 L 0,100 Z" fill="url(#heroPnlGrad)" opacity="0.08"></path>
                          <defs>
                            <linearGradient id="heroPnlGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563EB"></stop>
                              <stop offset="100%" stopColor="#2563EB" stopOpacity="0"></stop>
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="text-[8px] text-slate-400 font-semibold absolute bottom-0 left-0">May 01</span>
                        <span className="text-[8px] text-slate-400 font-semibold absolute bottom-0 right-0">May 30</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>

        {/* Reality Section */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden z-10 rounded-[3rem] mx-4 sm:mx-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 z-0"></div>
          <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center space-y-16">
            <div className="space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-950/40 border border-red-900/50 px-3.5 py-1.5 rounded-full inline-block">
                The Reality of Trading
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading">
                Trading Without Review Creates Repeated Mistakes
              </h2>
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium">
                Most traders take entries, exits, losses, and profits — but never properly review them.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
              {[
                { num: "01", title: "No Proper Trade History", desc: "No record of why you took the trade, entries/exits, or execution quality." },
                { num: "02", title: "No Mistake Tracking", desc: "Repeating the same errors like FOMO or overtrading without realizing it." },
                { num: "03", title: "No Emotional Review", desc: "No reflection on how fear, greed, or frustration affected your decisions." },
                { num: "04", title: "No Strategy Metrics", desc: "Trading multiple systems without knowing which setup actually makes money." },
                { num: "05", title: "No Performance Clarity", desc: "No clear data on win rates, profit factors, or account drawdowns." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 hover:border-red-950 hover:bg-slate-900/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-red-400 font-extrabold text-2xl tracking-tight block mb-4">{item.num}</span>
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Toolkit Section */}
        <section id="features" className="py-28 relative z-10">
          <div className="container mx-auto px-6 max-w-7xl text-center space-y-16">
            <div className="space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full inline-block">
                Your Professional Toolkit
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
                Your Personal Trading Review System
              </h2>
              <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
                Trade Adhyayan converts every trade into useful insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <BookOpen className="w-5 h-5" />, color: "text-blue-500 bg-blue-50 border-blue-100", title: "Trade Journal", desc: "Log every trade parameter, entry type, exit plan, and setup details with a neat design." },
                { icon: <ShieldCheck className="w-5 h-5" />, color: "text-violet-500 bg-violet-50 border-violet-100", title: "Broker Sync", desc: "Seamless read-only connections with major stockbrokers to sync trades automatically." },
                { icon: <Zap className="w-5 h-5" />, color: "text-emerald-500 bg-emerald-50 border-emerald-100", title: "Manual Trade Entry", desc: "Input trades manually with built-in capital protection calculations and emotional taggers." },
                { icon: <BarChart2 className="w-5 h-5" />, color: "text-blue-500 bg-blue-50 border-blue-100", title: "Performance Analytics", desc: "Deep analytics tracking win rate, profit factor, risk-reward ratios, and drawdown curves." },
                { icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-500 bg-red-50 border-red-100", title: "Mistake Tracking", desc: "Record trading mistakes to identify rules broken, overtrading triggers, and emotional slips." },
                { icon: <Target className="w-5 h-5" />, color: "text-violet-500 bg-violet-50 border-violet-100", title: "Strategy Review", desc: "Differentiate strategy-wise performance to isolate profitable setups from losing systems." },
                { icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-500 bg-emerald-50 border-emerald-100", title: "Goal Tracking", desc: "Set risk targets, weekly consistency goals, and track behavior patterns to build habits." },
                { icon: <Sparkles className="w-5 h-5" />, color: "text-blue-500 bg-blue-50 border-blue-100", title: "AI Insights", desc: "Extract patterns from your logs to identify your peak performance hours and core triggers." },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[28px] shadow-[0_8px_30px_rgb(224,231,255,0.25)] hover:shadow-[0_15px_40px_rgb(224,231,255,0.4)] transition-all duration-500 hover:-translate-y-1 p-8 text-left flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-6 transition-all group-hover:scale-105 ${feat.color}`}>
                      {feat.icon}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">{feat.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Review Details Section */}
        <section id="modules" className="py-24 bg-slate-50 border-y border-slate-100/80 relative z-10">
          <div className="container mx-auto px-6 max-w-7xl space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
                Everything You Need To Review Your Trading
              </h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                Maximize discipline and improve execution consistency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "1. Trade Journal", desc: "Add trades manually, upload Excel sheets, paste trade data directly, or sync through broker API automatically." },
                { title: "2. Dashboard Metrics", desc: "Track Net P&L, win rate, average profit, average loss, risk-reward factor, max drawdown, and total trades executed." },
                { title: "3. Strategy Analysis", desc: "Pinpoint which strategies are profitable and which ones are consistently damaging your capital." },
                { title: "4. Emotion &amp; Mistake Tracking", desc: "Keep record of fear, greed, overtrading, revenge trading, missed entries, and rule-breaking behaviors." },
                { title: "5. Reports", desc: "Generate daily, weekly, monthly, and yearly reports to study your performance curve over time." },
                { title: "6. Broker Sync", desc: "Safely link supported broker accounts to import executed trades directly without manual hassle." },
              ].map((module, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">{module.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: module.desc }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Workspace Preview */}
        <section className="py-28 relative z-10">
          <div className="container mx-auto px-6 max-w-7xl text-center space-y-16">
            <div className="space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full inline-block">
                Interactive Preview Workspace
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
                See Your Trading Clearly
              </h2>
              <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
                Interact with this live workspace demo to see how broker syncs and manual entries instantly calculate metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
              
              {/* Left Panel: Selector */}
              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[28px] shadow-[0_8px_30px_rgb(224,231,255,0.25)] hover:shadow-[0_15px_40px_rgb(224,231,255,0.4)] transition-all duration-500 hover:-translate-y-1 lg:col-span-5 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-slate-800">Trade Entry Panel</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all bg-blue-50 text-blue-600 border border-blue-100 cursor-pointer">
                        Broker Sync
                      </button>
                      <button className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all bg-slate-100 text-slate-400 cursor-pointer">
                        Manual Entry
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Select your broker partner to simulate real-time imports.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Zerodha", dot: "🔴" },
                        { label: "Upstox", dot: "🔵" },
                        { label: "Dhan", dot: "🟢" },
                        { label: "Angel One", dot: "🟠" },
                      ].map((broker, idx) => (
                        <button
                          key={idx}
                          className="px-4 py-3 border rounded-xl bg-slate-50/50 text-xs font-bold text-slate-700 flex items-center justify-between transition-all cursor-pointer hover:border-blue-500/40 hover:bg-blue-50/5 border-slate-100"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm">{broker.dot}</span> {broker.label}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">API</span>
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 mt-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800">Secure API Credentials</p>
                        <p className="text-[8px] text-slate-400 font-bold mt-0.5">
                          All credentials are fully encrypted and handled with read-only permissions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Simulated Dashboard */}
              <div className="backdrop-blur-md rounded-[28px] hover:shadow-[0_15px_40px_rgb(224,231,255,0.4)] transition-all duration-500 hover:-translate-y-1 lg:col-span-7 p-8 bg-slate-900 border border-slate-800 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
                <div className="absolute top-[-30%] right-[-30%] w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
                
                <div className="relative z-10 space-y-6">
                  
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Live Dashboard View</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Mock analytics simulator (Reset on refresh)</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-[7px] text-slate-400 font-bold uppercase">Total P&amp;L</div>
                        <div className="text-xs font-bold leading-none mt-0.5 text-[#22C55E]">+₹17,350</div>
                      </div>
                      <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-[7px] text-slate-400 font-bold uppercase">Win Rate</div>
                        <div className="text-xs font-bold text-violet-400 leading-none mt-0.5">66.7%</div>
                      </div>
                      <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-[7px] text-slate-400 font-bold uppercase font-sans">Best Strategy</div>
                        <div className="text-xs font-bold text-white leading-none mt-0.5">Breakout</div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-2">Date</th>
                          <th className="pb-3 pr-2">Asset</th>
                          <th className="pb-3 pr-2">Type</th>
                          <th className="pb-3 pr-2 text-right">P&amp;L</th>
                          <th className="pb-3 pl-4 text-center">Emotion Tag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-[10px] font-bold text-slate-300">
                        <tr className="hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 pr-2 font-medium text-slate-500">14:20 PM</td>
                          <td className="py-3.5 pr-2 text-white font-bold">NIFTY 22400 CE</td>
                          <td className="py-3.5 pr-2">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400">BUY</span>
                          </td>
                          <td className="py-3.5 pr-2 text-right font-bold text-[#22C55E]">+₹12,450</td>
                          <td className="py-3.5 pl-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Discipline ✓</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 pr-2 font-medium text-slate-500">11:05 AM</td>
                          <td className="py-3.5 pr-2 text-white font-bold">RELIANCE</td>
                          <td className="py-3.5 pr-2">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400">BUY</span>
                          </td>
                          <td className="py-3.5 pr-2 text-right font-bold text-rose-400">-₹3,200</td>
                          <td className="py-3.5 pl-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider bg-rose-500/10 text-rose-400 border-rose-500/20">FOMO Entry ⚠️</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 pr-2 font-medium text-slate-500">Yesterday</td>
                          <td className="py-3.5 pr-2 text-white font-bold">HDFCBANK</td>
                          <td className="py-3.5 pr-2">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 text-rose-400">SELL</span>
                          </td>
                          <td className="py-3.5 pr-2 text-right font-bold text-[#22C55E]">+₹8,100</td>
                          <td className="py-3.5 pl-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider bg-amber-500/10 text-amber-400 border-amber-500/20">Early Exit ⚠️</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Sandbox Sync
                    </span>
                    <span>Data Simulator</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing Summary Section */}
        <section className="py-28 bg-slate-50 border-t border-slate-100 z-10 relative">
          <div className="container mx-auto px-6 max-w-7xl text-center space-y-16">
            <div className="space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100 px-3.5 py-1.5 rounded-full inline-block">
                Subscription Plans
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
                Simple Pricing For Serious Traders
              </h2>
              <p className="text-slate-500 text-sm font-bold">
                Choose the layout built for your trading volume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left items-stretch">
              
              {/* Free Plan */}
              <div className="backdrop-blur-md shadow-[0_8px_30px_rgb(224,231,255,0.25)] hover:shadow-[0_15px_40px_rgb(224,231,255,0.4)] transition-all duration-500 hover:-translate-y-1 p-8 flex flex-col justify-between bg-white border border-slate-200/60 rounded-3xl">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Free Plan</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">Kickstart your trading review process.</p>
                  </div>
                  <div className="border-t border-b border-slate-100 py-6">
                    <span className="text-4xl font-extrabold text-slate-950">₹0</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">/ forever</span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 30 trades / month limit
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Manual trade journaling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Basic dashboard analytics
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 line-through">
                      No broker sync integrations
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 line-through">
                      No professional mentorship
                    </li>
                  </ul>
                </div>
                <Link
                  href="/signup"
                  className="mt-8 w-full py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-wider text-center block"
                >
                  Start Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="backdrop-blur-md hover:shadow-[0_15px_40px_rgb(224,231,255,0.4)] transition-all duration-500 hover:-translate-y-1 p-8 flex flex-col justify-between bg-white border-2 border-blue-500 rounded-3xl relative shadow-[0_20px_50px_rgba(37,99,235,0.08)]">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500 shadow-sm">
                  Most Popular
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Pro Plan</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">For active traders seeking complete data clarity.</p>
                  </div>
                  <div className="border-t border-b border-slate-100 py-6">
                    <span className="text-4xl font-extrabold text-slate-950">₹499</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">/ month</span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> Unlimited trade logging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> Broker sync simulations (Zerodha, Upstox)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> Advanced performance analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> AI Insights and summaries
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> Detailed strategy tracking &amp; tagging
                    </li>
                  </ul>
                </div>
                <Link
                  href="/signup?plan=pro"
                  className="mt-8 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider text-center block shadow-md shadow-blue-500/20"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Mentorship Plan */}
              <div className="backdrop-blur-md shadow-[0_8px_30px_rgb(224,231,255,0.25)] hover:shadow-[0_15px_40px_rgb(224,231,255,0.4)] transition-all duration-500 hover:-translate-y-1 p-8 flex flex-col justify-between bg-white border border-slate-200/60 rounded-3xl">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Mentorship Plan</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">For serious traders who want visual alignment & guidance.</p>
                  </div>
                  <div className="border-t border-b border-slate-100 py-6">
                    <span className="text-4xl font-extrabold text-slate-950">₹4,999</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">/ month</span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" /> Everything in Pro plan
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" /> Weekly portfolio review calls
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" /> Accountability & psychology guidance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" /> VIP Community & premium chat support
                    </li>
                  </ul>
                </div>
                <Link
                  href="/signup?plan=mentorship"
                  className="mt-8 w-full py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-wider text-center block"
                >
                  Join Mentorship
                </Link>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
