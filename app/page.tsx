"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  Activity, 
  Users, 
  HelpCircle,
  Clock,
  Layers,
  BookOpen,
  Sliders,
  DollarSign,
  TrendingDown,
  Percent,
  Lock,
  ChevronRight,
  ShieldAlert,
  BarChart4
} from "lucide-react";
import { getLandingStats } from "@/app/actions/landing";
import "./landing.css";

export default function Home() {
  // Landing backend stats
  const [stats, setStats] = useState({
    totalTrades: 15420,
    totalUsers: 530,
    avgWinRate: 67.4,
    disciplineScore: 84
  });

  // Load live DB stats on mount
  useEffect(() => {
    async function loadStats() {
      const res = await getLandingStats();
      if (res.success) {
        setStats({
          totalTrades: res.totalTrades,
          totalUsers: res.totalUsers,
          avgWinRate: res.avgWinRate,
          disciplineScore: res.disciplineScore
        });
      }
    }
    loadStats();
  }, []);

  // CTA inputs
  const [heroEmail, setHeroEmail] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");

  // Interactive Mock Dashboard States
  const [mockActiveTab, setMockActiveTab] = useState("Dashboard");
  const [mockTrades, setMockTrades] = useState([
    { date: "14:20 PM", asset: "NIFTY 22400 CE", type: "BUY", pnl: 12450, mood: "Discipline ✓", status: "WIN" },
    { date: "11:05 AM", asset: "RELIANCE", type: "BUY", pnl: -3200, mood: "FOMO Entry ⚠️", status: "LOSS" },
    { date: "Yesterday", asset: "HDFCBANK", type: "SELL", pnl: 8100, mood: "Early Exit ⚠️", status: "WIN" }
  ]);

  // Derived mockup metrics
  const mockTotalTrades = mockTrades.length;
  const mockWinningTrades = mockTrades.filter(t => t.status === "WIN").length;
  const mockWinRate = mockTotalTrades > 0 ? ((mockWinningTrades / mockTotalTrades) * 100).toFixed(1) : "0.0";
  const mockNetPnl = mockTrades.reduce((sum, t) => sum + t.pnl, 0);
  const mockDisciplineScore = mockTotalTrades > 0 
    ? Math.round((mockTrades.filter(t => !t.mood.includes("⚠️")).length / mockTotalTrades) * 100)
    : 100;

  // Add trade from selected broker partner
  const handleBrokerSyncSimulate = (broker: string) => {
    let newTrades: any[] = [];
    if (broker === "Zerodha") {
      newTrades = [
        { date: "Just now", asset: "TCS", type: "BUY", pnl: 7000, mood: "Discipline ✓", status: "WIN" },
        { date: "Just now", asset: "INFY", type: "SELL", pnl: -1500, mood: "Early Exit ⚠️", status: "LOSS" }
      ];
    } else if (broker === "Upstox") {
      newTrades = [
        { date: "Just now", asset: "NIFTY 22500 CE", type: "BUY", pnl: 13500, mood: "Discipline ✓", status: "WIN" },
        { date: "Just now", asset: "BANKNIFTY 48200 PE", type: "BUY", pnl: -4500, mood: "FOMO Entry ⚠️", status: "LOSS" }
      ];
    } else if (broker === "Dhan") {
      newTrades = [
        { date: "Just now", asset: "SBIN", type: "BUY", pnl: 5200, mood: "Discipline ✓", status: "WIN" },
        { date: "Just now", asset: "NIFTY 22600 CE", type: "BUY", pnl: 8800, mood: "Discipline ✓", status: "WIN" }
      ];
    } else { // Angel One
      newTrades = [
        { date: "Just now", asset: "TATASTEEL", type: "BUY", pnl: 2800, mood: "Discipline ✓", status: "WIN" },
        { date: "Just now", asset: "RELIANCE PE", type: "BUY", pnl: -3500, mood: "Revenge ⚠️", status: "LOSS" }
      ];
    }
    
    setMockTrades(prev => [...newTrades, ...prev].slice(0, 5)); // Keep max 5 rows
    alert(`Imported ${newTrades.length} simulated trades from ${broker}! Dashboard analytics updated.`);
  };

  return (
    <div className="landing-body">
      <div className="landing-wrapper">
        
        {/* NAVBAR */}
        <header className="landing-navbar landing-container">
          <div className="nav-logo-group">
            <div className="sidebar-logo-icon">TA</div>
            <span className="sidebar-logo-text" style={{ fontSize: '15px' }}>Trade Adhyayan</span>
          </div>

          <nav className="nav-links">
            <a href="#features" className="nav-item">Features</a>
            <a href="#problems" className="nav-item">Methodology</a>
            <a href="#stats" className="nav-item">Impact</a>
            <a href="#cta" className="nav-item">Pricing</a>
          </nav>

          <div className="nav-ctas">
            <Link href="/login" className="btn-nav-login">Login</Link>
            <Link href="/signup" className="btn-nav-trial">Start Free Trial</Link>
          </div>
        </header>

        {/* HERO SECTION */}
        <main className="landing-container">
          <section className="hero-section">
            
            {/* HERO LEFT COLUMN */}
            <div className="hero-left">
              <div className="hero-badge">
                <Sparkles className="hero-feature-icon" style={{ width: '16px', height: '16px' }} />
                <span>Next-Gen Trading Desk</span>
              </div>

              <h1 className="hero-heading">
                Master Your Mind, <br />
                <span>Scale Your Capital.</span>
              </h1>

              <p className="hero-description">
                The ultimate rule-based trading journal designed for serious Indian traders. Track logs, detect behavioral mistakes, and improve your consistency with instant dashboard analytics.
              </p>

              {/* Feature Icons Row */}
              <div className="hero-feature-row">
                <div className="hero-feature-col">
                  <Activity className="hero-feature-icon" />
                  <h4 className="hero-feature-title">Automatic Sync</h4>
                  <p className="hero-feature-desc">Read-only connection lines with major stockbrokers.</p>
                </div>
                <div className="hero-feature-col">
                  <ShieldCheck className="hero-feature-icon" />
                  <h4 className="hero-feature-title">Discipline Score</h4>
                  <p className="hero-feature-desc">Isolate rule breaches and emotional FOMO entries.</p>
                </div>
                <div className="hero-feature-col">
                  <Zap className="hero-feature-icon" />
                  <h4 className="hero-feature-title">Instant Metrics</h4>
                  <p className="hero-feature-desc">Win rates and growth charts refresh in milliseconds.</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="hero-ctas">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  style={{
                    height: '56px',
                    width: '260px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '0 16px',
                    fontSize: '15px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                />
                <Link 
                  href={`/signup?email=${encodeURIComponent(heroEmail)}`}
                  className="btn-hero-primary"
                >
                  Start Free <ArrowRight className="hero-feature-icon" style={{ color: '#fff' }} />
                </Link>
              </div>

              {/* Social Proof */}
              <div className="hero-social-proof">
                <div className="avatar-group">
                  <img className="proof-avatar" src="https://i.pravatar.cc/100?u=user-1" alt="Avatar" />
                  <img className="proof-avatar" src="https://i.pravatar.cc/100?u=user-2" alt="Avatar" />
                  <img className="proof-avatar" src="https://i.pravatar.cc/100?u=user-3" alt="Avatar" />
                  <img className="proof-avatar" src="https://i.pravatar.cc/100?u=user-4" alt="Avatar" />
                </div>
                <span className="social-proof-text">
                  Joined by <span>5,000+ serious traders</span> in India.
                </span>
              </div>

              {/* Disclaimer Card */}
              <div className="hero-disclaimer-card">
                <div className="disclaimer-icon-wrapper">
                  <ShieldAlert style={{ width: '20px', height: '20px' }} />
                </div>
                <p className="disclaimer-text">
                  <strong>SEBI Compliance Alert:</strong> Investment in securities market are subject to market risks. Past performance is not indicative of future results.
                </p>
              </div>
            </div>

            {/* HERO RIGHT COLUMN (Mockup Dashboard) */}
            <div className="hero-right">
              <div className="dashboard-mockup">
                
                {/* Side Nav Mockup */}
                <div className="mockup-sidebar">
                  <div>
                    <div className="sidebar-logo">
                      <div className="sidebar-logo-icon">TA</div>
                      <span className="sidebar-logo-text">Adhyayan</span>
                    </div>

                    <div className="sidebar-menu">
                      {["Dashboard", "Trade Journal", "Mistakes", "Strategies", "Settings"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setMockActiveTab(tab)}
                          className={`sidebar-item ${mockActiveTab === tab ? "active" : ""}`}
                          style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                        >
                          {tab === "Dashboard" && <Activity size={16} />}
                          {tab === "Trade Journal" && <BookOpen size={16} />}
                          {tab === "Mistakes" && <AlertTriangle size={16} />}
                          {tab === "Strategies" && <Layers size={16} />}
                          {tab === "Settings" && <Sliders size={16} />}
                          <span>{tab}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sidebar-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="proof-avatar" style={{ width: '28px', height: '28px', backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>U</div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>User Account</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Pro Trader</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Main Workspace Mockup */}
                <div className="mockup-main">
                  
                  {/* Mockup Header */}
                  <div className="mockup-header">
                    <div>
                      <h3 className="mockup-header-title">Welcome Back, Trader!</h3>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold', marginTop: '2px' }}>Interactive Sandbox Simulator</div>
                    </div>
                    <div className="mockup-header-action">
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-color)', display: 'inline-block' }}></span>
                      <span>Connected to Supabase</span>
                    </div>
                  </div>

                  {/* Mockup KPI cards */}
                  <div className="mockup-kpi-grid">
                    <div className="mockup-kpi-card">
                      <span className="kpi-title">Net P&amp;L</span>
                      <span className="kpi-value" style={{ color: mockNetPnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                        {mockNetPnl >= 0 ? "+" : ""}₹{mockNetPnl.toLocaleString()}
                      </span>
                      <span className={`kpi-sub ${mockNetPnl >= 0 ? "up" : "down"}`}>
                        {mockNetPnl >= 0 ? "▲ +18.4%" : "▼ -4.2%"}
                      </span>
                    </div>
                    <div className="mockup-kpi-card">
                      <span className="kpi-title">Win Rate</span>
                      <span className="kpi-value">{mockWinRate}%</span>
                      <span className="kpi-sub up">▲ +4.2%</span>
                    </div>
                    <div className="mockup-kpi-card">
                      <span className="kpi-title">Trades</span>
                      <span className="kpi-value">{mockTotalTrades}</span>
                      <span className="kpi-sub" style={{ color: 'var(--text-secondary)' }}>This Month</span>
                    </div>
                    <div className="mockup-kpi-card">
                      <span className="kpi-title">Discipline</span>
                      <span className="kpi-value">{mockDisciplineScore}/100</span>
                      <span className="kpi-sub up" style={{ color: 'var(--success-color)' }}>Stable Consistency</span>
                    </div>
                  </div>

                  {/* Mockup Charts Section */}
                  {mockActiveTab === "Dashboard" && (
                    <div className="mockup-charts-row">
                      <div className="mockup-chart-card" style={{ width: '100%' }}>
                        <div className="chart-card-header">
                          <h4 className="chart-title">Account Growth Sandbox</h4>
                          <span className="chart-legend" style={{ color: 'var(--primary-color)' }}>Cumulative P&amp;L</span>
                        </div>
                        <div className="chart-body">
                          {/* SVG line mockup representing simulated trades */}
                          <svg width="100%" height="100%" viewBox="0 0 450 120" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="mockPnlGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d="M 0,90 L 100,70 L 200,95 L 300,50 L 450,20" fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeLinecap="round" />
                            <path d="M 0,90 L 100,70 L 200,95 L 300,50 L 450,20 L 450,120 L 0,120 Z" fill="url(#mockPnlGrad)" />
                            <circle cx="450" cy="20" r="5" fill="var(--primary-color)" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mockup Trades Table */}
                  {mockActiveTab !== "Dashboard" ? (
                    <div className="mockup-chart-card" style={{ width: '100%', height: '280px', overflowY: 'auto' }}>
                      <h4 className="chart-title" style={{ marginBottom: '16px' }}>Rule Engine Settings &amp; Modules</h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '20px' }}>
                        <p><strong>Discipline Tracker</strong> is armed. The platform automatically tracks emotional slips across:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                          <li><strong>Overtrading</strong>: Exceeding daily trade limits.</li>
                          <li><strong>FOMO Entry</strong>: Entering away from trigger zones.</li>
                          <li><strong>Early Exit</strong>: Cutting profits before target hit.</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="mockup-table-card">
                      <div className="table-header">Recent Simulated Imports</div>
                      <table className="mockup-table">
                        <thead>
                          <tr>
                            <th align="left">Time</th>
                            <th align="left">Asset</th>
                            <th align="left">Type</th>
                            <th align="right">P&amp;L</th>
                            <th align="center">Behavior Tag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockTrades.map((t, i) => (
                            <tr key={i}>
                              <td style={{ color: 'var(--text-secondary)' }}>{t.date}</td>
                              <td style={{ fontWeight: 'bold', color: 'var(--dark-navy)' }}>{t.asset}</td>
                              <td>
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '9px',
                                  fontWeight: '700',
                                  backgroundColor: t.type === "BUY" ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                  color: t.type === "BUY" ? 'var(--success-color)' : 'var(--danger-color)'
                                }}>
                                  {t.type}
                                </span>
                              </td>
                              <td align="right" style={{ fontWeight: '800', color: t.pnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                                {t.pnl >= 0 ? "+" : ""}₹{t.pnl.toLocaleString()}
                              </td>
                              <td align="center">
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '9px',
                                  fontWeight: '700',
                                  border: '1px solid',
                                  backgroundColor: t.mood.includes("✓") ? 'rgba(34, 197, 94, 0.06)' : t.mood.includes("⚠️") ? 'rgba(245, 158, 11, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                                  color: t.mood.includes("✓") ? 'var(--success-color)' : t.mood.includes("⚠️") ? 'var(--warning-color)' : 'var(--danger-color)',
                                  borderColor: t.mood.includes("✓") ? 'rgba(34, 197, 94, 0.12)' : t.mood.includes("⚠️") ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)'
                                }}>
                                  {t.mood}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </section>

          {/* FEATURES SECTION */}
          <section id="features" className="features-section section-gap">
            <div className="features-col">
              <BookOpen className="feature-col-icon" />
              <h3 className="feature-col-title">Auto Log</h3>
              <p className="feature-col-desc">Imports completed contract records seamlessly from major brokers.</p>
            </div>
            <div className="features-col">
              <ShieldAlert className="feature-col-icon" />
              <h3 className="feature-col-title">Mistake Scan</h3>
              <p className="feature-col-desc">Categorizes rule breaches like FOMO, revenge trading, and early exits.</p>
            </div>
            <div className="features-col">
              <BarChart4 className="feature-col-icon" />
              <h3 className="feature-col-title">Metrics Engine</h3>
              <p className="feature-col-desc">Calculates win rates, average RR ratios, and drawdowns on-the-fly.</p>
            </div>
            <div className="features-col">
              <Clock className="feature-col-icon" />
              <h3 className="feature-col-title">Peak Hours</h3>
              <p className="feature-col-desc">Isolates time blocks and asset profiles where you lose money.</p>
            </div>
            <div className="features-col">
              <Sparkles className="feature-col-icon" />
              <h3 className="feature-col-title">AI Mentorship</h3>
              <p className="feature-col-desc">Summarizes habits and gives suggestions for psychological recovery.</p>
            </div>
          </section>

          {/* PROBLEM SECTION */}
          <section id="problems" className="section-gap" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="problem-section-header">
              <div className="problem-badge">The Trading Trap</div>
              <h2 className="problem-heading">Why Most Traders Lose Money</h2>
            </div>

            <div className="problem-cards-layout">
              <div className="problem-card">
                <AlertTriangle className="problem-card-icon" />
                <h3 className="problem-card-title">Repeated Mistakes</h3>
                <p className="problem-card-desc">Repeating the exact same errors (FOMO, overtrading) without a trace.</p>
              </div>
              <div className="problem-card">
                <TrendingDown className="problem-card-icon" />
                <h3 className="problem-card-title">Slippery Discipline</h3>
                <p className="problem-card-desc">Taking emotional entries that breach risk rules after consecutive losses.</p>
              </div>
              <div className="problem-card">
                <Lock className="problem-card-icon" />
                <h3 className="problem-card-title">Zero Analytics</h3>
                <p className="problem-card-desc">Journaling in messy Excel files that never calculate real drawdowns.</p>
              </div>
              <div className="problem-card">
                <Sliders className="problem-card-icon" />
                <h3 className="problem-card-title">No Strategy Isolation</h3>
                <p className="problem-card-desc">Mixing setups and losing money without knowing which setup actually works.</p>
              </div>
              <div className="problem-card">
                <Users className="problem-card-icon" />
                <h3 className="problem-card-title">No Accountability</h3>
                <p className="problem-card-desc">Trading alone without mentor review or statistical discipline checks.</p>
              </div>
            </div>
          </section>

          {/* STATS SECTION */}
          <section id="stats" className="stats-section section-gap">
            <div className="stats-col">
              <span className="metric-number">{stats.totalTrades.toLocaleString()}+</span>
              <p className="metric-label">Trades Tracked</p>
            </div>
            <div className="stats-col">
              <span className="metric-number">{stats.totalUsers.toLocaleString()}+</span>
              <p className="metric-label">Active Traders</p>
            </div>
            <div className="stats-col">
              <span className="metric-number">{stats.avgWinRate}%</span>
              <p className="metric-label">Avg Win Rate</p>
            </div>
            <div className="stats-col">
              <span className="metric-number">{stats.disciplineScore}%</span>
              <p className="metric-label">Discipline Score</p>
            </div>
            <div className="stats-col">
              <span className="metric-number">4+</span>
              <p className="metric-label">Brokers Connected</p>
            </div>
          </section>

          {/* Sandbox Controls Simulator Info */}
          <section className="section-gap" style={{ textAlign: 'center', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid var(--card-border)', padding: '48px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--dark-navy)', margin: '0 0 16px 0' }}>Interactive Sandbox Simulator</h3>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 32px auto', lineHeight: '26px' }}>
              Test our broker API sync integration directly in the mockup below. Click on a broker connection to import mock trades and watch the dashboard metrics update in real-time.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => handleBrokerSyncSimulate("Zerodha")} className="btn-hero-secondary" style={{ width: '160px', height: '48px', cursor: 'pointer' }}>Zerodha Import</button>
              <button onClick={() => handleBrokerSyncSimulate("Upstox")} className="btn-hero-secondary" style={{ width: '160px', height: '48px', cursor: 'pointer' }}>Upstox Import</button>
              <button onClick={() => handleBrokerSyncSimulate("Dhan")} className="btn-hero-secondary" style={{ width: '160px', height: '48px', cursor: 'pointer' }}>Dhan Import</button>
              <button onClick={() => handleBrokerSyncSimulate("AngelOne")} className="btn-hero-secondary" style={{ width: '160px', height: '48px', cursor: 'pointer' }}>Angel One Import</button>
            </div>
          </section>

          {/* CTA SECTION */}
          <section id="cta" className="cta-section section-gap">
            <div className="cta-left">
              <h2 className="cta-heading">Start Journaling Like a Professional</h2>
              <p className="cta-description">Take control of your execution discipline. Identify emotional triggers, eliminate bad habits, and grow your capital portfolio today.</p>
              <div className="cta-buttons">
                <input
                  type="email"
                  placeholder="Enter email to get started"
                  value={ctaEmail}
                  onChange={(e) => setCtaEmail(e.target.value)}
                  style={{
                    height: '56px',
                    width: '280px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '0 16px',
                    fontSize: '15px',
                    fontWeight: '600',
                    outline: 'none',
                    backgroundColor: '#fff'
                  }}
                />
                <Link 
                  href={`/signup?email=${encodeURIComponent(ctaEmail)}`}
                  className="btn-hero-primary"
                >
                  Get Started
                </Link>
              </div>
            </div>

            <div className="cta-right">
              {/* Floating Cards Mockup */}
              <div className="floating-card medium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mistake Distribution</span>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--danger-color)' }}>Weekly Alert</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Revenge Trades</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--danger-color)' }}>42%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '3px' }}>
                    <div style={{ width: '42%', height: '100%', backgroundColor: 'var(--danger-color)', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span>FOMO Entries</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--warning-color)' }}>35%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '3px' }}>
                    <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--warning-color)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>

              <div className="floating-card small">
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Discipline Gain</span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success-color)', margin: '8px 0' }}>+24%</div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Since connecting Zerodha Kite API</div>
              </div>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="landing-footer section-gap">
          <div className="landing-container footer-grid">
            
            {/* Logo column */}
            <div className="footer-col-logo">
              <div className="nav-logo-group">
                <div className="sidebar-logo-icon" style={{ backgroundColor: '#fff', color: 'var(--dark-navy)' }}>TA</div>
                <span className="footer-logo-title">Trade Adhyayan</span>
              </div>
              <p className="footer-description">
                Elevating retail trading discipline in India. Connect APIs, verify execution rules, and isolate profitable strategy setups.
              </p>
              <div className="social-icons-row">
                <a href="#" className="social-icon">𝕏</a>
                <a href="#" className="social-icon">📷</a>
                <a href="#" className="social-icon">💼</a>
                <a href="#" className="social-icon">💬</a>
              </div>
            </div>

            {/* Links column 1 */}
            <div>
              <h4 className="footer-heading">Platform</h4>
              <div className="footer-links-list">
                <a href="#" className="footer-link">Dashboard Review</a>
                <a href="#" className="footer-link">Broker Integrations</a>
                <a href="#" className="footer-link">Rules Configurator</a>
                <a href="#" className="footer-link">AI Mentorship Engine</a>
              </div>
            </div>

            {/* Links column 2 */}
            <div>
              <h4 className="footer-heading">Company</h4>
              <div className="footer-links-list">
                <a href="#" className="footer-link">About Team</a>
                <a href="#" className="footer-link">Discipline Blog</a>
                <a href="#" className="footer-link">Terms of Service</a>
                <a href="#" className="footer-link">Privacy Standards</a>
              </div>
            </div>

            {/* Links column 3 */}
            <div>
              <h4 className="footer-heading">Resources</h4>
              <div className="footer-links-list">
                <a href="#" className="footer-link">SEBI Compliance Guidelines</a>
                <a href="#" className="footer-link">Help Center</a>
                <a href="#" className="footer-link">Kite Setup Guide</a>
                <a href="#" className="footer-link">Upstox Sync Guide</a>
              </div>
            </div>

            {/* SEBI Compliance Card */}
            <div className="sebi-compliance-card">
              <h5 className="sebi-card-title">SEBI Regulatory</h5>
              <p className="sebi-card-desc">
                We are a non-discretionary analytical log software. We do not provide trading alerts, recommendations, advisory, or portfolio management services.
              </p>
              <span className="sebi-card-footer">Risk Disclosed ✓</span>
            </div>

          </div>

          {/* Bottom Strip */}
          <div className="landing-container footer-bottom-strip">
            <div className="footer-disclaimer-left">
              Disclaimer: Trading in Futures &amp; Options carries high risk. Over 90% of retail traders lose money in F&amp;O. Ensure you allocate appropriate capital and consult financial advisors.
            </div>
            <div>
              © 2026 Trade Adhyayan. Built for Disciplined Traders.
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
