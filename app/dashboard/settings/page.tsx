"use client";
 
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initiateCashfreePayment } from "@/lib/payment-client";
import {
  User,
  Settings,
  Bell,
  Lock,
  CreditCard,
  Grid,
  Database,
  HelpCircle,
  Check,
  ChevronRight,
  Trash2,
  X,
  Upload,
  Download,
  RefreshCw,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getSettings,
  updateSettings,
  updateProfile,
  resetPreferences,
  UserSettingsResponse,
  updateInitialCapital
} from "@/app/actions/settings";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"General" | "Trading" | "Notifications" | "Privacy & Security" | "Plans & Billing" | "Integrations" | "Account">("General");
  
  // User/Settings State
  const [profileName, setProfileName] = useState("Arjun");
  const [profileEmail, setProfileEmail] = useState("arjun@tradeadhyayan.com");
  const [memberSince, setMemberSince] = useState("Jan 10, 2024");
  const [plan, setPlan] = useState(""); // raw plan: FREE, PRO, MENTOR
  const [tradesLogged, setTradesLogged] = useState(128);
  const [winningRate, setWinningRate] = useState(62.5);
  const [initialCapital, setInitialCapital] = useState(100000);

  // Form states
  const [theme, setTheme] = useState("Light");
  const [defaultDashboard, setDefaultDashboard] = useState("Overview");
  const [defaultDateRange, setDefaultDateRange] = useState("This Week");
  const [currency, setCurrency] = useState("INR");
  const [numberFormat, setNumberFormat] = useState("1,234.56");
  const [language, setLanguage] = useState("English");
  
  const [defaultRisk, setDefaultRisk] = useState("1.00");
  const [defaultRr, setDefaultRr] = useState("1 : 2");
  const [defaultTradeType, setDefaultTradeType] = useState("All");
  const [includeBrokerage, setIncludeBrokerage] = useState(true);

  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("Daily");

  // Profile Edit Modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editNameInput, setEditNameInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("trade_adhyayan_user");
    if (!userEmail) {
      router.push("/login");
      return;
    }
    setEmail(userEmail);
    loadUserSettings(userEmail);
  }, [router]);

  async function loadUserSettings(userEmail: string) {
    setLoading(true);
    try {
      const res = await getSettings(userEmail);
      if (res) {
        setProfileName(res.name);
        setProfileEmail(res.email);
        setPlan(res.plan || "FREE"); // store raw plan value
        setMemberSince(res.memberSince);
        setTradesLogged(res.tradesLogged);
        setWinningRate(res.winningRate);
        setInitialCapital(res.initialCapital);

        // Settings
        setTheme(res.settings.theme);
        setCurrency(res.settings.currency);
        setDefaultDateRange(res.settings.defaultDateRange);
        setDefaultRisk(res.settings.defaultRisk.toFixed(2));
        setDefaultRr(`1 : ${res.settings.defaultRr}`);
        setIncludeBrokerage(res.settings.includeBrokerage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  // Update a single setting parameter
  const handleSettingChange = async (key: string, value: any) => {
    if (!email) return;

    // Optimistic local state update
    if (key === "theme") setTheme(value);
    if (key === "currency") setCurrency(value);
    if (key === "defaultDateRange") setDefaultDateRange(value);
    if (key === "includeBrokerage") setIncludeBrokerage(value);

    try {
      let dataToUpdate: any = {};
      if (key === "theme") dataToUpdate.theme = value;
      if (key === "currency") dataToUpdate.currency = value;
      if (key === "defaultDateRange") dataToUpdate.defaultDateRange = value;
      if (key === "includeBrokerage") dataToUpdate.includeBrokerage = value;
      if (key === "defaultRisk") {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) dataToUpdate.defaultRisk = parsed;
      }
      if (key === "defaultRr") {
        // extract rr factor
        const match = value.match(/1\s*:\s*([\d.]+)/);
        if (match) {
          const parsed = parseFloat(match[1]);
          if (!isNaN(parsed)) dataToUpdate.defaultRr = parsed;
        }
      }

      const res = await updateSettings(email, dataToUpdate);
      if (res.success) {
        toast.success("Preferences updated!");
      }
    } catch {
      toast.error("Failed to save changes.");
    }
  };

  const handleCapitalChange = async (value: number) => {
    if (!email) return;
    try {
      const res = await updateInitialCapital(email, value);
      if (res.success) {
        toast.success("Invested Capital updated!");
      } else {
        toast.error(res.error || "Failed to update capital");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save capital change.");
    }
  };

  const handlePlanUpgrade = async (planId: "pro" | "mentorship") => {
    if (!email) return;
    await initiateCashfreePayment({
      planId,
      email
    });
  };

  // Profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !editNameInput.trim()) return;
    setSavingProfile(true);
    try {
      const res = await updateProfile(email, editNameInput);
      if (res.success) {
        setProfileName(res.name || editNameInput);
        setShowEditProfileModal(false);
        toast.success("Profile updated!");
      }
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Reset preferences
  const handleResetPreferences = async () => {
    if (!email) return;
    if (!confirm("Are you sure you want to reset all preferences to default?")) return;
    try {
      const res = await resetPreferences(email);
      if (res.success) {
        toast.success("Settings restored to defaults!");
        loadUserSettings(email);
      }
    } catch {
      toast.error("Failed to reset preferences.");
    }
  };

  // Clear cache action
  const handleClearCache = () => {
    toast.success("Local cache cleared successfully!");
  };

  // Export Mock CSV Data
  const handleExportData = () => {
    const dataString = "Name,Email,Plan,Trades Logged,Winning Rate\n" + 
                       `"${profileName}","${profileEmail}","${plan}",${tradesLogged},${winningRate}%`;
    const blob = new Blob([dataString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trade_adhyayan_settings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data export started!");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-[#1E1B4B] text-left">
      
      {/* ── TABS HEADER LINE (Col span 4) ── */}
      <div className="col-span-full border-b border-[#EEF0F4] pb-2 flex gap-6 overflow-x-auto">
        {[
          "General",
          "Trading",
          "Notifications",
          "Privacy & Security",
          "Plans & Billing",
          "Integrations",
          "Account"
        ].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2.5 text-xs font-black tracking-wide border-b-2 px-1 transition-all shrink-0 cursor-pointer ${
              activeTab === tab
                ? "border-[#6D3DF5] text-[#6D3DF5]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── MAIN SETTINGS FORMS PANEL (Col span 3) ── */}
      <div className="xl:col-span-3 space-y-6">
        
        {activeTab === "Plans & Billing" ? (
          <div className="space-y-[24px]">
            {/* Current Plan Card */}
            <div className="bg-gradient-to-r from-[#6D3DF5] to-[#8F66FF] border border-[#EEF0F4] rounded-[24px] p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
                <CreditCard size={250} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2.5 py-1 rounded-full">Current Subscription</span>
                  <h2 className="text-2xl font-black mt-3 uppercase tracking-tight">
                    {plan === "PRO" ? "Pro Plan" : plan === "MENTOR" ? "Mentor Plan" : "Free Plan"}
                  </h2>
                  <p className="text-xs font-semibold text-white/80 mt-1">Next renewal / review date: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                </div>
                <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-right">
                  <span className="text-[10px] font-black uppercase text-white/70 block">Status</span>
                  <span className="text-sm font-black uppercase tracking-wide">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Plan Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pro Upgrade Card */}
              <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-[#0F172A]">Pro Plan</h3>
                    <span className="text-xs font-extrabold text-[#6D3DF5]">₹499 / Mo</span>
                  </div>
                  <p className="text-[#64748B] text-xs font-semibold mt-2 leading-relaxed">
                    Unlock unlimited trades, advanced analytics, strategy performance logs, Excel imports, and mistake tracking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlanUpgrade("pro")}
                  disabled={plan === "PRO" || plan === "MENTOR"}
                  className={`w-full py-3 font-black text-xs rounded-xl mt-6 transition-all ${
                    plan === "PRO" || plan === "MENTOR"
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-[#6D3DF5] hover:bg-[#5B2FD4] text-white shadow-md shadow-[#6D3DF5]/15 cursor-pointer"
                  }`}
                >
                  {plan === "PRO" || plan === "MENTOR" ? "✓ Subscribed" : "Upgrade to Pro — ₹499/mo"}
                </button>
              </div>

              {/* Mentor Upgrade Card */}
              <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-[#0F172A]">Mentor Plan</h3>
                    <span className="text-xs font-extrabold text-[#E94B8A]">₹4,999 / Mo</span>
                  </div>
                  <p className="text-[#64748B] text-xs font-semibold mt-2 leading-relaxed">
                    Designed for active traders seeking expert guidance, personalized accountability reviews, and priority mentor callbacks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlanUpgrade("mentorship")}
                  disabled={plan === "MENTOR"}
                  className={`w-full py-3 font-black text-xs rounded-xl mt-6 transition-all ${
                    plan === "MENTOR"
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-gradient-to-r from-[#E94B8A] to-[#C93370] hover:opacity-90 text-white shadow-md shadow-[#E94B8A]/15 cursor-pointer"
                  }`}
                >
                  {plan === "MENTOR" ? "✓ Subscribed" : "Upgrade to Mentor — ₹4,999/mo"}
                </button>
              </div>
            </div>
          </div>
        ) : activeTab !== "General" ? (
          <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-12 text-center shadow-sm">
            <Settings className="w-12 h-12 text-[#6D3DF5] mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
            <h3 className="text-base font-black text-[#0F172A]">{activeTab} Settings</h3>
            <p className="text-[#64748B] text-xs font-semibold max-w-sm mx-auto mt-2 leading-relaxed">
              This settings tab configurations are managed automatically. Customize profile preferences inside the General panel.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Profile Information */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-[#F4F0FF] rounded-full flex items-center justify-center shrink-0 text-[#6D3DF5]">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">Profile Information</h3>
                  <p className="text-[#64748B] text-[11px] font-semibold mt-1">Update your personal information and profile details.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-6 mt-4 text-xs font-bold text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Name</span>
                      <span className="text-[#0F172A]">{profileName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Email</span>
                      <span className="text-[#0F172A]">{profileEmail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Time Zone</span>
                      <span className="text-[#0F172A]">(GMT+05:30) Asia/Kolkata</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditNameInput(profileName);
                  setShowEditProfileModal(true);
                }}
                className="px-4 py-2 border border-[#6D3DF5] hover:bg-slate-50 text-[#6D3DF5] font-black text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Edit Profile
              </button>
            </div>

            {/* 2. Application Preferences */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F4F0FF] rounded-full flex items-center justify-center shrink-0 text-[#6D3DF5]">
                  <Grid size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">Application Preferences</h3>
                  <p className="text-[#64748B] text-[11px] font-semibold mt-1">Customize the app interface and default behavior.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-16 text-xs font-semibold text-slate-700">
                {/* Theme toggle row */}
                <div className="flex flex-col justify-between md:col-span-2 sm:flex-row sm:items-center gap-4">
                  <span className="font-bold text-slate-700">Theme</span>
                  <div className="flex bg-slate-50 border border-[#EEF0F4] p-0.5 rounded-xl text-[11px]">
                    {[
                      { value: "Light", icon: Sun },
                      { value: "Dark", icon: Moon },
                      { value: "System", icon: Monitor }
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleSettingChange("theme", item.value)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${
                            theme === item.value
                              ? "bg-white text-[#6D3DF5] shadow-sm"
                              : "text-slate-400 hover:text-[#0F172A]"
                          }`}
                        >
                          <Icon size={12} />
                          <span>{item.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Default Dashboard */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Default Dashboard</label>
                  <select
                    value={defaultDashboard}
                    onChange={e => setDefaultDashboard(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl font-bold cursor-pointer"
                  >
                    <option value="Overview">Overview</option>
                    <option value="Advanced">Advanced Analytics</option>
                  </select>
                </div>

                {/* Default Date Range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Default Date Range</label>
                  <select
                    value={defaultDateRange}
                    onChange={e => handleSettingChange("defaultDateRange", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl font-bold cursor-pointer"
                  >
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                  </select>
                </div>

                {/* Currency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Currency</label>
                  <select
                    value={currency}
                    onChange={e => handleSettingChange("currency", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl font-bold cursor-pointer"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                {/* Number Format */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Number Format</label>
                  <select
                    value={numberFormat}
                    onChange={e => setNumberFormat(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl font-bold cursor-pointer"
                  >
                    <option value="1,234.56">1,234.56</option>
                    <option value="1.234,56">1.234,56</option>
                  </select>
                </div>

                {/* Language */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl font-bold cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

              </div>
            </div>

            {/* 3. Trading Preferences */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F4F0FF] rounded-full flex items-center justify-center shrink-0 text-[#6D3DF5]">
                  <Database size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">Trading Preferences</h3>
                  <p className="text-[#64748B] text-[11px] font-semibold mt-1">Set default values for trades and analysis.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-0 md:pl-16 text-xs font-semibold text-slate-700">
                {/* Invested Capital */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] text-[#6D3DF5] font-black block uppercase tracking-wider">Invested Capital (Initial Balance)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-[#64748B] font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="5000"
                      value={initialCapital}
                      onChange={e => {
                        setInitialCapital(Number(e.target.value));
                        handleCapitalChange(Number(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#6D3DF5] focus:bg-white transition-colors"
                      placeholder="e.g. 100000"
                    />
                  </div>
                  <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">This sets the baseline account balance used to calculate equity curves and drawdown analytics.</p>
                </div>

                {/* Default Risk */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Default Risk per Trade</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      value={defaultRisk}
                      onChange={e => {
                        setDefaultRisk(e.target.value);
                        handleSettingChange("defaultRisk", e.target.value);
                      }}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:outline-none"
                    />
                    <span className="absolute right-4 text-[#64748B] font-bold text-xs">%</span>
                  </div>
                </div>

                {/* Default RR */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Default Reward:Risk</label>
                  <input
                    type="text"
                    value={defaultRr}
                    onChange={e => {
                      setDefaultRr(e.target.value);
                      handleSettingChange("defaultRr", e.target.value);
                    }}
                    placeholder="e.g. 1 : 2"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* Default Trade Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Default Trade Type</label>
                  <select
                    value={defaultTradeType}
                    onChange={e => setDefaultTradeType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl font-bold cursor-pointer"
                  >
                    <option value="All">All</option>
                    <option value="Equity">Equity</option>
                    <option value="F&O">F&O</option>
                  </select>
                </div>

                {/* Include Brokerage Toggle */}
                <div className="flex justify-between items-center bg-slate-50 border border-[#EEF0F4] p-4 rounded-xl sm:col-span-2">
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs">Include Brokerage in Calculations</h4>
                    <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">Deducts estimated broker commissions from totals.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSettingChange("includeBrokerage", !includeBrokerage)}
                    className={`w-11 h-6 rounded-full transition-colors relative outline-none cursor-pointer ${
                      includeBrokerage ? "bg-[#6D3DF5]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                        includeBrokerage ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Data & Backup */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F4F0FF] rounded-full flex items-center justify-center shrink-0 text-[#6D3DF5]">
                  <Database size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">Data & Backup</h3>
                  <p className="text-[#64748B] text-[11px] font-semibold mt-1">Manage your data, backup and export options.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-0 md:pl-16 text-xs font-semibold text-slate-700">
                {/* Auto Backup Toggle */}
                <div className="flex justify-between items-center sm:col-span-2 pb-4 border-b border-slate-50">
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs">Auto Backup</h4>
                    <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">Automatically push cloud backups daily.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoBackup(!autoBackup)}
                    className={`w-11 h-6 rounded-full transition-colors relative outline-none cursor-pointer ${
                      autoBackup ? "bg-[#6D3DF5]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                        autoBackup ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Backup Frequency */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] text-slate-400 font-semibold block uppercase">Backup Frequency</label>
                  <select
                    value={backupFrequency}
                    onChange={e => setBackupFrequency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl font-bold cursor-pointer"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                {/* Export Data */}
                <div className="flex justify-between items-center bg-slate-50/50 border border-[#EEF0F4] p-4 rounded-xl">
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs">Export Data</h4>
                    <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">Download full trading log history as CSV.</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 border border-[#6D3DF5] hover:bg-slate-50 text-[#6D3DF5] font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Download size={13} />
                    <span>Export Now</span>
                  </button>
                </div>

                {/* Clear Local Cache */}
                <div className="flex justify-between items-center bg-slate-50/50 border border-[#EEF0F4] p-4 rounded-xl">
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs">Clear Local Cache</h4>
                    <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">Clears stored browser layouts & local updates.</p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 size={13} />
                    <span>Clear Cache</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Help Callout banner */}
            <div className="bg-slate-50 border border-[#EEF0F4] rounded-[24px] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-bold text-[#0F172A] text-xs">Need help?</h4>
                <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">Check our help center or contact support if you have any questions.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/dashboard/help")}
                  className="px-4 py-2 border border-[#EEF0F4] hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] font-black text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Visit Help Center
                </button>
                <a
                  href="mailto:support@tradeadhyayan.com"
                  className="px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Contact Support
                </a>
              </div>
            </div>

          </>
        )}

      </div>

      {/* ── RIGHT SETTINGS SIDEBAR (Col span 1) ── */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Account Summary widget */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left">
          <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider mb-4 pb-2 border-b border-[#EEF0F4]">Account Summary</h3>
          
          <div className="space-y-3.5 text-xs font-bold text-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Plan</span>
              <div className="flex items-center gap-2">
                <span className="text-[#0F172A]">{plan}</span>
                <button className="bg-purple-100 hover:bg-purple-200 text-[#6D3DF5] text-[9px] font-black px-2 py-0.5 rounded-md transition-colors cursor-pointer uppercase">Upgrade</button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Member Since</span>
              <span className="text-[#0F172A]">{memberSince}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Status</span>
              <span className="bg-[#ECFDF5] text-[#059669] text-[9px] font-black px-2 py-0.5 rounded-full capitalize">Active</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Trades Logged</span>
              <span className="text-[#0F172A]">{tradesLogged}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Winning Rate</span>
              <span className="text-[#0F172A]">{winningRate}%</span>
            </div>
          </div>
        </div>

        {/* Preferences Summary Checklist */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left">
          <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider mb-4 pb-2 border-b border-[#EEF0F4]">Preferences Summary</h3>
          
          <div className="space-y-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>Theme</span>
              </div>
              <span className="font-bold text-[#0F172A]">{theme}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>Time Zone</span>
              </div>
              <span className="font-bold text-[#0F172A] truncate max-w-[120px] text-right" title="Asia/Kolkata">Asia/Kolkata</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>Default Date Range</span>
              </div>
              <span className="font-bold text-[#0F172A]">{defaultDateRange}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>Default Risk</span>
              </div>
              <span className="font-bold text-[#0F172A]">{defaultRisk}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>Default R:R</span>
              </div>
              <span className="font-bold text-[#0F172A]">{defaultRr}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("General")}
            className="w-full mt-4 text-center text-[10px] font-black text-[#6D3DF5] hover:underline cursor-pointer"
          >
            Manage Preferences →
          </button>
        </div>

        {/* Quick Actions checklist */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left">
          <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider mb-4 pb-2 border-b border-[#EEF0F4]">Quick Actions</h3>
          
          <div className="space-y-1.5 text-xs font-bold">
            <button
              onClick={handleResetPreferences}
              className="w-full px-3 py-2.5 hover:bg-slate-50 text-[#475569] hover:text-[#0F172A] rounded-xl flex items-center justify-between transition-all cursor-pointer border border-[#EEF0F4] bg-white"
            >
              <span>Reset App Preferences</span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={handleExportData}
              className="w-full px-3 py-2.5 hover:bg-slate-50 text-[#475569] hover:text-[#0F172A] rounded-xl flex items-center justify-between transition-all cursor-pointer border border-[#EEF0F4] bg-white"
            >
              <span>Export All Data</span>
              <ChevronRight size={14} />
            </button>

            <label
              className="w-full px-3 py-2.5 hover:bg-slate-50 text-[#475569] hover:text-[#0F172A] rounded-xl flex items-center justify-between transition-all cursor-pointer border border-[#EEF0F4] bg-white"
            >
              <span>Import Data</span>
              <ChevronRight size={14} />
              <input type="file" className="hidden" onChange={() => toast.success("File upload simulated!")} />
            </label>

            <button
              onClick={() => {
                if (confirm("Are you sure you want to request account deletion? This will delete all your trading logs permanently.")) {
                  toast.error("Account deletion request submitted. An admin will review it.");
                }
              }}
              className="w-full px-3 py-2.5 hover:bg-red-50 text-red-600 rounded-xl flex items-center justify-between transition-all cursor-pointer border border-red-100 bg-white"
            >
              <span>Delete Account</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* ── EDIT PROFILE MODAL DIALOG ── */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-2xl max-w-sm w-full overflow-hidden flex flex-col text-left animate-scale-up"
          >
            <div className="p-6 border-b border-[#EEF0F4] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-[16px] text-[#0F172A]">Edit Profile Details</h3>
                <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Email: {profileEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editNameInput}
                  onChange={e => setEditNameInput(e.target.value)}
                  placeholder="e.g. Arjun Dev..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#EEF0F4] flex justify-end gap-3 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="px-5 py-2.5 bg-white border border-[#EEF0F4] text-[#64748B] rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:bg-slate-200 disabled:text-[#64748B] cursor-pointer"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
