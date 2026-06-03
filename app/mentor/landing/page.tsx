"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award, TrendingUp, Users, Clock, Shield, Star,
  ChevronRight, CheckCircle, Activity, BookOpen,
  MessageSquare, Video, DollarSign, Zap, Globe,
  ArrowRight, BarChart2, Heart
} from "lucide-react";

export default function MentorLandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: "₹40K+", label: "Avg. Monthly Earnings", icon: DollarSign, color: "#15B77A" },
    { value: "500+", label: "Active Traders", icon: Users, color: "#6366f1" },
    { value: "4.9★", label: "Mentor Rating", icon: Star, color: "#F59E0B" },
    { value: "95%", label: "Trader Retention", icon: Heart, color: "#E94B8A" },
  ];

  const features = [
    {
      icon: BarChart2,
      title: "Review Trader Journals",
      desc: "Access detailed trade logs, evaluate entries/exits, and provide professional scorecard reviews that traders value.",
      color: "#6366f1",
    },
    {
      icon: Video,
      title: "1:1 Coaching Sessions",
      desc: "Schedule and conduct personalized video sessions — strategy reviews, psychology coaching, drawdown audits.",
      color: "#8b5cf6",
    },
    {
      icon: MessageSquare,
      title: "Real-Time Messaging",
      desc: "Stay connected with your mentees via the built-in messaging system. Answer questions, share insights instantly.",
      color: "#06b6d4",
    },
    {
      icon: DollarSign,
      title: "Transparent Payouts",
      desc: "Track your earnings, payout history and KPI performance in a single dashboard. Get paid for every review.",
      color: "#15B77A",
    },
  ];

  const benefits = [
    "Set your own availability and working hours",
    "Earn 40% revenue share on every review",
    "Get clients assigned automatically by Trade Adhyayan",
    "Comprehensive analytics dashboard for your performance",
    "Certification & rank progression (Junior → Senior → Lead → Head)",
    "Access to elite trader community and resources",
    "Full SLA tracking and performance monitoring",
    "Broadcast tools to communicate with all your mentees",
  ];

  const steps = [
    { step: "01", title: "Create Your Account", desc: "Sign up with your email and password in seconds." },
    { step: "02", title: "Complete Setup Wizard", desc: "Fill in your profile, trading expertise, and availability schedule." },
    { step: "03", title: "Accept the Agreement", desc: "Review and sign the mentor agreement to activate your account." },
    { step: "04", title: "Start Earning", desc: "Get clients assigned and begin reviewing journals and conducting sessions." },
  ];

  return (
    <div style={{ fontFamily: "var(--font-quicksand), 'Quicksand', system-ui, sans-serif", background: "#0a0a14", color: "#fff", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 32px",
        height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(10,10,20,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s ease",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
          }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: "14px" }}>TA</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: "14px", color: "#fff", letterSpacing: "0.5px" }}>Trade Adhyayan</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/mentor" style={{
            padding: "9px 20px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
            transition: "all 0.2s",
          }}>
            Sign In
          </Link>
          <button
            onClick={() => router.push("/mentor")}
            style={{
              padding: "9px 20px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}
          >
            Become a Mentor
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        textAlign: "center",
        padding: "120px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* BG blobs */}
        <div style={{ position: "absolute", top: "15%", left: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", left: "40%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(21,183,122,0.06) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "8px 16px",
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "100px",
          marginBottom: "28px",
          fontSize: "12px", fontWeight: 700, color: "rgba(165,140,255,0.9)",
          letterSpacing: "0.5px",
        }}>
          <Zap size={13} />
          MENTOR PROGRAM — EARN WHILE YOU TEACH
        </div>

        <h1 style={{
          margin: "0 0 20px",
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-1px",
          background: "linear-gradient(135deg, #fff 30%, rgba(165,140,255,0.85) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          maxWidth: "800px",
        }}>
          Turn Your Trading Expertise Into a Thriving Career
        </h1>

        <p style={{
          margin: "0 0 40px",
          fontSize: "clamp(15px, 2vw, 19px)",
          color: "rgba(255,255,255,0.55)",
          fontWeight: 600,
          maxWidth: "560px",
          lineHeight: 1.6,
        }}>
          Join Trade Adhyayan's elite mentor program. Review trader journals, coach clients 1:1, and build a sustainable income from your market knowledge.
        </p>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => router.push("/mentor")}
            style={{
              padding: "15px 32px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", borderRadius: "14px",
              color: "#fff", fontSize: "15px", fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(99,102,241,0.45)",
              display: "flex", alignItems: "center", gap: "8px",
              fontFamily: "var(--font-quicksand)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.55)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.45)"; }}
          >
            Start as a Mentor <ArrowRight size={16} />
          </button>
          <a href="#how-it-works" style={{
            padding: "15px 28px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "14px",
            color: "#fff", fontSize: "15px", fontWeight: 700,
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: "8px",
            transition: "background 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.11)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          >
            How it Works <ChevronRight size={16} />
          </a>
        </div>

        {/* Floating stat pills */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: "12px", marginTop: "60px",
        }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 20px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                backdropFilter: "blur(10px)",
              }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${stat.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} color={stat.color} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: "100px 24px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#6366f1", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>WHAT YOU CAN DO</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
              Everything You Need to Coach at Scale
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", fontWeight: 600, maxWidth: "500px", margin: "0 auto" }}>
              A professional-grade platform built specifically for trading mentors.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {features.map((feat, i) => {
              const Icon = feat.icon;
              const isActive = i === activeFeature;
              return (
                <div
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  style={{
                    padding: "28px 24px",
                    background: isActive ? `${feat.color}12` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? feat.color + "35" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "20px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: isActive ? "translateY(-4px)" : "none",
                    boxShadow: isActive ? `0 16px 40px ${feat.color}20` : "none",
                  }}
                >
                  <div style={{
                    width: "44px", height: "44px",
                    background: `${feat.color}20`,
                    borderRadius: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <Icon size={20} color={feat.color} />
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 800, color: "#fff" }}>{feat.title}</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600, lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#8b5cf6", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>GET STARTED IN MINUTES</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>How It Works</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "28px 20px" }}>
                <div style={{
                  width: "52px", height: "52px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "16px", fontWeight: 900, color: "#fff",
                  boxShadow: "0 8px 20px rgba(99,102,241,0.35)",
                }}>
                  {s.step}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 800 }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section style={{ padding: "100px 24px", background: "rgba(99,102,241,0.04)", borderTop: "1px solid rgba(99,102,241,0.1)", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#15B77A", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>WHY JOIN US</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              Built for Serious Trading Professionals
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.55)", fontWeight: 600, lineHeight: 1.7, marginBottom: "28px" }}>
              Trade Adhyayan is India's premier trading journal platform. As a mentor, you tap into a growing ecosystem of dedicated traders who need your expertise.
            </p>
            <button
              onClick={() => router.push("/mentor")}
              style={{
                padding: "13px 28px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: "12px",
                color: "#fff", fontSize: "14px", fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 6px 24px rgba(99,102,241,0.4)",
                fontFamily: "var(--font-quicksand)",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              Apply as Mentor <ArrowRight size={15} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {benefits.map((b, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                transition: "background 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              >
                <CheckCircle size={16} color="#15B77A" style={{ flexShrink: 0, marginTop: "1px" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EARNINGS CALCULATOR SECTION */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, color: "#F59E0B", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>EARN WITH TRADE ADHYAYAN</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
            Your Earnings Potential
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "48px", lineHeight: 1.6 }}>
            With 40% revenue share per review and session, your income scales with your commitment.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "48px" }}>
            {[
              { label: "Starter", clients: "5 clients", reviews: "4 reviews/month", earning: "₹8,000–12,000", color: "#6366f1" },
              { label: "Active", clients: "15 clients", reviews: "12 reviews/month", earning: "₹25,000–35,000", color: "#8b5cf6", highlight: true },
              { label: "Lead", clients: "30+ clients", reviews: "25+ reviews/month", earning: "₹60,000+", color: "#15B77A" },
            ].map((tier, i) => (
              <div key={i} style={{
                padding: "24px 16px",
                background: tier.highlight ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${tier.highlight ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "18px",
                position: "relative",
                boxShadow: tier.highlight ? "0 16px 40px rgba(139,92,246,0.2)" : "none",
              }}>
                {tier.highlight && (
                  <div style={{
                    position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
                    padding: "4px 12px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    borderRadius: "100px",
                    fontSize: "9px", fontWeight: 800, color: "#fff",
                    letterSpacing: "0.8px", textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>Most Popular</div>
                )}
                <h3 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 800, color: tier.color }}>{tier.label}</h3>
                <p style={{ margin: "0 0 4px", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{tier.clients}</p>
                <p style={{ margin: "0 0 12px", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{tier.reviews}</p>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#fff" }}>{tier.earning}</p>
                <p style={{ margin: "2px 0 0", fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>per month</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: "100px 24px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
        borderTop: "1px solid rgba(99,102,241,0.15)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <div style={{
            width: "72px", height: "72px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 12px 40px rgba(99,102,241,0.5)",
          }}>
            <Award size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
            Ready to Start Your Mentor Journey?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", fontWeight: 600, marginBottom: "40px", lineHeight: 1.6 }}>
            Join Trade Adhyayan's growing network of professional trading mentors and help traders achieve their financial goals while building your own income.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/mentor")}
              style={{
                padding: "16px 36px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: "14px",
                color: "#fff", fontSize: "15px", fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
                fontFamily: "var(--font-quicksand)",
                display: "flex", alignItems: "center", gap: "10px",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              Create Mentor Account <ArrowRight size={16} />
            </button>
            <Link href="/mentor" style={{
              padding: "16px 28px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "14px",
              color: "rgba(255,255,255,0.7)", fontSize: "15px", fontWeight: 700,
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              Already a mentor? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "40px 24px",
        background: "rgba(0,0,0,0.4)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: "12px" }}>TA</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Trade Adhyayan</span>
        </div>
        <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
          © 2025 Trade Adhyayan. Empowering traders through expert mentorship.
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "16px" }}>
          <Link href="/" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textDecoration: "none" }}>Home</Link>
          <Link href="/mentor" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textDecoration: "none" }}>Mentor Arena</Link>
          <Link href="/login" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textDecoration: "none" }}>Login</Link>
          <Link href="/signup" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}
