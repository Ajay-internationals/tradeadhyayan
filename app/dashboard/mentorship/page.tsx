"use client";

import React, { useState, useEffect } from "react";
import { getClientMentorshipOverview } from "@/app/actions/mentorship";
import Link from "next/link";
import { 
  User, CheckCircle, Calendar, ClipboardList, Target, AlertCircle, Shield, BrainCircuit, Flag, LineChart
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function MentorshipOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('trade_adhyayan_user');
    if (!email) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const result = await getClientMentorshipOverview(email);
        setData(result);
      } catch (err) {
        console.error("Failed to load mentorship overview:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [router]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!data) {
    return <div className="p-6">No data available.</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFF] p-6 text-[#0F172A] font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Mentorship Overview</h1>
          <Link 
            href="/dashboard/mentorship/submit-review"
            className="bg-[#6D3DF5] hover:bg-[#5b32d4] text-white px-5 py-2.5 rounded-[12px] font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm shadow-[#6D3DF5]/30"
          >
            <ClipboardList size={18} />
            Submit Review
          </Link>
        </div>

        {/* TOP CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          
          {/* 1. Assigned Mentor */}
          <div className="bg-white rounded-[18px] p-5 border border-[#E7EAF3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#F1ECFF] flex items-center justify-center text-[#6D3DF5]">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">{data.assignedMentor?.name || "No Mentor"}</h3>
                  <p className="text-xs text-[#64748B]">SEBI Registered RA</p>
                </div>
              </div>
              <p className="text-xs text-[#64748B] mb-1">• 8+ Years Experience</p>
              <p className="text-xs text-[#64748B] mb-3">• Options Trading Specialist</p>
            </div>
            <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-[12px] text-xs font-semibold border border-[#E7EAF3] transition-colors">
              View Profile
            </button>
          </div>

          {/* 2. Current Score */}
          <div className="bg-white rounded-[18px] p-5 border border-[#E7EAF3] shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B] mb-1 uppercase tracking-wider">Current Score</p>
              <div className="flex items-end gap-2">
                <h2 className="text-3xl font-black text-[#0F172A]">{Math.round(data.currentScore)}<span className="text-lg text-[#64748B]">/100</span></h2>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded-full text-xs font-semibold">
                +6 pts from last
              </div>
            </div>
            <p className="text-xs font-medium text-[#16A34A] mt-4 flex items-center gap-1">
              <CheckCircle size={14} /> Good Progress
            </p>
          </div>

          {/* 3. Last Review */}
          <div className="bg-white rounded-[18px] p-5 border border-[#E7EAF3] shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B] mb-1 uppercase tracking-wider">Last Review</p>
              <h2 className="text-xl font-bold text-[#0F172A]">2 Days Ago</h2>
              <p className="text-xs text-[#64748B] mt-1">Reviewed on {data.lastReviewDate ? new Date(data.lastReviewDate).toLocaleDateString() : "N/A"}</p>
            </div>
            <button className="w-full py-2 mt-4 bg-[#F1ECFF] hover:bg-[#E5D9FF] text-[#6D3DF5] rounded-[12px] text-xs font-semibold transition-colors">
              View Review
            </button>
          </div>

          {/* 4. Pending Review */}
          <div className="bg-white rounded-[18px] p-5 border border-[#E7EAF3] shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B] mb-1 uppercase tracking-wider">Pending Review</p>
              <h2 className="text-xl font-bold text-[#0F172A]">{data.pendingReviewsCount}</h2>
              <p className="text-xs text-[#64748B] mt-1">
                {data.pendingReviewsCount > 0 ? "Review in queue" : "No pending reviews"}
              </p>
            </div>
            <button className="w-full py-2 mt-4 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-[12px] text-xs font-semibold border border-[#E7EAF3] transition-colors">
              Track Status
            </button>
          </div>

          {/* 5. Next Session */}
          <div className="bg-white rounded-[18px] p-5 border border-[#E7EAF3] shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B] mb-1 uppercase tracking-wider">Next Session</p>
              <h2 className="text-lg font-bold text-[#0F172A]">
                {data.nextSession ? new Date(data.nextSession.scheduledAt).toLocaleDateString() : "Not Scheduled"}
              </h2>
              <p className="text-xs text-[#64748B] mt-1">Google Meet</p>
            </div>
            <button className="w-full py-2 mt-4 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-[12px] text-xs font-semibold border border-[#E7EAF3] transition-colors flex items-center justify-center gap-1">
              <Calendar size={14}/> View Sessions
            </button>
          </div>

        </div>

        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* LEFT: Performance Snapshot */}
          <div className="bg-white rounded-[18px] p-6 border border-[#E7EAF3] shadow-sm">
            <h3 className="font-bold text-[#0F172A] mb-6 flex items-center gap-2">
              <LineChart size={18} className="text-[#6D3DF5]"/> Performance Snapshot
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="flex items-center gap-2 text-[#64748B]"><Target size={16}/> Execution</span>
                <span>{data.scoreBreakdown.execution} / 100</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="flex items-center gap-2 text-[#64748B]"><Shield size={16}/> Risk Mgmt</span>
                <span>{data.scoreBreakdown.risk} / 100</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="flex items-center gap-2 text-[#64748B]"><BrainCircuit size={16}/> Psychology</span>
                <span>{data.scoreBreakdown.psychology} / 100</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="flex items-center gap-2 text-[#64748B]"><Flag size={16}/> Discipline</span>
                <span>{data.scoreBreakdown.discipline} / 100</span>
              </div>
            </div>
          </div>

          {/* MIDDLE: Mentor Observation */}
          <div className="bg-white rounded-[18px] p-6 border border-[#E7EAF3] shadow-sm">
            <h3 className="font-bold text-[#0F172A] mb-4">Mentor Observation</h3>
            {data.mentorObservation ? (
              <div className="space-y-4">
                <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 p-3 rounded-[12px]">
                  <p className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-1">Biggest Strength</p>
                  <p className="text-sm text-[#0F172A]">{data.mentorObservation.strengths || "Consistency in setups."}</p>
                </div>
                <div className="bg-[#E11D48]/5 border border-[#E11D48]/20 p-3 rounded-[12px]">
                  <p className="text-xs font-bold text-[#E11D48] uppercase tracking-wider mb-1">Area of Improvement</p>
                  <p className="text-sm text-[#0F172A]">{data.mentorObservation.improvements || "Hold winners longer."}</p>
                </div>
                <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 p-3 rounded-[12px]">
                  <p className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-1">Focus This Week</p>
                  <p className="text-sm text-[#0F172A]">{data.mentorObservation.focus || "Strict SL adherence."}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No observations yet.</p>
            )}
          </div>

          {/* RIGHT: Score Breakdown Bars */}
          <div className="bg-white rounded-[18px] p-6 border border-[#E7EAF3] shadow-sm">
            <h3 className="font-bold text-[#0F172A] mb-6">Score Breakdown</h3>
            <div className="space-y-5">
              {[
                { label: "Execution", val: data.scoreBreakdown.execution, color: "bg-[#2563EB]" },
                { label: "Risk Management", val: data.scoreBreakdown.risk, color: "bg-[#16A34A]" },
                { label: "Psychology", val: data.scoreBreakdown.psychology, color: "bg-[#F59E0B]" },
                { label: "Discipline", val: data.scoreBreakdown.discipline, color: "bg-[#6D3DF5]" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#64748B]">{item.label}</span>
                    <span className="text-[#0F172A]">{item.val}/100</span>
                  </div>
                  <div className="h-2 w-full bg-[#F1ECFF] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        
        {/* BOTTOM: Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-[18px] p-6 border border-[#E7EAF3] shadow-sm">
            <h3 className="font-bold text-[#0F172A] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Submit Review", "View Reviews", "Action Plan", "Rulebook", "Book Session", "Community"
              ].map(action => (
                <button key={action} className="p-3 text-sm font-semibold bg-slate-50 hover:bg-[#F1ECFF] hover:text-[#6D3DF5] text-[#0F172A] border border-[#E7EAF3] rounded-[12px] transition-colors text-center">
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[18px] p-6 border border-[#E7EAF3] shadow-sm">
            <h3 className="font-bold text-[#0F172A] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {data.recentActivity.length > 0 ? data.recentActivity.map(act => (
                <div key={act.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F1ECFF] flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={14} className="text-[#6D3DF5]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A] font-medium">{act.description}</p>
                    <p className="text-xs text-[#64748B]">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[#64748B]">No recent activity.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
