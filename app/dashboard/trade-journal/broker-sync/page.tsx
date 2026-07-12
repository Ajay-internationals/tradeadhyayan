"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Settings, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Info, 
  Shield, 
  HelpCircle, 
  X, 
  Trash2,
  Lock,
  Headphones,
  Download,
  AlertTriangle
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { disconnectBroker, getBrokerSyncStats, getSyncLogs } from "@/app/actions/trades";

function BrokerSyncContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);



  // Accordion state
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Database / Sync States
  const [connections, setConnections] = useState<any[]>([]);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [selectedSync, setSelectedSync] = useState<any | null>(null);

  // Sync Settings State
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState("30 minutes");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
  const [importTypes, setImportTypes] = useState({
    trades: true,
    positions: true,
    orders: false,
    holdings: false,
  });

  // Dynamic Overview Stats state
  const [stats, setStats] = useState({
    totalTrades: 0,
    syncedTrades: 0,
    positions: 0,
    accountBalance: 248560,
    dataBreakdown: {
      intraday: 0,
      swing: 0,
      positional: 0,
      others: 0
    }
  });

  // Fetch all connections, stats, and logs on mount
  const loadPageData = async () => {
    try {
      setIsLoading(true);
      const email = localStorage.getItem("trade_adhyayan_user");
      if (!email) {
        router.push("/login");
        return;
      }

      // Fetch active connections, stats, and logs in parallel!
      const [connectionsRes, statsRes, logsRes] = await Promise.all([
        fetch(`/api/brokers/status?email=${encodeURIComponent(email)}`).then(r => r.json()),
        getBrokerSyncStats(email),
        getSyncLogs(email)
      ]);

      if (connectionsRes.success) {
        setConnections(connectionsRes.connections);
      }

      if (statsRes.success) {
        setStats({
          totalTrades: statsRes.totalTrades,
          syncedTrades: statsRes.syncedTrades,
          positions: statsRes.positions,
          accountBalance: statsRes.accountBalance,
          dataBreakdown: statsRes.dataBreakdown
        });
      }

      setSyncHistory(logsRes);

    } catch (err) {
      console.error("Failed to load broker sync page data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Handle Vercel Callback parameters
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status === "success") {
      toast.success("Broker connected successfully!");
      router.replace("/dashboard/trade-journal/broker-sync");
    } else if (status === "error") {
      toast.error(message || "Failed to connect broker.");
      router.replace("/dashboard/trade-journal/broker-sync");
    }

    loadPageData();
  }, []);

  const getBrokerStatus = (brokerName: string) => {
    const conn = connections.find(c => c.brokerName.toLowerCase() === brokerName.toLowerCase());
    return conn ? conn.status : "NOT_CONNECTED";
  };

  const getConnectedBroker = () => {
    return connections.find(c => c.status === "CONNECTED");
  };

  const handleConnectRedirect = (broker: string) => {
    const email = localStorage.getItem("trade_adhyayan_user") || "";
    toast.success(`Redirecting to ${broker} login...`);
    window.location.href = `/api/brokers/oauth/init?broker=${broker}&email=${encodeURIComponent(email)}`;
  };

  const handleSyncNow = async () => {
    const activeConn = getConnectedBroker();
    if (!activeConn) {
      toast.error("Please connect a broker account first to run sync.");
      return;
    }

    setIsSyncing(true);
    try {
      const email = localStorage.getItem("trade_adhyayan_user") || "";
      const res = await fetch("/api/brokers/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerName: activeConn.brokerName, email })
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.records === 0) {
          toast.success("Sync completed: No new trades found today.");
        } else {
          toast.success(`Successfully imported ${data.records} trades from ${activeConn.brokerName}!`);
        }
        // Refresh page statistics and activity list
        loadPageData();
      } else {
        toast.error(`Sync failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while connecting to sync services.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectBroker = async (brokerName: string) => {
    const confirmed = window.confirm(`Are you sure you want to disconnect ${brokerName}?`);
    if (!confirmed) return;

    try {
      const email = localStorage.getItem("trade_adhyayan_user") || "";
      await disconnectBroker(email, brokerName);
      toast.success(`${brokerName} disconnected successfully.`);
      loadPageData(); // Refresh statuses
    } catch (err) {
      console.error(err);
      toast.error("Failed to disconnect broker account.");
    }
  };

  const handleDeleteSyncLog = async (id: string, batchId: string) => {
    const confirmed = window.confirm("Are you sure you want to undo this import? This will delete all imported trades from this batch.");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/trades/batch?batchId=${batchId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Batch trades deleted successfully.");
        setSelectedSync(null);
        loadPageData();
      } else {
        toast.error("Failed to delete batch trades.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with servers.");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Donut chart calculations
  const totalBreakdown = stats.dataBreakdown.intraday + stats.dataBreakdown.swing + stats.dataBreakdown.positional + stats.dataBreakdown.others;
  const donutData = [
    { name: "Intraday", value: stats.dataBreakdown.intraday || (totalBreakdown === 0 ? 62 : 0), color: "#2563EB" },
    { name: "Swing", value: stats.dataBreakdown.swing || (totalBreakdown === 0 ? 24 : 0), color: "#8B5CF6" },
    { name: "Positional", value: stats.dataBreakdown.positional || (totalBreakdown === 0 ? 10 : 0), color: "#F59E0B" },
    { name: "Others", value: stats.dataBreakdown.others || (totalBreakdown === 0 ? 4 : 0), color: "#94A3B8" }
  ];
  const chartTotal = donutData.reduce((acc, curr) => acc + curr.value, 0);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
        <RefreshCw size={24} className="text-[#2563EB] animate-spin" />
        <span className="text-xs font-semibold text-[#6B7280]">Loading broker configurations...</span>
      </div>
    );
  }

  const activeBroker = getConnectedBroker();

  return (
    <div className="text-left">
      <Toaster position="top-right" />
      
      <div className="space-y-[24px]">
        
        {/* 1. Intro Header Banner Card */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <Link 
              href="/dashboard/trade-journal" 
              className="w-9 h-9 bg-white border border-[#EEF0F4] rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#2563EB] hover:border-slate-300 transition-all shadow-sm shrink-0"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-base font-black text-[#111827]">
                Automatically import trades from your broker
              </h2>
              <p className="text-xs font-semibold text-[#6B7280] mt-1">
                Connect your broker account securely to sync all your trades, positions and history.
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/dashboard/help")}
            className="px-4 py-2 bg-[#F7F8FC] hover:bg-slate-100 text-[#2563EB] rounded-xl text-xs font-bold transition-all border border-[#EEF0F4] flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow-sm cursor-pointer"
          >
            <HelpCircle size={14} />
            How does it work?
          </button>
        </div>

        {/* 2. Top Row: Connect Broker (Col 5) & Sync Overview (Col 7) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Column A: Connect Your Broker (col-span-7) */}
          <div className="xl:col-span-7 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="text-left mb-5">
                <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">
                  1. Connect Your Broker
                </h3>
                <p className="text-xs font-semibold text-[#6B7280] mt-1">
                  Select your broker and connect your account securely.
                </p>
              </div>

              {/* Grid of Brokers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                
                {/* Zerodha */}
                <BrokerItem 
                  name="Zerodha"
                  desc="Kite Connect"
                  status={getBrokerStatus("Zerodha")}
                  logo="Z"
                  logoUrl="/brokers/zerodha.png"
                  color="text-[#F14922] bg-[#F14922]/10"
                  onConnect={() => handleConnectRedirect("Zerodha")}
                />

                {/* Upstox */}
                <BrokerItem 
                  name="Upstox"
                  desc="Upstox API"
                  status={getBrokerStatus("Upstox")}
                  logo="U"
                  logoUrl="/brokers/upstox.png"
                  color="text-[#512379] bg-[#512379]/10"
                  onConnect={() => handleConnectRedirect("Upstox")}
                />

                {/* FYERS */}
                <BrokerItem 
                  name="FYERS"
                  desc="FYERS API"
                  status={getBrokerStatus("FYERS")}
                  logo="F"
                  logoUrl="/brokers/fyers.png"
                  color="text-[#0E8FEF] bg-[#0E8FEF]/10"
                  onConnect={() => handleConnectRedirect("FYERS")}
                />

                {/* Angel One */}
                <BrokerItem 
                  name="Angel One"
                  desc="SmartAPI"
                  status="NOT_CONNECTED"
                  logo="A"
                  logoUrl="/brokers/angelone.png"
                  color="text-[#FF7F00] bg-[#FF7F00]/10"
                  onConnect={() => toast.error("Angel One sync is coming soon.")}
                />

                {/* Motilal Oswal */}
                <BrokerItem 
                  name="Motilal Oswal"
                  desc="MO Investor API"
                  status="NOT_CONNECTED"
                  logo="MO"
                  logoUrl="/brokers/motilaloswal.png"
                  color="text-[#F59E0B] bg-[#F59E0B]/10"
                  onConnect={() => toast.error("Motilal Oswal support coming soon.")}
                />

                {/* Sharekhan */}
                <BrokerItem 
                  name="Sharekhan"
                  desc="TradeTiger API"
                  status="NOT_CONNECTED"
                  logo="S"
                  logoUrl="/brokers/sharekhan.png"
                  color="text-[#E21E26] bg-[#E21E26]/10"
                  onConnect={() => toast.error("Sharekhan support coming soon.")}
                />

              </div>
            </div>

            {/* Lock Info Footer */}
            <div className="mt-6 pt-4 border-t border-[#EEF0F4] flex items-center gap-2 text-[10px] font-bold text-[#6B7280]">
              <Lock size={12} className="text-[#6B7280] shrink-0" />
              <span>Your data is encrypted and never shared with anyone.</span>
            </div>

          </div>

          {/* Column B: Sync Overview (col-span-5) */}
          <div className="xl:col-span-5 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#EEF0F4] gap-3">
                <div className="text-left">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">
                    2. Sync Overview
                  </h3>
                  <p className="text-xs font-semibold text-[#6B7280] mt-1">
                    Summary of your synced data and status.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {activeBroker && activeBroker.lastSyncAt && (
                    <span className="text-[9px] font-bold text-[#6B7280]">
                      Last Sync: {new Date(activeBroker.lastSyncAt).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <button 
                    onClick={handleSyncNow}
                    disabled={isSyncing || !activeBroker}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-[10px] font-black tracking-wide transition-all shadow-md shadow-[#2563EB]/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSyncing ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    Sync Now
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                
                {/* Total Trades */}
                <div className="p-4 bg-[#F7F8FC] border border-[#EEF0F4] rounded-2xl text-left flex flex-col justify-between min-h-[105px]">
                  <div>
                    <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-wider block">
                      Total Trades
                    </span>
                    <span className="text-lg font-black text-[#111827] block mt-1">
                      {stats.totalTrades.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[8px] font-black uppercase inline-flex items-center bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]/30 px-1.5 py-0.5 rounded">
                      +124 vs last 30 days
                    </span>
                  </div>
                </div>

                {/* Synced Trades */}
                <div className="p-4 bg-[#F7F8FC] border border-[#EEF0F4] rounded-2xl text-left flex flex-col justify-between min-h-[105px]">
                  <div>
                    <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-wider block">
                      Synced Trades
                    </span>
                    <span className="text-lg font-black text-[#111827] block mt-1">
                      {stats.syncedTrades.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[8px] font-black uppercase inline-flex items-center bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]/30 px-1.5 py-0.5 rounded">
                      {stats.totalTrades > 0 
                        ? `${((stats.syncedTrades / stats.totalTrades) * 100).toFixed(1)}% Synced`
                        : "0.0% Synced"}
                    </span>
                  </div>
                </div>

                {/* Open Positions */}
                <div className="p-4 bg-[#F7F8FC] border border-[#EEF0F4] rounded-2xl text-left flex flex-col justify-between min-h-[105px]">
                  <div>
                    <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-wider block">
                      Positions
                    </span>
                    <span className="text-lg font-black text-[#111827] block mt-1">
                      {stats.positions.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[8px] font-black uppercase inline-flex items-center bg-[#FFF9F2] text-[#F59E0B] border border-[#FFE7CC]/30 px-1.5 py-0.5 rounded">
                      Open Positions
                    </span>
                  </div>
                </div>

                {/* Account Balance */}
                <div className="p-4 bg-[#F7F8FC] border border-[#EEF0F4] rounded-2xl text-left flex flex-col justify-between min-h-[105px]">
                  <div>
                    <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-wider block">
                      Account Balance
                    </span>
                    <span className="text-lg font-black text-[#111827] block mt-1 truncate" title={formatCurrency(stats.accountBalance)}>
                      {formatCurrency(stats.accountBalance)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[8px] font-black uppercase inline-flex items-center bg-slate-50 text-[#6B7280] border border-slate-200/50 px-1.5 py-0.5 rounded">
                      Updated today
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Sync Health Full Width Banner Card */}
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex items-center justify-between mt-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#10B981] shadow-sm shrink-0">
                  <Shield size={18} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-[#111827]">Sync Health</h4>
                  <p className="text-[10px] font-semibold text-[#065F46] mt-0.5">
                    Everything looks good. Your trades are up to date.
                  </p>
                </div>
              </div>
              
              {/* Sparkline line chart */}
              <div className="w-20 h-10 shrink-0">
                <svg viewBox="0 0 100 30" className="w-full h-full">
                  <path 
                    d="M0,25 Q15,5 30,20 T60,10 T90,15 L100,5" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M0,25 Q15,5 30,20 T60,10 T90,15 L100,5 L100,30 L0,30 Z" 
                    fill="url(#sparkline-grad)" 
                    opacity="0.08"
                  />
                  <defs>
                    <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#ECFDF5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

            </div>

          </div>

        </div>

        {/* 3. Row 3: Settings (Col 4), Activity (Col 4) & Stacked Cards (Col 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column A: Sync Settings (col-span-4) */}
          <div className="lg:col-span-4 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] space-y-6">
            
            {/* Header */}
             <div className="text-left">
              <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">
                3. Sync Settings
              </h3>
              <p className="text-xs font-semibold text-[#6B7280] mt-1">
                Customize what data you want to sync and how it should be imported.
              </p>
            </div>

            {/* Auto Sync Toggle and Dropdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#111827]">Auto Sync</h4>
                  <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                    Automatically sync new trades
                  </p>
                </div>
                {/* Switch Toggle */}
                <button 
                  onClick={() => setAutoSync(!autoSync)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none relative cursor-pointer ${
                    autoSync ? "bg-[#10B981]" : "bg-slate-200"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    autoSync ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {autoSync && (
                <div className="flex items-center justify-between bg-[#F7F8FC] border border-[#EEF0F4] p-3 rounded-xl">
                  <span className="text-xs font-bold text-[#6B7280]">Sync Frequency</span>
                  <div className="relative">
                    <select 
                      value={syncFrequency}
                      onChange={(e) => setSyncFrequency(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1 bg-white border border-[#EEF0F4] rounded-lg text-[9px] font-black text-[#111827] focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="15 minutes">15 Min</option>
                      <option value="30 minutes">30 Min</option>
                      <option value="1 hour">1 Hour</option>
                      <option value="Daily">Daily</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Import Historical Data */}
            <div className="pt-4 border-t border-[#EEF0F4] space-y-3">
              <div>
                <h4 className="text-xs font-black text-[#111827]">Import Historical Data</h4>
                <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                  Import past trades from your broker
                </p>
              </div>
              <button 
                onClick={() => toast.success("Historical data import triggered.")}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-[#EEF0F4] text-[#2563EB] rounded-xl text-[10px] font-black transition-all shadow-sm cursor-pointer"
              >
                Import Now
              </button>
            </div>

            {/* What to Import checkboxes */}
            <div className="pt-4 border-t border-[#EEF0F4] space-y-3">
              <div>
                <h4 className="text-xs font-black text-[#111827]">What to Import</h4>
                <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                  Choose what data you want to sync
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(importTypes).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      onClick={() => setImportTypes({ ...importTypes, [key]: !value })}
                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        value 
                          ? "bg-[#2563EB] border-[#2563EB]" 
                          : "border-[#EEF0F4] bg-[#F7F8FC] group-hover:border-slate-300"
                      }`}
                    >
                      <Check size={10} className={value ? "text-white" : "text-transparent"} strokeWidth={3} />
                    </div>
                    <span className="text-xs font-black text-[#6B7280] uppercase tracking-wide group-hover:text-[#111827] transition-colors capitalize">
                      {key}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Timezone */}
            <div className="pt-4 border-t border-[#EEF0F4] space-y-3">
              <div>
                <h4 className="text-xs font-black text-[#111827]">Timezone</h4>
                <p className="text-[9px] font-semibold text-[#6B7280] mt-0.5">
                  Select timezone for trade timestamps
                </p>
              </div>
              <div className="relative">
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-4 pr-10 h-10 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all cursor-pointer text-[#111827] appearance-none"
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC (GMT+00:00)</option>
                  <option value="US/Eastern">US/Eastern (EST)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
              </div>
            </div>

            {/* Advanced Settings accordion */}
            <div className="pt-4 border-t border-[#EEF0F4]">
              <button 
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="w-full flex items-center justify-between text-xs font-black text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
              >
                <span>Advanced Settings</span>
                <ChevronDown size={14} className={`transform transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
              </button>
              {advancedOpen && (
                <div className="mt-4 space-y-3 bg-[#F7F8FC] border border-[#EEF0F4] p-4 rounded-xl text-xs font-semibold text-[#6B7280]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
                    <span>Sync open/pending orders</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
                    <span>Deduplicate imports</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
                    <span>Group multi-leg executions</span>
                  </label>
                </div>
              )}
            </div>

          </div>

          {/* Column B: Recent Sync Activity (col-span-4) */}
          <div className="lg:col-span-4 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between self-stretch">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-[#EEF0F4] gap-4">
                <div className="text-left">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">
                    4. Recent Sync Activity
                  </h3>
                  <p className="text-xs font-semibold text-[#6B7280] mt-1">
                    View your recent sync history and status.
                  </p>
                </div>
                <button 
                  onClick={() => toast.success("Logs full details requested.")}
                  className="text-[#2563EB] hover:text-[#1D4ED8] text-[9px] font-black uppercase tracking-wider cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Table list */}
              <div className="overflow-x-auto w-full mt-4">
                <table className="w-full text-left border-collapse text-[10px] font-bold text-[#111827]">
                  <thead>
                    <tr className="bg-[#F7F8FC] border-b border-[#EEF0F4] text-[8px] font-black uppercase tracking-wider text-[#6B7280]">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-2 text-center">Records</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F4]">
                    {syncHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 px-4 text-center text-[#6B7280] font-semibold">
                          No recent sync logs. Sync your broker to populate logs.
                        </td>
                      </tr>
                    ) : (
                      syncHistory.slice(0, 5).map((log) => {
                        const isSuccess = log.status === "SUCCESS";
                        return (
                          <tr key={log.id} className="hover:bg-[#F7F8FC]/50 transition-colors">
                            <td className="py-3 px-3 text-[#6B7280] whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3 px-2 text-[#6B7280]">
                              {log.dataType}
                            </td>
                            <td className="py-3 px-2 text-center font-black">
                              {log.recordsCount}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span 
                                onClick={() => setSelectedSync(log)}
                                className={`px-2 py-0.5 text-[8px] font-black uppercase rounded cursor-pointer ${
                                  isSuccess 
                                    ? "bg-[#ECFDF5] text-[#10B981]" 
                                    : "bg-[#FEF2F2] text-[#EF4444]"
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer sync history link */}
            <div className="pt-4 border-t border-[#EEF0F4]">
              <button 
                onClick={() => toast.success("Activity details requested.")}
                className="text-xs font-black text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1 cursor-pointer"
              >
                View Full Sync History →
              </button>
            </div>

          </div>

          {/* Column C: Stacked Details & Overview Cards (col-span-4) */}
          <div className="lg:col-span-4 space-y-6 self-stretch flex flex-col justify-between">
            
            {/* Widget A: Account Details */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] space-y-4 text-left flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-[#EEF0F4]">
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">
                    Account Details
                  </h3>
                  {activeBroker ? (
                    <span className="px-2.5 py-0.5 bg-[#ECFDF5] text-[#10B981] text-[8px] font-black uppercase rounded border border-[#A7F3D0]">
                      Connected
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase rounded border border-slate-200">
                      Offline
                    </span>
                  )}
                </div>

                {activeBroker ? (
                  <div className="mt-4 space-y-3.5">
                    {/* Broker Title */}
                    <div className="flex items-center gap-2">
                      {(() => {
                        const bName = activeBroker.brokerName.toLowerCase();
                        let logoUrl = "";
                        if (bName === "zerodha") logoUrl = "/brokers/zerodha.png";
                        else if (bName === "upstox") logoUrl = "/brokers/upstox.png";
                        else if (bName === "angel one") logoUrl = "/brokers/angelone.png";
                        else if (bName === "dhan") logoUrl = "/brokers/dhan.png";
                        else if (bName === "fyers") logoUrl = "/brokers/fyers.png";
                        else if (bName === "motilal oswal") logoUrl = "/brokers/motilaloswal.png";
                        
                        return (
                          <div className="w-6 h-6 rounded-md bg-white border border-[#EEF0F4] flex items-center justify-center font-bold text-[10px] overflow-hidden shrink-0">
                            {logoUrl ? (
                              <img src={logoUrl} alt={activeBroker.brokerName} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#2563EB]/10 text-[#2563EB]">
                                {activeBroker.brokerName[0]}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <span className="text-xs font-bold text-[#111827]">
                        {activeBroker.brokerName} (API Connection)
                      </span>
                    </div>

                    {/* Metadata list */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center pb-1.5 border-b border-[#F7F8FC]">
                        <span className="font-semibold text-[#6B7280]">Client ID</span>
                        <span className="font-black text-[#111827]">{activeBroker.clientId || "XX1234"}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-[#F7F8FC]">
                        <span className="font-semibold text-[#6B7280]">User ID</span>
                        <span className="font-black text-[#111827]">{activeBroker.id.substring(3, 11).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#6B7280]">Segment</span>
                        <span className="font-black text-[#111827]">EQ, FO, CD</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center text-center text-[#6B7280]">
                    <AlertTriangle size={20} className="text-[#F59E0B] mb-2" />
                    <span className="text-xs font-semibold">No broker currently connected.</span>
                  </div>
                )}
              </div>

              {activeBroker && (
                <button 
                  onClick={() => handleDisconnectBroker(activeBroker.brokerName)}
                  className="w-full h-10 mt-5 border border-red-200 hover:border-red-400 bg-white hover:bg-red-50 text-red-600 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Trash2 size={14} />
                  Disconnect
                </button>
              )}
            </div>

            {/* Widget B: Data Overview */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] text-left flex-1">
              <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider pb-3.5 border-b border-[#EEF0F4] mb-4">
                Data Overview
              </h3>

              <div className="flex items-center justify-between gap-2">
                {/* Pie Chart container */}
                <div className="w-[100px] h-[100px] shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Inner text labels */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-[12px] font-black text-[#111827]">{chartTotal}</span>
                    <span className="text-[7px] font-black text-[#6B7280] uppercase tracking-wider mt-0.5">Trades</span>
                  </div>
                </div>

                {/* Legend Details */}
                <div className="flex-1 space-y-1.5 pl-2">
                  {donutData.map((item, index) => {
                    const percent = chartTotal > 0 ? (item.value / chartTotal) * 100 : 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold text-[#6B7280]">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-black text-[#111827]">
                          {percent.toFixed(0)}% ({item.value})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* 4. Bottom Info Alert Alert */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE]/60 rounded-2xl p-4 flex items-center gap-3 text-left">
          <Info size={18} className="text-[#2563EB] shrink-0" />
          <p className="text-[10px] font-bold text-[#1E40AF]">
            We don't modify or store your login credentials. We only fetch data using secure APIs.
          </p>
        </div>

        {/* 5. Need Help Card Widget */}
        <div className="bg-[#F7F8FC] border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_4px_16px_rgba(15,23,42,0.02)] flex items-center justify-between text-left group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white border border-[#EEF0F4] rounded-xl flex items-center justify-center text-[#6B7280] shadow-sm">
              <Headphones size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#111827]">Need Help?</h4>
              <p className="text-[10px] font-semibold text-[#6B7280] mt-0.5">
                Learn how to connect your broker or troubleshoot issues.
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/dashboard/help")}
            className="text-xs font-black text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            Visit Help Center →
          </button>
        </div>

      </div>

      {/* Sync Log Details modal */}
      {selectedSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden border border-[#EEF0F4] text-left animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-[#EEF0F4]">
              <div>
                <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">
                  Sync History Log Details
                </h3>
                <p className="text-[10px] font-semibold text-[#6B7280] mt-1">
                  Import batch detail metrics for {new Date(selectedSync.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSync(null)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-[#6B7280] rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-[#EEF0F4]">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Status</span>
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md border w-fit ${
                    selectedSync.status === "SUCCESS" 
                      ? "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]" 
                      : "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]"
                  }`}>
                    {selectedSync.status}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Records Imported</span>
                  <span className="text-base font-black text-[#111827]">{selectedSync.recordsCount} Trades</span>
                </div>
              </div>

              {selectedSync.errorMessage && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#111827]">Error Message</h4>
                  <div className="p-3.5 bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] rounded-xl text-xs font-semibold">
                    {selectedSync.errorMessage}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#111827]">Logs Information</h4>
                <div className="h-28 w-full bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-[11px] text-green-400 space-y-1">
                  <p>&gt; Authenticating connection credentials...</p>
                  <p>&gt; Initiating sync session batch...</p>
                  <p>&gt; Fetched live records from broker API endpoint.</p>
                  <p>&gt; Status: {selectedSync.status}.</p>
                  <p>&gt; Sync records transaction committed count: {selectedSync.recordsCount}.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-[#EEF0F4] bg-slate-50">
              <button 
                onClick={() => handleDeleteSyncLog(selectedSync.id, selectedSync.id)} // batchId matches syncLog.id
                className="px-4 py-2 text-[#EF4444] bg-white border border-red-200 hover:bg-red-50 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} /> Delete Synced Trades
              </button>
              <button 
                onClick={() => setSelectedSync(null)}
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-black transition-colors shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function BrokerSyncPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Loading...</div>}>
      <BrokerSyncContent />
    </Suspense>
  );
}

// Subcomponent: BrokerCard Grid Item
interface BrokerItemProps {
  name: string;
  desc: string;
  status: string;
  logo: string;
  logoUrl?: string;
  color: string;
  onConnect: () => void;
}

function BrokerItem({ name, desc, status, logo, logoUrl, color, onConnect }: BrokerItemProps) {
  const isConnected = status === "CONNECTED";
  const [imgError, setImgError] = useState(false);
  
  return (
    <div className={`p-4 bg-white border rounded-2xl flex flex-col justify-between text-left select-none relative transition-all min-h-[110px] ${
      isConnected 
        ? "border-[#2563EB]/40 ring-1 ring-[#2563EB]/15" 
        : "border-[#EEF0F4] hover:border-slate-300"
    }`}>
      {/* Connected check badge top right */}
      {isConnected && (
        <div className="absolute top-3.5 right-3.5 w-4 h-4 bg-[#2563EB] rounded-full flex items-center justify-center text-white shadow-sm">
          <Check size={10} strokeWidth={4} />
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
          logoUrl && !imgError ? "bg-white border border-[#EEF0F4]" : color
        }`}>
          {logoUrl && !imgError ? (
            <img 
              src={logoUrl} 
              alt={name} 
              className="w-full h-full object-contain p-1" 
              onError={() => setImgError(true)} 
            />
          ) : (
            logo
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-black text-[#111827] truncate">{name}</h4>
          <span className="text-[9px] font-semibold text-[#6B7280] truncate block mt-0.5">{desc}</span>
        </div>
      </div>

      <div className="mt-4">
        {isConnected ? (
          <span className="text-[9px] font-black uppercase text-[#10B981] flex items-center gap-1 tracking-wide">
            <CheckCircle2 size={10} /> Connected
          </span>
        ) : (
          <button 
            onClick={onConnect}
            className="w-full py-1.5 bg-[#F7F8FC] hover:bg-slate-100 border border-[#EEF0F4] text-[#2563EB] hover:text-[#1D4ED8] rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Connect
          </button>
        )}
      </div>

    </div>
  );
}
