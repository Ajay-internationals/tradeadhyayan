"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import toast from "react-hot-toast";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Instant login - store user and redirect
    localStorage.setItem("trade_adhyayan_user", email.trim().toLowerCase());
    toast.success("Successfully logged in!");
    router.push("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0A0A1A 0%, #0F0A2E 50%, #0A0A1A 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
      fontFamily: "'Quicksand', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Purple glow */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(124,77,255,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "28px",
        padding: "40px 36px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              padding: "8px",
              background: "linear-gradient(135deg, #7C4DFF, #E94B8A)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Activity size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", color: "#E2E8F0" }}>
              Trade Adhyayan
            </span>
          </Link>
          <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 900, color: "#F1F5F9" }}>Welcome back</h2>
          <p style={{ margin: 0, fontSize: "10px", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            Sign in to your trading journal
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", color: "#8C8CA1", letterSpacing: "0.5px", display: "block", marginBottom: "6px", marginLeft: "2px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  height: "46px",
                  paddingLeft: "42px",
                  paddingRight: "14px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#E2E8F0",
                  fontSize: "12px",
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7C4DFF")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", color: "#8C8CA1", letterSpacing: "0.5px", display: "block", marginBottom: "6px", marginLeft: "2px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  height: "46px",
                  paddingLeft: "42px",
                  paddingRight: "14px",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#E2E8F0",
                  fontSize: "12px",
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7C4DFF")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "46px",
              background: loading ? "#4A3080" : "linear-gradient(135deg, #7C4DFF, #5B3FCC)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "4px",
              boxShadow: "0 8px 24px rgba(124,77,255,0.35)",
              transition: "opacity 0.2s",
              fontFamily: "inherit",
            }}
          >
            <span>{loading ? "Signing in..." : "Sign In to Journal"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          textAlign: "center",
          fontSize: "11px",
          color: "#94A3B8",
          fontWeight: 600,
        }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#7C4DFF", fontWeight: 800, textDecoration: "none" }}>
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
}