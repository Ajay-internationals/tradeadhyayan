"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getTrades } from "@/app/actions/trades";
import {
  RefreshCw,
  Trash2,
  Lock,
  Activity,
  Smile,
  Lightbulb,
  CheckCircle2,
  Info,
  CheckSquare,
  Sparkles,
  Download,
  Plus,
  Filter,
  ChevronRight,
  TrendingDown,
  Calendar,
  Clock,
  Compass,
  AlertTriangle,
  X
} from "lucide-react";

interface Trade {
  id: string;
  symbol: string;
  direction: string;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  stopLoss?: number | null;
  target?: number | null;
  setup?: string | null;
  pnl: number;
  netPnl: number;
}

interface TradeMistake {
  id: string;
  userId: string;
  tradeId: string;
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  lossImpact?: number | null;
  rootCause?: string | null;
  suggestion?: string | null;
  mentorNote?: string | null;
  status: "OPEN" | "REVIEWED" | "FIXED";
  createdAt: string;
  trade?: Trade;
}

export default function MistakesPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("CLIENT");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "all" | "pattern" | "root" | "fix">("overview");

  const [trades, setTrades] = useState<any[]>([]);
  const [mistakes, setMistakes] = useState<TradeMistake[]>([]);
  const [mistakeSummary, setMistakeSummary] = useState<any>(null);

  // Filters State
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Manual Mistake Logger Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mistakeTradeId, setMistakeTradeId] = useState("");
  const [mistakeType, setMistakeType] = useState("Revenge Trading");
  const [mistakeSeverity, setMistakeSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [mistakeReason, setMistakeReason] = useState("");
  const [mistakeLoss, setMistakeLoss] = useState("");
  const [mistakeRootCause, setMistakeRootCause] = useState("");
  const [mistakeTip, setMistakeTip] = useState("");

  // Mistake Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMistake, setSelectedMistake] = useState<TradeMistake | null>(null);
  const [detailStatus, setDetailStatus] = useState<"OPEN" | "REVIEWED" | "FIXED">("OPEN");
  const [detailRootCause, setDetailRootCause] = useState("");
  const [detailMentorNote, setDetailMentorNote] = useState("");

  const fetchMistakeSummary = async (emailParam?: string) => {
    try {
      const email = emailParam || userEmail || localStorage.getItem('trade_adhyayan_user') || "";
      if (!email) return;
      const res = await fetch(`/api/mistakes/summary?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setMistakeSummary(data);
        if (data.mistakes) {
          setMistakes(data.mistakes);
        }
      }
    } catch (err) {
      console.error("Error fetching mistake summary:", err);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('trade_adhyayan_user');
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);

    const loadData = async () => {
      setIsLoading(true);
      try {
        const dbTrades = await getTrades(email);
        setTrades(dbTrades);

        // Fetch User profile to set userRole
        const profileRes = await fetch(`/api/user/me?email=${encodeURIComponent(email)}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserRole(profile.role || "CLIENT");
        }

        await fetchMistakeSummary(email);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAutoDetectMistakes = async () => {
    const tid = toast.loading("Scanning trades for emotional patterns...");
    try {
      setIsLoading(true);
      const res = await fetch("/api/mistakes/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });

      if (res.ok) {
        const data = await res.json();
        await fetchMistakeSummary();
        toast.success(`Scan complete! Detected ${data.count} mistakes.`, { id: tid });
      } else {
        toast.error("Auto-detection failed.", { id: tid });
      }
    } catch (e) {
      console.error(e);
      toast.error("AI scan failed.", { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManualMistake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mistakeTradeId || !mistakeType) {
      toast.error("Please select a trade.");
      return;
    }
    const tid = toast.loading("Saving mistake log...");
    try {
      const res = await fetch("/api/mistakes/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          tradeId: mistakeTradeId,
          type: mistakeType,
          severity: mistakeSeverity,
          reason: mistakeReason || `Manual mistake logged: ${mistakeType}`,
          lossImpact: parseFloat(mistakeLoss) || 0,
          rootCause: mistakeRootCause || null,
          suggestion: mistakeTip || null
        })
      });

      if (res.ok) {
        await fetchMistakeSummary();
        setIsAddModalOpen(false);
        setMistakeReason("");
        setMistakeLoss("");
        setMistakeTip("");
        setMistakeTradeId("");
        setMistakeRootCause("");
        toast.success("Mistake logged successfully! 🧠", { id: tid });
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to log mistake.", { id: tid });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving mistake.", { id: tid });
    }
  };

  const handleOpenDetailModal = (mst: TradeMistake) => {
    setSelectedMistake(mst);
    setDetailStatus(mst.status);
    setDetailRootCause(mst.rootCause || "");
    setDetailMentorNote(mst.mentorNote || "");
    setIsDetailModalOpen(true);
  };

  const handleUpdateMistake = async () => {
    if (!selectedMistake) return;
    const tid = toast.loading("Updating mistake...");
    try {
      const res = await fetch(`/api/mistakes/${selectedMistake.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: detailStatus,
          rootCause: detailRootCause || null,
          mentorNote: detailMentorNote || null
        })
      });

      if (res.ok) {
        await fetchMistakeSummary();
        setIsDetailModalOpen(false);
        toast.success("Mistake details updated!", { id: tid });
      } else {
        toast.error("Failed to update mistake.", { id: tid });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error updating mistake.", { id: tid });
    }
  };

  const handleDeleteMistake = async (mistakeId: string) => {
    if (!confirm("Are you sure you want to delete this mistake log?")) return;
    const tid = toast.loading("Deleting mistake...");
    try {
      const res = await fetch(`/api/mistakes/${mistakeId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchMistakeSummary();
        toast.success("Mistake deleted.", { id: tid });
      } else {
        toast.error("Failed to delete.", { id: tid });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error deleting mistake.", { id: tid });
    }
  };

  const handleExportReport = () => {
    if (mistakes.length === 0) {
      toast.error("No mistakes to export.");
      return;
    }
    const headers = ["Date", "Symbol", "Mistake", "Severity", "Loss Impact", "Reason", "Status", "Root Cause", "Mentor Note"];
    const rows = mistakes.map(m => [
      new Date(m.createdAt).toLocaleDateString(),
      m.trade?.symbol || "N/A",
      m.type,
      m.severity,
      `₹${m.lossImpact || 0}`,
      m.reason.replace(/"/g, '""'),
      m.status,
      m.rootCause || "N/A",
      (m.mentorNote || "N/A").replace(/"/g, '""')
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Trade_Adhyayan_Mistakes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Mistakes report exported successfully! 📊");
  };

  // Helper for rendering severity tags
  const getSeverityStyle = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "HIGH":
        return "bg-red-50 text-red-600 border border-red-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "LOW":
      default:
        return "bg-sky-50 text-sky-600 border border-sky-200";
    }
  };

  // Helper for status styling
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "FIXED":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "REVIEWED":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "OPEN":
      default:
        return "bg-red-50 text-red-600 border border-red-200 animate-pulse";
    }
  };

  // Discipline score description
  const getScoreDescription = (score: number) => {
    if (score >= 80) return { title: "Highly Disciplined", desc: "Superb risk management. Your emotional discipline is guarding your capital.", color: "text-emerald-500" };
    if (score >= 50) return { title: "Needs Attention", desc: "Repeated mistakes are dragging down your P&L. Stick to your rulebook.", color: "text-amber-500" };
    return { title: "High Capital Risk", desc: "Dangerous discipline lapse levels. Stop trading and review rules immediately.", color: "text-red-500" };
  };

  // Filtered mistakes
  const filteredMistakes = mistakes.filter(m => {
    const matchSeverity = filterSeverity === "ALL" || m.severity.toUpperCase() === filterSeverity;
    const matchStatus = filterStatus === "ALL" || m.status.toUpperCase() === filterStatus;
    const matchType = filterType === "ALL" || m.type.toUpperCase() === filterType.toUpperCase();
    const matchSearch =
      m.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.trade?.symbol || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSeverity && matchStatus && matchType && matchSearch;
  });

  const uniqueMistakeTypes = Array.from(new Set(mistakes.map(m => m.type)));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8 h-full font-sans">
      <div className="max-w-6xl mx-auto space-y-6 text-left">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Mistake Tracker</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Find repeated trading mistakes before they damage your capital.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add Manual Mistake</span>
            </button>
            <button
              onClick={handleAutoDetectMistakes}
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/15 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Scanning..." : "Scan & Detect"}</span>
            </button>
          </div>
        </div>

        {/* Lock Warning Banner */}
        {mistakeSummary?.showWarning && (
          <div className="p-4 bg-[#FEE2E2] border border-red-200 rounded-[20px] shadow-sm flex items-start gap-4 animate-fade-in">
            <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0 mt-0.5">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-red-800 tracking-tight">Mistake Lock Rule Active!</h4>
              <p className="text-xs text-red-600 mt-0.5 font-medium">{mistakeSummary.warningMessage}</p>
            </div>
          </div>
        )}

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Mistakes */}
          <div className="p-5 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Mistakes</span>
              <span className="p-1.5 bg-[#FAF9FF] text-[#7C3AED] rounded-lg">
                <Activity className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-[#111827] mt-3">{mistakeSummary?.totalMistakes ?? 0}</p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1">From scan + manual trades</span>
          </div>

          {/* Card 2: Most Repeated Mistake */}
          <div className="p-5 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Most Repeated</span>
              <span className="p-1.5 bg-[#FFF9F2] text-amber-600 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </span>
            </div>
            <p className="text-lg font-bold text-slate-800 truncate mt-3 pr-2">
              {mistakeSummary?.mostRepeatedMistake && mistakeSummary?.mostRepeatedMistake !== "None" 
                ? mistakeSummary.mostRepeatedMistake 
                : "No mistakes"}
            </p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1">Highest frequency type</span>
          </div>

          {/* Card 3: Loss Due To Mistakes */}
          <div className="p-5 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Loss Due to Mistakes</span>
              <span className="p-1.5 bg-[#FEE2E2] text-red-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-red-500 mt-3">₹{(mistakeSummary?.lossDueToMistakes ?? 0).toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1">Sum net P&L of error trades</span>
          </div>

          {/* Card 4: Discipline Score */}
          <div className="p-5 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Discipline Score</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 mt-3">{mistakeSummary?.disciplineScore ?? 100}/100</p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1">100 - base & severity penalties</span>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="border-b border-[#E5E7EB] flex flex-wrap gap-2 pt-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "all", label: "All Mistakes" },
            { id: "pattern", label: "Pattern Analysis" },
            { id: "root", label: "Root Cause" },
            { id: "fix", label: "Fix Plan" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#7C3AED] text-[#7C3AED]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty State check for entire page if no mistakes */}
        {mistakes.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[350px] shadow-sm">
            <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
              <Smile className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No major mistakes detected</h3>
            <p className="text-sm text-slate-500 max-w-sm">Your recent trades look disciplined. Keep following your trading rules.</p>
            <button
              onClick={() => router.push('/dashboard/trade-journal')}
              className="mt-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Review Journal
            </button>
          </div>
        ) : (
          /* Tab Contents */
          <div className="space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Discipline Score Gauge */}
                <div className="md:col-span-5 bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 self-start">Discipline Gauge</h3>
                  
                  <div className="relative flex items-center justify-center">
                    <svg className="w-36 h-36">
                      <circle
                        className="text-slate-100"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="55"
                        cx="72"
                        cy="72"
                      />
                      <circle
                        className={`${
                          (mistakeSummary?.disciplineScore ?? 100) >= 80 ? "text-emerald-500" :
                          (mistakeSummary?.disciplineScore ?? 100) >= 50 ? "text-amber-500" : "text-red-500"
                        } transition-all duration-700`}
                        strokeWidth="10"
                        strokeDasharray="345.5"
                        strokeDashoffset={345.5 - (345.5 * (mistakeSummary?.disciplineScore ?? 100)) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="55"
                        cx="72"
                        cy="72"
                      />
                    </svg>
                    <span className="absolute text-3xl font-black text-slate-800">
                      {mistakeSummary?.disciplineScore ?? 100}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className={`text-base font-bold ${getScoreDescription(mistakeSummary?.disciplineScore ?? 100).color}`}>
                      {getScoreDescription(mistakeSummary?.disciplineScore ?? 100).title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                      {getScoreDescription(mistakeSummary?.disciplineScore ?? 100).desc}
                    </p>
                  </div>
                </div>

                {/* Dynamic Insights & Recent Mistakes */}
                <div className="md:col-span-7 space-y-6">
                  
                  {/* Rule-Engine Insights */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Dynamic Mistake Insights</h4>
                        <p className="text-[11px] text-[#8C8CA1] font-semibold">AI & rule-matching insights from your journal</p>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-[#7C4DFF] text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Rule Engine Active</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {mistakeSummary?.insights && mistakeSummary.insights.length > 0 ? (
                        mistakeSummary.insights.map((insight: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 leading-relaxed flex items-start gap-3"
                          >
                            <div className="p-1.5 bg-indigo-50 rounded-lg text-[#7C4DFF] shrink-0">
                              <Lightbulb className="w-3.5 h-3.5" />
                            </div>
                            <span className="pt-0.5">{insight}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-center text-xs text-slate-400 font-semibold">
                          No pattern insights found. Keep logging trades to build statistics.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Mistakes */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-800">Recent Mistakes</h4>
                      <button
                        onClick={() => setActiveTab("all")}
                        className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-[#F3F4F6]">
                      {mistakes.slice(0, 4).map((mst) => (
                        <div
                          key={mst.id}
                          onClick={() => handleOpenDetailModal(mst)}
                          className="py-3 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{mst.type}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getSeverityStyle(mst.severity)}`}>
                                {mst.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 max-w-sm truncate">{mst.reason}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-600">
                              {mst.trade?.symbol || "N/A"}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusStyle(mst.status)}`}>
                              {mst.status}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ALL MISTAKES TABLE TAB */}
            {activeTab === "all" && (
              <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-6">
                
                {/* Table Filters sub-header */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search mistakes, symbols, reason..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full max-w-md px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Severity:</span>
                      <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold bg-white focus:outline-none"
                      >
                        <option value="ALL">All Severities</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Status:</span>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold bg-white focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="FIXED">Fixed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Type:</span>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold bg-white focus:outline-none max-w-[150px]"
                      >
                        <option value="ALL">All Types</option>
                        {uniqueMistakeTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Symbol</th>
                        <th className="py-3.5 px-4">Mistake Type</th>
                        <th className="py-3.5 px-4">Severity</th>
                        <th className="py-3.5 px-4 text-right">Loss Impact</th>
                        <th className="py-3.5 px-4">Reason</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {filteredMistakes.length > 0 ? (
                        filteredMistakes.map((mst) => (
                          <tr key={mst.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(mst.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-[#111827]">
                              {mst.trade?.symbol || "N/A"}
                            </td>
                            <td className="py-3.5 px-4 text-[#7C3AED] font-bold">
                              {mst.type}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getSeverityStyle(mst.severity)}`}>
                                {mst.severity}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-red-500 font-bold whitespace-nowrap">
                              ₹{(mst.lossImpact || 0).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 font-normal">
                              {mst.reason}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusStyle(mst.status)}`}>
                                {mst.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenDetailModal(mst)}
                                  className="px-2.5 py-1 bg-[#FAF9FF] text-[#7C3AED] hover:bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleDeleteMistake(mst.id)}
                                  className="p-1 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 font-normal">
                            No mistakes matching the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* PATTERN ANALYSIS TAB */}
            {activeTab === "pattern" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Mistakes by Day of the Week */}
                <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#7C3AED]" />
                    <h3 className="text-sm font-bold text-slate-800">Lapses by Day of Week</h3>
                  </div>
                  
                  <div className="space-y-3.5">
                    {Object.entries(mistakeSummary?.byDayOfWeek || {}).map(([day, count]: any) => {
                      const maxVal = Math.max(...(Object.values(mistakeSummary?.byDayOfWeek || {}) as number[]), 0);
                      const percentage = maxVal > 0 ? (count / maxVal) * 100 : 0;
                      return (
                        <div key={day} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{day}</span>
                            <span>{count} occurrences</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#7C3AED] h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mistakes by Time of Day */}
                <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#7C3AED]" />
                    <h3 className="text-sm font-bold text-slate-800">Lapses by Time of Day</h3>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { key: "Morning", label: "Morning Session (9:00 - 12:00)", color: "bg-sky-400" },
                      { key: "Afternoon", label: "Afternoon Session (12:00 - 15:30)", color: "bg-amber-400" },
                      { key: "Late", label: "Late/Overnight (After 15:30)", color: "bg-slate-400" }
                    ].map((slot) => {
                      const count = mistakeSummary?.byTimeOfDay?.[slot.key] ?? 0;
                      const total = (Object.values(mistakeSummary?.byTimeOfDay || {}) as number[]).reduce((a: number, b: number) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={slot.key} className="space-y-1.5 text-left">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-700">{slot.label}</span>
                            <span className="text-slate-500">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`${slot.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ROOT CAUSE TAB */}
            {activeTab === "root" && (
              <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-6">
                
                <div className="flex items-start gap-3">
                  <Compass className="w-5 h-5 text-[#7C3AED] mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Psychology & Emotional Root Cause Breakdown</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Determine the mental state causing execution errors by reviewing your details modal.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Progress List */}
                  <div className="space-y-4">
                    {Object.entries(mistakeSummary?.byRootCause || {}).map(([cause, count]: any) => {
                      const total = (Object.values(mistakeSummary?.byRootCause || {}) as number[]).reduce((a: number, b: number) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={cause} className="space-y-1 text-left">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-700">{cause}</span>
                            <span className="text-slate-500">{count} mistakes ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-slate-50 h-2.5 border border-slate-100 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-[#7C3AED] h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}

                    {(Object.values(mistakeSummary?.byRootCause || {}) as number[]).reduce((a: number, b: number) => a + b, 0) === 0 && (
                      <div className="p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-center text-xs text-slate-400 font-semibold">
                        No psychology root causes assigned. Edit mistakes in the table to link root causes.
                      </div>
                    )}
                  </div>

                  {/* Context Info */}
                  <div className="bg-[#FAF9FF] border border-indigo-100 rounded-[20px] p-5 space-y-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[#7C4DFF]">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wider">Psychology Advisory</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      Your trading data suggests a lack of systematic rule compliance is frequently caused by emotional triggers.
                    </p>
                    <div className="text-[11px] text-slate-500 font-medium leading-relaxed bg-white border border-slate-100 p-3.5 rounded-xl space-y-2">
                      <p>💡 <strong>Rulebook Routine:</strong> Complete checklist items before entry.</p>
                      <p>🧘 <strong>Timeout Routine:</strong> Close terminal if 2 losses occur in the same day.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* FIX PLAN TAB */}
            {activeTab === "fix" && (
              <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm space-y-6">
                
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Habit-Based Fix Plans</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Custom corrective routines mapped to your repeated trading errors.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    {
                      type: "Revenge Trading",
                      title: "Timeout Break Rule",
                      guide: "After every loss, close your terminal and take a 20-minute cooling break. No exceptions.",
                      color: "border-red-100 bg-red-50/20 text-red-700"
                    },
                    {
                      type: "Overtrading",
                      title: "Daily Trade Cap Lock",
                      guide: "Limit yourself strictly to 3 trades per day. Shut down charts once the third trade is closed.",
                      color: "border-amber-100 bg-amber-50/20 text-amber-700"
                    },
                    {
                      type: "No Stop Loss",
                      title: "Hard System Stop Loss",
                      guide: "Pre-define Stop Loss on your broker terminal. Do not enter any trade with a market order without pre-calculated SL.",
                      color: "border-rose-100 bg-rose-50/20 text-rose-700"
                    },
                    {
                      type: "Risk Too High",
                      title: "Position Sizing Calculator",
                      guide: "Keep risk below 1% of capital. Use our risk calculator to adjust quantities before placing order.",
                      color: "border-sky-100 bg-sky-50/20 text-sky-700"
                    },
                    {
                      type: "Early Exit",
                      title: "Target Trust Routine",
                      guide: "Trust your risk-reward. Trailing stops can secure break-even, but avoid closing green trades out of fear.",
                      color: "border-emerald-100 bg-emerald-50/20 text-emerald-700"
                    },
                    {
                      type: "Late Entry",
                      title: "Set Limit Orders",
                      guide: "Use limit orders at key breakouts. If price extends > 1.5% away, skip the trade and wait for next setup.",
                      color: "border-indigo-100 bg-indigo-50/20 text-indigo-700"
                    }
                  ].map((plan, idx) => {
                    const hasMistake = uniqueMistakeTypes.includes(plan.type);
                    return (
                      <div
                        key={idx}
                        className={`p-5 border rounded-[20px] space-y-3 relative overflow-hidden transition-all ${
                          hasMistake 
                            ? `${plan.color} scale-[1.02] border-2 shadow-sm` 
                            : "border-slate-200 bg-white opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-black uppercase bg-white/80 border border-current px-2.5 py-0.5 rounded-full inline-block">
                              {plan.type}
                            </span>
                            <h4 className="text-sm font-black text-slate-800 mt-2">{plan.title}</h4>
                          </div>
                          {hasMistake && (
                            <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                              Priority Fix
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          {plan.guide}
                        </p>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        )}

        {/* MODAL: ADD MANUAL MISTAKE */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] w-full max-w-lg shadow-xl overflow-hidden animate-scale-up text-left">
              <div className="px-6 py-5 border-b border-[#F3F4F6] flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Log Manual Mistake</h3>
                  <p className="text-[11px] text-[#8C8CA1] font-semibold mt-0.5">Document discipline lapses on specific trade executions</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddManualMistake} className="p-6 space-y-4">
                
                {/* Select Trade */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Ticker Trade</label>
                  <select
                    required
                    value={mistakeTradeId}
                    onChange={(e) => setMistakeTradeId(e.target.value)}
                    className="w-full px-3 h-11 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="">-- Choose Trade --</option>
                    {trades.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.symbol} ({t.direction}) - P&L: ₹{(t.pnl || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Mistake Pattern */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mistake Pattern</label>
                    <select
                      value={mistakeType}
                      onChange={(e) => setMistakeType(e.target.value)}
                      className="w-full px-3 h-11 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="Revenge Trading">Revenge Trading</option>
                      <option value="Overtrading">Overtrading</option>
                      <option value="No Stop Loss">No Stop Loss</option>
                      <option value="Risk Too High">Risk Too High</option>
                      <option value="Early Exit">Early Exit</option>
                      <option value="Late Entry">Late Entry</option>
                      <option value="Against Trend">Against Trend</option>
                      <option value="Checklist Ignored">Checklist Ignored</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Severity</label>
                    <select
                      value={mistakeSeverity}
                      onChange={(e) => setMistakeSeverity(e.target.value as any)}
                      className="w-full px-3 h-11 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="LOW">Low Severity</option>
                      <option value="MEDIUM">Medium Severity</option>
                      <option value="HIGH">High Severity</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Est. Loss Impact */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Est. Loss Impact (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2500"
                      value={mistakeLoss}
                      onChange={(e) => setMistakeLoss(e.target.value)}
                      className="w-full px-3.5 h-11 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  {/* Root Cause */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Psychology Root Cause</label>
                    <select
                      value={mistakeRootCause}
                      onChange={(e) => setMistakeRootCause(e.target.value)}
                      className="w-full px-3 h-11 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="">-- Select State --</option>
                      <option value="Fear">Fear</option>
                      <option value="Greed">Greed</option>
                      <option value="FOMO">FOMO</option>
                      <option value="Anger">Anger</option>
                      <option value="Impatience">Impatience</option>
                      <option value="No plan">No plan</option>
                      <option value="Overconfidence">Overconfidence</option>
                    </select>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">What went wrong?</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide a brief explanation of the mental lapse..."
                    value={mistakeReason}
                    onChange={(e) => setMistakeReason(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
                  ></textarea>
                </div>

                {/* Tip */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Corrective Action Suggestion</label>
                  <input
                    type="text"
                    placeholder="e.g. Take a walk after any loss."
                    value={mistakeTip}
                    onChange={(e) => setMistakeTip(e.target.value)}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 h-11 border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/15"
                  >
                    Save Mistake Log
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL: MISTAKE DETAIL VIEW */}
        {isDetailModalOpen && selectedMistake && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] w-full max-w-xl shadow-xl overflow-hidden animate-scale-up text-left">
              <div className="px-6 py-5 border-b border-[#F3F4F6] flex justify-between items-center">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-800">Mistake Investigation</h3>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getSeverityStyle(selectedMistake.severity)}`}>
                    {selectedMistake.severity} severity
                  </span>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                
                {/* Trade Summary */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400">Trade Execution Summary</h4>
                  <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-xs">
                    <div>
                      <p className="text-slate-400 text-[10px] font-medium">Symbol</p>
                      <p className="font-bold text-slate-800">{selectedMistake.trade?.symbol || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-medium">Direction</p>
                      <p className="font-bold text-slate-800">{selectedMistake.trade?.direction || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-medium">Quantity</p>
                      <p className="font-bold text-slate-800">{selectedMistake.trade?.quantity || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-medium">Entry Price</p>
                      <p className="font-bold text-slate-800">₹{(selectedMistake.trade?.entryPrice || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-medium">Exit Price</p>
                      <p className="font-bold text-slate-800">₹{(selectedMistake.trade?.exitPrice || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-medium">Trade P&L</p>
                      <p className={`font-bold ${((selectedMistake.trade?.pnl || 0) >= 0) ? "text-emerald-600" : "text-red-500"}`}>
                        ₹{(selectedMistake.trade?.pnl || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-400">Mistake Explanation</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {selectedMistake.reason}
                  </p>
                </div>

                {/* Fix Suggestion */}
                <div className="p-4 bg-amber-50/30 border-l-4 border-amber-500 rounded-r-xl space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-amber-600">Corrective Routine</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedMistake.suggestion || "Set a standard rule in your checklist to avoid repeating this execution error."}
                  </p>
                </div>

                {/* Action Form Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Status</label>
                    <select
                      value={detailStatus}
                      onChange={(e) => setDetailStatus(e.target.value as any)}
                      className="w-full px-3 h-10 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="OPEN">Open</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="FIXED">Fixed</option>
                    </select>
                  </div>

                  {/* Root Cause Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Psychology Root Cause</label>
                    <select
                      value={detailRootCause}
                      onChange={(e) => setDetailRootCause(e.target.value)}
                      className="w-full px-3 h-10 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="">-- Select Cause --</option>
                      <option value="Fear">Fear</option>
                      <option value="Greed">Greed</option>
                      <option value="FOMO">FOMO</option>
                      <option value="Anger">Anger</option>
                      <option value="Impatience">Impatience</option>
                      <option value="No plan">No plan</option>
                      <option value="Overconfidence">Overconfidence</option>
                    </select>
                  </div>
                </div>

                {/* Mentor Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mentor Comments</label>
                  {userRole === "MENTOR" || userRole === "ADMIN" ? (
                    <textarea
                      rows={3}
                      value={detailMentorNote}
                      onChange={(e) => setDetailMentorNote(e.target.value)}
                      placeholder="Mentor comments on student behavior..."
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
                    ></textarea>
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 font-semibold leading-relaxed">
                      {selectedMistake.mentorNote || "No comments from mentor yet."}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#F3F4F6] bg-slate-50 flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E5E7EB] hover:bg-white text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleUpdateMistake}
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
