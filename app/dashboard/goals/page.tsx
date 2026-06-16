"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Plus,
  Clock,
  Trash2,
  X,
  Target,
  Shield,
  Activity,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  MoreVertical,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Check
} from "lucide-react";
import toast from "react-hot-toast";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  getGoals,
  addGoal,
  updateGoalProgress,
  deleteGoal,
  GoalData
} from "@/app/actions/goals";

const CATEGORY_STYLES: Record<string, { label: string; text: string; bg: string; border: string; iconBg: string; colorCode: string }> = {
  Performance: { label: "Performance", text: "text-[#059669]", bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]/50", iconBg: "bg-[#ECFDF5] text-[#059669]", colorCode: "#10B981" },
  Risk: { label: "Risk", text: "text-[#2563EB]", bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]/50", iconBg: "bg-[#EFF6FF] text-[#2563EB]", colorCode: "#3B82F6" },
  Activity: { label: "Activity", text: "text-[#DB2777]", bg: "bg-[#FDF2F8]", border: "border-[#FBCFE8]/50", iconBg: "bg-[#FDF2F8] text-[#DB2777]", colorCode: "#EC4899" },
  Habit: { label: "Habit", text: "text-[#D97706]", bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]/50", iconBg: "bg-[#FFFBEB] text-[#D97706]", colorCode: "#F59E0B" },
  Learning: { label: "Learning", text: "text-[#4F46E5]", bg: "bg-[#EEF2FF]", border: "border-[#C7D2FE]/50", iconBg: "bg-[#EEF2FF] text-[#4F46E5]", colorCode: "#6366F1" }
};

export default function GoalsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "all" | string>("active");
  const [selectedGoal, setSelectedGoal] = useState<GoalData | null>(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  
  // Add Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Performance");
  const [newTargetValue, setNewTargetValue] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("2024-05-31");
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Update Progress Form State
  const [progressValue, setProgressValue] = useState("");
  const [submittingProgress, setSubmittingProgress] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("trade_adhyayan_user");
    if (!userEmail) {
      router.push("/login");
      return;
    }
    setEmail(userEmail);
    loadGoals(userEmail);
  }, [router]);

  async function loadGoals(userEmail: string) {
    setLoading(true);
    try {
      const data = await getGoals(userEmail);
      setGoals(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load goals.");
    } finally {
      setLoading(false);
    }
  }

  // Add Goal
  const handleAddGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newTitle.trim() || !newTargetValue) return;
    setSubmittingAdd(true);
    try {
      const res = await addGoal(email, {
        title: newTitle,
        category: newCategory,
        targetValue: parseFloat(newTargetValue),
        targetDate: newTargetDate
      });
      if (res.success) {
        toast.success("Goal created successfully!");
        setShowAddModal(false);
        setNewTitle("");
        setNewTargetValue("");
        loadGoals(email);
      } else {
        toast.error(res.error || "Failed to create goal");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Update Progress
  const handleUpdateProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedGoal || !progressValue) return;
    setSubmittingProgress(true);
    
    // For mock goals, update state locally since they don't persist in DB
    if (selectedGoal.id.startsWith("mock_goal_")) {
      const val = parseFloat(progressValue);
      const progressPct = Math.round((val / selectedGoal.targetValue) * 100);
      
      let nextStatus = selectedGoal.status;
      if (val === 0) {
        nextStatus = "NOT_STARTED";
      } else if (val >= selectedGoal.targetValue) {
        nextStatus = "ACHIEVED";
      } else if (selectedGoal.category.toLowerCase() === "risk" && val > selectedGoal.targetValue) {
        nextStatus = "AT_RISK";
      } else {
        nextStatus = "ON_TRACK";
      }

      setGoals(prev => prev.map(g => g.id === selectedGoal.id ? {
        ...g,
        currentValue: val,
        progress: progressPct,
        status: nextStatus
      } : g));

      toast.success("Progress updated (local demo)!");
      setShowProgressModal(false);
      setProgressValue("");
      setSelectedGoal(null);
      setSubmittingProgress(false);
      return;
    }

    try {
      const res = await updateGoalProgress(email, selectedGoal.id, parseFloat(progressValue));
      if (res.success) {
        toast.success("Goal progress updated!");
        setShowProgressModal(false);
        setProgressValue("");
        setSelectedGoal(null);
        loadGoals(email);
      }
    } catch {
      toast.error("Failed to update progress.");
    } finally {
      setSubmittingProgress(false);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId: string) => {
    if (!email) return;
    if (!confirm("Are you sure you want to delete this goal?")) return;

    if (goalId.startsWith("mock_goal_")) {
      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast.success("Goal removed (local demo)!");
      return;
    }

    try {
      const res = await deleteGoal(email, goalId);
      if (res.success) {
        toast.success("Goal deleted!");
        loadGoals(email);
      }
    } catch {
      toast.error("Failed to delete goal.");
    }
  };

  // Filtered Goals list
  const filteredGoals = useMemo(() => {
    if (activeTab === "all") return goals;
    if (activeTab === "completed") return goals.filter(g => g.status === "ACHIEVED");
    return goals.filter(g => g.status !== "ACHIEVED");
  }, [goals, activeTab]);

  // Overall calculations for KPI Overview
  const summaryMetrics = useMemo(() => {
    const total = goals.length;
    const achieved = goals.filter(g => g.status === "ACHIEVED").length;
    const onTrack = goals.filter(g => g.status === "ON_TRACK").length;
    const atRisk = goals.filter(g => g.status === "AT_RISK").length;
    const notStarted = goals.filter(g => g.status === "NOT_STARTED").length;

    // Average progress of all goals (capped at 100% per goal to ensure accurate overall progress)
    const sumCappedProgress = goals.reduce((acc, g) => acc + Math.min(g.progress, 100), 0);
    const overallProgress = total > 0 ? Math.round(sumCappedProgress / total) : 0;

    return { total, achieved, onTrack, atRisk, notStarted, overallProgress };
  }, [goals]);

  // Recharts Pie Chart Data (Category Distribution)
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {
      Performance: 0,
      Risk: 0,
      Activity: 0,
      Learning: 0,
      Habit: 0
    };

    goals.forEach(g => {
      const cat = g.category;
      if (cat in counts) {
        counts[cat]++;
      } else {
        counts.Performance++; // Fallback
      }
    });

    const total = goals.length || 1;
    return Object.keys(counts).map(key => ({
      name: key === "Risk" ? "Risk Management" : key,
      value: counts[key],
      percentage: Math.round((counts[key] / total) * 100),
      color: CATEGORY_STYLES[key]?.colorCode || "#6366F1"
    })).filter(item => item.value > 0);
  }, [goals]);

  // Insights helper values
  const insights = useMemo(() => {
    // 1. Best Performing Category
    // Find category with highest average progress
    const catProgressSum: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    
    goals.forEach(g => {
      catProgressSum[g.category] = (catProgressSum[g.category] || 0) + Math.min(g.progress, 100);
      catCounts[g.category] = (catCounts[g.category] || 0) + 1;
    });

    let bestCat = "None";
    let maxAvg = 0;
    Object.keys(catCounts).forEach(cat => {
      const avg = catProgressSum[cat] / catCounts[cat];
      if (avg > maxAvg) {
        maxAvg = avg;
        bestCat = cat;
      }
    });

    // 2. Highest Progress Goal
    let highestGoal = "None";
    let maxProg = 0;
    goals.forEach(g => {
      if (g.progress > maxProg) {
        maxProg = g.progress;
        highestGoal = g.title;
      }
    });

    // 3. Needs Focus Goal
    // Find goal with AT_RISK status or lowest progress if none are at risk
    const atRiskGoal = goals.find(g => g.status === "AT_RISK");
    const needsFocusGoal = atRiskGoal ? atRiskGoal.title : (goals.length > 0 ? [...goals].sort((a,b) => a.progress - b.progress)[0].title : "None");

    return { bestCat, highestGoal, needsFocusGoal };
  }, [goals]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-[#1E1B4B]">
      
      {/* ── SECTION 1: OVERVIEW KPI CARDS ROW (Col span 4) ── */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Overall Progress concentric gauge */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            {/* Background circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#ECFDF5" strokeWidth="6" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#10B981"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="163.36"
                strokeDashoffset={163.36 - (163.36 * summaryMetrics.overallProgress) / 100}
              />
            </svg>
            <span className="text-sm font-black text-[#111827]">{summaryMetrics.overallProgress}%</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider block">Overall Progress</span>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Great progress! Keep it up.</span>
          </div>
        </div>

        {/* Card 2: Goals Achieved */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-center text-emerald-500">
            <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Goals Achieved</span>
            <CheckCircle2 size={14} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-xl font-black text-[#111827] leading-none">{summaryMetrics.achieved} <span className="text-xs text-slate-400 font-semibold">/ {summaryMetrics.total}</span></h4>
            <span className="text-[8px] font-bold bg-[#ECFDF5] text-[#059669] px-1.5 py-0.5 rounded-full">+2 this month</span>
          </div>
        </div>

        {/* Card 3: On Track */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-center text-blue-500">
            <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">On Track</span>
            <TrendingUp size={14} />
          </div>
          <div className="mt-2">
            <h4 className="text-xl font-black text-[#111827] leading-none">{summaryMetrics.onTrack}</h4>
            <span className="text-[8px] font-semibold text-blue-600 block mt-1">33% of total goals</span>
          </div>
        </div>

        {/* Card 4: At Risk */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-center text-amber-500">
            <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">At Risk</span>
            <AlertTriangle size={14} />
          </div>
          <div className="mt-2">
            <h4 className="text-xl font-black text-[#111827] leading-none">{summaryMetrics.atRisk}</h4>
            <span className="text-[8px] font-semibold text-amber-600 block mt-1">Needs attention</span>
          </div>
        </div>

        {/* Card 5: Not Started */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Not Started</span>
            <Clock size={14} />
          </div>
          <div className="mt-2">
            <h4 className="text-xl font-black text-[#111827] leading-none">{summaryMetrics.notStarted}</h4>
            <span className="text-[8px] font-semibold text-slate-400 block mt-1">Let's get started!</span>
          </div>
        </div>

        {/* Card 6: Current Streak */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left flex flex-col justify-between min-h-[90px]">
          <div className="flex justify-between items-center text-purple-500">
            <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Current Streak</span>
            <Trophy size={14} />
          </div>
          <div className="mt-2">
            <h4 className="text-xl font-black text-[#111827] leading-none">12 Days</h4>
            <span className="text-[8px] font-semibold text-purple-600 block mt-1">Keep the streak going!</span>
          </div>
        </div>

      </div>

      {/* ── SECTION 2: GOALS OVERVIEW LIST TABLE (Col span 3) ── */}
      <div className="xl:col-span-3 space-y-6">
        <div className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-sm p-6 text-left">
          
          {/* Header controls & tabs switcher */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-50">
            <h2 className="text-sm font-black text-[#111827] uppercase tracking-wider">Goals Overview</h2>
            
            <div className="flex gap-1 bg-slate-50 border border-[#EEF0F4] rounded-xl p-0.5 text-xs font-bold shrink-0">
              {[
                { tab: "active", label: "Active Goals" },
                { tab: "completed", label: "Completed Goals" },
                { tab: "all", label: "All Goals" }
              ].map(t => (
                <button
                  key={t.tab}
                  onClick={() => setActiveTab(t.tab)}
                  className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === t.tab ? "bg-white text-[#6D3DF5] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-[#475569]">
              <thead>
                <tr className="border-b border-[#EEF0F4] text-[#94A3B8] font-black uppercase text-[10px] tracking-wider text-left">
                  <th className="pb-3.5 pl-2">Goal</th>
                  <th className="pb-3.5">Category</th>
                  <th className="pb-3.5">Target</th>
                  <th className="pb-3.5 w-44">Progress</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5">Target Date</th>
                  <th className="pb-3.5 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F4]">
                {filteredGoals.map(g => {
                  const style = CATEGORY_STYLES[g.category] || CATEGORY_STYLES.Performance;
                  
                  // Status badge style mapping
                  let statusBadge = "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]";
                  if (g.status === "AT_RISK") statusBadge = "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]";
                  if (g.status === "NOT_STARTED") statusBadge = "bg-slate-100 text-slate-500 border-slate-200";

                  // Progress bar color
                  let progressBarBg = "bg-[#3B82F6]";
                  if (g.status === "ACHIEVED") progressBarBg = "bg-[#10B981]";
                  if (g.status === "AT_RISK") progressBarBg = "bg-[#F59E0B]";

                  return (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Title & subtitle */}
                      <td className="py-4 pl-2 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
                          <Target size={14} />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#0F172A] text-xs leading-normal">{g.title}</h4>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                            {g.category === "Risk" ? "Risk management" : "Maintain consistency"}
                          </span>
                        </div>
                      </td>

                      {/* Category Tag */}
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${style.bg} ${style.text} ${style.border}`}>
                          {style.label}
                        </span>
                      </td>

                      {/* Target value formatting */}
                      <td className="py-4 font-bold text-[#0F172A]">
                        {g.category.toLowerCase() === "performance" && typeof g.targetValue === "number" && g.targetValue > 100
                          ? `₹${g.targetValue.toLocaleString("en-IN")}`
                          : g.targetValue + (g.title.includes("%") ? "%" : "")}
                      </td>

                      {/* Progress bar */}
                      <td className="py-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                            <span>
                              {g.category.toLowerCase() === "performance" && g.currentValue > 100
                                ? `₹${g.currentValue.toLocaleString("en-IN")}`
                                : g.currentValue + (g.title.includes("%") ? "%" : "")}
                            </span>
                            <span>{g.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${progressBarBg}`} style={{ width: `${Math.min(g.progress, 100)}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border capitalize ${statusBadge}`}>
                          {g.status.replace("_", " ").toLowerCase()}
                        </span>
                      </td>

                      {/* Target Date */}
                      <td className="py-4">
                        <div className="text-[#0F172A] font-bold">
                          {g.targetDate ? new Date(g.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                          {g.status === "ACHIEVED" ? "Achieved" : "13 days left"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-2 text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          <button
                            onClick={() => {
                              setSelectedGoal(g);
                              setProgressValue(g.currentValue.toString());
                              setShowProgressModal(true);
                            }}
                            className="bg-slate-50 hover:bg-slate-100 border border-[#EEF0F4] text-[#475569] hover:text-[#0F172A] font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            title="Update progress"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1.5 border border-[#EEF0F4] hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-slate-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete goal"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Goal action button footer */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full border border-dashed border-[#EEF0F4] hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 py-3 rounded-xl text-xs font-bold text-[#6D3DF5] flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-6"
          >
            <Plus size={15} />
            <span>Add New Goal</span>
          </button>

        </div>
      </div>

      {/* ── SECTION 3: RIGHT SIDEBAR WIDGETS (Col span 1) ── */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Goal Categories distribution Recharts Pie */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left">
          <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider mb-4 pb-2 border-b border-[#EEF0F4]">Goal Categories</h3>
          
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-[#111827] leading-none">{goals.length}</span>
              <span className="text-[9px] font-semibold text-slate-400 mt-1">Total Goals</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {categoryChartData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-[#475569]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span>{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>

          <div className="bg-[#EFF6FF] border border-[#BFDBFE]/50 rounded-xl p-3 mt-4 flex gap-2 text-left">
            <Lightbulb size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
            <p className="text-[10px] font-semibold text-[#1E3A8A] leading-normal">
              Balance is key! You're doing well across all important areas.
            </p>
          </div>
        </div>

        {/* Milestones Stepper widget */}
        <div className="bg-white border border-[#EEF0F4] rounded-[24px] p-5 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#EEF0F4]">
            <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider">Milestones</h3>
            <span className="text-[10px] font-bold text-[#6D3DF5] hover:underline cursor-pointer">View All</span>
          </div>

          <div className="space-y-5 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
            {/* Milestone 1: Achieved */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-[14.5px] top-1.5 w-6 h-6 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] z-10">
                <Check size={10} strokeWidth={3} />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#0F172A]">First Profit Goal Achieved</h4>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Achieved ₹25,000 profit</p>
                <span className="text-[8px] font-semibold text-slate-400 block mt-1">May 05, 2024</span>
              </div>
            </div>

            {/* Milestone 2: Achieved */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-[14.5px] top-1.5 w-6 h-6 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] z-10">
                <Check size={10} strokeWidth={3} />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#0F172A]">10 Day Trading Streak</h4>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Maintained 10 days of consistency</p>
                <span className="text-[8px] font-semibold text-slate-400 block mt-1">May 08, 2024</span>
              </div>
            </div>

            {/* Milestone 3: In Progress */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-[10.5px] top-2 w-4 h-4 rounded-full bg-[#EFF6FF] border-2 border-[#3B82F6] z-10" />
              <div>
                <h4 className="text-xs font-bold text-[#0F172A]">Breakout Master</h4>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Complete 20 breakout trades</p>
                <span className="text-[8px] font-bold text-blue-600 block mt-1 uppercase">In Progress</span>
              </div>
            </div>

            {/* Milestone 4: Upcoming */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-[9.5px] top-2 w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-300 z-10" />
              <div>
                <h4 className="text-xs font-bold text-[#64748B]">Risk Master</h4>
                <p className="text-[9px] font-semibold text-slate-300 mt-0.5">Maintain &lt;10% drawdown for a month</p>
                <span className="text-[8px] font-bold text-slate-400 block mt-1 uppercase">Upcoming</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── SECTION 4: FOOTER INSIGHTS & TIPS ROW (Col span 4) ── */}
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goals Insights summary cards */}
        <div className="lg:col-span-2 bg-white border border-[#EEF0F4] rounded-[24px] p-6 shadow-sm text-left">
          <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider mb-5 pb-2 border-b border-slate-50">Goals Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Best performing category */}
            <div className="bg-[#ECFDF5] border border-[#A7F3D0]/30 rounded-xl p-4 flex flex-col justify-between min-h-[100px]">
              <span className="text-[9px] font-black text-[#059669] uppercase tracking-wider">Best Performing Category</span>
              <h4 className="text-sm font-black text-[#111827] mt-3 leading-tight">{insights.bestCat}</h4>
              <span className="text-[9px] font-semibold text-[#059669] mt-2 block">4 / 5 goals on track</span>
            </div>

            {/* Highest Progress */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A]/30 rounded-xl p-4 flex flex-col justify-between min-h-[100px]">
              <span className="text-[9px] font-black text-[#D97706] uppercase tracking-wider">Highest Progress</span>
              <h4 className="text-sm font-black text-[#111827] mt-3 leading-tight truncate" title={insights.highestGoal}>{insights.highestGoal}</h4>
              <span className="text-[9px] font-semibold text-[#D97706] mt-2 block">104% completed</span>
            </div>

            {/* Needs Focus */}
            <div className="bg-[#FEF2F2] border border-[#FEE2E2]/30 rounded-xl p-4 flex flex-col justify-between min-h-[100px]">
              <span className="text-[9px] font-black text-[#DC2626] uppercase tracking-wider">Needs Focus</span>
              <h4 className="text-sm font-black text-[#111827] mt-3 leading-tight truncate" title={insights.needsFocusGoal}>{insights.needsFocusGoal}</h4>
              <span className="text-[9px] font-semibold text-[#DC2626] mt-2 block">62% completed</span>
            </div>

            {/* Consistency */}
            <div className="bg-[#F3E8FF] border border-[#E9D5FF]/30 rounded-xl p-4 flex flex-col justify-between min-h-[100px]">
              <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-wider">Consistency</span>
              <h4 className="text-sm font-black text-[#111827] mt-3 leading-tight">12 day streak</h4>
              <span className="text-[9px] font-semibold text-[#7C3AED] mt-2 block">Keep it going!</span>
            </div>
          </div>
        </div>

        {/* Tips checklist card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#EFF6FF] to-[#FAF8FF] border border-[#EEF0F4] rounded-[24px] p-6 text-left shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-[#111827] uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Tips to Achieve Your Goals</h3>
            <ul className="space-y-2.5 text-[11px] font-bold text-slate-600">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span>Break big goals into smaller, actionable steps.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span>Review your progress weekly and adjust if needed.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span>Stay consistent, even on tough days.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span>Celebrate small wins along the way!</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* ── ADD NEW GOAL DIALOG MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddGoalSubmit}
            className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] text-left animate-scale-up"
          >
            <div className="p-6 border-b border-[#EEF0F4] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-[18px] text-[#0F172A]">Add New Trading Goal</h3>
                <p className="text-[#64748B] text-[12px] font-medium mt-0.5">Set milestones, targets, and date parameters.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Goal Description</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Win Rate of 60%+, Max Drawdown < 10%..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-bold focus:bg-white cursor-pointer"
                  >
                    {Object.keys(CATEGORY_STYLES).map(key => (
                      <option key={key} value={key}>
                        {CATEGORY_STYLES[key].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Target Value</label>
                  <input
                    type="number"
                    required
                    value={newTargetValue}
                    onChange={e => setNewTargetValue(e.target.value)}
                    placeholder="e.g. 50000, 60, 20..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">Target Date</label>
                <input
                  type="date"
                  required
                  value={newTargetDate}
                  onChange={e => setNewTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#EEF0F4] flex justify-end gap-3 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 bg-white border border-[#EEF0F4] text-[#64748B] rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAdd}
                className="px-6 py-2.5 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:bg-slate-200 disabled:text-[#64748B] disabled:shadow-none cursor-pointer"
              >
                {submittingAdd ? "Creating..." : "Create Goal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── UPDATE PROGRESS DIALOG MODAL ── */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleUpdateProgressSubmit}
            className="bg-white rounded-[24px] border border-[#EEF0F4] shadow-2xl max-w-sm w-full overflow-hidden flex flex-col text-left animate-scale-up"
          >
            <div className="p-6 border-b border-[#EEF0F4] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-[16px] text-[#0F172A]">Update Goal Progress</h3>
                <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Title: {selectedGoal.title}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProgressModal(false);
                  setSelectedGoal(null);
                }}
                className="text-[#64748B] hover:text-[#0F172A] text-xl font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">
                  Current Value (Target: {selectedGoal.targetValue})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={progressValue}
                  onChange={e => setProgressValue(e.target.value)}
                  placeholder="e.g. 35000, 63, 16..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#EEF0F4] rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#6D3DF5]"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#EEF0F4] flex justify-end gap-3 bg-[#F8FAFC]">
              <button
                type="button"
                onClick={() => {
                  setShowProgressModal(false);
                  setSelectedGoal(null);
                }}
                className="px-5 py-2.5 bg-white border border-[#EEF0F4] text-[#64748B] rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingProgress}
                className="px-6 py-2.5 bg-[#6D3DF5] hover:bg-[#5B3FCC] text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:bg-slate-200 disabled:text-[#64748B] cursor-pointer"
              >
                {submittingProgress ? "Saving..." : "Save Progress"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
