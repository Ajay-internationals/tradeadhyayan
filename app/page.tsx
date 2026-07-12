import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  LineChart,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
  Trophy,
  Clock,
  RefreshCw,
} from "lucide-react";

// ─── SEO METADATA ───────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Trade Adhyayan | #1 Trading Journal & Analytics Platform for Indian Traders",
  description:
    "The most powerful trading journal built for Indian traders. Track every trade, identify costly mistakes, master trading psychology, and grow consistently with AI-powered analytics and expert mentorship.",
  keywords: [
    "trading journal India",
    "trade journal app",
    "trading analytics platform",
    "NSE BSE trade tracker",
    "trading mistake tracker",
    "trading psychology app",
    "trading mentor India",
    "Zerodha journal",
    "Upstox trade journal",
    "Fyers trading journal",
  ].join(", "),
  openGraph: {
    title: "Trade Adhyayan — The Ultimate Trading Journal for Indian Traders",
    description:
      "Track trades, fix mistakes, improve discipline. Join 100+ traders who grow with Trade Adhyayan.",
    url: "https://trade-adhyayan-next.vercel.app",
    siteName: "Trade Adhyayan",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trade Adhyayan — Trading Journal & Analytics",
    description: "Track every trade. Fix every mistake. Grow consistently.",
  },
  alternates: {
    canonical: "https://trade-adhyayan-next.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const stats = [
  { value: "100+", label: "Active Traders", icon: Users },
  { value: "10,000+", label: "Trades Recorded", icon: Shield },
  { value: "₹1+ Crore", label: "Performance Tracked", icon: Target },
  { value: "4.9/5", label: "Average Rating", icon: Star },
];

const features = [
  {
    icon: BookOpen,
    title: "Smart Trade Journal",
    desc: "Log every trade in seconds with auto-import from Zerodha, Upstox, Fyers & more. No manual data entry.",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: AlertTriangle,
    title: "AI Mistake Detector",
    desc: "Our AI flags rule violations, emotional trades, and pattern mistakes — showing exactly how much they cost you.",
    color: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/20",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics & Reports",
    desc: "Win rate, R-multiple, streak analysis, strategy performance, and 30+ metrics on a beautiful dashboard.",
    color: "from-blue-500 to-cyan-600",
    shadow: "shadow-blue-500/20",
  },
  {
    icon: Brain,
    title: "Psychology Tracker",
    desc: "Tag emotional states on trades. Discover patterns in fear, greed, and overconfidence that sabotage your PnL.",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
  {
    icon: Target,
    title: "Strategy Builder",
    desc: "Define and track multiple trading strategies with entry/exit rules and live performance metrics.",
    color: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Users,
    title: "1-on-1 Mentorship",
    desc: "Get personalised guidance from verified professional traders who review your journal and provide actionable feedback.",
    color: "from-indigo-500 to-violet-600",
    shadow: "shadow-indigo-500/20",
  },
];

const problems = [
  { icon: AlertTriangle, text: "Repeating the same costly mistakes every week" },
  { icon: Brain, text: "Trading emotionally without realising it" },
  { icon: LineChart, text: "No idea which strategy actually works" },
  { icon: Clock, text: "Wasting hours manually tracking trades in Excel" },
  { icon: TrendingUp, text: "Growing account size but not growing as a trader" },
  { icon: Users, text: "No accountability or expert feedback on your trades" },
];

const testimonials = [
  {
    name: "Rohan Mehta",
    role: "Full-time Trader, NSE Options",
    avatar: "RM",
    color: "from-violet-500 to-purple-600",
    text: "Trade Adhyayan showed me that 68% of my losses came from just 2 recurring mistakes. Fixing those two things turned my account around completely within 3 months.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Swing Trader, BSE Equity",
    avatar: "PS",
    color: "from-rose-500 to-pink-600",
    text: "The psychology tagging feature is a game changer. I discovered I was overtrading every Monday after a weekend of over-analysis. Just being aware of it changed everything.",
    rating: 5,
  },
  {
    name: "Karthik Nair",
    role: "F&O Trader, Zerodha",
    avatar: "KN",
    color: "from-blue-500 to-cyan-600",
    text: "The mentor review feature is incredible. My mentor spotted in 10 minutes what I had been missing for 2 years — I was placing stops too tight on gap-up opens.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Which brokers does Trade Adhyayan support?",
    a: "We support Zerodha, Upstox, Fyers, Angel One, Groww, and more. Trades can be imported automatically or logged manually.",
  },
  {
    q: "Is my trading data secure?",
    a: "Yes. We use AES-256 bank-level encryption and only ever request read-only access to your broker account. Your data is never sold.",
  },
  {
    q: "Do I need to be an advanced trader to use this?",
    a: "Absolutely not. Trade Adhyayan is built for beginners and professionals alike. The simpler your journaling habit, the faster you improve.",
  },
  {
    q: "What is included in the Mentorship plan?",
    a: "You get matched with a verified professional trader for monthly 1-on-1 video sessions, journal reviews, strategy feedback, and a private accountability channel.",
  },
  {
    q: "Can I try it before paying?",
    a: "Yes. Our Free plan is permanent — no credit card required, no time limit. You can explore and log up to 30 trades completely free.",
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060918] text-white overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060918]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between" style={{ height: "72px" }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/30">
              TA
            </div>
            <span className="font-black text-xl tracking-tight">Trade Adhyayan</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-semibold text-white/60 hover:text-white transition-colors px-4 py-2">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:-translate-y-0.5"
            >
              Start Free →
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-rose-600/8 blur-[100px] rounded-full pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-white/70">Trusted by 100+ traders across India</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-7">
            The Ultimate{" "}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 font-black">
                Journal
              </span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-4 leading-relaxed font-medium">
            India's most powerful trading journal. Track every trade, detect costly patterns,
            and transform your trading with AI analytics and expert mentorship.
          </p>
          <p className="text-base text-white/40 mb-12 font-medium">
            Works with Zerodha, Upstox, Fyers, Angel One & more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              id="hero-cta-primary"
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Journaling Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/features"
              id="hero-cta-secondary"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              See All Features
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-white/50 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM SECTION ────────────────────────────────────────────────── */}
      <section className="py-28 px-6" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side problem description */}
            <div className="lg:col-span-5 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold text-rose-400">Sound Familiar?</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                Most traders keep losing because they{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
                  never review.
                </span>
              </h2>
              <p className="text-lg text-white/50 font-medium leading-relaxed mb-6">
                Without a structured journal, every trading mistake repeats itself indefinitely — costing you money week after week.
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-500/20 text-white font-bold text-sm">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Trade Adhyayan solves all of these.
              </div>
            </div>

            {/* Right side diagnostics items */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {problems.map((p, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-[#1E112A]/40 hover:border-violet-500/30 transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3 mb-4">
                    <p.icon className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 font-black text-sm">{p.text}</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(idx + 1) * 15 + 30}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative" id="features">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-bold text-violet-400">Everything You Need</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
              Built for traders who take{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                growth seriously
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto font-medium">
              Every feature is purpose-built to help you find your edge, fix your weaknesses, and compound your gains.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg ${f.shadow}`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{f.title}</h3>
                <p className="text-white/55 leading-relaxed font-medium text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-white/5" id="testimonials">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">Real Traders. Real Results.</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
              Traders who{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                turned it around
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all flex flex-col">
                <div className="flex gap-1 mb-5">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed font-medium flex-grow mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs font-semibold">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-white/5" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Frequently Asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                Questions
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all cursor-pointer"
              >
                <summary className="flex items-center justify-between font-bold text-white text-base list-none">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-white/40 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-4 text-white/55 text-sm leading-relaxed font-medium">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-violet-900/60 to-purple-900/60 border border-violet-500/20 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-7">
                <Zap className="w-4 h-4 text-violet-300" />
                <span className="text-sm font-bold text-violet-300">Start in under 2 minutes</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
                Ready to trade smarter?
              </h2>
              <p className="text-lg text-white/60 mb-10 font-medium max-w-xl mx-auto">
                Join active traders who review their trades, fix their mistakes, and grow their account with Trade Adhyayan.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  id="bottom-cta-primary"
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  id="bottom-cta-pricing"
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg rounded-2xl transition-all"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/30">
                TA
              </div>
              <span className="font-black text-xl tracking-tight">Trade Adhyayan</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold text-white/40">
              <Link href="/features" className="hover:text-white transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </nav>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30 font-semibold">
            <p>© {new Date().getFullYear()} Trade Adhyayan. All rights reserved.</p>
            <p>Built for Indian traders. Made with ❤️ in India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
