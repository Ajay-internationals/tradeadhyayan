import React from "react";
import { getAdminMentorshipDashboard } from "@/app/actions/mentorship";
import { 
  Users, UserCheck, Crown, Hourglass, ClipboardCheck, IndianRupee, UserCircle2,
  Calendar, Bell, Search, Activity, Mail, Server, ShieldCheck, Plus, CheckCircle, UserPlus, User
} from "lucide-react";
import Link from "next/link";
import { AdminCharts } from "./AdminCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getAdminMentorshipDashboard();

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6" style={{ backgroundColor: "#FAFAFF", minHeight: "100vh" }}>
      {/* Topbar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Admin Dashboard</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Welcome back, Admin! Here's what's happening.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#E7EAF3] shadow-sm cursor-pointer hover:border-[#6D3DF5] transition-colors">
            <Calendar size={16} className="text-[#64748B]" />
            <span className="text-sm font-bold text-[#0F172A]">20 - 26 May 2025</span>
          </div>
          
          <div className="relative cursor-pointer">
            <Bell size={24} className="text-[#64748B]" />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-[#FAFAFF]">
              12
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-[#E7EAF3] cursor-pointer shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200">
               <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-[#0F172A]">Admin User</p>
              <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Total Users", val: data.kpis.totalUsers.toLocaleString(), sub: "+18 this week", icon: Users, bg: "bg-[#F3E8FF]", iconColor: "text-[#9333EA]", col: "flex-1" },
          { label: "Total Mentors", val: data.kpis.totalMentors.toLocaleString(), sub: "+2 this week", icon: UserCheck, bg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]", col: "flex-1" },
          { label: "Active Mentorship Clients", val: data.kpis.activeClients.toLocaleString(), sub: "+25 this week", icon: Crown, bg: "bg-[#DBEAFE]", iconColor: "text-[#2563EB]", col: "flex-1" },
          { label: "Pending Reviews", val: data.kpis.pendingReviews.toLocaleString(), sub: "Needs attention", icon: Hourglass, bg: "bg-[#FFEDD5]", iconColor: "text-[#EA580C]", col: "flex-1" },
          { label: "Completed Reviews", val: data.kpis.completedReviews.toLocaleString(), sub: "This week", icon: ClipboardCheck, bg: "bg-[#F3E8FF]", iconColor: "text-[#9333EA]", col: "flex-1" },
          { label: "Monthly Revenue", val: "₹" + data.kpis.monthlyRevenue.toLocaleString(), sub: "+12.4% vs last month", icon: IndianRupee, bg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]", col: "flex-1" },
          { label: "Mentor Capacity Used", val: data.kpis.capacityUsedPercent.toFixed(0) + "%", sub: "Average utilization", icon: UserCircle2, bg: "bg-[#FFEDD5]", iconColor: "text-[#EA580C]", col: "flex-1" },
        ].map((kpi, idx) => (
          <div key={idx} className={`${kpi.col} min-w-[140px] bg-white p-5 rounded-[18px] border border-[#E7EAF3] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={20} className={kpi.iconColor} />
              </div>
              <span className="text-[11px] font-bold text-[#0F172A] leading-tight">{kpi.label}</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">{kpi.val}</h2>
              <p className="text-[11px] font-semibold text-[#64748B] mt-1">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mentor Overview (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[18px] text-[#0F172A]">Mentor Overview</h3>
            <button className="bg-[#F1ECFF] text-[#6D3DF5] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#E4DEFF] transition-colors">
              View All Mentors
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold text-[#64748B] border-b border-[#E7EAF3] uppercase tracking-wider">
                  <th className="pb-4 px-2">Mentor</th>
                  <th className="pb-4 px-2">Assigned Clients</th>
                  <th className="pb-4 px-2">Capacity</th>
                  <th className="pb-4 px-2">Utilization</th>
                  <th className="pb-4 px-2">Pending Reviews</th>
                  <th className="pb-4 px-2">Status</th>
                  <th className="pb-4 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.mentors.map((m:any) => {
                  const assigned = m.MentorClient?.length || 0;
                  const util = m.capacity > 0 ? (assigned / m.capacity) * 100 : 0;
                  const pending = m.ReviewRequest?.length || 0;
                  return (
                    <tr key={m.id} className="border-b border-[#E7EAF3] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`} alt={m.name} />
                          </div>
                          <span className="text-[13px] font-bold text-[#0F172A]">{m.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-[#0F172A]">{assigned}</td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-[#64748B]">{m.capacity}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-bold text-[#6D3DF5] w-10">{util.toFixed(0)}%</span>
                          <div className="w-24 h-1.5 bg-[#F1ECFF] rounded-full overflow-hidden">
                            <div className="h-full bg-[#6D3DF5] rounded-full" style={{width: `${util}%`}}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`text-[13px] font-bold ${pending > 0 ? 'text-[#E11D48]' : 'text-[#16A34A]'}`}>
                          {pending}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'ACTIVE' ? 'bg-[#16A34A]' : 'bg-[#EA580C]'}`}></div>
                          <span className={`text-[12px] font-bold ${m.status === 'ACTIVE' ? 'text-[#16A34A]' : 'text-[#EA580C]'}`}>
                            {m.status === 'ACTIVE' ? 'Active' : 'On Leave'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button className="text-[12px] font-bold text-[#6D3DF5] hover:text-[#5B3FCC] px-3 py-1 border border-[#E7EAF3] rounded-[8px] hover:bg-slate-50 transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-center">
             <button className="text-[13px] font-bold text-[#6D3DF5] border border-[#E7EAF3] px-6 py-2 rounded-full hover:bg-slate-50 transition-colors">
               Manage Mentors
             </button>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[18px] text-[#0F172A]">Recent Activities</h3>
            <button className="bg-[#F1ECFF] text-[#6D3DF5] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#E4DEFF] transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0 z-10">
                <UserPlus size={18} className="text-[#16A34A]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0F172A]">New mentor "Rohit Verma" added</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">Mentor account created successfully</p>
                <p className="text-[10px] font-semibold text-[#94A3B8] mt-1 uppercase tracking-wide">20 May, 10:30 AM</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F1ECFF] flex items-center justify-center flex-shrink-0 z-10">
                <User size={18} className="text-[#6D3DF5]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0F172A]">Ankit Verma assigned to Ajay Sharma</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">Client allocated to mentor</p>
                <p className="text-[10px] font-semibold text-[#94A3B8] mt-1 uppercase tracking-wide">20 May, 09:45 AM</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center flex-shrink-0 z-10">
                <Calendar size={18} className="text-[#0284C7]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0F172A]">Review completed by Neha Singh for Rohit Kumar</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">Weekly review has been submitted</p>
                <p className="text-[10px] font-semibold text-[#94A3B8] mt-1 uppercase tracking-wide">20 May, 09:15 AM</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFEDD5] flex items-center justify-center flex-shrink-0 z-10">
                <Calendar size={18} className="text-[#EA580C]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0F172A]">Group session "Weekly Market Review" scheduled</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">22 May, 7:00 PM</p>
                <p className="text-[10px] font-semibold text-[#94A3B8] mt-1 uppercase tracking-wide">20 May, 08:50 AM</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0 z-10">
                <IndianRupee size={18} className="text-[#16A34A]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0F172A]">Payout processed for Ajay Sharma</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">Amount: ₹39,992 for April 2025</p>
                <p className="text-[10px] font-semibold text-[#94A3B8] mt-1 uppercase tracking-wide">19 May, 06:20 PM</p>
              </div>
            </div>
            
            {/* Timeline Line */}
            <div className="absolute left-[43px] top-[100px] bottom-[60px] w-[2px] bg-[#E7EAF3] z-0"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Client Allocation Summary */}
         <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">Client Allocation Summary</h3>
            <AdminCharts chartType="allocation" data={data.mentors} />
            <div className="mt-6 text-center">
               <button className="text-[13px] font-bold text-[#6D3DF5] border border-[#E7EAF3] px-6 py-2 rounded-full hover:bg-slate-50 transition-colors">
                 Manage Allocation
               </button>
            </div>
         </div>

         {/* Mentor Performance */}
         <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">Mentor Performance (This Month)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold text-[#64748B] border-b border-[#E7EAF3] uppercase tracking-wider">
                    <th className="pb-3 px-1">Mentor</th>
                    <th className="pb-3 px-1 text-center">Avg Score</th>
                    <th className="pb-3 px-1 text-center">Reviews Done</th>
                    <th className="pb-3 px-1 text-center">Sessions</th>
                    <th className="pb-3 px-1 text-right">Client Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mentors.slice(0,5).map((m:any) => (
                    <tr key={m.id} className="border-b border-[#E7EAF3] last:border-0">
                      <td className="py-3 px-1 text-[13px] font-bold text-[#0F172A]">{m.name}</td>
                      <td className="py-3 px-1 text-center text-[13px] font-semibold text-[#0F172A]">72/100</td>
                      <td className="py-3 px-1 text-center text-[13px] font-semibold text-[#0F172A]">{m.ReviewRequest?.filter((r:any) => r.status==='COMPLETED').length || 0}</td>
                      <td className="py-3 px-1 text-center text-[13px] font-semibold text-[#0F172A]">8</td>
                      <td className="py-3 px-1 text-right text-[13px] font-bold text-[#16A34A]">95%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
               <button className="text-[13px] font-bold text-[#6D3DF5] hover:underline">
                 View Detailed Report
               </button>
            </div>
         </div>

         {/* Reviews Overview */}
         <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[18px] text-[#0F172A]">Reviews Overview</h3>
              <select className="text-[12px] font-bold text-[#0F172A] border border-[#E7EAF3] rounded-full px-3 py-1 bg-white outline-none">
                <option>This Month</option>
              </select>
            </div>
            <AdminCharts chartType="reviews" />
            <div className="mt-6 text-center">
               <button className="text-[13px] font-bold text-[#6D3DF5] border border-[#E7EAF3] px-6 py-2 rounded-full hover:bg-slate-50 transition-colors">
                 View All Reviews
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mentor Payout Overview */}
        <div className="lg:col-span-2 bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-bold text-[18px] text-[#0F172A]">Mentor Payout Overview</h3>
            <select className="text-[12px] font-bold text-[#0F172A] border border-[#E7EAF3] rounded-full px-3 py-1 bg-white outline-none">
                <option>May 2025</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold text-[#64748B] border-b border-[#E7EAF3] uppercase tracking-wider">
                  <th className="pb-3 px-2">Mentor</th>
                  <th className="pb-3 px-2">Clients</th>
                  <th className="pb-3 px-2">Revenue Generated</th>
                  <th className="pb-3 px-2">Payout Share</th>
                  <th className="pb-3 px-2">Payout Amount</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.mentors.map((m:any) => {
                  const assigned = m.MentorClient?.length || 0;
                  const revenue = assigned * 4999;
                  const payout = revenue * (m.payoutShare / 100);
                  return (
                    <tr key={m.id} className="border-b border-[#E7EAF3] last:border-0 hover:bg-slate-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`} alt={m.name} />
                          </div>
                          <span className="text-[13px] font-bold text-[#0F172A]">{m.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-[#0F172A]">{assigned}</td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-[#0F172A]">₹{revenue.toLocaleString()}</td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-[#0F172A]">{m.payoutShare}%</td>
                      <td className="py-4 px-2 text-[13px] font-bold text-[#0F172A]">₹{payout.toLocaleString()}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></div>
                          <span className="text-[12px] font-bold text-[#16A34A]">Paid</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button className="text-[12px] font-bold text-[#6D3DF5] hover:text-[#5B3FCC]">View Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Summary */}
        <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
          <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">System Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            
            <div className="bg-[#FAFAFF] rounded-[16px] p-4 border border-[#E7EAF3]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                  <Server size={14} className="text-[#9333EA]" />
                </div>
                <p className="text-[11px] font-bold text-[#64748B]">Total Storage Used</p>
              </div>
              <h4 className="text-[18px] font-black text-[#0F172A]">256 GB <span className="text-[12px] font-semibold text-[#64748B]">/ 2 TB</span></h4>
              <p className="text-[11px] font-bold text-[#6D3DF5] mt-1">13% Used</p>
            </div>

            <div className="bg-[#FAFAFF] rounded-[16px] p-4 border border-[#E7EAF3]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#E0F2FE] flex items-center justify-center">
                  <Mail size={14} className="text-[#0284C7]" />
                </div>
                <p className="text-[11px] font-bold text-[#64748B]">Total Emails Sent</p>
              </div>
              <h4 className="text-[18px] font-black text-[#0F172A]">12,540</h4>
              <p className="text-[11px] font-bold text-[#64748B] mt-1">This Month</p>
            </div>

            <div className="bg-[#FAFAFF] rounded-[16px] p-4 border border-[#E7EAF3]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#FEF08A] flex items-center justify-center">
                  <Activity size={14} className="text-[#CA8A04]" />
                </div>
                <p className="text-[11px] font-bold text-[#64748B]">Active Sessions</p>
              </div>
              <h4 className="text-[18px] font-black text-[#0F172A]">154</h4>
              <p className="text-[11px] font-bold text-[#16A34A] mt-1">Live Now</p>
            </div>

            <div className="bg-[#FAFAFF] rounded-[16px] p-4 border border-[#E7EAF3]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                  <ShieldCheck size={14} className="text-[#16A34A]" />
                </div>
                <p className="text-[11px] font-bold text-[#64748B]">System Status</p>
              </div>
              <h4 className="text-[18px] font-black text-[#16A34A]">Healthy</h4>
              <p className="text-[11px] font-medium text-[#64748B] mt-1">All Systems Operational</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
