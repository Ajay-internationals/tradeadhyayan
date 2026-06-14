"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Plus,
  Edit,
  Archive,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Activity,
  ArrowUpRight,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Search,
  Trash2,
  Lightbulb,
  X,
  Sliders,
  DollarSign
} from "lucide-react";

interface Strategy {
  id: string;
  name: string;
  type: string;
  description: string | null;
  market: string | null;
  instrument: string | null;
  timeframe: string | null;
  setupRules: string | null;
  entryRules: string | null;
  exitRules: string | null;
  stopLossRules: string | null;
  targetRules: string | null;
  riskPerTrade: number | null;
  maxTradesPerDay: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface StrategyMetric {
  strategy: Strategy;
  tradesCount: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  avgRR: number;
}

interface AnalyticsData {
  success: boolean;
  summary: {
    totalStrategies: number;
    activeStrategies: number;
    bestStrategyName: string;
    bestStrategyPnl: number;
    totalPnl: number;
    winRate: number;
    avgRR: number;
    profitableStrategiesCount: number;
    totalTrades: number;
  };
  analyticsList: StrategyMetric[];
  donutChartData: { name: string; value: number; pnl: number }[];
  dailyPnlChart: { date: string; pnl: number }[];
  insights: string[];
}

export default function StrategiesPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Date Filters
  const [datePreset, setDatePreset] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Search & Status filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Chart Metric Selector
  const [chartMetric, setChartMetric] = useState<"totalPnl" | "winRate" | "profitFactor" | "avgRR" | "tradesCount">("totalPnl");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("Custom");
  const [formMarket, setFormMarket] = useState("");
  const [formInstrument, setFormInstrument] = useState("");
  const [formTimeframe, setFormTimeframe] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSetupRules, setFormSetupRules] = useState("");
  const [formEntryRules, setFormEntryRules] = useState("");
  const [formExitRules, setFormExitRules] = useState("");
  const [formStopLossRules, setFormStopLossRules] = useState("");
  const [formTargetRules, setFormTargetRules] = useState("");
  const [formRiskPerTrade, setFormRiskPerTrade] = useState("");
  const [formMaxTradesPerDay, setFormMaxTradesPerDay] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");

  // Table Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Donut Colors
  const DONUT_COLORS = [
    "#7C5CFF", // Primary Purple
    "#20B486", // Profit Green
    "#F25C93", // Loss Pink
    "#3B82F6", // Blue
    "#FFA043", // Orange
    "#8B5CF6", // Violet
    "#EC4899"  // Pink
  ];

  // Retrieve user & redirect if not authed
  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) {
      router.push("/login");
      return;
    }
    setUserEmail(email);
  }, [router]);

  // Handle Preset calculation
  useEffect(() => {
    if (datePreset === "all") {
      setFromDate("");
      setToDate("");
    } else if (datePreset === "30") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(d.toISOString().split("T")[0]);
      setToDate(new Date().toISOString().split("T")[0]);
    } else if (datePreset === "90") {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      setFromDate(d.toISOString().split("T")[0]);
      setToDate(new Date().toISOString().split("T")[0]);
    }
  }, [datePreset]);

  // Fetch data
  const fetchData = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      let url = `/api/strategies/analytics?email=${encodeURIComponent(userEmail)}`;
      if (fromDate) url += `&from=${fromDate}`;
      if (toDate) url += `&to=${toDate}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setAnalyticsData(result);
        }
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchData();
    }
  }, [userEmail, fromDate, toDate]);

  // Handle Form Openings
  const handleNewClick = () => {
    setEditingId(null);
    setFormName("");
    setFormType("Custom");
    setFormMarket("");
    setFormInstrument("");
    setFormTimeframe("");
    setFormDescription("");
    setFormSetupRules("");
    setFormEntryRules("");
    setFormExitRules("");
    setFormStopLossRules("");
    setFormTargetRules("");
    setFormRiskPerTrade("");
    setFormMaxTradesPerDay("");
    setFormStatus("ACTIVE");
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (metric: StrategyMetric) => {
    const s = metric.strategy;
    setEditingId(s.id);
    setFormName(s.name || "");
    setFormType(s.type || "Custom");
    setFormMarket(s.market || "");
    setFormInstrument(s.instrument || "");
    setFormTimeframe(s.timeframe || "");
    setFormDescription(s.description || "");
    setFormSetupRules(s.setupRules || "");
    setFormEntryRules(s.entryRules || "");
    setFormExitRules(s.exitRules || "");
    setFormStopLossRules(s.stopLossRules || "");
    setFormTargetRules(s.targetRules || "");
    setFormRiskPerTrade(s.riskPerTrade !== null ? String(s.riskPerTrade) : "");
    setFormMaxTradesPerDay(s.maxTradesPerDay !== null ? String(s.maxTradesPerDay) : "");
    setFormStatus(s.status || "ACTIVE");
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Strategy name is required");
      return;
    }

    const payload = {
      email: userEmail,
      name: formName,
      type: formType,
      description: formDescription,
      market: formMarket,
      instrument: formInstrument,
      timeframe: formTimeframe,
      setupRules: formSetupRules,
      entryRules: formEntryRules,
      exitRules: formExitRules,
      stopLossRules: formStopLossRules,
      targetRules: formTargetRules,
      riskPerTrade: formRiskPerTrade ? parseFloat(formRiskPerTrade) : null,
      maxTradesPerDay: formMaxTradesPerDay ? parseInt(formMaxTradesPerDay, 10) : null,
      status: formStatus
    };

    const loadToast = toast.loading(isEditMode ? "Saving strategy modifications..." : "Creating new strategy...");
    try {
      const url = isEditMode ? `/api/strategies/${editingId}` : "/api/strategies";
      const method = isEditMode ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isEditMode ? "Strategy saved successfully! ⚡" : "New strategy added! 🎯", { id: loadToast });
        setIsModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Execution failed", { id: loadToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection error saving strategy.", { id: loadToast });
    }
  };

  // Archive/Delete Handler
  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this strategy? Legacy trades associated with this strategy setup will still be preserved.")) return;
    const loadToast = toast.loading("Archiving setup...");
    try {
      const res = await fetch(`/api/strategies/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Strategy archived and deactivated.", { id: loadToast });
        fetchData();
      } else {
        toast.error("Failed to archive strategy.", { id: loadToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error deleting strategy.", { id: loadToast });
    }
  };

  // Filter strategy analytics list
  const filteredMetrics = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.analyticsList.filter(m => {
      const s = m.strategy;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.market || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.instrument || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        s.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [analyticsData, searchQuery, statusFilter]);

  // Paginated metrics for the table
  const paginatedMetrics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMetrics.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMetrics, currentPage]);

  const totalPages = Math.ceil(filteredMetrics.length / itemsPerPage);

  // Dynamic Bar Chart mapping
  const barChartData = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.analyticsList.map(m => ({
      name: m.strategy.name,
      value: m[chartMetric],
      rawVal: m[chartMetric]
    }));
  }, [analyticsData, chartMetric]);

  // Currency Formatter Helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (isLoading && !analyticsData) {
    return (
      <div className="flex-1 bg-[#FAFAFF] p-6 flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#7C5CFF]/20 border-t-[#7C5CFF] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#7A7890] font-bold animate-pulse text-sm">Loading strategy analytics dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = analyticsData?.summary || {
    totalStrategies: 0,
    activeStrategies: 0,
    bestStrategyName: "None",
    bestStrategyPnl: 0,
    totalPnl: 0,
    winRate: 0,
    avgRR: 0,
    profitableStrategiesCount: 0,
    totalTrades: 0
  };

  const donutChartData = analyticsData?.donutChartData || [];
  const insights = analyticsData?.insights || [];

  return (
    <div className="pt-2 px-[28px] pb-[28px] max-w-7xl mx-auto space-y-[20px] font-sans">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-[#E9E7F5] gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#17152F] tracking-tight">Strategies</h1>
          <p className="text-xs font-semibold text-[#7A7890] mt-1">Analyze, compare and refine your trading strategies.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Preset Picker */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-[#7A7890] tracking-wider">Date Presets:</span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="px-3 h-10 border border-[#E9E7F5] rounded-xl text-xs font-semibold bg-white focus:outline-none cursor-pointer text-[#17152F]"
            >
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {datePreset === "custom" && (
            <div className="flex items-center gap-1.5 animate-fade-in">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 h-10 border border-[#E9E7F5] rounded-xl text-xs font-semibold bg-white focus:outline-none text-[#17152F]"
              />
              <span className="text-slate-300 text-xs">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 h-10 border border-[#E9E7F5] rounded-xl text-xs font-semibold bg-white focus:outline-none text-[#17152F]"
              />
            </div>
          )}

          {/* New Strategy Trigger */}
          <button
            onClick={handleNewClick}
            className="h-10 px-5 bg-[#7C5CFF] hover:bg-[#6A4BE0] text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#7C5CFF]/15 transition-all w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>New Strategy</span>
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[16px]">
        
        {/* Card 1: Total Strategies */}
        <div className="bg-white border border-[#E9E7F5] rounded-[18px] p-5 shadow-[0_8px_24px_rgba(30,20,80,0.05)] hover:border-[#7C5CFF] transition-all flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#7A7890]">Total Strategies</span>
            <Bookmark size={15} className="text-[#7A7890]/60" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-[#17152F]">{summary.totalStrategies}</span>
            <p className="text-[9px] font-semibold text-[#7A7890] mt-0.5">{summary.activeStrategies} Active strategies</p>
          </div>
        </div>

        {/* Card 2: Best Performing */}
        <div className="bg-white border border-[#E9E7F5] rounded-[18px] p-5 shadow-[0_8px_24px_rgba(30,20,80,0.05)] hover:border-[#7C5CFF] transition-all flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#7A7890]">Best Performing</span>
            <Award size={15} className="text-[#20B486]/80" />
          </div>
          <div className="mt-2 min-w-0">
            <span className={`text-sm font-black truncate block ${summary.bestStrategyPnl >= 0 ? "text-[#20B486]" : "text-[#F25C93]"}`}>
              {summary.bestStrategyName}
            </span>
            <p className="text-[9px] font-semibold text-[#7A7890] mt-0.5">
              Net: {summary.bestStrategyPnl !== 0 ? formatCurrency(summary.bestStrategyPnl) : "₹0"}
            </p>
          </div>
        </div>

        {/* Card 3: Total P&L */}
        <div className="bg-white border border-[#E9E7F5] rounded-[18px] p-5 shadow-[0_8px_24px_rgba(30,20,80,0.05)] hover:border-[#7C5CFF] transition-all flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#7A7890]">Total P&L</span>
            <DollarSign size={15} className={summary.totalPnl >= 0 ? "text-[#20B486]/80" : "text-[#F25C93]/80"} />
          </div>
          <div className="mt-2">
            <span className={`text-xl font-black ${summary.totalPnl >= 0 ? "text-[#20B486]" : "text-[#F25C93]"}`}>
              {formatCurrency(summary.totalPnl)}
            </span>
            <p className="text-[9px] font-semibold text-[#7A7890] mt-0.5">Across tagged trades</p>
          </div>
        </div>

        {/* Card 4: Avg Win Rate */}
        <div className="bg-white border border-[#E9E7F5] rounded-[18px] p-5 shadow-[0_8px_24px_rgba(30,20,80,0.05)] hover:border-[#7C5CFF] transition-all flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#7A7890]">Avg Win Rate</span>
            <Activity size={15} className="text-blue-500/80" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-[#17152F]">{summary.winRate}%</span>
            <p className="text-[9px] font-semibold text-[#7A7890] mt-0.5">{summary.totalTrades} total trades</p>
          </div>
        </div>

        {/* Card 5: Avg R:R */}
        <div className="bg-white border border-[#E9E7F5] rounded-[18px] p-5 shadow-[0_8px_24px_rgba(30,20,80,0.05)] hover:border-[#7C5CFF] transition-all flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#7A7890]">Avg R:R</span>
            <Target size={15} className="text-[#7C5CFF]/80" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-[#17152F]">1 : {summary.avgRR}</span>
            <p className="text-[9px] font-semibold text-[#7A7890] mt-0.5">Risk-reward ratio</p>
          </div>
        </div>

        {/* Card 6: Profitable Strats */}
        <div className="bg-white border border-[#E9E7F5] rounded-[18px] p-5 shadow-[0_8px_24px_rgba(30,20,80,0.05)] hover:border-[#7C5CFF] transition-all flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#7A7890]">Profitable Strats</span>
            <TrendingUp size={15} className="text-[#20B486]/80" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-[#17152F]">
              {summary.profitableStrategiesCount} / {summary.totalStrategies}
            </span>
            <p className="text-[9px] font-semibold text-[#7A7890] mt-0.5">
              {summary.totalStrategies > 0 ? ((summary.profitableStrategiesCount / summary.totalStrategies) * 100).toFixed(0) : 0}% ratio
            </p>
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Strategy Comparison Chart */}
        <div className="lg:col-span-7 bg-white border border-[#E9E7F5] rounded-[22px] p-6 shadow-[0_8px_24px_rgba(30,20,80,0.05)] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[#E9E7F5]">
            <div>
              <h3 className="text-sm font-black text-[#17152F]">Performance comparison</h3>
              <p className="text-[10px] text-[#7A7890] font-semibold">Compare setup efficiency metrics side-by-side</p>
            </div>
            {/* Metric Switcher Tab controls */}
            <div className="flex flex-wrap gap-1 bg-[#FAFAFF] border border-[#E9E7F5] p-1 rounded-xl">
              {[
                { id: "totalPnl", label: "Net P&L" },
                { id: "winRate", label: "Win Rate" },
                { id: "profitFactor", label: "Profit Factor" },
                { id: "avgRR", label: "Avg R:R" },
                { id: "tradesCount", label: "Trades" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setChartMetric(m.id as any)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    chartMetric === m.id
                      ? "bg-[#7C5CFF] text-white shadow-sm"
                      : "text-[#7A7890] hover:text-[#17152F]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-[250px] relative w-full flex items-center justify-center">
            {barChartData.length === 0 || barChartData.every(item => item.value === 0) ? (
              <div className="text-center text-xs text-[#7A7890] font-semibold">
                No trades data recorded for active setups in the selected date range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E7F5" />
                  <XAxis dataKey="name" stroke="#7A7890" fontSize={10} tickLine={false} />
                  <YAxis stroke="#7A7890" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(124, 92, 255, 0.03)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const val = payload[0].value as number;
                        let display = String(val);
                        if (chartMetric === "totalPnl") {
                          display = formatCurrency(val);
                        } else if (chartMetric === "winRate") {
                          display = `${val}%`;
                        } else if (chartMetric === "avgRR") {
                          display = `1 : ${val}`;
                        }
                        return (
                          <div className="bg-white border border-[#E9E7F5] p-3 rounded-xl shadow-md text-xs font-sans">
                            <p className="font-black text-[#17152F] mb-1">{data.name}</p>
                            <p className="font-semibold text-[#7A7890]">
                              Value:{" "}
                              <span className={chartMetric === "totalPnl" ? (val >= 0 ? "text-[#20B486]" : "text-[#F25C93]") : "text-[#7C5CFF]"}>
                                {display}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={26}>
                    {barChartData.map((entry, idx) => {
                      // Dynamically color based on profit/loss if looking at PNL metric
                      let color = "#7C5CFF";
                      if (chartMetric === "totalPnl") {
                        color = entry.value >= 0 ? "#20B486" : "#F25C93";
                      } else {
                        color = DONUT_COLORS[idx % DONUT_COLORS.length];
                      }
                      return <Cell key={`cell-${idx}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Side: Donut Volume distribution */}
        <div className="lg:col-span-5 bg-white border border-[#E9E7F5] rounded-[22px] p-6 shadow-[0_8px_24px_rgba(30,20,80,0.05)] space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-[#E9E7F5]">
            <h3 className="text-sm font-black text-[#17152F]">Setup Share (Trades count)</h3>
            <p className="text-[10px] text-[#7A7890] font-semibold">Distribution of trade logs by setup</p>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            {donutChartData.length === 0 ? (
              <div className="text-center text-xs text-[#7A7890] font-semibold py-8">
                No trades logged. Tag trades in journal.
              </div>
            ) : (
              <>
                {/* Donut graphic */}
                <div className="w-[150px] h-[150px] relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutChartData}
                        innerRadius={48}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-black text-[#17152F]">{summary.totalTrades}</span>
                    <span className="text-[8px] font-bold text-[#7A7890] uppercase tracking-wider mt-0.5">Trades</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="flex-1 space-y-2.5 max-h-[160px] overflow-y-auto w-full pr-1">
                  {donutChartData.map((entry, idx) => {
                    const percent = summary.totalTrades > 0 ? ((entry.value / summary.totalTrades) * 100).toFixed(0) : 0;
                    return (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-[#7A7890]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}></div>
                          <span className="truncate text-[#17152F]">{entry.name}</span>
                        </div>
                        <span className="font-bold shrink-0 ml-2 text-slate-800">
                          {entry.value} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Insights Panel */}
      <div className="bg-white border border-[#E9E7F5] rounded-[22px] p-6 shadow-[0_8px_24px_rgba(30,20,80,0.05)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E9E7F5]">
          <div>
            <h3 className="text-sm font-black text-[#17152F]">Strategic Insights</h3>
            <p className="text-[10px] text-[#7A7890] font-semibold">Custom strategy recommendations based on historical trade outcomes</p>
          </div>
          <span className="px-2.5 py-1 bg-[#F4F0FF] border border-[#E9E7F5] text-[#7C5CFF] text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#7C5CFF] animate-pulse" />
            <span>AI Insights Engine</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#FAFAFF] border border-[#E9E7F5] rounded-xl flex items-start gap-3 shadow-[0_4px_12px_rgba(30,20,80,0.02)] transition-all hover:border-[#7C5CFF]"
            >
              <div className="p-2 bg-[#F4F0FF] rounded-lg text-[#7C5CFF] shrink-0 mt-0.5">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] font-semibold text-[#17152F] leading-relaxed pt-0.5">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Strategies Table Section */}
      <div className="bg-white border border-[#E9E7F5] rounded-[22px] p-6 shadow-[0_8px_24px_rgba(30,20,80,0.05)] space-y-6">
        
        {/* Table Filters sub-header */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-[#17152F]">All Setup Strategies</h3>
            <p className="text-[10px] text-[#7A7890] font-semibold">List of active & configured setups</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search strategies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-[220px] px-3.5 py-2 pl-9 bg-[#FAFAFF] border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all text-[#17152F]"
              />
              <Search className="w-3.5 h-3.5 text-[#7A7890] absolute left-3 top-3" />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#7A7890] tracking-wider whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 h-9 border border-[#E9E7F5] rounded-xl text-xs font-semibold bg-white focus:outline-none cursor-pointer text-[#17152F]"
              >
                <option value="ALL">All Setups</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto border border-[#E9E7F5] rounded-xl bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFF] border-b border-[#E9E7F5] text-[10px] font-black uppercase tracking-wider text-[#7A7890]">
                <th className="py-4 px-5">Strategy / Setup Details</th>
                <th className="py-4 px-4 text-center">Trades</th>
                <th className="py-4 px-4 text-center">Win Rate</th>
                <th className="py-4 px-4 text-right">Net P&L</th>
                <th className="py-4 px-4 text-center">Profit Factor</th>
                <th className="py-4 px-4 text-center">Avg R:R</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E7F5] text-xs font-semibold text-[#17152F]">
              {paginatedMetrics.length > 0 ? (
                paginatedMetrics.map((item) => {
                  const s = item.strategy;
                  const isPositive = item.totalPnl >= 0;
                  return (
                    <tr key={s.id} className="hover:bg-[#FAFAFF]/50 transition-colors">
                      {/* Name & Params */}
                      <td className="py-4 px-5">
                        <div className="space-y-1 max-w-[280px]">
                          <span className="font-bold text-[#17152F] text-sm block">{s.name}</span>
                          <span className="text-[10px] text-[#7A7890] line-clamp-1 font-medium">{s.description || "No description provided."}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {s.type && <span className="bg-[#F4F0FF] text-[#7C5CFF] text-[8px] font-bold px-1.5 py-0.5 rounded">{s.type}</span>}
                            {s.market && <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded">{s.market}</span>}
                            {s.instrument && <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded">{s.instrument}</span>}
                            {s.timeframe && <span className="bg-indigo-50 text-indigo-500 text-[8px] font-bold px-1.5 py-0.5 rounded">{s.timeframe}</span>}
                          </div>
                        </div>
                      </td>
                      {/* Total Trades */}
                      <td className="py-4 px-4 text-center font-bold">{item.tradesCount}</td>
                      {/* Win Rate */}
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold ${item.winRate >= 50 ? "text-[#20B486]" : "text-[#7A7890]"}`}>
                          {item.winRate}%
                        </span>
                      </td>
                      {/* Net PNL */}
                      <td className={`py-4 px-4 text-right font-black ${isPositive ? "text-[#20B486]" : "text-[#F25C93]"}`}>
                        {formatCurrency(item.totalPnl)}
                      </td>
                      {/* Profit Factor */}
                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        {item.profitFactor === 999 ? "999.0" : item.profitFactor.toFixed(2)}
                      </td>
                      {/* Avg RR */}
                      <td className="py-4 px-4 text-center font-bold text-slate-700">1 : {item.avgRR}</td>
                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          s.status === "ACTIVE"
                            ? "bg-[#ECFDF5] text-[#20B486] border border-[#A7F3D0]"
                            : "bg-slate-50 text-slate-400 border border-slate-200"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(item)}
                            title="Edit Strategy Setup"
                            className="text-slate-400 hover:text-[#7C5CFF] p-1.5 rounded-lg hover:bg-[#F4F0FF] transition-all cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Delete/Archive Button */}
                          <button
                            onClick={() => handleArchive(s.id)}
                            title="Archive Strategy"
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#7A7890] font-semibold text-xs bg-slate-50/50">
                    No strategies matching your filter options. Click "New Strategy" to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-[#7A7890] font-semibold">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3.5 py-1.5 bg-[#FAFAFF] border border-[#E9E7F5] hover:border-[#7C5CFF] rounded-lg text-[10px] font-black uppercase disabled:opacity-40 transition-all cursor-pointer text-[#17152F]"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3.5 py-1.5 bg-[#FAFAFF] border border-[#E9E7F5] hover:border-[#7C5CFF] rounded-lg text-[10px] font-black uppercase disabled:opacity-40 transition-all cursor-pointer text-[#17152F]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT STRATEGY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white border border-[#E9E7F5] rounded-[22px] w-full max-w-2xl shadow-xl overflow-hidden animate-scale-up text-left max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#E9E7F5] flex justify-between items-center bg-white">
              <div>
                <h3 className="text-base font-black text-[#17152F] tracking-tight">
                  {isEditMode ? "Modify Strategy Configuration" : "Establish New Strategy"}
                </h3>
                <p className="text-[10px] text-[#7A7890] font-semibold mt-0.5">
                  {isEditMode ? "Refine rules, parameters and targets for your strategy" : "Set up trade setup rules, timeframe guidelines, and risk caps"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#7C5CFF] border-b border-[#E9E7F5] pb-1">
                  Basic Info & Setup Classification
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Strategy Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Breakout Setup, 5m Momentum"
                      className="w-full px-3 h-11 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all text-[#17152F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Strategy Type / Category</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3 h-11 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all cursor-pointer text-[#17152F]"
                    >
                      <option value="Breakout Setup">Breakout Setup</option>
                      <option value="Momentum Play">Momentum Play</option>
                      <option value="Mean Reversion">Mean Reversion</option>
                      <option value="Trend Following">Trend Following</option>
                      <option value="Scalping">Scalping</option>
                      <option value="Custom">Custom / Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Market Scope</label>
                    <input
                      type="text"
                      value={formMarket}
                      onChange={(e) => setFormMarket(e.target.value)}
                      placeholder="e.g. NSE Equity, Forex, MCX"
                      className="w-full px-3 h-11 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all text-[#17152F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Instrument Scope</label>
                    <input
                      type="text"
                      value={formInstrument}
                      onChange={(e) => setFormInstrument(e.target.value)}
                      placeholder="e.g. Options, High Beta Stocks"
                      className="w-full px-3 h-11 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all text-[#17152F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Timeframe Guideline</label>
                    <input
                      type="text"
                      value={formTimeframe}
                      onChange={(e) => setFormTimeframe(e.target.value)}
                      placeholder="e.g. 5m, 15m, Daily"
                      className="w-full px-3 h-11 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all text-[#17152F]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Strategy Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide a general summary of the core thesis of this strategy..."
                    className="w-full p-3 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all h-16 resize-none text-[#17152F]"
                  />
                </div>
              </div>

              {/* Section 2: Strategy Execution Rules */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#7C5CFF] border-b border-[#E9E7F5] pb-1">
                  Setup & Execution Rules
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Setup / Trigger Rules</label>
                    <textarea
                      value={formSetupRules}
                      onChange={(e) => setFormSetupRules(e.target.value)}
                      placeholder="Describe what triggers the setup (e.g. ADX is low, EMA cross...)"
                      className="w-full p-3 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all h-20 resize-none text-[#17152F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Entry Trigger Rules</label>
                    <textarea
                      value={formEntryRules}
                      onChange={(e) => setFormEntryRules(e.target.value)}
                      placeholder="Specify entry rules (e.g. Enter on candle close above pivot...)"
                      className="w-full p-3 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all h-20 resize-none text-[#17152F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Exit Trigger Rules</label>
                    <textarea
                      value={formExitRules}
                      onChange={(e) => setFormExitRules(e.target.value)}
                      placeholder="Specify general exit conditions (e.g. close below 9 EMA...)"
                      className="w-full p-3 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all h-20 resize-none text-[#17152F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Stop Loss Placement Rules</label>
                    <textarea
                      value={formStopLossRules}
                      onChange={(e) => setFormStopLossRules(e.target.value)}
                      placeholder="Describe stop loss rule (e.g. below swing low, fixed 20 points...)"
                      className="w-full p-3 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all h-20 resize-none text-[#17152F]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Profit Target Rules</label>
                  <textarea
                    value={formTargetRules}
                    onChange={(e) => setFormTargetRules(e.target.value)}
                    placeholder="Define profit taking logic (e.g. 1:2 Risk-Reward ratio, pivot resistance...)"
                    className="w-full p-3 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all h-16 resize-none text-[#17152F]"
                  />
                </div>
              </div>

              {/* Section 3: Risk Parameters */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#7C5CFF] border-b border-[#E9E7F5] pb-1">
                  Risk Management & Status
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Risk per Trade (INR)</label>
                    <input
                      type="number"
                      value={formRiskPerTrade}
                      onChange={(e) => setFormRiskPerTrade(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full px-3 h-11 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all text-[#17152F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Max Trades Per Day</label>
                    <input
                      type="number"
                      value={formMaxTradesPerDay}
                      onChange={(e) => setFormMaxTradesPerDay(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full px-3 h-11 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all text-[#17152F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#7A7890] ml-1">Strategy Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3 h-11 bg-slate-50 border border-[#E9E7F5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C5CFF] focus:bg-white transition-all cursor-pointer text-[#17152F]"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal footer Actions */}
              <div className="pt-4 border-t border-[#E9E7F5] flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#7C5CFF] hover:bg-[#6A4BE0] text-white text-xs font-black rounded-xl shadow-md shadow-[#7C5CFF]/15 transition-all cursor-pointer"
                >
                  {isEditMode ? "Save Changes" : "Create Strategy"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
