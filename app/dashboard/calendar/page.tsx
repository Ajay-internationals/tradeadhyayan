"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  Sliders,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Target,
  Shield,
  Trophy,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCalendarEvents,
  addCalendarEvent,
  toggleCalendarEventStatus,
  deleteCalendarEvent,
  CalendarEventData
} from "@/app/actions/calendar";

const CATEGORY_MAP: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  TRADING_PLAN: { label: "Trading Plan", color: "#059669", bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]/50", dot: "bg-[#10B981]" },
  REVIEW: { label: "Review", color: "#D97706", bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]/50", dot: "bg-[#F59E0B]" },
  GOAL: { label: "Goal", color: "#2563EB", bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]/50", dot: "bg-[#3B82F6]" },
  MENTOR: { label: "Mentor", color: "#DB2777", bg: "bg-[#FDF2F8]", border: "border-[#FBCFE8]/50", dot: "bg-[#EC4899]" },
  EVENT: { label: "Event", color: "#4F46E5", bg: "bg-[#EEF2FF]", border: "border-[#C7D2FE]/50", dot: "bg-[#6366F1]" },
  REMINDER: { label: "Reminder", color: "#DC2626", bg: "bg-[#FEF2F2]", border: "border-[#FEE2E2]/50", dot: "bg-[#EF4444]" }
};

export default function CalendarPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"month" | "week" | "agenda">("month");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  
  // Date states (default to current month/year)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("TRADING_PLAN");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("09:00");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("trade_adhyayan_user");
    if (!userEmail) {
      router.push("/login");
      return;
    }
    setEmail(userEmail);
    loadEvents(userEmail);
  }, [router]);

  async function loadEvents(userEmail: string) {
    setLoading(true);
    try {
      const data = await getCalendarEvents(userEmail);
      setEvents(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Event Add
  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newTitle.trim()) return;
    setSubmitting(true);
    try {
      const startDateTimeStr = `${newDate}T${newTime}:00`;
      const res = await addCalendarEvent(email, {
        title: newTitle,
        eventType: newType,
        startTime: startDateTimeStr
      });
      if (res.success) {
        toast.success("Event added successfully!");
        setShowAddModal(false);
        setNewTitle("");
        loadEvents(email);
      } else {
        toast.error(res.error || "Failed to add event");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status (UPCOMING / COMPLETED)
  const handleToggleStatus = async (evt: CalendarEventData) => {
    if (!email) return;
    


    try {
      const res = await toggleCalendarEventStatus(email, evt.id);
      if (res.success) {
        toast.success("Event status updated!");
        loadEvents(email);
      }
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!email) return;
    if (!confirm("Are you sure you want to delete this event?")) return;



    try {
      const res = await deleteCalendarEvent(email, eventId);
      if (res.success) {
        toast.success("Event deleted!");
        loadEvents(email);
      }
    } catch {
      toast.error("Failed to delete event.");
    }
  };

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentMonth(4); // May
    setCurrentYear(2024);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (selectedFilter === "all") return events;
    return events.filter(e => e.eventType === selectedFilter);
  }, [events, selectedFilter]);

  // Calendar dates helper
  const calendarGrid = useMemo(() => {
    // Determine start day of week and days in month
    const startDay = new Date(currentYear, currentMonth, 1).getDay(); // Sunday=0, Monday=1, ...
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    
    const days = [];
    
    // Fill previous month overlap (Apr 2024 start)
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        month: currentMonth === 0 ? 11 : currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear
      });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        month: currentMonth,
        year: currentYear
      });
    }

    // Fill next month overlap (Jun 2024 end)
    const remainingCells = 35 - days.length; // Force A4 print / mockup 35 days layout
    const nextCellsCount = remainingCells > 0 ? remainingCells : (42 - days.length); // fallback if exceeds
    
    for (let i = 1; i <= nextCellsCount; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        month: currentMonth === 11 ? 0 : currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    // filter events in current month
    const currentMonthEvents = events.filter(e => {
      const d = new Date(e.startTime);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const total = currentMonthEvents.length;
    const completed = currentMonthEvents.filter(e => e.status === "COMPLETED").length;
    const upcoming = total - completed;
    const consistency = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, upcoming, consistency };
  }, [events, currentMonth, currentYear]);

  // Upcoming Events list (right sidebar)
  const upcomingEventsSorted = useMemo(() => {
    // Sort upcoming events chronologically
    return events
      .filter(e => e.status === "UPCOMING")
      .slice(0, 4);
  }, [events]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-[#1E1B4B]">
      
      {/* LEFT SECTION - Main Calendar (Col span 3) */}
      <div className="xl:col-span-3 space-y-6">
        
        {/* Category Filters row */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-[22px] border border-[#EEF0F4] shadow-sm">
          {/* Month, Week, Agenda Selector */}
          <div className="flex gap-1 bg-slate-50 border border-[#EEF0F4] rounded-[14px] p-0.5 text-xs font-bold shrink-0">
            {(["month", "week", "agenda"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-[10px] capitalize transition-colors cursor-pointer ${
                  activeTab === t ? "bg-white text-[#6D3DF5] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Color filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all border cursor-pointer ${
                selectedFilter === "all"
                  ? "bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-sm"
                  : "bg-slate-50 text-[#64748B] border-[#EEF0F4] hover:bg-slate-100"
              }`}
            >
              All
            </button>
            {Object.keys(CATEGORY_MAP).map(key => {
              const cat = CATEGORY_MAP[key];
              const isActive = selectedFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFilter(key)}
                  className={`px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-sm"
                      : "bg-slate-50 text-[#64748B] border-[#EEF0F4] hover:bg-slate-100"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : cat.dot}`}></span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar Navigation header */}
        <div className="flex justify-between items-center bg-white px-6 py-4 rounded-[22px] border border-[#EEF0F4] shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToday}
              className="bg-slate-50 border border-[#EEF0F4] hover:bg-slate-100 text-[#475569] font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Today
            </button>
            <div className="flex border border-[#EEF0F4] rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-50 transition-colors cursor-pointer border-r border-[#EEF0F4] text-[#64748B]"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-50 transition-colors cursor-pointer text-[#64748B]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MONTH VIEW GRID ── */}
        {activeTab === "month" && (
          <div className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-sm overflow-hidden text-left">
            {/* Weekdays row */}
            <div className="grid grid-cols-7 border-b border-[#EEF0F4] bg-slate-50 text-center py-3 text-xs font-black text-[#64748B] uppercase tracking-wider">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Days grid cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#EEF0F4] border-l border-[#EEF0F4]">
              {calendarGrid.map((cell, idx) => {
                // Find events on this day
                const dayEvents = filteredEvents.filter(e => {
                  const d = new Date(e.startTime);
                  return (
                    d.getDate() === cell.date &&
                    d.getMonth() === cell.month &&
                    d.getFullYear() === cell.year
                  );
                });

                // Is today
                const isTodayDate =
                  cell.isCurrentMonth &&
                  cell.date === new Date().getDate() &&
                  cell.month === new Date().getMonth() &&
                  cell.year === new Date().getFullYear();

                return (
                  <div
                    key={idx}
                    className={`min-h-[120px] p-3 transition-colors group relative flex flex-col justify-between ${
                      cell.isCurrentMonth ? "bg-white" : "bg-[#F8FAFC]/50 text-[#94A3B8]"
                    } ${isTodayDate ? "bg-[#EFF6FF]" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                          isTodayDate ? "bg-[#2563EB] text-white" : "text-[#475569]"
                        }`}
                      >
                        {cell.date}
                      </span>
                    </div>

                    {/* Scrollable list of day events */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[90px] custom-scrollbar pr-0.5">
                      {dayEvents.map(evt => {
                        const cat = CATEGORY_MAP[evt.eventType] || CATEGORY_MAP.EVENT;
                        const isCompleted = evt.status === "COMPLETED";

                        return (
                          <div
                            key={evt.id}
                            className={`px-2 py-1 rounded-[8px] text-[10px] font-bold border ${cat.bg} ${cat.border} flex flex-col justify-between group/evt transition-all ${
                              isCompleted ? "opacity-60 line-through" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="truncate leading-tight flex-1" style={{ color: cat.color }}>
                                {evt.title}
                              </span>
                              
                              {/* Inline action buttons */}
                              <div className="opacity-0 group-hover/evt:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                                <button
                                  onClick={() => handleToggleStatus(evt)}
                                  className="text-slate-400 hover:text-green-500 cursor-pointer"
                                  title={isCompleted ? "Mark as Upcoming" : "Mark as Completed"}
                                >
                                  <CheckCircle2 size={10} className={isCompleted ? "text-green-500" : ""} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(evt.id)}
                                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                                  title="Delete event"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                            
                            <span className="text-[8px] mt-0.5 text-slate-400">
                              {new Date(evt.startTime).toLocaleTimeString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── WEEK VIEW GRID ── */}
        {activeTab === "week" && (
          <div className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-sm p-6 text-left">
            <h3 className="font-bold text-[16px] mb-4">Weekly Schedule</h3>
            <div className="divide-y divide-slate-100">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, idx) => {
                // Mock filtering for week days
                const dayEvents = filteredEvents.filter(e => {
                  const d = new Date(e.startTime);
                  return d.getDay() === idx && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });

                return (
                  <div key={day} className="py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <span className="w-24 font-bold text-sm text-[#475569]">{day}</span>
                    <div className="flex-1 flex flex-wrap gap-2.5">
                      {dayEvents.map(evt => {
                        const cat = CATEGORY_MAP[evt.eventType] || CATEGORY_MAP.EVENT;
                        return (
                          <div
                            key={evt.id}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border ${cat.bg} ${cat.border} flex items-center gap-3`}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                            <span style={{ color: cat.color }}>{evt.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleToggleStatus(evt)}
                              className="text-slate-300 hover:text-green-500 transition-colors ml-1 cursor-pointer"
                            >
                              <CheckCircle2 size={12} className={evt.status === "COMPLETED" ? "text-green-500" : ""} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(evt.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                      {dayEvents.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No events scheduled</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── AGENDA VIEW LIST ── */}
        {activeTab === "agenda" && (
          <div className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-sm p-6 text-left space-y-4">
            <h3 className="font-bold text-[16px] mb-2">Chronological Agenda</h3>
            <div className="space-y-3">
              {filteredEvents.map(evt => {
                const cat = CATEGORY_MAP[evt.eventType] || CATEGORY_MAP.EVENT;
                const dateObj = new Date(evt.startTime);
                const isCompleted = evt.status === "COMPLETED";

                return (
                  <div
                    key={evt.id}
                    className={`flex items-center justify-between p-4 bg-white border border-[#EEF0F4] rounded-[18px] transition-all hover:border-slate-300 ${
                      isCompleted ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Left Date Box */}
                      <div className="w-12 h-14 bg-slate-50 rounded-xl border border-[#EEF0F4] flex flex-col items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-[#6D3DF5] leading-none">{dateObj.getDate()}</span>
                        <span className="text-[9px] font-semibold text-[#8B5CF6] uppercase mt-0.5">
                          {dateObj.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </div>
                      
                      {/* Event details */}
                      <div>
                        <h4 className={`text-sm font-bold text-[#0F172A] ${isCompleted ? 'line-through' : ''}`}>
                          {evt.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#64748B] font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {dateObj.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span className="flex items-center gap-1.5" style={{ color: cat.color }}>
                            <span className={`w-2 h-2 rounded-full ${cat.dot}`}></span>
                            {cat.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(evt)}
                        className={`p-2 rounded-lg border border-[#EEF0F4] hover:bg-slate-50 transition-colors cursor-pointer ${
                          isCompleted ? "text-green-500 border-green-200 bg-green-50/50" : "text-slate-400"
                        }`}
                        title="Toggle Completion"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-2 rounded-lg border border-[#EEF0F4] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-slate-400 cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredEvents.length === 0 && (
                <p className="text-sm text-center text-[#64748B] py-8">No scheduled activities matching filter.</p>
              )}
            </div>
          </div>
        )}

        {/* Footer Motivation Action bar */}
        <div className="bg-gradient-to-r from-[#F4F6FF] to-[#FAF5FF] border border-[#EEF0F4] rounded-[22px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm text-left">
          <div>
            <h4 className="text-[16px] font-black text-[#111827]">Stay consistent, stay ahead.</h4>
            <p className="text-[12px] font-semibold text-[#64748B] mt-1">Use the calendar to plan, review and reflect on your trading journey.</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0 shrink-0"
          >
            <Plus size={16} />
            <span>Add Activity</span>
          </button>
        </div>

      </div>

      {/* RIGHT SECTION - Sidebar Widgets (Col span 1) */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Mini Calendar picker */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#EEF0F4]">
            <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon size={14} className="text-[#6D3DF5]" />
              <span>{monthNames[currentMonth]} {currentYear}</span>
            </h3>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <ChevronLeft size={14} />
              </button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-wider mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
              <span key={idx}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-bold text-[#475569]">
            {calendarGrid.map((cell, idx) => {
              // check if cell date has events
              const hasEventsOnDay = events.some(e => {
                const d = new Date(e.startTime);
                return d.getDate() === cell.date && d.getMonth() === cell.month && d.getFullYear() === cell.year;
              });

              const isCurrentSelected = cell.date === new Date().getDate() && cell.month === new Date().getMonth() && cell.year === new Date().getFullYear();

              return (
                <div
                  key={idx}
                  className={`py-1.5 rounded-full flex flex-col items-center justify-center relative ${
                    cell.isCurrentMonth ? "text-[#475569]" : "text-[#94A3B8]/50"
                  } ${isCurrentSelected ? 'bg-[#6D3DF5] text-white' : ''}`}
                >
                  <span>{cell.date}</span>
                  {hasEventsOnDay && !isCurrentSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#6D3DF5]"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events widget list */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="pb-3 border-b border-[#EEF0F4] mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider">Upcoming Events</h3>
              <button 
                onClick={() => setActiveTab("agenda")} 
                className="text-[10px] font-bold text-[#6D3DF5] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEventsSorted.map(evt => {
                const cat = CATEGORY_MAP[evt.eventType] || CATEGORY_MAP.EVENT;
                const d = new Date(evt.startTime);

                return (
                  <div key={evt.id} className="flex items-center gap-3 p-2 border border-slate-50 hover:border-slate-200 rounded-xl transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.dot}`}></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0F172A] truncate">{evt.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} &bull; {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {upcomingEventsSorted.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No upcoming scheduled events.</p>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Summary metrics widget cards */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left">
          <div className="pb-3 border-b border-[#EEF0F4] mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider">Calendar Summary <span className="text-[#64748B] capitalize">({monthNames[currentMonth]})</span></h3>
            <Info size={13} className="text-[#6B7280]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Total Activities */}
            <div className="bg-slate-50 border border-[#EEF0F4] rounded-xl p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex justify-between items-start text-slate-400">
                <span className="text-[8px] font-black uppercase tracking-wider">Total Activities</span>
                <Activity size={10} />
              </div>
              <h4 className="text-lg font-black text-[#111827] leading-none mt-2">{metrics.total}</h4>
              <span className="text-[8px] font-semibold text-[#8B5CF6] mt-1.5">Scheduled logs</span>
            </div>

            {/* Completed */}
            <div className="bg-slate-50 border border-[#EEF0F4] rounded-xl p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex justify-between items-start text-[#10B981]">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Completed</span>
                <CheckCircle2 size={10} />
              </div>
              <h4 className="text-lg font-black text-[#111827] leading-none mt-2">{metrics.completed}</h4>
              <span className="text-[8px] font-semibold text-[#10B981] mt-1.5">Activities done</span>
            </div>

            {/* Upcoming */}
            <div className="bg-slate-50 border border-[#EEF0F4] rounded-xl p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex justify-between items-start text-slate-400">
                <span className="text-[8px] font-black uppercase tracking-wider">Upcoming</span>
                <Clock size={10} />
              </div>
              <h4 className="text-lg font-black text-[#111827] leading-none mt-2">{metrics.upcoming}</h4>
              <span className="text-[8px] font-semibold text-slate-400 mt-1.5">Remaining tasks</span>
            </div>

            {/* Consistency */}
            <div className="bg-slate-50 border border-[#EEF0F4] rounded-xl p-3.5 flex flex-col justify-between min-h-[90px]">
              <div className="flex justify-between items-start text-[#F59E0B]">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Consistency</span>
                <Trophy size={10} />
              </div>
              <h4 className="text-lg font-black text-[#111827] leading-none mt-2">{metrics.consistency}%</h4>
              <span className="text-[8px] font-semibold text-[#F59E0B] mt-1.5">Completion score</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── ADD ACTIVITY MODAL DIALOG ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddEventSubmit}
            className="bg-white rounded-[24px] border border-[#E9E6F5] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] text-left animate-scale-up"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E9E6F5] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-[18px] text-[#0F172A]">Add Calendar Activity</h3>
                <p className="text-[#64748B] text-[12px] font-medium mt-0.5">Plan a new event, trading review, or reminder slot.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Activity Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Backtest ORB Strategy, Mentor call..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E9E6F5] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D3DF5] focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#E9E6F5] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D3DF5] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#E9E6F5] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D3DF5] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Category Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#E9E6F5] rounded-xl text-xs font-bold focus:bg-white focus:border-[#6D3DF5] focus:outline-none transition-all cursor-pointer"
                >
                  {Object.keys(CATEGORY_MAP).map(key => (
                    <option key={key} value={key}>
                      {CATEGORY_MAP[key].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#E9E6F5] flex justify-end gap-3 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 bg-white border border-[#E9E6F5] text-[#64748B] rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:bg-slate-200 disabled:text-[#64748B] disabled:shadow-none cursor-pointer"
              >
                {submitting ? "Saving..." : "Save Activity"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
