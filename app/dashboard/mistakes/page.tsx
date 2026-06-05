"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getTrades,
  getMistakes,
  addMistake,
  runAutoDetectMistakes
} from "@/app/actions/trades";
import {
  RefreshCw,
  Trash2,
  Lock,
  Activity,
  Smile,
  Lightbulb,
  CheckCircle,
  Info,
  CheckSquare
} from "lucide-react";

interface Trade {
  id: string;
  asset: string;
  type: "BUY" | "SELL";
  pnl: number;
  direction?: string;
  netPnl?: number;
  exitPrice?: number;
}

export default function MistakesPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [mistakeSummary, setMistakeSummary] = useState<any>(null);

  // Manual Mistake Logger State
  const [mistakeTradeId, setMistakeTradeId] = useState("");
  const [mistakeType, setMistakeType] = useState("Revenge Trading");
  const [mistakeSeverity, setMistakeSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [mistakeReason, setMistakeReason] = useState("");
  const [mistakeLoss, setMistakeLoss] = useState("");
  const [mistakeTip, setMistakeTip] = useState("");

  const fetchMistakeSummary = async (emailParam?: string) => {
    try {
      const email = emailParam || userEmail || localStorage.getItem('trade_adhyayan_user') || "";
      if (!email) return;
      const res = await fetch(`/api/mistakes/summary?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setMistakeSummary(data);
      }
    } catch (err) {
      console.error("Error fetching mistake summary:", err);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('trade_adhyayan_user');
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);

    const loadData = async () => {
      setIsLoading(true);
      try {
        const dbTrades = await getTrades(email);
        setTrades(dbTrades);
        const dbMistakes = await getMistakes(email);
        setMistakes(dbMistakes);
        await fetchMistakeSummary(email);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleAddMistake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mistakeTradeId || !mistakeType) return;
    try {
      const estimatedLossVal = parseFloat(mistakeLoss) || 0;
      await addMistake(
        userEmail,
        mistakeTradeId,
        mistakeType,
        mistakeSeverity,
        mistakeReason,
        estimatedLossVal,
        mistakeTip
      );
      const dbMistakes = await getMistakes(userEmail);
      setMistakes(dbMistakes);
      await fetchMistakeSummary();
      setMistakeReason("");
      setMistakeLoss("");
      setMistakeTip("");
      setMistakeTradeId("");
      toast.success("Mistake logged successfully! 🧠");
    } catch (e) {
      console.error(e);
      toast.error("Failed to log mistake.");
    }
  };

  const handleConfirmMistake = async (mistakeId: string) => {
    try {
      const res = await fetch(`/api/mistakes/${mistakeId}/confirm`, {
        method: "PATCH"
      });
      if (res.ok) {
        const dbMistakes = await getMistakes(userEmail);
        setMistakes(dbMistakes);
        await fetchMistakeSummary();
        toast.success("Mistake confirmed!");
      } else {
        toast.error("Failed to confirm mistake.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error.");
    }
  };

  const handleToggleReviewed = async (mistakeId: string) => {
    try {
      const res = await fetch(`/api/mistakes/${mistakeId}/reviewed`, {
        method: "PATCH"
      });
      if (res.ok) {
        const dbMistakes = await getMistakes(userEmail);
        setMistakes(dbMistakes);
        await fetchMistakeSummary();
        toast.success("Marked as reviewed!");
      } else {
        toast.error("Failed to mark as reviewed.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error.");
    }
  };

  const handleDeleteMistake = async (mistakeId: string) => {
    const toastId = toast(
      (t) => (
        <span className="flex items-center gap-3">
          Delete this mistake log?
          <button
            className="px-2 py-1 bg-[#E94B8A] text-white text-[10px] font-bold rounded-lg"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`/api/mistakes/${mistakeId}`, { method: "DELETE" });
                if (res.ok) {
                  const dbMistakes = await getMistakes(userEmail);
                  setMistakes(dbMistakes);
                  await fetchMistakeSummary();
                  toast.success("Mistake deleted.");
                } else {
                  toast.error("Failed to delete.");
                }
              } catch (e) { toast.error("Network error."); }
            }}
          >Delete</button>
          <button
            className="px-2 py-1 bg-slate-600 text-white text-[10px] font-bold rounded-lg"
            onClick={() => toast.dismiss(t.id)}
          >Cancel</button>
        </span>
      ),
      { duration: 8000 }
    );
    void toastId;
  };

  const handleAutoDetectMistakes = async () => {
    const tid = toast.loading("Scanning trades for emotional patterns...");
    try {
      setIsLoading(true);
      const dbMistakes = await runAutoDetectMistakes(userEmail);
      setMistakes(dbMistakes);
      await fetchMistakeSummary();
      toast.success(`Scan complete! Detected ${dbMistakes.filter(m => m.detectedAutomatically).length} patterns.`, { id: tid });
    } catch (e) {
      console.error(e);
      toast.error("AI scan failed.", { id: tid });
    } finally {
      setIsLoading(false);
    }
  };

  const totalTradesCount = trades.length;
  let primaryMistake = "None";
  if (mistakes.length > 0) {
    const counts = mistakes.reduce((acc, curr) => {
      acc[curr.mistakeType] = (acc[curr.mistakeType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    primaryMistake = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFF] p-6 lg:p-8 h-full">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-left">
        
        {/* Header section with auto-detect trigger button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">AI & Rule-Engine Mistake Auto-Detector</h3>
            <p className="text-sm text-[#8C8CA1] font-medium mt-1">Scans trade entry and exit parameters to automatically detect emotional biases.</p>
          </div>
          <button
            onClick={handleAutoDetectMistakes}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-[#7C4DFF] to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#7C4DFF]/15"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Scanning..." : "Scan & Detect Patterns"}</span>
          </button>
        </div>

        {/* Mistakes KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Mistakes</span>
            <p className="text-2xl font-black text-slate-800">{mistakes.length}</p>
          </div>
          <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Most Frequent Mistake</span>
            <p className="text-2xl font-black text-[#E94B8A] truncate">{primaryMistake}</p>
          </div>
          <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mistake Rate</span>
            <p className="text-2xl font-black text-slate-800">
              {totalTradesCount > 0 ? ((mistakes.length / totalTradesCount) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>

        {/* Mistake Insights Auto-Generator */}
        <div className="p-6 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-4 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">Dynamic Mistake Insights</h4>
              <p className="text-[11px] text-[#8C8CA1] font-semibold mt-0.5">Statistical pattern-matching engine insights from your journal</p>
            </div>
            <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-[#7C4DFF] text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Rule Engine Active</span>
            </span>
          </div>

          {/* Conditional Rendering of Insights */}
          {(() => {
            const totalTrades = trades.length;
            const closedTrades = trades.filter(t => t.exitPrice && t.netPnl !== undefined && t.exitPrice > 0 && t.netPnl !== 0).length;
            const losingTrades = trades.filter(t => t.netPnl !== undefined && t.netPnl < 0).length;
            const mistakesCount = mistakes.length;

            if (totalTrades === 0) {
              return (
                <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-[20px] text-center text-xs font-semibold text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Info className="w-6 h-6 text-slate-300" />
                  <span>Add your first trade to start detecting mistakes.</span>
                </div>
              );
            }

            if (mistakesCount === 0) {
              return (
                <div className="p-8 bg-[#F3FDF9] border border-[#D1F2E5] rounded-[20px] text-center text-xs font-bold text-[#15B77A] flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-[#15B77A]" />
                  <span>Great job. No mistakes detected in this period.</span>
                </div>
              );
            }

            if (closedTrades < 10) {
              return (
                <div className="p-8 bg-[#FFF9F2] border border-[#FFE7CC] rounded-[20px] text-center text-xs font-semibold text-amber-600 flex flex-col items-center justify-center gap-2">
                  <Lock className="w-6 h-6 text-amber-500" />
                  <span>Add at least 10 closed trades to generate accurate mistake insights.</span>
                </div>
              );
            }

            if (losingTrades === 0) {
              return (
                <div className="p-8 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[20px] text-center text-xs font-semibold text-[#15B77A] flex flex-col items-center justify-center gap-2">
                  <Smile className="w-6 h-6 text-[#15B77A]" />
                  <span>No losing trades found in this period. Keep tracking to validate consistency.</span>
                </div>
              );
            }

            // Render the dynamic insights list
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mistakeSummary && mistakeSummary.insights && mistakeSummary.insights.length > 0 ? (
                  mistakeSummary.insights.map((insight: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-gradient-to-r from-slate-50 to-white hover:from-white hover:to-indigo-50/10 border border-slate-100 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/10 rounded-[18px] text-[12px] font-bold text-slate-700 leading-relaxed transition-all flex items-start gap-3 group"
                    >
                      <div className="p-1.5 bg-indigo-50 rounded-lg text-[#7C4DFF] group-hover:scale-110 transition-transform shrink-0">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <span className="pt-0.5">{insight}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 md:col-span-2 text-center text-slate-400 font-semibold py-4">
                    No pattern match found for current history. Keep logging trades to detect trends.
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Manual Mistake logger form */}
          <div className="xl:col-span-4 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Log Manual Mistake</h3>
              <p className="text-[11px] text-[#8C8CA1] font-semibold mt-0.5">Document discipline lapses on specific trade executions</p>
            </div>

            <form onSubmit={handleAddMistake} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#8C8CA1] ml-1">Select Ticker Trade</label>
                <select
                  required
                  value={mistakeTradeId}
                  onChange={(e) => setMistakeTradeId(e.target.value)}
                  className="w-full px-4 h-12 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="">-- Choose Trade --</option>
                  {trades.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.asset} ({t.type}) - P&L: ₹{t.pnl.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#8C8CA1] ml-1">Mistake Pattern</label>
                <select
                  value={mistakeType}
                  onChange={(e) => setMistakeType(e.target.value)}
                  className="w-full px-4 h-12 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="Revenge Trading">Revenge Trading</option>
                  <option value="FOMO Entry">FOMO Entry</option>
                  <option value="Early Exit">Early Exit</option>
                  <option value="Overtrading">Overtrading</option>
                  <option value="Stop Loss Not Followed">SL Not Followed</option>
                  <option value="Poor R:R">Poor R:R</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#8C8CA1] ml-1">Severity</label>
                  <select
                    value={mistakeSeverity}
                    onChange={(e) => setMistakeSeverity(e.target.value as any)}
                    className="w-full px-3 h-12 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="LOW">Low Severity</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High Severity</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#8C8CA1] ml-1">Est. Loss (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={mistakeLoss}
                    onChange={(e) => setMistakeLoss(e.target.value)}
                    className="w-full px-3 h-12 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#8C8CA1] ml-1">What went wrong?</label>
                <textarea
                  rows={3}
                  placeholder="Explain the mental trigger..."
                  value={mistakeReason}
                  onChange={(e) => setMistakeReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#8C8CA1] ml-1">Improvement tip for next time</label>
                <input
                  type="text"
                  placeholder="e.g. Set system SL and close the chart."
                  value={mistakeTip}
                  onChange={(e) => setMistakeTip(e.target.value)}
                  className="w-full px-4 h-12 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#7C3AED]/20"
              >
                Save Mistake Log
              </button>
            </form>
          </div>

          {/* Mistakes logs feed */}
          <div className="xl:col-span-8 space-y-4">
            {mistakes.length > 0 ? (
              mistakes.map((mst) => {
                const isHigh = mst.severity === "HIGH";
                const isMed = mst.severity === "MEDIUM";
                return (
                  <div
                    key={mst.id}
                    className="bg-white border border-[#E8EAF3] rounded-[20px] p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-3 text-xs font-bold">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                          isHigh ? "bg-red-50 text-[#E94B8A] border border-red-100" : isMed ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}>
                          {mst.severity} Severity
                        </span>
                        <span className="font-heading text-sm font-black text-slate-800">{mst.mistakeType}</span>
                      </div>
                      <span className="text-[10px] text-[#8C8CA1] uppercase bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                        {mst.detectedAutomatically ? "🤖 Auto-Detected" : "✍️ Manual"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {mst.reason}
                    </p>

                    {mst.Trade && (
                      <div className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg inline-block">
                        Trade: {mst.Trade.symbol || "Unknown"} ({mst.Trade.direction === "LONG" ? "BUY" : mst.Trade.direction === "SHORT" ? "SELL" : mst.Trade.direction}) | Net P&L: <span className={mst.Trade.netPnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}>₹{mst.Trade.netPnl?.toLocaleString() || 0}</span>
                      </div>
                    )}

                    {mst.improvementTip && (
                      <div className="p-4 bg-[#FAF9FF] border-l-4 border-[#7C4DFF] rounded-r-xl text-xs font-bold text-slate-600 flex gap-3 items-center">
                        <Lightbulb className="w-5 h-5 text-[#7C4DFF] shrink-0" />
                        <span><strong className="text-slate-800">Improvement Strategy:</strong> {mst.improvementTip}</span>
                      </div>
                    )}

                    {/* Interactive Actions and confirmation indicators */}
                    <div className="flex flex-wrap justify-between items-center pt-4 mt-2 border-t border-slate-100 gap-3">
                      <div className="flex flex-wrap gap-2">
                        {mst.userConfirmed ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            Confirmed ✓
                          </span>
                        ) : (
                          mst.detectedAutomatically && (
                            <span className="px-3 py-1 bg-slate-50 text-[#8C8CA1] border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-lg">
                              Pending Confirmation
                            </span>
                          )
                        )}
                        {mst.reviewed ? (
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            Reviewed ✓
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-50 text-[#8C8CA1] border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            Needs Review
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!mst.userConfirmed && mst.detectedAutomatically && (
                          <button
                            onClick={() => handleConfirmMistake(mst.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm border-0"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}
                        {!mst.reviewed && (
                          <button
                            onClick={() => handleToggleReviewed(mst.id)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#7C4DFF] border border-indigo-100 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Mark Reviewed</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMistake(mst.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#E94B8A] border border-red-100 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-12 text-center text-slate-400 font-semibold flex flex-col items-center justify-center gap-4 min-h-[300px]">
                <Smile className="w-12 h-12 text-[#15B77A]" />
                <p>🎉 Splendid job! No discipline lapses or emotional patterns detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
