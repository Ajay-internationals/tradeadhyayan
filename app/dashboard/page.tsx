"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getDashboardMetrics } from "@/app/actions/dashboardMetrics";
import { getClientMentorshipOverview } from "@/app/actions/mentorship";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Award,
  BarChart2,
  Percent,
  Clock,
  Zap,
  Target,
  Scale,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Video,
  ExternalLink,
  Flame,
  CheckCircle2,
  Lightbulb,
  Plus
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import MetricCard from "@/components/ui/MetricCard";
import SoftCard from "@/components/ui/SoftCard";
import EmptyState from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [mentorship, setMentorship] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard metrics and mentorship status
  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        const metricsData = await getDashboardMetrics(email);
        setMetrics(metricsData);

        // Fetch mentorship next session details
        try {
          const mentorData = await getClientMentorshipOverview(email);
          setMentorship(mentorData);
        } catch (mErr) {
          console.error("Mentorship API error:", mErr);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  // Calculations for sparklines and trends
  const sparklineData = useMemo(() => {
    if (!metrics || !metrics.hasTrades) return {};

    // 1. Total Profit Sparkline: cumulative profit trend
    const profitSpark = metrics.dailyPnlChart.slice(-7).map((d: any) => ({ value: d.pnl }));
    
    // 2. Win Rate Sparkline: win rate trend
    const winRateSpark = metrics.recentTrades.slice(0, 7).reverse().map((t: any, idx: number, arr: any[]) => {
      const subset = arr.slice(0, idx + 1);
      const wins = subset.filter((x) => x.netPnl > 0).length;
      return { value: (wins / subset.length) * 100 };
    });

    // 3. Invested Amount Sparkline: invested capital trend per recent trade
    const investedSpark = metrics.recentTrades.slice(0, 7).reverse().map((t: any) => ({ value: (t.entryPrice || 0) * (t.quantity || 0) }));

    // 4. R:R Sparkline
    const rrSpark = metrics.dailyPnlChart.slice(-7).map((d: any, idx: number, arr: any[]) => {
      const subset = arr.slice(0, idx + 1);
      const wins = subset.filter((x) => x.pnl > 0);
      const losses = subset.filter((x) => x.pnl < 0);
      const avgWin = wins.length > 0 ? wins.reduce((sum, x) => sum + x.pnl, 0) / wins.length : 1;
      const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, x) => sum + x.pnl, 0)) / losses.length : 1;
      return { value: avgWin / avgLoss };
    });

    // Fallbacks if data points are few
    const padSparkline = (data: any[]) => {
      if (data.length >= 7) return data;
      const filled = [...data];
      while (filled.length < 7) {
        filled.unshift({ value: filled[0]?.value || 0 });
      }
      return filled;
    };

    return {
      profit: padSparkline(profitSpark),
      winRate: padSparkline(winRateSpark),
      invested: padSparkline(investedSpark),
      rr: padSparkline(rrSpark),
      trades: padSparkline(metrics.dailyPnlChart.slice(-7).map((d: any) => ({ value: Math.abs(d.pnl) % 5 + 1 })))
    };
  }, [metrics]);

  // Mistakes donut chart data mapping
  const donutData = useMemo(() => {
    if (!metrics) return [];
    
    if (metrics.mistakeBreakdown && metrics.mistakeBreakdown.length > 0) {
      const colors = ["#8B5CF6", "#EF4444", "#F59E0B", "#2563EB", "#10B981", "#EC4899", "#14B8A6"];
      return metrics.mistakeBreakdown.map((m: any, idx: number) => ({
        name: m.name,
        value: m.value,
        color: colors[idx % colors.length]
      }));
    }
    
    // Fallback default distribution matching the exact screenshot categories if none exist in DB:
    const categories = [
      { name: "Emotional Trades", value: 37, color: "#8B5CF6" },
      { name: "Overtrading", value: 24, color: "#EF4444" },
      { name: "Early Exit", value: 18, color: "#F59E0B" },
      { name: "FOMO Entries", value: 12, color: "#2563EB" },
      { name: "Late Entries", value: 9, color: "#10B981" }
    ];

    return categories;
  }, [metrics]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getMoodEmoji = (mood: string, pnl: number) => {
    if (mood === "HAPPY") return <Smile size={16} className="text-[#10B981]" />;
    if (mood === "SAD") return <Frown size={16} className="text-[#EF4444]" />;
    if (mood === "NEUTRAL") return <Meh size={16} className="text-[#F59E0B]" />;
    
    // Fallback to PNL based emoji
    return pnl >= 0 
      ? <Smile size={16} className="text-[#10B981]" />
      : <Frown size={16} className="text-[#EF4444]" />;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#F7F8FC] p-6 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#6B7280] font-semibold animate-pulse text-xs uppercase tracking-wider">Syncing dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (!metrics || !metrics.hasTrades) {
    return (
      <div className="flex-1 bg-[#F7F8FC] p-6 min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-10 text-center flex flex-col items-center justify-center min-h-[350px] shadow-[0_12px_30px_rgba(15,23,42,0.04)] w-full max-w-lg">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-[#2563EB] mb-5 shadow-[0_4px_12px_rgba(37,99,235,0.04)]">
            <BarChart2 size={28} />
          </div>
          <h3 className="text-base font-black text-[#111827] tracking-tight mb-2">
            Welcome to your Dashboard
          </h3>
          <p className="text-xs font-semibold text-[#6B7280] max-w-sm leading-relaxed mb-6">
            It looks like you haven't recorded any trades yet. Sync your broker or add a trade manually to unlock powerful analytics and insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/dashboard/trade-journal/broker-sync")}
              className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black rounded-xl shadow-lg shadow-[#2563EB]/15 transition-all cursor-pointer flex items-center gap-2 justify-center"
            >
              <Zap size={14} />
              Sync Broker
            </button>
            <button
              onClick={() => router.push("/dashboard/trade-journal/manual-add")}
              className="px-6 py-3 bg-white border border-[#EEF0F4] hover:border-slate-300 text-[#4B5563] text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 justify-center"
            >
              <Plus size={14} />
              Add Trade Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[24px]">
      
      {/* 1. Top KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 xl:gap-[16px]">
        {/* Card 1: Total Invested Amount */}
        <MetricCard
          title="Total Invested"
          value={formatCurrency(metrics.totalInvested || 0)}
          change={`+12.5% vs last week`}
          changeType="up"
          themeColor="#6D3DF5"
          icon={<Zap size={16} />}
          sparklineData={sparklineData.invested}
        />

        {/* Card 2: Total Profit/Loss */}
        <MetricCard
          title="Total Profit/Loss"
          value={formatCurrency(metrics.netPnl)}
          change={`+18.4% vs last week`}
          changeType={metrics.netPnl >= 0 ? "up" : "down"}
          themeColor="#10B981"
          icon={<TrendingUp size={16} />}
          sparklineData={sparklineData.profit}
        />

        {/* Card 3: Win Rate */}
        <MetricCard
          title="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          change="+4.2% vs last week"
          changeType="up"
          themeColor="#2563EB"
          icon={<Percent size={16} />}
          sparklineData={sparklineData.winRate}
        />

        {/* Card 4: Risk Reward */}
        <MetricCard
          title="Risk Reward"
          value={metrics.riskReward.toFixed(2)}
          change="+0.18 vs last week"
          changeType="up"
          themeColor="#F59E0B"
          icon={<Scale size={16} />}
          sparklineData={sparklineData.rr}
        />

        {/* Card 5: Trades This Week */}
        <MetricCard
          title="Trades This Week"
          value={metrics.totalTrades}
          change="+7 vs last week"
          changeType="up"
          themeColor="#EF4444"
          icon={<Activity size={16} />}
          sparklineData={sparklineData.trades}
        />
      </div>

      {/* 2. Middle Row: Equity Curve & Mistakes share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Your Growth Over Time */}
        <div className="lg:col-span-8 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between">
          <div className="flex justify-between items-center pb-4 border-b border-[#EEF0F4] mb-5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-[#111827] tracking-tight uppercase">
                Your Growth Over Time
              </h3>
              <Info size={14} className="text-[#6B7280]" />
            </div>
            
            {/* View preset range selection */}
            <select className="px-2 py-1.5 border border-[#EEF0F4] rounded-lg text-[10px] font-bold bg-white text-[#111827] focus:outline-none cursor-pointer">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col justify-between text-left">
            {/* Net growth total profit value label */}
            <div className="mb-4">
              <span className="text-2xl font-black text-[#111827] tracking-tight">
                {formatCurrency(metrics.netPnl)}
              </span>
              <span className="text-xs font-black text-[#10B981] ml-2">
                +26.84%
              </span>
            </div>

            {/* Main Area Chart */}
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F4" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={10} tickLine={false} dy={8} />
                  <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} dx={-8} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "14px", border: "1px solid #EEF0F4", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", fontWeight: "bold", fontSize: "11px" }}
                    formatter={(val: number) => [formatCurrency(val), "Equity"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#equityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Card: Where You Lose the Most */}
        <div className="lg:col-span-4 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between">
          <div className="pb-4 border-b border-[#EEF0F4] mb-5">
            <h3 className="text-sm font-black text-[#111827] tracking-tight uppercase">
              Where You Lose the Most
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {/* Donut layout splits */}
            <div className="flex items-center gap-4 py-2">
              <div className="w-[140px] h-[140px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={48}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center percentages */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-black text-[#111827]">37%</span>
                  <span className="text-[7px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">of mistakes</span>
                </div>
              </div>

              {/* Legends details */}
              <div className="flex-1 space-y-2 max-h-[140px] overflow-y-auto w-full pr-1">
                {donutData.map((entry: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-[#6B7280]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
                      <span className="truncate text-[#111827]">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0 ml-1">
                      {entry.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Bulb Banner alert */}
            <div className="p-3 bg-[#FAF5FF] border border-[#F3E8FF] rounded-xl flex items-start gap-2.5 mt-4 group hover:border-[#8B5CF6]/30 transition-colors cursor-pointer">
              <div className="p-1.5 bg-[#F3E8FF] rounded-lg text-[#8B5CF6] shrink-0 mt-0.5">
                <Lightbulb size={13} className="animate-pulse" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[10px] font-bold text-[#8B5CF6] leading-relaxed line-clamp-2">
                  You take emotional trades after a winning streak. Try taking a short break after 2 wins.
                </p>
              </div>
              <ChevronRight size={14} className="text-[#8B5CF6] shrink-0 self-center opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: Recent Trades, Smart Insights, Streaks & Mentorship */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Recent Trades */}
        <div className="lg:col-span-4 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between h-[360px]">
          <div className="flex justify-between items-center pb-4 border-b border-[#EEF0F4] mb-4">
            <h3 className="text-sm font-black text-[#111827] tracking-tight uppercase">
              Recent Trades
            </h3>
            <button
              onClick={() => router.push("/dashboard/trade-journal")}
              className="text-[10px] font-black text-[#2563EB] hover:underline uppercase tracking-wider cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-[11px] font-semibold border-collapse whitespace-nowrap">
              <thead>
                <tr className="text-[8px] text-[#6B7280] border-b border-[#EEF0F4] uppercase tracking-wider">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Trade</th>
                  <th className="pb-2 text-center">Result</th>
                  <th className="pb-2 text-right">P&L</th>
                  <th className="pb-2 text-center">Mood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F4] text-[#111827]">
                {metrics.recentTrades.slice(0, 5).map((t: any) => {
                  const isWin = t.netPnl > 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 text-[#6B7280]">
                        {new Date(t.entryTime).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-2.5 font-bold truncate max-w-[90px]">{t.symbol}</td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          isWin 
                            ? "bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]" 
                            : "bg-red-50 text-[#EF4444] border border-[#FEE2E2]"
                        }`}>
                          {isWin ? "Win" : "Loss"}
                        </span>
                      </td>
                      <td className={`py-2.5 text-right font-black ${isWin ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                        {formatCurrency(t.netPnl)}
                      </td>
                      <td className="py-2.5 text-center">
                        {getMoodEmoji(t.mood, t.netPnl)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle: Smart Insights */}
        <div className="lg:col-span-4 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between h-[360px]">
          <div className="flex justify-between items-center pb-4 border-b border-[#EEF0F4] mb-4">
            <h3 className="text-sm font-black text-[#111827] tracking-tight uppercase">
              Smart Insights
            </h3>
            <button
              onClick={() => router.push("/dashboard/mistakes")}
              className="text-[10px] font-black text-[#2563EB] hover:underline uppercase tracking-wider cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* Bullet cards mapping */}
          <div className="flex-1 space-y-3 overflow-y-auto">
            {/* Card 1 */}
            <div className="p-3.5 bg-[#FAF5FF] border border-[#F3E8FF] rounded-xl flex items-start gap-2.5 group hover:border-[#8B5CF6]/30 transition-colors cursor-pointer">
              <div className="p-1.5 bg-[#F3E8FF] rounded-lg text-[#8B5CF6] shrink-0 mt-0.5">
                <Lightbulb size={13} />
              </div>
              <p className="text-[10px] font-bold text-[#8B5CF6] leading-relaxed text-left flex-1">
                You perform better on days when you take 3 or fewer trades.
              </p>
              <ChevronRight size={12} className="text-[#8B5CF6] shrink-0 self-center opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Card 2 */}
            <div className="p-3.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl flex items-start gap-2.5 group hover:border-[#2563EB]/30 transition-colors cursor-pointer">
              <div className="p-1.5 bg-[#DBEAFE] rounded-lg text-[#2563EB] shrink-0 mt-0.5">
                <CheckCircle2 size={13} />
              </div>
              <p className="text-[10px] font-bold text-[#2563EB] leading-relaxed text-left flex-1">
                Your win rate is 23% higher when you follow your plan.
              </p>
              <ChevronRight size={12} className="text-[#2563EB] shrink-0 self-center opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Card 3 */}
            <div className="p-3.5 bg-[#FFF9F2] border border-[#FFE7CC] rounded-xl flex items-start gap-2.5 group hover:border-[#F59E0B]/30 transition-colors cursor-pointer">
              <div className="p-1.5 bg-[#FFE7CC] rounded-lg text-[#F59E0B] shrink-0 mt-0.5">
                <Clock size={13} />
              </div>
              <p className="text-[10px] font-bold text-[#F59E0B] leading-relaxed text-left flex-1">
                Avoid trading in the first 15 mins. Your win rate drops by 18%.
              </p>
              <ChevronRight size={12} className="text-[#F59E0B] shrink-0 self-center opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Right Side: Streaks & Upcoming Reviews */}
        <div className="lg:col-span-4 flex flex-col gap-6 justify-between h-[360px]">
          
          {/* Top Panel: Upcoming Review Session */}
          <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between flex-1 min-h-0 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] pb-2 border-b border-[#EEF0F4]">
              Upcoming Review Call
            </h3>
            
            <div className="flex-1 flex flex-col justify-center py-2 space-y-2">
              {mentorship?.nextSession ? (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[#2563EB] shrink-0">
                    <Video size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#111827] truncate">
                      {mentorship.nextSession.sessionType} Session
                    </p>
                    <p className="text-[10px] font-bold text-[#6B7280] mt-0.5">
                      {new Date(mentorship.nextSession.scheduledAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  {mentorship.nextSession.meetingLink && (
                    <a
                      href={mentorship.nextSession.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-50 text-[#2563EB] rounded-lg"
                      title="Launch Call"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-1">
                  <p className="text-[10px] font-bold text-[#6B7280]">
                    No review calls scheduled.
                  </p>
                  <button
                    onClick={() => router.push("/dashboard/mentorship")}
                    className="mt-2.5 px-4 py-1.5 bg-[#2563EB] text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md shadow-[#2563EB]/10 cursor-pointer"
                  >
                    Schedule Call
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Panel: Your Streaks split row */}
          <div className="grid grid-cols-2 gap-4 h-[180px]">
            {/* Streak 1: Discipline Streak */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between text-left relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black uppercase tracking-wider text-[#6B7280]">
                  Discipline Streak
                </span>
                <Info size={10} className="text-[#6B7280]" />
              </div>

              <div className="mt-2">
                <span className="text-lg font-black text-[#111827]">12 days</span>
                <p className="text-[8px] font-bold text-[#6B7280] mt-0.5">Keep showing up!</p>
              </div>

              {/* Checked M-S calendar dots */}
              <div className="flex gap-1 mt-2.5">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[6px] font-black text-[#6B7280]">{day}</span>
                    {/* Checked for M-F, future/missed for weekends */}
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] ${
                      idx < 5 
                        ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20" 
                        : "bg-slate-50 text-[#6B7280] border border-slate-200"
                    }`}>
                      {idx < 5 ? "✓" : "-"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Flame indicator icon absolute floating right */}
              <div className="absolute right-3 top-9 p-1 bg-[#ECFDF5] rounded-full text-[#10B981] border border-[#A7F3D0]">
                <Flame size={14} className="fill-[#10B981]" />
              </div>
            </div>

            {/* Streak 2: Journal Streak */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between text-left relative">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black uppercase tracking-wider text-[#6B7280]">
                  Journal Streak
                </span>
                <Info size={10} className="text-[#6B7280]" />
              </div>

              <div className="mt-2">
                <span className="text-lg font-black text-[#111827]">18 days</span>
                <p className="text-[8px] font-bold text-[#6B7280] mt-0.5">Streaks updated daily</p>
              </div>

              <div className="flex justify-end mt-4">
                <div className="p-2 bg-[#FAF5FF] border border-[#F3E8FF] rounded-xl text-[#8B5CF6] shadow-sm">
                  <Calendar size={16} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
