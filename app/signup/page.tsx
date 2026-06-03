"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import toast from "react-hot-toast";
import { Activity, Mail, User, Lock, ArrowRight } from "lucide-react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "46px",
  paddingLeft: "42px",
  paddingRight: "14px",
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: "12px",
  color: "#0F172A",
  fontSize: "12px",
  fontWeight: 700,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s, background-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontSize: "9px",
  fontWeight: 800,
  textTransform: "uppercase",
  color: "#475569",
  letterSpacing: "0.5px",
  display: "block",
  marginBottom: "6px",
  marginLeft: "2px",
};

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "MENTOR">("CLIENT");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      const res = await registerUser(name, email, password, role);
      if (res.success) {
        localStorage.setItem("trade_adhyayan_user", email.trim().toLowerCase());
        toast.success("Account created successfully! 🚀");
        if (role === "MENTOR") {
          router.push("/mentor");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(res.error || "Failed to create account.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 50%, #F8FAFC 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
      fontFamily: "'Quicksand', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Light pink glow */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(233,75,138,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "#ffffff",
        border: "1px solid #E2E8F0",
        borderRadius: "28px",
        padding: "40px 36px",
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.02)",
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
            <span style={{ fontWeight: 900, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", color: "#0F172A" }}>
              Trade Adhyayan
            </span>
          </Link>
          <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 900, color: "#0F172A" }}>Create account</h2>
          <p style={{ margin: 0, fontSize: "10px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            Start tracking your discipline for free
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Your Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                required
                type="text"
                placeholder="Ajay Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#E94B8A";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2E8F0";
                  e.target.style.backgroundColor = "#F8FAFC";
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#E94B8A";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2E8F0";
                  e.target.style.backgroundColor = "#F8FAFC";
                }}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={labelStyle}>I want to register as a</label>
            <div style={{ position: "relative" }}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "CLIENT" | "MENTOR")}
                style={{
                  ...inputStyle,
                  paddingLeft: "14px",
                  cursor: "pointer"
                }}
              >
                <option value="CLIENT">Trader (Client)</option>
                <option value="MENTOR">Mentor (Coach)</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#E94B8A";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2E8F0";
                  e.target.style.backgroundColor = "#F8FAFC";
                }}
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
              background: loading ? "#7A2050" : "linear-gradient(135deg, #E94B8A, #7C4DFF)",
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
              boxShadow: "0 8px 24px rgba(233,75,138,0.2)",
              transition: "opacity 0.2s",
              fontFamily: "inherit",
            }}
          >
            <span>{loading ? "Creating account..." : "Create Free Account"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid #E2E8F0",
          textAlign: "center",
          fontSize: "11px",
          color: "#64748B",
          fontWeight: 600,
        }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#7C4DFF", fontWeight: 800, textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}