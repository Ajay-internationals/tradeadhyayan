"use client";

import React, { useState, useEffect } from "react";
import "./mentor.css";
import { useRouter } from "next/navigation";
import {
  getMentorClients,
  getReviewQueue,
  submitMentorshipReview,
  getMentorDashboardData,
  getMentorRatings,
  getMentorKpis,
  getMentorPayoutHistory,
  recalculateMentorKpi,
  getMentorSetupStatus,
  saveMentorProfile,
  saveMentorAvailability,
  getMentorSessions,
  getMentorNotifications,
  markNotificationRead,
  getMentorMessages,
  sendMentorMessage,
  getMentorReviewTemplates,
  getMentorResources,
  updateMentorStatusDetail,
  updateSessionStatus,
  scheduleMentorSession,
} from "@/app/actions/trades";
import { loginUser, registerUser } from "@/app/actions/auth";
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
  BookOpen,
  Shield,
  MessageSquare,
  Bell,
  FileText,
  Video,
  Send,
  Download,
  Award,
  Globe
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function MentorArena() {
  const router = useRouter();
  const [mentorEmail, setMentorEmail] = useState("");
  const [activeSection, setActiveSection] = useState<"queue" | "clients" | "sessions" | "messages" | "profile" | "notifications" | "resources" | "kpi" | "ratings" | "payout">("queue");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any>(null);
  const [ratingsData, setRatingsData] = useState<any[]>([]);
  const [payoutData, setPayoutData] = useState<any[]>([]);

  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // Signup states
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Data states
  const [reviewRequests, setReviewRequests] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // Expanded Mentor Features States
  const [sessions, setSessions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Chat States
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedChatClient, setSelectedChatClient] = useState<any>(null);
  
  // Schedule Session States
  const [schedulingClient, setSchedulingClient] = useState<any>(null);
  const [sessionFormData, setSessionFormData] = useState({
    scheduledAt: "",
    durationMins: 30,
    sessionType: "REVIEW",
    notes: ""
  });

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEditData, setProfileEditData] = useState({
    name: "",
    phone: "",
    profileImage: "",
    bio: "",
    experience: "",
    specialization: "",
    languages: "",
    dateOfBirth: "",
    city: "",
    tradingStyle: "",
    certifications: "",
    linkedIn: "",
    twitter: "",
    youtube: ""
  });

  // Availability Settings States
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [availabilityEditData, setAvailabilityEditData] = useState({
    workingDays: "Mon,Tue,Wed,Thu,Fri",
    startTime: "18:00",
    endTime: "21:00",
    slotDuration: 30,
  });

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
      
      // Setup status checked silently
      try {
        await getMentorSetupStatus(email);
      } catch (err) {
        console.error("Error initializing setup wizard record:", err);
      }

      // 2. Load ONLY initial queue and templates (for default view)
      const [queue, tplList] = await Promise.all([
        getReviewQueue(email),
        getMentorReviewTemplates()
      ]);

      setReviewRequests(queue);
      setTemplates(tplList);

      // Load basic profile info
      try {
        const profile = await getMentorDashboardData(email);
        setMentorProfile(profile);
        if (profile?.MentorKpi) setKpiData(profile.MentorKpi);

        // Initialize edit states
        setProfileEditData({
          name: profile?.name || "",
          phone: profile?.phone || "",
          profileImage: profile?.profileImage || "",
          bio: profile?.bio || "",
          experience: profile?.experience || "3",
          specialization: profile?.specialization || "",
          languages: profile?.languages || "",
          dateOfBirth: profile?.dateOfBirth || "",
          city: profile?.city || "",
          tradingStyle: profile?.tradingStyle || "",
          certifications: profile?.certifications || "",
          linkedIn: profile?.linkedIn || "",
          twitter: profile?.twitter || "",
          youtube: profile?.youtube || ""
        });

        if (profile?.MentorAvailability) {
          setAvailabilityEditData({
            workingDays: profile.MentorAvailability.workingDays,
            startTime: profile.MentorAvailability.startTime,
            endTime: profile.MentorAvailability.endTime,
            slotDuration: profile.MentorAvailability.slotDuration,
          });
        }
      } catch (_) {
        // Mentor profile doesn't exist yet
      }

    } catch (err) {
      console.error("Error loading mentor data:", err);
      toast.error("Failed to load mentor arena data.");
    } finally {
      setIsPageLoading(false);
    }
  };

  // Lazy-load data for active section to optimize page speed
  useEffect(() => {
    if (!mentorEmail) return;

    const fetchSectionData = async () => {
      try {
        if (activeSection === "clients" || activeSection === "messages") {
          const activeClients = await getMentorClients(mentorEmail);
          setClients(activeClients);
        } else if (activeSection === "sessions") {
          const sessList = await getMentorSessions(mentorEmail);
          setSessions(sessList);
        } else if (activeSection === "notifications") {
          const notifList = await getMentorNotifications(mentorEmail);
          setNotifications(notifList);
        } else if (activeSection === "resources") {
          const resList = await getMentorResources();
          setResources(resList);
        } else if (["ratings", "payout", "kpi", "profile"].includes(activeSection)) {
          const profile = await getMentorDashboardData(mentorEmail);
          setMentorProfile(profile);
          if (profile?.MentorKpi) setKpiData(profile.MentorKpi);
          if (profile?.MentorRating) setRatingsData(profile.MentorRating);
          if (profile?.MentorPayout) setPayoutData(profile.MentorPayout);
        }
      } catch (err) {
        console.error(`Error loading section data for ${activeSection}:`, err);
      }
    };

    fetchSectionData();
  }, [activeSection, mentorEmail]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingClient) return;
    try {
      await scheduleMentorSession(mentorEmail, {
        clientId: schedulingClient.id,
        scheduledAt: sessionFormData.scheduledAt,
        durationMins: Number(sessionFormData.durationMins),
        sessionType: sessionFormData.sessionType,
        notes: sessionFormData.notes
      });
      toast.success("Session scheduled successfully! 📅");
      setSchedulingClient(null);
      setSessionFormData({ scheduledAt: "", durationMins: 30, sessionType: "REVIEW", notes: "" });
      await loadData(mentorEmail);
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule session.");
    }
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: string, notes?: string, recordingUrl?: string) => {
    try {
      await updateSessionStatus(sessionId, status, notes, recordingUrl);
      toast.success(`Session marked as ${status.toLowerCase()}! 🏆`);
      await loadData(mentorEmail);
    } catch (err: any) {
      toast.error(err.message || "Failed to update session.");
    }
  };

  const handleSelectChatClient = async (client: any) => {
    setSelectedChatClient(client);
    try {
      const msgs = await getMentorMessages(mentorEmail, client.id, "MENTOR");
      setChatMessages(msgs);
    } catch (err) {
      console.error("Error loading chat messages:", err);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatClient || !chatInput.trim()) return;
    try {
      await sendMentorMessage(mentorEmail, selectedChatClient.id, "MENTOR", chatInput.trim());
      setChatInput("");
      const msgs = await getMentorMessages(mentorEmail, selectedChatClient.id, "MENTOR");
      setChatMessages(msgs);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveMentorProfile(mentorEmail, profileEditData);
      toast.success("Profile updated successfully! ✨");
      setIsEditingProfile(false);
      await loadData(mentorEmail);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    }
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveMentorAvailability(mentorEmail, availabilityEditData);
      toast.success("Availability updated successfully! ⏰");
      setIsEditingAvailability(false);
      await loadData(mentorEmail);
    } catch (err: any) {
      toast.error(err.message || "Failed to update availability.");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateMentorStatusDetail(mentorEmail, status);
      toast.success(`Active status changed to ${status}! 🟢`);
      await loadData(mentorEmail);
    } catch (err: any) {
      toast.error(err.message || "Failed to change status.");
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await loadData(mentorEmail);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) {
      // Show sign-in screen inline instead of redirecting
      setIsAuthChecking(false);
      return;
    }
    setIsAuthenticated(true);
    setIsAuthChecking(false);
    setMentorEmail(email);
    loadData(email);
  }, []);

  const handleMentorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter your email and password.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await loginUser(loginEmail.trim().toLowerCase(), loginPassword);
      if (res.success) {
        if (res.role !== "MENTOR" && res.role !== "ADMIN") {
          toast.error("Access denied. This portal is for mentors only.");
          return;
        }
        localStorage.setItem("trade_adhyayan_user", res.email!.trim().toLowerCase());
        setMentorEmail(res.email!.trim().toLowerCase());
        setIsAuthenticated(true);
        toast.success("Welcome back, Mentor! 🏆");
        loadData(res.email!.trim().toLowerCase());
      } else {
        toast.error(res.error || "Incorrect email or password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMentorLogout = () => {
    localStorage.removeItem("trade_adhyayan_user");
    setIsAuthenticated(false);
    setMentorEmail("");
    setLoginEmail("");
    setLoginPassword("");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirm("");
    toast.success("Signed out successfully.");
  };

  const handleMentorSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (signupPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsSigningUp(true);
    try {
      const res = await registerUser(signupName.trim(), signupEmail.trim().toLowerCase(), signupPassword, "MENTOR");
      if (res.success) {
        localStorage.setItem("trade_adhyayan_user", res.email!.trim().toLowerCase());
        toast.success("Account created! Let's set up your profile 🎉");
        router.push("/mentor/setup");
      } else {
        toast.error(res.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Signup failed. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

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

  // Still checking auth from localStorage
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in / sign-up screen if not authenticated
  if (!isAuthenticated) {
    const inputStyle: React.CSSProperties = {
      width: "100%", boxSizing: "border-box",
      padding: "12px 16px",
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "14px",
      fontFamily: "var(--font-quicksand), 'Quicksand', system-ui, sans-serif",
      fontWeight: 600,
      outline: "none",
      transition: "border-color 0.2s",
    };
    const labelStyle: React.CSSProperties = {
      display: "block", fontSize: "10px", fontWeight: 800,
      color: "rgba(255,255,255,0.55)", marginBottom: "6px",
      textTransform: "uppercase", letterSpacing: "1px",
      fontFamily: "var(--font-quicksand), 'Quicksand', system-ui, sans-serif",
    };
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        fontFamily: "var(--font-quicksand), 'Quicksand', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        <Toaster position="top-right" />
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "8%", left: "4%", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "8%", right: "4%", width: "280px", height: "280px", background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: authMode === "signup" ? "460px" : "420px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "28px",
          padding: "36px 36px 32px",
          backdropFilter: "blur(24px)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
          position: "relative", zIndex: 1,
          transition: "max-width 0.3s ease",
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              width: "58px", height: "58px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
            }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: "20px", fontFamily: "var(--font-quicksand)" }}>TA</span>
            </div>
            <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 900, color: "#fff", fontFamily: "var(--font-quicksand)" }}>Mentor Arena</h1>
            <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 600, fontFamily: "var(--font-quicksand)" }}>
              {authMode === "signin" ? "Sign in to your mentor dashboard" : "Create your mentor account"}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.07)",
            borderRadius: "14px", padding: "4px", marginBottom: "24px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {(["signin", "signup"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAuthMode(mode)}
                style={{
                  flex: 1, padding: "9px",
                  borderRadius: "10px",
                  border: "none",
                  background: authMode === mode ? "rgba(99,102,241,0.85)" : "transparent",
                  color: authMode === mode ? "#fff" : "rgba(255,255,255,0.45)",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  fontFamily: "var(--font-quicksand), 'Quicksand', system-ui, sans-serif",
                  boxShadow: authMode === mode ? "0 2px 8px rgba(99,102,241,0.4)" : "none",
                }}
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* SIGN IN FORM */}
          {authMode === "signin" && (
            <form onSubmit={handleMentorLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com" required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.8)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")} />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.8)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")} />
              </div>
              <button type="submit" disabled={isLoggingIn} style={{
                width: "100%", padding: "13px",
                background: isLoggingIn ? "rgba(99,102,241,0.45)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: "12px", color: "#fff",
                fontSize: "14px", fontWeight: 800,
                fontFamily: "var(--font-quicksand), 'Quicksand', system-ui, sans-serif",
                cursor: isLoggingIn ? "not-allowed" : "pointer",
                boxShadow: isLoggingIn ? "none" : "0 4px 20px rgba(99,102,241,0.45)",
                marginTop: "4px", letterSpacing: "0.3px",
              }}>
                {isLoggingIn ? "Signing in..." : "Sign In →"}
              </button>
              <p style={{ textAlign: "center", margin: "4px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 600, fontFamily: "var(--font-quicksand)" }}>
                Don&apos;t have an account?{" "}
                <span onClick={() => setAuthMode("signup")} style={{ color: "rgba(139,92,246,0.9)", cursor: "pointer", textDecoration: "underline" }}>Create one</span>
              </p>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === "signup" && (
            <form onSubmit={handleMentorSignup} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Your full name" required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.8)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")} />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="your@email.com" required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.8)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min. 8 chars" required style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.8)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm</label>
                  <input type="password" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)}
                    placeholder="Repeat password" required style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.8)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")} />
                </div>
              </div>
              <div style={{ padding: "10px 14px", background: "rgba(99,102,241,0.1)", borderRadius: "10px", border: "1px solid rgba(99,102,241,0.2)" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.55)", fontWeight: 600, lineHeight: 1.5, fontFamily: "var(--font-quicksand)" }}>
                  ℹ️ After creating your account, you'll complete a profile setup wizard to get started as a mentor.
                </p>
              </div>
              <button type="submit" disabled={isSigningUp} style={{
                width: "100%", padding: "13px",
                background: isSigningUp ? "rgba(99,102,241,0.45)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: "12px", color: "#fff",
                fontSize: "14px", fontWeight: 800,
                fontFamily: "var(--font-quicksand), 'Quicksand', system-ui, sans-serif",
                cursor: isSigningUp ? "not-allowed" : "pointer",
                boxShadow: isSigningUp ? "none" : "0 4px 20px rgba(99,102,241,0.45)",
                letterSpacing: "0.3px",
              }}>
                {isSigningUp ? "Creating Account..." : "Create Account & Setup Profile →"}
              </button>
              <p style={{ textAlign: "center", margin: "2px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 600, fontFamily: "var(--font-quicksand)" }}>
                Already have an account?{" "}
                <span onClick={() => setAuthMode("signin")} style={{ color: "rgba(139,92,246,0.9)", cursor: "pointer", textDecoration: "underline" }}>Sign in</span>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Loading Mentor Arena...</p>
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
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <span className="text-white font-extrabold text-lg select-none">TA</span>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-slate-900 text-[13px] tracking-wider leading-none block uppercase">
                MENTOR ARENA
              </span>
              <span className="text-[9px] font-bold text-slate-500 block mt-1 tracking-tight">
                Review & Coach Traders
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveSection("queue"); setSelectedRequest(null); setSelectedClient(null); }}
              className={`w-full flex items-center justify-between px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "queue" && !selectedRequest && !selectedClient ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <div className="flex items-center gap-3"><ClipboardList size={16} /><span>Review Queue</span></div>
              {pendingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[9px] flex items-center justify-center">{pendingRequests.length}</span>
              )}
            </button>

            <button
              onClick={() => { setActiveSection("clients"); setSelectedRequest(null); setSelectedClient(null); }}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "clients" && !selectedClient ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <Users size={16} /><span>My Clients</span>
            </button>

            <button
              onClick={() => { setActiveSection("sessions"); setSelectedRequest(null); setSelectedClient(null); }}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "sessions" ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <Video size={16} /><span>Sessions</span>
            </button>

            <button
              onClick={() => { setActiveSection("messages"); setSelectedRequest(null); setSelectedClient(null); }}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "messages" ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <MessageSquare size={16} /><span>Messages</span>
            </button>

            <button
              onClick={() => { setActiveSection("notifications"); setSelectedRequest(null); setSelectedClient(null); }}
              className={`w-full flex items-center justify-between px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "notifications" ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <div className="flex items-center gap-3"><Bell size={16} /><span>Notifications</span></div>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveSection("resources"); setSelectedRequest(null); setSelectedClient(null); }}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "resources" ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <FileText size={16} /><span>Resources</span>
            </button>

            <button
              onClick={() => { setActiveSection("profile"); setSelectedRequest(null); setSelectedClient(null); }}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "profile" ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <User size={16} /><span>My Profile</span>
            </button>

            <div className="pt-2 pb-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider ml-4">Performance</span>
            </div>

            <button onClick={() => setActiveSection("kpi")}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "kpi" ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <TrendingUp size={16} /><span>My KPIs</span>
            </button>

            <button onClick={() => setActiveSection("ratings")}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "ratings" ? "bg-amber-55 text-amber-700 border border-amber-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <Activity size={16} /><span>My Ratings</span>
            </button>

            <button onClick={() => setActiveSection("payout")}
              className={`w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === "payout" ? "bg-purple-50 text-purple-700 border border-purple-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <BookOpen size={16} /><span>My Payout</span>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/mentor/setup")}
            className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold text-indigo-600 hover:text-indigo-750 hover:bg-indigo-50/50 transition-all cursor-pointer border border-transparent"
          >
            <Sliders size={16} />
            <span>Profile Setup Wizard</span>
          </button>

          <button
            onClick={() => router.push("/admin")}
            className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer border border-transparent"
          >
            <Shield size={16} />
            <span>Admin Arena</span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer border border-transparent"
          >
            <ArrowLeft size={16} />
            <span>Trader Arena</span>
          </button>

          <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <User size={14} className="text-slate-500" />
            </div>
            <div className="text-left overflow-hidden flex-1">
              <span className="text-[10px] font-black text-slate-800 block truncate">
                {mentorEmail.split("@")[0]}
              </span>
              <span className="text-[8px] text-slate-500 font-bold block truncate">
                {mentorEmail}
              </span>
            </div>
            <button
              onClick={handleMentorLogout}
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
        {/* REVIEW REQUEST DETAIL DRAWER/PAGE */}
        {selectedRequest ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Review Builder
                </h2>
                <p className="text-[9px] text-slate-500 font-bold">
                  Evaluating {selectedRequest.Client.name} ({selectedRequest.Client.email})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Client Submission Details */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 text-left">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
                    Client notes & Questions
                  </span>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold leading-relaxed text-slate-700">
                    "{selectedRequest.clientNotes || "No notes added by trader."}"
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-wider block">
                      Discipline Rating
                    </span>
                    <span className="text-sm font-black text-indigo-600 mt-1 block">
                      {selectedRequest.disciplineRating} / 10
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-wider block">
                      Submitted Date
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 mt-1.5 block">
                      {new Date(selectedRequest.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">
                    Trades selected for review ({selectedRequest.selectedTradeIds.length})
                  </span>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedRequest.selectedTradeIds.map((id: string) => (
                      <div
                        key={id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs"
                      >
                        <span className="font-bold text-slate-700">{id}</span>
                        <span className="text-[9px] font-semibold text-slate-400">Manual Entry</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Evaluation Sheet Form */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Mentor Scorecard
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-0.5">
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
                      <div key={s.key} className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] font-black uppercase text-slate-500">
                            {s.label}
                          </label>
                          <span className="text-xs font-black text-indigo-600">
                            {(scores as any)[s.key]}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(scores as any)[s.key]}
                          onChange={(e) => handleScoreChange(s.key, parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Feedback Roadmaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                        Key Strengths
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Good stop-loss placement, patience on setups"
                        value={feedback.strengths}
                        onChange={(e) => handleFeedbackChange("strengths", e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                        Improvement Areas
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Early exit on target targets, high brokerage"
                        value={feedback.improvements}
                        onChange={(e) => handleFeedbackChange("improvements", e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                        Mistakes Observed
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Overtrading after 1 PM, revenge trading"
                        value={feedback.mistakesObserved}
                        onChange={(e) => handleFeedbackChange("mistakesObserved", e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                        Action Plan
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Lock terminal by 12 PM, review daily logs"
                        value={feedback.actionPlan}
                        onChange={(e) => handleFeedbackChange("actionPlan", e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                        Next Week Focus
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Reaching minimum 1:2 Risk Reward Ratio"
                        value={feedback.nextWeekFocus}
                        onChange={(e) => handleFeedbackChange("nextWeekFocus", e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-500 ml-1">
                        General Remark
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Great discipline shown overall! Keep it up"
                        value={feedback.mentorRemark}
                        onChange={(e) => handleFeedbackChange("mentorRemark", e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer flex items-center justify-center gap-2"
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
                className="w-8 h-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Trader Inspector
                </h2>
                <p className="text-[9px] text-slate-500 font-bold">
                  Reviewing journal log of {selectedClient.name} ({selectedClient.email})
                </p>
              </div>
            </div>

            {/* Miniature Dashboard / Trades Feed */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-left">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Trading Journal Logs
                </h3>
                {selectedClient.Trade?.length > 0 ? (
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {selectedClient.Trade.map((t: any) => {
                      const isProfit = t.pnl >= 0;
                      return (
                        <div
                          key={t.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs font-bold"
                        >
                          <div className="space-y-1">
                            <span className="text-slate-800 block">{t.symbol}</span>
                            <span className="text-[9px] text-slate-500 font-semibold block">
                              {new Date(t.entryTime).toLocaleDateString([], { month: "short", day: "numeric" })} • {t.setup || "Breakout"}
                            </span>
                          </div>
                          <div className="text-right space-y-1">
                            <span
                              className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase ${
                                t.direction === "LONG" ? "bg-[#15B77A]/10 text-[#15B77A]" : "bg-rose-50 text-rose-600 border border-rose-100"
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
                  <p className="text-xs text-slate-500 font-semibold text-center py-12">
                    No trades logged by this client yet.
                  </p>
                )}
              </div>

              {/* Summary Stats */}
              <div className="md:col-span-5 space-y-6 text-left">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Performance Telemetry
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">
                        Client Capital
                      </span>
                      <span className="text-base font-black text-slate-800 mt-1 block">
                        ₹{(selectedClient.initialCapital || 100000).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">
                        Total Trades Logged
                      </span>
                      <span className="text-base font-black text-slate-800 mt-1 block">
                        {selectedClient.Trade?.length || 0}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">
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
              <h1 className="text-base font-black text-slate-900 uppercase tracking-wider leading-none">
                {activeSection === "queue" ? "Review Queue" : "Assigned Clients"}
              </h1>
              <p className="text-[9px] font-bold text-slate-500 mt-1.5">
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
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={14} className="text-amber-500" />
                    <span>Pending Evaluation ({pendingRequests.length})</span>
                  </h3>

                  {pendingRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">
                                ID: {req.id}
                              </span>
                              <span className="px-2 py-0.5 text-[8px] font-black rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                PENDING
                              </span>
                            </div>
                            <h4 className="font-heading font-black text-slate-900 text-sm">
                              {req.Client.name}
                            </h4>
                            <p className="text-[10px] text-slate-600 font-semibold truncate leading-relaxed">
                              "{req.clientNotes || "No notes added by trader."}"
                            </p>
                          </div>

                          <div className="pt-2 flex justify-between items-center border-t border-slate-100 mt-3">
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
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 font-semibold">
                      🎉 Clean Queue! No pending trader evaluation requests.
                    </div>
                  )}
                </div>

                {/* Completed Reviews */}
                {completedRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle size={14} className="text-[#15B77A]" />
                      <span>Completed Evaluations ({completedRequests.length})</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {completedRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">
                                ID: {req.id}
                              </span>
                              <span className="px-2 py-0.5 text-[8px] font-black rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                COMPLETED
                              </span>
                            </div>
                            <h4 className="font-heading font-black text-slate-900 text-sm">
                              {req.Client.name}
                            </h4>
                            {req.MentorshipReview && (
                              <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                                Score assigned: <span className="text-indigo-600 font-extrabold">{req.MentorshipReview.overallScore.toFixed(1)}/100</span>
                              </p>
                            )}
                          </div>

                          <div className="pt-2 flex justify-between items-center border-t border-slate-100 mt-3">
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
                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <h4 className="font-heading font-black text-slate-900 text-sm">
                            {client.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            {client.email}
                          </p>
                          <div className="flex flex-wrap gap-4 pt-1 text-[9px] font-bold text-slate-500">
                            <div>
                              <span className="text-slate-400 font-bold">Capital: </span>
                              ₹{(client.initialCapital || 100000).toLocaleString()}
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold">Trades: </span>
                              {client.Trade?.length || 0}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between items-center border-t border-slate-100 mt-3">
                          <span className="text-[8px] font-black text-slate-500 uppercase">
                            Assigned on {new Date(client.assignedDate || Date.now()).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="h-8 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Inspect Journal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 font-semibold">
                    👥 You do not have any active clients assigned.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MENTOR SESSIONS SECTION ──────────────────────────────── */}
        {activeSection === "sessions" && (
          <div className="flex-1 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Scheduled Mentorship Sessions</h2>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Conduct video meetings, strategy audits, and emergency reviews.</p>
              </div>
              {clients.length > 0 && (
                <button
                  onClick={() => setSchedulingClient(clients[0])}
                  className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  <Plus size={14} /> Schedule Session
                </button>
              )}
            </div>

            {/* Schedule Modal / Form */}
            {schedulingClient && (
              <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 max-w-xl text-left">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">New Session for {schedulingClient.name}</h3>
                  <button onClick={() => setSchedulingClient(null)} className="text-slate-500 hover:text-slate-800 text-xs font-bold">Cancel</button>
                </div>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500">Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={sessionFormData.scheduledAt}
                        onChange={(e) => setSessionFormData(p => ({ ...p, scheduledAt: e.target.value }))}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500">Duration (Mins)</label>
                      <select
                        value={sessionFormData.durationMins}
                        onChange={(e) => setSessionFormData(p => ({ ...p, durationMins: Number(e.target.value) }))}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold"
                      >
                        <option value="15">15 mins</option>
                        <option value="30">30 mins</option>
                        <option value="45">45 mins</option>
                        <option value="60">60 mins</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500">Session Type</label>
                    <select
                      value={sessionFormData.sessionType}
                      onChange={(e) => setSessionFormData(p => ({ ...p, sessionType: e.target.value }))}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold"
                    >
                      <option value="REVIEW">Weekly Trade Sheet Review</option>
                      <option value="COACHING">1:1 Psychological Coaching</option>
                      <option value="STRATEGY">Market Strategy Alignment</option>
                      <option value="EMERGENCY">Emergency drawdown audit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500">Preparation Notes / Agenda</label>
                    <textarea
                      rows={3}
                      value={sessionFormData.notes}
                      onChange={(e) => setSessionFormData(p => ({ ...p, notes: e.target.value }))}
                      placeholder="What should the trader prepare for this session?"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    Schedule & Notify Trader
                  </button>
                </form>
              </div>
            )}

            {/* Sessions List */}
            <div className="space-y-4 text-left">
              {sessions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {sessions.map((sess) => {
                    const scheduledDate = new Date(sess.scheduledAt);
                    return (
                      <div key={sess.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                              sess.status === "SCHEDULED" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                              sess.status === "CONFIRMED" ? "bg-blue-50 text-blue-600 border-blue-100" :
                              sess.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              "bg-rose-50 text-rose-600 border-rose-100"
                            }`}>
                              {sess.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[8px] font-bold text-slate-600">
                              {sess.sessionType}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">Session with {sess.Client?.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {scheduledDate.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} ({sess.durationMins} mins)
                          </p>
                          {sess.notes && (
                            <p className="text-[10px] text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">Agenda: {sess.notes}</p>
                          )}
                        </div>

                        {/* Session Action Control Panels */}
                        <div className="flex gap-2 w-full sm:w-auto">
                          {sess.status === "SCHEDULED" && (
                            <>
                              <button
                                onClick={() => handleUpdateSessionStatus(sess.id, "CONFIRMED")}
                                className="flex-1 sm:flex-none h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateSessionStatus(sess.id, "CANCELLED")}
                                className="flex-1 sm:flex-none h-8 px-3 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {sess.status === "CONFIRMED" && (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  id={`rec-${sess.id}`}
                                  placeholder="Recording Link (Zoom/GMeet)"
                                  className="h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-900 focus:outline-none w-full sm:w-48"
                                />
                                <button
                                  onClick={() => {
                                    const el = document.getElementById(`rec-${sess.id}`) as HTMLInputElement;
                                    handleUpdateSessionStatus(sess.id, "COMPLETED", "Conducted meeting. Recording linked.", el?.value || "");
                                  }}
                                  className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer shrink-0"
                                >
                                  Mark Complete
                                </button>
                              </div>
                            </div>
                          )}
                          {sess.status === "COMPLETED" && sess.recordingUrl && (
                            <a
                              href={sess.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 h-8 px-3 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 uppercase tracking-wider hover:bg-slate-200 hover:text-slate-800"
                            >
                              <Video size={12} /> Watch Recording
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 font-semibold">
                  📅 No sessions scheduled yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MENTOR MESSAGES SECTION ─────────────────────────────── */}
        {activeSection === "messages" && (
          <div className="flex-1 space-y-6 overflow-y-auto">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Client Messaging Center</h2>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Communicate directly with your assigned students in-app.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch min-h-[500px]">
              {/* Sidebar Clients list */}
              <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 space-y-2 text-left">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2 mb-3">Your Students</h3>
                {clients.length > 0 ? (
                  <div className="space-y-1.5">
                    {clients.map((c) => {
                      const isSelected = selectedChatClient?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectChatClient(c)}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex flex-col cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-extrabold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                          <span className="text-[8px] font-medium text-slate-500 mt-1 block truncate">{c.email}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-bold text-center py-8">No assigned students.</div>
                )}
              </div>

              {/* Chat Window */}
              <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between items-stretch">
                {selectedChatClient ? (
                  <div className="flex flex-col justify-between h-full flex-grow">
                    {/* Chat Header */}
                    <div className="border-b border-slate-200 pb-3 mb-4 flex justify-between items-center text-left">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase">{selectedChatClient.name}</h4>
                        <span className="text-[8px] text-slate-500 font-bold block mt-0.5">{selectedChatClient.email}</span>
                      </div>
                      <button
                        onClick={() => handleSelectChatClient(selectedChatClient)}
                        className="text-[9px] bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 hover:text-slate-800 font-bold cursor-pointer"
                      >
                        Refresh
                      </button>
                    </div>

                    {/* Messages Box */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 max-h-[350px]">
                      {chatMessages.length > 0 ? (
                        chatMessages.map((msg) => {
                          const isMentor = msg.senderType === "MENTOR";
                          return (
                            <div key={msg.id} className={`flex ${isMentor ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] p-3 rounded-2xl text-left border ${
                                isMentor
                                  ? "bg-indigo-600 text-white border-indigo-600 rounded-br-none"
                                  : "bg-slate-100 text-slate-800 border-slate-200 rounded-bl-none"
                              }`}>
                                <p className="text-xs font-semibold leading-relaxed">{msg.content}</p>
                                <span className={`text-[7px] block mt-1.5 text-right ${isMentor ? "text-indigo-200" : "text-slate-500"}`}>
                                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-20 text-[10px] text-slate-400 font-black">
                          💬 Say hello to initiate the workspace chat conversation!
                        </div>
                      )}
                    </div>

                    {/* Chat Composer */}
                    <form onSubmit={handleSendChatMessage} className="flex gap-2 mt-auto">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your message, notes, or instructions..."
                        className="flex-grow h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                      />
                      <button
                        type="submit"
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-grow text-slate-400 space-y-2 py-20">
                    <MessageSquare size={36} className="text-slate-300 animate-pulse" />
                    <p className="text-xs font-bold text-slate-400">Select a student from the sidebar list to view conversation threads.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MENTOR NOTIFICATIONS SECTION ────────────────────────── */}
        {activeSection === "notifications" && (
          <div className="flex-1 space-y-6 overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bell size={16} className="text-indigo-600" /> Notifications Center
                </h2>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Keep updated with reviewer assignments, payouts, and scheduled sessions.</p>
              </div>
            </div>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all ${
                      n.isRead
                        ? "bg-slate-50 border-slate-200 text-slate-500"
                        : "bg-indigo-50/50 border-indigo-100 text-slate-800 shadow-sm"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                        <span className="text-[8px] font-black uppercase text-slate-500">{n.type}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-normal font-semibold">{n.message}</p>
                      <span className="text-[8px] text-slate-400 font-bold block pt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkNotificationRead(n.id)}
                        className="h-7 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold">
                  🔔 No notifications found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MENTOR RESOURCES SECTION ───────────────────────────── */}
        {activeSection === "resources" && (
          <div className="flex-1 space-y-6 overflow-y-auto text-left">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Mentor Resources & SOP Guidelines</h2>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Review guidelines, grading frameworks, standard operating procedures, and templates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div key={res.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between items-start gap-4 animate-fadeIn">
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[8px] font-black uppercase">
                      {res.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{res.title}</h3>
                    <p className="text-xs text-slate-600 leading-normal font-semibold">{res.description}</p>
                  </div>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 h-8 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    <Download size={12} /> View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MENTOR PROFILE SECTION ─────────────────────────────── */}
        {activeSection === "profile" && (
          <div className="flex-1 space-y-6 overflow-y-auto text-left">
            {/* Top Status control widget */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Operational Status</h3>
                <p className="text-[9px] text-slate-500 font-bold">Current state: <span className="text-indigo-600 font-black">{mentorProfile?.statusDetail || "AVAILABLE"}</span></p>
              </div>
              <div className="flex gap-2">
                {[
                  { id: "AVAILABLE", label: "Available", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { id: "BUSY", label: "Busy", cls: "bg-amber-50 text-amber-700 border-amber-200" },
                  { id: "ON_LEAVE", label: "On Leave", cls: "bg-rose-50 text-rose-700 border-rose-200" }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleUpdateStatus(st.id)}
                    className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase border transition-all cursor-pointer ${
                      mentorProfile?.statusDetail === st.id
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Details Sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-sm">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden mx-auto flex items-center justify-center">
                  {mentorProfile?.profileImage ? (
                    <img src={mentorProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{mentorProfile?.name}</h3>
                  <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider block mt-1">
                    {mentorProfile?.category} Mentor
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">{mentorEmail}</span>
                </div>

                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-wider block">Rating</span>
                    <span className="text-sm font-black text-amber-600 mt-1 block">★ {mentorProfile?.averageRating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-wider block">Completed</span>
                    <span className="text-sm font-black text-indigo-600 mt-1 block">{mentorProfile?.totalReviewsCompleted || 0} reviews</span>
                  </div>
                </div>
              </div>

              {/* Detailed profile details & edit fields */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Profile Details</h3>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-[9px] px-3 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg font-black uppercase tracking-wider border border-slate-200 cursor-pointer"
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500">Display Name</label>
                        <input
                          type="text"
                          value={profileEditData.name}
                          onChange={(e) => setProfileEditData(p => ({ ...p, name: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500">Contact Phone</label>
                        <input
                          type="text"
                          value={profileEditData.phone}
                          onChange={(e) => setProfileEditData(p => ({ ...p, phone: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500">Short Bio</label>
                      <textarea
                        rows={3}
                        value={profileEditData.bio}
                        onChange={(e) => setProfileEditData(p => ({ ...p, bio: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500">City</label>
                        <input
                          type="text"
                          value={profileEditData.city}
                          onChange={(e) => setProfileEditData(p => ({ ...p, city: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500">DOB</label>
                        <input
                          type="text"
                          value={profileEditData.dateOfBirth}
                          onChange={(e) => setProfileEditData(p => ({ ...p, dateOfBirth: e.target.value }))}
                          placeholder="DD/MM/YYYY"
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500">Experience</label>
                        <input
                          type="text"
                          value={profileEditData.experience}
                          onChange={(e) => setProfileEditData(p => ({ ...p, experience: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500">LinkedIn URL</label>
                        <input
                          type="text"
                          value={profileEditData.linkedIn}
                          onChange={(e) => setProfileEditData(p => ({ ...p, linkedIn: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-500">Twitter URL</label>
                        <input
                          type="text"
                          value={profileEditData.twitter}
                          onChange={(e) => setProfileEditData(p => ({ ...p, twitter: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Save Profile Info
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 text-xs font-semibold leading-relaxed text-slate-700">
                    <div>
                      <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Professional Bio</span>
                      <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-650 italic">
                        "{mentorProfile?.bio || "No biography details specified. Complete the wizard or edit profile above."}"
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-500 block">City Location</span>
                        <span className="text-slate-900 mt-1 block font-bold">{mentorProfile?.city || "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-500 block">Specialization Segments</span>
                        <span className="text-slate-900 mt-1 block font-bold">{mentorProfile?.specialization || "Not set"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-500 block">Languages Spoken</span>
                        <span className="text-slate-900 mt-1 block font-bold">{mentorProfile?.languages || "English, Hindi"}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-500 block">Date of Birth</span>
                        <span className="text-slate-900 mt-1 block font-bold">{mentorProfile?.dateOfBirth || "Not set"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MY KPIs ──────────────────────────────────────────────── */}
        {activeSection === "kpi" && (
          <div className="flex-1 p-8 space-y-6 overflow-y-auto">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">My KPI Dashboard</h2>
            {kpiData ? (
              <div className="space-y-6 text-left">
                {/* Quality Score */}
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-[24px] text-center space-y-2">
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">Overall Quality Score</span>
                  <span className="text-6xl font-black text-emerald-800">{Math.round(kpiData.qualityScore)}</span>
                  <span className="text-emerald-700 font-bold text-sm">/100</span>
                </div>

                {/* KPI Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Review Completion", val: kpiData.reviewCompletionRate, weight: "30%", color: "bg-indigo-600" },
                    { label: "Client Retention", val: kpiData.clientRetentionRate, weight: "25%", color: "bg-purple-600" },
                    { label: "Client Satisfaction", val: kpiData.clientSatisfaction, weight: "25%", color: "bg-amber-600" },
                    { label: "Session Attendance", val: kpiData.sessionAttendanceRate, weight: "10%", color: "bg-blue-600" },
                  ].map(kpi => (
                    <div key={kpi.label} className="p-4 bg-white border border-slate-200 rounded-[18px] space-y-2 shadow-sm">
                      <div className="flex justify-between text-[9px] font-black text-slate-500">
                        <span>{kpi.label}</span>
                        <span>Weight: {kpi.weight}</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900">{Math.round(kpi.val)}</span>
                        <span className="text-slate-500 font-bold text-sm mb-0.5">/ 100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${kpi.color}`} style={{ width: `${Math.min(kpi.val, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-[18px] space-y-1 shadow-sm">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Revenue Generated (This Month)</span>
                  <span className="text-2xl font-black text-slate-900">₹{kpiData.revenueGenerated.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-2">
                <p className="text-sm text-slate-500 font-bold">No KPI data yet.</p>
                <p className="text-xs text-slate-600">KPIs are calculated once you have active clients and reviews.</p>
              </div>
            )}
          </div>
        )}

        {/* ── MY RATINGS ───────────────────────────────────────────── */}
        {activeSection === "ratings" && (
          <div className="flex-1 p-8 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">My Client Ratings</h2>
              {mentorProfile && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-amber-500 text-lg">★</span>
                  <span className="text-slate-900 font-black text-sm">{(mentorProfile.averageRating ?? 0).toFixed(1)}</span>
                  <span className="text-slate-500 text-[9px] font-bold">avg from {ratingsData.length} ratings</span>
                </div>
              )}
            </div>
            {ratingsData.length > 0 ? (
              <div className="space-y-3 text-left">
                {ratingsData.map((r: any) => (
                  <div key={r.id} className="p-4 bg-white border border-slate-200 rounded-[18px] space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-900">{r.Client?.name ?? "Client"}</p>
                        <p className="text-[8px] font-bold text-slate-500">{r.Client?.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-500 text-sm">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                        <p className="text-[8px] font-bold text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-[8px] font-bold text-slate-500">
                      <span>Helpful: <span className="text-slate-900 font-extrabold">{r.helpfulScore}/5</span></span>
                      <span>Knowledge: <span className="text-slate-900 font-extrabold">{r.knowledgeScore}/5</span></span>
                      <span>Actionable: <span className="text-slate-900 font-extrabold">{r.actionableScore}/5</span></span>
                      <span>Professional: <span className="text-slate-900 font-extrabold">{r.professionalScore}/5</span></span>
                    </div>
                    {r.comment && <p className="text-[9px] text-slate-600 italic">"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-sm text-slate-500 font-bold">No ratings yet.</p>
                <p className="text-xs text-slate-600">Clients rate you after each review or session.</p>
              </div>
            )}
          </div>
        )}

        {/* ── MY PAYOUT ────────────────────────────────────────────── */}
        {activeSection === "payout" && (
          <div className="flex-1 p-8 space-y-6 overflow-y-auto">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">My Payout History</h2>
            {payoutData.length > 0 ? (
              <div className="space-y-4 text-left">
                {payoutData.map((p: any) => (
                  <div key={p.id} className="p-5 bg-white border border-slate-200 rounded-[20px] space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-900">{p.month}</p>
                        <p className="text-[8px] font-bold text-slate-500">{p.activeClients} active clients · {p.reviewsCompleted} reviews</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded-full border ${p.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : p.status === "APPROVED" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{p.status}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Total Revenue", val: `₹${p.totalRevenue.toLocaleString()}`, cls: "text-slate-700" },
                        { label: "Your Share", val: `₹${p.mentorShare.toLocaleString()}`, cls: "text-emerald-750 font-bold" },
                        { label: "Penalty", val: p.penaltyAmount > 0 ? `-₹${p.penaltyAmount.toLocaleString()}` : "—", cls: "text-rose-700" },
                        { label: "Net Payout", val: `₹${p.netPayout.toLocaleString()}`, cls: "text-slate-900 text-lg" },
                      ].map(item => (
                        <div key={item.label} className="p-3 bg-slate-50 border border-slate-200 rounded-[12px] space-y-0.5">
                          <span className="text-[7px] font-black text-slate-500 uppercase block">{item.label}</span>
                          <span className={`font-black ${item.cls}`}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                    {p.slaBreaches > 0 && (
                      <p className="text-[9px] font-bold text-rose-600">⚠ {p.slaBreaches} SLA breach(es) — ₹{p.penaltyAmount.toLocaleString()} deducted</p>
                    )}
                    {p.bonusAmount > 0 && (
                      <p className="text-[9px] font-bold text-amber-700">🎯 Capacity bonus applied: +₹{p.bonusAmount.toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-2">
                <p className="text-sm text-slate-500 font-bold">No payout records yet.</p>
                <p className="text-xs text-slate-600">Payouts are calculated at month-end by the admin.</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
