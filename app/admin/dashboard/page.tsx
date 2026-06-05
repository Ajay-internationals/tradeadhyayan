import React from "react";
import { getAdminMentorshipDashboard } from "@/app/actions/mentorship";
import { 
  Users, UserCheck, Shield, CheckSquare, Clock, IndianRupee, Activity, CreditCard
} from "lucide-react";

export default async function AdminDashboardPage() {
  const data = await getAdminMentorshipDashboard();

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center h-[44px]">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Admin Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Total Users", val: data.kpis.totalUsers, icon: Users, color: "text-blue-600" },
          { label: "Total Mentors", val: data.kpis.totalMentors, icon: UserCheck, color: "text-purple-600" },
          { label: "Active Clients", val: data.kpis.activeClients, icon: Shield, color: "text-indigo-600" },
          { label: "Pending Reviews", val: data.kpis.pendingReviews, icon: Clock, color: "text-amber-500" },
          { label: "Completed Reviews", val: data.kpis.completedReviews, icon: CheckSquare, color: "text-green-600" },
          { label: "Monthly Revenue", val: `₹${data.kpis.monthlyRevenue}`, icon: IndianRupee, color: "text-emerald-600" },
          { label: "Capacity Used", val: `${data.kpis.capacityUsedPercent.toFixed(1)}%`, icon: Activity, color: "text-rose-600" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white p-4 rounded-[16px] border border-[#E7EAF3] shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-[#64748B]">
              <kpi.icon size={16} className={kpi.color} />
              <span className="text-[11px] font-bold uppercase tracking-wider">{kpi.label}</span>
            </div>
            <h2 className="text-xl font-black text-[#0F172A]">{kpi.val}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main tables span 2 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mentor Overview Table */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#0F172A]">Mentor Overview</h3>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-[#64748B] border-b border-[#E7EAF3]">
                    <th className="pb-3 px-2">Mentor</th>
                    <th className="pb-3 px-2">Assigned</th>
                    <th className="pb-3 px-2">Capacity</th>
                    <th className="pb-3 px-2">Utilization</th>
                    <th className="pb-3 px-2">Pending Reviews</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mentors.map((m:any) => {
                    const assigned = m.MentorClient?.length || 0;
                    const util = m.capacity > 0 ? (assigned / m.capacity) * 100 : 0;
                    const pending = m.ReviewRequest?.length || 0;
                    return (
                      <tr key={m.id} className="border-b border-[#E7EAF3] last:border-0 hover:bg-slate-50">
                        <td className="py-3 px-2 text-sm font-bold text-[#0F172A]">{m.name}</td>
                        <td className="py-3 px-2 text-sm text-[#64748B]">{assigned}</td>
                        <td className="py-3 px-2 text-sm text-[#64748B]">{m.capacity}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${util > 90 ? 'bg-rose-500' : util > 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{width: `${util}%`}}></div>
                            </div>
                            <span className="text-xs font-bold text-[#0F172A]">{util.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {pending > 0 ? (
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">{pending}</span>
                          ) : (
                            <span className="text-xs text-[#64748B]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase">{m.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mentor Payout Overview */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-4">Mentor Payouts (Current Month)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-[#64748B] border-b border-[#E7EAF3]">
                    <th className="pb-3 px-2">Mentor</th>
                    <th className="pb-3 px-2">Revenue Gen</th>
                    <th className="pb-3 px-2">Share</th>
                    <th className="pb-3 px-2">Payout Amount</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mentors.map((m:any) => {
                    const rev = (m.MentorClient?.length || 0) * 4999;
                    const payout = rev * (m.payoutShare / 100);
                    return (
                      <tr key={`payout-${m.id}`} className="border-b border-[#E7EAF3] last:border-0 hover:bg-slate-50">
                        <td className="py-3 px-2 text-sm font-bold text-[#0F172A]">{m.name}</td>
                        <td className="py-3 px-2 text-sm text-[#0F172A]">₹{rev.toLocaleString()}</td>
                        <td className="py-3 px-2 text-sm text-[#64748B]">{m.payoutShare}%</td>
                        <td className="py-3 px-2 text-sm font-bold text-emerald-600">₹{payout.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase">Pending</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          
          {/* Client Allocation Summary (Placeholder for Donut Chart) */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-4">Client Allocation</h3>
            <div className="h-48 flex items-center justify-center relative">
              {/* Pseudo Donut */}
              <div className="w-32 h-32 rounded-full border-[12px] border-blue-500 border-r-purple-500 border-b-indigo-500 border-l-cyan-500 flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <p className="text-xs text-[#64748B] font-bold">Assigned</p>
                  <p className="text-xl font-black text-[#0F172A]">{data.kpis.activeClients}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Mentors</span>
                <span>100%</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Unassigned</span>
                <span>0%</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {data.activities.length > 0 ? data.activities.map((act:any) => (
                <div key={act.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                    <Activity size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A] font-medium">{act.description}</p>
                    <p className="text-xs text-[#64748B]">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[#64748B]">No recent activities found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
