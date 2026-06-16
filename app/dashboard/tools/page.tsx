"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Search,
  Grid,
  List,
  Clock,
  Plus,
  X,
  Info,
  Sliders,
  ChevronRight,
  TrendingUp,
  Percent,
  Scale,
  Brain,
  CheckSquare,
  Calendar,
  FileText,
  HelpCircle,
  PlayCircle,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: "Planning" | "Analysis" | "Execution" | "Utility" | "Psychology";
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  textColor: string;
  tagColor: string;
  popular?: boolean;
}

export default function ToolsDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([
    "pos_calc",
    "rr_calc",
    "pivot_calc",
    "fib_calc",
    "session_calc",
    "checklist_calc"
  ]);
  const [recentTools, setRecentTools] = useState<{ id: string; time: string }[]>([
    { id: "pos_calc", time: "2 hours ago" },
    { id: "rr_calc", time: "Yesterday" },
    { id: "fib_calc", time: "2 days ago" },
    { id: "session_calc", time: "3 days ago" }
  ]);

  // Modal control
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestCategory, setRequestCategory] = useState("Planning");
  const [requestDesc, setRequestDesc] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Calculator states
  // 1. Position Size Calculator
  const [posAccount, setPosAccount] = useState("100000");
  const [posRiskPercent, setPosRiskPercent] = useState("1");
  const [posEntry, setPosEntry] = useState("2500");
  const [posStop, setPosStop] = useState("2480");

  // 2. Risk Reward Calculator
  const [rrEntry, setRrEntry] = useState("2500");
  const [rrStop, setRrStop] = useState("2480");
  const [rrTarget, setRrTarget] = useState("2560");

  // 3. Pivot Points Calculator
  const [pivotHigh, setPivotHigh] = useState("2520");
  const [pivotLow, setPivotLow] = useState("2470");
  const [pivotClose, setPivotClose] = useState("2500");

  // 4. Fibonacci Calculator
  const [fibHigh, setFibHigh] = useState("2550");
  const [fibLow, setFibLow] = useState("2450");
  const [fibTrend, setFibTrend] = useState<"UP" | "DOWN">("UP");

  // 6. Pre-Trade Checklist
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: "Check overall market structure & sector bias score", checked: false },
    { id: 2, text: "Identify key support, resistance & pivot levels", checked: false },
    { id: 3, text: "Wait for precise entry signal (no FOMO entering)", checked: false },
    { id: 4, text: "Define exact stop-loss and target margins before trade execution", checked: false },
    { id: 5, text: "Calculate correct position size matching my risk management", checked: false },
    { id: 6, text: "Ensure mind is calm, clear, and disciplined (no greed or frustration)", checked: false }
  ]);

  // 8. Trade Plan Template
  const [planSetup, setPlanSetup] = useState("");
  const [planType, setPlanType] = useState("Breakout");
  const [planEntryCond, setPlanEntryCond] = useState("");
  const [planExitRules, setPlanExitRules] = useState("");

  // 9. Mental Game Journal
  const [mentalEmotion, setMentalEmotion] = useState("Calm");
  const [mentalFocus, setMentalFocus] = useState("5");
  const [mentalNotes, setMentalNotes] = useState("");
  const [mentalHistory, setMentalHistory] = useState<{ emotion: string; focus: string; notes: string; date: string }[]>([
    { emotion: "Calm", focus: "5", notes: "Ready to follow plans strictly.", date: "Today, 10:15 AM" },
    { emotion: "Excited", focus: "4", notes: "Won the first trade, feeling confident.", date: "Yesterday, 2:30 PM" }
  ]);

  // Load favorites and recents from localStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem("ta_tools_favorites");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
    const savedRecents = localStorage.getItem("ta_tools_recents");
    if (savedRecents) {
      setRecentTools(JSON.parse(savedRecents));
    }
  }, []);

  const tools: ToolItem[] = [
    {
      id: "pos_calc",
      title: "Position Size Calculator",
      description: "Calculate ideal position size based on risk.",
      longDescription: "Determine exactly how many shares or contracts you should purchase based on your capital, account risk percentage, entry price, and stop-loss price.",
      category: "Planning",
      popular: true,
      icon: <Percent className="w-5 h-5" />,
      color: "bg-[#F3E8FF] hover:bg-[#E9D5FF]",
      borderColor: "border-[#E9D5FF]",
      textColor: "text-[#7C3AED]",
      tagColor: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      id: "rr_calc",
      title: "Risk Reward Calculator",
      description: "Calculate potential profit, loss and R:R ratio.",
      longDescription: "Determine target prices, stop-loss margins, and the resulting risk-to-reward ratio of a trade setup to verify trade quality.",
      category: "Planning",
      popular: true,
      icon: <Scale className="w-5 h-5" />,
      color: "bg-[#ECFDF5] hover:bg-[#D1FAE5]",
      borderColor: "border-[#D1FAE5]",
      textColor: "text-[#059669]",
      tagColor: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      id: "pivot_calc",
      title: "Pivot Points Calculator",
      description: "Find support, resistance and pivot levels.",
      longDescription: "Calculate standard floor, Fibonacci, and Camarilla pivot points to identify key levels where price might bounce or reverse.",
      category: "Analysis",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-[#EFF6FF] hover:bg-[#DBEAFE]",
      borderColor: "border-[#DBEAFE]",
      textColor: "text-[#2563EB]",
      tagColor: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      id: "fib_calc",
      title: "Fibonacci Calculator",
      description: "Plot Fibonacci levels on any chart.",
      longDescription: "Plot key retracement levels (23.6%, 38.2%, 50.0%, 61.8%, 78.6%) from recent high and low price ranges to map support/resistance.",
      category: "Analysis",
      icon: <Sparkles className="w-5 h-5" />,
      color: "bg-[#FFF7ED] hover:bg-[#FFEDD5]",
      borderColor: "border-[#FFEDD5]",
      textColor: "text-[#EA580C]",
      tagColor: "bg-orange-50 text-orange-600 border-orange-100"
    },
    {
      id: "session_calc",
      title: "Trading Session Times",
      description: "View global market session timings.",
      longDescription: "Check current active global market trading sessions (New York, London, Tokyo, Sydney) to trade during peak volatility hours.",
      category: "Utility",
      icon: <Clock className="w-5 h-5" />,
      color: "bg-[#FFF1F2] hover:bg-[#FFE4E6]",
      borderColor: "border-[#FFE4E6]",
      textColor: "text-[#E11D48]",
      tagColor: "bg-[#FFF1F2] text-rose-600 border-rose-100"
    },
    {
      id: "checklist_calc",
      title: "Pre-Trade Checklist",
      description: "Use a checklist to stay consistent.",
      longDescription: "Go through a set of customized questions and checks before taking any trade to avoid emotional entries and enforce strategy rules.",
      category: "Execution",
      icon: <CheckSquare className="w-5 h-5" />,
      color: "bg-[#E6FFFA] hover:bg-[#B2F5EA]",
      borderColor: "border-[#B2F5EA]",
      textColor: "text-[#0D9488]",
      tagColor: "bg-[#E6FFFA] text-teal-600 border-teal-100"
    },
    {
      id: "econ_calc",
      title: "Economic Calendar",
      description: "Stay updated with important economic events.",
      longDescription: "Review scheduled macroeconomic disclosures (inflation report, employment rate, interest rate cuts) and their expected impact grades.",
      category: "Utility",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-[#FFFBEB] hover:bg-[#FEF3C7]",
      borderColor: "border-[#FEF3C7]",
      textColor: "text-[#D97706]",
      tagColor: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      id: "plan_calc",
      title: "Trade Plan Template",
      description: "Use a structured template to plan trades.",
      longDescription: "Draft structured plan descriptions detailing your setup criteria, entry conditions, and exit plans before pulling the trigger.",
      category: "Execution",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-[#F5F3FF] hover:bg-[#EDE9FE]",
      borderColor: "border-[#EDE9FE]",
      textColor: "text-[#6D3DF5]",
      tagColor: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    {
      id: "journal_calc",
      title: "Mental Game Journal",
      description: "Track emotions, focus and mindset.",
      longDescription: "Note down greed, fear, calmness, and fatigue metrics before entry to build psychological awareness and trading discipline.",
      category: "Psychology",
      icon: <Brain className="w-5 h-5" />,
      color: "bg-[#FDF2F8] hover:bg-[#FCE7F3]",
      borderColor: "border-[#FCE7F3]",
      textColor: "text-[#DB2777]",
      tagColor: "bg-pink-50 text-pink-600 border-pink-100"
    }
  ];

  // Map IDs to actual tools helper
  const toolsMap = useMemo(() => {
    return new Map(tools.map(t => [t.id, t]));
  }, [tools]);

  // Star / Unstar favorite toggle
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let nextFavs;
    if (favorites.includes(id)) {
      nextFavs = favorites.filter(fid => fid !== id);
      toast.success("Removed from Quick Access");
    } else {
      nextFavs = [...favorites, id];
      toast.success("Added to Quick Access");
    }
    setFavorites(nextFavs);
    localStorage.setItem("ta_tools_favorites", JSON.stringify(nextFavs));
  };

  // Open a tool and log recently used
  const openTool = (id: string) => {
    setActiveToolId(id);
    
    // Log recently used tool
    const filteredRecents = recentTools.filter(r => r.id !== id);
    const nextRecents = [{ id, time: "Just now" }, ...filteredRecents].slice(0, 4);
    setRecentTools(nextRecents);
    localStorage.setItem("ta_tools_recents", JSON.stringify(nextRecents));
  };

  // Filtered and searched tools list
  const filteredTools = useMemo(() => {
    return tools.filter(t => {
      const matchesCategory = selectedCategory === "all" || t.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Quick Access items mapping
  const quickAccessTools = useMemo(() => {
    return favorites.map(id => toolsMap.get(id)).filter((t): t is ToolItem => !!t);
  }, [favorites, toolsMap]);

  // Request tool form submit
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim() || !requestDesc.trim()) return;
    setSubmittingRequest(true);
    setTimeout(() => {
      toast.success("Request submitted! We'll evaluate it for future updates.");
      setShowRequestModal(false);
      setRequestTitle("");
      setRequestDesc("");
      setSubmittingRequest(false);
    }, 800);
  };

  // --- Dynamic Calculations Formulas ---
  // 1. Position Size Calculator
  const posResults = useMemo(() => {
    const acc = parseFloat(posAccount) || 0;
    const riskPct = parseFloat(posRiskPercent) || 0;
    const entry = parseFloat(posEntry) || 0;
    const stop = parseFloat(posStop) || 0;

    const riskAmt = acc * (riskPct / 100);
    const riskPerShare = Math.abs(entry - stop) || 0.01;
    const qty = riskPerShare > 0 ? Math.floor(riskAmt / riskPerShare) : 0;
    const totalVal = qty * entry;

    return { riskAmt, riskPerShare, qty, totalVal };
  }, [posAccount, posRiskPercent, posEntry, posStop]);

  // 2. Risk Reward Calculator
  const rrResults = useMemo(() => {
    const entry = parseFloat(rrEntry) || 0;
    const stop = parseFloat(rrStop) || 0;
    const target = parseFloat(rrTarget) || 0;

    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const ratio = risk > 0 ? (reward / risk).toFixed(2) : "0.00";

    return { risk, reward, ratio };
  }, [rrEntry, rrStop, rrTarget]);

  // 3. Pivot Points Calculator
  const pivotResults = useMemo(() => {
    const h = parseFloat(pivotHigh) || 0;
    const l = parseFloat(pivotLow) || 0;
    const c = parseFloat(pivotClose) || 0;

    const p = (h + l + c) / 3;
    const r1 = 2 * p - l;
    const s1 = 2 * p - h;
    const r2 = p + (h - l);
    const s2 = p - (h - l);
    const r3 = h + 2 * (p - l);
    const s3 = l - 2 * (h - p);

    return { p, r1, s1, r2, s2, r3, s3 };
  }, [pivotHigh, pivotLow, pivotClose]);

  // 4. Fibonacci Calculator
  const fibResults = useMemo(() => {
    const h = parseFloat(fibHigh) || 0;
    const l = parseFloat(fibLow) || 0;
    const range = h - l;

    const ratios = [0.236, 0.382, 0.5, 0.618, 0.786];
    
    return ratios.map(r => {
      const level = fibTrend === "UP" ? h - range * r : l + range * r;
      return { ratio: (r * 100).toFixed(1) + "%", price: level.toFixed(2) };
    });
  }, [fibHigh, fibLow, fibTrend]);

  // Live market sessions status checking
  // NYSE: 14:30 - 21:00 UTC
  // LSE: 08:00 - 16:30 UTC
  // TSE: 00:00 - 06:00 UTC
  // ASX: 23:00 - 05:00 UTC
  const sessionStatus = useMemo(() => {
    const currentHour = new Date().getUTCHours();
    return [
      { name: "Tokyo Session (TSE)", hours: "00:00 - 06:00 UTC", active: currentHour >= 0 && currentHour < 6 },
      { name: "London Session (LSE)", hours: "08:00 - 16:30 UTC", active: currentHour >= 8 && currentHour < 16 },
      { name: "New York Session (NYSE)", hours: "14:30 - 21:00 UTC", active: currentHour >= 14 && currentHour < 21 },
      { name: "Sydney Session (ASX)", hours: "23:00 - 05:00 UTC", active: currentHour >= 23 || currentHour < 5 }
    ];
  }, []);

  return (
    <div className="space-y-6 text-[#1E1B4B]">
      
      {/* ── SECTION 1: QUICK ACCESS ── */}
      <div className="bg-white p-6 rounded-[24px] border border-[#EEF0F4] shadow-sm text-left">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-50">
          <h2 className="text-sm font-black text-[#111827] uppercase tracking-wider">Quick Access</h2>
          <button
            onClick={() => setActiveToolId("checklist_calc")}
            className="border border-[#EEF0F4] hover:bg-slate-50 text-[#6D3DF5] font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Edit Favorites
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickAccessTools.map(t => (
            <div
              key={t.id}
              onClick={() => openTool(t.id)}
              className={`border border-[#EEF0F4] rounded-[20px] p-5 flex flex-col justify-between min-h-[160px] relative transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer ${t.color}`}
            >
              <button
                onClick={(e) => toggleFavorite(t.id, e)}
                className="absolute top-4 right-4 text-[#F59E0B] hover:text-slate-300"
              >
                <Star size={16} fill="#F59E0B" />
              </button>
              
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm shrink-0 ${t.textColor}`}>
                {t.icon}
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-black text-[#111827] leading-tight">{t.title}</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-snug">{t.description}</p>
              </div>

              <span className={`text-[10px] font-bold mt-4 flex items-center gap-1 ${t.textColor}`}>
                <span>Open Tool</span>
                <ChevronRight size={10} />
              </span>
            </div>
          ))}
          {quickAccessTools.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 italic text-xs">
              No favorites saved. Click the star icon on any tool card below to pin it here.
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: ALL TOOLS ── */}
      <div className="bg-white p-6 rounded-[24px] border border-[#EEF0F4] shadow-sm text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-50">
          <h2 className="text-sm font-black text-[#111827] uppercase tracking-wider">All Tools</h2>
          
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D3DF5] focus:outline-none transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-50 border border-[#EEF0F4] rounded-xl p-0.5 text-slate-400 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-white text-[#6D3DF5] shadow-sm" : "hover:text-[#0F172A]"}`}
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg cursor-pointer ${viewMode === "list" ? "bg-white text-[#6D3DF5] shadow-sm" : "hover:text-[#0F172A]"}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {["all", "planning", "analysis", "execution", "utility", "psychology"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all border capitalize cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-sm"
                  : "bg-slate-50 text-[#64748B] border-[#EEF0F4] hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tools grid/list layout */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTools.map(t => {
              const isFav = favorites.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => openTool(t.id)}
                  className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between min-h-[190px] relative text-left cursor-pointer"
                >
                  <button
                    onClick={(e) => toggleFavorite(t.id, e)}
                    className="absolute top-5 right-5 text-slate-300 hover:text-[#F59E0B]"
                  >
                    <Star size={16} fill={isFav ? "#F59E0B" : "none"} className={isFav ? "text-[#F59E0B]" : ""} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 shrink-0 ${t.textColor}`}>
                      {t.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-[#111827] leading-tight">{t.title}</h3>
                        {t.popular && (
                          <span className="bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold mt-4 flex-1 leading-relaxed">
                    {t.longDescription}
                  </p>

                  <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase ${t.tagColor}`}>
                      {t.category}
                    </span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${t.textColor}`}>
                      <span>Open</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-[#EEF0F4]">
            {filteredTools.map(t => {
              const isFav = favorites.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => openTool(t.id)}
                  className="py-4 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 ${t.textColor}`}>
                      {t.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-[#111827]">{t.title}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{t.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border uppercase ${t.tagColor}`}>
                      {t.category}
                    </span>
                    <button onClick={(e) => toggleFavorite(t.id, e)} className="text-slate-300 hover:text-[#F59E0B]">
                      <Star size={14} fill={isFav ? "#F59E0B" : "none"} className={isFav ? "text-[#F59E0B]" : ""} />
                    </button>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER ACTIONS & RECENTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Request New Tool widget */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#F5F3FF] to-[#FAF8FF] border border-[#EEF0F4] rounded-[24px] p-6 flex flex-col justify-between text-left shadow-sm">
          <div>
            <h3 className="text-sm font-black text-[#111827]">Request a New Tool</h3>
            <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">
              Missing a tool you need for planning or analytics? Let us know what you want to see and our development team will build it for the community!
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer mt-6 w-fit"
          >
            <span>Request Tool</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Recently Used Tools widget */}
        <div className="lg:col-span-2 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left">
          <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Clock size={14} className="text-[#6D3DF5]" />
            <span>Recently Used Tools</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentTools.map(r => {
              const t = toolsMap.get(r.id);
              if (!t) return null;
              return (
                <div
                  key={r.id}
                  onClick={() => openTool(r.id)}
                  className="bg-slate-50 hover:bg-slate-100/70 border border-[#EEF0F4] rounded-xl p-3 flex flex-col justify-between min-h-[90px] transition-colors cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-sm shrink-0 ${t.textColor}`}>
                    {t.icon}
                  </div>
                  <div className="mt-2.5">
                    <h4 className="text-[10px] font-black text-[#111827] truncate leading-none">{t.title}</h4>
                    <span className="text-[8px] font-semibold text-slate-400 block mt-1">{r.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── INTERACTIVE CALCULATOR DIALOG OVERLAYS ── */}
      {activeToolId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] text-left animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EEF0F4] flex justify-between items-center bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm ${toolsMap.get(activeToolId)?.textColor}`}>
                  {toolsMap.get(activeToolId)?.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[#0F172A]">{toolsMap.get(activeToolId)?.title}</h3>
                  <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{toolsMap.get(activeToolId)?.description}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveToolId(null)}
                className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body with Tool Calculators */}
            <div className="p-6 overflow-y-auto">
              
              {/* 1. POSITION SIZE CALCULATOR */}
              {activeToolId === "pos_calc" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Account Balance (₹)</label>
                      <input
                        type="number"
                        value={posAccount}
                        onChange={e => setPosAccount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#6D3DF5]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Risk Amount (%)</label>
                      <input
                        type="number"
                        value={posRiskPercent}
                        onChange={e => setPosRiskPercent(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#6D3DF5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Entry Price (₹)</label>
                      <input
                        type="number"
                        value={posEntry}
                        onChange={e => setPosEntry(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#6D3DF5]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Stop Loss (₹)</label>
                      <input
                        type="number"
                        value={posStop}
                        onChange={e => setPosStop(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#6D3DF5]"
                      />
                    </div>
                  </div>

                  {/* Calculations Result Summary box */}
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 mt-6 space-y-2">
                    <h4 className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider mb-2">Calculation Results</h4>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Total Risk Amount:</span>
                      <span className="font-bold text-[#111827]">₹{posResults.riskAmt.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Risk Per Share:</span>
                      <span className="font-bold text-[#111827]">₹{posResults.riskPerShare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 border-t border-purple-100 pt-2 mt-2">
                      <span className="font-bold text-[#7C3AED]">Recommended Quantity:</span>
                      <span className="font-black text-[#7C3AED] text-sm">{posResults.qty} shares</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                      <span>Total Trade Value:</span>
                      <span>₹{posResults.totalVal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. RISK REWARD CALCULATOR */}
              {activeToolId === "rr_calc" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Entry Price (₹)</label>
                      <input
                        type="number"
                        value={rrEntry}
                        onChange={e => setRrEntry(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Stop Loss (₹)</label>
                      <input
                        type="number"
                        value={rrStop}
                        onChange={e => setRrStop(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Target Price (₹)</label>
                      <input
                        type="number"
                        value={rrTarget}
                        onChange={e => setRrTarget(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mt-6 space-y-2">
                    <h4 className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-2">Calculation Results</h4>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Risk Margin per Share:</span>
                      <span className="font-bold text-[#EF4444]">₹{rrResults.risk.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Reward Margin per Share:</span>
                      <span className="font-bold text-[#10B981]">₹{rrResults.reward.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 border-t border-emerald-100 pt-2 mt-2">
                      <span className="font-bold text-[#059669]">Risk Reward Ratio:</span>
                      <span className="font-black text-[#059669] text-sm">1 : {rrResults.ratio}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PIVOT POINTS CALCULATOR */}
              {activeToolId === "pivot_calc" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">High Price (₹)</label>
                      <input
                        type="number"
                        value={pivotHigh}
                        onChange={e => setPivotHigh(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Low Price (₹)</label>
                      <input
                        type="number"
                        value={pivotLow}
                        onChange={e => setPivotLow(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Close Price (₹)</label>
                      <input
                        type="number"
                        value={pivotClose}
                        onChange={e => setPivotClose(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-6">
                    <h4 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-3">Pivot Levels (Classic)</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
                      <div className="flex justify-between border-b border-blue-50/50 pb-1">
                        <span className="text-slate-400">R3:</span>
                        <span>₹{pivotResults.r3.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-50/50 pb-1">
                        <span className="text-slate-400">S1:</span>
                        <span>₹{pivotResults.s1.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-50/50 pb-1">
                        <span className="text-slate-400">R2:</span>
                        <span>₹{pivotResults.r2.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-50/50 pb-1">
                        <span className="text-slate-400">S2:</span>
                        <span>₹{pivotResults.s2.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-50/50 pb-1">
                        <span className="text-slate-400">R1:</span>
                        <span>₹{pivotResults.r1.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-50/50 pb-1">
                        <span className="text-slate-400">S3:</span>
                        <span>₹{pivotResults.s3.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#2563EB] col-span-2 pt-2 border-t border-blue-100 mt-2">
                        <span>Pivot Point (PP):</span>
                        <span>₹{pivotResults.p.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. FIBONACCI CALCULATOR */}
              {activeToolId === "fib_calc" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">High Price (₹)</label>
                      <input
                        type="number"
                        value={fibHigh}
                        onChange={e => setFibHigh(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Low Price (₹)</label>
                      <input
                        type="number"
                        value={fibLow}
                        onChange={e => setFibLow(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1.5">Trend Direction</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFibTrend("UP")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          fibTrend === "UP" ? "bg-orange-50 border-orange-200 text-[#EA580C]" : "bg-white border-[#EEF0F4] text-slate-500"
                        }`}
                      >
                        UP Trend
                      </button>
                      <button
                        type="button"
                        onClick={() => setFibTrend("DOWN")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          fibTrend === "DOWN" ? "bg-orange-50 border-orange-200 text-[#EA580C]" : "bg-white border-[#EEF0F4] text-slate-500"
                        }`}
                      >
                        DOWN Trend
                      </button>
                    </div>
                  </div>

                  <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 mt-6">
                    <h4 className="text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3">Fibonacci Retracement Levels</h4>
                    <div className="space-y-2">
                      {fibResults.map((lvl, index) => (
                        <div key={index} className="flex justify-between text-xs font-semibold text-slate-600 border-b border-orange-50/30 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-400">{lvl.ratio} Retracement:</span>
                          <span className="font-bold text-[#111827]">₹{lvl.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. TRADING SESSION TIMES */}
              {activeToolId === "session_calc" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                    Global market session hours and active status. Liquid hours overlap New York and London.
                  </p>

                  <div className="space-y-3">
                    {sessionStatus.map((s, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                          s.active ? "bg-rose-50/50 border-rose-100" : "bg-slate-50/50 border-[#EEF0F4]"
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A]">{s.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">{s.hours}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                          s.active ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                        }`}>
                          {s.active ? "Open" : "Closed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. PRE-TRADE CHECKLIST */}
              {activeToolId === "checklist_calc" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                    Run through these checklist controls before executing your orders to remain consistent.
                  </p>

                  <div className="space-y-2.5">
                    {checklistItems.map(item => (
                      <label
                        key={item.id}
                        className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all hover:bg-slate-50/50 ${
                          item.checked ? "border-teal-200 bg-teal-50/20" : "border-[#EEF0F4] bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {
                            setChecklistItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i));
                          }}
                          className="mt-0.5 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className={`text-xs font-semibold leading-normal ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. ECONOMIC CALENDAR */}
              {activeToolId === "econ_calc" && (
                <div className="space-y-3">
                  {[
                    { title: "US Core CPI MoM", date: "Today, 6:00 PM", impact: "HIGH", impactColor: "bg-red-50 text-red-600 border-red-100" },
                    { title: "US Retail Sales MoM", date: "Tomorrow, 6:00 PM", impact: "MEDIUM", impactColor: "bg-amber-50 text-amber-600 border-amber-100" },
                    { title: "Initial Jobless Claims", date: "Thursday, 6:00 PM", impact: "LOW", impactColor: "bg-blue-50 text-blue-600 border-blue-100" },
                    { title: "FOMC Press Conference", date: "Friday, 11:30 PM", impact: "HIGH", impactColor: "bg-red-50 text-red-600 border-red-100" }
                  ].map((evt, idx) => (
                    <div key={idx} className="p-4 border border-[#EEF0F4] rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A]">{evt.title}</h4>
                        <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{evt.date}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black border uppercase ${evt.impactColor}`}>
                        {evt.impact} Impact
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. TRADE PLAN TEMPLATE */}
              {activeToolId === "plan_calc" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = `TRADE PLAN\n----------\nType: ${planType}\nSetup: ${planSetup}\nEntry Criteria: ${planEntryCond}\nExit Rules: ${planExitRules}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Trade Plan copied to clipboard!");
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Setup / Strategy</label>
                      <input
                        type="text"
                        value={planSetup}
                        onChange={e => setPlanSetup(e.target.value)}
                        placeholder="e.g. Reliance ORB"
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Setup Type</label>
                      <select
                        value={planType}
                        onChange={e => setPlanType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-bold focus:bg-white"
                      >
                        <option value="Breakout">Breakout</option>
                        <option value="Pullback">Pullback</option>
                        <option value="Reversal">Reversal</option>
                        <option value="Range Bound">Range Bound</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Entry Criteria</label>
                    <textarea
                      rows={2}
                      value={planEntryCond}
                      onChange={e => setPlanEntryCond(e.target.value)}
                      placeholder="e.g. 5-min candle closes above the high of the day..."
                      className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Exit Rules (Profit/Loss)</label>
                    <textarea
                      rows={2}
                      value={planExitRules}
                      onChange={e => setPlanExitRules(e.target.value)}
                      placeholder="e.g. Stop loss is low of breakout candle, target is 1:2 R:R..."
                      className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-lg text-xs font-bold transition-all shadow-md mt-6 cursor-pointer"
                  >
                    Copy & Export Plan
                  </button>
                </form>
              )}

              {/* 9. MENTAL GAME JOURNAL */}
              {activeToolId === "journal_calc" && (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const item = {
                        emotion: mentalEmotion,
                        focus: mentalFocus,
                        notes: mentalNotes,
                        date: "Today, Just now"
                      };
                      setMentalHistory(prev => [item, ...prev]);
                      setMentalNotes("");
                      toast.success("Mindset log saved successfully!");
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Primary Emotion</label>
                        <select
                          value={mentalEmotion}
                          onChange={e => setMentalEmotion(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-bold focus:bg-white"
                        >
                          <option value="Calm">Calm</option>
                          <option value="Fear">Fear</option>
                          <option value="Greed">Greed</option>
                          <option value="Excited">Excited</option>
                          <option value="Frustrated">Frustrated</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Focus Rating (1-5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={mentalFocus}
                          onChange={e => setMentalFocus(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">Trading Mindset Notes</label>
                      <input
                        type="text"
                        value={mentalNotes}
                        onChange={e => setMentalNotes(e.target.value)}
                        placeholder="Notes on emotional state, plan commitment..."
                        className="w-full px-3 py-2 bg-slate-50 border border-[#EEF0F4] rounded-lg text-xs font-semibold focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Log Mindset
                    </button>
                  </form>

                  <div className="border-t border-[#EEF0F4] pt-4 mt-6">
                    <h4 className="text-[10px] font-black text-[#111827] uppercase tracking-wider mb-3">Logged Mindsets</h4>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {mentalHistory.map((item, idx) => (
                        <div key={idx} className="p-3 border border-slate-50 bg-[#F8FAFC]/50 rounded-xl text-xs flex justify-between items-start">
                          <div>
                            <span className="font-bold text-[#111827]">Feeling: {item.emotion}</span>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-snug">{item.notes}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="bg-[#EEF2FF] text-[#6366F1] text-[8px] font-bold px-2 py-0.5 rounded-full">Focus: {item.focus}/5</span>
                            <span className="text-[8px] text-slate-400 block mt-1 font-semibold">{item.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── REQUEST A NEW TOOL OVERLAY DIALOG ── */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleRequestSubmit}
            className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] text-left animate-scale-up"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EEF0F4] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-[18px] text-[#0F172A]">Request a New Tool</h3>
                <p className="text-slate-400 text-[11px] font-medium mt-0.5">Let us know what trading calculator or utility you need.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Tool Name</label>
                <input
                  type="text"
                  required
                  value={requestTitle}
                  onChange={e => setRequestTitle(e.target.value)}
                  placeholder="e.g. Options Margin Calculator, Black-Scholes Formula..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Category Type</label>
                <select
                  value={requestCategory}
                  onChange={e => setRequestCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-bold focus:bg-white cursor-pointer"
                >
                  <option value="Planning">Planning</option>
                  <option value="Analysis">Analysis</option>
                  <option value="Execution">Execution</option>
                  <option value="Utility">Utility</option>
                  <option value="Psychology">Psychology</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Description & Formulas</label>
                <textarea
                  required
                  rows={3}
                  value={requestDesc}
                  onChange={e => setRequestDesc(e.target.value)}
                  placeholder="How should this tool work? Describe inputs, formulas, or output requirements..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#EEF0F4] flex justify-end gap-3 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="px-5 py-2.5 bg-white border border-[#EEF0F4] text-[#64748B] rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-6 py-2.5 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:bg-slate-200 disabled:text-[#64748B] disabled:shadow-none cursor-pointer"
              >
                {submittingRequest ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
