import React from "react";
import { prisma } from "@/lib/db";
import { 
  Users, UserCheck, Crown, ShieldCheck, MessageSquare, Calendar, 
  Users2, IndianRupee, CreditCard, Activity, Settings, Plus, Star 
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCatchallPage({ params }: { params: { catchall: string[] } }) {
  const tab = params.catchall[0];

  let title = "System Panel";
  let icon = <Activity size={20} className="text-[#6D3DF5]" />;
  let subtitle = "Manage system details and logs.";

  if (tab === "users") {
    title = "Users Directory";
    icon = <Users size={20} className="text-[#6D3DF5]" />;
    subtitle = "Review and manage all user accounts registered in Trade Adhyayan.";

    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F1ECFF] flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
              <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7EAF3] rounded-[18px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Date Registered</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#0F172A]">
                {dbUsers.map(u => (
                  <tr key={u.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{u.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        u.role === 'MENTOR' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#64748B] font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "mentors") {
    title = "Mentors Directory";
    icon = <UserCheck size={20} className="text-[#6D3DF5]" />;
    subtitle = "Overview of mentor capacities, utilization, and designations.";

    const dbMentors = await prisma.mentor.findMany({
      include: {
        MentorClient: { where: { status: "ACTIVE" } }
      }
    });

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F1ECFF] flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
              <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7EAF3] rounded-[18px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Assigned Clients</th>
                  <th className="py-4 px-6">Capacity</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#0F172A]">
                {dbMentors.map(m => (
                  <tr key={m.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{m.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">{m.email}</td>
                    <td className="py-4 px-6 text-[#64748B] font-medium">{m.designation || "Lead Instructor"}</td>
                    <td className="py-4 px-6 text-[#64748B] font-medium">{m.category}</td>
                    <td className="py-4 px-6 font-semibold">{m.MentorClient.length}</td>
                    <td className="py-4 px-6 text-[#64748B] font-medium">{m.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "allocation") {
    title = "Mentorship Allocation";
    icon = <ShieldCheck size={20} className="text-[#6D3DF5]" />;
    subtitle = "Map clients/students to their professional mentors.";

    const allocations = await prisma.mentorClient.findMany({
      include: {
        Mentor: true,
        Client: true
      }
    });

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F1ECFF] flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
              <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7EAF3] rounded-[18px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Client Name</th>
                  <th className="py-4 px-6">Client Email</th>
                  <th className="py-4 px-6">Assigned Mentor</th>
                  <th className="py-4 px-6">Allocation Date</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#0F172A]">
                {allocations.map(a => (
                  <tr key={a.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{a.Client.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">{a.Client.email}</td>
                    <td className="py-4 px-6 text-[#6D3DF5] font-bold">{a.Mentor.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-medium">{new Date(a.assignedDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "clients") {
    title = "Mentorship Clients";
    icon = <Crown size={20} className="text-[#6D3DF5]" />;
    subtitle = "Directory of active client students registered for mentoring programs.";

    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        MentorClient_AsClient: { include: { Mentor: true } }
      }
    });

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F1ECFF] flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
              <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7EAF3] rounded-[18px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Mentor Assigned</th>
                  <th className="py-4 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#0F172A]">
                {clients.map(c => (
                  <tr key={c.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{c.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">{c.email}</td>
                    <td className="py-4 px-6 font-bold text-[#6D3DF5]">
                      {c.MentorClient_AsClient?.Mentor?.name || "Unassigned"}
                    </td>
                    <td className="py-4 px-6 text-[#64748B] font-medium">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "reviews") {
    title = "Review Logs";
    icon = <MessageSquare size={20} className="text-[#6D3DF5]" />;
    subtitle = "Track review queues, pending feedback, and completed mentorship reviews.";

    const reviews = await prisma.reviewRequest.findMany({
      include: {
        Client: true,
        Mentor: true,
        MentorshipReview: true
      },
      orderBy: { submittedAt: "desc" }
    });

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F1ECFF] flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
              <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7EAF3] rounded-[18px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Mentor</th>
                  <th className="py-4 px-6">Date Submitted</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Mentor Score</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#0F172A]">
                {reviews.map(r => (
                  <tr key={r.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{r.Client.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">{r.Mentor.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-medium">{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        r.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#6D3DF5]">
                      {r.MentorshipReview?.overallScore ? `${r.MentorshipReview.overallScore.toFixed(0)}/100` : "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "sessions") {
    title = "Mentorship Sessions";
    icon = <Calendar size={20} className="text-[#6D3DF5]" />;
    subtitle = "Monitor scheduled 1-on-1 review meetings and attendance logs.";

    const sessions = await prisma.mentorSession.findMany({
      include: {
        Client: true,
        Mentor: true
      },
      orderBy: { scheduledAt: "desc" }
    });

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F1ECFF] flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
              <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7EAF3] rounded-[18px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Mentor</th>
                  <th className="py-4 px-6">Scheduled Time</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#0F172A]">
                {sessions.map(s => (
                  <tr key={s.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{s.Client.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">{s.Mentor.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-medium">{new Date(s.scheduledAt).toLocaleString()}</td>
                    <td className="py-4 px-6 font-semibold">{s.durationMins} mins</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        s.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        s.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "payouts") {
    title = "Mentor Payout System";
    icon = <IndianRupee size={20} className="text-[#6D3DF5]" />;
    subtitle = "Review generated revenue, payout percentages, and status checks.";

    const payouts = await prisma.mentorPayout.findMany({
      include: { Mentor: true },
      orderBy: { month: "desc" }
    });

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F1ECFF] flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
              <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E7EAF3] rounded-[18px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Mentor Name</th>
                  <th className="py-4 px-6">Month</th>
                  <th className="py-4 px-6">Calculated Revenue</th>
                  <th className="py-4 px-6">Net Payout</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#0F172A]">
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{p.Mentor.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">{p.month}</td>
                    <td className="py-4 px-6 font-semibold">₹{p.totalRevenue.toLocaleString()}</td>
                    <td className="py-4 px-6 font-black text-[#6D3DF5]">₹{p.netPayout.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Coming Soon templates for community, transactions, pricing, settings
  if (tab === "settings") {
    title = "System Configuration Settings";
    icon = <Settings size={20} className="text-[#6D3DF5]" />;
    subtitle = "Control global parameters, notification limits, and system variables.";
  } else if (tab === "community") {
    title = "Admin Forum Moderator";
    icon = <Users2 size={20} className="text-[#6D3DF5]" />;
    subtitle = "Moderate the internal community discussion board.";
  } else if (tab === "transactions") {
    title = "Transactions Logs";
    icon = <CreditCard size={20} className="text-[#6D3DF5]" />;
    subtitle = "Review real-time payment collections and subscription invoices.";
  } else if (tab === "pricing") {
    title = "Plans & Pricing Editor";
    icon = <Activity size={20} className="text-[#6D3DF5]" />;
    subtitle = "Configure subscription packages, coupon codes, and features.";
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#F1ECFF] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
            <p className="text-[#64748B] text-[13px] font-medium mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E7EAF3] rounded-[18px] p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#F1ECFF] flex items-center justify-center mx-auto mb-4 text-[#6D3DF5]">
          <Activity size={24} />
        </div>
        <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">{tab.charAt(0).toUpperCase() + tab.slice(1)} Module Loaded</h3>
        <p className="text-[13px] text-[#64748B] max-w-sm mx-auto leading-relaxed">
          The Admin panel for this category is currently in developer sandbox testing mode. Configuration tables and controls are ready.
        </p>
      </div>
    </div>
  );
}
