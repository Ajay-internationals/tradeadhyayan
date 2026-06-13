"use client";

import React, { useState, useEffect } from "react";
import { getMentorDashboard, submitMentorshipReviewScore } from "@/app/actions/mentorship";
import {
  ArrowRight, CheckCircle2, AlertCircle, MessageSquare, Activity,
  TrendingUp, TrendingDown, Clock, BarChart2, IndianRupee, Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function MentorReviewsPage({ searchParams = {} }: { searchParams?: { id?: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email) {
        const cached = localStorage.getItem(`ta_cache_mentor_reviews_${email}`);
        if (cached) {
          try { return JSON.parse(cached); } catch {}
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email && localStorage.getItem(`ta_cache_mentor_reviews_${email}`)) {
        return false;
      }
    }
    return true;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trades for the active review
  const [trades, setTrades] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  // Form State
  const [scores, setScores] = useState({ execution: 50, risk: 50, psychology: 50, discipline: 50 });
  const [feedback, setFeedback] = useState({ strengths: "", improvements: "", actionPlan: "", focus: "" });

  // Compute activeReview and activeId first so they are available for useEffect
  const activeReview = data?.reviewRequests?.find((r: any) => r.id === searchParams?.id)
    || data?.reviewRequests?.filter((r: any) => r.status === "PENDING")[0];
  const activeId = activeReview?.id;

  useEffect(() => {
    const email = localStorage.getItem('trade_adhyayan_user');
    if (!email) { router.push('/login'); return; }
    loadData(email);
  }, [router]);

  // Trigger trade fetch when activeReview changes
  useEffect(() => {
    if (activeReview?.selectedTradeIds) {
      fetchTradesForReview(activeReview.selectedTradeIds);
    } else {
      setTrades([]);
    }
  }, [activeId, activeReview?.selectedTradeIds]);

  async function loadData(email: string) {
    try {
      const result = await getMentorDashboard(email);
      setData(result);
      localStorage.setItem(`ta_cache_mentor_reviews_${email}`, JSON.stringify(result));
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while fetching the mentor dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch actual trades when a review is selected (SWR Enabled)
  async function fetchTradesForReview(tradeIds: string[]) {
    if (!tradeIds || tradeIds.length === 0) { setTrades([]); return; }
    
    const cacheKey = `ta_cache_trades_${tradeIds.join(",")}`;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setTrades(JSON.parse(cached));
        } catch {}
      } else {
        setTradesLoading(true);
      }
    } else {
      setTradesLoading(true);
    }

    try {
      const res = await fetch(`/api/mentor/review-trades?ids=${tradeIds.join(",")}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to load trades for review");
      } else {
        const freshTrades = json.trades || [];
        setTrades(freshTrades);
        localStorage.setItem(cacheKey, JSON.stringify(freshTrades));
      }
    } catch {
      toast.error("Network error: Failed to fetch trades");
    } finally {
      setTradesLoading(false);
    }
  }

  const handleSubmit = async () => {
    if (!activeReview) return;
    setSubmitting(true);
    try {
      const email = localStorage.getItem('trade_adhyayan_user');
      await submitMentorshipReviewScore(email!, activeReview.id, scores, feedback);
      toast.success("Review submitted successfully!");
      // Clear cache for reviews so it reloads fresh on submit
      localStorage.removeItem(`ta_cache_mentor_reviews_${email}`);
      await loadData(email!);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#6D3DF5] border-t-transparent rounded-full" />
    </div>
  );

  if (!data) return (
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

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6" style={{ backgroundColor: "#FAFAFF" }}>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Review Requests</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Grade and provide feedback to your assigned clients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Pending Reviews List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6 h-[calc(100vh-140px)] flex flex-col">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">Review Requests</h3>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {data?.reviewRequests?.map((req: any) => (
                <div
                  key={req.id}
                  onClick={() => router.push(`/mentor/reviews?id=${req.id}`)}
                  className={`p-4 rounded-[12px] border cursor-pointer transition-all ${
                    activeReview?.id === req.id
                      ? 'bg-[#F1ECFF] border-[#6D3DF5] shadow-sm'
                      : 'bg-[#FAFAFF] border-[#E7EAF3] hover:border-[#6D3DF5]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.Client?.name || 'Client'}`} alt="avatar" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A]">{req.Client?.name || 'Client'}</p>
                        <p className="text-[10px] font-semibold text-[#64748B]">
                          {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString("en-IN") : "—"}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.status === 'COMPLETED' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FFEDD5] text-[#EA580C]'}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] font-bold text-[#6D3DF5] bg-[#F1ECFF] px-2 py-0.5 rounded-full">
                      {req.selectedTradeIds?.length || 0} trades
                    </span>
                    {req.clientNotes && (
                      <p className="text-[11px] text-[#64748B] italic truncate flex-1">"{req.clientNotes}"</p>
                    )}
                  </div>
                </div>
              ))}
              {(!data?.reviewRequests || data?.reviewRequests.length === 0) && (
                <p className="text-sm text-center text-[#64748B] mt-10">No review requests found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Review Detail */}
        <div className="lg:col-span-2 space-y-5">
          {activeReview ? (
            <>
              {/* Header */}
              <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeReview.Client?.name || 'Client'}`} alt="avatar" />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-black text-[#0F172A]">{activeReview.Client?.name}'s Review</h2>
                    <p className="text-[13px] font-medium text-[#64748B]">
                      Submitted {activeReview.submittedAt ? new Date(activeReview.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      &nbsp;·&nbsp;
                      <span className="text-[#6D3DF5] font-bold">{activeReview.selectedTradeIds?.length || 0} trades attached</span>
                    </p>
                  </div>
                </div>

                {activeReview.clientNotes && (
                  <div className="bg-[#FAFAFF] border border-[#E7EAF3] rounded-[12px] p-4 flex gap-3">
                    <MessageSquare size={16} className="text-[#6D3DF5] shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[#64748B] italic">"{activeReview.clientNotes}"</p>
                  </div>
                )}
              </div>

              {/* ── SHARED TRADES ── */}
              <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
                <h3 className="font-bold text-[16px] text-[#0F172A] mb-4 flex items-center gap-2">
                  <BarChart2 size={18} className="text-[#6D3DF5]" />
                  Shared Trades ({trades.length})
                </h3>

                {tradesLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin w-6 h-6 border-3 border-[#6D3DF5] border-t-transparent rounded-full" />
                  </div>
                ) : trades.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-[#E7EAF3] rounded-[14px]">
                    <BarChart2 size={28} className="text-[#CBD5E1] mx-auto mb-2" />
                    <p className="text-[13px] font-semibold text-[#64748B]">No trade data available</p>
                    <p className="text-[12px] text-[#94A3B8] mt-1">The student's trades could not be loaded</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] font-bold text-[#64748B] border-b border-[#E7EAF3] uppercase tracking-wider">
                          <th className="pb-3 px-2">Symbol</th>
                          <th className="pb-3 px-2">Direction</th>
                          <th className="pb-3 px-2">Entry</th>
                          <th className="pb-3 px-2">Exit</th>
                          <th className="pb-3 px-2">Qty</th>
                          <th className="pb-3 px-2">Entry Price</th>
                          <th className="pb-3 px-2">Exit Price</th>
                          <th className="pb-3 px-2 text-right">Net P&L</th>
                          <th className="pb-3 px-2">Tags / Mistakes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.map((trade: any) => {
                          const isProfit = (trade.netPnl ?? trade.pnl ?? 0) >= 0;
                          return (
                            <tr key={trade.id} className="border-b border-[#E7EAF3] last:border-0 hover:bg-[#FAFAFF] transition-colors">
                              <td className="py-3 px-2">
                                <span className="font-black text-[13px] text-[#0F172A]">{trade.symbol}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  trade.direction === "LONG"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {trade.direction === "LONG" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                  {trade.direction}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-[12px] text-[#64748B]">
                                {trade.entryTime
                                  ? new Date(trade.entryTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                  : "—"}
                              </td>
                              <td className="py-3 px-2 text-[12px] text-[#64748B]">
                                {trade.exitTime
                                  ? new Date(trade.exitTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                  : "—"}
                              </td>
                              <td className="py-3 px-2 text-[13px] font-semibold text-[#0F172A]">{trade.quantity ?? "—"}</td>
                              <td className="py-3 px-2 text-[13px] font-semibold text-[#0F172A]">
                                {trade.entryPrice != null ? `₹${Number(trade.entryPrice).toLocaleString()}` : "—"}
                              </td>
                              <td className="py-3 px-2 text-[13px] font-semibold text-[#0F172A]">
                                {trade.exitPrice != null ? `₹${Number(trade.exitPrice).toLocaleString()}` : "—"}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <span className={`text-[13px] font-black ${isProfit ? "text-[#16A34A]" : "text-[#E11D48]"}`}>
                                  {isProfit ? "+" : ""}₹{Math.abs(trade.netPnl ?? trade.pnl ?? 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex flex-wrap gap-1">
                                  {trade.tags && Array.isArray(trade.tags) && trade.tags.length > 0
                                    ? trade.tags.map((tag: string, i: number) => (
                                      <span key={i} className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                                        {tag}
                                      </span>
                                    ))
                                    : <span className="text-[11px] text-[#94A3B8]">No tags</span>
                                  }
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Summary Row */}
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {[
                        {
                          label: "Total Trades", val: trades.length,
                          color: "text-[#0F172A]", bg: "bg-slate-50"
                        },
                        {
                          label: "Winners",
                          val: trades.filter(t => Number(t.netPnl ?? t.pnl ?? 0) > 0).length,
                          color: "text-[#16A34A]", bg: "bg-green-50"
                        },
                        {
                          label: "Losers",
                          val: trades.filter(t => Number(t.netPnl ?? t.pnl ?? 0) < 0).length,
                          color: "text-[#E11D48]", bg: "bg-red-50"
                        },
                        {
                          label: "Net P&L",
                          val: `${trades.reduce((sum, t) => sum + Number(t.netPnl ?? t.pnl ?? 0), 0) >= 0 ? "+" : ""}₹${Math.abs(trades.reduce((sum, t) => sum + Number(t.netPnl ?? t.pnl ?? 0), 0)).toLocaleString()}`,
                          color: trades.reduce((sum, t) => sum + Number(t.netPnl ?? t.pnl ?? 0), 0) >= 0 ? "text-[#16A34A]" : "text-[#E11D48]",
                          bg: trades.reduce((sum, t) => sum + Number(t.netPnl ?? t.pnl ?? 0), 0) >= 0 ? "bg-green-50" : "bg-red-50"
                        },
                      ].map(stat => (
                        <div key={stat.label} className={`${stat.bg} rounded-[12px] p-3 border border-[#E7EAF3] text-center`}>
                          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{stat.label}</p>
                          <p className={`text-[16px] font-black ${stat.color}`}>{stat.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── GRADING / COMPLETED VIEW ── */}
              {activeReview.status === "COMPLETED" && activeReview.MentorshipReview ? (
                <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6 space-y-6">
                  <h3 className="font-bold text-[16px] text-[#0F172A]">Review Scores</h3>
                  <div className="bg-[#F1ECFF] p-5 rounded-[14px]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="text-[18px] font-black text-[#6D3DF5]">
                          {activeReview.MentorshipReview.overallScore.toFixed(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-[#0F172A]">Overall Score</h4>
                        <p className="text-[12px] text-[#6D3DF5] font-semibold">Graded by you</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Execution", val: activeReview.MentorshipReview.executionScore },
                        { label: "Risk", val: activeReview.MentorshipReview.riskScore },
                        { label: "Psychology", val: activeReview.MentorshipReview.psychologyScore },
                        { label: "Discipline", val: activeReview.MentorshipReview.disciplineScore },
                      ].map(s => (
                        <div key={s.label}>
                          <p className="text-[11px] font-bold text-[#64748B] uppercase mb-1">{s.label}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-[#6D3DF5] rounded-full" style={{ width: `${s.val}%` }} />
                            </div>
                            <span className="text-[12px] font-black text-[#0F172A]">{s.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#0F172A] mb-2 flex items-center gap-2"><CheckCircle2 size={14} className="text-[#16A34A]" />Strengths</h4>
                      <p className="text-[13px] text-[#64748B] bg-[#FAFAFF] p-4 rounded-[12px] border border-[#E7EAF3]">{activeReview.MentorshipReview.strengths}</p>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#0F172A] mb-2 flex items-center gap-2"><AlertCircle size={14} className="text-[#EA580C]" />Focus Areas</h4>
                      <p className="text-[13px] text-[#64748B] bg-[#FAFAFF] p-4 rounded-[12px] border border-[#E7EAF3]">{activeReview.MentorshipReview.nextWeekFocus}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6 space-y-8">
                  <h3 className="font-bold text-[16px] text-[#0F172A] border-b border-[#E7EAF3] pb-4">Score These Trades</h3>

                  {/* Score sliders */}
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
                          <span className="text-[15px] font-black text-[#6D3DF5]">{(scores as any)[s.key]}<span className="text-[11px] text-[#94A3B8]">/100</span></span>
                        </div>
                        <div className="relative">
                          <input
                            type="range" min="0" max="100"
                            className="w-full h-2 bg-[#E7EAF3] rounded-lg appearance-none cursor-pointer accent-[#6D3DF5]"
                            value={(scores as any)[s.key]}
                            onChange={(e) => setScores({ ...scores, [s.key]: parseInt(e.target.value) })}
                          />
                          <div className="w-full h-2 bg-[#F1ECFF] rounded-lg absolute top-0 pointer-events-none"
                            style={{ width: `${(scores as any)[s.key]}%`, background: "linear-gradient(to right, #6D3DF5, #9F73F5)" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feedback */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-[16px] text-[#0F172A] border-b border-[#E7EAF3] pb-4">Mentor Feedback</h3>
                    {[
                      { key: "strengths", label: "Top Strengths", placeholder: "What did they do well on these trades?" },
                      { key: "improvements", label: "Areas for Improvement", placeholder: "Where do they need to improve?" },
                      { key: "focus", label: "Next Week's Focus", placeholder: "Single biggest goal for next week?" },
                      { key: "actionPlan", label: "Action Plan Rules", placeholder: "e.g. Max 3 trades per day, Stop after 2 consecutive losses." },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[13px] font-bold text-[#0F172A] mb-1 block">{f.label}</label>
                        <textarea
                          rows={2}
                          className="w-full text-[13px] bg-[#FAFAFF] border border-[#E7EAF3] rounded-[10px] p-3 focus:outline-none focus:border-[#6D3DF5] transition-colors resize-none"
                          placeholder={f.placeholder}
                          value={(feedback as any)[f.key]}
                          onChange={e => setFeedback({ ...feedback, [f.key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !feedback.strengths || !feedback.focus}
                      className="bg-[#6D3DF5] text-white px-8 py-3.5 rounded-[12px] font-bold text-[14px] hover:bg-[#5B3FCC] disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md"
                    >
                      {submitting ? "Submitting..." : "Submit Review Score"}
                      {!submitting && <ArrowRight size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-12 text-center flex flex-col items-center justify-center h-[calc(100vh-140px)]">
              <div className="w-16 h-16 bg-[#F1ECFF] rounded-full flex items-center justify-center mb-4">
                <Activity size={32} className="text-[#6D3DF5]" />
              </div>
              <h3 className="text-[20px] font-black text-[#0F172A]">No Review Selected</h3>
              <p className="text-[14px] font-medium text-[#64748B] max-w-[300px] mt-2">Select a review request from the list on the left to see the student's trades.</p>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#E7EAF3;border-radius:4px}` }} />
    </div>
  );
}
