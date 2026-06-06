"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  BarChart,
  Target,
  MoreVertical,
  Plus,
  AlertTriangle,
  BookOpen,
  RefreshCw
} from "lucide-react";

export default function TradeJournalPage() {
  const [kpis, setKpis] = useState({
    totalPnl: 0,
    winRate: 0,
    totalTrades: 0,
    averageWin: 0,
    averageLoss: 0,
    bestRR: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Trades");
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = localStorage.getItem("trade_adhyayan_user") || "student1_loss@tradeadhyayan.com";
        const [kpiRes, tradesRes] = await Promise.all([
          fetch(`/api/journal/kpis?email=${userEmail}`),
          fetch(`/api/journal/trades?email=${userEmail}`)
        ]);

        const kpiJson = await kpiRes.json();
        if (kpiJson.success) setKpis(kpiJson.data);

        const tradesJson = await tradesRes.json();
        if (tradesJson.success) setTrades(tradesJson.data);

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-2 px-[28px] pb-[28px] max-w-7xl mx-auto space-y-[20px]">
      {/* Header */}
      <header className="flex justify-between items-end pb-4 border-b border-[#E9E6F5]">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Trade Journal</h1>
          <p className="text-sm font-semibold text-[#64748B] mt-1">Track every trade. Reflect. Improve.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 h-10 bg-white border border-[#E9E6F5] rounded-xl text-xs font-bold text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all cursor-pointer shadow-sm">
            <CalendarIcon size={14} />
            <span>This Month</span>
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 h-10 bg-white border border-[#E9E6F5] rounded-xl text-xs font-bold text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all cursor-pointer shadow-sm">
            <Filter size={14} />
            <span>Filters</span>
          </button>
          <button className="w-10 h-10 bg-white border border-[#E9E6F5] rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#7C3AED] transition-colors cursor-pointer shadow-sm">
            <Bell size={16} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#8B5CF6] text-white flex items-center justify-center font-black text-xs shadow-md">
            ME
          </div>
        </div>
      </header>

      {/* Top Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {/* Manual Add */}
        <div onClick={() => window.location.href = "/dashboard/trade-journal/manual-add"} className="group block cursor-pointer h-full">
          <div className="bg-white border border-[#E9E6F5] rounded-[20px] p-6 shadow-[0px_8px_24px_rgba(15,23,42,0.04)] hover:border-[#7C3AED] transition-all relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#F4F0FF] rounded-full blur-3xl group-hover:bg-[#7C3AED]/20 transition-all"></div>
            <div>
              <h3 className="text-lg font-black text-[#0F172A] relative z-10">Manual Add Trade</h3>
              <p className="text-[13px] font-bold text-[#7C3AED] mb-2 relative z-10">Add trades manually or import from file</p>
              <p className="text-xs font-semibold text-[#64748B] leading-relaxed max-w-sm relative z-10">
                Add a single trade manually, upload Excel files, or paste your trades to keep your journal updated.
              </p>
            </div>
            <div className="mt-6 flex justify-end relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#F4F0FF] text-[#7C3AED] flex items-center justify-center group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                <ArrowRight size={18} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Broker Sync */}
        <div onClick={() => window.location.href = "/dashboard/trade-journal/broker-sync"} className="group block cursor-pointer h-full">
          <div className="bg-white border border-[#E9E6F5] rounded-[20px] p-6 shadow-[0px_8px_24px_rgba(15,23,42,0.04)] hover:border-[#10B981] transition-all relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#ECFDF5] rounded-full blur-3xl group-hover:bg-[#10B981]/20 transition-all"></div>
            <div>
              <div className="flex items-center gap-3 mb-1 relative z-10">
                <h3 className="text-lg font-black text-[#0F172A]">Broker Sync</h3>
                <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[10px] font-black uppercase tracking-wider rounded-md border border-[#10B981]/20">
                  Recommended
                </span>
              </div>
              <p className="text-[13px] font-bold text-[#10B981] mb-2 relative z-10">Automatically import trades from your broker</p>
              <p className="text-xs font-semibold text-[#64748B] leading-relaxed max-w-sm relative z-10">
                Connect your broker account and automatically sync all your trades, positions and history.
              </p>
            </div>
            <div className="mt-6 flex justify-end relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-colors">
                <ArrowRight size={18} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[16px]">
        <KpiCard title="Total P&L" value={`₹${kpis.totalPnl.toLocaleString()}`} color={kpis.totalPnl >= 0 ? "text-[#10B981]" : "text-[#EC4899]"} icon={<Activity size={16} />} />
        <KpiCard title="Win Rate" value={`${kpis.winRate.toFixed(1)}%`} color="text-[#0F172A]" icon={<TrendingUp size={16} />} />
        <KpiCard title="Total Trades" value={kpis.totalTrades.toString()} color="text-[#0F172A]" icon={<BarChart size={16} />} />
        <KpiCard title="Average Win" value={`₹${kpis.averageWin.toLocaleString(undefined, {maximumFractionDigits: 0})}`} color="text-[#10B981]" icon={<Award size={16} />} />
        <KpiCard title="Average Loss" value={`₹${kpis.averageLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}`} color="text-[#EC4899]" icon={<AlertTriangle size={16} />} />
        <KpiCard title="Best R:R" value={`1 : ${kpis.bestRR.toFixed(1)}`} color="text-[#0F172A]" icon={<Target size={16} />} />
      </div>

      {/* Trade Table Section */}
      <div className="bg-white border border-[#E9E6F5] rounded-[22px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] overflow-hidden">
        {/* Table Header / Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-[#E9E6F5] px-6">
          <div className="flex gap-6">
            {["All Trades", "Open Trades", "Closed Trades"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-black transition-colors relative cursor-pointer ${
                  activeTab === tab ? "text-[#7C3AED]" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7C3AED] rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>
          <div className="py-3 hidden sm:block">
            <input 
              type="text" 
              placeholder="Search trades..." 
              className="px-4 py-2 bg-slate-50 border border-[#E9E6F5] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-colors w-64"
            />
          </div>
        </div>

        {/* Table Body */}
        {trades.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#F4F0FF] rounded-full flex items-center justify-center text-[#7C3AED] mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="text-base font-black text-[#0F172A] mb-2">No trades added yet.</h3>
            <p className="text-xs font-semibold text-[#64748B] max-w-sm mb-6 leading-relaxed">
              Add your first trade manually or connect your broker to start journaling and calculating your metrics.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/dashboard/trade-journal/manual-add"
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-black tracking-wide transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Add Trade
              </Link>
              <Link 
                href="/dashboard/trade-journal/broker-sync"
                className="px-5 py-2.5 bg-white border border-[#E9E6F5] hover:border-[#10B981] hover:text-[#10B981] text-[#64748B] rounded-xl text-xs font-black tracking-wide transition-colors shadow-sm flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Connect Broker
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E9E6F5] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Symbol</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Entry / Exit</th>
                  <th className="py-4 px-6">Qty</th>
                  <th className="py-4 px-6">Net P&L</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trades.map((trade: any) => (
                  <tr key={trade.id} className="border-b border-[#E9E6F5] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#0F172A]">{trade.symbol}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-[6px] text-[10px] font-bold ${trade.direction === 'LONG' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FDF2F8] text-[#EC4899]'}`}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">
                      ₹{trade.entryPrice} {trade.exitPrice ? `/ ₹${trade.exitPrice}` : ''}
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#0F172A]">{trade.quantity}</td>
                    <td className={`py-4 px-6 font-black ${trade.netPnl > 0 ? 'text-[#10B981]' : trade.netPnl < 0 ? 'text-[#EC4899]' : 'text-[#64748B]'}`}>
                      {trade.netPnl ? `₹${trade.netPnl}` : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-[6px] text-[10px] font-bold ${trade.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-[#64748B]">
                      {new Date(trade.entryTime).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

function KpiCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E9E6F5] rounded-[18px] p-5 shadow-[0px_8px_24px_rgba(15,23,42,0.02)] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">{title}</span>
        <div className="text-[#64748B]/50">{icon}</div>
      </div>
      <span className={`text-xl font-black ${color}`}>{value}</span>
    </div>
  );
}
