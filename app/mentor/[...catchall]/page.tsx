"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMentorDashboard } from "@/app/actions/mentorship";
import { 
  Users, Clock, Calendar, Users2, User, Settings, ArrowRight, CheckCircle2, 
  AlertCircle, Activity, Star, ClipboardCheck, Sparkles 
} from "lucide-react";
import Link from "next/link";

export default function MentorCatchallPage({ params }: { params: { catchall: string[] } }) {
  const router = useRouter();
  const tab = params.catchall[0];

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Unknown error occurred.');
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

  if (!data) {
    return (
      <div className="p-12 text-center max-w-[800px] mx-auto mt-20 bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm">
        <h2 className="text-[24px] font-black text-[#0F172A] mb-4">Dashboard Error</h2>
        <p className="text-[14px] font-medium text-[#64748B] mb-2">Unable to retrieve mentor dashboard info.</p>
        {error && (
          <p className="text-[12px] text-rose-500 font-medium bg-rose-50 border border-rose-100 rounded-[8px] px-4 py-3 mb-6">
            {error}
          </p>
        )}
        <p className="text-[12px] text-[#64748B] mb-6">
          Make sure your account is registered as a mentor. If the issue persists, contact admin.
        </p>
        <a href="/login" className="bg-[#6D3DF5] text-white text-[13px] font-bold px-6 py-2.5 rounded-[8px] hover:bg-[#5C2DE0] transition-colors">
          Back to Login
        </a>
      </div>
    );
  }

  let title = "Mentor Panel";
  let icon = <Activity size={20} className="text-[#6D3DF5]" />;
  let subtitle = "Manage your mentorship workspace.";

  if (tab === "traders") {
    title = "My Traders";
    icon = <Users size={20} className="text-[#6D3DF5]" />;
    subtitle = "Track and monitor progress of all student traders assigned to you.";

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
                  <th className="py-4 px-6">Trader Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Current Score</th>
                  <th className="py-4 px-6">Win Rate</th>
                  <th className="py-4 px-6">Net P&L</th>
                  <th className="py-4 px-6">Pending Review</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#0F172A]">
                {data.clients.map((c: any) => (
                  <tr key={c.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{c.name}</td>
                    <td className="py-4 px-6 text-[#64748B] font-semibold">{c.email}</td>
                    <td className="py-4 px-6 font-bold text-[#6D3DF5]">{c.currentScore > 0 ? `${c.currentScore.toFixed(0)}/100` : "N/A"}</td>
                    <td className="py-4 px-6 font-semibold">{c.winRate?.toFixed(1)}%</td>
                    <td className={`py-4 px-6 font-black ${c.netPnl >= 0 ? 'text-[#16A34A]' : 'text-[#EF4444]'}`}>
                      ₹{c.netPnl?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        c.pendingReview ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {c.pendingReview ? "Yes" : "No"}
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

  if (tab === "queue") {
    title = "Review Queue";
    icon = <Clock size={20} className="text-[#6D3DF5]" />;
    subtitle = "Process pending review requests submitted by your assigned traders.";

    const pendingRequests = data.reviewRequests.filter((r: any) => r.status === "PENDING" || r.status === "IN_REVIEW");

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
          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center text-[#64748B]">
              <CheckCircle2 size={36} className="text-[#16A34A] mx-auto mb-4" />
              <p className="text-[14px] font-bold">Your queue is empty!</p>
              <p className="text-[12px] mt-1">Check back later when clients submit review requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-4 px-6">Trader</th>
                    <th className="py-4 px-6">Date Submitted</th>
                    <th className="py-4 px-6">Selected Trades</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#0F172A]">
                  {pendingRequests.map((r: any) => (
                    <tr key={r.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold">{r.Client.name}</td>
                      <td className="py-4 px-6 text-[#64748B] font-semibold">{new Date(r.submittedAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 font-semibold">{r.selectedTradeIds?.length || 0} Trades</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Link 
                          href={`/mentor/reviews?id=${r.id}`}
                          className="bg-[#F1ECFF] text-[#6D3DF5] text-[11px] font-bold px-3 py-1.5 rounded-[6px] hover:bg-[#E4DEFF] transition-colors"
                        >
                          Review Now
                        </Link>
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

  if (tab === "sessions") {
    title = "Upcoming Sessions";
    icon = <Calendar size={20} className="text-[#6D3DF5]" />;
    subtitle = "Scheduled review sessions and consulting appointments.";

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
          {data.sessions.length === 0 ? (
            <div className="p-12 text-center text-[#64748B]">
              <Calendar size={36} className="text-[#64748B]/30 mx-auto mb-4" />
              <p className="text-[14px] font-bold">No sessions scheduled.</p>
              <p className="text-[12px] mt-1">You will be notified when a user books a slot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E7EAF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-4 px-6">Trader</th>
                    <th className="py-4 px-6">Scheduled At</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#0F172A]">
                  {data.sessions.map((s: any) => (
                    <tr key={s.id} className="border-b border-[#E7EAF3] hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold">{s.Client.name}</td>
                      <td className="py-4 px-6 text-[#64748B] font-semibold">{new Date(s.scheduledAt).toLocaleString()}</td>
                      <td className="py-4 px-6 font-semibold">{s.durationMins} mins</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100">
                          {s.status}
                        </span>
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

  // Fallback views for community, profile, settings
  if (tab === "settings") {
    title = "Mentor Workspace Settings";
    icon = <Settings size={20} className="text-[#6D3DF5]" />;
    subtitle = "Configure your calendar slot times, categories, and templates.";
  } else if (tab === "community") {
    title = "Traders Forum";
    icon = <Users2 size={20} className="text-[#6D3DF5]" />;
    subtitle = "Engage with students and broadcast messages.";
  } else if (tab === "profile") {
    title = "Mentor Profile";
    icon = <User size={20} className="text-[#6D3DF5]" />;
    subtitle = "Manage your public profile description and certifications.";
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
          The Mentor workspace for this section is initialized. You can edit configurations and preview slot arrangements.
        </p>
      </div>
    </div>
  );
}
