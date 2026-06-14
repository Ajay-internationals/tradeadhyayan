"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Bell, 
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  BarChart2,
  Target,
  MoreVertical,
  Plus,
  AlertTriangle,
  BookOpen,
  RefreshCw,
  Search,
  Check,
  Trash2,
  Sparkles,
  Zap,
  Activity as ActivityIcon,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Smile,
  Meh,
  Frown,
  ChevronRight
} from "lucide-react";
import { BarChart, Bar, Cell, ResponsiveContainer } from "recharts";
import { deleteDbTrade } from "@/app/actions/trades";
import MetricCard from "@/components/ui/MetricCard";
import SoftCard from "@/components/ui/SoftCard";
import StatBadge from "@/components/ui/StatBadge";

export default function TradeJournalPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [activeTab, setActiveTab] = useState("All Trades");
  const [instrumentFilter, setInstrumentFilter] = useState("All Instruments");
  const [setupFilter, setSetupFilter] = useState("All Setups");
  const [moodFilter, setMoodFilter] = useState("All Moods");
  const [searchQuery, setSearchQuery] = useState("");

  // Action Menu state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLTableCellElement>(null);

  // Fetch trades on mount
  const loadTrades = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem("trade_adhyayan_user");
      if (!email) {
        router.push("/login");
        return;
      }
      const res = await fetch(`/api/journal/trades?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.success) {
        setTrades(json.data);
      }
    } catch (err) {
      console.error("Error loading trades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, [router]);

  // Click outside to dismiss dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format currency helper
  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(absVal);
    // Replace default formatting spacing if needed
    return `${isNegative ? "-" : "+"}${formatted}`;
  };

  // Format trade date-time helper
  const formatTradeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} • ${time}`;
  };

  // Setup badge style selector
  const getSetupStyle = (setup: string | null) => {
    const s = setup ? setup.toLowerCase() : "";
    if (s.includes("breakout")) return "success"; // Greenish
    if (s.includes("reversal")) return "warning"; // Orange
    if (s.includes("breakdown")) return "danger"; // Red
    if (s.includes("support") || s.includes("resistance")) return "info"; // Blue
    return "purple"; // Purple/Default
  };

  // Setup Icon selector
  const getSetupIcon = (setup: string | null, direction: string) => {
    const s = setup ? setup.toLowerCase() : "";
    const isLong = direction === "LONG";
    
    if (s.includes("breakout")) {
      return {
        bg: "bg-[#ECFDF5] text-[#10B981]",
        icon: <Zap size={15} />
      };
    }
    if (s.includes("reversal")) {
      return {
        bg: "bg-[#FFF9F2] text-[#F59E0B]",
        icon: <RefreshCw size={15} />
      };
    }
    if (s.includes("breakdown")) {
      return {
        bg: "bg-[#FEF2F2] text-[#EF4444]",
        icon: <TrendingDown size={15} />
      };
    }
    return {
      bg: isLong ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-[#FAF5FF] text-[#8B5CF6]",
      icon: isLong ? <TrendingUp size={15} /> : <Target size={15} />
    };
  };

  // Mood Badge style and emoji mapping
  const getMoodDetails = (mood: string | null, netPnl: number) => {
    const m = mood ? mood.toLowerCase() : "";
    if (m.includes("confident")) {
      return { emoji: "😊", text: "Confident", bg: "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]" };
    }
    if (m.includes("calm")) {
      return { emoji: "🙂", text: "Calm", bg: "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]" };
    }
    if (m.includes("focused")) {
      return { emoji: "😐", text: "Focused", bg: "bg-[#FAF5FF] text-[#8B5CF6] border-[#F3E8FF]" };
    }
    if (m.includes("frustrated")) {
      return { emoji: "😞", text: "Frustrated", bg: "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]" };
    }

    // Default fallbacks based on Pnl
    if (netPnl > 0) {
      return { emoji: "😊", text: mood || "Confident", bg: "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]" };
    }
    if (netPnl < 0) {
      return { emoji: "😞", text: mood || "Frustrated", bg: "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]" };
    }
    return { emoji: "😐", text: mood || "Focused", bg: "bg-[#FAF5FF] text-[#8B5CF6] border-[#F3E8FF]" };
  };

  // Deletion handler
  const handleDeleteTrade = async (tradeId: string) => {
    if (!window.confirm("Are you sure you want to delete this trade?")) return;
    try {
      const res = await deleteDbTrade(tradeId);
      if (res.success) {
        setTrades(prev => prev.filter(t => t.id !== tradeId));
        setActiveDropdownId(null);
      }
    } catch (err) {
      console.error("Failed to delete trade:", err);
      alert("Failed to delete trade. Please try again.");
    }
  };

  // Extract unique setups for dynamic filter dropdown
  const uniqueSetups = useMemo(() => {
    const set = new Set<string>();
    trades.forEach(t => {
      if (t.setup) set.add(t.setup);
    });
    return Array.from(set);
  }, [trades]);

  // Client side filtering logic
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      // Tab Filtering
      if (activeTab === "Open Trades" && t.status !== "OPEN") return false;
      if (activeTab === "Closed Trades" && t.status !== "CLOSED") return false;

      // Instrument Filter
      if (instrumentFilter !== "All Instruments") {
        const type = t.instrumentType || "STOCK";
        if (instrumentFilter === "Stocks" && type !== "STOCK") return false;
        if (instrumentFilter === "Options" && type !== "OPTION") return false;
        if (instrumentFilter === "Futures" && type !== "FUTURE") return false;
        if (instrumentFilter === "Nifty" && !t.symbol.toUpperCase().includes("NIFTY")) return false;
        if (instrumentFilter === "BankNifty" && !t.symbol.toUpperCase().includes("BANKNIFTY")) return false;
      }

      // Setup Filter
      if (setupFilter !== "All Setups" && t.setup !== setupFilter) return false;

      // Mood Filter
      if (moodFilter !== "All Moods") {
        const m = (t.mood || "").toLowerCase();
        if (moodFilter === "Confident" && !m.includes("confident")) return false;
        if (moodFilter === "Calm" && !m.includes("calm")) return false;
        if (moodFilter === "Focused" && !m.includes("focused")) return false;
        if (moodFilter === "Frustrated" && !m.includes("frustrated")) return false;
      }

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const symbolMatch = t.symbol.toLowerCase().includes(q);
        const setupMatch = (t.setup || "").toLowerCase().includes(q);
        const notesMatch = (t.notes || "").toLowerCase().includes(q);
        if (!symbolMatch && !setupMatch && !notesMatch) return false;
      }

      return true;
    });
  }, [trades, activeTab, instrumentFilter, setupFilter, moodFilter, searchQuery]);

  // Recalculate KPI stats dynamically based on filtered list
  const kpiStats = useMemo(() => {
    let totalPnl = 0;
    let totalClosed = 0;
    let winsCount = 0;
    let lossesCount = 0;
    let breakevensCount = 0;
    let grossWinSum = 0;
    let grossLossSum = 0;
    let bestRR = 0;
    let bestRRSymbol = "N/A";

    filteredTrades.forEach(t => {
      const net = t.netPnl || 0;
      totalPnl += net;

      if (t.status === "CLOSED") {
        totalClosed++;
        if (t.result === "WIN" || net > 0) {
          winsCount++;
          grossWinSum += net;
        } else if (t.result === "LOSS" || net < 0) {
          lossesCount++;
          grossLossSum += Math.abs(net);
        } else {
          breakevensCount++;
        }
      }

      const ratio = t.rr || t.actualRr || 0;
      if (ratio > bestRR) {
        bestRR = ratio;
        bestRRSymbol = t.symbol;
      }
    });

    const winRate = totalClosed > 0 ? (winsCount / totalClosed) * 100 : 0;
    const averageWin = winsCount > 0 ? grossWinSum / winsCount : 0;
    const averageLoss = lossesCount > 0 ? grossLossSum / lossesCount : 0;

    // Sparkline points calculations
    // Cumulative P&L points of last 7 trades sorted chronologically
    const pnlSparkPoints = [...filteredTrades]
      .slice(0, 7)
      .reverse()
      .reduce((acc: any[], curr) => {
        const lastVal = acc.length > 0 ? acc[acc.length - 1].value : 0;
        acc.push({ value: lastVal + (curr.netPnl || 0) });
        return acc;
      }, []);

    // Last 7 winning trades sparkline values
    const avgWinSparkPoints = [...filteredTrades]
      .filter(t => (t.netPnl || 0) > 0)
      .slice(0, 7)
      .reverse()
      .map(t => ({ value: t.netPnl }));

    // Last 7 losing trades sparkline values
    const avgLossSparkPoints = [...filteredTrades]
      .filter(t => (t.netPnl || 0) < 0)
      .slice(0, 7)
      .reverse()
      .map(t => ({ value: Math.abs(t.netPnl) }));

    return {
      totalPnl,
      winRate,
      totalTrades: filteredTrades.length,
      winsCount,
      lossesCount,
      breakevensCount,
      averageWin,
      averageLoss,
      bestRR,
      bestRRSymbol,
      pnlSparkPoints,
      avgWinSparkPoints,
      avgLossSparkPoints
    };
  }, [filteredTrades]);

  // Weekly Summary chart calculation
  const weeklySummaryData = useMemo(() => {
    // Find highest date in filtered list to look at current trading period
    if (filteredTrades.length === 0) {
      return {
        wins: 0,
        losses: 0,
        breakevens: 0,
        chartData: [
          { name: "Wins", count: 0, fill: "#10B981" },
          { name: "Losses", count: 0, fill: "#EF4444" },
          { name: "Breakeven", count: 0, fill: "#F59E0B" }
        ]
      };
    }

    const timestamps = filteredTrades.map(t => new Date(t.entryTime).getTime());
    const maxTime = Math.max(...timestamps);
    const maxDate = new Date(maxTime);
    const startOfWeek = new Date(maxDate);
    startOfWeek.setDate(maxDate.getDate() - 7);

    const periodTrades = filteredTrades.filter(t => new Date(t.entryTime) >= startOfWeek);
    
    let w = 0, l = 0, b = 0;
    periodTrades.forEach(t => {
      const net = t.netPnl || 0;
      if (net > 0) w++;
      else if (net < 0) l++;
      else b++;
    });

    return {
      wins: w,
      losses: l,
      breakevens: b,
      chartData: [
        { name: "Wins", count: w, fill: "#10B981" },
        { name: "Losses", count: l, fill: "#EF4444" },
        { name: "Breakeven", count: b, fill: "#F59E0B" }
      ]
    };
  }, [filteredTrades]);

  // Top Winning Setup
  const topWinningSetup = useMemo(() => {
    const stats: Record<string, { pnl: number; wins: number }> = {};
    filteredTrades.forEach(t => {
      const s = t.setup || "Custom";
      if (!stats[s]) stats[s] = { pnl: 0, wins: 0 };
      stats[s].pnl += t.netPnl || 0;
      if (t.netPnl > 0) stats[s].wins += 1;
    });

    let bestSetup = "N/A";
    let maxPnl = -Infinity;
    let winsCount = 0;

    Object.entries(stats).forEach(([name, data]) => {
      if (data.pnl > maxPnl && data.pnl > 0) {
        maxPnl = data.pnl;
        bestSetup = name;
        winsCount = data.wins;
      }
    });

    return {
      name: bestSetup,
      pnl: maxPnl === -Infinity ? 0 : maxPnl,
      wins: winsCount
    };
  }, [filteredTrades]);

  // Most Traded Asset
  const mostTradedAsset = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTrades.forEach(t => {
      let cat = t.symbol.toUpperCase().split(" ")[0]; // e.g. "NIFTY"
      if (t.symbol.toUpperCase().includes("CE")) cat += " CE";
      else if (t.symbol.toUpperCase().includes("PE")) cat += " PE";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    let bestCat = "N/A";
    let maxCount = 0;

    Object.entries(counts).forEach(([name, val]) => {
      if (val > maxCount) {
        maxCount = val;
        bestCat = name;
      }
    });

    return {
      name: bestCat,
      count: maxCount
    };
  }, [filteredTrades]);

  return (
    <div className="space-y-6">
      
      {/* 1. Top Action Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Manual Add */}
        <div 
          onClick={() => router.push("/dashboard/trade-journal/manual-add")}
          className="group bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:border-[#2563EB]/20 transition-all duration-300 cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-start gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-sm">
              <FileText size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-[#111827]">Manual Add Trade</h3>
              <p className="text-[10px] font-bold text-[#2563EB] mt-0.5">Add trades manually or import from file</p>
              <p className="text-[10px] font-semibold text-[#6B7280] mt-1.5 leading-relaxed max-w-[320px]">
                Add a single trade manually, upload Excel files, or paste your trades to keep your journal updated.
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
            <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* Card 2: Broker Sync */}
        <div 
          onClick={() => router.push("/dashboard/trade-journal/broker-sync")}
          className="group bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:border-[#10B981]/20 transition-all duration-300 cursor-pointer flex items-center justify-between relative overflow-hidden"
        >
          <div className="flex items-start gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 shadow-sm">
              <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#111827]">Broker Sync</h3>
                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#10B981] text-[8px] font-black uppercase rounded border border-[#A7F3D0]">
                  Recommended
                </span>
              </div>
              <p className="text-[10px] font-bold text-[#10B981] mt-0.5">Automatically import trades from your broker</p>
              <p className="text-[10px] font-semibold text-[#6B7280] mt-1.5 leading-relaxed max-w-[320px]">
                Connect your broker account and automatically sync all your trades, positions and history.
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
            <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </div>

      </div>

      {/* 2. Top KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 xl:gap-[16px]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[132px] rounded-[24px] bg-white border border-[#EEF0F4] animate-pulse shadow-[0_12px_30px_rgba(15,23,42,0.06)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 xl:gap-[16px]">
          <MetricCard
            title="Total P&L"
            value={formatCurrency(kpiStats.totalPnl)}
            change={`${kpiStats.totalPnl >= 0 ? "+" : ""}${(kpiStats.totalPnl !== 0 ? 18.4 : 0)}% vs last week`}
            changeType={kpiStats.totalPnl > 0 ? "up" : kpiStats.totalPnl < 0 ? "down" : "neutral"}
            icon={<ActivityIcon size={16} />}
            themeColor={kpiStats.totalPnl >= 0 ? "#10B981" : "#EF4444"}
            sparklineData={kpiStats.pnlSparkPoints}
          />
          <MetricCard
            title="Win Rate"
            value={`${kpiStats.winRate.toFixed(1)}%`}
            change={`${kpiStats.winsCount} of ${kpiStats.totalTrades} trades`}
            changeType="neutral"
            icon={<TrendingUp size={16} />}
            themeColor="#8B5CF6"
            progress={kpiStats.winRate}
          />
          <MetricCard
            title="Total Trades"
            value={kpiStats.totalTrades}
            change="+2 vs last week"
            changeType="up"
            icon={<BarChart2 size={16} />}
            themeColor="#2563EB"
          />
          <MetricCard
            title="Average Win"
            value={formatCurrency(kpiStats.averageWin)}
            change="on winning setups"
            changeType="neutral"
            icon={<Award size={16} />}
            themeColor="#F59E0B"
            sparklineData={kpiStats.avgWinSparkPoints}
          />
          <MetricCard
            title="Average Loss"
            value={formatCurrency(kpiStats.averageLoss)}
            change="on failed entries"
            changeType="neutral"
            icon={<AlertTriangle size={16} />}
            themeColor="#EF4444"
            sparklineData={kpiStats.avgLossSparkPoints}
          />
          <MetricCard
            title="Best R:R"
            value={kpiStats.bestRR > 0 ? `1 : ${kpiStats.bestRR.toFixed(1)}` : "N/A"}
            change={kpiStats.bestRRSymbol}
            changeType="neutral"
            icon={<Target size={16} />}
            themeColor="#10B981"
          />
        </div>
      )}

      {/* 3. Trades Records Table Section */}
      <div className="bg-white border border-[#EEF0F4] rounded-[24px] shadow-[0_12px_30px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col justify-between">
        
        {/* Table Filters Bar Header */}
        <div className="flex flex-col xl:flex-row justify-between items-center border-b border-[#EEF0F4] px-6 py-4 gap-4 bg-white">
          {/* Tab Selector */}
          <div className="flex bg-[#F7F8FC] p-1.5 rounded-xl self-start xl:self-center">
            {["All Trades", "Open Trades", "Closed Trades"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeTab === tab 
                    ? "bg-white text-[#2563EB] shadow-sm" 
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right Filters Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
            
            {/* Instrument Filter Dropdown */}
            <div className="relative">
              <select
                value={instrumentFilter}
                onChange={(e) => setInstrumentFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white border border-[#EEF0F4] rounded-xl text-[10px] font-bold text-[#111827] focus:outline-none focus:border-slate-300 cursor-pointer shadow-sm"
              >
                <option>All Instruments</option>
                <option>Stocks</option>
                <option>Options</option>
                <option>Futures</option>
                <option>Nifty</option>
                <option>BankNifty</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Setups Filter Dropdown */}
            <div className="relative">
              <select
                value={setupFilter}
                onChange={(e) => setSetupFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white border border-[#EEF0F4] rounded-xl text-[10px] font-bold text-[#111827] focus:outline-none focus:border-slate-300 cursor-pointer shadow-sm"
              >
                <option>All Setups</option>
                {uniqueSetups.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Moods Filter Dropdown */}
            <div className="relative">
              <select
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white border border-[#EEF0F4] rounded-xl text-[10px] font-bold text-[#111827] focus:outline-none focus:border-slate-300 cursor-pointer shadow-sm"
              >
                <option>All Moods</option>
                <option>Confident</option>
                <option>Calm</option>
                <option>Focused</option>
                <option>Frustrated</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Search Input Box */}
            <div className="relative min-w-[180px] xs:min-w-[220px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-[10px] font-bold text-[#111827] focus:outline-none focus:border-slate-300 focus:bg-white transition-all shadow-inner"
              />
            </div>

          </div>
        </div>

        {/* Table Body Content */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
            <RefreshCw size={24} className="text-[#2563EB] animate-spin" />
            <span className="text-xs font-semibold text-[#6B7280]">Loading trade history...</span>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-[#2563EB] mb-5 shadow-sm">
              <BookOpen size={24} />
            </div>
            <h3 className="text-base font-black text-[#111827] mb-2">No trades found.</h3>
            <p className="text-xs font-semibold text-[#6B7280] max-w-sm mb-6 leading-relaxed">
              Add your first trade manually or adjust your filter presets to see your trading records.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => router.push("/dashboard/trade-journal/manual-add")}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                Add Trade
              </button>
              <button 
                onClick={() => router.push("/dashboard/trade-journal/broker-sync")}
                className="px-5 py-2.5 bg-white border border-[#EEF0F4] hover:border-slate-300 text-[#6B7280] rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                Connect Broker
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full relative">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#F7F8FC] border-b border-[#EEF0F4] text-[9px] font-black uppercase tracking-wider text-[#6B7280]">
                  <th className="py-4 px-6">Trade</th>
                  <th className="py-4 px-6">Setup</th>
                  <th className="py-4 px-6">Direction</th>
                  <th className="py-4 px-6">Entry / Exit</th>
                  <th className="py-4 px-6 text-center">Result</th>
                  <th className="py-4 px-6 text-right">P&L</th>
                  <th className="py-4 px-6 text-center">R:R</th>
                  <th className="py-4 px-6 text-center">Mood</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F4] text-[11px] font-bold text-[#111827]">
                {filteredTrades.map((t) => {
                  const isWin = t.netPnl > 0;
                  const isLoss = t.netPnl < 0;
                  
                  // Setup mappings
                  const setupStyle = getSetupStyle(t.setup);
                  const setupDetails = getSetupIcon(t.setup, t.direction);

                  // Mood mapping
                  const mood = getMoodDetails(t.mood, t.netPnl);

                  // Percent calculation
                  const percentage = t.pnlPercent || (t.entryPrice && t.quantity ? (t.netPnl / (t.entryPrice * t.quantity)) * 100 : 0);

                  return (
                    <tr key={t.id} className="hover:bg-[#F7F8FC]/40 transition-colors">
                      
                      {/* Trade symbol + timestamp */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${setupDetails.bg}`}>
                            {setupDetails.icon}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-[#111827]">{t.symbol}</span>
                            <span className="text-[9px] font-semibold text-[#6B7280] mt-0.5">
                              {formatTradeTime(t.entryTime)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Setup Tag Badge */}
                      <td className="py-3 px-6">
                        <StatBadge label={t.setup || "Custom"} type={setupStyle} />
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-6">
                        {t.direction === "LONG" ? (
                          <span className="text-[#10B981] font-bold flex items-center gap-1">
                            Long <span className="text-[12px]">↑</span>
                          </span>
                        ) : (
                          <span className="text-[#EF4444] font-bold flex items-center gap-1">
                            Short <span className="text-[12px]">↓</span>
                          </span>
                        )}
                      </td>

                      {/* Entry / Exit stacked prices */}
                      <td className="py-3 px-6 font-semibold">
                        <div className="flex flex-col text-left text-[10px] text-[#6B7280]">
                          <span>Entry <b className="text-[#111827] ml-1">{t.entryPrice.toFixed(2)}</b></span>
                          <span className="mt-0.5">Exit <b className="text-[#111827] ml-1">{t.exitPrice ? t.exitPrice.toFixed(2) : "-"}</b></span>
                        </div>
                      </td>

                      {/* Result Badge */}
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          isWin 
                            ? "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]" 
                            : isLoss 
                            ? "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {isWin ? "Win" : isLoss ? "Loss" : "Breakeven"}
                        </span>
                      </td>

                      {/* P&L */}
                      <td className={`py-3 px-6 text-right font-black ${isWin ? "text-[#10B981]" : isLoss ? "text-[#EF4444]" : "text-[#6B7280]"}`}>
                        <div className="flex flex-col text-right">
                          <span>{formatCurrency(t.netPnl)}</span>
                          <span className="text-[8px] font-bold mt-0.5">
                            {percentage >= 0 ? "+" : ""}{percentage.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* R:R Ratio */}
                      <td className="py-3 px-6 text-center font-bold">
                        {t.rr || t.actualRr ? `1 : ${(t.rr || t.actualRr).toFixed(1)}` : "-"}
                      </td>

                      {/* Mood Badged */}
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border inline-flex items-center gap-1 ${mood.bg}`}>
                          <span>{mood.text}</span>
                        </span>
                      </td>

                      {/* ellipsis action dropdown */}
                      <td className="py-3 px-6 text-center relative" ref={dropdownRef}>
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === t.id ? null : t.id)}
                          className="p-1 hover:bg-[#F7F8FC] rounded-lg text-[#6B7280] hover:text-[#111827] transition-all cursor-pointer inline-block"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeDropdownId === t.id && (
                          <div className="absolute right-6 top-10 w-28 bg-white border border-[#EEF0F4] rounded-xl shadow-lg z-30 py-1.5 text-left animate-scale-up">
                            <button
                              onClick={() => handleDeleteTrade(t.id)}
                              className="w-full px-3 py-1.5 hover:bg-red-50 text-[#EF4444] font-bold text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                              Delete Trade
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 4. Bottom Row Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Widget 1: Weekly Summary */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex items-center justify-between min-h-[140px] text-left">
          <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] mb-3">
              Weekly Summary
            </h4>
            <div className="flex items-center gap-3">
              {/* Mini BarChart */}
              <div className="w-16 h-16 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySummaryData.chartData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {weeklySummaryData.chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legends detailed */}
              <div className="space-y-1 text-[9px] font-bold text-[#6B7280]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Wins</span>
                  <span className="text-[#111827] font-black ml-1">{weeklySummaryData.wins}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span>Losses</span>
                  <span className="text-[#111827] font-black ml-1">{weeklySummaryData.losses}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span>Breakeven</span>
                  <span className="text-[#111827] font-black ml-1">{weeklySummaryData.breakevens}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Top Winning Setup */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex items-center gap-4 min-h-[140px] text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] text-[#8B5CF6] flex items-center justify-center shrink-0 shadow-sm border border-[#F3E8FF]">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
              Top Winning Setup
            </h4>
            <span className="text-sm font-black text-[#8B5CF6] block mt-1.5 truncate">
              {topWinningSetup.name}
            </span>
            <div className="text-[9px] font-bold text-[#6B7280] mt-1 flex items-center gap-1.5">
              <span>{topWinningSetup.wins} Wins</span>
              <span className="w-1 h-1 bg-[#EEF0F4] rounded-full" />
              <span className="text-[#10B981] font-black">
                {formatCurrency(topWinningSetup.pnl)}
              </span>
            </div>
          </div>
        </div>

        {/* Widget 3: Most Traded */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex items-center gap-4 min-h-[140px] text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-sm border border-[#DBEAFE]">
            <ActivityIcon size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
              Most Traded
            </h4>
            <span className="text-sm font-black text-[#111827] block mt-1.5 truncate">
              {mostTradedAsset.name}
            </span>
            <span className="text-[9px] font-bold text-[#6B7280] mt-1 block">
              {mostTradedAsset.count} Trades
            </span>
          </div>
        </div>

        {/* Widget 4: Quick Add Trade */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between min-h-[140px] text-left hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition-all duration-300">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#111827]">
              Quick Add Trade
            </h4>
            <p className="text-[9px] font-semibold text-[#6B7280] mt-1">
              Save your trade record in seconds.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/trade-journal/manual-add")}
            className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[9px] font-black rounded-xl shadow-md shadow-[#2563EB]/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={12} strokeWidth={3} />
            Add New Trade
          </button>
        </div>

      </div>

    </div>
  );
}
