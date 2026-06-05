import React from "react";
import { getMentorDashboard } from "@/app/actions/mentorship";
import { 
  Users, Clock, CheckSquare, Calendar, TrendingUp, BarChart, ArrowRight, UserCircle 
} from "lucide-react";
import Link from "next/link";

export default async function MentorDashboardPage() {
  const email = "student3_profit@tradeadhyayan.com"; // Normally from session, using mock mentor for now
  
  // We wrap in try catch in case the user is not a mentor yet
  let data;
  try {
    data = await getMentorDashboard(email);
  } catch(e) {
    // Mock data for display purposes
    data = {
      mentor: { name: "Demo Mentor", capacity: 20 },
      clients: [
        { Client: { id: "1", name: "Rishabh", currentScore: 82, totalTrades: 45, winRate: 65, netPnl: 12500 } },
        { Client: { id: "2", name: "Aman", currentScore: 68, totalTrades: 12, winRate: 40, netPnl: -2000 } }
      ],
      reviewRequests: [
        { id: "req1", Client: { name: "Rishabh" }, status: "PENDING", submittedAt: new Date() }
      ],
      sessions: []
    };
  }

  const pendingCount = data.reviewRequests.filter((r: any) => r.status === "PENDING").length;
  const completedCount = data.reviewRequests.filter((r: any) => r.status === "COMPLETED").length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center h-[44px]">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Mentor Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Assigned Clients", val: data.clients.length, icon: Users, color: "text-[#2563EB]" },
          { label: "Pending Reviews", val: pendingCount, icon: Clock, color: "text-[#F59E0B]" },
          { label: "Completed Reviews", val: completedCount, icon: CheckSquare, color: "text-[#16A34A]" },
          { label: "Upcoming Sessions", val: data.sessions.length, icon: Calendar, color: "text-[#6D3DF5]" },
          { label: "Avg Client Score", val: "76/100", icon: BarChart, color: "text-[#E11D48]" },
          { label: "Client Progress", val: "+4.2%", icon: TrendingUp, color: "text-[#16A34A]" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white p-5 rounded-[18px] border border-[#E7EAF3] shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-[#64748B]">
              <kpi.icon size={16} className={kpi.color} />
              <span className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
            </div>
            <h2 className="text-2xl font-black text-[#0F172A]">{kpi.val}</h2>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Review Queue (Kanban-style) */}
        <div className="lg:col-span-2 bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">Review Queue</h3>
          <div className="grid grid-cols-3 gap-4">
            
            {/* Column 1: Pending */}
            <div className="bg-[#FAFAFF] rounded-[14px] p-4 border border-[#E7EAF3]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[#0F172A]">Pending</span>
                <span className="text-xs font-bold bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-0.5 rounded-full">{pendingCount}</span>
              </div>
              <div className="space-y-3">
                {data.reviewRequests.filter((r:any) => r.status === "PENDING").map((req:any) => (
                  <div key={req.id} className="bg-white p-3 rounded-[12px] border border-[#E7EAF3] shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#F1ECFF] flex items-center justify-center">
                        <UserCircle size={14} className="text-[#6D3DF5]"/>
                      </div>
                      <p className="text-sm font-bold text-[#0F172A]">{req.Client.name}</p>
                    </div>
                    <p className="text-xs text-[#64748B] mb-3">Submitted {new Date(req.submittedAt).toLocaleDateString()}</p>
                    <Link href={`/mentor/reviews?id=${req.id}`} className="block text-center w-full bg-[#F1ECFF] hover:bg-[#6D3DF5] hover:text-white text-[#6D3DF5] text-xs font-bold py-1.5 rounded-[8px] transition-colors">
                      Start Review
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Review */}
            <div className="bg-[#FAFAFF] rounded-[14px] p-4 border border-[#E7EAF3]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[#0F172A]">In Review</span>
                <span className="text-xs font-bold bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-full">0</span>
              </div>
              <p className="text-xs text-[#64748B] text-center mt-6">Drop items here</p>
            </div>

            {/* Column 3: Completed */}
            <div className="bg-[#FAFAFF] rounded-[14px] p-4 border border-[#E7EAF3]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[#0F172A]">Completed</span>
                <span className="text-xs font-bold bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded-full">{completedCount}</span>
              </div>
              <div className="space-y-3">
                {data.reviewRequests.filter((r:any) => r.status === "COMPLETED").slice(0, 3).map((req:any) => (
                  <div key={req.id} className="bg-white p-3 rounded-[12px] border border-[#E7EAF3] shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                    <p className="text-sm font-bold text-[#0F172A]">{req.Client.name}</p>
                    <p className="text-xs text-[#16A34A] font-semibold mt-1">Reviewed</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">Upcoming Sessions</h3>
          <div className="space-y-3">
            {data.sessions.length > 0 ? data.sessions.map((sess:any) => (
              <div key={sess.id} className="p-3 border border-[#E7EAF3] rounded-[12px]">
                <p className="text-sm font-bold text-[#0F172A]">{sess.title || "Mentorship Review"}</p>
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-[#64748B] flex items-center gap-1"><Calendar size={12}/> {new Date(sess.scheduledAt).toLocaleString()}</p>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Google Meet</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#64748B]">No upcoming sessions.</p>
            )}
            <button className="w-full mt-4 py-2 border border-[#E7EAF3] rounded-[12px] text-xs font-bold text-[#0F172A] hover:bg-slate-50">
              Schedule Session
            </button>
          </div>
        </div>

      </div>

      {/* My Traders Table */}
      <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
        <h3 className="font-bold text-[#0F172A] mb-4">My Traders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-[#64748B] border-b border-[#E7EAF3]">
                <th className="pb-3 px-2">Trader</th>
                <th className="pb-3 px-2">Current Score</th>
                <th className="pb-3 px-2">Win Rate</th>
                <th className="pb-3 px-2">Net P&L</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.clients.map((c:any) => {
                const client = c.Client;
                return (
                  <tr key={client.id} className="border-b border-[#E7EAF3] last:border-0 hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <UserCircle size={24} className="text-[#6D3DF5]"/>
                        <span className="font-bold text-sm text-[#0F172A]">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm font-semibold">{client.currentScore || "N/A"}/100</td>
                    <td className="py-3 px-2 text-sm text-[#64748B]">{client.winRate || 0}%</td>
                    <td className={`py-3 px-2 text-sm font-semibold ${client.netPnl >= 0 ? "text-[#16A34A]" : "text-[#E11D48]"}`}>
                      ₹{client.netPnl || 0}
                    </td>
                    <td className="py-3 px-2">
                      <span className="bg-[#16A34A]/10 text-[#16A34A] px-2 py-1 rounded-[6px] text-[10px] font-bold">ACTIVE</span>
                    </td>
                    <td className="py-3 px-2">
                      <button className="flex items-center gap-1 text-[#6D3DF5] hover:text-[#5b32d4] text-xs font-bold">
                        View <ArrowRight size={14}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
