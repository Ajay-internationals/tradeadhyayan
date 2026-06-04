"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Upload, FileSpreadsheet, ClipboardList, PenTool, Star, AlertCircle, TrendingDown, Image as ImageIcon } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function ManualAddTradePage() {
  const [activeMethod, setActiveMethod] = useState("single");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [pasteText, setPasteText] = useState("");
  const [importHistory, setImportHistory] = useState<{id: string, count: number, date: string}[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    symbol: "",
    setup: "",
    direction: "LONG",
    segment: "Equity",
    entryDate: new Date().toISOString().split('T')[0],
    entryTime: "09:15",
    exitDate: "",
    exitTime: "",
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    stopLoss: "",
    target: "",
    tags: "",
    notes: ""
  });

  // Checklist State
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Followed trading plan", checked: false },
    { id: 2, text: "Entry rules satisfied", checked: false },
    { id: 3, text: "Risk management followed", checked: false },
    { id: 4, text: "Stop loss placed", checked: false },
    { id: 5, text: "Reward to risk acceptable", checked: false },
    { id: 6, text: "Emotionally neutral", checked: false },
    { id: 7, text: "Setup quality high", checked: false }
  ]);

  const toggleChecklist = (id: number) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Calculate live values
  const entry = Number(formData.entryPrice) || 0;
  const qty = Number(formData.quantity) || 0;
  const sl = Number(formData.stopLoss) || 0;
  const tgt = Number(formData.target) || 0;
  const isLong = formData.direction === "LONG";
  
  const potentialRisk = sl > 0 ? (isLong ? (entry - sl) * qty : (sl - entry) * qty) : 0;
  const potentialReward = tgt > 0 ? (isLong ? (tgt - entry) * qty : (entry - tgt) * qty) : 0;
  const plannedRR = potentialRisk > 0 && potentialReward > 0 ? potentialReward / potentialRisk : 0;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        entryTime: new Date(`${formData.entryDate}T${formData.entryTime}`).toISOString(),
        exitTime: formData.exitDate && formData.exitTime ? new Date(`${formData.exitDate}T${formData.exitTime}`).toISOString() : undefined,
      };

      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Trade added successfully!");
        // Reset or redirect
      } else {
        toast.error(data.error || "Failed to add trade");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processImportedText = async (text: string) => {
    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;
    const batchId = `import_${Date.now()}`;
    try {
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        // Handle tab or comma separator
        const cols = line.split(/\t|,/).map(c => c.trim());
        if (cols.length < 6) continue;
        
        // Skip header if present
        if (cols[0].toLowerCase().includes("date")) continue;

        const [date, time, symbol, direction, qty, entryPrice, exitPrice] = cols;
        
        // Basic validation
        if (!symbol || !qty || !entryPrice) continue;

        const payload = {
          symbol,
          direction: direction?.toUpperCase().includes("SHORT") ? "SHORT" : "LONG",
          entryPrice: Number(entryPrice),
          exitPrice: exitPrice ? Number(exitPrice) : 0,
          quantity: Number(qty),
          entryTime: new Date(`${date}T${time || '00:00:00'}`).toISOString(),
          setup: "Imported",
          batchId,
        };

        const res = await fetch("/api/trades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) successCount++;
        else failCount++;
      }
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} trades!`);
        setPasteText("");
        setImportHistory([{ id: batchId, count: successCount, date: new Date().toLocaleString() }, ...importHistory]);
      } else if (failCount === 0) {
        toast.error("No valid trades found to import.");
      }
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} rows.`);
      }
    } catch (err) {
      toast.error("Error processing import data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasteImport = () => {
    if (!pasteText.trim()) return toast.error("Please paste data first");
    processImportedText(pasteText);
  };

  const handleDeleteImport = async (batchId: string) => {
    try {
      const res = await fetch(`/api/trades/batch?batchId=${batchId}`, { method: 'DELETE' });
      if (res.ok) {
        setImportHistory(importHistory.filter(h => h.id !== batchId));
        toast.success("Imported trades successfully deleted.");
      } else {
        toast.error("Failed to delete imported trades.");
      }
    } catch (err) {
      toast.error("Error connecting to server.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) processImportedText(text);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="p-[20px] max-w-[1440px] mx-auto space-y-[16px]">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="flex items-center gap-4 pb-3 border-b border-[#E9E6F5]">
        <Link href="/dashboard/trade-journal" className="w-10 h-10 bg-white border border-[#E9E6F5] rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors cursor-pointer shadow-sm shrink-0">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[20px] font-[600] text-[#0F172A] tracking-tight">Manual Add Trade</h1>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-0.5">Trade Journal &gt; Manual Add Trade</p>
        </div>
      </header>

      {/* Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <MethodCard 
          id="single" 
          title="Add Single Trade" 
          desc="Add one trade at a time manually with all details." 
          icon={<PenTool size={20} />} 
          active={activeMethod === "single"} 
          onClick={() => setActiveMethod("single")} 
        />
        <MethodCard 
          id="excel" 
          title="Upload Excel File" 
          desc="Upload your Excel or CSV file and we'll import the trades." 
          icon={<FileSpreadsheet size={20} />} 
          active={activeMethod === "excel"} 
          onClick={() => setActiveMethod("excel")} 
        />
        <MethodCard 
          id="paste" 
          title="Paste Trades" 
          desc="Paste your trades from anywhere and we'll format it for you." 
          icon={<ClipboardList size={20} />} 
          active={activeMethod === "paste"} 
          onClick={() => setActiveMethod("paste")} 
        />
      </div>

      {activeMethod === "single" && (
        <div className="flex flex-col lg:flex-row gap-[24px]">
          {/* Main Form - Flexible width (approx 70%) */}
          <div className="flex-1 bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-[24px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-[18px] font-[600] text-[#0F172A] mb-6">Trade Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Instrument *</label>
                  <input required name="symbol" value={formData.symbol} onChange={handleChange} placeholder="e.g. NIFTY 22500 CE" className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Setup</label>
                  <select name="setup" value={formData.setup} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all">
                    <option value="">Select Setup...</option>
                    <option value="Breakout">Breakout</option>
                    <option value="Reversal">Reversal</option>
                    <option value="Pullback">Pullback</option>
                    <option value="ORB">ORB</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Direction *</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setFormData({...formData, direction: "LONG"})} className={`flex-1 h-11 rounded-xl text-[14px] font-[500] transition-colors border ${formData.direction === "LONG" ? "bg-[#ECFDF5] text-[#10B981] border-[#10B981]/30 shadow-sm" : "bg-slate-50 text-[#64748B] border-[#E9E6F5] hover:bg-slate-100"}`}>Long</button>
                    <button type="button" onClick={() => setFormData({...formData, direction: "SHORT"})} className={`flex-1 h-11 rounded-xl text-[14px] font-[500] transition-colors border ${formData.direction === "SHORT" ? "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/30 shadow-sm" : "bg-slate-50 text-[#64748B] border-[#E9E6F5] hover:bg-slate-100"}`}>Short</button>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Entry Date *</label>
                  <input required type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Entry Time *</label>
                  <input required type="time" name="entryTime" value={formData.entryTime} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Exit Date</label>
                  <input type="date" name="exitDate" value={formData.exitDate} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Exit Time</label>
                  <input type="time" name="exitTime" value={formData.exitTime} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Market Segment</label>
                  <select name="segment" value={formData.segment} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all">
                    <option value="Equity">Equity</option>
                    <option value="F&O">F&O</option>
                    <option value="Commodity">Commodity</option>
                    <option value="Currency">Currency</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Entry Price *</label>
                  <input required type="number" step="0.05" name="entryPrice" value={formData.entryPrice} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Exit Price</label>
                  <input type="number" step="0.05" name="exitPrice" value={formData.exitPrice} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Position Size *</label>
                  <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Stop Loss</label>
                  <input type="number" step="0.05" name="stopLoss" value={formData.stopLoss} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Target</label>
                  <input type="number" step="0.05" name="target" value={formData.target} onChange={handleChange} className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Risk Amount</label>
                  <div className="w-full px-4 h-11 bg-slate-100 border border-[#E9E6F5] rounded-xl text-[14px] font-[600] text-[#EF4444] flex items-center">
                    ₹{potentialRisk.toFixed(2)}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Reward Amount</label>
                  <div className="w-full px-4 h-11 bg-slate-100 border border-[#E9E6F5] rounded-xl text-[14px] font-[600] text-[#10B981] flex items-center">
                    ₹{potentialReward.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Tags (comma separated)</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. FOMO, Revenge, High Conviction" className="w-full px-4 h-11 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#64748B]">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={1} placeholder="What were you thinking?" className="w-full px-4 py-2.5 bg-slate-50 border border-[#E9E6F5] rounded-xl text-[14px] font-[500] focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all resize-none"></textarea>
                </div>
              </div>

              {/* Row 6: File Upload */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#64748B]">Attachment Upload</label>
                <div className="w-full border-2 border-dashed border-[#E9E6F5] rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-[#FBF8FF] hover:border-[#7C3AED] transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#64748B] group-hover:text-[#7C3AED] mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-[14px] font-[600] text-[#0F172A]">Drag & drop your files here</p>
                  <p className="text-[12px] font-[500] text-[#64748B] mt-1">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E9E6F5] flex justify-end gap-4">
                <button type="button" className="px-6 h-11 bg-white border border-[#E9E6F5] text-[#64748B] rounded-xl text-[14px] font-[600] hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="button" className="px-6 h-11 bg-white border border-[#7C3AED] text-[#7C3AED] rounded-xl text-[14px] font-[600] hover:bg-[#FBF8FF] transition-colors">Save Draft</button>
                <button type="submit" disabled={isSubmitting} className="px-8 h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-[14px] font-[600] transition-colors shadow-md disabled:bg-slate-300">
                  {isSubmitting ? "Saving..." : "Save Trade"}
                </button>
              </div>

            </form>
          </div>

          {/* Right Sidebar Live Calculation - Fixed 280px width */}
          <div className="w-[280px] shrink-0 space-y-6">
            
            {/* Card 1: Trade Summary */}
            <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-[24px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] space-y-4">
              <h3 className="text-[18px] font-[600] text-[#0F172A]">Trade Summary</h3>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[14px] font-[500] text-[#64748B]">Risk Reward Ratio</span>
                  <span className="text-[14px] font-[600] text-[#0F172A]">1 : {plannedRR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[14px] font-[500] text-[#64748B]">Potential Risk</span>
                  <span className="text-[14px] font-[600] text-[#EF4444]">₹{potentialRisk.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[14px] font-[500] text-[#64748B]">Potential Reward</span>
                  <span className="text-[14px] font-[600] text-[#10B981]">₹{potentialReward.toFixed(2)}</span>
                </div>
                
                <div className="pt-2">
                  <span className="text-[14px] font-[500] text-[#64748B] block mb-2">Confidence Level</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={22}
                        className={`cursor-pointer transition-colors ${
                          star <= (hoveredStar || confidence) 
                            ? "fill-[#F59E0B] text-[#F59E0B]" 
                            : "fill-slate-100 text-slate-200"
                        }`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setConfidence(star)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Trade Checklist */}
            <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-[24px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] space-y-4">
              <h3 className="text-[18px] font-[600] text-[#0F172A]">Trade Checklist</h3>
              <div className="space-y-3 pt-2">
                {checklist.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-[20px] h-[20px] rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                      item.checked ? "bg-[#10B981] border-[#10B981]" : "border-[#E9E6F5] bg-slate-50 group-hover:border-[#7C3AED]"
                    }`}>
                      <Check size={14} className={item.checked ? "text-white" : "text-transparent"} />
                    </div>
                    <span className={`text-[14px] font-[500] transition-colors leading-snug ${
                      item.checked ? "text-[#0F172A]" : "text-[#64748B]"
                    }`}>{item.text}</span>
                    {/* hidden input so onClick on label works natively */}
                    <input type="checkbox" className="hidden" checked={item.checked} onChange={() => toggleChecklist(item.id)} />
                  </label>
                ))}
              </div>
            </div>

            {/* Card 3: AI Trade Coach */}
            <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-[24px] shadow-[0px_8px_24px_rgba(15,23,42,0.04)] space-y-4 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-[#7C3AED]/10 to-[#8B5CF6]/10 rounded-full blur-2xl"></div>
              <h3 className="text-[18px] font-[600] text-[#0F172A] flex items-center gap-2 relative z-10">
                <Star size={18} className="text-[#8B5CF6] fill-[#8B5CF6]" /> 
                AI Trade Coach
              </h3>
              <div className="space-y-3 relative z-10">
                {plannedRR > 0 && plannedRR < 2 && (
                  <div className="flex items-start gap-2 text-[#EF4444] bg-[#FEF2F2] p-3 rounded-xl border border-[#EF4444]/20">
                    <TrendingDown size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[13px] font-[500] leading-snug">Current RR is below 1:2. Consider reducing position size or tightening the stop loss.</p>
                  </div>
                )}
                {potentialRisk > 5000 && (
                  <div className="flex items-start gap-2 text-[#F59E0B] bg-[#FFFBEB] p-3 rounded-xl border border-[#F59E0B]/20">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[13px] font-[500] leading-snug">Your risk is ₹{potentialRisk.toFixed(0)}, which is higher than your historical average.</p>
                  </div>
                )}
                <div className="flex items-start gap-2 text-[#7C3AED] bg-[#FBF8FF] p-3 rounded-xl border border-[#7C3AED]/20">
                  <Star size={16} className="shrink-0 mt-0.5" />
                  <p className="text-[13px] font-[500] leading-snug">Your highest win rate setup is VWAP (68%). Keep identifying those edges!</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeMethod !== "single" && (
        <div className="bg-[#FFFFFF] border border-[#E9E6F5] rounded-[20px] p-12 shadow-[0px_8px_24px_rgba(15,23,42,0.04)] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#FBF8FF] rounded-full flex items-center justify-center text-[#7C3AED] mb-4">
            <Upload size={24} />
          </div>
          <h3 className="text-[20px] font-[600] text-[#0F172A] mb-2">{activeMethod === "excel" ? "Upload Excel / CSV" : "Paste Data"}</h3>
          <p className="text-[14px] font-[500] text-[#64748B] max-w-sm mb-6 leading-relaxed">
            {activeMethod === "excel" ? "Drag and drop your broker's trade report here to bulk import." : "Paste tab-separated or comma-separated data directly."}
          </p>
          
          {activeMethod === "excel" && (
            <div className="flex flex-col items-center gap-4 relative">
              <label className="px-10 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-[14px] font-[600] tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2">
                <FileSpreadsheet size={18} />
                Select CSV File
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isSubmitting} />
              </label>
              <a href="/trade_template.csv" download className="text-[13px] font-[600] text-[#7C3AED] hover:text-[#6D28D9] underline underline-offset-4 transition-colors">
                Download Example Template
              </a>
            </div>
          )}

          {activeMethod === "paste" && (
            <div className="flex flex-col items-center w-full max-w-lg">
              <div className="w-full mb-3 text-left">
                <p className="text-[13px] font-[500] text-[#64748B] mb-2">Paste columns in this exact order (tab or comma separated):</p>
                <code className="text-[12px] font-mono font-[600] text-[#0F172A] bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 block">
                  Date | Time | Symbol | Direction | Qty | Entry Price | Exit Price
                </code>
              </div>
              <textarea 
                className="w-full h-32 p-4 bg-[#FBF8FF] border border-[#8B5CF6]/20 rounded-2xl text-[13px] font-mono text-[#0F172A] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 mb-4 resize-none shadow-inner transition-all placeholder-slate-400"
                placeholder="2024-05-01	09:15	NIFTY 22500 CE	LONG	50	150.50	165.00"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              <button 
                onClick={handlePasteImport}
                disabled={isSubmitting}
                className="px-10 py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-2xl text-[14px] font-[600] tracking-wide transition-all shadow-md hover:shadow-lg w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ClipboardList size={18} />
                {isSubmitting ? "Importing Data..." : "Paste & Import Trades"}
              </button>
            </div>
          )}

          {importHistory.length > 0 && (
            <div className="w-full max-w-lg mt-8 pt-8 border-t border-[#E9E6F5]">
              <h4 className="text-[14px] font-[600] text-[#0F172A] mb-4 text-left">Recent Imports</h4>
              <div className="space-y-3">
                {importHistory.map(history => (
                  <div key={history.id} className="flex items-center justify-between p-4 bg-slate-50 border border-[#E9E6F5] rounded-xl">
                    <div className="text-left">
                      <p className="text-[13px] font-[600] text-[#0F172A]">{history.count} Trades Imported</p>
                      <p className="text-[11px] font-[500] text-[#64748B]">{history.date}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteImport(history.id)}
                      className="text-[12px] font-[600] text-[#EF4444] hover:bg-[#FEF2F2] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#EF4444]/20"
                    >
                      Undo Import
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MethodCard({ id, title, desc, icon, active, onClick }: { id: string, title: string, desc: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`p-[20px] rounded-[20px] cursor-pointer transition-all relative ${
        active 
          ? "bg-[#FBF8FF] border-2 border-[#8B5CF6] shadow-sm" 
          : "bg-[#FFFFFF] border-2 border-transparent border-[#E9E6F5] hover:border-[#8B5CF6]/50"
      }`}
    >
      {active && (
        <div className="absolute top-4 right-4 w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center text-white">
          <Check size={10} strokeWidth={4} />
        </div>
      )}
      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center mb-3 ${active ? "bg-white text-[#8B5CF6] shadow-sm" : "bg-slate-50 text-[#64748B]"}`}>
        {icon}
      </div>
      <h3 className={`text-[14px] font-[600] mb-1 ${active ? "text-[#8B5CF6]" : "text-[#0F172A]"}`}>{title}</h3>
      <p className={`text-[12px] font-[500] leading-relaxed ${active ? "text-[#8B5CF6]" : "text-[#64748B]"}`}>{desc}</p>
    </div>
  );
}
