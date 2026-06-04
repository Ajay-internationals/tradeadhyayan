"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardMetrics } from "@/app/actions/dashboardMetrics";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Award,
  BarChart2,
  PieChart,
  Percent,
  Clock,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('trade_adhyayan_user');
    if (!email) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const data = await getDashboardMetrics(email);
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 bg-[#FAFBFF] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#64748B] font-medium animate-pulse">Aggregating your trading data...</p>
        </div>
      </div>
    );
  }

  if (!metrics || !metrics.hasTrades) {
    return (
      <div className="flex-1 bg-[#FAFBFF] p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-[#F4F0FF] rounded-full flex items-center justify-center mb-6">
          <BarChart2 className="w-12 h-12 text-[#7C3AED]" />
        </div>
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-3">Welcome to your Dashboard</h1>
        <p className="text-[#64748B] max-w-md text-lg mb-8 leading-relaxed">
          It looks like you haven't recorded any trades yet. Sync your broker or add a trade manually to unlock powerful analytics and insights.
        </p>
        <div className="flex gap-4">
          <button onClick={() => router.push('/dashboard/trade-journal/broker-sync')} className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl shadow-lg shadow-[#7C3AED]/20 transition-all">
            Sync Broker
          </button>
          <button onClick={() => router.push('/dashboard/trade-journal/manual-add')} className="px-6 py-3 bg-white border-2 border-[#E9E6F5] text-[#475569] font-bold rounded-xl hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all shadow-sm">
            Add Manually
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFF] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end pb-4 border-b border-[#E9E6F5]">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Performance Overview</h1>
            <p className="text-[#64748B] font-medium mt-1 text-sm">Your all-time trading statistics derived from verified data.</p>
          </div>
          <div className="hidden sm:flex gap-2">
            {metrics.overtradingAlert && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100">
                <AlertTriangle className="w-4 h-4" /> Overtrading Detected
              </span>
            )}
            {metrics.revengeAlert && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                <ShieldAlert className="w-4 h-4" /> Revenge Trading Risk
              </span>
            )}
          </div>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5]">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Net P&L</p>
            <h3 className={`text-2xl font-black tracking-tight ${metrics.netPnl >= 0 ? 'text-[#15B77A]' : 'text-[#E94B8A]'}`}>
              {formatCurrency(metrics.netPnl)}
            </h3>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5]">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Win Rate</p>
            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">{metrics.winRate.toFixed(1)}%</h3>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5]">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Profit Factor</p>
            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">{metrics.profitFactor.toFixed(2)}</h3>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5]">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Total Trades</p>
            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">{metrics.totalTrades}</h3>
          </div>
        </div>

        {/* Deep Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><TrendingUp className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Avg Win</p><p className="font-black text-slate-800">{formatCurrency(metrics.averageProfit)}</p></div>
          </div>
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl"><TrendingDown className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Avg Loss</p><p className="font-black text-slate-800">{formatCurrency(metrics.averageLoss)}</p></div>
          </div>
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Award className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Best Trade</p><p className="font-black text-slate-800">{formatCurrency(metrics.bestTrade)}</p></div>
          </div>
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Zap className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Discipline</p><p className="font-black text-slate-800">{metrics.disciplineScore.toFixed(0)}%</p></div>
          </div>
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><AlertTriangle className="w-5 h-5"/></div>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Mistakes</p><p className="font-black text-slate-800">{metrics.mistakeCount}</p></div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5]">
            <h3 className="text-lg font-black text-[#0F172A] mb-6">Equity Curve</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.equityCurve}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: "#64748B"}} axisLine={false} tickLine={false} dy={10} minTickGap={30}/>
                  <YAxis tick={{fontSize: 12, fill: "#64748B"}} axisLine={false} tickLine={false} dx={-10} domain={['auto', 'auto']} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    formatter={(val: number) => [formatCurrency(val), "Equity"]}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5]">
            <h3 className="text-lg font-black text-[#0F172A] mb-6">Daily P&L</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.dailyPnlChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: "#64748B"}} axisLine={false} tickLine={false} dy={10}/>
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => [formatCurrency(val), "P&L"]}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 4, 4]}>
                    {metrics.dailyPnlChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#15B77A' : '#E94B8A'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Breakdowns & Recent Trades */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5]">
              <h3 className="text-sm font-black text-[#0F172A] mb-4 uppercase tracking-wider">Strategy Perf.</h3>
              <div className="space-y-3">
                {metrics.strategyPerf.slice(0, 4).map((s: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-[#FAFBFF] rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{s.winRate.toFixed(0)}% Win Rate</p>
                    </div>
                    <span className={`font-black text-sm ${s.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {s.pnl > 0 ? '+' : ''}{(s.pnl / 1000).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5]">
              <h3 className="text-sm font-black text-[#0F172A] mb-4 uppercase tracking-wider">Instrument Perf.</h3>
              <div className="space-y-3">
                {metrics.instrumentPerf.slice(0, 4).map((inst: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-[#FAFBFF] rounded-xl border border-slate-100">
                    <p className="font-bold text-sm text-slate-800">{inst.name}</p>
                    <span className={`font-black text-sm ${inst.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {inst.pnl > 0 ? '+' : ''}{(inst.pnl / 1000).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5] flex flex-col">
            <h3 className="text-lg font-black text-[#0F172A] mb-4">Recent Trades</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-xs text-[#64748B] border-b border-[#E9E6F5] uppercase tracking-wider">
                    <th className="pb-3 font-bold">Asset</th>
                    <th className="pb-3 font-bold">Type</th>
                    <th className="pb-3 font-bold">Strategy</th>
                    <th className="pb-3 font-bold text-right">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {metrics.recentTrades.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[#FAFBFF] transition-colors">
                      <td className="py-4 font-bold text-[#0F172A]">{t.symbol}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wider ${t.direction === 'LONG' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-4 text-[#475569] font-medium">{t.setup || '-'}</td>
                      <td className={`py-4 text-right font-black ${t.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(t.netPnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => router.push('/dashboard/trade-journal')}
                className="w-full mt-4 py-3 bg-[#FAFBFF] hover:bg-[#F4F0FF] text-[#7C3AED] font-bold text-sm rounded-xl transition-colors border border-transparent hover:border-[#7C3AED]/20"
              >
                View Complete Journal
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
