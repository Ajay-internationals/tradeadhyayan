"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar, Clock, Video, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Link2, UserCheck, AlertCircle,
  CalendarDays, Plus, ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  UPCOMING:    "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-700",
  RESCHEDULED: "bg-yellow-100 text-yellow-700",
  NO_SHOW:     "bg-gray-100 text-gray-600",
};

function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function ClientSessionsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "book" | "history">("upcoming");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking flow
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingTitle, setBookingTitle] = useState("1:1 Mentorship Session");
  const [bookingNotes, setBookingNotes] = useState("");
  const [booking, setBooking] = useState(false);

  // Reschedule modal
  const [rescheduleModal, setRescheduleModal] = useState<{ open: boolean; sessionId: string }>({ open: false, sessionId: "" });
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [rescheduleSlot, setRescheduleSlot] = useState<any>(null);

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) { router.push("/login"); return; }
    init(email);
  }, [router]);

  async function init(email: string) {
    try {
      // Get user id
      const res = await fetch(`/api/mentor/me?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      // For client, get their own userId
      const userRes = await fetch(`/api/user/me?email=${encodeURIComponent(email)}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserId(userData.id);

        // Get assigned mentor
        const assignRes = await fetch(`/api/mentorship/my-mentor?userId=${userData.id}`);
        if (assignRes.ok) {
          const assignData = await assignRes.json();
          setMentorId(assignData.mentorId);
        }

        await loadSessions(userData.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSessions(uid: string) {
    try {
      const res = await fetch("/api/mentorship/sessions", {
        headers: { "x-user-id": uid, "x-user-role": "CLIENT" }
      });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {}
  }

  async function fetchAvailableSlots(date: string, mid: string) {
    setSlotsLoading(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/mentorship/available-slots?mentorId=${mid}&date=${date}`);
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch {
      toast.error("Failed to load slots");
    } finally {
      setSlotsLoading(false);
    }
  }

  async function bookSession() {
    if (!userId || !mentorId || !selectedSlot) return;
    setBooking(true);
    try {
      const res = await fetch("/api/mentorship/book-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({
          mentorId,
          title: bookingTitle,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          notes: bookingNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("🎉 Session booked! Check your email for the Google Meet invite.");
      setTab("upcoming");
      setSelectedSlot(null);
      setSelectedDate("");
      await loadSessions(userId);
    } catch (e: any) {
      toast.error(e.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  async function cancelSession(sessionId: string) {
    if (!userId || !confirm("Cancel this session? You can only cancel 12+ hours before.")) return;
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
      toast.error(e.message || "Failed");
    }
  }

  async function doReschedule() {
    if (!userId || !rescheduleSlot) return;
    try {
      const res = await fetch(`/api/mentorship/sessions/${rescheduleModal.sessionId}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": userId, "x-user-role": "CLIENT" },
        body: JSON.stringify({ startTime: rescheduleSlot.startTime, endTime: rescheduleSlot.endTime }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success("Session rescheduled! Calendar invite updated.");
      setRescheduleModal({ open: false, sessionId: "" });
      await loadSessions(userId);
    } catch (e: any) {
      toast.error(e.message || "Reschedule failed");
    }
  }

  const upcoming = sessions.filter(s => s.status === "UPCOMING" || s.status === "RESCHEDULED");
  const history = sessions.filter(s => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(s.status));

  const today = new Date().toISOString().split("T")[0];

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#6D3DF5] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-6 max-w-[1000px] mx-auto" style={{ backgroundColor: "#FAFAFF", minHeight: "100vh" }}>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">My Sessions</h1>
        <p className="text-[#64748B] text-sm font-medium mt-1">Book and manage 1:1 sessions with your mentor.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#E7EAF3] rounded-[14px] p-1 mb-6 w-fit shadow-sm">
        {([
          { id: "upcoming", label: "Upcoming", icon: CalendarDays },
          { id: "book", label: "Book a Session", icon: Plus },
          { id: "history", label: "History", icon: CheckCircle2 },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold transition-all ${
              tab === t.id ? "bg-[#6D3DF5] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
            }`}
          >
            <t.icon size={15} />
            {t.label}
            {t.id === "upcoming" && upcoming.length > 0 && (
              <span className="bg-white text-[#6D3DF5] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {upcoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── UPCOMING ── */}
      {tab === "upcoming" && (
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-12 text-center">
              <CalendarDays size={40} className="text-[#CBD5E1] mx-auto mb-4" />
              <h3 className="font-bold text-[18px] text-[#0F172A] mb-2">No Upcoming Sessions</h3>
              <p className="text-[#64748B] text-sm mb-6">Book a session with your mentor to get personalised guidance.</p>
              <button
                onClick={() => setTab("book")}
                className="bg-[#6D3DF5] text-white px-6 py-3 rounded-full font-bold text-[14px] flex items-center gap-2 mx-auto hover:bg-[#5B3FCC] transition-colors shadow-md"
              >
                <Plus size={16} /> Book a Session
              </button>
            </div>
          ) : (
            upcoming.map((s: any) => (
              <div key={s.id} className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-5 hover:border-[#6D3DF5] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-[14px] bg-[#F1ECFF] flex flex-col items-center justify-center shrink-0 border border-[#E4DEFF]">
                    <span className="text-[11px] font-bold text-[#6D3DF5] uppercase">{new Date(s.startTime).toLocaleDateString("en-IN", { month: "short" })}</span>
                    <span className="text-[24px] font-black text-[#6D3DF5] leading-none">{new Date(s.startTime).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-[16px] text-[#0F172A]">{s.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#64748B] font-medium">
                      <span className="flex items-center gap-1.5"><Clock size={13} />{fmtDate(s.startTime)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13} />{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</span>
                      <span className="flex items-center gap-1.5"><UserCheck size={13} />{s.MentorRef?.name || s.MentorRef?.User?.name || "Mentor"}</span>
                    </div>
                    {s.googleMeetLink && (
                      <a href={s.googleMeetLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 bg-[#1a73e8] text-white px-4 py-2 rounded-[10px] text-[13px] font-bold hover:bg-[#1558b0] transition-colors">
                        <Video size={14} /> Join Google Meet
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setRescheduleModal({ open: true, sessionId: s.id });
                        setRescheduleDate("");
                        setRescheduleSlots([]);
                        setRescheduleSlot(null);
                      }}
                      className="flex items-center gap-1.5 border border-[#E7EAF3] text-[#64748B] px-3 py-1.5 rounded-[8px] text-[12px] font-bold hover:border-[#6D3DF5] hover:text-[#6D3DF5] hover:bg-[#F1ECFF] transition-colors"
                    >
                      <RefreshCw size={12} /> Reschedule
                    </button>
                    <button
                      onClick={() => cancelSession(s.id)}
                      className="flex items-center gap-1.5 border border-[#E7EAF3] text-[#94A3B8] px-3 py-1.5 rounded-[8px] text-[12px] font-bold hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── BOOK SESSION ── */}
      {tab === "book" && (
        <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-6">
          <h3 className="font-bold text-[18px] text-[#0F172A] mb-6">Book a 1:1 Session</h3>

          {!mentorId ? (
            <div className="py-12 text-center">
              <AlertCircle size={40} className="text-orange-400 mx-auto mb-4" />
              <p className="font-bold text-[#0F172A] mb-2">No Mentor Assigned</p>
              <p className="text-[#64748B] text-sm">Please contact admin to get a mentor assigned before booking.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Title */}
              <div>
                <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Session Title</label>
                <input
                  type="text"
                  value={bookingTitle}
                  onChange={e => setBookingTitle(e.target.value)}
                  className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[14px] font-semibold bg-[#FAFAFF] focus:outline-none focus:border-[#6D3DF5] transition-colors"
                  placeholder="e.g. Trade Review, Risk Management Session..."
                />
              </div>

              {/* Step 2: Pick date */}
              <div>
                <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Select Date</label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) fetchAvailableSlots(e.target.value, mentorId);
                  }}
                  className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[14px] font-semibold bg-[#FAFAFF] focus:outline-none focus:border-[#6D3DF5] transition-colors"
                />
              </div>

              {/* Step 3: Available Slots */}
              {selectedDate && (
                <div>
                  <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-3">
                    Available Slots {slotsLoading ? "(loading...)" : `(${availableSlots.length} slots)`}
                  </label>
                  {slotsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-3 border-[#6D3DF5] border-t-transparent rounded-full" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-[#E7EAF3] rounded-[14px]">
                      <Clock size={28} className="text-[#CBD5E1] mx-auto mb-2" />
                      <p className="text-[#64748B] font-semibold text-sm">No available slots on this date</p>
                      <p className="text-[#94A3B8] text-xs mt-1">Try a different date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map((slot: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-4 rounded-[12px] border-2 font-bold text-[13px] transition-all ${
                            selectedSlot?.startTime === slot.startTime
                              ? "border-[#6D3DF5] bg-[#F1ECFF] text-[#6D3DF5] shadow-md"
                              : "border-[#E7EAF3] text-[#0F172A] hover:border-[#6D3DF5] hover:bg-[#FAFAFF]"
                          }`}
                        >
                          {new Date(slot.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Notes */}
              <div>
                <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">Notes for Mentor (optional)</label>
                <textarea
                  rows={3}
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  placeholder="What would you like to focus on in this session?"
                  className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[13px] font-medium bg-[#FAFAFF] focus:outline-none focus:border-[#6D3DF5] transition-colors resize-none"
                />
              </div>

              {/* Confirm */}
              {selectedSlot && (
                <div className="bg-[#F1ECFF] border border-[#E4DEFF] rounded-[14px] p-4 mb-4">
                  <p className="text-[12px] font-bold text-[#6D3DF5] mb-1">Session Summary</p>
                  <p className="text-[14px] font-black text-[#0F172A]">{bookingTitle}</p>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    {fmtDate(selectedSlot.startTime)} • {fmtTime(selectedSlot.startTime)} – {fmtTime(selectedSlot.endTime)}
                  </p>
                  <p className="text-[12px] text-[#6D3DF5] mt-2 flex items-center gap-1"><Video size={12} /> Google Meet link will be sent via email</p>
                </div>
              )}

              <button
                onClick={bookSession}
                disabled={!selectedSlot || booking}
                className="w-full bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white py-4 rounded-[14px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-md disabled:bg-slate-200 disabled:text-[#94A3B8] disabled:shadow-none disabled:cursor-not-allowed"
              >
                {booking ? "Booking..." : <><ArrowRight size={18} /> Confirm & Book Session</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === "history" && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="bg-white rounded-[18px] border border-[#E7EAF3] shadow-sm p-12 text-center">
              <CheckCircle2 size={36} className="text-[#CBD5E1] mx-auto mb-3" />
              <p className="font-bold text-[#0F172A]">No past sessions yet</p>
            </div>
          ) : history.map((s: any) => (
            <div key={s.id} className="bg-white rounded-[16px] border border-[#E7EAF3] shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-[15px] text-[#0F172A]">{s.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                  </div>
                  <p className="text-[13px] text-[#64748B]">{fmtDate(s.startTime)} • {fmtTime(s.startTime)} – {fmtTime(s.endTime)}</p>
                  {s.mentorNotes && (
                    <div className="mt-3 p-3 bg-[#F1ECFF] rounded-[10px] border border-[#E4DEFF]">
                      <p className="text-[11px] font-bold text-[#6D3DF5] mb-1">Mentor Notes</p>
                      <p className="text-[13px] text-[#0F172A] italic">"{s.mentorNotes}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] border border-[#E7EAF3] shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-[18px] text-[#0F172A] mb-2">Reschedule Session</h3>
            <p className="text-[13px] text-[#64748B] mb-5">Pick a new date and time slot.</p>
            <input
              type="date" min={today} value={rescheduleDate}
              onChange={async e => {
                setRescheduleDate(e.target.value);
                if (e.target.value && mentorId) {
                  setSlotsLoading(true);
                  const res = await fetch(`/api/mentorship/available-slots?mentorId=${mentorId}&date=${e.target.value}`);
                  const data = await res.json();
                  setRescheduleSlots(data.slots || []);
                  setSlotsLoading(false);
                }
              }}
              className="w-full border border-[#E7EAF3] rounded-[12px] px-4 py-3 text-[14px] font-semibold bg-[#FAFAFF] focus:outline-none focus:border-[#6D3DF5] mb-4"
            />
            {rescheduleDate && (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {slotsLoading ? <p className="text-sm text-[#64748B] col-span-3 text-center py-4">Loading...</p>
                  : rescheduleSlots.length === 0 ? <p className="text-sm text-[#64748B] col-span-3 text-center py-4">No slots available</p>
                  : rescheduleSlots.map((slot: any, i: number) => (
                    <button key={i} onClick={() => setRescheduleSlot(slot)}
                      className={`py-2.5 rounded-[10px] border-2 font-bold text-[12px] transition-all ${rescheduleSlot?.startTime === slot.startTime ? "border-[#6D3DF5] bg-[#F1ECFF] text-[#6D3DF5]" : "border-[#E7EAF3] text-[#0F172A] hover:border-[#6D3DF5]"}`}>
                      {new Date(slot.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </button>
                  ))}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setRescheduleModal({ open: false, sessionId: "" })}
                className="flex-1 py-3 border border-[#E7EAF3] text-[#64748B] rounded-[12px] font-bold text-[13px] hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={doReschedule} disabled={!rescheduleSlot}
                className="flex-1 py-3 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-[12px] font-bold text-[13px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <RefreshCw size={14} /> Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
