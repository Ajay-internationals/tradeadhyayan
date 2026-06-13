"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar, Clock, Video, Plus, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Link2, FileText, UserCheck, AlertCircle,
  Wifi, Settings, CalendarDays
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUS_COLORS: Record<string, string> = {
  UPCOMING:    "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-700",
  RESCHEDULED: "bg-yellow-100 text-yellow-700",
  NO_SHOW:     "bg-gray-100 text-gray-600",
};

function fmt(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function MentorSessionsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [tab, setTab] = useState<"sessions" | "availability" | "calendar" | "settings">("sessions");
  
  const [sessions, setSessions] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email) {
        const cached = localStorage.getItem(`ta_cache_mentor_sessions_${email}`);
        if (cached) {
          try { return JSON.parse(cached); } catch {}
        }
      }
    }
    return [];
  });

  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email) {
        const cached = localStorage.getItem(`ta_cache_mentor_slots_${email}`);
        if (cached) {
          try { return JSON.parse(cached); } catch {}
        }
      }
    }
    return [];
  });

  const [calendarConnected, setCalendarConnected] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email) {
        const cached = localStorage.getItem(`ta_cache_mentor_calendar_connected_${email}`);
        if (cached) {
          return cached === "true";
        }
      }
    }
    return false;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("trade_adhyayan_user");
      if (email && localStorage.getItem(`ta_cache_mentor_sessions_${email}`)) {
        return false;
      }
    }
    return true;
  });

  // Availability form
  const [avForm, setAvForm] = useState({ dayOfWeek: 1, startTime: "18:00", endTime: "21:00", slotSize: 45 });
  const [savingSlot, setSavingSlot] = useState(false);

  // Notes modal
  const [notesModal, setNotesModal] = useState<{ open: boolean; sessionId: string; notes: string }>({ open: false, sessionId: "", notes: "" });

  // Weekly calendar state
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) { router.push("/login"); return; }
    init(email);
  }, [router]);

  async function init(email: string) {
    try {
      const res = await fetch(`/api/mentor/me?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUserId(data.userId);
      setMentorId(data.mentorId);
      await Promise.all([
        loadSessions(data.userId, email),
        loadSlots(data.mentorId, email),
        checkCalendar(data.userId, email),
      ]);
    } catch {
      // Fallback: get userId from localStorage
      const uid = localStorage.getItem("trade_adhyayan_user_id");
      if (uid) setUserId(uid);
    } finally {
      setLoading(false);
    }
  }

  async function loadSessions(uid: string, email?: string) {
    try {
      const res = await fetch("/api/mentorship/sessions", {
        headers: { "x-user-id": uid, "x-user-role": "MENTOR" }
      });
      const data = await res.json();
      const s = data.sessions || [];
      setSessions(s);
      const activeEmail = email || (typeof window !== "undefined" ? localStorage.getItem("trade_adhyayan_user") : null);
      if (activeEmail) {
        localStorage.setItem(`ta_cache_mentor_sessions_${activeEmail}`, JSON.stringify(s));
      }
    } catch {}
  }

  async function loadSlots(mid: string, email?: string) {
    try {
      const res = await fetch(`/api/mentor/availability-slots?mentorId=${mid}`);
      const data = await res.json();
      const s = data.slots || [];
      setAvailabilitySlots(s);
      const activeEmail = email || (typeof window !== "undefined" ? localStorage.getItem("trade_adhyayan_user") : null);
      if (activeEmail) {
        localStorage.setItem(`ta_cache_mentor_slots_${activeEmail}`, JSON.stringify(s));
      }
    } catch {}
  }

  async function checkCalendar(uid: string, email?: string) {
    // Check if Google Calendar connected by trying to fetch connection status
    try {
      const res = await fetch(`/api/google/status?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarConnected(data.connected);
        const activeEmail = email || (typeof window !== "undefined" ? localStorage.getItem("trade_adhyayan_user") : null);
        if (activeEmail) {
          localStorage.setItem(`ta_cache_mentor_calendar_connected_${activeEmail}`, String(data.connected));
        }
      }
    } catch {}
  }

  async function addSlot() {
    if (!userId) return;
    setSavingSlot(true);
    try {
      const res = await fetch("/api/mentor/availability-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify(avForm),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success("Availability slot added!");
      if (mentorId) await loadSlots(mentorId);
    } catch (e: any) {
      toast.error(e.message || "Failed to add slot");
    } finally {
      setSavingSlot(false);
    }
  }

  async function deleteSlot(slotId: string) {
    if (!userId) return;
    try {
      await fetch(`/api/mentor/availability-slots?slotId=${slotId}`, {
        method: "DELETE",
        headers: { "x-user-id": userId }
      });
      toast.success("Slot removed");
      if (mentorId) await loadSlots(mentorId);
    } catch {
      toast.error("Failed to remove slot");
    }
  }

  async function markComplete(sessionId: string, notes: string) {
    if (!userId) return;
    try {
      const res = await fetch(`/api/mentorship/sessions/${sessionId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": userId, "x-user-role": "MENTOR" },
        body: JSON.stringify({ mentorNotes: notes }),
      });
      if (!res.ok) throw new Error();
      toast.success("Session marked as completed ✅");
      setNotesModal({ open: false, sessionId: "", notes: "" });
      await loadSessions(userId);
    } catch {
      toast.error("Failed to mark complete");
    }
  }

  async function markNoShow(sessionId: string) {
    if (!userId) return;
    try {
      await fetch(`/api/mentorship/sessions/${sessionId}/no-show`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": userId, "x-user-role": "MENTOR" },
      });
      toast.success("Marked as No Show");
      await loadSessions(userId);
    } catch {
      toast.error("Failed");
    }
  }

  async function cancelSession(sessionId: string) {
    if (!userId || !confirm("Cancel this session?")) return;
    try {
      await fetch(`/api/mentorship/sessions/${sessionId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": userId, "x-user-role": "MENTOR" },
        body: JSON.stringify({ reason: "Cancelled by mentor" }),
      });
      toast.success("Session cancelled");
      await loadSessions(userId);
    } catch {
      toast.error("Failed");
    }
  }

  // Weekly calendar grid
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const upcoming = sessions.filter(s => s.status === "UPCOMING" || s.status === "RESCHEDULED");
  const past = sessions.filter(s => s.status === "COMPLETED" || s.status === "CANCELLED" || s.status === "NO_SHOW");

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#6D3DF5] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto" style={{ backgroundColor: "#FAFAFF", minHeight: "100vh" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Sessions</h1>
          <p className="text-[#64748B] text-sm font-medium mt-1">Manage your 1:1 mentorship sessions and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          {!calendarConnected && userId && (
            <a
              href={`/api/google/connect?userId=${userId}`}
              className="flex items-center gap-2 bg-white border border-[#E7EAF3] text-[#0F172A] px-4 py-2 rounded-full text-sm font-bold hover:border-[#6D3DF5] transition-colors shadow-sm"
            >
              <Calendar size={16} className="text-[#6D3DF5]" />
              Connect Google Calendar
            </a>
          )}
          {calendarConnected && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
              <CheckCircle2 size={16} />
              Google Calendar Connected
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#E7EAF3] rounded-[14px] p-1 mb-6 w-fit shadow-sm">
        {([
          { id: "sessions", label: "Sessions", icon: Video },
          { id: "calendar", label: "Weekly Calendar", icon: CalendarDays },
          { id: "availability", label: "Set Availability", icon: Clock },
          { id: "settings", label: "Calendar Settings", icon: Settings },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold transition-all ${
              tab === t.id
                ? "bg-[#6D3DF5] text-white shadow-md"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SESSIONS TAB ── */}
      {tab === "sessions" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Upcoming", val: upcoming.length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Completed", val: sessions.filter(s => s.status === "COMPLETED").length, color: "text-green-600", bg: "bg-green-50" },
              { label: "Cancelled", val: sessions.filter(s => s.status === "CANCELLED").length, color: "text-red-500", bg: "bg-red-50" },
              { label: "No Shows", val: sessions.filter(s => s.status === "NO_SHOW").length, color: "text-gray-600", bg: "bg-gray-50" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-[18px] border border-[#E7EAF3] p-5 shadow-sm">
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">{stat.label}</p>
                <h2 className={`text-3xl font-black ${stat.color}`}>{stat.val}</h2>
              </div>
            ))}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-5">Upcoming Sessions</h3>
            {upcoming.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#E7EAF3] rounded-[16px]">
                <Video size={32} className="text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#64748B] font-semibold">No upcoming sessions scheduled</p>
                <p className="text-[#94A3B8] text-sm mt-1">Clients can book sessions from their dashboard</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-4 p-4 rounded-[16px] border border-[#E7EAF3] hover:border-[#6D3DF5] transition-colors bg-[#FAFAFF]">
                    <div className="w-14 h-14 rounded-[14px] bg-[#F1ECFF] flex flex-col items-center justify-center shrink-0 border border-[#E4DEFF]">
                      <span className="text-[11px] font-bold text-[#6D3DF5] uppercase">{new Date(s.startTime).toLocaleDateString("en-IN", { month: "short" })}</span>
                      <span className="text-[22px] font-black text-[#6D3DF5] leading-none">{new Date(s.startTime).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-[#0F172A] text-[15px] truncate">{s.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-[#64748B] font-medium">
                        <span className="flex items-center gap-1"><Clock size={12} />{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</span>
                        <span className="flex items-center gap-1"><UserCheck size={12} />{s.Client?.name || "Client"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.googleMeetLink && (
                        <a href={s.googleMeetLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 bg-[#1a73e8] text-white px-3 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-[#1558b0] transition-colors">
                          <Video size={13} /> Join Meet
                        </a>
                      )}
                      {s.googleCalendarLink && (
                        <a href={s.googleCalendarLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 bg-white border border-[#E7EAF3] text-[#64748B] px-3 py-1.5 rounded-[8px] text-[12px] font-bold hover:border-[#6D3DF5] hover:text-[#6D3DF5] transition-colors">
                          <Link2 size={13} /> Calendar
                        </a>
                      )}
                      <button
                        onClick={() => setNotesModal({ open: true, sessionId: s.id, notes: "" })}
                        className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-green-100 transition-colors">
                        <CheckCircle2 size={13} /> Complete
                      </button>
                      <button
                        onClick={() => markNoShow(s.id)}
                        className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-gray-100 transition-colors">
                        No Show
                      </button>
                      <button
                        onClick={() => cancelSession(s.id)}
                        className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-colors">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Sessions */}
          {past.length > 0 && (
            <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
              <h3 className="font-bold text-[18px] text-[#0F172A] mb-5">Past Sessions</h3>
              <div className="space-y-3">
                {past.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-4 p-4 rounded-[14px] border border-[#E7EAF3] opacity-80">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-[14px] text-[#0F172A] truncate">{s.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                      </div>
                      <p className="text-[12px] text-[#64748B]">{fmtDate(s.startTime)} • {s.Client?.name}</p>
                      {s.mentorNotes && <p className="text-[12px] text-[#6D3DF5] mt-1 italic">"{s.mentorNotes}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WEEKLY CALENDAR TAB ── */}
      {tab === "calendar" && (
        <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[18px] text-[#0F172A]">Weekly Calendar</h3>
            <div className="flex items-center gap-3">
              <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-full border border-[#E7EAF3] hover:bg-slate-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-[13px] font-bold text-[#0F172A]">
                {weekDates[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                {weekDates[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-full border border-[#E7EAF3] hover:bg-slate-50 transition-colors">
                <ChevronRight size={16} />
              </button>
              <button onClick={() => setWeekOffset(0)} className="text-[12px] font-bold text-[#6D3DF5] border border-[#E4DEFF] bg-[#F1ECFF] px-3 py-1.5 rounded-full hover:bg-[#E4DEFF] transition-colors">
                Today
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, i) => {
              const dateStr = date.toISOString().split("T")[0];
              const isToday = date.toDateString() === new Date().toDateString();
              const daySessions = sessions.filter(s => s.startTime?.startsWith(dateStr));
              return (
                <div key={i} className={`min-h-[140px] rounded-[14px] p-3 border ${isToday ? "border-[#6D3DF5] bg-[#FAFAFF]" : "border-[#E7EAF3] bg-white"}`}>
                  <div className="mb-3 text-center">
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? "text-[#6D3DF5]" : "text-[#94A3B8]"}`}>{DAYS[i]}</p>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 ${isToday ? "bg-[#6D3DF5] text-white" : "text-[#0F172A]"}`}>
                      <span className="text-[14px] font-black">{date.getDate()}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {daySessions.map((s: any) => (
                      <div key={s.id} className={`p-2 rounded-[8px] text-[10px] font-bold truncate ${STATUS_COLORS[s.status] || "bg-blue-100 text-blue-700"}`}>
                        {fmtTime(s.startTime)} {s.Client?.name?.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AVAILABILITY TAB ── */}
      {tab === "availability" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Slot Form */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-5">Add Availability Slot</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-[#64748B] block mb-2">Day of Week</label>
                <select
                  value={avForm.dayOfWeek}
                  onChange={e => setAvForm(f => ({ ...f, dayOfWeek: +e.target.value }))}
                  className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[13px] font-semibold bg-[#FAFAFF] focus:outline-none focus:border-[#6D3DF5] transition-colors"
                >
                  {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold text-[#64748B] block mb-2">Start Time</label>
                  <input type="time" value={avForm.startTime}
                    onChange={e => setAvForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[13px] font-semibold bg-[#FAFAFF] focus:outline-none focus:border-[#6D3DF5]" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#64748B] block mb-2">End Time</label>
                  <input type="time" value={avForm.endTime}
                    onChange={e => setAvForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[13px] font-semibold bg-[#FAFAFF] focus:outline-none focus:border-[#6D3DF5]" />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#64748B] block mb-2">Session Duration (minutes)</label>
                <select value={avForm.slotSize}
                  onChange={e => setAvForm(f => ({ ...f, slotSize: +e.target.value }))}
                  className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[13px] font-semibold bg-[#FAFAFF] focus:outline-none focus:border-[#6D3DF5]">
                  {[30, 45, 60, 90].map(m => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </div>
              <button
                onClick={addSlot}
                disabled={savingSlot}
                className="w-full bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white py-3 rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                {savingSlot ? "Adding..." : "Add Availability Slot"}
              </button>
            </div>
          </div>

          {/* Existing Slots */}
          <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-5">Your Availability ({availabilitySlots.length} slots)</h3>
            {availabilitySlots.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#E7EAF3] rounded-[16px]">
                <Clock size={32} className="text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#64748B] font-semibold">No availability set yet</p>
                <p className="text-[#94A3B8] text-sm mt-1">Add slots so clients can book sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availabilitySlots.map((slot: any) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 rounded-[14px] border border-[#E7EAF3] bg-[#FAFAFF] hover:border-[#6D3DF5] transition-colors">
                    <div>
                      <p className="font-bold text-[14px] text-[#0F172A]">{DAY_NAMES[slot.dayOfWeek]}</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5">
                        {slot.startTime} – {slot.endTime} • {slot.slotSize} min slots
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-colors"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === "settings" && (
        <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6 max-w-lg">
          <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">Google Calendar Settings</h3>
          <div className={`flex items-center gap-4 p-5 rounded-[16px] border mb-6 ${calendarConnected ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${calendarConnected ? "bg-green-100" : "bg-orange-100"}`}>
              {calendarConnected ? <CheckCircle2 className="text-green-600" size={24} /> : <AlertCircle className="text-orange-500" size={24} />}
            </div>
            <div>
              <p className="font-bold text-[15px] text-[#0F172A]">{calendarConnected ? "Google Calendar Connected" : "Google Calendar Not Connected"}</p>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {calendarConnected
                  ? "Sessions will auto-create Google Meet links and send calendar invites."
                  : "Connect to auto-generate Google Meet links for sessions."}
              </p>
            </div>
          </div>
          {userId && (
            <a
              href={`/api/google/connect?userId=${userId}`}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-[12px] font-bold text-[14px] transition-all shadow-md ${
                calendarConnected
                  ? "bg-white border-2 border-[#E7EAF3] text-[#64748B] hover:border-[#6D3DF5] hover:text-[#6D3DF5]"
                  : "bg-[#6D3DF5] text-white hover:bg-[#5B3FCC]"
              }`}
            >
              <Wifi size={16} />
              {calendarConnected ? "Reconnect Google Calendar" : "Connect Google Calendar"}
            </a>
          )}
          <div className="mt-6 p-4 bg-[#FAFAFF] rounded-[12px] border border-[#E7EAF3]">
            <p className="text-[12px] font-bold text-[#0F172A] mb-2">How it works</p>
            <ul className="text-[12px] text-[#64748B] space-y-1.5">
              <li>✅ Connect once — tokens auto-refresh</li>
              <li>✅ Every booked session creates a Calendar event</li>
              <li>✅ Google Meet link auto-generated</li>
              <li>✅ Both you and client receive email invite</li>
              <li>✅ Cancellations delete the Calendar event</li>
              <li>✅ Reschedules update the Calendar event time</li>
            </ul>
          </div>
        </div>
      )}

      {/* Complete Session Modal */}
      {notesModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] border border-[#E7EAF3] shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-2">Mark Session Complete</h3>
            <p className="text-[13px] text-[#64748B] mb-5">Add session notes for your client (optional).</p>
            <textarea
              rows={4}
              placeholder="Session went well. We discussed risk management strategies and exit timing..."
              value={notesModal.notes}
              onChange={e => setNotesModal(m => ({ ...m, notes: e.target.value }))}
              className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[13px] font-medium focus:outline-none focus:border-[#6D3DF5] resize-none bg-[#FAFAFF] mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setNotesModal({ open: false, sessionId: "", notes: "" })}
                className="flex-1 py-3 border border-[#E7EAF3] text-[#64748B] rounded-[12px] font-bold text-[13px] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => markComplete(notesModal.sessionId, notesModal.notes)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-[12px] font-bold text-[13px] flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} /> Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
