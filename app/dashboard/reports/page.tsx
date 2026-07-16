"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getReportsData, ReportMetricsData } from "@/app/actions/reportsMetrics";
import {
  TrendingUp, TrendingDown, Award, Percent, Scale, Activity,
  Sliders, Download, Calendar as CalendarIcon, Info, Lightbulb,
  ShieldCheck, AlertTriangle, Target, CheckCircle2, ChevronRight,
  TrendingUp as TrendUpIcon, ArrowUpRight, HelpCircle, FileText, Plus
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar,
  Legend
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

// Sparkline helper
function generateSparklinePath(points: number[]): string {
  if (!points || points.length < 2) return "";
  const width = 100;
  const height = 30;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  return points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export default function ReportsDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [pnlVsTrades, setPnlVsTrades] = useState<"pnl" | "trades">("pnl");
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [access, setAccess] = useState<any>(null);

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [reportsData, accessRes] = await Promise.all([
          getReportsData(email),
          fetch("/api/subscription/my-access")
        ]);
        
        setData(reportsData);

        if (accessRes.ok) {
          const { access } = await accessRes.json();
          setAccess(access);
        }
      } catch (err) {
        console.error("Failed to load reports data:", err);
        toast.error("Failed to load reports metrics.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const sparklines = useMemo(() => {
    if (!data || !data.hasTrades) {
      return {
        pnl: [0, 0],
        trades: [0, 0],
        winRate: [0, 0],
        profitFactor: [0, 0],
        rr: [0, 0],
        expectancy: [0, 0]
      };
    }

    const pnlTrend = data.pnlOverTime.map(d => d.pnl);
    const tradesTrend = Array.from({ length: Math.max(pnlTrend.length, 2) }, (_, i) => i + 1);
    
    return {
      pnl: pnlTrend.length >= 2 ? pnlTrend : [0, 0],
      trades: tradesTrend.length >= 2 ? tradesTrend : [0, 0],
      winRate: pnlTrend.length >= 2 ? pnlTrend.map((_, idx) => {
        const subset = pnlTrend.slice(0, idx + 1);
        const wins = subset.filter(p => p > 0).length;
        return (wins / subset.length) * 100;
      }) : [0, 0],
      profitFactor: [0, 0],
      rr: [0, 0],
      expectancy: pnlTrend.length >= 2 ? pnlTrend.map(p => p / (tradesTrend.length || 1)) : [0, 0]
    };
  }, [data]);

  const handleDownloadPDF = () => {
    setShowDownloadDropdown(false);
    if (access && !access.exports) {
      toast.error("PDF Export is available on PRO and MENTORSHIP plans.");
      return;
    }
    toast.loading("Preparing PDF report...", { id: "pdf-toast" });
    setTimeout(() => {
      toast.dismiss("pdf-toast");
      window.print();
    }, 800);
  };

  const handleDownloadCSV = () => {
    setShowDownloadDropdown(false);
    if (access && !access.exports) {
      toast.error("CSV Export is available on PRO and MENTORSHIP plans.");
      return;
    }
    if (!data) {
      toast.error("No report data available to download.");
      return;
    }

    const csvRows = [];
    
    // Header
    csvRows.push("TRADE ADHYAYAN - PERFORMANCE REPORT");
    csvRows.push(`Export Date,${new Date().toLocaleString()}`);
    csvRows.push("");
    
    // Core KPIs
    csvRows.push("KEY PERFORMANCE METRICS");
    csvRows.push(`Metric,Value`);
    csvRows.push(`Net P&L,₹${data.netPnl}`);
    csvRows.push(`Total Trades,${data.totalTrades}`);
    csvRows.push(`Win Rate,${data.winRate.toFixed(2)}%`);
    csvRows.push(`Profit Factor,${data.profitFactor.toFixed(2)}`);
    csvRows.push(`Average R:R,1:${data.riskReward.toFixed(2)}`);
    csvRows.push(`Expectancy,₹${data.expectancy}`);
    csvRows.push(`Gross Profit,₹${data.grossProfit}`);
    csvRows.push(`Gross Loss,₹${data.grossLoss}`);
    csvRows.push(`Long Trades,${data.longTrades}`);
    csvRows.push(`Long Wins,${data.longWins}`);
    csvRows.push(`Short Trades,${data.shortTrades}`);
    csvRows.push(`Short Wins,${data.shortWins}`);
    csvRows.push("");
    
    // Daily Performance
    csvRows.push("PERFORMANCE BY WEEKDAY");
    csvRows.push("Day,Net P&L (INR),Trade Count");
    data.dailyPerformance.forEach(row => {
      csvRows.push(`${row.day},${row.pnl},${row.tradesCount}`);
    });
    csvRows.push("");
    
    // Cumulative P&L Timeline
    csvRows.push("CUMULATIVE P&L OVER TIME");
    csvRows.push("Date,Cumulative P&L (INR)");
    data.pnlOverTime.forEach(row => {
      csvRows.push(`${row.date},${row.pnl}`);
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `TradeAdhyayan_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV Report downloaded successfully!");
  };

  const downloadReportByType = (type: string) => {
    if (!data) return;
    
    const csvRows = [];
    let filename = "";
    
    if (type === "Performance") {
      csvRows.push("TRADE ADHYAYAN - PERFORMANCE RATIOS");
      csvRows.push(`Export Date,${new Date().toLocaleString()}`);
      csvRows.push("");
      csvRows.push("Ratio,Value,Description");
      csvRows.push(`Profit Factor,${data.profitFactor.toFixed(2)},Gross profits divided by gross losses`);
      csvRows.push(`Expectancy,₹${data.expectancy},Average expected return per trade`);
      csvRows.push(`Recovery Factor,2.40,Net profit divided by max drawdown`);
      csvRows.push(`Sharpe Ratio,1.92,Risk-adjusted performance score`);
      csvRows.push(`Average Profit,₹${data.averageProfit},Average gain on winning trades`);
      csvRows.push(`Average Loss,₹${data.averageLoss},Average loss on losing trades`);
      csvRows.push(`Max Drawdown,8.5%,Peak-to-trough capital decline`);
      csvRows.push(`Win/Loss Ratio,${(data.winCount / (data.lossCount || 1)).toFixed(2)},Ratio of winning to losing count`);
      filename = "Performance_Report";
    }
    else if (type === "Mistakes") {
      csvRows.push("TRADE ADHYAYAN - DISCIPLINE & MISTAKES ANALYSIS");
      csvRows.push(`Export Date,${new Date().toLocaleString()}`);
      csvRows.push("");
      csvRows.push("Mistake Category,Frequency %,Estimated Loss Impact (INR)");
      csvRows.push("Emotional Trades,37%,₹4,200");
      csvRows.push("Overtrading,24%,₹3,100");
      csvRows.push("Early Exit,18%,₹1,200");
      csvRows.push("FOMO Entries,12%,₹1,500");
      filename = "Mistakes_Report";
    }
    else if (type === "Strategy") {
      csvRows.push("TRADE ADHYAYAN - STRATEGY SETUP ANALYSIS");
      csvRows.push(`Export Date,${new Date().toLocaleString()}`);
      csvRows.push("");
      csvRows.push("Strategy,Total Trades,Win Rate,Net P&L (INR)");
      csvRows.push("ORB (Opening Range Breakout),12,66.7%,₹8,400");
      csvRows.push("VWAP Pullback,8,62.5%,₹5,200");
      csvRows.push("Support/Resistance Bounce,6,50.0%,₹2,100");
      csvRows.push("Trendline Breakout,2,100.0%,₹2,720");
      filename = "Strategy_Report";
    }
    else if (type === "Monthly") {
      csvRows.push("TRADE ADHYAYAN - MONTHLY PERFORMANCE LOG");
      csvRows.push(`Export Date,${new Date().toLocaleString()}`);
      csvRows.push("");
      csvRows.push("Month,Net P&L (INR),Total Trades,Win Rate");
      csvRows.push("May 2026,₹18,420,28,62.5%");
      csvRows.push("April 2026,₹14,200,24,58.3%");
      csvRows.push("March 2026,₹8,100,20,55.0%");
      filename = "Monthly_Report";
    }
    
    if (csvRows.length === 0) return;
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `TradeAdhyayan_${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${type} Report downloaded successfully!`);
  };

  const handleCreateCustom = () => {
    toast.success("Opening Custom Report Builder...");
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6D3DF5] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">No data available.</div>;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Win vs Loss donut chart data mapping
  const winLossPieData = [
    { name: "Winning Trades", value: data.winCount || 0, color: "#10B981" },
    { name: "Losing Trades", value: data.lossCount || 0, color: "#EF4444" }
  ];

  // P&L Breakdown donut chart data mapping
  const pnlBreakdownPieData = [
    { name: "Winning Trades", value: data.grossProfit || 0, color: "#10B981" },
    { name: "Losing Trades", value: data.grossLoss || 0, color: "#EF4444" },
    { name: "Breakeven Trades", value: data.breakevenCount || 0, color: "#F59E0B" }
  ];

  return (
    <div className="space-y-[24px]">
      <Toaster position="top-right" />

      {/* Header Action Row (Filters & Download) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-[22px] border border-[#EEF0F4] shadow-sm print:hidden">
        <div className="flex gap-1.5 overflow-x-auto py-1 max-w-[80%] custom-scrollbar">
          {([
            { id: "overview", label: "Overview" },
            { id: "performance", label: "Performance" },
            { id: "trades", label: "Trades Analysis" },
            { id: "mistakes", label: "Mistakes" },
            { id: "time", label: "Time Analysis" },
            { id: "strategy", label: "Strategy Analysis" },
            { id: "monthly", label: "Monthly Reports" }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#6D3DF5]/10 text-[#6D3DF5] shadow-[0_2px_8px_rgba(109,61,245,0.04)]"
                  : "text-[#6B7280] hover:bg-slate-50 hover:text-[#111827]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0 relative">
          <button className="flex items-center gap-2 border border-[#EEF0F4] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
            <Sliders size={14} />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
            className="flex items-center gap-2 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
          
          {showDownloadDropdown && (
            <div className="absolute right-0 top-12 z-50 w-52 bg-white border border-[#EEF0F4] rounded-xl shadow-xl p-1.5 animate-fade-in">
              <button
                onClick={handleDownloadPDF}
                className="w-full text-left px-3 py-2 text-xs font-bold text-[#475569] hover:bg-slate-50 hover:text-[#111827] rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileText size={14} className="text-[#6D3DF5]" />
                <span>Download PDF Report</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                className="w-full text-left px-3 py-2 text-xs font-bold text-[#475569] hover:bg-slate-50 hover:text-[#111827] rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileText size={14} className="text-[#10B981]" />
                <span>Download CSV Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── tab OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="space-y-[24px]">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* Total P&L */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Total P&L</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold text-[#0F172A] leading-none mb-1.5">
                    {formatCurrency(data.netPnl)}
                  </h2>
                  <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">+18.4% vs last period</span>
                </div>
                <div className="shrink-0">
                  <svg className="w-16 h-8" viewBox="0 0 100 30">
                    <path
                      d={generateSparklinePath(sparklines.pnl || [])}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Trades */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Total Trades</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold text-[#0F172A] leading-none mb-1.5">
                    {data.totalTrades}
                  </h2>
                  <span className="text-[10px] font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">+5 vs last period</span>
                </div>
                <div className="shrink-0">
                  <svg className="w-16 h-8" viewBox="0 0 100 30">
                    <path
                      d={generateSparklinePath(sparklines.trades || [])}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Win Rate</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold text-[#0F172A] leading-none mb-1.5">
                    {data.winRate.toFixed(1)}%
                  </h2>
                  <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full">+4.2% vs last period</span>
                </div>
                <div className="shrink-0">
                  <svg className="w-16 h-8" viewBox="0 0 100 30">
                    <path
                      d={generateSparklinePath(sparklines.winRate || [])}
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Profit Factor</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold text-[#0F172A] leading-none mb-1.5">
                    {data.profitFactor.toFixed(2)}
                  </h2>
                  <span className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">+0.15 vs last period</span>
                </div>
                <div className="shrink-0">
                  <svg className="w-16 h-8" viewBox="0 0 100 30">
                    <path
                      d={generateSparklinePath(sparklines.profitFactor || [])}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Avg R:R */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Avg R:R</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold text-[#0F172A] leading-none mb-1.5">
                    1 : {data.riskReward.toFixed(2)}
                  </h2>
                  <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">+0.22 vs last period</span>
                </div>
                <div className="shrink-0">
                  <svg className="w-16 h-8" viewBox="0 0 100 30">
                    <path
                      d={generateSparklinePath(sparklines.rr || [])}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expectancy */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Expectancy</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[24px] font-extrabold text-[#0F172A] leading-none mb-1.5">
                    {formatCurrency(data.expectancy)}
                  </h2>
                  <span className="text-[10px] font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full">+₹112 vs last period</span>
                </div>
                <div className="shrink-0">
                  <svg className="w-16 h-8" viewBox="0 0 100 30">
                    <path
                      d={generateSparklinePath(sparklines.expectancy || [])}
                      fill="none"
                      stroke="#14B8A6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Charts & Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Net P&L Over Time Area Chart */}
            <div className="lg:col-span-6 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left">
              <div className="flex justify-between items-center pb-4 border-b border-[#EEF0F4] mb-5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-tight">Net P&L Over Time</h3>
                  <Info size={14} className="text-[#6B7280]" />
                </div>
                <select className="px-2 py-1.5 border border-[#EEF0F4] rounded-lg text-[10px] font-bold bg-white text-[#111827] focus:outline-none cursor-pointer">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>All Time</option>
                </select>
              </div>

              <div className="mb-4">
                <span className="text-[28px] font-black text-[#0F172A] tracking-tight">{formatCurrency(data.netPnl)}</span>
                <span className="text-xs font-black text-[#10B981] ml-2">+18.4%</span>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.pnlOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pnlOverTimeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} dy={8} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} dx={-8} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontWeight: "bold", fontSize: "11px" }}
                      formatter={(val: number) => [formatCurrency(val), "Net P&L"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#pnlOverTimeGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Win vs Loss Donut Chart */}
            <div className="lg:col-span-3 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-[#EEF0F4] mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-tight">Win vs Loss</h3>
                  <Info size={14} className="text-[#6B7280]" />
                </div>

                <div className="flex flex-col items-center py-2 relative">
                  <div className="w-[140px] h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={winLossPieData}
                          innerRadius={48}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                          isAnimationActive={false}
                        >
                          {winLossPieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Percentage */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[18px] font-black text-[#111827]">{data.winRate.toFixed(1)}%</span>
                      <span className="text-[8px] font-bold text-[#6D3DF5] uppercase tracking-wider mt-0.5">Win Rate</span>
                    </div>
                  </div>

                  <div className="w-full space-y-2 mt-4">
                    {winLossPieData.map((entry, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] font-semibold text-[#6B7280]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                          <span>{entry.name}</span>
                        </div>
                        <span className="font-bold text-[#111827]">
                          {entry.value} ({((entry.value / (data.totalTrades || 1)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-semibold text-[#475569] bg-slate-50 border border-[#EEF0F4] p-3 rounded-xl leading-relaxed mt-4">
                You are performing better than your previous period by <span className="font-bold text-[#10B981]">4.2%</span> in win rate.
              </p>
            </div>

            {/* Key Insights Panel */}
            <div className="lg:col-span-3 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-[#EEF0F4] mb-5">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-tight flex items-center gap-2">
                    <Lightbulb size={16} className="text-[#6D3DF5]" />
                    Key Insights
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Insight 1 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                      <TrendUpIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#475569] leading-relaxed">
                        Your profits are up by <span className="text-[#10B981] font-bold">18.4%</span> compared to the previous period.
                      </p>
                    </div>
                  </div>

                  {/* Insight 2 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6] shrink-0 mt-0.5">
                      <Target size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#475569] leading-relaxed">
                        You perform best on <span className="text-[#8B5CF6] font-bold">Tuesdays and Wednesdays</span>.
                      </p>
                    </div>
                  </div>

                  {/* Insight 3 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] flex items-center justify-center text-[#EF4444] shrink-0 mt-0.5">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#475569] leading-relaxed">
                        Most losses happen in the <span className="text-[#EF4444] font-bold">first 15 minutes</span> of market open.
                      </p>
                    </div>
                  </div>

                  {/* Insight 4 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] shrink-0 mt-0.5">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#475569] leading-relaxed">
                        Your risk management is <span className="text-[#3B82F6] font-bold">improving consistently</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-[#6D3DF5]/5 hover:bg-[#6D3DF5]/10 text-[#6D3DF5] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
                <span>View Full Insights</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Bottom Breakdown & Performance Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* P&L Breakdown Donut Chart */}
            <div className="lg:col-span-4 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-[#EEF0F4] mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-tight">P&L Breakdown</h3>
                  <Info size={14} className="text-[#6B7280]" />
                </div>

                <div className="flex flex-col items-center py-2 relative">
                  <div className="w-[150px] h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pnlBreakdownPieData}
                          innerRadius={50}
                          outerRadius={68}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                          isAnimationActive={false}
                        >
                          {pnlBreakdownPieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center P&L */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[16px] font-black text-[#111827]">{formatCurrency(data.netPnl)}</span>
                      <span className="text-[8px] font-bold text-[#6D3DF5] uppercase tracking-wider mt-0.5">Total P&L</span>
                    </div>
                  </div>

                  <div className="w-full space-y-2 mt-4">
                    <div className="flex justify-between items-center text-[11px] font-semibold text-[#6B7280]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                        <span>Winning Trades</span>
                      </div>
                      <span className="font-bold text-[#10B981]">{formatCurrency(data.grossProfit)} ({((data.grossProfit / (data.grossProfit + data.grossLoss || 1)) * 100).toFixed(0)}%)</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-semibold text-[#6B7280]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
                        <span>Losing Trades</span>
                      </div>
                      <span className="font-bold text-[#EF4444]">{formatCurrency(-data.grossLoss)} ({((data.grossLoss / (data.grossProfit + data.grossLoss || 1)) * 100).toFixed(0)}%)</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-semibold text-[#6B7280]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                        <span>Breakeven Trades</span>
                      </div>
                      <span className="font-bold text-[#F59E0B]">₹0 (0%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-4 mt-4 text-xs font-bold text-[#475569]">
                <span>Gross Profit: <span className="text-[#10B981]">{formatCurrency(data.grossProfit)}</span></span>
                <span className="w-[1px] h-3.5 bg-slate-300"></span>
                <span>Gross Loss: <span className="text-[#EF4444]">{formatCurrency(-data.grossLoss)}</span></span>
              </div>
            </div>

            {/* Performance by Day Bar Chart */}
            <div className="lg:col-span-5 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-[#EEF0F4] mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-[#111827] uppercase tracking-tight">Performance by Day</h3>
                    <Info size={14} className="text-[#6B7280]" />
                  </div>
                  <div className="flex gap-1 bg-slate-50 border border-[#EEF0F4] rounded-[10px] p-0.5 text-[10px] font-bold">
                    <button
                      onClick={() => setPnlVsTrades("pnl")}
                      className={`px-3 py-1 rounded-[8px] transition-colors ${
                        pnlVsTrades === "pnl" ? "bg-white text-[#6D3DF5] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      P&L
                    </button>
                    <button
                      onClick={() => setPnlVsTrades("trades")}
                      className={`px-3 py-1 rounded-[8px] transition-colors ${
                        pnlVsTrades === "trades" ? "bg-white text-[#6D3DF5] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      Trades
                    </button>
                  </div>
                </div>

                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dailyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} dy={8} />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dx={-8}
                        tickFormatter={(v) => pnlVsTrades === "pnl" ? `₹${(v / 1000).toFixed(0)}k` : `${v}`}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontWeight: "bold", fontSize: "11px" }}
                        formatter={(val: number) => pnlVsTrades === "pnl" ? [formatCurrency(val), "P&L"] : [val, "Trades"]}
                      />
                      <Bar
                        dataKey={pnlVsTrades === "pnl" ? "pnl" : "tradesCount"}
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={false}
                      >
                        {data.dailyPerformance.map((entry, index) => {
                          const value = pnlVsTrades === "pnl" ? entry.pnl : entry.tradesCount;
                          const color = value >= 0 ? "#10B981" : "#EF4444";
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {pnlVsTrades === "pnl" && (
                <div className="bg-[#ECFDF5] border border-[#A7F3D0]/30 rounded-xl p-3 text-center text-xs font-bold text-[#065F46] mt-4 flex items-center justify-center gap-2">
                  <span>Best Day: <span className="font-extrabold text-[#10B981]">Wednesday (₹7.2K)</span></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]/30"></span>
                  <span>Worst Day: <span className="font-extrabold text-[#EF4444]">Thursday (-₹1.2K)</span></span>
                </div>
              )}
            </div>

            {/* Trading Summary Detailed Stats */}
            <div className="lg:col-span-3 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-[#EEF0F4] mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-tight">Trading Summary</h3>
                  <Info size={14} className="text-[#6B7280]" />
                </div>

                <div className="divide-y divide-[#F1F5F9] text-xs font-bold text-[#475569]">
                  {[
                    { label: "Total Trades", val: data.totalTrades },
                    { label: "Winning Trades", val: `${data.winCount} (${data.winRate.toFixed(1)}%)`, color: "text-[#10B981]" },
                    { label: "Losing Trades", val: `${data.lossCount} (${(100 - data.winRate).toFixed(1)}%)`, color: "text-[#EF4444]" },
                    { label: "Breakeven Trades", val: `${data.breakevenCount} (0%)`, color: "text-[#F59E0B]" },
                    { label: "Long Trades", val: `${data.longTrades} (${((data.longTrades / (data.totalTrades || 1)) * 100).toFixed(1)}%)` },
                    { label: "Short Trades", val: `${data.shortTrades} (${((data.shortTrades / (data.totalTrades || 1)) * 100).toFixed(1)}%)` }
                  ].map((row, idx) => (
                    <div key={idx} className="flex justify-between py-2.5">
                      <span>{row.label}</span>
                      <span className={row.color || "text-[#111827]"}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Card Bar */}
          <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-[22px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm text-left print:hidden">
            <div>
              <h4 className="text-[16px] font-black text-[#111827]">Custom Reports</h4>
              <p className="text-[12px] font-semibold text-[#64748B] mt-1">Create and save custom reports based on your preferences.</p>
            </div>
            
            <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
              {[
                { name: "Performance Report", type: "Performance" },
                { name: "Mistakes Report", type: "Mistakes" },
                { name: "Strategy Report", type: "Strategy" },
                { name: "Monthly Report", type: "Monthly" }
              ].map((rep) => (
                <button
                  key={rep.name}
                  onClick={() => downloadReportByType(rep.type)}
                  className="bg-white border border-[#E9E6F5] text-[#475569] hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {rep.name}
                </button>
              ))}
              <button
                onClick={handleCreateCustom}
                className="bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
              >
                <Plus size={14} />
                <span>Create Custom Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── tab PERFORMANCE ── */}
      {activeTab === "performance" && (
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left space-y-6 animate-fade-in">
          <div>
            <h3 className="font-bold text-[18px] text-[#0F172A]">Performance Ratios & Drawdown</h3>
            <p className="text-xs text-[#64748B] mt-1">Deep metrics to evaluate your overall trading system efficiency.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Profit Factor", val: data.profitFactor.toFixed(2), desc: "Gross profits divided by gross losses" },
              { label: "Expectancy", val: formatCurrency(data.expectancy), desc: "Average expected return per trade" },
              { label: "Recovery Factor", val: "2.40", desc: "Net profit divided by max drawdown" },
              { label: "Sharpe Ratio", val: "1.92", desc: "Risk-adjusted performance score" },
              { label: "Average Profit", val: formatCurrency(data.averageProfit), desc: "Average gain on winning trades" },
              { label: "Average Loss", val: formatCurrency(data.averageLoss), desc: "Average loss on losing trades" },
              { label: "Max Drawdown", val: "8.5%", desc: "Peak-to-trough capital decline" },
              { label: "Win/Loss Ratio", val: (data.winCount / (data.lossCount || 1)).toFixed(2), desc: "Ratio of winning to losing count" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-50 border border-[#EEF0F4] rounded-xl p-4 flex flex-col justify-between min-h-[120px]">
                <div>
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{stat.label}</h4>
                  <p className="text-[20px] font-black text-[#0F172A]">{stat.val}</p>
                </div>
                <p className="text-[10px] text-[#94A3B8] font-semibold mt-2">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── tab TRADES ANALYSIS ── */}
      {activeTab === "trades" && (
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left space-y-6 animate-fade-in">
          <div>
            <h3 className="font-bold text-[18px] text-[#0F172A]">Trades Segmentation</h3>
            <p className="text-xs text-[#64748B] mt-1">Breakdown of performance based on trade direction and asset parameters.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#EEF0F4] rounded-xl p-5">
              <h4 className="font-bold text-[14px] text-[#0F172A] mb-4">Directional Split</h4>
              <div className="space-y-4">
                {/* Long trades row */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#475569] mb-1">
                    <span>Long Trades ({data.longTrades})</span>
                    <span className="text-[#10B981]">{(data.longWins / (data.longTrades || 1) * 100).toFixed(1)}% Win Rate</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1ECFF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${(data.longWins / (data.longTrades || 1) * 100)}%` }}></div>
                  </div>
                </div>
                {/* Short trades row */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#475569] mb-1">
                    <span>Short Trades ({data.shortTrades})</span>
                    <span className="text-[#10B981]">{(data.shortWins / (data.shortTrades || 1) * 100).toFixed(1)}% Win Rate</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1ECFF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${(data.shortWins / (data.shortTrades || 1) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#EEF0F4] rounded-xl p-5 flex flex-col justify-between">
              <h4 className="font-bold text-[14px] text-[#0F172A] mb-2">Efficiency Rating</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Your short trades have a slightly higher win rate than your long trades. Keep focusing on short setup configurations during market reversals.
              </p>
              <div className="bg-[#EFF6FF] border border-[#DBEAFE] p-3 rounded-lg flex items-center gap-2 text-xs font-bold text-[#2563EB] mt-4">
                <Info size={14} />
                <span>Tip: Reducing long exposures on bearish days would increase expectancy.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── tab MISTAKES ── */}
      {activeTab === "mistakes" && (
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left space-y-6 animate-fade-in">
          <div>
            <h3 className="font-bold text-[18px] text-[#0F172A]">Mistakes & Loss Impacts</h3>
            <p className="text-xs text-[#64748B] mt-1">Detailed evaluation of discipline failures and their exact monetary costs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#EEF0F4] rounded-xl p-5">
              <h4 className="font-bold text-[14px] text-[#0F172A] mb-4">Top Mistakes by Frequency</h4>
              <div className="space-y-4">
                {[
                  { name: "Emotional Trades", pct: 37, loss: 4200 },
                  { name: "Overtrading", pct: 24, loss: 3100 },
                  { name: "Early Exit", pct: 18, loss: 1200 },
                  { name: "FOMO Entries", pct: 12, loss: 1500 }
                ].map((mistake, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold text-[#475569] mb-1">
                      <span>{mistake.name} ({mistake.pct}%)</span>
                      <span className="text-[#EF4444]">-₹{mistake.loss}</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1ECFF] rounded-full overflow-hidden">
                      <div className="h-full bg-[#EF4444] rounded-full" style={{ width: `${mistake.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#EEF0F4] rounded-xl p-5 flex flex-col justify-between bg-[#FEF2F2] border-red-100">
              <div>
                <h4 className="font-bold text-[14px] text-red-800 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={16} />
                  Discipline Failure Cost
                </h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  Discipline mistakes account for <span className="font-bold">₹10,000+</span> in total gross losses this month. Eliminating just "Emotional Trades" and "Overtrading" would have increased your total net P&L from <span className="font-bold">{formatCurrency(data.netPnl)}</span> to <span className="font-bold">{formatCurrency(data.netPnl + 7300)}</span>.
                </p>
              </div>
              <button 
                onClick={() => router.push("/dashboard/mistakes")}
                className="mt-6 bg-[#EF4444] hover:bg-[#DC2626] text-white py-2 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Open Mistake Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── tab TIME ── */}
      {activeTab === "time" && (
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left space-y-6 animate-fade-in">
          <div>
            <h3 className="font-bold text-[18px] text-[#0F172A]">Time Analysis</h3>
            <p className="text-xs text-[#64748B] mt-1">Identify profitable trading hours and days of the week.</p>
          </div>
          
          <div className="border border-[#EEF0F4] rounded-xl p-5">
            <h4 className="font-bold text-[14px] text-[#0F172A] mb-4">Hour-by-Hour P&L Distribution</h4>
            <div className="grid grid-cols-4 gap-4">
              {[
                { time: "09:15 - 10:30", pnl: -2400, color: "text-[#EF4444]", bg: "bg-red-50" },
                { time: "10:30 - 12:00", pnl: 6500, color: "text-[#10B981]", bg: "bg-green-50" },
                { time: "12:00 - 14:00", pnl: 8100, color: "text-[#10B981]", bg: "bg-green-50" },
                { time: "14:00 - 15:30", pnl: 6220, color: "text-[#10B981]", bg: "bg-green-50" }
              ].map((slot, idx) => (
                <div key={idx} className={`${slot.bg} p-4 rounded-xl border border-[#EEF0F4] text-center`}>
                  <p className="text-[11px] font-bold text-[#64748B] uppercase mb-1">{slot.time}</p>
                  <p className={`text-[16px] font-black ${slot.color}`}>{slot.pnl >= 0 ? "+" : ""}₹{slot.pnl.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-xl p-3.5 flex items-start gap-2.5 mt-4">
              <Lightbulb size={14} className="text-[#8B5CF6] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#8B5CF6] font-semibold leading-relaxed">
                Avoid taking trades in the first 1 hour of market open. The high volatility causes slippage and early stop-outs, resulting in net losses during this slot.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── tab STRATEGY ── */}
      {activeTab === "strategy" && (
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left space-y-6 animate-fade-in">
          <div>
            <h3 className="font-bold text-[18px] text-[#0F172A]">Strategy Performance</h3>
            <p className="text-xs text-[#64748B] mt-1">Compare win rates and monetary efficiency scores across your setups.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold text-[#64748B] border-b border-[#EEF0F4] uppercase tracking-wider">
                  <th className="pb-4 px-2">Strategy Name</th>
                  <th className="pb-4 px-2">Trades Count</th>
                  <th className="pb-4 px-2">Win Rate</th>
                  <th className="pb-4 px-2 text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Breakout", count: 12, winRate: "66.7%", pnl: 14200, color: "text-[#10B981]" },
                  { name: "Retest", count: 8, winRate: "50%", pnl: 4500, color: "text-[#10B981]" },
                  { name: "Scalping", count: 5, winRate: "80%", pnl: 3800, color: "text-[#10B981]" },
                  { name: "Reversal", count: 3, winRate: "33.3%", pnl: -4080, color: "text-[#EF4444]" }
                ].map((strat, idx) => (
                  <tr key={idx} className="border-b border-[#EEF0F4] last:border-0 hover:bg-slate-50">
                    <td className="py-4 px-2 font-bold text-[#0F172A]">{strat.name}</td>
                    <td className="py-4 px-2 text-[13px] font-semibold text-[#64748B]">{strat.count} trades</td>
                    <td className="py-4 px-2 text-[13px] font-semibold text-[#64748B]">{strat.winRate}</td>
                    <td className={`py-4 px-2 text-right text-[13px] font-bold ${strat.color}`}>
                      {strat.pnl >= 0 ? "+" : ""}₹{strat.pnl.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── tab MONTHLY ── */}
      {activeTab === "monthly" && (
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left space-y-6 animate-fade-in">
          <div>
            <h3 className="font-bold text-[18px] text-[#0F172A]">Monthly Performance Summaries</h3>
            <p className="text-xs text-[#64748B] mt-1">Download monthly PDFs and check historical progress logs.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { month: "May 2026", trades: 28, pnl: 18420, color: "text-[#10B981]", bg: "bg-green-50/50" },
              { month: "April 2026", trades: 32, pnl: 22100, color: "text-[#10B981]", bg: "bg-green-50/50" },
              { month: "March 2026", trades: 24, pnl: -8400, color: "text-[#EF4444]", bg: "bg-red-50/50" }
            ].map((m, idx) => (
              <div key={idx} className="border border-[#EEF0F4] rounded-xl p-5 flex flex-col justify-between min-h-[160px]">
                <div>
                  <h4 className="font-bold text-[15px] text-[#0F172A] mb-1">{m.month}</h4>
                  <p className="text-xs text-[#64748B]">{m.trades} trades recorded</p>
                  <p className={`text-[16px] font-black mt-3 ${m.color}`}>{m.pnl >= 0 ? "+" : ""}₹{m.pnl.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => toast.success(`Downloading PDF for ${m.month}...`)}
                  className="mt-4 w-full bg-white border border-[#E9E6F5] hover:bg-slate-50 text-[#6D3DF5] py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <FileText size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
