"use client";

import React, { useState, useEffect } from "react";
import { getClientMentorshipOverview } from "@/app/actions/mentorship";
import { 
  CheckCircle2, AlertCircle, Quote, Sparkles, TrendingUp,
  Target, Shield, BrainCircuit, Flag, ArrowRight, Share2, FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientMentorshipPage() {
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

  if (!data || !data.assignedMentor) {
    return (
      <div className="p-12 text-center max-w-[800px] mx-auto mt-20 bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm">
        <h2 className="text-[24px] font-black text-[#0F172A] mb-4">No Mentor Assigned Yet</h2>
        <p className="text-[14px] font-medium text-[#64748B] mb-8">You are not currently enrolled in a mentorship program or your mentor assignment is pending.</p>
        <button className="bg-[#6D3DF5] text-white px-8 py-3 rounded-full font-bold">Explore Mentorship Plans</button>
      </div>
    );
  }

  const mObs = data.mentorObservation;
  const recentReview = mObs ? data.currentScore : null;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6" style={{ backgroundColor: "#FAFAFF" }}>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Mentorship Dashboard</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Track your progress and mentor feedback.</p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Trades Shared", val: data.tradesSharedCount?.toString() || "0", icon: Share2, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Reviewed", val: data.reviewedCount?.toString() || "0", icon: FileText, color: "text-green-600", bg: "bg-green-100" },
          { label: "Avg Mentor Score", val: data.currentScore ? `${data.currentScore.toFixed(0)}/100` : "N/A", icon: Target, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Improvement Areas", val: data.mentorObservation?.improvements ? "1" : "0", icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-100" },
          { label: "Action Taken", val: data.activeActionItems > 0 ? "Yes" : "Pending", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white p-5 rounded-[18px] border border-[#E7EAF3] shadow-sm">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">{kpi.label}</span>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-black text-[#0F172A]">{kpi.val}</h2>
              <div className={`w-8 h-8 rounded-full ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={16} className={kpi.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[18px] text-[#0F172A]">Recent Reviews</h3>
              <button className="text-[12px] font-bold text-[#6D3DF5] bg-[#F1ECFF] px-4 py-1.5 rounded-full hover:bg-[#E4DEFF]">
                View All History
              </button>
            </div>
            
            <div className="space-y-4">
              {data.completedReviewsData && data.completedReviewsData.length > 0 ? (
                data.completedReviewsData.map((rev: any, i: number) => (
                  <div key={i} className="flex gap-4 p-4 rounded-[16px] border border-[#E7EAF3] hover:border-[#6D3DF5] transition-colors group cursor-pointer bg-[#FAFAFF]">
                    <div className="w-[60px] flex flex-col items-center justify-center shrink-0 border-r border-[#E7EAF3] pr-4">
                       <span className={`text-[18px] font-black ${rev.score >= 80 ? 'text-[#16A34A]' : rev.score >= 70 ? 'text-[#6D3DF5]' : 'text-[#EA580C]'}`}>
                         {rev.score.toFixed(0)}
                       </span>
                       <span className="text-[10px] font-bold text-[#64748B] uppercase">Score</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#94A3B8]">{new Date(rev.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <h4 className="text-[14px] font-bold text-[#0F172A] mt-0.5">{rev.symbol} <span className={`text-[10px] px-1.5 py-0.5 rounded ml-2 ${rev.type === 'LONG' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{rev.type}</span></h4>
                        </div>
                        
                        {/* Mini Sparkline Mock */}
                        <div className="flex items-end gap-1 h-6">
                          <div className="w-1.5 h-3 bg-[#E7EAF3] rounded-t-sm"></div>
                          <div className="w-1.5 h-4 bg-[#E7EAF3] rounded-t-sm"></div>
                          <div className="w-1.5 h-6 bg-[#6D3DF5] rounded-t-sm"></div>
                          <div className="w-1.5 h-2 bg-[#E7EAF3] rounded-t-sm"></div>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#64748B] leading-relaxed">"{rev.desc}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-[#64748B] font-medium border border-dashed border-[#E7EAF3] rounded-[16px]">
                  No completed reviews yet. Share a trade with your mentor to get started!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Mentor's Summary */}
        <div className="space-y-6">
          <div className="bg-[#1e1b4b] rounded-[18px] shadow-sm p-6 relative overflow-hidden text-white">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6D3DF5] to-transparent opacity-20 rounded-bl-[100px]"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 p-1">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${data.assignedMentor?.User?.name || 'Mentor'}`} alt="Mentor"/>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#a5b4fc] uppercase tracking-wider">Your Mentor</p>
                <h3 className="text-[18px] font-black">{data.assignedMentor?.User?.name || 'Mentor'}</h3>
              </div>
            </div>

            {mObs && (
              <div className="mb-6 relative z-10">
                <Quote className="text-[#6D3DF5] opacity-50 mb-2" size={24}/>
                <p className="text-[14px] font-medium leading-relaxed italic text-white/90">
                  "You showed great discipline this week. Keep focusing on your risk management rules."
                </p>
              </div>
            )}

            <div className="space-y-4 relative z-10">
              <div className="bg-white/5 rounded-[12px] p-4 border border-white/10">
                <h4 className="text-[12px] font-bold text-[#4ade80] mb-2 flex items-center gap-2"><CheckCircle2 size={14}/> Top Strengths</h4>
                <p className="text-[13px] text-white/80">{mObs?.strengths || "Discipline and patience."}</p>
              </div>
              
              <div className="bg-white/5 rounded-[12px] p-4 border border-white/10">
                <h4 className="text-[12px] font-bold text-[#fb923c] mb-2 flex items-center gap-2"><AlertCircle size={14}/> Focus Areas</h4>
                <p className="text-[13px] text-white/80">{mObs?.focus || "Risk management on losing trades."}</p>
              </div>
            </div>

            <button className="w-full mt-6 bg-gradient-to-r from-[#6D3DF5] to-[#4A1D96] hover:from-[#5B3FCC] hover:to-[#3b1778] text-white py-3.5 rounded-[12px] font-bold text-[14px] shadow-lg flex justify-center items-center gap-2 transition-all">
              <Sparkles size={18}/>
              Share New Trade
            </button>
          </div>
        </div>

      </div>

      {/* Improvement Journey */}
      <div>
        <h3 className="font-bold text-[18px] text-[#0F172A] mb-4">Improvement Journey (This Month)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#FAFAFF] rounded-[16px] p-5 border border-[#E7EAF3] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#DCFCE7] rounded-bl-[100px] opacity-50"></div>
            <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center mb-4 relative z-10">
              <Target size={14}/>
            </div>
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Plan Followed</p>
            <h4 className="text-[24px] font-black text-[#0F172A]">85%</h4>
            <div className="w-full h-1.5 bg-[#E7EAF3] rounded-full mt-3 overflow-hidden">
               <div className="h-full bg-[#16A34A] w-[85%]"></div>
            </div>
          </div>

          <div className="bg-[#FAFAFF] rounded-[16px] p-5 border border-[#E7EAF3] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#DBEAFE] rounded-bl-[100px] opacity-50"></div>
            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center mb-4 relative z-10">
              <Shield size={14}/>
            </div>
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Risk Managed</p>
            <h4 className="text-[24px] font-black text-[#0F172A]">92%</h4>
            <div className="w-full h-1.5 bg-[#E7EAF3] rounded-full mt-3 overflow-hidden">
               <div className="h-full bg-[#2563EB] w-[92%]"></div>
            </div>
          </div>

          <div className="bg-[#FAFAFF] rounded-[16px] p-5 border border-[#E7EAF3] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F3E8FF] rounded-bl-[100px] opacity-50"></div>
            <div className="w-8 h-8 rounded-full bg-[#6D3DF5] text-white flex items-center justify-center mb-4 relative z-10">
              <BrainCircuit size={14}/>
            </div>
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Patience Score</p>
            <h4 className="text-[24px] font-black text-[#0F172A]">78%</h4>
            <div className="w-full h-1.5 bg-[#E7EAF3] rounded-full mt-3 overflow-hidden">
               <div className="h-full bg-[#6D3DF5] w-[78%]"></div>
            </div>
          </div>

          <div className="bg-[#FAFAFF] rounded-[16px] p-5 border border-[#E7EAF3] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFEDD5] rounded-bl-[100px] opacity-50"></div>
            <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center mb-4 relative z-10">
              <TrendingUp size={14}/>
            </div>
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Overall Progress</p>
            <h4 className="text-[24px] font-black text-[#0F172A] flex items-center gap-2">
              B+ <span className="text-[12px] font-bold text-[#16A34A] flex items-center"><TrendingUp size={12}/> Improving</span>
            </h4>
            <p className="text-[11px] font-medium text-[#64748B] mt-2">Based on last 4 reviews</p>
          </div>

        </div>
      </div>

    </div>
  );
}
