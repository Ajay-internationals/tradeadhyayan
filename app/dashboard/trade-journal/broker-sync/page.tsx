"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Clock, Link as LinkIcon, Settings, ChevronRight, ChevronDown, Check, Info, Shield, HelpCircle, ExternalLink, Activity, X, Trash2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function BrokerSyncPage() {
  const [syncingBroker, setSyncingBroker] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedSync, setSelectedSync] = useState<any | null>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  const router = useRouter();

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
    toast.success(`Initiating OAuth flow for ${broker}...`);
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
            "> Authenticating with broker...",
            `> Fetching ledger from ${new Date().toLocaleDateString()}...`,
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-1">Trade Journal &gt; Broker Sync</p>
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
            <p className="text-[14px] font-[500] text-purple-100">Connect your broker account and sync trades, positions and account activity effortlessly.</p>
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
                status="CONNECTED"
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
                status="TOKEN_EXPIRED"
                logoUrl="/brokers/upstox.png"
                logo="U"
                color="text-[#512379]"
                bg="bg-[#512379]/10"
                onConnect={() => handleConnect("Upstox")}
                onSync={() => handleSync("Upstox")}
                isSyncing={false}
              />
              <BrokerCard 
                name="FYERS"
                status="NOT_CONNECTED"
                logoUrl="/brokers/fyers.png"
                logo="F"
                color="text-[#0E8FEF]"
                bg="bg-[#0E8FEF]/10"
                onConnect={() => handleConnect("FYERS")}
                onSync={() => {}}
                isSyncing={false}
              />
              <BrokerCard 
                name="Angel One"
                status="NOT_CONNECTED"
                logoUrl="/brokers/angelone.png"
                logo="A"
                color="text-[#FF7F00]"
                bg="bg-[#FF7F00]/10"
                onConnect={() => handleConnect("Angel One")}
                onSync={() => {}}
                isSyncing={false}
              />
              <BrokerCard 
                name="Dhan"
                status="NOT_CONNECTED"
                logoUrl="/brokers/dhan.png"
                logo="D"
                color="text-[#0D121A]"
                bg="bg-[#0D121A]/10"
                onConnect={() => handleConnect("Dhan")}
                onSync={() => {}}
                isSyncing={false}
              />
              <BrokerCard 
                name="Motilal Oswal"
                status="NOT_CONNECTED"
                logoUrl="/brokers/motilaloswal.png"
                logo="M"
                color="text-[#DB2828]"
                bg="bg-[#DB2828]/10"
                onConnect={() => handleConnect("Motilal Oswal")}
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
                    <span className="text-[14px] font-[500] text-[#64748B]">Orders</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
                    <span className="text-[14px] font-[500] text-[#64748B]">Holdings</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[#64748B]">
                  <Clock size={16} />
                  <span className="text-[12px] font-[500]">Timezone: Asia/Kolkata</span>
                </div>
                <button className="px-4 py-2 bg-white border border-[#E9E6F5] hover:border-[#7C3AED] hover:text-[#7C3AED] text-[#64748B] rounded-xl text-[12px] font-[600] transition-colors shadow-sm">
                  Import Historical Data
                </button>
              </div>

              {/* Advanced Settings Accordion */}
              <div className="border-t border-[#E9E6F5] pt-4 mt-2">
                <button 
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className="flex items-center justify-between w-full text-[14px] font-[600] text-[#0F172A]"
                >
                  Advanced Settings
                  {advancedOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {advancedOpen && (
                  <div className="space-y-4 mt-4">
                    {["Auto Group Trades", "Import Charges", "Auto Calculate Metrics", "Auto Detect Instrument"].map((setting) => (
                      <div key={setting} className="flex items-center justify-between">
                        <span className="text-[14px] font-[500] text-[#64748B]">{setting}</span>
                        <div className="w-8 h-5 bg-[#10B981] rounded-full p-1 cursor-pointer transition-colors shadow-inner">
                          <div className="w-3 h-3 bg-white rounded-full translate-x-3 shadow-sm transition-transform"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

        {/* Right Sidebar - Fixed 280px */}
        <div className="w-[280px] shrink-0 space-y-[24px]">
          
          {/* Sync Overview & Health */}
          <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-[24px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] space-y-4">
            <h3 className="text-[18px] font-[600] text-[#0F172A]">Sync Overview</h3>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-[14px] font-[500] text-[#64748B]">Total Trades</span>
                <span className="text-[16px] font-[600] text-[#0F172A]">2,419</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-[14px] font-[500] text-[#64748B]">Synced Trades</span>
                <span className="text-[16px] font-[600] text-[#7C3AED]">1,842</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-[14px] font-[500] text-[#64748B]">Open Positions</span>
                <span className="text-[16px] font-[600] text-[#0F172A]">3</span>
              </div>
              
              <div className="pt-2">
                <p className="text-[12px] font-[600] text-[#64748B] mb-2 uppercase tracking-wider">System Health</p>
                <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-3 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#10B981] mt-0.5" />
                  <div>
                    <p className="text-[14px] font-[600] text-[#0F172A]">Healthy</p>
                    <p className="text-[12px] font-[500] text-[#64748B]">Everything looks good.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-[24px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] space-y-4">
            <h3 className="text-[18px] font-[600] text-[#0F172A]">Account Details</h3>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F14922]/10 text-[#F14922] font-[700] flex items-center justify-center">Z</div>
                <div>
                  <p className="text-[14px] font-[600] text-[#0F172A]">Zerodha Kite</p>
                  <p className="text-[12px] font-[500] text-[#64748B]">User ID: ZT4521</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[12px] font-[500] text-[#64748B]">Client ID</span>
                  <span className="text-[12px] font-[600] text-[#0F172A]">CLI-9821</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] font-[500] text-[#64748B]">Segment</span>
                  <span className="text-[12px] font-[600] text-[#0F172A]">ALL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] font-[500] text-[#64748B]">Status</span>
                  <span className="text-[12px] font-[600] text-[#10B981]">Active</span>
                </div>
              </div>
              <button className="w-full mt-2 h-10 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] rounded-xl text-[13px] font-[600] transition-colors border border-[#EF4444]/20">
                Disconnect Broker
              </button>
            </div>
          </div>

          {/* Data Overview (Donut Chart Placeholder) */}
          <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-[24px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] space-y-4">
            <h3 className="text-[18px] font-[600] text-[#0F172A]">Data Overview</h3>
            <div className="flex flex-col items-center pt-2">
              {/* CSS Donut Chart */}
              <div className="relative w-32 h-32 rounded-full mb-6" style={{ background: 'conic-gradient(#7C3AED 0% 60%, #10B981 60% 85%, #F59E0B 85% 100%)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-[18px] font-[700] text-[#0F172A]">1.8k</span>
                  <span className="text-[10px] font-[600] text-[#64748B] uppercase">Trades</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></div><span className="text-[12px] font-[500] text-[#64748B]">Intraday</span></div>
                  <span className="text-[12px] font-[600] text-[#0F172A]">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div><span className="text-[12px] font-[500] text-[#64748B]">Swing</span></div>
                  <span className="text-[12px] font-[600] text-[#0F172A]">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div><span className="text-[12px] font-[500] text-[#64748B]">Positional</span></div>
                  <span className="text-[12px] font-[600] text-[#0F172A]">15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[20px] p-[24px] text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 relative z-10 backdrop-blur-sm">
              <Shield size={20} className="text-white" />
            </div>
            <h3 className="text-[16px] font-[600] mb-2 relative z-10">Need Help?</h3>
            <p className="text-[13px] font-[500] text-slate-300 mb-6 relative z-10 leading-relaxed">Having trouble syncing your broker? Check our detailed integration guides.</p>
            <button onClick={handleHelpCenter} className="w-full py-2.5 bg-white text-[#0F172A] rounded-xl text-[13px] font-[600] hover:bg-slate-100 transition-colors relative z-10 flex items-center justify-center gap-2">
              Visit Help Center
              <ExternalLink size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* Sync Details Modal */}
      {selectedSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden border border-[#E9E6F5] animate-in fade-in zoom-in duration-200">
            
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
                <h4 className="text-[14px] font-[600] text-[#0F172A]">Import Log</h4>
                <div className="h-32 w-full bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-[12px] text-green-400 space-y-1">
                  {selectedSync.logLines ? selectedSync.logLines.map((line: string, i: number) => (
                    <p key={i} className={line.includes("Error") || line.includes("Failed") ? "text-red-400" : ""}>{line}</p>
                  )) : (
                    <>
                      <p>&gt; Authenticating with broker...</p>
                      <p>&gt; Fetching ledger from {selectedSync.date.split(',')[0]}...</p>
                      <p>&gt; Parsed {selectedSync.records} records.</p>
                      <p>&gt; Normalizing symbols...</p>
                      <p className={selectedSync.status === "Success" ? "text-green-400" : "text-red-400"}>
                        &gt; {selectedSync.status === "Success" ? "Transaction successfully committed to DB." : "Error: API Timeout while fetching."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-[#E9E6F5] bg-slate-50">
              <button 
                onClick={() => handleDeleteSync(selectedSync.id, selectedSync.batchId)}
                className="px-4 py-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg text-[13px] font-[600] transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Sync Data
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

function BrokerCard({ name, status, logoUrl, logo, color, bg, onConnect, onSync, isSyncing }: any) {
  const isConnected = status === "CONNECTED";
  const isExpired = status === "TOKEN_EXPIRED";
  
  return (
    <div className={`bg-[#FFFFFF] border rounded-[20px] p-[20px] shadow-[0px_8px_24px_rgba(15,23,42,0.02)] flex flex-col justify-between transition-all w-[180px] min-h-[140px] relative overflow-hidden ${isConnected ? 'border-[#7C3AED]/30 hover:border-[#7C3AED]' : 'border-[#E9E6F5] hover:border-slate-300'}`}>
      
      {/* Decorative Blur for connected state */}
      {isConnected && <div className="absolute top-0 right-0 w-16 h-16 bg-[#7C3AED]/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>}

      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-[12px] ${bg} ${color} flex items-center justify-center font-[700] text-[18px] shrink-0 overflow-hidden`}>
          {logoUrl ? <img src={logoUrl} alt={name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = logo; }} /> : logo}
        </div>
        <h3 className="text-[14px] font-[600] text-[#0F172A] truncate" title={name}>{name}</h3>
      </div>

      <div className="mt-auto pt-4 flex justify-end">
        {isConnected && (
          <button 
            onClick={onSync}
            disabled={isSyncing}
            className="w-full h-8 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] rounded-lg text-[11px] font-[600] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            {isSyncing ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={12} /> Synced
              </>
            )}
          </button>
        )}

        {isExpired && (
          <button 
            onClick={onConnect}
            className="w-full h-8 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] rounded-lg text-[11px] font-[600] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 border border-[#EF4444]/20"
          >
            <AlertCircle size={12} /> Reconnect
          </button>
        )}

        {status === "NOT_CONNECTED" && (
          <button 
            onClick={onConnect}
            className="w-full h-8 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-[11px] font-[600] uppercase tracking-wider transition-colors flex items-center justify-center shadow-sm"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
