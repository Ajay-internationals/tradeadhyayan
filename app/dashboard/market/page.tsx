"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  LineChart, 
  Calendar, 
  Globe, 
  LayoutGrid, 
  Flame, 
  RefreshCw, 
  Link2, 
  Plus, 
  PlusCircle, 
  Trash, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Bell, 
  Scale, 
  Zap, 
  Search, 
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

// Helper component to load TradingView widgets safely
const TradingViewWidget = ({ id, src, config, height = "100%", width = "100%" }: { id?: string, src: string, config: any, height?: string | number, width?: string | number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear the container first to prevent duplicate widgets in React Strict Mode
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [src, config]);

  return <div id={id || config.container_id} className="tradingview-widget-container" ref={containerRef} style={{ height, width }}></div>;
};

type SubTab = "overview" | "chart" | "watchlist" | "optionchain" | "heatmap" | "breadth" | "scanner" | "bias" | "alerts";

export default function MarketViewPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("overview");
  const [userEmail, setUserEmail] = useState<string>("");
  const [indicesData, setIndicesData] = useState<any[]>([]);
  const [breadthData, setBreadthData] = useState<any>(null);
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>("");
  const [optionChainSymbol, setOptionChainSymbol] = useState<string>("NIFTY");
  const [optionChainExpiry, setOptionChainExpiry] = useState<string>("");
  const [optionChainData, setOptionChainData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [scannerData, setScannerData] = useState<any>(null);
  const [biasData, setBiasData] = useState<any>(null);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [brokerConnections, setBrokerConnections] = useState<any[]>([]);
  const [sandboxTicks, setSandboxTicks] = useState(false);
  
  // Dialog / Modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAddWatchlistModal, setShowAddWatchlistModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newWatchlistItemSymbol, setNewWatchlistItemSymbol] = useState("");
  
  // Alert form state
  const [alertSymbol, setAlertSymbol] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertDirection, setAlertDirection] = useState<"ABOVE" | "BELOW">("ABOVE");

  // Visual polling state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [triggeredAlertBanner, setTriggeredAlertBanner] = useState<string | null>(null);

  // Check if Indian market is currently open (9:15 AM - 3:30 PM, Mon-Fri IST)
  const isMarketOpenIST = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 3600000 * 5.5);
    const day = ist.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hours = ist.getHours();
    const minutes = ist.getMinutes();
    const timeNum = hours * 100 + minutes;
    return day >= 1 && day <= 5 && timeNum >= 915 && timeNum <= 1530;
  };

  // Retrieve user email from localStorage
  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user") || "default_user@tradeadhyayan.com";
    setUserEmail(email);
    // Initialize sandbox simulation to true if market is open, otherwise false (static)
    setSandboxTicks(isMarketOpenIST());
  }, []);

  // Fetch all live market components
  const fetchAllData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const emailParam = encodeURIComponent(userEmail);
      
      // 1. Fetch indices snapshot
      const snapshotRes = await fetch(`/api/market/snapshot?email=${emailParam}&sandbox=${sandboxTicks}`);
      const snapshotJson = await snapshotRes.json();
      if (snapshotJson.success) {
        setIndicesData(snapshotJson.indices || []);
        setBreadthData(snapshotJson.breadth || null);
      }

      // 2. Fetch watchlists
      const watchlistRes = await fetch(`/api/market/watchlist?email=${emailParam}&sandbox=${sandboxTicks}`);
      const watchlistJson = await watchlistRes.json();
      if (watchlistJson.success) {
        setWatchlists(watchlistJson.watchlists || []);
        if (watchlistJson.watchlists.length > 0 && !activeWatchlistId) {
          setActiveWatchlistId(watchlistJson.watchlists[0].id);
        }
      }

      // 3. Fetch option chain (based on selected symbol and expiry)
      const expiryQuery = optionChainExpiry ? `&expiry=${optionChainExpiry}` : "";
      const optionRes = await fetch(`/api/market/option-chain?symbol=${optionChainSymbol}&sandbox=${sandboxTicks}${expiryQuery}`);
      const optionJson = await optionRes.json();
      if (optionJson.success) {
        setOptionChainData(optionJson);
        if (!optionChainExpiry && optionJson.expiries && optionJson.expiries.length > 0) {
          setOptionChainExpiry(optionJson.expiry);
        }
      }

      // 4. Fetch sector heatmap
      const heatmapRes = await fetch(`/api/market/sector-heatmap?sandbox=${sandboxTicks}`);
      const heatmapJson = await heatmapRes.json();
      if (heatmapJson.success) {
        setHeatmapData(heatmapJson.sectors || []);
      }

      // 5. Fetch setups scanner
      const scannerRes = await fetch(`/api/market/scanner?sandbox=${sandboxTicks}`);
      const scannerJson = await scannerRes.json();
      if (scannerJson.success) {
        setScannerData(scannerJson);
      }

      // 6. Fetch bias score
      const biasRes = await fetch(`/api/market/bias-score?sandbox=${sandboxTicks}`);
      const biasJson = await biasRes.json();
      if (biasJson.success) {
        setBiasData(biasJson);
      }

      // 7. Fetch active alerts
      const alertsRes = await fetch(`/api/market/alerts?email=${emailParam}`);
      const alertsJson = await alertsRes.json();
      if (alertsJson.success) {
        setAlertsData(alertsJson.alerts || []);
      }

      // 8. Fetch broker connection status
      const brokerRes = await fetch(`/api/brokers/status?email=${emailParam}`);
      const brokerJson = await brokerRes.json();
      if (brokerJson.success) {
        setBrokerConnections(brokerJson.connections || []);
      }

      setLastUpdated(new Date());

      // Evaluate price crossing alerts against simulated rates
      if (alertsJson.alerts && snapshotJson.indices) {
        const activeAlerts = alertsJson.alerts.filter((a: any) => a.status === "ACTIVE");
        activeAlerts.forEach((alert: any) => {
          // Check index or stock matching alert
          const matchedIndex = snapshotJson.indices.find((i: any) => i.symbol === alert.symbol);
          if (matchedIndex) {
            const currentLtp = matchedIndex.ltp;
            let triggered = false;
            if (alert.direction === "ABOVE" && currentLtp >= alert.price) triggered = true;
            if (alert.direction === "BELOW" && currentLtp <= alert.price) triggered = true;

            if (triggered) {
              setTriggeredAlertBanner(`Alert Triggered! ${alert.symbol} crossed ${alert.direction} level ${alert.price} (LTP: ${currentLtp})`);
              // Play a light audio cue or trigger status update
              fetch(`/api/market/alerts?email=${emailParam}&id=${alert.id}`, { method: "DELETE" }); // mock clear alert
            }
          }
        });
      }

    } catch (err) {
      console.error("Error fetching market statistics:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Poll for data updates every 4 seconds to simulate active socket feed
  useEffect(() => {
    if (!userEmail) return;
    fetchAllData();

    const interval = setInterval(() => {
      fetchAllData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [userEmail, optionChainSymbol, optionChainExpiry, sandboxTicks]);

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);

  // Broker OAuth Connect Initiator
  const handleConnectBrokerRedirect = (brokerName: string) => {
    window.open(`/api/broker/connect/${brokerName}?email=${encodeURIComponent(userEmail)}`, "_blank");
    setShowConnectModal(false);
    // Refresh connections in 5 seconds
    setTimeout(fetchAllData, 5000);
  };

  // Create Watchlist
  const handleCreateWatchlist = async () => {
    if (!newWatchlistName) return;
    try {
      const res = await fetch("/api/market/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_watchlist",
          email: userEmail,
          name: newWatchlistName
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewWatchlistName("");
        setShowAddWatchlistModal(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Watchlist
  const handleDeleteWatchlist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this watchlist?")) return;
    try {
      const res = await fetch(`/api/market/watchlist?email=${encodeURIComponent(userEmail)}&action=delete_watchlist&id=${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setActiveWatchlistId("");
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Watchlist Symbol
  const handleAddWatchlistSymbol = async () => {
    if (!newWatchlistItemSymbol || !activeWatchlistId) return;
    try {
      const res = await fetch("/api/market/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_item",
          email: userEmail,
          watchlistId: activeWatchlistId,
          symbol: newWatchlistItemSymbol.toUpperCase().trim(),
          exchange: "NSE"
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewWatchlistItemSymbol("");
        fetchAllData();
      } else {
        alert(json.error || "Failed to add symbol");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Remove Watchlist Symbol
  const handleRemoveWatchlistSymbol = async (itemId: string) => {
    try {
      const res = await fetch(`/api/market/watchlist?email=${encodeURIComponent(userEmail)}&action=remove_item&id=${itemId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Alert
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertSymbol || !alertPrice) return;
    try {
      const res = await fetch("/api/market/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          symbol: alertSymbol.toUpperCase().trim(),
          price: parseFloat(alertPrice),
          direction: alertDirection
        })
      });
      const json = await res.json();
      if (json.success) {
        setAlertSymbol("");
        setAlertPrice("");
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Alert
  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/market/alerts?email=${encodeURIComponent(userEmail)}&id=${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSubTabClass = (tab: SubTab) => {
    const isSelected = activeSubTab === tab;
    return `px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
      isSelected 
        ? "bg-[#F4F0FF] text-[#7C3AED] border-[#7C3AED]/20 shadow-sm" 
        : "bg-white text-[#64748B] border-[#E9E6F5] hover:text-[#0F172A] hover:bg-slate-50"
    }`;
  };

  const formatLargeNum = (num: number) => {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(num);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFF] p-6 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Triggered Alert Notification Banner */}
        {triggeredAlertBanner && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-bounce">
            <div className="flex items-center gap-3">
              <Bell className="text-amber-600 animate-swing" size={20} />
              <span className="font-bold text-sm">{triggeredAlertBanner}</span>
            </div>
            <button 
              onClick={() => setTriggeredAlertBanner(null)} 
              className="text-amber-500 hover:text-amber-700 font-bold text-xs uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#E9E6F5]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Market View</h1>
              
              {isMarketOpenIST() ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-black tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Market Open
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-full text-[10px] font-black tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Market Closed
                  </div>
                  <button
                    onClick={() => setSandboxTicks(!sandboxTicks)}
                    title="Toggle simulated price ticks on weekends"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all ${
                      sandboxTicks 
                        ? "bg-[#F4F0FF] text-[#7C3AED] border border-[#7C3AED]/25" 
                        : "bg-white text-[#64748B] border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Zap size={10} className={sandboxTicks ? "fill-[#7C3AED]" : ""} />
                    {sandboxTicks ? "Sandbox Ticks On" : "Enable Sandbox Ticks"}
                  </button>
                </div>
              )}
            </div>
            <p className="text-[#64748B] font-medium mt-1.5 text-sm">
              Live market snapshot, option chain, sectors, watchlist and trade setup scanner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchAllData()}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E9E6F5] hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#7C3AED]" : ""} />
              Refresh
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E9E6F5] hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Link2 size={14} className="text-[#7C3AED]" />
              Connect Broker
            </button>
            <button
              onClick={() => setShowAddWatchlistModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E9E6F5] hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Plus size={14} className="text-[#7C3AED]" />
              Add Watchlist
            </button>
            <button
              onClick={() => setActiveSubTab("chart")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs rounded-xl shadow-lg shadow-[#7C3AED]/20 transition-all"
            >
              <LineChart size={14} />
              TradingView Chart
            </button>
          </div>
        </div>

        {/* 9 Horizontal Navigation Sub-tabs */}
        <div className="overflow-x-auto pb-2 flex gap-1.5 scrollbar-thin">
          <button onClick={() => setActiveSubTab("overview")} className={getSubTabClass("overview")}>Overview</button>
          <button onClick={() => setActiveSubTab("chart")} className={getSubTabClass("chart")}>Live Chart</button>
          <button onClick={() => setActiveSubTab("watchlist")} className={getSubTabClass("watchlist")}>Watchlist</button>
          <button onClick={() => setActiveSubTab("optionchain")} className={getSubTabClass("optionchain")}>Option Chain</button>
          <button onClick={() => setActiveSubTab("heatmap")} className={getSubTabClass("heatmap")}>Sector Heatmap</button>
          <button onClick={() => setActiveSubTab("breadth")} className={getSubTabClass("breadth")}>Market Breadth</button>
          <button onClick={() => setActiveSubTab("scanner")} className={getSubTabClass("scanner")}>Setup Scanner</button>
          <button onClick={() => setActiveSubTab("bias")} className={getSubTabClass("bias")}>Pre-Market Bias</button>
          <button onClick={() => setActiveSubTab("alerts")} className={getSubTabClass("alerts")}>Alerts</button>
        </div>

        {/* --- SUB-TAB CONTENTS --- */}

        {/* 1. OVERVIEW */}
        {activeSubTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Live Indices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {indicesData.map((idx) => {
                const isGreen = idx.change >= 0;
                return (
                  <div key={idx.symbol} className="bg-white p-5 rounded-3xl shadow-sm shadow-[#7C3AED]/5 border border-[#E9E6F5] flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">{idx.symbol}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          idx.trend === "Bullish" ? "bg-emerald-50 text-emerald-600" :
                          idx.trend === "Bearish" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                        }`}>
                          {idx.trend}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mt-2">{formatLargeNum(idx.ltp)}</h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Change:</span>
                        <span className={`font-black ${isGreen ? "text-[#15B77A]" : "text-[#E94B8A]"}`}>
                          {isGreen ? "+" : ""}{idx.change} ({isGreen ? "+" : ""}{idx.changePercent}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-medium">Range:</span>
                        <span className="text-[#0F172A] font-bold">{idx.range}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-medium">Vol:</span>
                        <span className="text-slate-600 font-semibold">{idx.volume}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indices summary breadth panel */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-[#E9E6F5] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                    <Scale className="text-[#7C3AED]" size={18} />
                    Market Breadth
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Advance decline ratio of the Nifty universe</p>
                  
                  {breadthData && (
                    <div className="mt-6 space-y-4">
                      {/* Advances declines meter */}
                      <div className="flex justify-between items-end text-xs font-bold">
                        <span className="text-emerald-500">{breadthData.advancingStocks} Advances</span>
                        <span className="text-slate-400">{breadthData.unchangedStocks} Unchanged</span>
                        <span className="text-rose-500">{breadthData.decliningStocks} Declines</span>
                      </div>
                      
                      <div className="h-3 rounded-full bg-slate-100 flex overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(breadthData.advancingStocks/50)*100}%` }}></div>
                        <div className="bg-slate-300 h-full" style={{ width: `${(breadthData.unchangedStocks/50)*100}%` }}></div>
                        <div className="bg-rose-500 h-full" style={{ width: `${(breadthData.decliningStocks/50)*100}%` }}></div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4 text-center">
                        <div className="bg-[#FAFBFF] p-3 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">A/D Ratio</p>
                          <p className="text-xl font-black text-slate-800 mt-0.5">{breadthData.advanceDeclineRatio}</p>
                        </div>
                        <div className="bg-[#FAFBFF] p-3 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Outlook</p>
                          <p className="text-sm font-black text-emerald-600 mt-1.5">{breadthData.breadth}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-2xl text-[11px] text-slate-500 leading-relaxed font-medium">
                  <strong>Daily Breadth Tip:</strong> Advancing volume outweighs declining volume today, indicating accumulation. Follow breakouts on strong volume and avoid counter trend shorting.
                </div>
              </div>

              {/* Movers lists */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E9E6F5] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                    <Flame className="text-amber-500" size={18} />
                    Top Index Movers
                  </h3>
                  <span className="text-[11px] text-[#64748B] font-bold bg-[#FAFBFF] px-2.5 py-1 rounded-lg border border-slate-100">Nifty Stocks</span>
                </div>

                {breadthData && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp size={14} className="text-emerald-500"/> Top Gainers</h4>
                      <div className="divide-y divide-slate-100">
                        {breadthData.topGainers.map((g: any) => (
                          <div key={g.symbol} className="flex justify-between items-center py-2 text-xs">
                            <span className="font-black text-slate-800">{g.symbol}</span>
                            <div className="text-right">
                              <p className="font-bold text-slate-700">₹{g.ltp}</p>
                              <p className="text-[10px] font-black text-emerald-600">+{g.changePct}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingDown size={14} className="text-rose-500"/> Top Losers</h4>
                      <div className="divide-y divide-slate-100">
                        {breadthData.topLosers.map((l: any) => (
                          <div key={l.symbol} className="flex justify-between items-center py-2 text-xs">
                            <span className="font-black text-slate-800">{l.symbol}</span>
                            <div className="text-right">
                              <p className="font-bold text-slate-700">₹{l.ltp}</p>
                              <p className="text-[10px] font-black text-rose-600">{l.changePct}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. LIVE CHART */}
        {activeSubTab === "chart" && (
          <div className="bg-white rounded-3xl border border-[#E9E6F5] p-2 shadow-sm min-h-[600px] flex flex-col animate-fadeIn overflow-hidden">
            <div className="p-3 border-b border-[#E9E6F5] flex justify-between items-center">
              <span className="text-xs font-black text-slate-700">TradingView Advanced Core Chart</span>
              <span className="text-[10px] font-semibold text-slate-400">Indicators preloaded: VWAP, RSI, ADX, Supertrend, EMA 9/30, Bollinger Bands</span>
            </div>
            <div className="flex-1 w-full h-[550px]">
              <TradingViewWidget 
                src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                config={{
                  autosize: true,
                  symbol: "NSE:NIFTY",
                  interval: "5",
                  timezone: "Asia/Kolkata",
                  theme: "light",
                  style: "1",
                  locale: "in",
                  enable_publishing: false,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  gridColor: "rgba(233, 230, 245, 1)",
                  hide_top_toolbar: false,
                  hide_legend: false,
                  save_image: false,
                  container_id: "tradingview_advanced_chart_widget",
                  studies: [
                    "RSI@tv-basicstudies",
                    "MASimple@tv-basicstudies",
                    "BollingerBands@tv-basicstudies"
                  ],
                  show_popup_button: true,
                  support_host: "https://www.tradingview.com"
                }}
              />
            </div>
          </div>
        )}

        {/* 3. WATCHLIST */}
        {activeSubTab === "watchlist" && (
          <div className="bg-white rounded-3xl border border-[#E9E6F5] p-6 shadow-sm space-y-6 animate-fadeIn">
            {/* Watchlist headers */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-black text-[#64748B] uppercase tracking-wider">Select Watchlist:</span>
                <select
                  value={activeWatchlistId}
                  onChange={(e) => setActiveWatchlistId(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#E9E6F5] text-xs font-bold rounded-xl text-slate-700 outline-none"
                >
                  {watchlists.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {activeWatchlistId && (
                  <button
                    onClick={() => handleDeleteWatchlist(activeWatchlistId)}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 px-2 py-1 rounded-lg"
                  >
                    <Trash size={12} /> Delete List
                  </button>
                )}
              </div>

              {/* Add item inline */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Stock Symbol (e.g. INFYS)"
                  value={newWatchlistItemSymbol}
                  onChange={(e) => setNewWatchlistItemSymbol(e.target.value)}
                  className="px-3 py-1.5 border border-[#E9E6F5] rounded-xl text-xs font-bold outline-none w-52 placeholder-slate-400"
                />
                <button
                  onClick={handleAddWatchlistSymbol}
                  className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-md shadow-purple-500/10"
                >
                  <PlusCircle size={14} /> Add Symbol
                </button>
              </div>
            </div>

            {/* Watchlist table */}
            {activeWatchlist && activeWatchlist.items && activeWatchlist.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="text-[#64748B] border-b border-[#E9E6F5] uppercase tracking-wider font-bold">
                      <th className="pb-3 pl-2">Symbol</th>
                      <th className="pb-3 text-right">LTP</th>
                      <th className="pb-3 text-right">Change %</th>
                      <th className="pb-3 text-right">Volume</th>
                      <th className="pb-3 text-right">Day High</th>
                      <th className="pb-3 text-right">Day Low</th>
                      <th className="pb-3 text-center">Trend Signal</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeWatchlist.items.map((item: any) => {
                      const isGreen = item.change >= 0;
                      return (
                        <tr key={item.id} className="hover:bg-[#FAFBFF] transition-colors">
                          <td className="py-4 pl-2 font-black text-[#0F172A]">{item.symbol}</td>
                          <td className="py-4 text-right font-bold text-slate-800">₹{formatLargeNum(item.ltp)}</td>
                          <td className={`py-4 text-right font-black ${isGreen ? "text-emerald-600" : "text-rose-600"}`}>
                            {isGreen ? "+" : ""}{item.changePercent}%
                          </td>
                          <td className="py-4 text-right text-slate-600 font-medium">{item.volume}</td>
                          <td className="py-4 text-right text-slate-600 font-medium">₹{formatLargeNum(item.dayHigh)}</td>
                          <td className="py-4 text-right text-slate-600 font-medium">₹{formatLargeNum(item.dayLow)}</td>
                          <td className="py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              item.signal === "Bullish" ? "bg-emerald-50 text-emerald-600" :
                              item.signal === "Bearish" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                            }`}>
                              {item.signal}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleRemoveWatchlistSymbol(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50"
                            >
                              <Trash size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium">
                No symbols added to this watchlist. Enter a symbol above to add your first stock tracking.
              </div>
            )}
          </div>
        )}

        {/* 4. OPTION CHAIN */}
        {activeSubTab === "optionchain" && (
          <div className="bg-white rounded-3xl border border-[#E9E6F5] p-6 shadow-sm space-y-6 animate-fadeIn">
            {/* Option chain controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-[#64748B] uppercase tracking-wider">Select Symbol:</span>
                <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-xl">
                  {["NIFTY", "BANKNIFTY", "SENSEX"].map(sym => (
                    <button
                      key={sym}
                      onClick={() => setOptionChainSymbol(sym)}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                        optionChainSymbol === sym ? "bg-white text-[#7C3AED] shadow-sm" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {optionChainData && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#64748B] uppercase tracking-wider">Expiry Date:</span>
                  <select
                    value={optionChainExpiry}
                    onChange={(e) => setOptionChainExpiry(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-[#E9E6F5] text-xs font-bold rounded-xl text-slate-700 outline-none"
                  >
                    {optionChainData.expiries.map((exp: string) => (
                      <option key={exp} value={exp}>{new Date(exp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Calculations header summary */}
            {optionChainData && optionChainData.metrics && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 bg-[#FAFBFF] p-4 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PCR Ratio</span>
                  <p className="text-lg font-black text-slate-800 mt-0.5">{optionChainData.metrics.pcr}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PCR Sentiment</span>
                  <p className={`text-sm font-black mt-1 ${
                    optionChainData.metrics.bias === "Bullish" ? "text-emerald-600" :
                    optionChainData.metrics.bias === "Bearish" ? "text-rose-600" : "text-slate-500"
                  }`}>{optionChainData.metrics.bias}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Max Pain Strike</span>
                  <p className="text-lg font-black text-slate-800 mt-0.5">{optionChainData.metrics.maxPain}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Support (Max PE OI)</span>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">{optionChainData.metrics.support}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Resistance (Max CE OI)</span>
                  <p className="text-lg font-black text-rose-600 mt-0.5">{optionChainData.metrics.resistance}</p>
                </div>
              </div>
            )}

            {/* Option chain grid table */}
            {optionChainData && optionChainData.rows ? (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-center text-[11px] divide-y divide-slate-100 whitespace-nowrap">
                  <thead className="bg-slate-50 text-[#64748B] font-bold text-xs">
                    <tr>
                      <th colSpan={3} className="py-2.5 border-r border-slate-200">CALL OPTIONS (CE)</th>
                      <th className="py-2.5">STRIKE</th>
                      <th colSpan={3} className="py-2.5 border-l border-slate-200">PUT OPTIONS (PE)</th>
                    </tr>
                    <tr className="border-t border-slate-200 text-[10px]">
                      <th className="py-2">CE OI</th>
                      <th className="py-2">CE LTP</th>
                      <th className="py-2 border-r border-slate-200">IV</th>
                      <th className="py-2 bg-slate-100 text-slate-800">Strike Price</th>
                      <th className="py-2 border-l border-slate-200">IV</th>
                      <th className="py-2">PE LTP</th>
                      <th className="py-2">PE OI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {optionChainData.rows.map((row: any) => {
                      const isAtm = row.strike === optionChainData.atmStrike;
                      return (
                        <tr 
                          key={row.strike} 
                          className={`hover:bg-[#FAFBFF] transition-colors ${isAtm ? "bg-purple-50/40 hover:bg-purple-50" : ""}`}
                        >
                          {/* CALLS */}
                          <td className={`py-2 text-slate-500 ${row.ce.isITM ? "bg-amber-50/20" : ""}`}>
                            {formatLargeNum(row.ce.oi)}
                          </td>
                          <td className={`py-2 font-bold text-slate-800 ${row.ce.isITM ? "bg-amber-50/20" : ""}`}>
                            ₹{row.ce.ltp}
                          </td>
                          <td className={`py-2 text-slate-400 border-r border-slate-200 ${row.ce.isITM ? "bg-amber-50/20" : ""}`}>
                            {row.ce.iv}%
                          </td>

                          {/* STRIKE */}
                          <td className={`py-2 font-black text-slate-900 bg-slate-50/50 ${isAtm ? "border-y-2 border-purple-400 font-black text-purple-700 bg-purple-100/30" : ""}`}>
                            {row.strike}
                          </td>

                          {/* PUTS */}
                          <td className={`py-2 text-slate-400 border-l border-slate-200 ${row.pe.isITM ? "bg-amber-50/20" : ""}`}>
                            {row.pe.iv}%
                          </td>
                          <td className={`py-2 font-bold text-slate-800 ${row.pe.isITM ? "bg-amber-50/20" : ""}`}>
                            ₹{row.pe.ltp}
                          </td>
                          <td className={`py-2 text-slate-500 ${row.pe.isITM ? "bg-amber-50/20" : ""}`}>
                            {formatLargeNum(row.pe.oi)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 font-medium">
                Loading Option Chain metrics...
              </div>
            )}
          </div>
        )}

        {/* 5. SECTOR HEATMAP */}
        {activeSubTab === "heatmap" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-[#E9E6F5] shadow-sm">
              <h3 className="text-lg font-black text-[#0F172A] mb-2 tracking-tight">Indices Sector Heatmap</h3>
              <p className="text-xs text-slate-400 font-medium">Heat color matches sector index daily gain percentages.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                {heatmapData.map((sec) => {
                  let bgClass = "bg-slate-50 border-slate-100 text-slate-600";
                  if (sec.heatColor === "strong-green") bgClass = "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10";
                  else if (sec.heatColor === "light-green") bgClass = "bg-emerald-50 border-emerald-100 text-emerald-700";
                  else if (sec.heatColor === "strong-red") bgClass = "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/10";
                  else if (sec.heatColor === "light-red") bgClass = "bg-rose-50 border-rose-100 text-rose-700";

                  const isWhiteText = sec.heatColor === "strong-green" || sec.heatColor === "strong-red";
                  const isGreen = sec.changePercent >= 0;

                  return (
                    <div 
                      key={sec.name} 
                      className={`p-5 rounded-2xl border flex flex-col justify-between h-28 hover:scale-105 transition-all ${bgClass}`}
                    >
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isWhiteText ? "text-white/80" : "text-[#64748B]"}`}>
                        {sec.name}
                      </span>
                      <div className="mt-4">
                        <p className={`text-lg font-black ${isWhiteText ? "text-white" : "text-slate-800"}`}>
                          ₹{formatLargeNum(sec.ltp)}
                        </p>
                        <p className={`text-xs font-bold ${isWhiteText ? "text-white/95" : isGreen ? "text-emerald-600" : "text-rose-600"}`}>
                          {isGreen ? "+" : ""}{sec.changePercent}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Embedded TradingView widget heatmap */}
            <div className="bg-white rounded-3xl border border-[#E9E6F5] p-2 shadow-sm h-[400px]">
              <TradingViewWidget 
                src="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
                config={{
                  exchanges: ["BSE"],
                  dataSource: "SENSEX",
                  grouping: "sector",
                  blockSize: "market_cap_basic",
                  blockColor: "change",
                  locale: "in",
                  symbolUrl: "",
                  colorTheme: "light",
                  hasTopBar: true,
                  isDataSetEnabled: true,
                  isZoomEnabled: true,
                  hasSymbolTooltip: true,
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
          </div>
        )}

        {/* 6. MARKET BREADTH */}
        {activeSubTab === "breadth" && (
          <div className="bg-white rounded-3xl border border-[#E9E6F5] p-6 shadow-sm space-y-8 animate-fadeIn">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Market Breadth Indicators</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Constituents analysis and trading outlook stats.</p>
            </div>

            {breadthData ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advancing Constituents</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{breadthData.advancingStocks}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">Active buyers on index stock universe</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Declining Constituents</p>
                  <p className="text-3xl font-black text-rose-500 mt-1">{breadthData.decliningStocks}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">Active sellers on index stock universe</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unchanged Stocks</p>
                  <p className="text-3xl font-black text-slate-500 mt-1">{breadthData.unchangedStocks}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">Sideways rangebound constituents</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume Buzzers buzz</p>
                  <p className="text-xl font-black text-purple-600 mt-1.5">Active Buzz</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">Stocks showing abnormal volume spikes</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">Loading breadth statistics...</div>
            )}

            {breadthData && (
              <div className="grid lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Volume Buzzers */}
                <div className="bg-[#FAFBFF] p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Volume Buzzers Today</h4>
                  <div className="divide-y divide-slate-100">
                    {breadthData.volumeBuzzers.map((b: any) => (
                      <div key={b.symbol} className="flex justify-between items-center py-2.5 text-xs">
                        <span className="font-black text-slate-800">{b.symbol}</span>
                        <span className="font-bold text-slate-700">₹{b.ltp}</span>
                        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-600 rounded-lg font-black text-[10px]">
                          {b.volumeMul} Volume
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 52 Week Highs and Lows */}
                <div className="bg-[#FAFBFF] p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500"/> 52-Week High Breakouts</h4>
                    <div className="flex flex-wrap gap-2">
                      {breadthData.high52Weeks.map((sym: string) => (
                        <span key={sym} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black border border-emerald-100">{sym}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertTriangle size={14} className="text-rose-500"/> 52-Week Low Breakdowns</h4>
                    <div className="flex flex-wrap gap-2">
                      {breadthData.low52Weeks.map((sym: string) => (
                        <span key={sym} className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-black border border-rose-100">{sym}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. SETUP SCANNER */}
        {activeSubTab === "scanner" && (
          <div className="bg-white rounded-3xl border border-[#E9E6F5] p-6 shadow-sm space-y-8 animate-fadeIn">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <Search className="text-[#7C3AED]" size={20} />
                Trade Setup Scanner
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Scans the instrument list periodically for intraday setup opportunities.</p>
            </div>

            {scannerData ? (
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* 9:30 Breakout */}
                <div className="bg-[#FAFBFF] p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">9:30 Breakout</h4>
                      <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">15m Range</span>
                    </div>
                    
                    <div className="space-y-3">
                      {scannerData.breakout.length > 0 ? (
                        scannerData.breakout.map((b: any) => (
                          <div 
                            key={b.symbol} 
                            onClick={() => {
                              setActiveSubTab("chart");
                            }}
                            className="bg-white p-3 rounded-xl border border-slate-100 hover:border-[#7C3AED]/35 cursor-pointer transition-all"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-black text-slate-800">{b.symbol}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${b.signal === "BUY" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{b.signal}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-medium">
                              <div><p>LTP</p><p className="font-bold text-slate-700">₹{b.ltp}</p></div>
                              <div><p>High</p><p className="font-bold text-slate-700">₹{b.rangeHigh}</p></div>
                              <div><p>Vol Spike</p><p className="font-black text-purple-600">{b.volume}</p></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-6 text-center">No breakout setups detected</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* VWAP Trend */}
                <div className="bg-[#FAFBFF] p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">VWAP Trend</h4>
                      <span className="text-[10px] text-[#7C3AED] font-bold bg-[#F4F0FF] px-2 py-0.5 rounded-lg border border-[#7C3AED]/15">Indicators</span>
                    </div>

                    <div className="space-y-3">
                      {scannerData.vwapTrend.length > 0 ? (
                        scannerData.vwapTrend.map((v: any) => (
                          <div 
                            key={v.symbol} 
                            onClick={() => {
                              setActiveSubTab("chart");
                            }}
                            className="bg-white p-3 rounded-xl border border-slate-100 hover:border-[#7C3AED]/35 cursor-pointer transition-all"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-black text-slate-800">{v.symbol}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${v.signal.includes("BULLISH") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{v.signal}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-4 gap-1.5 text-[10px] text-slate-500 font-medium">
                              <div><p>LTP</p><p className="font-bold text-slate-700">₹{v.ltp}</p></div>
                              <div><p>VWAP</p><p className="font-bold text-slate-700">₹{v.vwap}</p></div>
                              <div><p>ADX</p><p className="font-bold text-slate-700">{v.adx}</p></div>
                              <div><p>EMA9/30</p><p className="font-bold text-slate-700">{v.ema9 > v.ema30 ? "UP" : "DOWN"}</p></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-6 text-center">No trend setups detected</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bollinger Range */}
                <div className="bg-[#FAFBFF] p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Bollinger Range</h4>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">Range Bound</span>
                    </div>

                    <div className="space-y-3">
                      {scannerData.bollingerRange.length > 0 ? (
                        scannerData.bollingerRange.map((b: any) => (
                          <div 
                            key={b.symbol} 
                            onClick={() => {
                              setActiveSubTab("chart");
                            }}
                            className="bg-white p-3 rounded-xl border border-slate-100 hover:border-[#7C3AED]/35 cursor-pointer transition-all"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-black text-slate-800">{b.symbol}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${b.signal.includes("LOWER") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{b.signal}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-4 gap-1.5 text-[10px] text-slate-500 font-medium">
                              <div><p>LTP</p><p className="font-bold text-slate-700">₹{b.ltp}</p></div>
                              <div><p>LowerB</p><p className="font-bold text-slate-700">₹{b.lowerBand}</p></div>
                              <div><p>UpperB</p><p className="font-bold text-slate-700">₹{b.upperBand}</p></div>
                              <div><p>RSI</p><p className="font-bold text-slate-700">{b.rsi}</p></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-6 text-center">No range reversal setups detected</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">Loading scanner matches...</div>
            )}
          </div>
        )}

        {/* 8. PRE-MARKET BIAS */}
        {activeSubTab === "bias" && (
          <div className="bg-white rounded-3xl border border-[#E9E6F5] p-6 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Pre-Market Bias Score</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Algorithmic bias calculations indicating the day's trend probability.</p>
            </div>

            {biasData ? (
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Score panel */}
                <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-slate-100 flex flex-col justify-between text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/5 rounded-full blur-2xl"></div>
                  <div>
                    <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">Composite Bias Score</span>
                    <h2 className="text-6xl font-black text-[#7C3AED] mt-4 tracking-tight">
                      {biasData.score > 0 ? `+${biasData.score}` : biasData.score}
                    </h2>
                    <span className="inline-block mt-4 px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-wider" style={{ backgroundColor: `${biasData.color}20`, color: biasData.color }}>
                      {biasData.status}
                    </span>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-left text-xs">
                    <div>
                      <span className="text-slate-400 font-bold">Suggested Mode:</span>
                      <p className="font-black text-slate-800 mt-0.5">{biasData.suggestedMode}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">Avoid:</span>
                      <p className="font-black text-rose-500 mt-0.5">{biasData.avoid}</p>
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics table */}
                <div className="lg:col-span-2 bg-[#FAFBFF] p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Bias Parameter Audit Checklist</h4>
                  
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-2">
                    {Object.entries(biasData.parameters).map(([key, param]: any) => (
                      <div key={key} className="flex justify-between items-center py-2.5 text-xs">
                        <span className="font-bold text-slate-700">{param.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-medium">{param.value}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            param.status === "Bullish" || param.status === "Buying" ? "bg-emerald-50 text-emerald-600" :
                            param.status === "Bearish" || param.status === "Falling" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                          }`}>
                            {param.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">Evaluating bias algorithms...</div>
            )}
          </div>
        )}

        {/* 9. ALERTS */}
        {activeSubTab === "alerts" && (
          <div className="bg-white rounded-3xl border border-[#E9E6F5] p-6 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <Bell className="text-[#7C3AED]" size={20} />
                Intraday Price Alerts
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Create and trigger price crossover alerts mapped to live indicators.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Alert form */}
              <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Create Price Alert</h4>
                <form onSubmit={handleCreateAlert} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Index / Stock Symbol</label>
                    <input
                      type="text"
                      placeholder="e.g. NIFTY 50"
                      value={alertSymbol}
                      onChange={(e) => setAlertSymbol(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#E9E6F5] rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trigger Price Level</label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="e.g. 23250"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#E9E6F5] rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Direction</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setAlertDirection("ABOVE")}
                        className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                          alertDirection === "ABOVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white text-slate-500 border-slate-200"
                        }`}
                      >
                        Crosses Above
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertDirection("BELOW")}
                        className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                          alertDirection === "BELOW"
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : "bg-white text-slate-500 border-slate-200"
                        }`}
                      >
                        Crosses Below
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs rounded-xl shadow-md shadow-purple-500/10 transition-all uppercase tracking-wider"
                  >
                    Set Alert
                  </button>
                </form>
              </div>

              {/* Alerts list */}
              <div className="lg:col-span-2 bg-[#FAFBFF] p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Active Alert Thresholds</h4>
                  
                  {alertsData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                          <tr className="text-[#64748B] border-b border-slate-200 uppercase tracking-wider font-bold">
                            <th className="pb-2">Symbol</th>
                            <th className="pb-2 text-right">Trigger Level</th>
                            <th className="pb-2 text-center">Direction</th>
                            <th className="pb-2 text-center">Status</th>
                            <th className="pb-2 text-center">Created At</th>
                            <th className="pb-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {alertsData.map((alert: any) => (
                            <tr key={alert.id} className="hover:bg-slate-50/50">
                              <td className="py-3 font-black text-slate-800">{alert.symbol}</td>
                              <td className="py-3 text-right font-bold text-slate-700">₹{formatLargeNum(alert.price)}</td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  alert.direction === "ABOVE" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                }`}>
                                  {alert.direction === "ABOVE" ? "Above" : "Below"}
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  alert.status === "ACTIVE" ? "bg-blue-50 text-blue-600 animate-pulse" : "bg-slate-100 text-slate-400"
                                }`}>
                                  {alert.status}
                                </span>
                              </td>
                              <td className="py-3 text-center text-slate-400 font-medium">
                                {new Date(alert.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                              </td>
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                                >
                                  <Trash size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 font-medium">
                      No active alerts set. Define a crossing boundary on the left sidebar to receive notifications.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* --- DIALOGS / MODALS --- */}

      {/* 1. CONNECT BROKER DIALOG */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E9E6F5] max-w-md w-full p-6 shadow-xl space-y-6 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Connect Trading Account</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Authenticate with your Indian broker to sync live assets & trades.</p>
              </div>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-black uppercase p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Zerodha Option */}
              <button
                onClick={() => handleConnectBrokerRedirect("zerodha")}
                className="w-full flex items-center justify-between p-4 bg-orange-50/30 hover:bg-orange-50 border border-orange-100 hover:border-orange-200 rounded-2xl text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                    K
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Kite by Zerodha</p>
                    <p className="text-[10px] text-slate-400 font-semibold">REST APIs, WebSocket live quotes</p>
                  </div>
                </div>
                <ChevronRight className="text-orange-400" size={16} />
              </button>

              {/* Upstox Option */}
              <button
                onClick={() => handleConnectBrokerRedirect("upstox")}
                className="w-full flex items-center justify-between p-4 bg-blue-50/30 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 rounded-2xl text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                    U
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Upstox developer</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Option chains, fundamentals, live feed</p>
                  </div>
                </div>
                <ChevronRight className="text-blue-400" size={16} />
              </button>
            </div>

            <div className="text-[10px] text-slate-400 leading-normal font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
              <strong>Security Policy:</strong> Trade Adhyayan does not ask for or store your broker credentials or passwords. Authentication is handled on the secure broker logins directly.
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD WATCHLIST DIALOG */}
      {showAddWatchlistModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E9E6F5] max-w-sm w-full p-6 shadow-xl space-y-6 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Create Custom Watchlist</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Organize your trade tickers into custom sheets.</p>
              </div>
              <button 
                onClick={() => setShowAddWatchlistModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-black uppercase p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Watchlist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Intraday Stocks"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E6F5] rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddWatchlistModal(false)}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWatchlist}
                  className="flex-1 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs rounded-xl shadow-md shadow-purple-500/10 transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
