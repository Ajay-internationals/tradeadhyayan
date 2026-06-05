"use client";

import React, { useState, useEffect } from "react";
import { getMentorDashboard } from "@/app/actions/mentorship";
import { 
  Users, Clock, CheckSquare, Calendar, TrendingUp, BarChart, Eye,
  AlertCircle, ChevronRight, CheckCircle2, UserCircle2, Info
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MentorCharts } from "./MentorCharts";

export default function MentorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTraderId, setSelectedTraderId] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('trade_adhyayan_user');
    if (!email) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const result = await getMentorDashboard(email);
        setData(result);
        if (result.clients && result.clients.length > 0) {
          setSelectedTraderId(result.clients[0].id);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6D3DF5] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data) return <div className="p-6">No data available.</div>;

  const selectedTrader = data.clients.find((c: any) => c.id === selectedTraderId) || data.clients[0];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6" style={{ backgroundColor: "#FAFAFF" }}>
      {/* Topbar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Mentor Dashboard</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Manage your clients and track their trading progress.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#E7EAF3] shadow-sm cursor-pointer hover:border-[#6D3DF5] transition-colors">
            <Calendar size={16} className="text-[#64748B]" />
            <span className="text-sm font-bold text-[#0F172A]">This Month</span>
          </div>
          
          <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-[#E7EAF3] cursor-pointer shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${data.mentor?.name || 'Mentor'}`} alt="Mentor" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-[#0F172A]">{data.mentor?.name || 'Mentor'}</p>
              <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">Mentor</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Assigned Clients", val: data.kpis?.assignedClients || 0, sub: "Out of 20", icon: Users, bg: "bg-[#DBEAFE]", iconColor: "text-[#2563EB]" },
          { label: "Pending Reviews", val: data.kpis?.pendingReviews || 0, sub: "Needs action", icon: Clock, bg: "bg-[#FFEDD5]", iconColor: "text-[#EA580C]" },
          { label: "Completed Reviews", val: data.kpis?.completedReviews || 0, sub: "This month", icon: CheckSquare, bg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]" },
          { label: "Upcoming Sessions", val: data.kpis?.upcomingSessions || 0, sub: "Next 7 days", icon: Calendar, bg: "bg-[#F3E8FF]", iconColor: "text-[#9333EA]" },
          { label: "Avg Client Score", val: `${(data.kpis?.avgClientScore || 0).toFixed(0)}/100`, sub: "Across all clients", icon: BarChart, bg: "bg-[#FFE4E6]", iconColor: "text-[#E11D48]" },
          { label: "Client Progress", val: `+${data.kpis?.clientProgress || 0}%`, sub: "vs last month", icon: TrendingUp, bg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[18px] border border-[#E7EAF3] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={20} className={kpi.iconColor} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{kpi.label}</p>
              <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">{kpi.val}</h2>
              <p className="text-[11px] font-semibold text-[#64748B] mt-1">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Review Queue & Traders) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Review Queue (Kanban-style) */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[18px] text-[#0F172A]">Review Queue</h3>
              <button className="bg-[#F1ECFF] text-[#6D3DF5] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#E4DEFF] transition-colors">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              
              {/* Column 1: Pending */}
              <div className="bg-[#FAFAFF] rounded-[16px] p-4 border border-[#E7EAF3] flex flex-col h-[300px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#E11D48]"></div>
                    <span className="text-[13px] font-bold text-[#0F172A]">Pending</span>
                  </div>
                  <span className="text-[11px] font-bold bg-white border border-[#E7EAF3] text-[#0F172A] px-2 py-0.5 rounded-full shadow-sm">
                    {data.reviewRequests?.filter((r:any) => r.status === "PENDING").length || 0}
                  </span>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  {data.reviewRequests?.filter((r:any) => r.status === "PENDING").map((req:any) => (
                    <div key={req.id} className="bg-white p-3.5 rounded-[12px] border border-[#E7EAF3] shadow-sm cursor-grab hover:border-[#6D3DF5] transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.Client?.name || 'C'}`} alt="avatar"/>
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#0F172A]">{req.Client?.name || 'Client'}</p>
                          <p className="text-[10px] font-semibold text-[#64748B]">{req.selectedTradeIds?.length || 0} trades shared</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#94A3B8]">{new Date(req.submittedAt).toLocaleDateString()}</span>
                        <Link href={`/mentor/reviews?id=${req.id}`} className="bg-[#F1ECFF] text-[#6D3DF5] text-[11px] font-bold px-3 py-1.5 rounded-[6px] hover:bg-[#E4DEFF]">
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: In Review */}
              <div className="bg-[#FAFAFF] rounded-[16px] p-4 border border-[#E7EAF3] flex flex-col h-[300px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#EA580C]"></div>
                    <span className="text-[13px] font-bold text-[#0F172A]">In Review</span>
                  </div>
                  <span className="text-[11px] font-bold bg-white border border-[#E7EAF3] text-[#0F172A] px-2 py-0.5 rounded-full shadow-sm">
                    {data.reviewRequests?.filter((r:any) => r.status === "IN_REVIEW").length || 0}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#E7EAF3] rounded-[12px] bg-white bg-opacity-50">
                   <p className="text-[12px] font-bold text-[#94A3B8]">Drop here to start</p>
                </div>
              </div>

              {/* Column 3: Completed */}
              <div className="bg-[#FAFAFF] rounded-[16px] p-4 border border-[#E7EAF3] flex flex-col h-[300px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>
                    <span className="text-[13px] font-bold text-[#0F172A]">Completed</span>
                  </div>
                  <span className="text-[11px] font-bold bg-white border border-[#E7EAF3] text-[#0F172A] px-2 py-0.5 rounded-full shadow-sm">
                    {data.reviewRequests?.filter((r:any) => r.status === "COMPLETED").length || 0}
                  </span>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  {data.reviewRequests?.filter((r:any) => r.status === "COMPLETED").map((req:any) => (
                    <div key={req.id} className="bg-white p-3.5 rounded-[12px] border border-[#E7EAF3] shadow-sm opacity-70">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={16} className="text-[#16A34A]" />
                        <p className="text-[13px] font-bold text-[#0F172A] line-through decoration-[#94A3B8]">{req.Client?.name || 'Client'}</p>
                      </div>
                      <p className="text-[10px] font-semibold text-[#64748B] pl-6">Reviewed on {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : 'Recently'}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* My Traders Table */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">My Traders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold text-[#64748B] border-b border-[#E7EAF3] uppercase tracking-wider">
                    <th className="pb-4 px-2">Trader</th>
                    <th className="pb-4 px-2">Current Score</th>
                    <th className="pb-4 px-2">Win Rate</th>
                    <th className="pb-4 px-2">Net P&L</th>
                    <th className="pb-4 px-2 text-center">Pending Review</th>
                    <th className="pb-4 px-2">Status</th>
                    <th className="pb-4 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clients?.map((c:any) => (
                    <tr 
                      key={c.id} 
                      className={`border-b border-[#E7EAF3] last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${selectedTraderId === c.id ? 'bg-[#F1ECFF]' : ''}`}
                      onClick={() => setSelectedTraderId(c.id)}
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} alt={c.name} />
                          </div>
                          <span className="text-[13px] font-bold text-[#0F172A]">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-[13px] font-bold text-[#0F172A]">
                        {c.currentScore ? `${c.currentScore.toFixed(0)}/100` : "N/A"}
                      </td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-[#64748B]">{c.winRate ? c.winRate.toFixed(1) : 0}%</td>
                      <td className={`py-4 px-2 text-[13px] font-bold ${c.netPnl >= 0 ? 'text-[#16A34A]' : 'text-[#E11D48]'}`}>
                        {c.netPnl >= 0 ? '+' : '-'}₹{Math.abs(c.netPnl || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-2 text-center">
                        {c.pendingReview ? (
                          <span className="text-[12px] font-bold text-[#E11D48]">Yes</span>
                        ) : (
                          <span className="text-[12px] font-semibold text-[#64748B]">No</span>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <span className="bg-[#16A34A]/10 text-[#16A34A] px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase">{c.status}</span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button className="text-[#64748B] hover:text-[#6D3DF5] p-1 rounded-full hover:bg-[#F1ECFF] transition-colors">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Trader Detail Sidebar) */}
        {selectedTrader && (
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6 flex flex-col h-[calc(100vh-180px)] sticky top-[100px]">
             
             {/* Header */}
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedTrader.name}`} alt="avatar"/>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-black text-[#0F172A]">{selectedTrader.name}</h3>
                    <p className="text-[11px] font-semibold text-[#64748B]">{selectedTrader.email}</p>
                  </div>
               </div>
               <button className="text-[11px] font-bold text-[#6D3DF5] bg-[#F1ECFF] px-3 py-1.5 rounded-full hover:bg-[#E4DEFF]">
                 Full Profile
               </button>
             </div>

             {/* Metric Grid */}
             <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#FAFAFF] rounded-[12px] border border-[#E7EAF3] p-3 text-center">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Win Rate</p>
                  <p className="text-[16px] font-black text-[#0F172A]">{selectedTrader.winRate ? selectedTrader.winRate.toFixed(1) : 0}%</p>
                </div>
                <div className="bg-[#FAFAFF] rounded-[12px] border border-[#E7EAF3] p-3 text-center">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Profit Factor</p>
                  <p className="text-[16px] font-black text-[#0F172A]">{selectedTrader.profitFactor ? selectedTrader.profitFactor.toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-[#FAFAFF] rounded-[12px] border border-[#E7EAF3] p-3 text-center">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Risk Reward</p>
                  <p className="text-[16px] font-black text-[#0F172A]">1:{selectedTrader.riskReward ? selectedTrader.riskReward.toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-[#FAFAFF] rounded-[12px] border border-[#E7EAF3] p-3 text-center">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Max Drawdown</p>
                  <p className="text-[16px] font-black text-[#E11D48]">{selectedTrader.maxDrawdown ? selectedTrader.maxDrawdown.toFixed(1) : 0}%</p>
                </div>
             </div>

             {/* Additional Stats Row */}
             <div className="flex justify-between items-center bg-[#F8FAFC] p-3 rounded-[12px] mb-6">
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] mb-0.5">Total Trades</p>
                  <p className="text-[13px] font-bold text-[#0F172A]">{selectedTrader.totalTrades || 0}</p>
                </div>
                <div className="w-[1px] h-8 bg-[#E7EAF3]"></div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] mb-0.5">Mistake Rate</p>
                  <p className="text-[13px] font-bold text-[#EA580C]">{selectedTrader.mistakeRate ? selectedTrader.mistakeRate.toFixed(1) : 0}%</p>
                </div>
                <div className="w-[1px] h-8 bg-[#E7EAF3]"></div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] mb-0.5">Strategy</p>
                  <p className="text-[13px] font-bold text-[#0F172A] truncate w-20" title={selectedTrader.mostUsedStrategy}>{selectedTrader.mostUsedStrategy}</p>
                </div>
             </div>

             {/* Performance Trend */}
             <div className="mb-6 flex-1 min-h-[160px] flex flex-col">
               <h4 className="text-[13px] font-bold text-[#0F172A] mb-4">Performance Trend (Score)</h4>
               <div className="flex-1">
                 <MentorCharts chartType="trend" data={selectedTrader.performanceTrend} />
               </div>
             </div>

             {/* Top Mistakes */}
             <div>
               <div className="flex justify-between items-center mb-3">
                 <h4 className="text-[13px] font-bold text-[#0F172A]">Top Mistakes</h4>
                 <Info size={14} className="text-[#64748B]" />
               </div>
               <div className="space-y-3">
                 {selectedTrader.topMistakes && selectedTrader.topMistakes.map((m:any, i:number) => (
                   <div key={i}>
                     <div className="flex justify-between text-[11px] font-bold text-[#0F172A] mb-1">
                       <span>{m.name}</span>
                       <span>{m.percent}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-[#F1ECFF] rounded-full overflow-hidden">
                       <div className="h-full bg-[#EA580C] rounded-full" style={{width: `${m.percent}%`}}></div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E7EAF3; border-radius: 4px; }
      `}} />
    </div>
  );
}
