"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getMentorClients,
  getReviewQueue,
  submitMentorshipReview
} from "@/app/actions/trades";
import {
  Users,
  ClipboardList,
  ArrowLeft,
  User,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
  LogOut,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function MentorArena() {
  const router = useRouter();
  const [mentorEmail, setMentorEmail] = useState("");
  const [activeSection, setActiveSection] = useState<"queue" | "clients">("queue");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Data states
  const [reviewRequests, setReviewRequests] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // Selection states
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Review Builder States
  const [scores, setScores] = useState({
    executionScore: 80,
    riskScore: 80,
    psychologyScore: 80,
    disciplineScore: 80
  });
  const [feedback, setFeedback] = useState({
    strengths: "",
    improvements: "",
    mistakesObserved: "",
    actionPlan: "",
    nextWeekFocus: "",
    mentorRemark: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check login and fetch data
  const loadData = async (email: string) => {
    try {
      setIsPageLoading(true);
      const queue = await getReviewQueue(email);
      const activeClients = await getMentorClients(email);
      setReviewRequests(queue);
      setClients(activeClients);
    } catch (err) {
      console.error("Error loading mentor data:", err);
      toast.error("Failed to load mentor arena data.");
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) {
      router.push("/login");
      return;
    }
    setMentorEmail(email);
    loadData(email);
  }, []);

  const handleScoreChange = (key: string, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const handleFeedbackChange = (key: string, val: string) => {
    setFeedback((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      setIsSubmitting(true);
      await submitMentorshipReview(mentorEmail, selectedRequest.id, scores, feedback);
      toast.success("Review submitted successfully! 🏆");
      setSelectedRequest(null);
      // Reset form
      setScores({
        executionScore: 80,
        riskScore: 80,
        psychologyScore: 80,
        disciplineScore: 80
      });
      setFeedback({
        strengths: "",
        improvements: "",
        mistakesObserved: "",
        actionPlan: "",
        nextWeekFocus: "",
        mentorRemark: ""
      });
      await loadData(mentorEmail);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = reviewRequests.filter((r) => r.status === "PENDING");
  const completedRequests = reviewRequests.filter((r) => r.status === "COMPLETED");

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">Loading Mentor Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#111827] border-r border-[#1F2937] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-extrabold text-lg select-none">TA</span>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-white text-[13px] tracking-wider leading-none block uppercase">
                MENTOR ARENA
              </span>
              <span className="text-[9px] font-bold text-[#8C8CA1] block mt-1 tracking-tight">
                Review & Coach Traders
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveSection("queue");
                setSelectedRequest(null);
                setSelectedClient(null);
              }}
              className={`w-full flex items-center justify-between px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === "queue" && !selectedRequest && !selectedClient
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/25"
                  : "text-[#8C8CA1] hover:text-[#E2E8F0] hover:bg-[#1F2937]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={16} />
                <span>Review Queue</span>
              </div>
              {pendingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[9px] flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveSection("clients");
                setSelectedRequest(null);
                setSelectedClient(null);
              }}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === "clients" && !selectedClient
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/25"
                  : "text-[#8C8CA1] hover:text-[#E2E8F0] hover:bg-[#1F2937]"
              }`}
            >
              <Users size={16} />
              <span>My Clients</span>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold text-[#8C8CA1] hover:text-[#E2E8F0] hover:bg-[#1F2937] transition-all cursor-pointer border border-transparent"
          >
            <ArrowLeft size={16} />
            <span>Trader Arena</span>
          </button>

          <div className="flex items-center gap-3 border-t border-[#1F2937] pt-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <User size={14} className="text-slate-400" />
            </div>
            <div className="text-left overflow-hidden">
              <span className="text-[10px] font-black text-[#E2E8F0] block truncate">
                {mentorEmail.split("@")[0]}
              </span>
              <span className="text-[8px] text-[#8C8CA1] font-bold block truncate">
                {mentorEmail}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* REVIEW REQUEST DETAIL DRAWER/PAGE */}
        {selectedRequest ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 bg-[#111827] border border-[#1F2937] hover:bg-[#1F2937] text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Review Builder
                </h2>
                <p className="text-[9px] text-[#8C8CA1] font-bold">
                  Evaluating {selectedRequest.Client.name} ({selectedRequest.Client.email})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Client Submission Details */}
              <div className="lg:col-span-5 bg-[#111827] border border-[#1F2937] rounded-3xl p-6 space-y-6 text-left">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-[#8C8CA1] uppercase tracking-wider">
                    Client notes & Questions
                  </span>
                  <div className="p-4 bg-[#1F2937]/50 rounded-2xl border border-[#374151] text-xs font-semibold leading-relaxed text-slate-300">
                    "{selectedRequest.clientNotes || "No notes added by trader."}"
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#1F2937]/30 border border-[#1F2937] rounded-2xl">
                    <span className="text-[7px] text-[#8C8CA1] font-black uppercase tracking-wider block">
                      Discipline Rating
                    </span>
                    <span className="text-sm font-black text-indigo-400 mt-1 block">
                      {selectedRequest.disciplineRating} / 10
                    </span>
                  </div>
                  <div className="p-4 bg-[#1F2937]/30 border border-[#1F2937] rounded-2xl">
                    <span className="text-[7px] text-[#8C8CA1] font-black uppercase tracking-wider block">
                      Submitted Date
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 mt-1.5 block">
                      {new Date(selectedRequest.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[8px] font-black text-[#8C8CA1] uppercase tracking-wider block">
                    Trades selected for review ({selectedRequest.selectedTradeIds.length})
                  </span>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedRequest.selectedTradeIds.map((id: string) => (
                      <div
                        key={id}
                        className="p-3 bg-[#1F2937]/30 border border-[#1F2937] rounded-xl flex justify-between items-center text-xs"
                      >
                        <span className="font-bold text-slate-200">{id}</span>
                        <span className="text-[9px] font-semibold text-slate-500">Manual Entry</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Evaluation Sheet Form */}
              <div className="lg:col-span-7 bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-sm text-left">
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Mentor Scorecard
                    </h3>
                    <p className="text-[9px] text-[#8C8CA1] font-bold mt-0.5">
                      Assign percentages and detailed roadmap points
                    </p>
                  </div>

                  {/* Score inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "executionScore", label: "Execution Quality" },
                      { key: "riskScore", label: "Risk Management" },
                      { key: "psychologyScore", label: "Trader Psychology" },
                      { key: "disciplineScore", label: "Rule Discipline" }
                    ].map((s) => (
                      <div key={s.key} className="space-y-1.5 p-3 bg-[#1F2937]/30 border border-[#1F2937] rounded-2xl">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1]">
                            {s.label}
                          </label>
                          <span className="text-xs font-black text-indigo-400">
                            {(scores as any)[s.key]}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(scores as any)[s.key]}
                          onChange={(e) => handleScoreChange(s.key, parseInt(e.target.value))}
                          className="w-full h-1 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Feedback Roadmaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                        Key Strengths
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Good stop-loss placement, patience on setups"
                        value={feedback.strengths}
                        onChange={(e) => handleFeedbackChange("strengths", e.target.value)}
                        className="w-full p-3 bg-[#1F2937]/50 border border-[#1F2937] focus:border-[#374151] rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                        Improvement Areas
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Early exit on target targets, high brokerage"
                        value={feedback.improvements}
                        onChange={(e) => handleFeedbackChange("improvements", e.target.value)}
                        className="w-full p-3 bg-[#1F2937]/50 border border-[#1F2937] focus:border-[#374151] rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                        Mistakes Observed
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Overtrading after 1 PM, revenge trading"
                        value={feedback.mistakesObserved}
                        onChange={(e) => handleFeedbackChange("mistakesObserved", e.target.value)}
                        className="w-full p-3 bg-[#1F2937]/50 border border-[#1F2937] focus:border-[#374151] rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                        Action Plan
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Lock terminal by 12 PM, review daily logs"
                        value={feedback.actionPlan}
                        onChange={(e) => handleFeedbackChange("actionPlan", e.target.value)}
                        className="w-full p-3 bg-[#1F2937]/50 border border-[#1F2937] focus:border-[#374151] rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                        Next Week Focus
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Reaching minimum 1:2 Risk Reward Ratio"
                        value={feedback.nextWeekFocus}
                        onChange={(e) => handleFeedbackChange("nextWeekFocus", e.target.value)}
                        className="w-full p-3 bg-[#1F2937]/50 border border-[#1F2937] focus:border-[#374151] rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">
                        General Remark
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Great discipline shown overall! Keep it up"
                        value={feedback.mentorRemark}
                        onChange={(e) => handleFeedbackChange("mentorRemark", e.target.value)}
                        className="w-full p-3 bg-[#1F2937]/50 border border-[#1F2937] focus:border-[#374151] rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:bg-slate-800 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Submitting Review Sheet..." : "Publish Review Scorecard"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : selectedClient ? (
          /* CLIENT INSPECTION DRAWER */
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 bg-[#111827] border border-[#1F2937] hover:bg-[#1F2937] text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Trader Inspector
                </h2>
                <p className="text-[9px] text-[#8C8CA1] font-bold">
                  Reviewing journal log of {selectedClient.name} ({selectedClient.email})
                </p>
              </div>
            </div>

            {/* Miniature Dashboard / Trades Feed */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 bg-[#111827] border border-[#1F2937] rounded-3xl p-6 space-y-4 text-left">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Trading Journal Logs
                </h3>
                {selectedClient.Trade?.length > 0 ? (
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {selectedClient.Trade.map((t: any) => {
                      const isProfit = t.pnl >= 0;
                      return (
                        <div
                          key={t.id}
                          className="p-4 bg-[#1F2937]/30 border border-[#1F2937] rounded-2xl flex justify-between items-center text-xs font-bold"
                        >
                          <div className="space-y-1">
                            <span className="text-slate-200 block">{t.symbol}</span>
                            <span className="text-[9px] text-[#8C8CA1] font-semibold block">
                              {new Date(t.entryTime).toLocaleDateString([], { month: "short", day: "numeric" })} • {t.setup || "Breakout"}
                            </span>
                          </div>
                          <div className="text-right space-y-1">
                            <span
                              className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase ${
                                t.direction === "LONG" ? "bg-[#15B77A]/10 text-[#15B77A]" : "bg-red-900/10 text-red-400"
                              }`}
                            >
                              {t.direction === "LONG" ? "BUY" : "SELL"}
                            </span>
                            <span
                              className={`text-[11px] font-black block ${
                                isProfit ? "text-[#15B77A]" : "text-[#E94B8A]"
                              }`}
                            >
                              ₹{t.pnl.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#8C8CA1] font-semibold text-center py-12">
                    No trades logged by this client yet.
                  </p>
                )}
              </div>

              {/* Summary Stats */}
              <div className="md:col-span-5 space-y-6 text-left">
                <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Performance Telemetry
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#1F2937]/30 rounded-2xl">
                      <span className="text-[8px] font-black text-[#8C8CA1] uppercase tracking-wider block">
                        Client Capital
                      </span>
                      <span className="text-base font-black text-slate-200 mt-1 block">
                        ₹{(selectedClient.initialCapital || 100000).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 bg-[#1F2937]/30 rounded-2xl">
                      <span className="text-[8px] font-black text-[#8C8CA1] uppercase tracking-wider block">
                        Total Trades Logged
                      </span>
                      <span className="text-base font-black text-slate-200 mt-1 block">
                        {selectedClient.Trade?.length || 0}
                      </span>
                    </div>

                    <div className="p-4 bg-[#1F2937]/30 rounded-2xl">
                      <span className="text-[8px] font-black text-[#8C8CA1] uppercase tracking-wider block">
                        Net P&L (Estimated)
                      </span>
                      {(() => {
                        const net = (selectedClient.Trade || []).reduce((acc: number, t: any) => acc + (t.netPnl || t.pnl - 20), 0);
                        return (
                          <span
                            className={`text-base font-black mt-1 block ${
                              net >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"
                            }`}
                          >
                            ₹{net.toLocaleString()}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* GENERAL CORE VIEWS (QUEUE / CLIENTS LIST) */
          <div className="space-y-8 text-left">
            {/* Header info */}
            <div>
              <h1 className="text-base font-black text-white uppercase tracking-wider leading-none">
                {activeSection === "queue" ? "Review Queue" : "Assigned Clients"}
              </h1>
              <p className="text-[9px] font-bold text-[#8C8CA1] mt-1.5">
                {activeSection === "queue"
                  ? "Track pending review requests from clients and submit scorecards."
                  : "View details and trade history of traders currently assigned to you."}
              </p>
            </div>

            {/* QUEUE VIEW */}
            {activeSection === "queue" && (
              <div className="space-y-8">
                {/* Pending requests */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock size={14} className="text-amber-500" />
                    <span>Pending Evaluation ({pendingRequests.length})</span>
                  </h3>

                  {pendingRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-[8px] text-[#8C8CA1] uppercase tracking-wider font-bold">
                                ID: {req.id}
                              </span>
                              <span className="px-2 py-0.5 text-[8px] font-black rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                                PENDING
                              </span>
                            </div>
                            <h4 className="font-heading font-black text-[#E2E8F0] text-sm">
                              {req.Client.name}
                            </h4>
                            <p className="text-[10px] text-[#8C8CA1] font-semibold truncate leading-relaxed">
                              "{req.clientNotes || "No notes added by trader."}"
                            </p>
                          </div>

                          <div className="pt-2 flex justify-between items-center border-t border-[#1F2937] mt-3">
                            <span className="text-[8px] font-black text-slate-500 uppercase">
                              {req.selectedTradeIds.length} Trades Submitted
                            </span>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Evaluate Request
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-12 text-center text-[#8C8CA1] font-semibold">
                      🎉 Clean Queue! No pending trader evaluation requests.
                    </div>
                  )}
                </div>

                {/* Completed Reviews */}
                {completedRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle size={14} className="text-[#15B77A]" />
                      <span>Completed Evaluations ({completedRequests.length})</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {completedRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-[#111827]/60 border border-[#1F2937] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-[8px] text-[#8C8CA1] uppercase tracking-wider font-bold">
                                ID: {req.id}
                              </span>
                              <span className="px-2 py-0.5 text-[8px] font-black rounded-full bg-[#15B77A]/10 text-[#15B77A] border border-[#15B77A]/20 uppercase tracking-wider">
                                COMPLETED
                              </span>
                            </div>
                            <h4 className="font-heading font-black text-[#E2E8F0] text-sm">
                              {req.Client.name}
                            </h4>
                            {req.MentorshipReview && (
                              <p className="text-[10px] text-[#8C8CA1] font-semibold leading-relaxed">
                                Score assigned: <span className="text-indigo-400 font-extrabold">{req.MentorshipReview.overallScore.toFixed(1)}/100</span>
                              </p>
                            )}
                          </div>

                          <div className="pt-2 flex justify-between items-center border-t border-[#1F2937] mt-3">
                            <span className="text-[8px] font-black text-slate-500 uppercase">
                              Reviewed on {new Date(req.completedAt || req.submittedAt).toLocaleDateString()}
                            </span>
                            <span className="text-[9px] font-black text-[#15B77A] uppercase tracking-wider flex items-center gap-1">
                              Published ✓
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CLIENTS VIEW */}
            {activeSection === "clients" && (
              <div className="space-y-4">
                {clients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <h4 className="font-heading font-black text-[#E2E8F0] text-sm">
                            {client.name}
                          </h4>
                          <p className="text-[10px] text-[#8C8CA1] font-semibold leading-relaxed">
                            {client.email}
                          </p>
                          <div className="flex flex-wrap gap-4 pt-1 text-[9px] font-bold text-slate-500">
                            <div>
                              <span className="text-[#8C8CA1]">Capital: </span>
                              ₹{(client.initialCapital || 100000).toLocaleString()}
                            </div>
                            <div>
                              <span className="text-[#8C8CA1]">Trades: </span>
                              {client.Trade?.length || 0}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between items-center border-t border-[#1F2937] mt-3">
                          <span className="text-[8px] font-black text-slate-500 uppercase">
                            Assigned on {new Date(client.assignedDate || Date.now()).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="h-8 px-4 bg-[#1F2937] hover:bg-[#374151] border border-[#374151]/50 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Inspect Journal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-12 text-center text-[#8C8CA1] font-semibold">
                    👥 You do not have any active clients assigned.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
