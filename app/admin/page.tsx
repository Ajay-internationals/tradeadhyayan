"use client";

import React, { useState, useEffect } from "react";
import "./admin.css";
import { useRouter } from "next/navigation";
import {
  getAdminOverview,
  addMentor,
  assignClientToMentor,
  getAllMentorAgreements,
  getMentorLeaderboard,
  getMentorAudits,
  createMentorAudit,
  getAllSessions,
  sendBroadcastNotification
} from "@/app/actions/trades";
import {
  Users,
  UserPlus,
  ClipboardList,
  ArrowLeft,
  User,
  CheckCircle,
  Plus,
  TrendingUp,
  Sliders,
  DollarSign,
  Briefcase,
  Activity,
  AlertCircle,
  Trophy,
  FileText,
  Calendar,
  Megaphone,
  LogOut
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { loginUser } from "@/app/actions/auth";

export default function AdminArena() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "mentors" | "allocate" | "reviews" | "agreements" | "leaderboard" | "audits" | "sessions" | "broadcast"
  >("mentors");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  // Additional tab states
  const [agreements, setAgreements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Audits Form State
  const [auditForm, setAuditForm] = useState({
    mentorId: "",
    auditType: "REVIEW",
    description: "",
    adminNotes: "",
    severity: "LOW"
  });

  // Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({
    type: "INFO",
    title: "",
    message: "",
    actionUrl: ""
  });

  // Mentor Form State
  const [mentorForm, setMentorForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    designation: "",
    bio: "",
    experience: "",
    specialization: "",
    capacity: 10,
    payoutShare: 40.0
  });

  // Allocation State
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsPageLoading(true);
      const data = await getAdminOverview();
      setAdminData(data);
    } catch (err) {
      console.error("Error loading admin data:", err);
      toast.error("Failed to load admin overview.");
    } finally {
      setIsPageLoading(false);
    }
  };

  const ADMIN_EMAILS = [
    "work.ajayy@gmail.com",
    "ajay.tradeadhyayan@gmail.com",
    "gaurav.tradeadhyayan@gmail.com",
    "admin.ta@gmail.com",
    "ajay@tradeadhyayan.com",
    "gaurav@tradeadhyayan.com",
    "gaurav.jhanwar91@gmail.com"
  ];

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) {
      setIsAuthChecking(false);
      return;
    }
    if (!ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
      setIsAuthChecking(false);
      return;
    }
    setAdminEmail(email);
    setIsAuthenticated(true);
    setIsAuthChecking(false);
    loadData();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter your email and password.");
      return;
    }
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(cleanEmail)) {
      toast.error("Access denied! This email is not authorized for admin access.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await loginUser(cleanEmail, loginPassword);
      if (res.success) {
        localStorage.setItem("trade_adhyayan_user", res.email!.trim().toLowerCase());
        setAdminEmail(res.email!.trim().toLowerCase());
        setIsAuthenticated(true);
        toast.success("Welcome to Admin Arena! 🛡️");
        loadData();
      } else {
        toast.error(res.error || "Incorrect email or password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("trade_adhyayan_user");
    setIsAuthenticated(false);
    setAdminEmail("");
    setLoginEmail("");
    setLoginPassword("");
    toast.success("Signed out successfully.");
  };

  // Load tab-specific data dynamically
  useEffect(() => {
    const fetchTabSpecificData = async () => {
      try {
        setIsTabLoading(true);
        if (activeTab === "agreements") {
          const res = await getAllMentorAgreements();
          setAgreements(res);
        } else if (activeTab === "leaderboard") {
          const res = await getMentorLeaderboard();
          setLeaderboard(res);
        } else if (activeTab === "audits") {
          const res = await getMentorAudits();
          setAudits(res);
        } else if (activeTab === "sessions") {
          const res = await getAllSessions();
          setSessions(res);
        }
      } catch (error) {
        console.error(`Error loading data for tab ${activeTab}:`, error);
        toast.error(`Failed to load ${activeTab} data.`);
      } finally {
        setIsTabLoading(false);
      }
    };

    if (["agreements", "leaderboard", "audits", "sessions"].includes(activeTab)) {
      fetchTabSpecificData();
    }
  }, [activeTab]);

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditForm.mentorId || !auditForm.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      setIsSubmitting(true);
      await createMentorAudit(auditForm);
      toast.success("Audit log created successfully! 🛡️");
      setAuditForm({
        mentorId: "",
        auditType: "REVIEW",
        description: "",
        adminNotes: "",
        severity: "LOW"
      });
      const res = await getMentorAudits();
      setAudits(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to create audit log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error("Please fill in both title and message.");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await sendBroadcastNotification(
        broadcastForm.type,
        broadcastForm.title,
        broadcastForm.message,
        broadcastForm.actionUrl || undefined
      );
      toast.success(`Broadcast sent successfully to ${res.count} active mentors! 📣`);
      setBroadcastForm({
        type: "INFO",
        title: "",
        message: "",
        actionUrl: ""
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to send broadcast.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMentorFormChange = (key: string, val: any) => {
    setMentorForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await addMentor(mentorForm);
      toast.success("Mentor registered successfully! 🎓");
      // Reset Form
      setMentorForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        designation: "",
        bio: "",
        experience: "",
        specialization: "",
        capacity: 10,
        payoutShare: 40.0
      });
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to register mentor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedMentorId) {
      toast.error("Please select both a client and a mentor.");
      return;
    }
    try {
      setIsSubmitting(true);
      await assignClientToMentor(selectedClientId, selectedMentorId);
      toast.success("Client allocated successfully! 🤝");
      setSelectedClientId("");
      setSelectedMentorId("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to allocate client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A0E1A 0%, #1a1f35 50%, #0A0E1A 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        <Toaster position="top-right" />
        <div style={{
          position: "absolute", top: "15%", right: "10%",
          width: "280px", height: "280px",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", left: "10%",
          width: "220px", height: "220px",
          background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{
          width: "100%", maxWidth: "400px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "40px 36px",
          backdropFilter: "blur(24px)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          position: "relative", zIndex: 1,
        }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "56px", height: "56px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: "18px" }}>TA</span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800, color: "#fff" }}>Admin Arena</h1>
            <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
              Restricted access — authorized personnel only
            </p>
          </div>

          <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Admin Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@tradeadhyayan.com"
                required
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "11px 14px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "11px 14px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                width: "100%",
                padding: "12px",
                background: isLoggingIn ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #a855f7)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: isLoggingIn ? "not-allowed" : "pointer",
                boxShadow: isLoggingIn ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
                marginTop: "4px",
              }}
            >
              {isLoggingIn ? "Verifying Access..." : "Access Admin Arena"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
            Only authorized Trade Adhyayan team members can access this area.
          </p>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-extrabold text-lg select-none">TA</span>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-slate-900 text-[13px] tracking-wider leading-none block uppercase">
                ADMIN ARENA
              </span>
              <span className="text-[9px] font-bold text-slate-500 block mt-1 tracking-tight">
                Mentorship Management
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {[
              { id: "mentors", label: "Mentor Management", icon: Users },
              { id: "allocate", label: "Client Allocation", icon: UserPlus },
              { id: "reviews", label: "Review Requests", icon: ClipboardList },
              { id: "agreements", label: "Agreements Log", icon: FileText },
              { id: "leaderboard", label: "Leaderboard", icon: Trophy },
              { id: "audits", label: "Audit & Breaches", icon: AlertCircle },
              { id: "sessions", label: "Platform Sessions", icon: Calendar },
              { id: "broadcast", label: "Broadcaster", icon: Megaphone }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <IconComp size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-2">
          <button
            onClick={() => router.push("/mentor")}
            className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer border border-transparent"
          >
            <User size={16} />
            <span>Mentor Arena</span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer border border-transparent"
          >
            <ArrowLeft size={16} />
            <span>Trader Arena</span>
          </button>

          {/* Admin user info + logout */}
          <div className="flex items-center gap-3 border-t border-slate-200 pt-3 mt-1">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <User size={14} className="text-indigo-600" />
            </div>
            <div className="text-left overflow-hidden flex-1">
              <span className="text-[10px] font-black text-slate-800 block truncate">
                {adminEmail.split("@")[0]}
              </span>
              <span className="text-[8px] text-slate-500 font-bold block truncate">
                {adminEmail}
              </span>
            </div>
            <button
              onClick={handleAdminLogout}
              title="Sign Out"
              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <LogOut size={13} className="text-rose-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-8 text-left">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { label: "Total Mentors", val: adminData?.mentors?.length || 0, color: "text-slate-900", tab: "mentors" },
              { label: "Unassigned Clients", val: adminData?.unassignedClients?.length || 0, color: "text-amber-600", tab: "allocate" },
              { label: "Review Requests", val: adminData?.reviewRequests?.length || 0, color: "text-indigo-600", tab: "reviews" },
              { label: "Pending Reviews", val: adminData?.reviewRequests?.filter((r: any) => r.status === "PENDING").length || 0, color: "text-rose-600", tab: "reviews" }
            ].map((stat) => (
              <div 
                key={stat.label} 
                onClick={() => setActiveTab(stat.tab as any)}
                className="p-5 bg-white border border-slate-200 rounded-[24px] shadow-sm space-y-1 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                <span className={`text-2xl font-black block ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>

          {/* TAB 1: MENTOR MANAGEMENT */}
          {activeTab === "mentors" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Mentors List */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Registered Mentors</h3>
                {adminData?.mentors?.length > 0 ? (
                  <div className="space-y-4">
                    {adminData.mentors.map((mentor: any) => (
                      <div
                        key={mentor.id}
                        onClick={() => router.push(`/admin/mentor/${mentor.id}`)}
                        className="p-5 bg-slate-50/50 border border-slate-100 hover:border-indigo-200 cursor-pointer rounded-[20px] flex flex-col sm:flex-row justify-between gap-4 text-xs transition-all"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{mentor.name}</h4>
                            <span className="px-2 py-0.5 text-[8px] font-black bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider border border-indigo-100">
                              {mentor.status}
                            </span>
                          </div>
                          <p className="text-slate-500 font-semibold">{mentor.email}</p>
                          <p className="text-slate-600 font-semibold max-w-lg leading-relaxed">
                            "{mentor.bio || "No bio added."}"
                          </p>
                          <div className="flex flex-wrap gap-4 pt-1 text-[9px] font-bold text-slate-500">
                            <div>
                              <span className="text-slate-400">Specialization: </span>
                              {mentor.specialization || "General"}
                            </div>
                            <div>
                              <span className="text-slate-400">Experience: </span>
                              {mentor.experience || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right flex flex-col justify-between items-start sm:items-end shrink-0 gap-2">
                          <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl text-center space-y-1 w-28">
                            <span className="text-[7px] text-slate-500 font-black uppercase tracking-wider block">Allocation</span>
                            <span className="text-xs font-black text-indigo-600 block">
                              {mentor.activeClientsCount} / {mentor.capacity}
                            </span>
                          </div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
                            Payout Share: {mentor.payoutShare}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-semibold text-center py-12">
                    No mentors registered yet.
                  </p>
                )}
              </div>

              {/* Registered Admins List */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm mt-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Registered Admins</h3>
                {adminData?.admins?.length > 0 ? (
                  <div className="space-y-4">
                    {adminData.admins.map((admin: any) => (
                      <div
                        key={admin.id}
                        onClick={() => router.push(`/admin/admin/${admin.id}`)}
                        className="p-5 bg-slate-50/50 border border-slate-100 hover:border-indigo-200 cursor-pointer rounded-[20px] flex justify-between items-center gap-4 text-xs transition-all"
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-900">{admin.name}</h4>
                          <p className="text-slate-500 font-semibold">{admin.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 text-[8px] font-black bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider border border-indigo-100">
                            {admin.role}
                          </span>
                          <span className="text-[8px] font-black text-slate-400 block mt-1 uppercase">
                            Added {new Date(admin.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-semibold text-center py-12">
                    No admins registered yet.
                  </p>
                )}
              </div>

              {/* Add Mentor Form */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Register Mentor</h3>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">Register a coach to assign clients</p>
                </div>

                <form onSubmit={handleAddMentor} className="space-y-4">
                  {[
                    { key: "name", label: "Full Name", placeholder: "e.g. Ajay Sharma", type: "text", required: true },
                    { key: "email", label: "Email Address", placeholder: "e.g. ajay@example.com", type: "email", required: true },
                    { key: "password", label: "Mentor Password (Credentials)", placeholder: "e.g. Mentor@123", type: "password", required: true },
                    { key: "phone", label: "Phone Number", placeholder: "e.g. +91 9988776655", type: "text", required: false },
                    { key: "designation", label: "Designation", placeholder: "e.g. Options Buying Specialist", type: "text", required: false },
                    { key: "specialization", label: "Specialization", placeholder: "e.g. F&O Intraday", type: "text", required: false },
                    { key: "experience", label: "Experience", placeholder: "e.g. 7 Years", type: "text", required: false },
                    { key: "capacity", label: "Client Capacity Limit", placeholder: "10", type: "number", required: true },
                    { key: "payoutShare", label: "Payout Share (%)", placeholder: "40.0", type: "number", required: true }
                  ].map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={(mentorForm as any)[field.key]}
                        onChange={(e) => handleMentorFormChange(field.key, e.target.type === "number" ? parseFloat(e.target.value) : e.target.value)}
                        className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-bold text-slate-800 focus:outline-none transition-all"
                      />
                    </div>
                  ))}

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Bio / Profile Info</label>
                    <textarea
                      rows={3}
                      placeholder="Mentor background details..."
                      value={mentorForm.bio}
                      onChange={(e) => handleMentorFormChange("bio", e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors disabled:bg-slate-200 cursor-pointer flex items-center justify-center border-0 shadow-sm"
                  >
                    {isSubmitting ? "Registering..." : "Add Mentor Profile"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT ALLOCATION PANEL */}
          {activeTab === "allocate" && (
            <div className="max-w-2xl bg-white border border-slate-200 rounded-[24px] p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Client Allocation Panel</h3>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">Assign unallocated traders to verified mentorship coaches</p>
              </div>

              <form onSubmit={handleAllocate} className="space-y-5">
                {/* Select Client */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                    Select Unassigned Client ({adminData?.unassignedClients?.length || 0} unassigned)
                  </label>
                  <select
                    required
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-bold text-slate-800 focus:outline-none transition-all"
                  >
                    <option value="">-- Choose Client --</option>
                    {adminData?.unassignedClients?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Mentor */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                    Select Mentor Coach (Capacity limits checked)
                  </label>
                  <select
                    required
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs font-bold text-slate-800 focus:outline-none transition-all"
                  >
                    <option value="">-- Choose Mentor --</option>
                    {adminData?.mentors?.map((m: any) => {
                      const isFull = m.activeClientsCount >= m.capacity;
                      return (
                        <option key={m.id} value={m.id} disabled={isFull}>
                          {m.name} - Specialization: {m.specialization || "General"} ({m.activeClientsCount} / {m.capacity} Active) {isFull ? "[LIMIT REACHED]" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || adminData?.unassignedClients?.length === 0}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:bg-slate-200 cursor-pointer flex items-center justify-center border-0 shadow-sm"
                >
                  {isSubmitting ? "Allocating..." : "Confirm Allocation Setup"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SYSTEM REVIEW REQUESTS */}
          {activeTab === "reviews" && (
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Mentorship Review Log Feed</h3>
              {adminData?.reviewRequests?.length > 0 ? (
                <div className="space-y-4">
                  {adminData.reviewRequests.map((req: any) => (
                    <div
                      key={req.id}
                      className="p-5 bg-slate-50/50 border border-slate-100 rounded-[20px] flex flex-col sm:flex-row justify-between items-start gap-4 text-xs font-bold"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-slate-400 uppercase tracking-wider">Request ID: {req.id}</span>
                          <span
                            className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-wider border ${
                              req.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900">
                          Client: {req.Client.name} • Mentor: {req.Mentor.name}
                        </h4>
                        <p className="text-slate-600 font-semibold max-w-xl">
                          Trader's Notes: "{req.clientNotes || "No notes."}"
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0 space-y-1">
                        <span className="text-[8px] font-black text-slate-500 block uppercase">
                          Submitted on {new Date(req.submittedAt).toLocaleDateString()}
                        </span>
                        {req.completedAt && (
                          <span className="text-[8px] font-black text-emerald-600 block uppercase">
                            Evaluated on {new Date(req.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold text-center py-12">
                  No review requests submitted in the system yet.
                </p>
              )}
            </div>
          )}

          {/* TAB 4: AGREEMENTS LOG */}
          {activeTab === "agreements" && (
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Digital Agreements Log</h3>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">List of legal acceptance records for active and pending mentors</p>
                </div>
              </div>
              {isTabLoading ? (
                <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : agreements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase">
                        <th className="py-3 px-4">Mentor</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Version</th>
                        <th className="py-3 px-4">Accepted At</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreements.map((agree) => (
                        <tr key={agree.id} className="border-b border-slate-50 hover:bg-slate-50/50 font-bold text-slate-700">
                          <td className="py-4 px-4">
                            <div className="font-black text-slate-900">{agree.Mentor?.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{agree.Mentor?.email}</div>
                          </td>
                          <td className="py-4 px-4">{agree.Mentor?.category}</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                              {agree.version}
                            </span>
                          </td>
                          <td className="py-4 px-4">{new Date(agree.acceptedAt).toLocaleString()}</td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-[10px]">{agree.ipAddress || "N/A"}</td>
                          <td className="py-4 px-4 text-slate-400 font-normal text-[10px] truncate max-w-[200px]" title={agree.userAgent}>
                            {agree.userAgent || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold text-center py-12">No mentor agreements accepted yet.</p>
              )}
            </div>
          )}

          {/* TAB 5: LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Mentor Performance Leaderboard</h3>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">Rankings based on rating, client count, reviews completed, quality score, and SLA adherence</p>
              </div>
              {isTabLoading ? (
                <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-5 bg-slate-50/50 border border-slate-100 rounded-[20px] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{m.name}</h4>
                          <div className="text-[10px] text-slate-500 font-semibold">{m.email} • <span className="text-indigo-600">{m.category}</span></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center sm:text-right w-full sm:w-auto">
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                          <span className="text-[7px] text-slate-400 font-black uppercase block">Score</span>
                          <span className="text-xs font-black text-slate-900">{m.rankScore.toFixed(1)}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                          <span className="text-[7px] text-slate-400 font-black uppercase block">Rating</span>
                          <span className="text-xs font-black text-amber-500">⭐ {m.avgRating.toFixed(1)}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                          <span className="text-[7px] text-slate-400 font-black uppercase block">Reviews</span>
                          <span className="text-xs font-black text-indigo-600">{m.totalReviews}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                          <span className="text-[7px] text-slate-400 font-black uppercase block">Quality</span>
                          <span className="text-xs font-black text-emerald-600">{m.qualityScore}%</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                          <span className="text-[7px] text-slate-400 font-black uppercase block">SLA Breach</span>
                          <span className={`text-xs font-black ${m.slaBreachCount > 0 ? "text-rose-600" : "text-slate-400"}`}>
                            {m.slaBreachCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold text-center py-12">No active mentors found for leaderboard.</p>
              )}
            </div>
          )}

          {/* TAB 6: AUDITS */}
          {activeTab === "audits" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Audits Feed */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Mentor Audit Logs</h3>
                {isTabLoading ? (
                  <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : audits.length > 0 ? (
                  <div className="space-y-4">
                    {audits.map((audit) => (
                      <div
                        key={audit.id}
                        className="p-5 bg-slate-50/50 border border-slate-100 rounded-[20px] text-xs font-bold space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] text-slate-400 tracking-wider">Audit ID: {audit.id}</span>
                              <span
                                className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-wider border ${
                                  audit.severity === "HIGH"
                                    ? "bg-rose-50 text-rose-700 border-rose-100"
                                    : audit.severity === "MEDIUM"
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {audit.severity} Severity
                              </span>
                              <span className="px-2 py-0.5 text-[8px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full uppercase tracking-wider">
                                {audit.auditType}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900">Mentor: {audit.Mentor?.name}</h4>
                          </div>
                          <span className="text-[8px] font-black text-slate-500 uppercase">{new Date(audit.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700 font-semibold leading-relaxed">"{audit.description}"</p>
                        {audit.adminNotes && (
                          <div className="p-3 bg-white border border-slate-100 rounded-xl">
                            <span className="text-[7px] text-indigo-500 font-black uppercase tracking-wider block mb-1">Admin Resolution Notes</span>
                            <p className="text-slate-600 font-semibold">{audit.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-semibold text-center py-12">No audit logs recorded yet.</p>
                )}
              </div>

              {/* Create Audit Form */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Record Audit Event</h3>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">File complaints, breaches, or performance audits</p>
                </div>
                <form onSubmit={handleCreateAudit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Select Mentor</label>
                    <select
                      required
                      value={auditForm.mentorId}
                      onChange={(e) => setAuditForm({ ...auditForm, mentorId: e.target.value })}
                      className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="">-- Choose Mentor --</option>
                      {adminData?.mentors?.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Audit Type</label>
                    <select
                      value={auditForm.auditType}
                      onChange={(e) => setAuditForm({ ...auditForm, auditType: e.target.value })}
                      className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="REVIEW">REVIEW</option>
                      <option value="COMPLAINT">COMPLAINT</option>
                      <option value="SLA_BREACH">SLA BREACH</option>
                      <option value="QUALITY_CHECK">QUALITY CHECK</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Severity</label>
                    <select
                      value={auditForm.severity}
                      onChange={(e) => setAuditForm({ ...auditForm, severity: e.target.value })}
                      className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Description (Required)</label>
                    <textarea
                      required
                      rows={3}
                      value={auditForm.description}
                      onChange={(e) => setAuditForm({ ...auditForm, description: e.target.value })}
                      placeholder="Describe the complaint or audit details..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Resolution / Admin Notes</label>
                    <textarea
                      rows={2}
                      value={auditForm.adminNotes}
                      onChange={(e) => setAuditForm({ ...auditForm, adminNotes: e.target.value })}
                      placeholder="Optional actions taken or recommendations..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors disabled:bg-slate-200 cursor-pointer flex items-center justify-center border-0"
                  >
                    {isSubmitting ? "Saving..." : "Record Audit Event"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: PLATFORM SESSIONS */}
          {activeTab === "sessions" && (
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">All Scheduled Sessions</h3>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">Global scheduled sessions between clients and mentors across the platform</p>
              </div>
              {isTabLoading ? (
                <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : sessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase">
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Mentor</th>
                        <th className="py-3 px-4">Session Type</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((sess) => (
                        <tr key={sess.id} className="border-b border-slate-50 hover:bg-slate-50/50 font-bold text-slate-700">
                          <td className="py-4 px-4">
                            <div className="font-black text-slate-900">{sess.Client?.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{sess.Client?.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-black text-slate-900">{sess.Mentor?.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{sess.Mentor?.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[9px] uppercase tracking-wider">
                              {sess.sessionType}
                            </span>
                          </td>
                          <td className="py-4 px-4">{new Date(sess.scheduledAt).toLocaleString()}</td>
                          <td className="py-4 px-4 text-slate-500">{sess.durationMins} mins</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-wider border ${
                                sess.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : sess.status === "CANCELLED"
                                  ? "bg-rose-50 text-rose-700 border-rose-100"
                                  : "bg-amber-50 text-amber-700 border-amber-100"
                              }`}
                            >
                              {sess.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold text-center py-12">No sessions scheduled on the platform.</p>
              )}
            </div>
          )}

          {/* TAB 8: BROADCASTER */}
          {activeTab === "broadcast" && (
            <div className="max-w-2xl bg-white border border-slate-200 rounded-[24px] p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Broadcaster Portal</h3>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">Send a global real-time notification to all active coaching mentors</p>
              </div>
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Notification Type</label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                    className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="INFO">INFO (General announcement)</option>
                    <option value="ALERT">ALERT (Important/Critical warning)</option>
                    <option value="PAYOUT">PAYOUT (Commission and earnings update)</option>
                    <option value="SESSION">SESSION (Schedule requirements update)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Title (Required)</label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="e.g. Month-End Payouts Processed"
                    className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Message Content (Required)</label>
                  <textarea
                    required
                    rows={4}
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    placeholder="Type details to send to all coaches..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Action URL (Optional)</label>
                  <input
                    type="text"
                    value={broadcastForm.actionUrl}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, actionUrl: e.target.value })}
                    placeholder="e.g. /mentor/payouts"
                    className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:bg-slate-200 cursor-pointer flex items-center justify-center border-0 shadow-sm"
                >
                  {isSubmitting ? "Sending Announcement..." : "Broadcast to Active Mentors"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
