"use client";

import React, { useState, useEffect } from "react";
import { initiateCashfreePayment } from "@/lib/payment-client";
import { getClientMentorshipOverview, submitClientReviewRequest } from "@/app/actions/mentorship";
import { 
  CheckCircle2, AlertCircle, Quote, Sparkles, TrendingUp,
  Target, Shield, BrainCircuit, Flag, ArrowRight, Share2, FileText,
  Video, Clock, UserCheck, CalendarDays, Plus, XCircle,
  Info, ThumbsUp, Star, MoreVertical, BookOpen, ChevronRight, Lightbulb
} from "lucide-react";

// Helper to generate SVG path for sparkline
function generateSparklinePath(points: number[]): string {
  if (!points || points.length === 0) return "";
  const width = 100;
  const height = 30;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  
  return points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

// Circular progress component for Improvement Journey
const ProgressRing = ({ percent, color, Icon }: { percent: number; color: string; Icon: React.ComponentType<any> }) => {
  const radius = 18;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg className="absolute w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="relative z-10">
        <Icon size={14} style={{ color }} strokeWidth={2.5} />
      </div>
    </div>
  );
};
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  REQUESTED:   "bg-orange-100 text-orange-700",
  UPCOMING:    "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-700",
  RESCHEDULED: "bg-yellow-100 text-yellow-700",
  NO_SHOW:     "bg-gray-100 text-gray-600",
};

export default function ClientMentorReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab state: "overview" or "sessions"
  const [activeTab, setActiveTab] = useState<"overview" | "sessions">("overview");

  const [showModal, setShowModal] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [clientNotes, setClientNotes] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [availableTrades, setAvailableTrades] = useState<any[]>([]);

  // Sessions Caching & State
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email) return localStorage.getItem(`ta_cache_client_userId_${email}`);
    }
    return null;
  });
  const [access, setAccess] = useState<any>(null);
  const [mentorId, setMentorId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email) return localStorage.getItem(`ta_cache_client_mentorId_${email}`);
    }
    return null;
  });
  const [sessions, setSessions] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email) {
        const cached = localStorage.getItem(`ta_cache_client_sessions_${email}`);
        if (cached) {
          try { return JSON.parse(cached); } catch {}
        }
      }
    }
    return [];
  });
  
  // Sessions subtab: "upcoming", "request", "history"
  const [sessionTab, setSessionTab] = useState<"upcoming" | "request" | "history">("upcoming");

  // Booking / Request form state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [bookingTitle, setBookingTitle] = useState("1:1 Mentorship Session");
  const [bookingNotes, setBookingNotes] = useState("");
  const [booking, setBooking] = useState(false);

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

  async function loadSessions(uid: string, email?: string) {
    try {
      const res = await fetch("/api/mentorship/sessions", {
        headers: { "x-user-id": uid, "x-user-role": "CLIENT" }
      });
      const data = await res.json();
      const s = data.sessions || [];
      setSessions(s);
      const activeEmail = email || (typeof window !== "undefined" ? localStorage.getItem("trade_adhyayan_user") : null);
      if (activeEmail) {
        localStorage.setItem(`ta_cache_client_sessions_${activeEmail}`, JSON.stringify(s));
      }
    } catch {}
  }

  async function submitSessionRequest() {
    if (!userId || !mentorId || !selectedDate) return;
    setBooking(true);
    try {
      const startDateTimeStr = `${selectedDate}T${selectedTime}:00`;
      const start = new Date(startDateTimeStr);
      const end = new Date(start.getTime() + 45 * 60 * 1000); // Default 45 mins

      const res = await fetch("/api/mentorship/book-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId, "x-user-role": "CLIENT" },
        body: JSON.stringify({
          mentorId,
          title: bookingTitle,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          notes: bookingNotes,
        }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error);

      // Trigger Cashfree payment for this session booking
      const activeEmail = typeof window !== "undefined" ? localStorage.getItem("trade_adhyayan_user") : null;
      await initiateCashfreePayment({ planId: "mentorship", email: activeEmail, mentorId });

      toast.success("🎉 Session requested! Complete payment to confirm.");
      setSessionTab("upcoming");
      setSelectedDate("");
      setBookingNotes("");
      await loadSessions(userId);
    } catch (e: any) {
      toast.error(e.message || "Request failed");
    } finally {
      setBooking(false);
    }
  }

  async function cancelSession(sessionId: string) {
    if (!userId || !confirm("Cancel this session/request?")) return;
    try {
      const res = await fetch(`/api/mentorship/sessions/${sessionId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": userId, "x-user-role": "CLIENT" },
        body: JSON.stringify({ reason: "Cancelled by client" }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success("Session cancelled");
      await loadSessions(userId);
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel");
    }
  }

  useEffect(() => {
    const email = localStorage.getItem('trade_adhyayan_user');
    if (!email) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [result, accessRes] = await Promise.all([
          getClientMentorshipOverview(email),
          fetch("/api/subscription/my-access")
        ]);
        setData(result);

        if (accessRes.ok) {
          const { access } = await accessRes.json();
          setAccess(access);
          if (!access.mentorAccess) {
            setLoading(false);
            return; // Stop loading data if they don't have access
          }
        }

        const userRes = await fetch(`/api/user/me?email=${encodeURIComponent(email)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserId(userData.id);
          localStorage.setItem(`ta_cache_client_userId_${email}`, userData.id);

          const assignRes = await fetch(`/api/mentorship/my-mentor?userId=${userData.id}`);
          if (assignRes.ok) {
            const assignData = await assignRes.json();
            setMentorId(assignData.mentorId);
            localStorage.setItem(`ta_cache_client_mentorId_${email}`, assignData.mentorId);
          }

          await loadSessions(userData.id, email);
        }
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

  if (access && !access.mentorAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-6 border border-[#E2E8F0]">
          <BookOpen className="w-8 h-8 text-[#6D3DF5]" />
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Professional Mentorship</h2>
        <p className="text-[#64748B] mb-8 leading-relaxed">
          Unlock 1:1 expert trade reviews, personalized action plans, and private mentoring sessions to accelerate your trading journey.
        </p>
        <button
          onClick={() => initiateCashfreePayment({ planId: "mentor", email: localStorage.getItem("trade_adhyayan_user") })}
          className="bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] hover:from-[#5B2FD1] hover:to-[#7C3AED] text-white font-medium py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg shadow-[#6D3DF5]/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upgrade to Mentorship</span>
        </button>
      </div>
    );
  }

  if (!data || !data.assignedMentor) {
    return (
      <div className="p-12 text-center max-w-[800px] mx-auto mt-20 bg-white rounded-[22px] border border-[#E9E6F5] shadow-sm">
        <h2 className="text-[24px] font-black text-[#0F172A] mb-4">No Mentor Assigned Yet</h2>
        <p className="text-[14px] font-medium text-[#64748B] mb-8">You are not currently enrolled in a mentorship program or your mentor assignment is pending.</p>
        <button className="bg-[#6D3DF5] text-white px-8 py-3 rounded-full font-bold">Explore Mentorship Plans</button>
      </div>
    );
  }

  const mObs = data.mentorObservation;
  const upcomingSessions = sessions.filter(s => ["REQUESTED", "UPCOMING", "RESCHEDULED"].includes(s.status));
  const historySessions = sessions.filter(s => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(s.status));

  // Recent Reviews data parsing & fallbacks
  const defaultRecentReviews = [
    {
      date: new Date("2024-05-16"),
      symbol: "NIFTY 22600 CE",
      category: "Breakout Trade",
      type: "LONG",
      score: 8.5,
      feedback: "Good setup and execution. Risk management was excellent.",
      trend: [20, 35, 25, 45, 55, 40, 65]
    },
    {
      date: new Date("2024-05-15"),
      symbol: "NIFTY 22450 PE",
      category: "Reversal Trade",
      type: "SHORT",
      score: 6.0,
      feedback: "Exit could be better. Let profits run more.",
      trend: [50, 40, 45, 30, 35, 20, 25]
    },
    {
      date: new Date("2024-05-14"),
      symbol: "NIFTY 22500 CE",
      category: "Swing Trade",
      type: "LONG",
      score: 7.0,
      feedback: "Good trade idea. Avoid early entries.",
      trend: [10, 15, 30, 25, 45, 50, 60]
    },
    {
      date: new Date("2024-05-13"),
      symbol: "BANKNIFTY 48000 PE",
      category: "Intraday Trade",
      type: "SHORT",
      score: 5.5,
      feedback: "Too much risk for the setup. Reduce position size.",
      trend: [60, 55, 40, 30, 25, 20, 15]
    }
  ];

  const displayReviews = (data && data.completedReviewsData && data.completedReviewsData.length > 0)
    ? data.completedReviewsData.map((rev: any) => ({
        date: new Date(rev.date),
        symbol: rev.symbol,
        category: rev.type === "LONG" ? "Breakout Trade" : "Reversal Trade",
        type: rev.type,
        score: rev.score > 10 ? rev.score / 10 : rev.score,
        feedback: rev.desc,
        trend: rev.type === "LONG" ? [10, 20, 15, 35, 45, 30, 50] : [50, 45, 30, 35, 20, 15, 10]
      }))
    : defaultRecentReviews;

  const defaultPendingReviews = [
    {
      symbol: "NIFTY 22700 CE",
      date: new Date("2024-05-18T10:15:00"),
      status: "Pending"
    },
    {
      symbol: "BANKNIFTY 48200 PE",
      date: new Date("2024-05-18T11:05:00"),
      status: "Pending"
    }
  ];

  const displayPending = (data && data.pendingReviewsData && data.pendingReviewsData.length > 0)
    ? data.pendingReviewsData.map((p: any) => ({
        symbol: p.symbol,
        date: new Date(p.date),
        status: p.status === "PENDING" ? "Pending" : p.status
      }))
    : defaultPendingReviews;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Tabs Switcher */}
      <div className="flex gap-1 bg-white border border-[#E9E6F5] rounded-[20px] p-1 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-bold transition-all ${
            activeTab === "overview" ? "bg-[#6D3DF5] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
          }`}
        >
          Mentorship Overview
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-bold transition-all ${
            activeTab === "sessions" ? "bg-[#6D3DF5] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
          }`}
        >
          1:1 Sessions
          {upcomingSessions.length > 0 && (
            <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "sessions" ? 'bg-white text-[#6D3DF5]' : 'bg-[#6D3DF5] text-white'}`}>
              {upcomingSessions.length}
            </span>
          )}
        </button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Trades Shared */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Trades Shared</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[28px] font-extrabold text-[#0F172A] leading-none">
                    {data.tradesSharedCount || 12}
                  </h2>
                  <span className="text-[11px] font-bold text-[#8B5CF6] block mt-2">+3 vs last week</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center shrink-0">
                  <Share2 size={18} className="text-[#8B5CF6]" />
                </div>
              </div>
            </div>

            {/* Reviewed */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Reviewed</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[28px] font-extrabold text-[#0F172A] leading-none">
                    {data.reviewedCount || 10}
                  </h2>
                  <span className="text-[11px] font-bold text-[#10B981] block mt-2">
                    {data.tradesSharedCount ? Math.round(((data.reviewedCount || 10) / data.tradesSharedCount) * 100) : 83}% of shared trades
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[#10B981]" />
                </div>
              </div>
            </div>

            {/* Avg Mentor Score */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Avg Mentor Score</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[28px] font-extrabold text-[#0F172A] leading-none flex items-baseline">
                    {data.currentScore ? (data.currentScore / 10).toFixed(1) : "7.6"}
                    <span className="text-[14px] font-medium text-[#94A3B8] ml-1">/10</span>
                  </h2>
                  <span className="text-[11px] font-bold text-[#F59E0B] block mt-2">+0.8 vs last week</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center shrink-0">
                  <Star size={18} className="text-[#F59E0B]" />
                </div>
              </div>
            </div>

            {/* Improvement Areas */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Improvement Areas</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[28px] font-extrabold text-[#0F172A] leading-none">
                    {data.mentorObservation?.improvements ? 4 : 4}
                  </h2>
                  <span className="text-[11px] font-bold text-[#3B82F6] block mt-2">Focus areas identified</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-[#3B82F6]" />
                </div>
              </div>
            </div>

            {/* Action Taken */}
            <div className="bg-white p-5 rounded-[22px] border border-[#EEF0F4] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Action Taken</span>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[28px] font-extrabold text-[#0F172A] leading-none">
                    70%
                  </h2>
                  <span className="text-[11px] font-bold text-[#EF4444] block mt-2">Improved this week</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
                  <ThumbsUp size={18} className="text-[#EF4444]" />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Reviews (Col span 2) */}
            <div className="lg:col-span-2 bg-white rounded-[22px] border border-[#EEF0F4] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-[18px] text-[#0F172A]">Recent Reviews</h3>
                  <button 
                    onClick={() => setActiveTab("sessions")} 
                    className="text-[12px] font-bold text-[#6D3DF5] hover:underline"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {displayReviews.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white hover:bg-slate-50 border border-[#EEF0F4] rounded-[18px] transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        {/* Stacked Date Box */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-12 h-14 bg-[#F5F3FF] rounded-xl border border-[#E9E6F5]">
                          <span className="text-[18px] font-bold text-[#8B5CF6] leading-none">{item.date.getDate()}</span>
                          <span className="text-[10px] font-semibold text-[#8B5CF6] uppercase mt-0.5">
                            {item.date.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-bold text-[#0F172A]">{item.symbol}</h4>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.type === 'LONG' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FEF2F2] text-[#EF4444]'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#94A3B8] font-medium mt-0.5">{item.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 flex-1 sm:justify-end">
                        {/* Mentor Score */}
                        <div className="shrink-0 text-center sm:text-left">
                          <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Mentor Score</p>
                          <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold ${
                            item.score >= 7.0 ? 'bg-[#E6FDF5] text-[#10B981]' : item.score >= 6.0 ? 'bg-[#FFFBEB] text-[#F59E0B]' : 'bg-[#FEF2F2] text-[#EF4444]'
                          }`}>
                            {item.score.toFixed(1)}/10
                          </span>
                        </div>

                        {/* Sparkline Graph */}
                        <div className="shrink-0 hidden md:block">
                          <svg className="w-24 h-8" viewBox="0 0 100 30">
                            <path
                              d={generateSparklinePath(item.trend)}
                              fill="none"
                              stroke={item.score >= 7.0 ? "#10B981" : item.score >= 6.0 ? "#F59E0B" : "#EF4444"}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {/* Feedback Text */}
                        <div className="flex-1 min-w-[150px] max-w-[280px]">
                          <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Feedback</p>
                          <p className="text-[12px] font-medium text-[#475569] leading-snug truncate" title={item.feedback}>
                            {item.feedback}
                          </p>
                        </div>

                        {/* Chevron Link */}
                        <ChevronRight size={16} className="text-[#94A3B8] group-hover:text-[#6D3DF5] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mentor's Summary (Col span 1) */}
            <div className="bg-[#1E1B4B] rounded-[22px] shadow-sm p-6 relative overflow-hidden text-white flex flex-col justify-between min-h-[420px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6D3DF5] to-transparent opacity-20 rounded-bl-[100px]"></div>
              
              <div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 p-1 shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${data.assignedMentor?.User?.name || 'Mentor'}`} alt="Mentor"/>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-black">{data.assignedMentor?.User?.name || 'Rahul Sharma'}</h3>
                      <span className="text-[10px] font-bold bg-[#6D3DF5] text-white px-2 py-0.5 rounded-full">Your Mentor</span>
                    </div>
                    <p className="text-[11px] font-medium text-[#A5B4FC] mt-0.5">Options Trader • 8+ Years Experience</p>
                  </div>
                </div>

                <div className="mb-6 relative z-10 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <Quote className="text-[#6D3DF5] opacity-50 mb-2" size={24}/>
                  <p className="text-[13px] font-medium leading-relaxed italic text-white/95">
                    "{data.mentorObservation?.focus || 'You are improving in following your plan and managing risk better. Focus on letting your profits run and avoid overtrading after a good win.'}"
                  </p>
                </div>

                {/* Strengths & Focus Areas */}
                <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
                  <div>
                    <h4 className="text-[11px] font-bold text-[#A5B4FC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#10B981]" /> Top Strengths
                    </h4>
                    <ul className="space-y-1.5 text-[12px] font-semibold text-white/90">
                      {(data.mentorObservation?.strengths ? data.mentorObservation.strengths.split(",") : ["Risk Management", "Trade Selection", "Discipline"]).slice(0, 3).map((s: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-[#10B981]">•</span> {s.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#A5B4FC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertCircle size={12} className="text-[#F59E0B]" /> Focus Areas
                    </h4>
                    <ul className="space-y-1.5 text-[12px] font-semibold text-white/90">
                      {(data.mentorObservation?.focus ? data.mentorObservation.focus.split(",") : ["Let Profits Run", "Avoid Overtrading", "Better Entries"]).slice(0, 3).map((f: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-[#F59E0B]">•</span> {f.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                onClick={openShareModal}
                className="w-full bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white py-3.5 rounded-xl font-bold text-[14px] shadow-lg flex justify-center items-center gap-2 transition-all cursor-pointer relative z-10"
              >
                <Sparkles size={18}/>
                Share New Trade
              </button>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Improvement Journey (Col span 2) */}
            <div className="lg:col-span-2 bg-white rounded-[22px] border border-[#EEF0F4] shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[18px] text-[#0F172A]">Improvement Journey</h3>
                <div className="flex items-center gap-1 bg-slate-50 border border-[#EEF0F4] rounded-lg px-3 py-1.5 text-xs font-bold text-[#475569] cursor-pointer hover:bg-slate-100 transition-colors">
                  <span>This Month</span>
                  <span className="text-[#94A3B8] text-[8px] ml-1">▼</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Plan Followed */}
                <div className="bg-[#F8FAFC] rounded-[20px] p-5 border border-[#EEF0F4] flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Plan Followed</p>
                      <h4 className="text-[24px] font-black text-[#0F172A]">
                        {data.scoreBreakdown?.discipline || 78}%
                      </h4>
                    </div>
                    <ProgressRing percent={data.scoreBreakdown?.discipline || 78} color="#10B981" Icon={Target} />
                  </div>
                  <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1 mt-3">
                    <TrendingUp size={12} /> +12% vs last month
                  </span>
                </div>

                {/* Risk Managed */}
                <div className="bg-[#F8FAFC] rounded-[20px] p-5 border border-[#EEF0F4] flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Risk Managed</p>
                      <h4 className="text-[24px] font-black text-[#0F172A]">
                        {data.scoreBreakdown?.risk || 82}%
                      </h4>
                    </div>
                    <ProgressRing percent={data.scoreBreakdown?.risk || 82} color="#F59E0B" Icon={Shield} />
                  </div>
                  <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1 mt-3">
                    <TrendingUp size={12} /> +9% vs last month
                  </span>
                </div>

                {/* Patience Score */}
                <div className="bg-[#F8FAFC] rounded-[20px] p-5 border border-[#EEF0F4] flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Patience Score</p>
                      <h4 className="text-[24px] font-black text-[#0F172A]">
                        {data.scoreBreakdown?.psychology || 70}%
                      </h4>
                    </div>
                    <ProgressRing percent={data.scoreBreakdown?.psychology || 70} color="#8B5CF6" Icon={Clock} />
                  </div>
                  <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1 mt-3">
                    <TrendingUp size={12} /> +15% vs last month
                  </span>
                </div>

                {/* Overall Progress */}
                <div className="bg-[#F8FAFC] rounded-[20px] p-5 border border-[#EEF0F4] flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Overall Progress</p>
                      <h4 className="text-[24px] font-black text-[#0F172A] flex items-center gap-1">
                        <span className="text-[#10B981]">↑</span> 18%
                      </h4>
                    </div>
                    <ProgressRing percent={75} color="#3B82F6" Icon={TrendingUp} />
                  </div>
                  <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1 mt-3">
                    Great improvement!
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Reviews (Col span 1) */}
            <div className="bg-white rounded-[22px] border border-[#EEF0F4] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-[18px] text-[#0F172A]">Pending Reviews</h3>
                  <button 
                    onClick={() => setActiveTab("sessions")} 
                    className="text-[12px] font-bold text-[#6D3DF5] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {displayPending.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-[#EEF0F4] rounded-xl hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-[#0F172A]">{p.symbol}</h4>
                          <p className="text-[11px] text-[#94A3B8] font-semibold mt-0.5">
                            {p.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} &bull; {p.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FFF3E0] text-[#E65100]">
                          {p.status}
                        </span>
                        <button className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {displayPending.length === 0 && (
                    <p className="text-sm text-center text-[#64748B] py-6">All caught up! No pending reviews.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#F1F5F9] text-center">
                <button 
                  onClick={() => setActiveTab("sessions")} 
                  className="text-[13px] font-bold text-[#6D3DF5] hover:underline"
                >
                  View All Pending
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Tip Banner */}
          <div className="bg-[#ECFDF5] border border-[#A7F3D0]/30 rounded-[20px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981] shrink-0 mt-0.5 md:mt-0">
                <Lightbulb size={18} />
              </div>
              <div>
                <p className="text-[14px] text-[#065F46] font-medium leading-relaxed">
                  <span className="font-bold">Tip from your mentor:</span> Review your losing trades more deeply. That's where the biggest growth happens.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 border border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0">
              <BookOpen size={14} />
              View Learning Resources
            </button>
          </div>
        </div>
      )}

      {/* ── SESSIONS TAB ── */}
      {activeTab === "sessions" && (
        <div className="space-y-6 max-w-[1000px]">
          {/* Subtabs */}
          <div className="flex gap-1 bg-white border border-[#E9E6F5] rounded-[20px] p-1 w-fit shadow-sm">
            {([
              { id: "upcoming", label: "Upcoming", icon: CalendarDays },
              { id: "request", label: "Request a Session", icon: Plus },
              { id: "history", label: "History", icon: CheckCircle2 },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setSessionTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold transition-all ${
                  sessionTab === t.id ? "bg-[#6D3DF5] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                }`}
              >
                <t.icon size={15} />
                {t.label}
                {t.id === "upcoming" && upcomingSessions.length > 0 && (
                  <span className="bg-white text-[#6D3DF5] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {upcomingSessions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Upcoming & Requested */}
          {sessionTab === "upcoming" && (
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="bg-white rounded-[22px] border border-[#E9E6F5] shadow-sm p-12 text-center">
                  <CalendarDays size={40} className="text-[#CBD5E1] mx-auto mb-4" />
                  <h3 className="font-bold text-[18px] text-[#0F172A] mb-2">No Upcoming Sessions</h3>
                  <p className="text-[#64748B] text-sm mb-6">Request a 1:1 session with your mentor to get personal guidance.</p>
                  <button
                    onClick={() => setSessionTab("request")}
                    className="bg-[#6D3DF5] text-white px-6 py-3 rounded-full font-bold text-[14px] flex items-center gap-2 mx-auto hover:bg-[#5B3FCC] transition-colors shadow-md"
                  >
                    <Plus size={16} /> Request a Session
                  </button>
                </div>
              ) : (
                upcomingSessions.map((s: any) => (
                  <div key={s.id} className="bg-white rounded-[22px] border border-[#E9E6F5] shadow-sm p-5 hover:border-[#6D3DF5] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-[20px] bg-[#F1ECFF] flex flex-col items-center justify-center shrink-0 border border-[#E4DEFF]">
                        <span className="text-[11px] font-bold text-[#6D3DF5] uppercase">{new Date(s.startTime).toLocaleDateString("en-IN", { month: "short" })}</span>
                        <span className="text-[24px] font-black text-[#6D3DF5] leading-none">{new Date(s.startTime).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[16px] text-[#0F172A]">{s.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] || 'bg-slate-100 text-slate-700'}`}>{s.status}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#64748B] font-medium">
                          {s.status === "REQUESTED" ? (
                            <span className="text-[#EA580C] font-semibold flex items-center gap-1">
                              <Clock size={13} /> Preferred time: {new Date(s.startTime).toLocaleDateString("en-IN")} at {new Date(s.startTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <>
                              <span className="flex items-center gap-1.5"><Clock size={13} />{new Date(s.startTime).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                              <span className="flex items-center gap-1.5"><Clock size={13} />{new Date(s.startTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })} – {new Date(s.endTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                            </>
                          )}
                          <span className="flex items-center gap-1.5"><UserCheck size={13} />{s.MentorRef?.name || s.MentorRef?.User?.name || "Mentor"}</span>
                        </div>
                        {s.status === "REQUESTED" ? (
                          <p className="text-[12px] text-[#8492a6] mt-2 italic bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 w-fit">
                            Waiting for your mentor to confirm the schedule and provide meeting details.
                          </p>
                        ) : (
                          s.googleMeetLink && (
                            <a href={s.googleMeetLink} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 mt-3 bg-[#1a73e8] text-white px-4 py-2 rounded-[10px] text-[13px] font-bold hover:bg-[#1558b0] transition-colors">
                              <Video size={14} /> Join Meeting
                            </a>
                          )
                        )}
                        {s.notes && (
                          <div className="mt-2 text-[12px] text-[#64748B]">
                            <span className="font-bold text-[#0F172A]">Your Notes:</span> "{s.notes}"
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => cancelSession(s.id)}
                          className="flex items-center gap-1.5 border border-[#E9E6F5] text-[#94A3B8] px-3 py-1.5 rounded-[8px] text-[12px] font-bold hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <XCircle size={12} /> Cancel Request
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Request Form */}
          {sessionTab === "request" && (
            <div className="bg-white rounded-[22px] border border-[#E9E6F5] shadow-sm p-6">
              <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">Request a 1:1 Session</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Session Title</label>
                  <input
                    type="text"
                    value={bookingTitle}
                    onChange={e => setBookingTitle(e.target.value)}
                    className="w-full border border-[#E9E6F5] rounded-[12px] px-4 py-3 text-[14px] font-semibold bg-[#F8FAFC] focus:outline-none focus:border-[#6D3DF5] transition-colors"
                    placeholder="e.g. Weekly Trading Review, Strategy Discussion..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Preferred Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full border border-[#E9E6F5] rounded-[12px] px-4 py-3 text-[14px] font-semibold bg-[#F8FAFC] focus:outline-none focus:border-[#6D3DF5] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Preferred Time</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={e => setSelectedTime(e.target.value)}
                      className="w-full border border-[#E9E6F5] rounded-[12px] px-4 py-3 text-[14px] font-semibold bg-[#F8FAFC] focus:outline-none focus:border-[#6D3DF5] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Notes for Mentor (e.g. topic, questions)</label>
                  <textarea
                    rows={3}
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    placeholder="Describe what you want to focus on in this session (e.g. review my trade logs, psychological blockages)..."
                    className="w-full border border-[#E9E6F5] rounded-[12px] px-4 py-3 text-[13px] font-medium bg-[#F8FAFC] focus:outline-none focus:border-[#6D3DF5] transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={submitSessionRequest}
                  disabled={!selectedDate || booking}
                  className="w-full bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white py-4 rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-md disabled:bg-slate-200 disabled:text-[#94A3B8] disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
                >
                  {booking ? "Submitting Request..." : <><ArrowRight size={18} /> Submit Session Request</>}
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {sessionTab === "history" && (
            <div className="space-y-3">
              {historySessions.length === 0 ? (
                <div className="bg-white rounded-[22px] border border-[#E9E6F5] shadow-sm p-12 text-center">
                  <CheckCircle2 size={36} className="text-[#CBD5E1] mx-auto mb-3" />
                  <p className="font-bold text-[#0F172A]">No past sessions yet</p>
                </div>
              ) : (
                historySessions.map((s: any) => (
                  <div key={s.id} className="bg-white rounded-[20px] border border-[#E9E6F5] shadow-sm p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-[15px] text-[#0F172A]">{s.title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] || 'bg-slate-100 text-slate-700'}`}>{s.status}</span>
                        </div>
                        <p className="text-[13px] text-[#64748B]">
                          {new Date(s.startTime).toLocaleDateString("en-IN")} &bull; {new Date(s.startTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })} – {new Date(s.endTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {s.mentorNotes && (
                          <div className="mt-3 p-3 bg-[#F1ECFF] rounded-[10px] border border-[#E4DEFF]">
                            <p className="text-[11px] font-bold text-[#6D3DF5] mb-1">Mentor Notes</p>
                            <p className="text-[13px] text-[#0F172A] italic">"{s.mentorNotes}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Share Trade Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] border border-[#E9E6F5] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[#E9E6F5] flex justify-between items-center bg-[#F8FAFC]">
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
                  <div className="max-h-48 overflow-y-auto border border-[#E9E6F5] rounded-xl divide-y divide-[#E9E6F5] bg-slate-50">
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
                  className="w-full px-4 py-3 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[13px] font-[500] focus:bg-white focus:border-[#6D3DF5] focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#E9E6F5] flex justify-end gap-3 bg-[#F8FAFC]">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-white border border-[#E9E6F5] text-[#64748B] rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-colors cursor-pointer"
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
