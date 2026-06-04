
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import "../dashboard.css";
import {
  getTrades,
  addDbTrade,
  deleteDbTrade,
  getStrategies,
  addStrategy,
  getGoals,
  addGoal,
  updateGoalProgress,
  getUserSettings,
  saveUserSettings,
  getCalendarEvents,
  addCalendarEvent,
  getBrokerConnections,
  addBrokerConnection,
  disconnectBroker,
  getSyncLogs,
  triggerBrokerSync,
  getMistakes,
  addMistake,
  runAutoDetectMistakes,
  getMentorReviews,
  addMentorReview,
  getDashboardData,
  getMentorshipOverview,
  submitReviewRequest
} from "@/app/actions/trades";
import {
  TrendingUp,
  Plus,
  RefreshCw,
  Trash2,
  Lock,
  ArrowLeft,
  DollarSign,
  TrendingDown,
  Percent,
  Activity,
  Smile,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Settings,
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  Info,
  Layers,
  Upload,
  CheckCircle,
  HelpCircle,
  BarChart2,
  Frown,
  Compass,
  Link2,
  Sliders,
  Search,
  Star,
  User,
  Shield,
  Layers3,
  CheckSquare,
  FileSpreadsheet,
  Download,
  Menu,
  X as XIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface Trade {
  id: string;
  time: string;
  asset: string;
  type: "BUY" | "SELL";
  pnl: number;
  strategy: string;
  emotion: string;
  quantity?: number;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  target?: number;
  charges?: number;
  netPnl?: number;
  rr?: number;
  followedPlan?: boolean;
  notes?: string;
  source?: string;
  entryTime?: any;
  exitTime?: any;
}

interface StrategyItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  status: string;
  createdAt: Date;
}

interface GoalItem {
  id: string;
  title: string;
  category: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  status: string;
  targetDate: Date | null;
}

interface CalendarEventItem {
  id: string;
  title: string;
  eventType: string;
  startTime: Date;
  status: string;
}

interface BrokerConnectionItem {
  id: string;
  brokerName: string;
  status: string;
  lastSyncAt: Date | null;
}

interface SyncLogItem {
  id: string;
  connectionId: string;
  dataType: string;
  recordsCount: number;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
}

const DEFAULT_TRADES: Trade[] = [
  { id: "d1", time: "14:20 PM", asset: "NIFTY 22400 CE", type: "BUY", pnl: 12450, strategy: "Breakout", emotion: "Discipline ✓", quantity: 50, entryPrice: 125, exitPrice: 374, charges: 20, netPnl: 12430, rr: 2.5, followedPlan: true, source: "MANUAL", entryTime: new Date() },
  { id: "d2", time: "11:05 AM", asset: "RELIANCE", type: "BUY", pnl: -3200, strategy: "Retest", emotion: "FOMO Entry ⚠️", quantity: 200, entryPrice: 2840, exitPrice: 2824, charges: 20, netPnl: -3220, rr: 1.5, followedPlan: false, source: "MANUAL", entryTime: new Date() },
  { id: "d3", time: "Yesterday", asset: "HDFCBANK", type: "SELL", pnl: 8100, strategy: "Scalping", emotion: "Early Exit ⚠️", quantity: 300, entryPrice: 1540, exitPrice: 1513, charges: 20, netPnl: 8080, rr: 2.0, followedPlan: false, source: "MANUAL", entryTime: new Date() },
];



export default function ExtractedPage() {

  const [activeTab, setActiveTab] = useState<"dashboard" | "market" | "journal" | "mistakes" | "mentor" | "reports" | "strategies" | "tools" | "goals" | "calendar" | "settings">("dashboard");
  const [journalSubTab, setJournalSubTab] = useState<"single" | "upload" | "paste" | "broker">("single");
  const [goalsSubTab, setGoalsSubTab] = useState<"active" | "completed" | "all">("active");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const [authBrokerName, setAuthBrokerName] = useState<string | null>(null);
  const [brokerApiKey, setBrokerApiKey] = useState("");
  const [brokerApiSecret, setBrokerApiSecret] = useState("");
  const [brokerClientId, setBrokerClientId] = useState("");

  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnectionItem[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Manual Add Form
  const [asset, setAsset] = useState("");
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [pnl, setPnl] = useState("");
  const [strategy, setStrategy] = useState("Breakout");
  const [emotion, setEmotion] = useState("Discipline ✓");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");
  const [notes, setNotes] = useState("");
  const [pastedText, setPastedText] = useState("");

  // Create Strategy Form
  const [newStratName, setNewStratName] = useState("");
  const [newStratCategory, setNewStratCategory] = useState("Breakout");
  const [newStratDesc, setNewStratDesc] = useState("");
  const [newStratEntryRules, setNewStratEntryRules] = useState("");

  // Create Goal Form
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Performance");
  const [newGoalValue, setNewGoalValue] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");

  // Create Calendar Event Form
  const [newEvTitle, setNewEvTitle] = useState("");
  const [newEvType, setNewEvType] = useState("Review");
  const [newEvDate, setNewEvDate] = useState("");

  // Mistakes Form
  const [mistakeTradeId, setMistakeTradeId] = useState("");
  const [mistakeType, setMistakeType] = useState("Revenge Trading");
  const [mistakeSeverity, setMistakeSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [mistakeReason, setMistakeReason] = useState("");
  const [mistakeLoss, setMistakeLoss] = useState("");
  const [mistakeTip, setMistakeTip] = useState("");
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [mistakeSummary, setMistakeSummary] = useState<any>(null);

  // Mentor Review Form
  const [mentorTradeId, setMentorTradeId] = useState("");
  const [mentorScore, setMentorScore] = useState("");
  const [mentorFeedback, setMentorFeedback] = useState("");
  const [mentorStrengths, setMentorStrengths] = useState("");
  const [mentorImprovements, setMentorImprovements] = useState("");
  const [mentorReviews, setMentorReviews] = useState<any[]>([]);

  // Mentorship System states
  const [mentorshipData, setMentorshipData] = useState<any>(null);
  const [mentorshipSubTab, setMentorshipSubTab] = useState<"overview" | "submit" | "reviews">("overview");
  const [selectedReviewTradeIds, setSelectedReviewTradeIds] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState("");
  const [disciplineRating, setDisciplineRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isMentorshipLoading, setIsMentorshipLoading] = useState(false);

  // Tools Form Calculators
  const [calcCapital, setCalcCapital] = useState("100000");
  const [calcRiskPct, setCalcRiskPct] = useState("1");
  const [calcEntry, setCalcEntry] = useState("100");
  const [calcSL, setCalcSL] = useState("95");
  const [calcTarget, setCalcTarget] = useState("110");
  const [calcDirection, setCalcDirection] = useState<"BUY" | "SELL">("BUY");
  const [calcHigh, setCalcHigh] = useState("22500");
  const [calcLow, setCalcLow] = useState("22300");
  const [calcClose, setCalcClose] = useState("22450");
  const [fibHigh, setFibHigh] = useState("22500");
  const [fibLow, setFibLow] = useState("22300");
  const [fibDirection, setFibDirection] = useState<"LONG" | "SHORT">("LONG");

  // Checklist state
  const [checklist, setChecklist] = useState({
    trend: false,
    level: false,
    trigger: false,
    rr: false,
    slOrder: false,
    psychology: false,
  });

  // Settings states
  const [settingsTheme, setSettingsTheme] = useState("Light");
  const [settingsCurrency, setSettingsCurrency] = useState("INR");
  const [settingsTimezone, setSettingsTimezone] = useState("Asia/Kolkata");
  const [settingsRisk, setSettingsRisk] = useState("1");
  const [settingsRR, setSettingsRR] = useState("1:2");
  const [settingsBrokerage, setSettingsBrokerage] = useState(true);
  const [settingsDateRange, setSettingsDateRange] = useState("This Week");

  const [filterSearch, setFilterSearch] = useState("");
  const [filterSetup, setFilterSetup] = useState("All");
  const [filterEmotion, setFilterEmotion] = useState("All");
  const [filterType, setFilterType] = useState("All");

  
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

  const fetchMentorshipData = async (emailParam?: string) => {
    try {
      const email = emailParam || userEmail;
      if (!email) return;
      setIsMentorshipLoading(true);
      const data = await getMentorshipOverview(email);
      setMentorshipData(data);
    } catch (err) {
      console.error("Error loading mentorship data:", err);
    } finally {
      setIsMentorshipLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "mentor" && userEmail) {
      fetchMentorshipData();
    }
  }, [activeTab, userEmail]);

  const handleSubmitReviewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReviewTradeIds.length === 0) {
      toast.error("Please select at least one trade to submit.");
      return;
    }
    try {
      setIsSubmittingReview(true);
      await submitReviewRequest(
        userEmail,
        selectedReviewTradeIds,
        reviewNotes,
        disciplineRating
      );
      toast.success("Mentorship review request submitted successfully! 🎓");
      setSelectedReviewTradeIds([]);
      setReviewNotes("");
      setDisciplineRating(5);
      setMentorshipSubTab("reviews");
      await fetchMentorshipData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review request.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Initialize and load user data
  useEffect(() => {
    const email = localStorage.getItem('trade_adhyayan_user');
    if (!email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setIsLoading(true);

    const loadAllData = async () => {
      try {
        const data = await getDashboardData(email);

        setTrades(data.trades);
        setStrategies(data.strategies);
        setGoals(data.goals);
        setCalendarEvents(data.calendarEvents);

        if (data.settings) {
          const dbSettings = data.settings;
          setSettings(dbSettings);
          setSettingsTheme(dbSettings.theme);
          setSettingsCurrency(dbSettings.currency);
          setSettingsTimezone(dbSettings.timezone);
          setSettingsRisk(dbSettings.defaultRisk.toString());
          setSettingsRR(dbSettings.defaultRr === 2 ? "1:2" : `1:${dbSettings.defaultRr}`);
          setSettingsBrokerage(dbSettings.includeBrokerage);
          setSettingsDateRange(dbSettings.defaultDateRange);
        }

        setBrokerConnections(data.brokerConnections);
        setSyncLogs(data.syncLogs);
        setMistakes(data.mistakes);
        setMentorReviews(data.mentorReviews);

        if (data.mistakeSummary) {
          setMistakeSummary(data.mistakeSummary);
        }
      } catch (err) {
        console.error("Error loading data from database:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Load mistakes when Mistakes tab is active (No heavy auto-detect scanner runs on click)
  useEffect(() => {
    if (activeTab === "mistakes" && userEmail) {
      const loadMistakes = async () => {
        try {
          const dbMistakes = await getMistakes(userEmail);
          setMistakes(dbMistakes);
          await fetchMistakeSummary(userEmail);
        } catch (e) {
          console.error("Error loading mistakes:", e);
        }
      };
      loadMistakes();
    }
  }, [activeTab, userEmail]);

  const handleAddTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !quantity || !entryPrice || !exitPrice) {
      alert("Please fill all core fields!");
      return;
    }

    const qty = parseInt(quantity) || 1;
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tgt = parseFloat(target) || 0;
    
    // Formula calculations
    const pnlVal = tradeType === "BUY" ? (exit - entry) * qty : (entry - exit) * qty;
    const brokerage = settingsBrokerage ? 40 : 0; // standard charges
    const finalNetPnl = pnlVal - brokerage;

    let rr_val = 0;
    if (sl > 0 && tgt > 0) {
      const risk = tradeType === "BUY" ? (entry - sl) : (sl - entry);
      const reward = tradeType === "BUY" ? (tgt - entry) : (entry - tgt);
      if (risk > 0) rr_val = reward / risk;
    }

    const tempId = `temp_${Date.now()}`;
    const newTradeObj: Trade = {
      id: tempId,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      asset: asset.toUpperCase(),
      type: tradeType,
      pnl: pnlVal,
      strategy,
      emotion: emotion,
      quantity: qty,
      entryPrice: entry,
      exitPrice: exit,
      stopLoss: sl > 0 ? sl : undefined,
      target: tgt > 0 ? tgt : undefined,
      charges: brokerage,
      netPnl: finalNetPnl,
      rr: rr_val > 0 ? rr_val : undefined,
      followedPlan: !emotion.includes("⚠️"),
      notes: notes,
      entryTime: new Date()
    };

    setTrades((prev) => [newTradeObj, ...prev]);
    
    // Clear inputs
    setAsset("");
    setPnl("");
    setQuantity("");
    setEntryPrice("");
    setExitPrice("");
    setStopLoss("");
    setTarget("");
    setNotes("");
    
    setActiveTab("journal");

    try {
      const realTrade = await addDbTrade(userEmail, {
        asset,
        type: tradeType,
        pnl: pnlVal,
        strategy,
        emotion: newTradeObj.emotion,
        quantity: qty,
        entryPrice: entry,
        exitPrice: exit,
        stopLoss: sl > 0 ? sl : undefined,
        target: tgt > 0 ? tgt : undefined,
        charges: brokerage,
        netPnl: finalNetPnl,
        rr: rr_val > 0 ? rr_val : undefined,
        notes: notes,
      });
      setTrades((prev) => prev.map((t) => (t.id === tempId ? realTrade : t)));
    } catch (err) {
      console.error("Database insert failed, keeping local UI state.", err);
    }
  };

  const handleCreateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStratName) return;

    try {
      const newStrat = await addStrategy(userEmail, {
        name: newStratName,
        category: newStratCategory,
        description: newStratDesc,
        rulesJson: { entry: newStratEntryRules },
      });
      setStrategies((prev) => [newStrat, ...prev]);
      setNewStratName("");
      setNewStratDesc("");
      setNewStratEntryRules("");
      toast.success("Strategy saved to database!");
    } catch (err) {
      console.error("Failed to save strategy:", err);
      toast.error("Failed to save strategy. Please try again.");
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalValue) return;

    try {
      const newGoal = await addGoal(userEmail, {
        title: newGoalTitle,
        category: newGoalCategory,
        targetValue: parseFloat(newGoalValue),
        targetDate: newGoalDate ? new Date(newGoalDate) : null,
      });
      setGoals((prev) => [newGoal, ...prev]);
      setNewGoalTitle("");
      setNewGoalValue("");
      setNewGoalDate("");
      toast.success("Goal saved successfully! 🎯");
    } catch (err) {
      console.error("Failed to save goal:", err);
      toast.error("Failed to save goal.");
    }
  };

  const handleCreateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvTitle || !newEvDate) return;

    try {
      const newEv = await addCalendarEvent(userEmail, {
        title: newEvTitle,
        eventType: newEvType,
        startTime: new Date(newEvDate),
      });
      setCalendarEvents((prev) => [newEv, ...prev]);
      setNewEvTitle("");
      setNewEvDate("");
      toast.success("Calendar event created! 📅");
    } catch (err) {
      console.error("Failed to add calendar event:", err);
      toast.error("Failed to create event.");
    }
  };

  const handleDeleteTradeRecord = async (tradeId: string) => {
    const toastId = toast(
      (t) => (
        <span className="flex items-center gap-3">
          Delete this trade?
          <button
            className="px-2 py-1 bg-[#E94B8A] text-white text-[10px] font-bold rounded-lg"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteDbTrade(tradeId);
                setTrades((prev) => prev.filter((tr) => tr.id !== tradeId));
                toast.success("Trade deleted.");
              } catch (err) {
                toast.error("Failed to delete trade.");
              }
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const riskVal = parseFloat(settingsRisk) || 1.0;
      const rrVal = parseFloat(settingsRR.replace("1:", "")) || 2.0;

      await saveUserSettings(userEmail, {
        theme: settingsTheme,
        currency: settingsCurrency,
        timezone: settingsTimezone,
        defaultRisk: riskVal,
        defaultRr: rrVal,
        includeBrokerage: settingsBrokerage,
        defaultDateRange: settingsDateRange,
      });
      toast.success("Settings saved successfully! ⚙️");
    } catch (err) {
      console.error("Failed to save settings", err);
      toast.error("Failed to save settings.");
    }
  };

  const handleBrokerConnectionAction = async (broker: string) => {
    try {
      await addBrokerConnection(userEmail, broker, "CONNECTED");
      const connections = await getBrokerConnections(userEmail);
      setBrokerConnections(connections);
      toast.success(`Synchronized broker account ${broker} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to connect ${broker}.`);
    }
  };

  const handleTriggerBrokerSyncClick = async (broker: string) => {
    try {
      setIsLoading(true);
      const res = await triggerBrokerSync(userEmail, broker, {});
      if (res.success) {
        toast.success(`Imported ${res.recordsCount} trades from ${broker}!`);
        const dbTrades = await getTrades(userEmail);
        setTrades(dbTrades);
      } else {
        toast.error(`Failed to sync from ${broker}: ${res.errorMessage}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Broker sync failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddMentorReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorTradeId || !mentorScore || !mentorFeedback) return;
    try {
      const scoreNum = parseFloat(mentorScore) || 80;
      const strengthsArr = mentorStrengths ? mentorStrengths.split(",").map(s => s.trim()) : [];
      const improvementsArr = mentorImprovements ? mentorImprovements.split(",").map(s => s.trim()) : [];

      await addMentorReview(
        userEmail,
        mentorTradeId,
        scoreNum,
        mentorFeedback,
        strengthsArr,
        improvementsArr
      );
      const dbReviews = await getMentorReviews(userEmail);
      setMentorReviews(dbReviews);
      setMentorFeedback("");
      setMentorScore("");
      setMentorStrengths("");
      setMentorImprovements("");
      setMentorTradeId("");
      toast.success("Mentor review logged successfully! 🎓");
    } catch (e) {
      console.error(e);
      toast.error("Failed to log mentor review.");
    }
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

  const handlePasteImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    const lines = pastedText.split("\n");
    const parsed: any[] = [];
    
    lines.forEach((line) => {
      const cols = line.split("	");
      if (cols.length >= 3) {
        const symbol = cols[0].trim();
        const type = cols[1].toUpperCase().includes("BUY") || cols[1].toUpperCase().includes("LONG") ? "BUY" : "SELL";
        const pnl = parseFloat(cols[2].replace(/[^0-9.-]/g, "")) || 0;
        const strategy = cols[3] ? cols[3].trim() : "Paste Setup";
        parsed.push({ asset: symbol, type, pnl, strategy, emotion: "Discipline ✓" });
      }
    });

    if (parsed.length > 0) {
      const tid = toast.loading(`Saving ${parsed.length} trades...`);
      try {
        const insertPromises = parsed.map(trade => 
          addDbTrade(userEmail, {
            asset: trade.asset,
            type: trade.type,
            pnl: trade.pnl,
            strategy: trade.strategy,
            emotion: trade.emotion,
          })
        );
        await Promise.all(insertPromises);
        const dbTrades = await getTrades(userEmail);
        setTrades(dbTrades);
        setPastedText("");
        setActiveTab("journal");
        toast.success(`Imported ${parsed.length} trades successfully! ✅`, { id: tid });
      } catch (err) {
        console.error("Failed to save some pasted trades to database", err);
        toast.error("Failed to import some trades.", { id: tid });
      }
    } else {
      toast.error("Invalid format. Use tabs to separate: Instrument\tType\tPnL\tStrategy");
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").map(l => l.trim()).filter(l => l);
      if (lines.length <= 1) {
        alert("Empty CSV file or header only.");
        return;
      }

      // Parse headers
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const parsedTrades: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim());
        if (cols.length < headers.length) continue;

        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = cols[idx];
        });

        const asset = row["asset"] || row["symbol"] || row["instrument"] || "";
        const type = (row["type"] || row["direction"] || "BUY").toUpperCase().includes("BUY") || (row["type"] || row["direction"] || "BUY").toUpperCase().includes("LONG") ? "BUY" : "SELL";
        const quantity = parseFloat(row["quantity"] || row["qty"]) || 1;
        const entryPrice = parseFloat(row["entryprice"] || row["entry"] || row["buyprice"]) || 100;
        const exitPrice = parseFloat(row["exitprice"] || row["exit"] || row["sellprice"]) || 100;
        const pnl = parseFloat(row["pnl"] || row["profit"] || row["loss"]) || 0;
        const strategy = row["strategy"] || row["setup"] || "CSV Upload";
        const emotion = row["emotion"] || row["mood"] || "Discipline ✓";

        if (asset) {
          parsedTrades.push({
            asset,
            type,
            quantity,
            entryPrice,
            exitPrice,
            pnl,
            strategy,
            emotion
          });
        }
      }

      if (parsedTrades.length > 0) {
        try {
          setIsLoading(true);
          const promises = parsedTrades.map(trade => 
            addDbTrade(userEmail, {
              asset: trade.asset,
              type: trade.type,
              quantity: trade.quantity,
              entryPrice: trade.entryPrice,
              exitPrice: trade.exitPrice,
              pnl: trade.pnl,
              strategy: trade.strategy,
              emotion: trade.emotion,
            })
          );
          await Promise.all(promises);
          const dbTrades = await getTrades(userEmail);
          setTrades(dbTrades);
          toast.success(`Imported ${parsedTrades.length} trades from CSV! ✅`);
        } catch (err) {
          console.error("Failed to import CSV trades:", err);
          toast.error("Error saving imported trades to database.");
        } finally {
          setIsLoading(false);
        }
      } else {
        alert("No valid trades found in CSV. Headers should include: Asset/Symbol, Type/Direction, PnL, Quantity, Entry Price, Exit Price");
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (trades.length === 0) {
      toast.error("No trades available to export!");
      return;
    }
    const headers = ["ID", "Asset", "Type", "Gross P&L", "Charges", "Net P&L", "Strategy", "Emotion", "Quantity", "Entry Price", "Exit Price", "Stop Loss", "Target", "R:R", "Date/Time"];
    const csvRows = [headers.join(",")];
    
    trades.forEach((t) => {
      const row = [
        t.id,
        t.asset,
        t.type,
        t.pnl,
        t.charges || 20,
        t.netPnl || t.pnl,
        t.strategy,
        t.emotion.replace(/,/g, " "),
        t.quantity || 1,
        t.entryPrice || 0,
        t.exitPrice || 0,
        t.stopLoss || "",
        t.target || "",
        t.rr || "",
        new Date(t.entryTime || Date.now()).toLocaleString().replace(/,/g, " ")
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trade_journal_${userEmail.split("@")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CORE METRICS MATHEMATICS FORMULAS (NO MOCKS)
  const totalTradesCount = trades.length;
  const winningTradesCount = trades.filter((t) => t.pnl > 0).length;
  const losingTradesCount = trades.filter((t) => t.pnl < 0).length;

  const winRateMetric = totalTradesCount > 0 ? ((winningTradesCount / totalTradesCount) * 100).toFixed(1) : "0.0";
  const netPnlMetric = trades.reduce((sum, t) => sum + (t.netPnl !== undefined ? t.netPnl : t.pnl - 20), 0);

  const grossProfitVal = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const grossLossVal = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const profitFactorMetric = grossLossVal > 0 ? (grossProfitVal / grossLossVal).toFixed(2) : grossProfitVal > 0 ? "9.99" : "0.00";

  // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
  const winRateDec = totalTradesCount > 0 ? winningTradesCount / totalTradesCount : 0;
  const lossRateDec = totalTradesCount > 0 ? losingTradesCount / totalTradesCount : 0;
  const avgWinVal = winningTradesCount > 0 ? grossProfitVal / winningTradesCount : 0;
  const avgLossVal = losingTradesCount > 0 ? grossLossVal / losingTradesCount : 0;
  const expectancyMetric = ((winRateDec * avgWinVal) - (lossRateDec * avgLossVal)).toFixed(1);

  // Discipline Score logic
  const disciplineScoreMetric = totalTradesCount > 0 
    ? Math.round((trades.filter((t) => t.followedPlan !== false).length / totalTradesCount) * 100) 
    : 100;

  // Trade Quality Score logic
  const tradeQualityMetric = totalTradesCount > 0
    ? Math.round(
        (trades.filter((t) => t.followedPlan !== false).length * 0.4 +
         trades.filter((t) => t.pnl > 0).length * 0.4 +
         trades.filter((t) => t.strategy !== "None").length * 0.2) * 100 / totalTradesCount
      )
    : 100;

  // Helper for generating sparklines
  function getSparklinePoints(data: number[], width = 100, height = 30) {
    if (data.length === 0) return `M 0,${height / 2} L ${width},${height / 2}`;
    if (data.length === 1) return `M 0,${height / 2} L ${width},${height / 2}`;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${idx === 0 ? "M" : "L"} ${x},${y}`;
    }).join(" ");
  }

  // Dynamic starting/current capital
  const initialCapitalValue = settings ? settings.initialCapital : 250000;
  const currentEquityValue = initialCapitalValue + netPnlMetric;
  const capitalPercentChange = ((netPnlMetric / initialCapitalValue) * 100).toFixed(1);

  // Equity Curve coordinates data
  const equityCurveData = trades.slice().reverse().reduce((acc: any[], t, index) => {
    const prevEquity = index === 0 ? initialCapitalValue : acc[index - 1].equity;
    const currentTradePnl = t.netPnl !== undefined ? t.netPnl : t.pnl - 20;
    acc.push({
      name: t.time || `Trade ${index + 1}`,
      equity: prevEquity + currentTradePnl,
      pnl: currentTradePnl
    });
    return acc;
  }, []);

  // Mistakes donut chart counts
  const mistakeCounts: Record<string, number> = {};
  mistakes.forEach((m) => {
    mistakeCounts[m.mistakeType] = (mistakeCounts[m.mistakeType] || 0) + 1;
  });

  const donutData = Object.keys(mistakeCounts).map((key, i) => ({
    name: key,
    value: mistakeCounts[key],
    color: ["#7C4DFF", "#2563EB", "#15B77A", "#F59E0B", "#E94B8A"][i % 5]
  }));

  // Top Mistakes & AI feedback
  const sortedMistakes = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]);
  const primaryMistake = sortedMistakes.length > 0 ? sortedMistakes[0][0] : "None";
  
  let mistakeSuggestion = "Splendid job! You are maintaining strict rule compliance in your executions.";
  if (primaryMistake === "Revenge Trading") {
    mistakeSuggestion = "Your revenge trading rate is high. Implement a strict rule to lock your terminal for 1 hour after any loss.";
  } else if (primaryMistake === "FOMO Entry") {
    mistakeSuggestion = "FOMO Entries detected. Remove all market orders. Only enter trades using pre-set limit orders at key historical support/resistance levels.";
  } else if (primaryMistake === "Early Exit") {
    mistakeSuggestion = "Exiting early is restricting your profit factor. Set system targets and trail your stop-loss instead of exiting manually.";
  } else if (primaryMistake === "Overtrading") {
    mistakeSuggestion = "Overtrading flag. Define a maximum of 3 trades per day in Settings and close your broker tab after reaching this limit.";
  }

  // Streaks calculations
  let currentDisciplineStreak = 0;
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].followedPlan !== false) {
      currentDisciplineStreak++;
    } else {
      break;
    }
  }

  // Journal Streak
  let journalStreak = 0;
  const uniqueDates: string[] = [];
  trades.forEach((t) => {
    const dStr = new Date(t.entryTime || Date.now()).toLocaleDateString([], { month: "short", day: "numeric" });
    if (!uniqueDates.includes(dStr)) uniqueDates.push(dStr);
  });

  const checkDate = new Date();
  for (let i = 0; i < 30; i++) {
    const checkStr = checkDate.toLocaleDateString([], { month: "short", day: "numeric" });
    if (uniqueDates.includes(checkStr)) {
      journalStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkYesterdayStr = checkDate.toLocaleDateString([], { month: "short", day: "numeric" });
        if (uniqueDates.includes(checkYesterdayStr)) {
          journalStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  // Dynamic goals calculations
  const getDynamicGoalProgress = (g: any) => {
    let currentValue = 0;
    if (g.category === "Performance" || g.category === "Profit Target") {
      currentValue = netPnlMetric;
    } else if (g.category === "Activity" || g.category === "Trades Count") {
      currentValue = trades.length;
    } else if (g.category === "Risk Management" || g.category === "Habit" || g.category === "Discipline") {
      currentValue = trades.filter(t => t.followedPlan !== false).length;
    } else {
      currentValue = g.currentValue;
    }
    const progress = g.targetValue > 0 ? Math.min(100, Math.max(0, (currentValue / g.targetValue) * 100)) : 0;
    const status = progress >= 100 ? "ACHIEVED" : progress > 50 ? "ON_TRACK" : "NOT_STARTED";
    return { currentValue, progress, status };
  };

  const activeGoals = goals.map(getDynamicGoalProgress).filter((g) => g.progress < 100);
  const completedGoals = goals.map(getDynamicGoalProgress).filter((g) => g.progress >= 100);
  const displayedGoals = goalsSubTab === "active" ? goals.filter(g => getDynamicGoalProgress(g).progress < 100) : goalsSubTab === "completed" ? goals.filter(g => getDynamicGoalProgress(g).progress >= 100) : goals;

  // Active / Completed Goals calculations
  const totalGoalsProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + getDynamicGoalProgress(g).progress, 0) / goals.length) 
    : 0;

  // Journal List
  const journalTrades = trades.filter((t) => {
    const matchesSearch = t.asset.toLowerCase().includes(filterSearch.toLowerCase()) || 
                          t.strategy.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesSetup = filterSetup === "All" || t.strategy === filterSetup;
    const matchesEmotion = filterEmotion === "All" || 
      (filterEmotion === "Discipline" && t.followedPlan !== false) ||
      (filterEmotion === "FOMO Entry" && t.emotion.includes("FOMO")) ||
      (filterEmotion === "Early Exit" && t.emotion.includes("Early")) ||
      (filterEmotion === "Overtrading" && t.emotion.includes("Overtrading")) ||
      (filterEmotion === "Revenge Trade" && t.emotion.includes("Revenge"));
    const matchesType = filterType === "All" || t.type === filterType;
    return matchesSearch && matchesSetup && matchesEmotion && matchesType;
  });

  // Strategy setups metrics
  const strategyStats: Record<string, { count: number; wins: number; pnl: number; grossWins: number; grossLosses: number }> = {};
  trades.forEach((t) => {
    const sName = t.strategy || "Unknown";
    if (!strategyStats[sName]) {
      strategyStats[sName] = { count: 0, wins: 0, pnl: 0, grossWins: 0, grossLosses: 0 };
    }
    strategyStats[sName].count += 1;
    const tradeNetPnl = t.netPnl !== undefined ? t.netPnl : t.pnl - 20;
    strategyStats[sName].pnl += tradeNetPnl;
    if (tradeNetPnl > 0) {
      strategyStats[sName].wins += 1;
      strategyStats[sName].grossWins += tradeNetPnl;
    } else {
      strategyStats[sName].grossLosses += Math.abs(tradeNetPnl);
    }
  });

  let bestStrategy = "None";
  let maxStrategyPnl = -Infinity;
  Object.keys(strategyStats).forEach((strat) => {
    if (strategyStats[strat].pnl > maxStrategyPnl) {
      maxStrategyPnl = strategyStats[strat].pnl;
      bestStrategy = strat;
    }
  });

  // Option Put Call Ratio (PCR) indicator
  const optionTrades = trades.filter(t => t.asset.endsWith("CE") || t.asset.endsWith("PE") || t.asset.toUpperCase().includes("CE") || t.asset.toUpperCase().includes("PE"));
  const ceCount = optionTrades.filter(t => t.asset.toUpperCase().endsWith("CE") || t.asset.toUpperCase().includes("CE")).length;
  const peCount = optionTrades.filter(t => t.asset.toUpperCase().endsWith("PE") || t.asset.toUpperCase().includes("PE")).length;
  const optionPcr = ceCount > 0 ? (peCount / ceCount).toFixed(2) : peCount > 0 ? "9.99" : "0.00";

  

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFF]">
      <div className="p-6">

                <div className="space-y-8 animate-fade-in text-left">
                  {/* Header section with auto-detect trigger button */}
                  <div className="flex justify-between items-center p-6 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight">AI & Rule-Engine Mistake Auto-Detector</h3>
                      <p className="text-[10px] text-[#8C8CA1] font-semibold mt-0.5">Scans trade entry and exit parameters to automatically detect emotional biases</p>
                    </div>
                    <button
                      onClick={handleAutoDetectMistakes}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#7C4DFF] to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#7C4DFF]/15"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Scan & Detect Patterns</span>
                    </button>
                  </div>

                  {/* Mistakes KPIs */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Total Mistakes</span>
                      <p className="text-xl font-black text-slate-800">{mistakes.length}</p>
                    </div>
                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Most Frequent Mistake</span>
                      <p className="text-xl font-black text-[#E94B8A]">{primaryMistake}</p>
                    </div>
                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Mistake Rate</span>
                      <p className="text-xl font-black text-slate-800">
                        {totalTradesCount > 0 ? ((mistakes.length / totalTradesCount) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Mistake Insights Auto-Generator */}
                  <div className="p-6 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Dynamic Mistake Insights</h4>
                        <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Statistical pattern-matching engine insights from your journal</p>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-[#7C4DFF] text-[8px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                        <Activity className="w-3 h-3 animate-pulse" />
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
                            <span>Add at least 10 closed trades to generate mistake insights.</span>
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
                                className="p-4 bg-gradient-to-r from-slate-50 to-white hover:from-white hover:to-indigo-50/10 border border-slate-100 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/10 rounded-[18px] text-[11px] font-bold text-slate-700 leading-relaxed transition-all flex items-start gap-3 group"
                              >
                                <div className="p-1.5 bg-indigo-50 rounded-lg text-[#7C4DFF] group-hover:scale-110 transition-transform shrink-0">
                                  <Lightbulb className="w-3.5 h-3.5" />
                                </div>
                                <span className="pt-0.5">{insight}</span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 text-center text-slate-400 font-semibold py-4">
                              No pattern match found for current history. Keep logging trades to detect trends.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Manual Mistake logger form */}
                    <div className="lg:col-span-4 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Log Manual Mistake</h3>
                        <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Document discipline lapses on specific trade executions</p>
                      </div>

                      <form onSubmit={handleAddMistake} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Select Ticker Trade</label>
                          <select
                            required
                            value={mistakeTradeId}
                            onChange={(e) => setMistakeTradeId(e.target.value)}
                            className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
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
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Mistake Pattern</label>
                          <select
                            value={mistakeType}
                            onChange={(e) => setMistakeType(e.target.value)}
                            className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
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
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Severity</label>
                            <select
                              value={mistakeSeverity}
                              onChange={(e) => setMistakeSeverity(e.target.value as any)}
                              className="w-full px-3 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="LOW">Low Severity</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High Severity</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Est. Loss (₹)</label>
                            <input
                              type="number"
                              placeholder="e.g. 5000"
                              value={mistakeLoss}
                              onChange={(e) => setMistakeLoss(e.target.value)}
                              className="w-full px-3 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">What went wrong?</label>
                          <textarea
                            rows={2}
                            placeholder="Explain the mental trigger..."
                            value={mistakeReason}
                            onChange={(e) => setMistakeReason(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none"
                          ></textarea>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Improvement tip for next time</label>
                          <input
                            type="text"
                            placeholder="e.g. Set system SL and close the chart."
                            value={mistakeTip}
                            onChange={(e) => setMistakeTip(e.target.value)}
                            className="w-full px-3 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full h-10 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Save Mistake Log
                        </button>
                      </form>
                    </div>

                    {/* Mistakes logs feed */}
                    <div className="lg:col-span-8 space-y-4">
                      {mistakes.length > 0 ? (
                        mistakes.map((mst) => {
                          const isHigh = mst.severity === "HIGH";
                          const isMed = mst.severity === "MEDIUM";
                          return (
                            <div
                              key={mst.id}
                              className="bg-white border border-[#E8EAF3] rounded-[20px] p-5 shadow-sm space-y-3"
                            >
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                    isHigh ? "bg-red-50 text-[#E94B8A] border border-red-100" : isMed ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                                  }`}>
                                    {mst.severity} Severity
                                  </span>
                                  <span className="font-heading font-black text-slate-800">{mst.mistakeType}</span>
                                </div>
                                <span className="text-[8px] text-[#8C8CA1] uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                  {mst.detectedAutomatically ? "🤖 Auto-Detected" : "✍️ Manual"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                                {mst.reason}
                              </p>

                              {mst.Trade && (
                                <div className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md inline-block">
                                  Trade: {mst.Trade.symbol} ({mst.Trade.direction === "LONG" ? "BUY" : "SELL"}) | Net P&L: <span className={mst.Trade.netPnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}>₹{mst.Trade.netPnl.toLocaleString()}</span>
                                </div>
                              )}

                              {mst.improvementTip && (
                                <div className="p-3.5 bg-[#FAF9FF] border-l-2 border-[#7C4DFF] rounded-r-xl text-[10px] font-bold text-slate-600 flex gap-2 items-center">
                                  <Lightbulb className="w-4 h-4 text-[#7C4DFF] shrink-0" />
                                  <span><strong className="text-slate-700">Improvement Strategy:</strong> {mst.improvementTip}</span>
                                </div>
                              )}

                              {/* Interactive Actions and confirmation indicators */}
                              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                <div className="flex gap-2">
                                  {mst.userConfirmed ? (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-wider rounded-md">
                                      Confirmed ✓
                                    </span>
                                  ) : (
                                    mst.detectedAutomatically && (
                                      <span className="px-2 py-0.5 bg-slate-50 text-[#8C8CA1] border border-slate-200 text-[8px] font-black uppercase tracking-wider rounded-md">
                                        Pending Confirmation
                                      </span>
                                    )
                                  )}
                                  {mst.reviewed ? (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-black uppercase tracking-wider rounded-md">
                                      Reviewed ✓
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-slate-50 text-[#8C8CA1] border border-slate-200 text-[8px] font-black uppercase tracking-wider rounded-md">
                                      Needs Review
                                    </span>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  {!mst.userConfirmed && mst.detectedAutomatically && (
                                    <button
                                      onClick={() => handleConfirmMistake(mst.id)}
                                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm border-0"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Confirm</span>
                                    </button>
                                  )}
                                  {!mst.reviewed && (
                                    <button
                                      onClick={() => handleToggleReviewed(mst.id)}
                                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#7C4DFF] border border-indigo-100 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <CheckSquare className="w-3 h-3" />
                                      <span>Mark Reviewed</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteMistake(mst.id)}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-[#E94B8A] border border-red-100 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-12 text-center text-slate-400 font-semibold">
                          🎉 Splendid job! No discipline lapses or emotional patterns detected.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              
      </div>
    </div>
  );
}
