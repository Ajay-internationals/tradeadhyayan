"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Clock, Link as LinkIcon, Settings, ChevronRight, ChevronDown, Check, Info, Shield, HelpCircle, ExternalLink, Activity, X, Trash2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

function BrokerSyncContent() {
  const [syncingBroker, setSyncingBroker] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedSync, setSelectedSync] = useState<any | null>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle callback status messages
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status === "success") {
      toast.success("Broker connected successfully!");
      // Clean up URL
      router.replace("/dashboard/trade-journal/broker-sync");
    } else if (status === "error") {
      toast.error(message || "Failed to connect broker.");
      router.replace("/dashboard/trade-journal/broker-sync");
    }

    // Fetch live connections
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/brokers/status");
      const data = await res.json();
      if (data.success) {
        setConnections(data.connections);
      }
    } catch (err) {
      console.error("Failed to fetch broker statuses", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBrokerStatus = (brokerName: string) => {
    const conn = connections.find(c => c.brokerName.toLowerCase() === brokerName.toLowerCase());
    return conn ? conn.status : "NOT_CONNECTED";
  };

  const handleHelpCenter = () => {
    router.push("/dashboard/help");
  };

  const handleDeleteSync = async (id: string, batchId: string) => {
    try {
      const res = await fetch(`/api/trades/batch?batchId=${batchId}`, { method: 'DELETE' });
      if (res.ok) {
        setSyncHistory(syncHistory.filter(s => s.id !== id));
        toast.success("Sync data successfully deleted from database.");
        setSelectedSync(null);
      } else {
        toast.error("Failed to delete trades.");
      }
    } catch (err) {
      toast.error("An error occurred during deletion.");
    }
  };

  const handleConnect = (broker: string) => {
    toast.success(`Redirecting to ${broker} login...`);
    window.location.href = `/api/brokers/oauth/init?broker=${broker}`;
  };

  const handleSync = async (brokerName: string) => {
    setSyncingBroker(brokerName);
    try {
      const res = await fetch('/api/brokers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brokerName })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`${data.records} trades synced from ${brokerName}!`);
        
        const newSync = {
          id: data.batchId,
          batchId: data.batchId,
          date: new Date().toLocaleString(),
          type: "Trades",
          records: data.records,
          status: "Success",
          statusColor: "text-[#10B981] bg-[#ECFDF5] border-[#10B981]/20",
          logLines: [
            "> Authenticating with broker API...",
            `> Fetching live trades from ${brokerName}...`,
            `> Parsed ${data.rawExecutions} raw executions.`,
            "> Normalizing symbols and grouping BUY/SELL legs...",
            `> Transaction successfully committed ${data.records} trades to DB.`
          ]
        };
        
        setSyncHistory([newSync, ...syncHistory]);
      } else {
        toast.error(`Sync failed: ${data.error}`);
      }
    } catch (err) {
      toast.error("Failed to connect to sync service.");
    } finally {
      setSyncingBroker(null);
    }
  };

  if (isLoading) {
    return <div className="p-[28px] text-center text-slate-500 font-bold">Loading broker configurations...</div>;
  }

  return (
    <div className="p-[28px] max-w-[1440px] mx-auto space-y-[24px]">
      <Toaster position="top-right" />
      {/* Page Header */}
      <header className="flex items-center gap-4 pb-4 border-b border-[#E9E6F5] h-[80px]">
        <Link href="/dashboard/trade-journal" className="w-10 h-10 bg-white border border-[#E9E6F5] rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors cursor-pointer shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[24px] font-[600] text-[#0F172A] tracking-tight">Broker Sync</h1>
          <p className="text-[11px] font-[700] uppercase tracking-wider text-[#64748B] mt-1">Trade Journal &gt; Broker Sync</p>
        </div>
      </header>

      {/* Hero Information Card */}
      <div className="h-[90px] w-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-[20px] p-6 shadow-[0px_8px_24px_rgba(124,58,237,0.2)] flex items-center justify-between overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center text-white">
            <RefreshCw size={24} />
          </div>
          <div>
            <h2 className="text-[18px] font-[600] text-white">Automatically import trades from your broker</h2>
            <p className="text-[14px] font-[500] text-purple-100">Connect your broker account securely to sync live trades and analytics.</p>
          </div>
        </div>
        <button onClick={handleHelpCenter} className="relative z-10 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[14px] font-[600] transition-colors flex items-center gap-2 backdrop-blur-sm border border-white/20">
          <HelpCircle size={16} />
          How does it work?
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-[24px]">
        {/* Main Column */}
        <div className="flex-1 space-y-[32px]">
          
          {/* Section 1: Connect Broker */}
          <section>
            <h2 className="text-[24px] font-[600] text-[#0F172A] mb-4">Connect Broker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
              <BrokerCard 
                name="Zerodha"
                status={getBrokerStatus("Zerodha")}
                connectionData={connections.find(c => c.brokerName.toLowerCase() === "zerodha")}
                logoUrl="/brokers/zerodha.png"
                logo="Z"
                color="text-[#F14922]"
                bg="bg-[#F14922]/10"
                onConnect={() => handleConnect("Zerodha")}
                onSync={() => handleSync("Zerodha")}
                isSyncing={syncingBroker === "Zerodha"}
              />
              <BrokerCard 
                name="Upstox"
                status={getBrokerStatus("Upstox")}
                connectionData={connections.find(c => c.brokerName.toLowerCase() === "upstox")}
                logoUrl="/brokers/upstox.png"
                logo="U"
                color="text-[#512379]"
                bg="bg-[#512379]/10"
                onConnect={() => handleConnect("Upstox")}
                onSync={() => handleSync("Upstox")}
                isSyncing={syncingBroker === "Upstox"}
              />
              <BrokerCard 
                name="FYERS"
                status={getBrokerStatus("FYERS")}
                connectionData={connections.find(c => c.brokerName.toLowerCase() === "fyers")}
                logoUrl="/brokers/fyers.png"
                logo="F"
                color="text-[#0E8FEF]"
                bg="bg-[#0E8FEF]/10"
                onConnect={() => handleConnect("FYERS")}
                onSync={() => handleSync("FYERS")}
                isSyncing={syncingBroker === "FYERS"}
              />
              <BrokerCard 
                name="Angel One"
                status={getBrokerStatus("Angel One")}
                connectionData={connections.find(c => c.brokerName.toLowerCase() === "angel one")}
                logoUrl="/brokers/angelone.png"
                logo="A"
                color="text-[#FF7F00]"
                bg="bg-[#FF7F00]/10"
                onConnect={() => toast.error("Coming Soon!")}
                onSync={() => {}}
                isSyncing={false}
              />
            </div>
          </section>

          {/* Section 2: Sync Settings */}
          <section className="w-full lg:w-[60%]">
            <h2 className="text-[24px] font-[600] text-[#0F172A] mb-4">Sync Settings</h2>
            <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-[24px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-[600] text-[#0F172A]">Auto Sync</p>
                  <p className="text-[12px] font-[500] text-[#64748B]">Automatically pull data in the background</p>
                </div>
                <div className="w-10 h-6 bg-[#10B981] rounded-full p-1 cursor-pointer transition-colors shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm transition-transform"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-[600] text-[#0F172A]">Sync Frequency</p>
                  <p className="text-[12px] font-[500] text-[#64748B]">How often should we sync?</p>
                </div>
                <select className="px-4 py-2 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:outline-none focus:border-[#7C3AED]">
                  <option>15 Min</option>
                  <option>30 Min</option>
                  <option>1 Hour</option>
                  <option>Manual</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[14px] font-[600] text-[#0F172A]">Import Types</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
                    <span className="text-[14px] font-[500] text-[#64748B]">Trades</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
                    <span className="text-[14px] font-[500] text-[#64748B]">Positions</span>
                  </label>
                </div>
              </div>

            </div>
          </section>

          {/* Section 3: Recent Sync Activity */}
          <section>
            <h2 className="text-[24px] font-[600] text-[#0F172A] mb-4">Recent Sync Activity</h2>
            <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E9E6F5]">
                    <th className="p-4 text-[12px] font-[600] text-[#64748B]">Date & Time</th>
                    <th className="p-4 text-[12px] font-[600] text-[#64748B]">Data Type</th>
                    <th className="p-4 text-[12px] font-[600] text-[#64748B]">Records</th>
                    <th className="p-4 text-[12px] font-[600] text-[#64748B]">Status</th>
                    <th className="p-4 text-[12px] font-[600] text-[#64748B]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E6F5]">
                  {syncHistory.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-[#64748B] text-[13px] font-[500]">No recent sync activity. Click 'Sync' on a connected broker above.</td></tr>
                  ) : (
                    syncHistory.map((row, i) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-[14px] font-[500] text-[#0F172A]">{row.date}</td>
                        <td className="p-4 text-[14px] font-[500] text-[#64748B]">{row.type}</td>
                        <td className="p-4 text-[14px] font-[500] text-[#0F172A]">{row.records}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[11px] font-[600] uppercase tracking-wider rounded-md border ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => setSelectedSync(row)} className="text-[#7C3AED] hover:text-[#6D28D9] text-[13px] font-[600]">View Logs</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>

      {/* Sync Details Modal */}
      {selectedSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden border border-[#E9E6F5]">
            <div className="flex items-center justify-between p-6 border-b border-[#E9E6F5]">
              <div>
                <h3 className="text-[18px] font-[600] text-[#0F172A]">Sync Details</h3>
                <p className="text-[13px] font-[500] text-[#64748B] mt-1">Review the imported data from {selectedSync.date}</p>
              </div>
              <button onClick={() => setSelectedSync(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-[#64748B] rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-[#E9E6F5]">
                <div className="flex flex-col">
                  <span className="text-[12px] font-[600] text-[#64748B] uppercase tracking-wider mb-1">Status</span>
                  <span className={`px-2.5 py-1 text-[11px] font-[600] uppercase tracking-wider rounded-md border w-fit ${selectedSync.statusColor}`}>
                    {selectedSync.status}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[12px] font-[600] text-[#64748B] uppercase tracking-wider mb-1">Records Found</span>
                  <span className="text-[18px] font-[700] text-[#0F172A]">{selectedSync.records} Trades</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[14px] font-[600] text-[#0F172A]">Live API Logs</h4>
                <div className="h-40 w-full bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-[12px] text-green-400 space-y-1">
                  {selectedSync.logLines && selectedSync.logLines.map((line: string, i: number) => (
                    <p key={i} className={line.includes("Error") || line.includes("Failed") ? "text-red-400" : ""}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-[#E9E6F5] bg-slate-50">
              <button 
                onClick={() => handleDeleteSync(selectedSync.id, selectedSync.batchId)}
                className="px-4 py-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg text-[13px] font-[600] transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete Sync Data
              </button>
              <button 
                onClick={() => setSelectedSync(null)}
                className="px-6 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-[13px] font-[600] transition-colors shadow-sm"
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

function BrokerCard({ name, connectionData, status, logoUrl, logo, color, bg, onConnect, onSync, isSyncing }: any) {
  const isConnected = status === "CONNECTED";
  const isExpired = status === "TOKEN_EXPIRED";
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDisconnect = async () => {
    // Basic disconnect UI logic (could also call an API to delete the connection)
    alert("Disconnecting broker...");
  };

  return (
    <div className={`bg-[#FFFFFF] border rounded-[20px] p-[20px] shadow-[0px_8px_24px_rgba(15,23,42,0.02)] flex flex-col justify-between transition-all w-full min-h-[160px] relative overflow-hidden ${isConnected ? 'border-[#7C3AED]/50 ring-1 ring-[#7C3AED]/20 hover:border-[#7C3AED]' : 'border-[#E9E6F5] hover:border-slate-300'}`}>
      
      {/* Decorative Blur for connected state */}
      {isConnected && <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-[12px] ${bg} ${color} flex items-center justify-center font-[700] text-[20px] shrink-0 overflow-hidden shadow-sm`}>
            {logoUrl ? <img src={logoUrl} alt={name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = logo; }} /> : logo}
          </div>
          <div>
            <h3 className="text-[16px] font-[600] text-[#0F172A]" title={name}>{name}</h3>
            {isConnected ? (
              <div className="flex items-center gap-1 text-[#10B981] mt-0.5">
                <CheckCircle2 size={12} />
                <span className="text-[11px] font-[700] uppercase tracking-wide">Connected</span>
              </div>
            ) : (
              <span className="text-[11px] font-[600] uppercase text-[#64748B] mt-0.5 inline-block">Not Connected</span>
            )}
          </div>
        </div>
      </div>

      {isConnected && connectionData && (
        <div className="mt-4 space-y-1.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-[500] text-[#64748B]">Client ID:</span>
            <span className="text-[12px] font-[600] text-[#0F172A]">{connectionData.clientId || "XXXXX"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-[500] text-[#64748B]">Last Sync:</span>
            <span className="text-[12px] font-[600] text-[#0F172A]">{formatDate(connectionData.lastSyncAt)}</span>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2">
        {isConnected ? (
          <>
            <button 
              onClick={onSync}
              disabled={isSyncing}
              className="flex-1 h-9 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-[12px] font-[600] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isSyncing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <RefreshCw size={14} /> Sync Now
                </>
              )}
            </button>
            <button 
              onClick={handleDisconnect}
              className="px-3 h-9 bg-white border border-[#E9E6F5] hover:bg-[#FEF2F2] hover:text-[#EF4444] hover:border-[#EF4444]/20 text-[#64748B] rounded-xl text-[12px] font-[600] transition-colors flex items-center justify-center"
            >
              Disconnect
            </button>
          </>
        ) : isExpired ? (
          <button 
            onClick={onConnect}
            className="w-full h-9 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] rounded-xl text-[12px] font-[600] transition-colors flex items-center justify-center gap-1.5 border border-[#EF4444]/20"
          >
            <AlertCircle size={14} /> Reconnect
          </button>
        ) : (
          <button 
            onClick={onConnect}
            className="w-full h-9 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-[12px] font-[600] transition-colors flex items-center justify-center shadow-sm"
          >
            Connect Account
          </button>
        )}
      </div>
    </div>
  );
}

