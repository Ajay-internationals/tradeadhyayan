"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, MessageSquare, BadgeCheck, DollarSign,
  CheckCircle, Users, BarChart2, ClipboardList,
  Calendar, TrendingUp, Star, ArrowRight, ChevronDown,
  Shield, Clock, Award, Zap
} from "lucide-react";

export default function MentorLandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whyCards = [
    {
      icon: BookOpen,
      title: "Review Student Trades",
      desc: "Check trading journals, mistakes, setups, and execution quality of every assigned student.",
      color: "#6366f1",
      bg: "#eef2ff",
    },
    {
      icon: MessageSquare,
      title: "Give Practical Feedback",
      desc: "Help traders understand where they are losing money and discipline — with real, actionable advice.",
      color: "#0891b2",
      bg: "#ecfeff",
    },
    {
      icon: BadgeCheck,
      title: "Build Mentor Brand",
      desc: "Get listed as a verified mentor inside Trade Adhyayan and build authority among serious traders.",
      color: "#7c3aed",
      bg: "#f3e8ff",
    },
    {
      icon: DollarSign,
      title: "Earn Monthly Income",
      desc: "Receive structured payouts based on students assigned, reviews completed, and mentorship plan.",
      color: "#059669",
      bg: "#ecfdf5",
    },
  ];

  const eligibility = [
    "Minimum 3+ years of trading or investing experience",
    "Strong understanding of risk management principles",
    "Ability to review journals and give honest, structured feedback",
    "Clear and professional communication style",
    "No fake profit claims or misleading promises",
    "SEBI rules and ethical communication must be followed",
  ];

  const responsibilities = [
    "Review assigned student journals thoroughly",
    "Identify repeated mistakes and behavioural patterns",
    "Give weekly or monthly structured feedback",
    "Help students improve discipline and process",
    "Suggest process improvements, not guaranteed profits",
    "Attend scheduled review sessions when included",
    "Maintain professional and respectful communication",
  ];

  const dashboardFeatures = [
    {
      icon: Users,
      title: "Student List",
      desc: "View all assigned students with performance status, active plans, and progress overview.",
      color: "#6366f1",
      bg: "#eef2ff",
    },
    {
      icon: ClipboardList,
      title: "Journal Review Panel",
      desc: "Check trades, screenshots, notes, mistakes, and psychology tags for every student.",
      color: "#0891b2",
      bg: "#ecfeff",
    },
    {
      icon: MessageSquare,
      title: "Feedback System",
      desc: "Write structured feedback with action points, discipline scores, and improvement notes.",
      color: "#7c3aed",
      bg: "#f3e8ff",
    },
    {
      icon: BarChart2,
      title: "Performance Insights",
      desc: "See discipline score, risk score, execution score, and mistake patterns in detail.",
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      icon: Calendar,
      title: "Session Management",
      desc: "Track upcoming calls, completed reviews, and pending feedback all in one place.",
      color: "#0f766e",
      bg: "#f0fdfa",
    },
    {
      icon: DollarSign,
      title: "Earnings Dashboard",
      desc: "View monthly earnings, payouts, active students, and payment status transparently.",
      color: "#059669",
      bg: "#ecfdf5",
    },
  ];

  const stats = [
    { value: "10+", label: "Expert Mentors", icon: Award },
    { value: "100+", label: "Active Traders", icon: Users },
    { value: "500+", label: "Trades Reviewed", icon: ClipboardList },
    { value: "4.9★", label: "Avg. Rating", icon: Star },
  ];

  return (
    <div style={{
      fontFamily: "var(--font-quicksand), 'Quicksand', system-ui, sans-serif",
      background: "#f8fafc",
      color: "#0f172a",
      overflowX: "hidden",
    }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "64px",
        padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(99,102,241,0.12)" : "1px solid rgba(255,255,255,0.5)",
        boxShadow: scrolled ? "0 4px 24px rgba(99,102,241,0.08)" : "none",
        transition: "all 0.3s ease",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "13px" }}>TA</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: "15px", color: "#1e1b4b", letterSpacing: "-0.3px" }}>Trade Adhyayan</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/mentor" style={{
            padding: "9px 20px", borderRadius: "10px",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#6366f1", fontWeight: 700, fontSize: "13px",
            textDecoration: "none", background: "rgba(99,102,241,0.05)",
            transition: "all 0.2s",
          }}>
            Sign In
          </Link>
          <button onClick={() => router.push("/mentor")} style={{
            padding: "9px 22px", borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", color: "#fff",
            fontWeight: 800, fontSize: "13px", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            fontFamily: "var(--font-quicksand)",
          }}>
            Apply as Mentor
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        textAlign: "center",
        padding: "140px 24px 80px",
        position: "relative",
        background: "linear-gradient(160deg, #f0f4ff 0%, #fdf4ff 40%, #f0fdfa 100%)",
        overflow: "hidden",
      }}>
        {/* Soft background orbs */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "5%", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(5,150,105,0.04) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          padding: "7px 16px", marginBottom: "24px",
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.18)",
          borderRadius: "100px",
          fontSize: "11px", fontWeight: 800, color: "#6366f1",
          letterSpacing: "0.8px", textTransform: "uppercase",
        }}>
          <Zap size={12} fill="#6366f1" />
          Trade Adhyayan Mentor Program
        </div>

        <h1 style={{
          margin: "0 0 20px",
          fontSize: "clamp(32px, 5.5vw, 64px)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-1.5px",
          color: "#1e1b4b",
          maxWidth: "820px",
        }}>
          Become a Mentor at{" "}
          <span style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Trade Adhyayan
          </span>
        </h1>

        <p style={{
          margin: "0 0 40px",
          fontSize: "clamp(15px, 2vw, 18px)",
          color: "#475569",
          fontWeight: 600,
          maxWidth: "580px",
          lineHeight: 1.7,
        }}>
          Help serious traders improve their discipline, risk management, and trading performance through structured journal reviews and mentorship.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "64px" }}>
          <button onClick={() => router.push("/mentor")} style={{
            padding: "14px 32px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", borderRadius: "12px",
            color: "#fff", fontSize: "15px", fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(99,102,241,0.35)",
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: "var(--font-quicksand)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(99,102,241,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.35)"; }}
          >
            Apply as Mentor <ArrowRight size={16} />
          </button>
          <a href="#benefits" style={{
            padding: "14px 28px",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "12px",
            color: "#6366f1", fontSize: "15px", fontWeight: 700,
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.9)")}
          >
            View Mentor Benefits <ChevronDown size={16} />
          </a>
        </div>

        {/* Dashboard Mockup */}
        <div style={{
          width: "100%", maxWidth: "900px",
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(99,102,241,0.12)",
          borderRadius: "24px",
          padding: "20px",
          boxShadow: "0 24px 80px rgba(99,102,241,0.12), 0 4px 16px rgba(0,0,0,0.06)",
          backdropFilter: "blur(20px)",
          position: "relative", zIndex: 1,
        }}>
          {/* Mockup header bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fca5a5" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fcd34d" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#86efac" }} />
            <span style={{ marginLeft: "12px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px" }}>trade-adhyayan.com/mentor — Mentor Dashboard</span>
          </div>
          {/* Mockup grid */}
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 180px", gap: "12px", minHeight: "200px" }}>
            {/* Sidebar */}
            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: "rgba(99,102,241,0.1)", borderRadius: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#6366f1" }} />
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#6366f1" }}>Student List</span>
              </div>
              {["Journal Review", "Feedback", "Sessions", "Earnings"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#cbd5e1" }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>{item}</span>
                </div>
              ))}
            </div>
            {/* Main content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { label: "Students", val: "8", color: "#6366f1", bg: "#eef2ff" },
                  { label: "Pending Reviews", val: "3", color: "#d97706", bg: "#fffbeb" },
                  { label: "Completed", val: "24", color: "#059669", bg: "#ecfdf5" },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: "10px", padding: "12px", border: `1px solid ${s.color}20` }}>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: s.color, WebkitTextFillColor: s.color }}>{s.val}</div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", WebkitTextFillColor: "#94a3b8" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "14px", flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#374151", marginBottom: "10px" }}>Recent Journal Reviews</div>
                {[
                  { name: "Rahul S.", status: "Pending", score: "–", statusColor: "#d97706", statusBg: "#fffbeb" },
                  { name: "Priya M.", status: "Reviewed", score: "78%", statusColor: "#059669", statusBg: "#ecfdf5" },
                  { name: "Arjun K.", status: "Reviewed", score: "85%", statusColor: "#059669", statusBg: "#ecfdf5" },
                ].map(r => (
                  <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#374151" }}>{r.name}</span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {r.score !== "–" && <span style={{ fontSize: "10px", fontWeight: 800, color: r.statusColor, WebkitTextFillColor: r.statusColor }}>{r.score}</span>}
                      <span style={{ fontSize: "9px", fontWeight: 800, color: r.statusColor, background: r.statusBg, padding: "2px 8px", borderRadius: "100px", WebkitTextFillColor: r.statusColor }}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "linear-gradient(135deg, #eef2ff, #f3e8ff)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(99,102,241,0.15)" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#6366f1", marginBottom: "4px", WebkitTextFillColor: "#6366f1" }}>THIS MONTH</div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#1e1b4b", WebkitTextFillColor: "#1e1b4b" }}>₹18,400</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", WebkitTextFillColor: "#94a3b8" }}>Earnings</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px", flex: 1 }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#374151", marginBottom: "8px" }}>Feedback Panel</div>
                <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, lineHeight: 1.6 }}>
                  Discipline Score: <strong style={{ color: "#6366f1" }}>82%</strong><br />
                  Risk Score: <strong style={{ color: "#059669" }}>76%</strong><br />
                  Execution: <strong style={{ color: "#d97706" }}>71%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginTop: "40px" }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 18px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(99,102,241,0.1)",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}>
                <Icon size={15} color="#6366f1" />
                <span style={{ fontSize: "15px", fontWeight: 900, color: "#1e1b4b", WebkitTextFillColor: "#1e1b4b" }}>{s.value}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", WebkitTextFillColor: "#94a3b8" }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION 2: WHY JOIN ─── */}
      <section id="benefits" style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#6366f1", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", WebkitTextFillColor: "#6366f1" }}>WHY JOIN US</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, margin: "0 0 14px", letterSpacing: "-0.8px", color: "#1e1b4b", lineHeight: 1.2 }}>
              Guide Traders. Build Your Authority.<br />Earn with Your Experience.
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b", fontWeight: 600, maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
              A structured, professional platform built for India's serious trading educators.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {whyCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} style={{
                  padding: "32px 28px",
                  background: "#fff",
                  border: "1px solid #f1f5f9",
                  borderRadius: "20px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.05)"; }}
                >
                  <div style={{ width: "48px", height: "48px", background: card.bg, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                    <Icon size={22} color={card.color} />
                  </div>
                  <h3 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: 800, color: "#1e1b4b" }}>{card.title}</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: 600, lineHeight: 1.65 }}>{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: ELIGIBILITY ─── */}
      <section style={{ padding: "100px 24px", background: "linear-gradient(160deg, #f0f4ff 0%, #fdf4ff 100%)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#7c3aed", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", WebkitTextFillColor: "#7c3aed" }}>ELIGIBILITY</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, margin: "0 0 14px", letterSpacing: "-0.8px", color: "#1e1b4b" }}>
              We Are Looking for Serious Market Practitioners
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b", fontWeight: 600, maxWidth: "420px", margin: "0 auto" }}>
              Mentors at Trade Adhyayan are experienced professionals who lead by example.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "14px" }}>
            {eligibility.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "14px",
                padding: "18px 20px",
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(124,58,237,0.1)",
                borderRadius: "14px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 2px 12px rgba(124,58,237,0.06)",
                transition: "background 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.85)")}
              >
                <div style={{ width: "28px", height: "28px", background: "#f3e8ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle size={15} color="#7c3aed" />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#374151", lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: RESPONSIBILITIES ─── */}
      <section style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#0891b2", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", WebkitTextFillColor: "#0891b2" }}>YOUR ROLE</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.8px", color: "#1e1b4b", lineHeight: 1.2 }}>
              Your Role as a Mentor
            </h2>
            <p style={{ fontSize: "15px", color: "#64748b", fontWeight: 600, lineHeight: 1.7, marginBottom: "28px" }}>
              As a Trade Adhyayan mentor, you bring structure and discipline to a trader's journey. Your consistent feedback is what transforms average traders into consistent ones.
            </p>
            <button onClick={() => router.push("/mentor")} style={{
              padding: "12px 26px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", borderRadius: "11px",
              color: "#fff", fontSize: "14px", fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
              fontFamily: "var(--font-quicksand)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              Apply Now <ArrowRight size={15} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {responsibilities.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "14px 16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <div style={{ width: "22px", height: "22px", background: "#eef2ff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                  <CheckCircle size={13} color="#6366f1" />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: DASHBOARD FEATURES ─── */}
      <section style={{ padding: "100px 24px", background: "linear-gradient(160deg, #f0fdfa 0%, #f0f4ff 100%)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#0f766e", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", WebkitTextFillColor: "#0f766e" }}>MENTOR DASHBOARD</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, margin: "0 0 14px", letterSpacing: "-0.8px", color: "#1e1b4b" }}>
              Everything You Need in One Dashboard
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b", fontWeight: 600, maxWidth: "460px", margin: "0 auto", lineHeight: 1.6 }}>
              A professional workspace built to make mentoring structured, efficient, and rewarding.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
            {dashboardFeatures.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} style={{
                  display: "flex", gap: "16px",
                  padding: "24px",
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  borderRadius: "18px",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.09)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ width: "44px", height: "44px", background: feat.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} color={feat.color} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#1e1b4b" }}>{feat.title}</h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: 600, lineHeight: 1.6 }}>{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{
        padding: "100px 24px",
        background: "#fff",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={{
            width: "68px", height: "68px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 12px 36px rgba(99,102,241,0.35)",
          }}>
            <TrendingUp size={30} color="#fff" />
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-1px", color: "#1e1b4b", lineHeight: 1.15 }}>
            Ready to Help Traders Grow?
          </h2>
          <p style={{ fontSize: "17px", color: "#64748b", fontWeight: 600, marginBottom: "40px", lineHeight: 1.65, maxWidth: "520px", margin: "0 auto 40px" }}>
            Join Trade Adhyayan as a mentor and become part of India's structured trading improvement ecosystem.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/mentor")} style={{
              padding: "15px 36px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", borderRadius: "13px",
              color: "#fff", fontSize: "16px", fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 28px rgba(99,102,241,0.4)",
              fontFamily: "var(--font-quicksand)",
              display: "flex", alignItems: "center", gap: "10px",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(99,102,241,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.4)"; }}
            >
              Apply Now <ArrowRight size={17} />
            </button>
            <Link href="/" style={{
              padding: "15px 28px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "13px",
              color: "#64748b", fontSize: "15px", fontWeight: 700,
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              Back to Home
            </Link>
          </div>
          {/* Trust badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", marginTop: "48px" }}>
            {[
              { icon: Shield, text: "SEBI Compliant" },
              { icon: BadgeCheck, text: "Verified Mentors" },
              { icon: Clock, text: "Structured Process" },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: 700, color: "#94a3b8" }}>
                  <Icon size={15} color="#94a3b8" />
                  {b.text}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: "36px 40px",
        background: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "11px" }}>TA</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: "13px", color: "#64748b" }}>
            © 2025 Trade Adhyayan. All rights reserved.
          </span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {[["Home", "/"], ["Mentor Arena", "/mentor"], ["Login", "/login"], ["Sign Up", "/signup"]].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
