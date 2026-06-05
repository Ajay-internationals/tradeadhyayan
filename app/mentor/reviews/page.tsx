"use client";

import React, { useState, useEffect } from "react";
import { getMentorDashboard, submitMentorshipReviewScore } from "@/app/actions/mentorship";
import { ArrowRight, UserCircle2, CheckCircle2, AlertCircle, ChevronRight, MessageSquare, Plus, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function MentorReviewsPage({ searchParams }: { searchParams: { id?: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [scores, setScores] = useState({ execution: 50, risk: 50, psychology: 50, discipline: 50 });
  const [feedback, setFeedback] = useState({ strengths: "", improvements: "", actionPlan: "", focus: "" });

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

  const activeReview = data.reviewRequests?.find((r:any) => r.id === searchParams.id) || data.reviewRequests?.filter((r:any) => r.status === "PENDING")[0];

  const handleSubmit = async () => {
    if (!activeReview) return;
    setSubmitting(true);
    try {
      const email = localStorage.getItem('trade_adhyayan_user');
      await submitMentorshipReviewScore(email!, activeReview.id, scores, feedback);
      toast.success("Review submitted successfully!");
      // Refresh
      const result = await getMentorDashboard(email!);
      setData(result);
    } catch(e:any) {
      toast.error(e.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6" style={{ backgroundColor: "#FAFAFF" }}>
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Review Requests</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Grade and provide feedback to your assigned clients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Pending Reviews List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6 h-[calc(100vh-140px)] flex flex-col">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">Pending Reviews</h3>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {data.reviewRequests?.map((req:any) => (
                <div 
                  key={req.id} 
                  onClick={() => router.push(`/mentor/reviews?id=${req.id}`)}
                  className={`p-4 rounded-[12px] border cursor-pointer transition-colors ${activeReview?.id === req.id ? 'bg-[#F1ECFF] border-[#6D3DF5]' : 'bg-[#FAFAFF] border-[#E7EAF3] hover:border-[#6D3DF5]'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.Client?.name || 'Client'}`} alt="avatar"/>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A]">{req.Client?.name || 'Client'}</p>
                        <p className="text-[10px] font-semibold text-[#64748B]">{new Date(req.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.status === 'COMPLETED' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FFEDD5] text-[#EA580C]'}`}>
                      {req.status}
                    </span>
                  </div>
                  {req.clientNotes && (
                    <p className="text-[12px] text-[#64748B] italic line-clamp-2 mt-2">"{req.clientNotes}"</p>
                  )}
                </div>
              ))}
              {(!data.reviewRequests || data.reviewRequests.length === 0) && (
                 <p className="text-sm text-center text-[#64748B] mt-10">No review requests found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Grading Form / View */}
        <div className="lg:col-span-2 space-y-6">
          {activeReview ? (
            <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-8">
              
              <div className="flex items-center gap-4 pb-6 border-b border-[#E7EAF3] mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeReview.Client?.name || 'Client'}`} alt="avatar"/>
                </div>
                <div>
                  <h2 className="text-[20px] font-black text-[#0F172A]">{activeReview.Client?.name || 'Client'}'s Review</h2>
                  <p className="text-[13px] font-medium text-[#64748B] flex items-center gap-2">
                    Submitted on {new Date(activeReview.submittedAt).toLocaleDateString()} 
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E7EAF3]"></span>
                    {activeReview.selectedTradeIds?.length || 0} Trades attached
                  </p>
                </div>
              </div>

              {activeReview.clientNotes && (
                <div className="mb-8">
                  <h4 className="text-[13px] font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#6D3DF5]"/>
                    Client Notes
                  </h4>
                  <div className="bg-[#FAFAFF] p-4 rounded-[12px] border border-[#E7EAF3] text-[13px] text-[#64748B] italic">
                    "{activeReview.clientNotes}"
                  </div>
                </div>
              )}

              {activeReview.status === "COMPLETED" && activeReview.MentorshipReview ? (
                // View Mode
                <div className="space-y-8">
                  <div className="bg-[#F1ECFF] p-6 rounded-[16px]">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                         <span className="text-[18px] font-black text-[#6D3DF5]">{activeReview.MentorshipReview.overallScore.toFixed(0)}</span>
                       </div>
                       <div>
                         <h4 className="text-[16px] font-bold text-[#0F172A]">Overall Score</h4>
                         <p className="text-[12px] font-semibold text-[#6D3DF5]">Graded by you</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div><p className="text-[11px] font-bold text-[#64748B] uppercase">Execution</p><p className="text-[14px] font-bold text-[#0F172A]">{activeReview.MentorshipReview.executionScore}/100</p></div>
                       <div><p className="text-[11px] font-bold text-[#64748B] uppercase">Risk</p><p className="text-[14px] font-bold text-[#0F172A]">{activeReview.MentorshipReview.riskScore}/100</p></div>
                       <div><p className="text-[11px] font-bold text-[#64748B] uppercase">Psychology</p><p className="text-[14px] font-bold text-[#0F172A]">{activeReview.MentorshipReview.psychologyScore}/100</p></div>
                       <div><p className="text-[11px] font-bold text-[#64748B] uppercase">Discipline</p><p className="text-[14px] font-bold text-[#0F172A]">{activeReview.MentorshipReview.disciplineScore}/100</p></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <h4 className="text-[13px] font-bold text-[#0F172A] mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-[#16A34A]"/> Top Strengths</h4>
                       <p className="text-[13px] text-[#64748B] bg-[#FAFAFF] p-4 rounded-[12px] border border-[#E7EAF3]">{activeReview.MentorshipReview.strengths}</p>
                    </div>
                    <div>
                       <h4 className="text-[13px] font-bold text-[#0F172A] mb-3 flex items-center gap-2"><AlertCircle size={16} className="text-[#EA580C]"/> Focus Areas</h4>
                       <p className="text-[13px] text-[#64748B] bg-[#FAFAFF] p-4 rounded-[12px] border border-[#E7EAF3]">{activeReview.MentorshipReview.nextWeekFocus}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Grading Form
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0F172A] mb-6 border-b border-[#E7EAF3] pb-2">1. Score the Trades</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { key: "execution", label: "Execution & Setup" },
                        { key: "risk", label: "Risk Management" },
                        { key: "psychology", label: "Psychology & Emotion" },
                        { key: "discipline", label: "Discipline & Rules" },
                      ].map((s) => (
                        <div key={s.key}>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[13px] font-bold text-[#0F172A]">{s.label}</label>
                            <span className="text-[13px] font-black text-[#6D3DF5]">{(scores as any)[s.key]}</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" 
                            className="w-full h-2 bg-[#E7EAF3] rounded-lg appearance-none cursor-pointer accent-[#6D3DF5]"
                            value={(scores as any)[s.key]}
                            onChange={(e) => setScores({...scores, [s.key]: parseInt(e.target.value)})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[16px] font-bold text-[#0F172A] mb-6 border-b border-[#E7EAF3] pb-2">2. Mentor Feedback</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[13px] font-bold text-[#0F172A] mb-1 block">Top Strengths</label>
                        <textarea 
                          rows={2}
                          className="w-full text-[13px] bg-[#FAFAFF] border border-[#E7EAF3] rounded-[10px] p-3 focus:outline-none focus:border-[#6D3DF5]"
                          placeholder="What did they do well?"
                          value={feedback.strengths} onChange={e => setFeedback({...feedback, strengths: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-bold text-[#0F172A] mb-1 block">Areas for Improvement</label>
                        <textarea 
                          rows={2}
                          className="w-full text-[13px] bg-[#FAFAFF] border border-[#E7EAF3] rounded-[10px] p-3 focus:outline-none focus:border-[#6D3DF5]"
                          placeholder="Where do they need to improve?"
                          value={feedback.improvements} onChange={e => setFeedback({...feedback, improvements: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-bold text-[#0F172A] mb-1 block">Next Week's Focus</label>
                        <textarea 
                          rows={2}
                          className="w-full text-[13px] bg-[#FAFAFF] border border-[#E7EAF3] rounded-[10px] p-3 focus:outline-none focus:border-[#6D3DF5]"
                          placeholder="What is their single biggest goal next week?"
                          value={feedback.focus} onChange={e => setFeedback({...feedback, focus: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-bold text-[#0F172A] mb-1 block">Action Plan Rules (Will be added to their dashboard)</label>
                        <textarea 
                          rows={2}
                          className="w-full text-[13px] bg-[#FAFAFF] border border-[#E7EAF3] rounded-[10px] p-3 focus:outline-none focus:border-[#6D3DF5]"
                          placeholder="e.g. Max 3 trades per day, Stop trading after 2 consecutive losses."
                          value={feedback.actionPlan} onChange={e => setFeedback({...feedback, actionPlan: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E7EAF3] flex justify-end">
                    <button 
                      onClick={handleSubmit}
                      disabled={submitting || !feedback.strengths || !feedback.focus}
                      className="bg-[#6D3DF5] text-white px-8 py-3 rounded-[12px] font-bold text-[14px] hover:bg-[#5B3FCC] disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {submitting ? "Submitting..." : "Submit Review Score"}
                      {!submitting && <ArrowRight size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-12 text-center flex flex-col items-center justify-center h-[calc(100vh-140px)]">
              <div className="w-16 h-16 bg-[#F1ECFF] rounded-full flex items-center justify-center mb-4">
                <Activity size={32} className="text-[#6D3DF5]" />
              </div>
              <h3 className="text-[20px] font-black text-[#0F172A]">No Review Selected</h3>
              <p className="text-[14px] font-medium text-[#64748B] max-w-[300px] mt-2">Select a review request from the list on the left to start grading.</p>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E7EAF3; border-radius: 4px; }
      `}} />
    </div>
  );
}
