"use client";

import React, { useState, useEffect } from "react";
import { getClientMentorshipOverview, submitClientReviewRequest } from "@/app/actions/mentorship";
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

  const [showModal, setShowModal] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [clientNotes, setClientNotes] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [availableTrades, setAvailableTrades] = useState<any[]>([]);

  const openShareModal = async () => {
    setShowModal(true);
    try {
      const email = localStorage.getItem('trade_adhyayan_user');
      if (email) {
        const res = await fetch(`/api/journal/trades?email=${email}`);
        const json = await res.json();
        if (json.success) {
          setAvailableTrades(json.data.filter((t: any) => t.status === "CLOSED"));
        }
      }
    } catch (err) {
      console.error("Failed to load trades for sharing:", err);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrades.length === 0) {
      alert("Please select at least one trade to share.");
      return;
    }
    setSubmittingRequest(true);
    try {
      const email = localStorage.getItem('trade_adhyayan_user');
      if (email) {
        await submitClientReviewRequest(email, selectedTrades, clientNotes);
        alert("Review request submitted to your mentor successfully!");
        setShowModal(false);
        setSelectedTrades([]);
        setClientNotes("");
        // Refresh page data
        const result = await getClientMentorshipOverview(email);
        setData(result);
      }
    } catch (err: any) {
      alert("Failed to submit request: " + err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

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

            <button 
              onClick={openShareModal}
              className="w-full mt-6 bg-gradient-to-r from-[#6D3DF5] to-[#4A1D96] hover:from-[#5B3FCC] hover:to-[#3b1778] text-white py-3.5 rounded-[12px] font-bold text-[14px] shadow-lg flex justify-center items-center gap-2 transition-all cursor-pointer"
            >
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] border border-[#E7EAF3] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[#E7EAF3] flex justify-between items-center bg-[#FAFAFF]">
              <div>
                <h3 className="font-bold text-[18px] text-[#0F172A]">Share Trades for Review</h3>
                <p className="text-[#64748B] text-[12px] font-medium mt-0.5">Select closed trades to share with your mentor.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {availableTrades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[14px] font-bold text-[#64748B]">No closed trades found.</p>
                  <p className="text-[12px] text-[#64748B] mt-1">Please add some closed trades first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#64748B] block mb-1">Select Trades ({selectedTrades.length} selected)</label>
                  <div className="max-h-48 overflow-y-auto border border-[#E7EAF3] rounded-xl divide-y divide-[#E7EAF3] bg-slate-50">
                    {availableTrades.map((trade: any) => {
                      const isSelected = selectedTrades.includes(trade.id);
                      return (
                        <div 
                          key={trade.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTrades(selectedTrades.filter(id => id !== trade.id));
                            } else {
                              setSelectedTrades([...selectedTrades, trade.id]);
                            }
                          }}
                          className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-[#F1ECFF]' : 'hover:bg-slate-100'}`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 accent-[#6D3DF5]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="text-[13px] font-bold text-[#0F172A] truncate">{trade.symbol}</p>
                              <span className={`text-[12px] font-black ${trade.netPnl >= 0 ? 'text-[#16A34A]' : 'text-[#EF4444]'}`}>
                                {trade.netPnl >= 0 ? '+' : ''}₹{trade.netPnl}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                              <p className="text-[11px] font-medium text-[#64748B]">
                                {trade.direction} &bull; Qty {trade.quantity}
                              </p>
                              <p className="text-[10px] text-[#64748B]">
                                {new Date(trade.entryTime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#64748B] block">Notes for Mentor</label>
                <textarea 
                  rows={3} 
                  placeholder="e.g. Please review my exit strategy on these trades. I felt a bit nervous..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-[#E7EAF3] rounded-xl text-[13px] font-[500] focus:bg-white focus:border-[#6D3DF5] focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#E7EAF3] flex justify-end gap-3 bg-[#FAFAFF]">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-white border border-[#E7EAF3] text-[#64748B] rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleShareSubmit}
                disabled={submittingRequest || selectedTrades.length === 0}
                className="px-6 py-2.5 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-xl text-[13px] font-bold transition-all shadow-md disabled:bg-slate-200 disabled:text-[#64748B] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                {submittingRequest ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
