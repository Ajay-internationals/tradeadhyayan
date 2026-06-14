"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Check, 
  Upload, 
  FileSpreadsheet, 
  ClipboardList, 
  PenTool, 
  Star, 
  AlertCircle, 
  TrendingDown, 
  Image as ImageIcon,
  Clock,
  Calendar as CalendarIcon,
  Search,
  ChevronDown,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Trash2,
  Undo
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function ManualAddTradePage() {
  const router = useRouter();
  const [activeMethod, setActiveMethod] = useState("single");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [pasteText, setPasteText] = useState("");
  const [importHistory, setImportHistory] = useState<{id: string, count: number, date: string}[]>([]);
  const [addAnother, setAddAnother] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    symbol: "",
    setup: "",
    strategyId: "",
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

  const [strategies, setStrategies] = useState<any[]>([]);

  // Load user active strategies
  useEffect(() => {
    const email = localStorage.getItem("trade_adhyayan_user");
    if (!email) {
      router.push("/login");
      return;
    }
    fetch(`/api/strategies?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.strategies) {
          setStrategies(data.strategies.filter((s: any) => s.status === "ACTIVE"));
        }
      })
      .catch((err) => console.error("Error loading strategies:", err));
  }, [router]);

  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedStrat = strategies.find((s) => s.id === selectedId);
    setFormData({
      ...formData,
      strategyId: selectedId,
      setup: selectedStrat ? selectedStrat.name : ""
    });
  };

  // Checklist State
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Followed my trading plan", checked: false },
    { id: 2, text: "Entry rules satisfied", checked: false },
    { id: 3, text: "Proper risk management", checked: false },
    { id: 4, text: "Stop loss placed", checked: false },
    { id: 5, text: "Reward to risk is good", checked: false },
    { id: 6, text: "I am emotionally neutral", checked: false },
    { id: 7, text: "Setup quality is high", checked: false }
  ]);

  const toggleChecklist = (id: number) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Calculations for risk and reward
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

  // Reset form helper
  const resetForm = () => {
    setFormData({
      symbol: "",
      setup: "",
      strategyId: "",
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
    setConfidence(0);
    setChecklist(checklist.map(c => ({ ...c, checked: false })));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.symbol || !formData.entryPrice || !formData.quantity) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const email = localStorage.getItem("trade_adhyayan_user") || "";
      const parsedTags = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      // Instrument type classification
      const asset = formData.symbol.toUpperCase();
      let instrumentType = "STOCK";
      if (asset.includes("NIFTY")) {
        instrumentType = asset.includes("BANK") ? "BANKNIFTY" : "NIFTY";
      } else if (asset.endsWith("CE") || asset.endsWith("PE")) {
        instrumentType = "OPTION";
      }

      const payload = {
        email,
        symbol: asset,
        instrumentType,
        direction: formData.direction,
        entryPrice: Number(formData.entryPrice),
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        quantity: Number(formData.quantity),
        entryTime: new Date(`${formData.entryDate}T${formData.entryTime}`).toISOString(),
        exitTime: formData.exitDate && formData.exitTime ? new Date(`${formData.exitDate}T${formData.exitTime}`).toISOString() : undefined,
        stopLoss: formData.stopLoss ? Number(formData.stopLoss) : undefined,
        target: formData.target ? Number(formData.target) : undefined,
        setup: formData.setup || undefined,
        strategyId: formData.strategyId || undefined,
        mood: checklist[5].checked ? "Confident" : "Calm", // map emotion based on neutral check or standard mood
        notes: formData.notes || undefined,
        followedPlan: checklist[0].checked,
        confidenceLevel: confidence || undefined,
        tags: parsedTags.length > 0 ? parsedTags : undefined
      };

      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Trade logged successfully!");
        if (addAnother) {
          resetForm();
        } else {
          router.push("/dashboard/trade-journal");
        }
      } else {
        toast.error(data.error || "Failed to save trade.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Upload Processor
  const processImportedText = async (text: string) => {
    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;
    const batchId = `import_${Date.now()}`;
    try {
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        const cols = line.split(/\t|,/).map(c => c.trim());
        if (cols.length < 6) continue;
        if (cols[0].toLowerCase().includes("date")) continue;

        const [date, time, symbol, direction, qty, entryPrice, exitPrice] = cols;
        if (!symbol || !qty || !entryPrice) continue;

        const email = localStorage.getItem('trade_adhyayan_user') || "";
        const payload = {
          email,
          symbol,
          direction: direction?.toUpperCase().includes("SHORT") ? "SHORT" : "LONG",
          entryPrice: Number(entryPrice),
          exitPrice: exitPrice ? Number(exitPrice) : 0,
          quantity: Number(qty),
          entryTime: new Date(`${date}T${time || '09:15:00'}`).toISOString(),
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
    if (!window.confirm("Are you sure you want to undo this import? This will delete all imported trades from this batch.")) return;
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
    <div className="text-left">
      <Toaster position="top-right" />
      <div className="space-y-6">
      
      {/* 2. Choose Method Selector Panel */}
      <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-5 text-left flex items-center gap-4">
          <Link 
            href="/dashboard/trade-journal" 
            className="w-9 h-9 bg-white border border-[#EEF0F4] rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#2563EB] hover:border-slate-300 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">
              Choose a method to add your trades
            </h3>
            <p className="text-[10px] font-semibold text-[#6B7280] mt-1">
              Select any of the options below to add trades to your journal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MethodCard 
            title="Add Single Trade" 
            desc="Add one trade at a time manually with all details." 
            icon={<PenTool size={20} />} 
            active={activeMethod === "single"} 
            onClick={() => setActiveMethod("single")} 
            themeColor="#2563EB"
          />
          <MethodCard 
            title="Upload Excel File" 
            desc="Upload your Excel or CSV file and we'll import the trades." 
            icon={<FileSpreadsheet size={20} />} 
            active={activeMethod === "excel"} 
            onClick={() => setActiveMethod("excel")} 
            themeColor="#2563EB"
          />
          <MethodCard 
            title="Paste Trades" 
            desc="Paste your trades from anywhere and we'll format it for you." 
            icon={<ClipboardList size={20} />} 
            active={activeMethod === "paste"} 
            onClick={() => setActiveMethod("paste")} 
            themeColor="#F59E0B"
          />
        </div>
      </div>

      {/* 3. Main Form Section */}
      {activeMethod === "single" && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Column: Form Detail */}
          <div className="flex-1 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] w-full">
            <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider mb-6 pb-3 border-b border-[#EEF0F4]">
              Add Single Trade
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Instrument, Setup, Direction */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Instrument */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Instrument / Symbol *
                  </label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input 
                      required 
                      type="text"
                      name="symbol" 
                      value={formData.symbol} 
                      onChange={handleChange} 
                      placeholder="Search eg. NIFTY, BANKNIFTY, RELIANCE" 
                      className="w-full pl-9 pr-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Setup Dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Setup
                  </label>
                  <div className="relative">
                    <select 
                      name="strategyId" 
                      value={formData.strategyId} 
                      onChange={handleStrategyChange} 
                      className="w-full pl-4 pr-10 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all cursor-pointer text-[#111827] appearance-none"
                    >
                      <option value="">Select setup</option>
                      {strategies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>

                {/* Direction Toggle */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Direction
                  </label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, direction: "LONG"})} 
                      className={`flex-1 h-11 rounded-xl text-xs font-black transition-all border ${
                        formData.direction === "LONG" 
                          ? "bg-[#ECFDF5] text-[#10B981] border-[#10B981]/40 shadow-sm" 
                          : "bg-[#F7F8FC] text-[#6B7280] border-[#EEF0F4] hover:bg-slate-100"
                      }`}
                    >
                      Long <span className="ml-0.5 text-sm">↑</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, direction: "SHORT"})} 
                      className={`flex-1 h-11 rounded-xl text-xs font-black transition-all border ${
                        formData.direction === "SHORT" 
                          ? "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/40 shadow-sm" 
                          : "bg-[#F7F8FC] text-[#6B7280] border-[#EEF0F4] hover:bg-slate-100"
                      }`}
                    >
                      Short <span className="ml-0.5 text-sm">↓</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Row 2: Entry Date&Time, Exit Date&Time, Market segment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Entry Date & Time */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Entry Date & Time
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <CalendarIcon size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input 
                        required 
                        type="date" 
                        name="entryDate" 
                        value={formData.entryDate} 
                        onChange={handleChange} 
                        className="w-full pl-9 pr-3 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                      />
                    </div>
                    <div className="relative flex-1">
                      <Clock size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input 
                        required 
                        type="time" 
                        name="entryTime" 
                        value={formData.entryTime} 
                        onChange={handleChange} 
                        className="w-full pl-9 pr-3 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                {/* Exit Date & Time */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Exit Date & Time
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <CalendarIcon size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input 
                        type="date" 
                        name="exitDate" 
                        value={formData.exitDate} 
                        onChange={handleChange} 
                        className="w-full pl-9 pr-3 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                      />
                    </div>
                    <div className="relative flex-1">
                      <Clock size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input 
                        type="time" 
                        name="exitTime" 
                        value={formData.exitTime} 
                        onChange={handleChange} 
                        className="w-full pl-9 pr-3 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                {/* Market Segment */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Market / Segment
                  </label>
                  <div className="relative">
                    <select 
                      name="segment" 
                      value={formData.segment} 
                      onChange={handleChange} 
                      className="w-full pl-4 pr-10 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Equity">Equity</option>
                      <option value="F&O">F&O</option>
                      <option value="Commodity">Commodity</option>
                      <option value="Currency">Currency</option>
                      <option value="Crypto">Crypto</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* Row 3: Entry, Exit, Position Size */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Entry Price *
                  </label>
                  <input 
                    required 
                    type="number" 
                    step="0.05" 
                    name="entryPrice" 
                    value={formData.entryPrice} 
                    onChange={handleChange} 
                    placeholder="Enter entry price"
                    className="w-full px-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Exit Price
                  </label>
                  <input 
                    type="number" 
                    step="0.05" 
                    name="exitPrice" 
                    value={formData.exitPrice} 
                    onChange={handleChange} 
                    placeholder="Enter exit price"
                    className="w-full px-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Position Size / Qty *
                  </label>
                  <input 
                    required 
                    type="number" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleChange} 
                    placeholder="Enter quantity"
                    className="w-full px-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                  />
                </div>

              </div>

              {/* Row 4: SL, Target, Calculated Risk & Reward */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Stop Loss
                  </label>
                  <input 
                    type="number" 
                    step="0.05" 
                    name="stopLoss" 
                    value={formData.stopLoss} 
                    onChange={handleChange} 
                    placeholder="Enter stop loss"
                    className="w-full px-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Target
                  </label>
                  <input 
                    type="number" 
                    step="0.05" 
                    name="target" 
                    value={formData.target} 
                    onChange={handleChange} 
                    placeholder="Enter target (optional)"
                    className="w-full px-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Risk (₹)
                  </label>
                  <div className="w-full px-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-black text-[#EF4444] flex items-center shadow-inner">
                    {potentialRisk > 0 ? `₹${potentialRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Reward (₹)
                  </label>
                  <div className="w-full px-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-black text-[#10B981] flex items-center shadow-inner">
                    {potentialReward > 0 ? `₹${potentialReward.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
                  </div>
                </div>

              </div>

              {/* Row 5: Tags & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Tags
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="tags" 
                      value={formData.tags} 
                      onChange={handleChange} 
                      placeholder="Add tags (e.g. Breakout, Ema, News)" 
                      className="w-full px-4 h-11 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all shadow-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Notes
                  </label>
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    rows={1} 
                    placeholder="Write your notes about this trade..." 
                    className="w-full px-4 py-3 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all resize-none shadow-sm"
                  />
                </div>

              </div>

              {/* Row 6: Chart screenshot upload */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Attachments (optional)
                </label>
                <div className="w-full border-2 border-dashed border-[#EEF0F4] rounded-[20px] p-6 flex flex-col items-center justify-center bg-[#F7F8FC] hover:bg-[#EFF6FF] hover:border-[#2563EB]/40 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-[#6B7280] group-hover:text-[#2563EB] mb-2.5 transition-colors">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-black text-[#111827]">Upload chart screenshot or any file</p>
                  <p className="text-[10px] font-semibold text-[#6B7280] mt-1">PNG, JPG, PDF up to 5MB</p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-6 border-t border-[#EEF0F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Left check box */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <div 
                    onClick={() => setAddAnother(!addAnother)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      addAnother 
                        ? "bg-[#2563EB] border-[#2563EB]" 
                        : "border-[#EEF0F4] bg-[#F7F8FC] group-hover:border-slate-300"
                    }`}
                  >
                    <Check size={12} className={addAnother ? "text-white" : "text-transparent"} />
                  </div>
                  <span className="text-xs font-bold text-[#6B7280] group-hover:text-[#111827] transition-colors">
                    Add another trade
                  </span>
                </label>

                {/* Right button actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button 
                    type="button" 
                    onClick={() => router.push("/dashboard/trade-journal")}
                    className="px-5 h-11 bg-white border border-[#EEF0F4] text-xs font-black text-[#6B7280] rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSubmit} // Same API logic as Save
                    className="px-5 h-11 bg-slate-50 border border-[#EEF0F4] text-xs font-black text-[#2563EB] rounded-xl hover:bg-[#EFF6FF] transition-colors shadow-sm cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-7 h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-black text-white rounded-xl transition-all shadow-md shadow-[#2563EB]/15 disabled:bg-slate-200 cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : "Save Trade"}
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column: Live summary & checklist */}
          <div className="w-full lg:w-[280px] shrink-0 space-y-6">
            
            {/* Widget 1: Trade Summary */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] space-y-5 text-left">
              <div className="flex items-center gap-2 pb-3.5 border-b border-[#EEF0F4]">
                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <TrendingDown size={15} />
                </div>
                <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider">
                  Trade Summary
                </h3>
              </div>

              <div className="space-y-4 pt-1 text-xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-[#F7F8FC]">
                  <span className="font-semibold text-[#6B7280]">Risk / Reward Ratio</span>
                  <span className="font-black text-[#111827]">
                    {plannedRR > 0 ? `1 : ${plannedRR.toFixed(1)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-[#F7F8FC]">
                  <span className="font-semibold text-[#6B7280]">Potential Risk</span>
                  <span className="font-black text-[#EF4444]">
                    {potentialRisk > 0 ? `₹${potentialRisk.toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#F7F8FC]">
                  <span className="font-semibold text-[#6B7280]">Potential Reward</span>
                  <span className="font-black text-[#10B981]">
                    {potentialReward > 0 ? `₹${potentialReward.toLocaleString()}` : "—"}
                  </span>
                </div>
                
                <div className="pt-2">
                  <span className="font-semibold text-[#6B7280] block mb-2">Confidence Level</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={20}
                        className={`cursor-pointer transition-all ${
                          star <= (hoveredStar || confidence) 
                            ? "fill-[#F59E0B] text-[#F59E0B] scale-110" 
                            : "fill-slate-50 text-slate-300 hover:text-[#F59E0B]"
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

            {/* Widget 2: Checklist */}
            <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] space-y-5 text-left">
              <div className="flex items-center gap-2 pb-3.5 border-b border-[#EEF0F4]">
                <div className="w-7 h-7 rounded-lg bg-[#FAF5FF] text-[#8B5CF6] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={15} />
                </div>
                <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider">
                  Trade Checklist
                </h3>
              </div>

              <div className="space-y-3 pt-1">
                {checklist.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer group select-none">
                    <div 
                      onClick={() => toggleChecklist(item.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                        item.checked 
                          ? "bg-[#2563EB] border-[#2563EB]" 
                          : "border-[#EEF0F4] bg-[#F7F8FC] group-hover:border-slate-300"
                      }`}
                    >
                      <Check size={12} className={item.checked ? "text-white" : "text-transparent"} />
                    </div>
                    <span className={`text-xs font-semibold leading-tight transition-colors ${
                      item.checked ? "text-[#111827] font-bold" : "text-[#6B7280]"
                    }`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Widget 3: Pro Tip */}
            <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-[24px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] relative overflow-hidden text-left group">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-[#8B5CF6]/10 to-[#FAF5FF]/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="flex items-center gap-2.5 pb-2">
                <div className="p-1 bg-white rounded-lg text-[#8B5CF6] shadow-sm">
                  <Lightbulb size={16} />
                </div>
                <h3 className="text-xs font-black text-[#8B5CF6] uppercase tracking-wider">
                  Pro Tip
                </h3>
              </div>
              <p className="text-[11px] font-semibold text-[#8B5CF6] leading-relaxed relative z-10 max-w-[200px]">
                The more details you add, the better AI insights you'll get.
              </p>
              
              <div className="absolute right-4 bottom-4 text-[#8B5CF6]/30 group-hover:text-[#8B5CF6] transition-colors duration-500">
                <Sparkles size={24} className="animate-pulse" />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. CSV File Upload and Paste import widgets */}
      {activeMethod !== "single" && (
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-12 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-[#2563EB] mb-5 shadow-sm">
            <Upload size={24} />
          </div>
          
          <h3 className="text-base font-black text-[#111827] mb-2">
            {activeMethod === "excel" ? "Upload Excel / CSV File" : "Paste Trades Data"}
          </h3>
          <p className="text-xs font-semibold text-[#6B7280] max-w-sm mb-6 leading-relaxed">
            {activeMethod === "excel" 
              ? "Drag and drop your broker's trade report here to bulk import records." 
              : "Paste tab-separated or comma-separated columns directly."}
          </p>
          
          {activeMethod === "excel" && (
            <div className="flex flex-col items-center gap-4">
              <label className="px-10 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-black tracking-wide transition-all shadow-lg shadow-[#2563EB]/15 cursor-pointer flex items-center justify-center gap-2">
                <FileSpreadsheet size={18} />
                Select CSV File
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isSubmitting} />
              </label>
              <a 
                href="/trade_template.csv" 
                download 
                className="text-xs font-bold text-[#2563EB] hover:underline transition-all"
              >
                Download Excel Template
              </a>
            </div>
          )}

          {activeMethod === "paste" && (
            <div className="flex flex-col items-center w-full max-w-lg">
              <div className="w-full mb-3.5 text-left bg-[#F7F8FC] border border-[#EEF0F4] p-3 rounded-xl">
                <p className="text-[10px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                  Order of values (tab or comma separated):
                </p>
                <code className="text-[11px] font-mono font-bold text-[#111827] block">
                  Date | Time | Symbol | Direction | Qty | Entry Price | Exit Price
                </code>
              </div>
              
              <textarea 
                className="w-full h-32 p-4 bg-[#F7F8FC] border border-[#EEF0F4] rounded-2xl text-[11px] font-mono text-[#111827] focus:outline-none focus:border-[#2563EB] focus:bg-white mb-4 resize-none shadow-inner transition-all placeholder-slate-400"
                placeholder="2024-05-16	09:25	NIFTY 16 MAY 22500 CE	LONG	50	221.40	248.60"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              
              <button 
                onClick={handlePasteImport}
                disabled={isSubmitting}
                className="px-10 py-3.5 bg-[#111827] hover:bg-black text-white rounded-xl text-xs font-black tracking-wide transition-all shadow-md w-full disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ClipboardList size={18} />
                {isSubmitting ? "Importing Data..." : "Paste & Import Trades"}
              </button>
            </div>
          )}

          {/* Import History */}
          {importHistory.length > 0 && (
            <div className="w-full max-w-lg mt-8 pt-8 border-t border-[#EEF0F4]">
              <h4 className="text-xs font-black text-[#111827] uppercase tracking-wider mb-4 text-left">
                Recent Imports
              </h4>
              <div className="space-y-3">
                {importHistory.map(history => (
                  <div key={history.id} className="flex items-center justify-between p-4 bg-[#F7F8FC] border border-[#EEF0F4] rounded-xl text-left">
                    <div>
                      <p className="text-xs font-black text-[#111827]">{history.count} Trades Imported</p>
                      <p className="text-[10px] font-bold text-[#6B7280] mt-1">{history.date}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteImport(history.id)}
                      className="text-[10px] font-black text-[#EF4444] bg-white border border-[#EEF0F4] hover:bg-[#FEF2F2] hover:border-[#FEE2E2] px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Undo size={12} />
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
    </div>
  );
}

interface MethodCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  themeColor: string;
}

function MethodCard({ title, desc, icon, active, onClick, themeColor }: MethodCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 relative text-left select-none ${
        active 
          ? "bg-[#FAF5FF] border-[#2563EB] shadow-sm shadow-[#2563EB]/5" 
          : "bg-white border-[#EEF0F4] hover:border-slate-300"
      }`}
    >
      {active && (
        <div 
          className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: themeColor }}
        >
          <Check size={12} strokeWidth={3} />
        </div>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-all ${
        active 
          ? "bg-white shadow-sm" 
          : "bg-[#F7F8FC] text-[#6B7280]"
      }`}
      style={active ? { color: themeColor } : {}}
      >
        {icon}
      </div>
      <h3 className={`text-xs font-black uppercase tracking-wider mb-1 ${active ? "text-[#111827]" : "text-[#6B7280]"}`}>
        {title}
      </h3>
      <p className={`text-[10px] font-semibold leading-relaxed ${active ? "text-[#111827]" : "text-[#6B7280]"}`}>
        {desc}
      </p>
    </div>
  );
}
