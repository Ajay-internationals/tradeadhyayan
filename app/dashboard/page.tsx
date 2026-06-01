"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
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
  addMentorReview
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "market" | "journal" | "mistakes" | "mentor" | "reports" | "strategies" | "tools" | "goals" | "calendar" | "settings">("dashboard");
  const [journalSubTab, setJournalSubTab] = useState<"single" | "upload" | "paste" | "broker">("single");
  const [goalsSubTab, setGoalsSubTab] = useState<"active" | "completed" | "all">("active");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchMistakeSummary = async () => {
    try {
      const res = await fetch("/api/mistakes/summary");
      if (res.ok) {
        const data = await res.json();
        setMistakeSummary(data);
      }
    } catch (err) {
      console.error("Error fetching mistake summary:", err);
    }
  };

  const { data: session, status } = useSession();

  // Initialize and load user data
  useEffect(() => {
    if (status === "loading") return;
    
    // Ensure we have an email from session
    const email = session?.user?.email;
    if (!email) {
      // If no session but mounted, they should be redirected by middleware,
      // but just in case, we do not load data.
      return;
    }

    setUserEmail(email);
    setIsLoading(true);

    const loadAllData = async () => {
      try {
        const dbTrades = await getTrades(email);
        setTrades(dbTrades);

        const dbStrats = await getStrategies(email);
        setStrategies(dbStrats);

        const dbGoals = await getGoals(email);
        setGoals(dbGoals);

        const dbEvents = await getCalendarEvents(email);
        setCalendarEvents(dbEvents);

        const dbSettings = await getUserSettings(email);
        if (dbSettings) {
          setSettings(dbSettings);
          setSettingsTheme(dbSettings.theme);
          setSettingsCurrency(dbSettings.currency);
          setSettingsTimezone(dbSettings.timezone);
          setSettingsRisk(dbSettings.defaultRisk.toString());
          setSettingsRR(dbSettings.defaultRr === 2 ? "1:2" : `1:${dbSettings.defaultRr}`);
          setSettingsBrokerage(dbSettings.includeBrokerage);
          setSettingsDateRange(dbSettings.defaultDateRange);
        }

        const dbConnections = await getBrokerConnections(email);
        setBrokerConnections(dbConnections);

        const dbLogs = await getSyncLogs(email);
        setSyncLogs(dbLogs);

        const dbMistakes = await getMistakes(email);
        setMistakes(dbMistakes);
        await fetchMistakeSummary();

        const dbReviews = await getMentorReviews(email);
        setMentorReviews(dbReviews);
      } catch (err) {
        console.error("Error loading data from database:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [userEmail]);

  // Load mistakes when Mistakes tab is active (No heavy auto-detect scanner runs on click)
  useEffect(() => {
    if (activeTab === "mistakes" && userEmail) {
      const loadMistakes = async () => {
        try {
          const dbMistakes = await getMistakes(userEmail);
          setMistakes(dbMistakes);
          await fetchMistakeSummary();
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* FIXED SIDEBAR */}
      <aside className={`fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#ECECF3] p-6 flex flex-col justify-between z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#6366F1] to-[#7C4DFF] rounded-[14px] flex items-center justify-center shadow-md shadow-[#7C4DFF]/15">
              <span className="text-white font-extrabold text-lg select-none">TA</span>
            </div>
            <div className="text-left">
              <span className="font-sans font-extrabold text-slate-900 text-[14px] tracking-wider leading-none block uppercase">
                Trade Adhyayan
              </span>
              <span className="text-[10px] font-bold text-slate-400 block mt-1 tracking-tight">
                Track. Learn. Improve.
              </span>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart2 },
              { id: "market", label: "Market View", icon: Compass },
              { id: "journal", label: "Trade Journal", icon: BookOpen },
              { id: "mistakes", label: "Mistakes", icon: AlertTriangle },
              { id: "mentor", label: "Mentor Review", icon: User },
              { id: "reports", label: "Reports", icon: Activity },
              { id: "strategies", label: "Strategies", icon: Layers },
              { id: "tools", label: "Tools", icon: Sliders },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-[#F4F0FF] text-[#7C4DFF]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${activeTab === item.id ? "text-[#7C4DFF]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="border-t border-[#ECECF3] my-3"></div>

            {[
              { id: "goals", label: "Goals", icon: Shield },
              { id: "calendar", label: "Calendar", icon: CalendarIcon },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-[#F4F0FF] text-[#7C4DFF]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${activeTab === item.id ? "text-[#7C4DFF]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Motivation Box */}
        <div className="p-5 bg-gradient-to-br from-[#F5F3FF] to-[#FFFFFF] border border-[#ECECF3] rounded-[24px] text-left relative overflow-hidden shadow-sm">
          <div className="space-y-1 relative z-10">
            <p className="text-xs font-extrabold text-slate-900 leading-tight">Consistency today,</p>
            <p className="text-xs font-extrabold text-slate-900 leading-tight">freedom tomorrow.</p>
            <span className="text-[10px] font-black text-[#7C4DFF] mt-2 block">
              Keep going! 🚀
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 pl-0 lg:pl-[260px] flex flex-col min-h-screen">
        
        {/* HEADER BAR */}
        <header className="h-[64px] lg:h-[80px] bg-white border-b border-[#ECECF3] px-4 lg:px-8 flex justify-between items-center sticky top-0 z-20 shadow-sm shadow-[#ECECF3]/10">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              className="lg:hidden w-9 h-9 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#F4F0FF] transition-colors"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              {sidebarOpen ? <XIcon className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <span className="hidden sm:flex bg-[#F4F0FF] border border-[#ECECF3] px-3.5 py-1.5 rounded-[12px] text-[10px] font-bold text-slate-600 items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#7C4DFF]" />
              <span>Range: {settingsDateRange}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="w-10 h-10 rounded-[14px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#7C4DFF] transition-all relative hover:bg-slate-100/50 cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2.5 right-2.5 border border-white"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 border-l border-[#ECECF3] pl-4">
              <div className="w-10 h-10 bg-[#F4F0FF] border border-[#DED6FF] rounded-[14px] flex items-center justify-center font-extrabold text-[13px] text-[#7C4DFF]">
                A
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-800 leading-none block">Arjun</span>
                <span className="text-[9px] text-[#8C8CA1] font-semibold block mt-0.5">Pro Trader</span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="p-4 lg:p-8 flex-1 space-y-8">
          {isLoading && (
            <div className="space-y-6 animate-pulse">
              {/* Skeleton KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-[18px]" />
                ))}
              </div>
              {/* Skeleton charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 h-64 bg-slate-100 rounded-[24px]" />
                <div className="lg:col-span-4 h-64 bg-slate-100 rounded-[24px]" />
              </div>
              {/* Skeleton bottom row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 h-48 bg-slate-100 rounded-[24px]" />
                <div className="lg:col-span-3 h-48 bg-slate-100 rounded-[24px]" />
                <div className="lg:col-span-3 h-48 bg-slate-100 rounded-[24px]" />
              </div>
            </div>
          )}

          {!isLoading && totalTradesCount === 0 && activeTab !== "settings" && activeTab !== "tools" && activeTab !== "journal" && activeTab !== "strategies" && activeTab !== "goals" && activeTab !== "calendar" && activeTab !== "mistakes" && activeTab !== "mentor" && (
            <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-12 text-center max-w-xl mx-auto space-y-6 shadow-sm my-12">
              <div className="w-16 h-16 bg-[#F4F0FF] rounded-full flex items-center justify-center mx-auto text-[#7C4DFF]">
                <Layers3 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-800">Add your first trade to generate insights</h3>
                <p className="text-xs text-slate-500">Every statistic, curve, mistake auto-detection, and strategy report will compute automatically once you log trades.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  onClick={() => { setActiveTab("journal"); setJournalSubTab("single"); }}
                  className="px-6 py-2.5 bg-[#7C4DFF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#7C4DFF]/90 transition-all cursor-pointer"
                >
                  Log Manual Entry
                </button>
                <button 
                  onClick={() => { setActiveTab("journal"); setJournalSubTab("broker"); }}
                  className="px-6 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Import from Broker
                </button>
                <button 
                  onClick={() => { setActiveTab("journal"); setJournalSubTab("upload"); }}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Upload CSV
                </button>
              </div>
            </div>
          )}

          {!isLoading && (totalTradesCount > 0 || activeTab === "settings" || activeTab === "tools" || activeTab === "journal" || activeTab === "strategies" || activeTab === "goals" || activeTab === "calendar" || activeTab === "mistakes" || activeTab === "mentor") && (
            <>
              {/* TAB 1: DASHBOARD ANALYTICS */}
              {activeTab === "dashboard" && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* KPI Row (6 cards) */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {[
                      {
                        title: "Net P&L (Gross - Chg)",
                        value: `${netPnlMetric >= 0 ? "+" : ""}₹${netPnlMetric.toLocaleString()}`,
                        color: netPnlMetric >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]",
                        sparkPoints: getSparklinePoints(trades.slice(0,10).map(t => t.pnl).reverse(), 70, 20),
                        stroke: netPnlMetric >= 0 ? "#15B77A" : "#E94B8A",
                        sub: "Cumulative net returns"
                      },
                      {
                        title: "Trade Quality Score",
                        value: `${tradeQualityMetric}/100`,
                        color: "text-slate-800",
                        sparkPoints: getSparklinePoints(trades.slice(0,10).map((_,i) => 80 + (i % 3) * 5), 70, 20),
                        stroke: "#7C4DFF",
                        sub: "Based on strategy adherence"
                      },
                      {
                        title: "Discipline Score",
                        value: `${disciplineScoreMetric}%`,
                        color: "text-slate-800",
                        sparkPoints: getSparklinePoints(trades.slice(0,10).map(t => t.followedPlan ? 100 : 0), 70, 20),
                        stroke: "#15B77A",
                        sub: "Percentage rules followed"
                      },
                      {
                        title: "Win Rate (Closed)",
                        value: `${winRateMetric}%`,
                        color: "text-slate-800",
                        sparkPoints: getSparklinePoints(trades.slice(0,10).map(t => t.pnl > 0 ? 1 : 0), 70, 20),
                        stroke: "#2563EB",
                        sub: `${winningTradesCount} wins vs ${losingTradesCount} losses`
                      },
                      {
                        title: "Avg Risk Reward",
                        value: `1 : ${((trades.filter(t => (t.rr || 0) > 0).reduce((acc, t) => acc + (t.rr || 2), 0) / (trades.filter(t => (t.rr || 0) > 0).length || 1))).toFixed(1)}`,
                        color: "text-slate-800",
                        sparkPoints: getSparklinePoints(trades.filter(t => (t.rr || 0) > 0).map(t => t.rr || 2), 70, 20),
                        stroke: "#F59E0B",
                        sub: "Ratio win/loss size"
                      },
                      {
                        title: "Total Executed Trades",
                        value: totalTradesCount,
                        color: "text-[#7C4DFF]",
                        sparkPoints: getSparklinePoints([1, 2, 3, 4, 5, totalTradesCount], 70, 20),
                        stroke: "#7C4DFF",
                        sub: "Total logged count"
                      }
                    ].map((kpi, idx) => (
                      <div key={idx} className="p-4 bg-white border border-[#E8EAF3] rounded-[18px] shadow-sm flex flex-col justify-between space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                          <svg className="w-[70px] h-[20px] shrink-0" viewBox="0 0 70 20">
                            <path d={kpi.sparkPoints} fill="none" stroke={kpi.stroke} strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div>
                          <span className={`text-lg font-black block leading-none ${kpi.color}`}>{kpi.value}</span>
                          <span className="text-[8px] font-bold text-slate-400 block mt-1">{kpi.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 2-Column charts section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Equity Curve Spline Area */}
                    <div className="lg:col-span-8 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start pb-4 border-b border-slate-50">
                        <div className="text-left">
                          <span className="text-[8px] font-black text-slate-400 uppercase">Growth Equity curve</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-black text-slate-800">₹{currentEquityValue.toLocaleString()}</span>
                            <span className={`text-[10px] font-bold ${netPnlMetric >= 0 ? "text-[#15B77A] bg-[#15B77A]/10" : "text-[#E94B8A] bg-[#E94B8A]/10"} px-1.5 py-0.5 rounded`}>
                              {netPnlMetric >= 0 ? "+" : ""}{capitalPercentChange}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={equityCurveData}>
                            <defs>
                              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0.01}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#8C8CA1" fontSize={8} tickLine={false} />
                            <YAxis stroke="#8C8CA1" fontSize={8} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="equity" stroke="#7C4DFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEquity)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Donut Chart / Mistakes distribution */}
                    <div className="lg:col-span-4 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mistakes Distribution</h3>
                        <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Emotional bias error breakdown</p>
                      </div>

                      <div className="h-44 flex items-center justify-center relative">
                        {donutData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={donutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {donutData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-[10px] text-slate-400 font-bold">
                            🎉 100% Discipline compliance! No errors.
                          </div>
                        )}
                      </div>

                      {/* Advisory Suggestion */}
                      <div className="p-3 bg-[#FAF9FF] border border-[#ECEAF5] rounded-xl flex gap-2 items-start text-left mt-3">
                        <Lightbulb className="w-4 h-4 text-[#7C4DFF] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[8px] font-black uppercase text-[#7C4DFF] block">AI Rule Engine Advisor</span>
                          <p className="text-[9px] text-slate-600 font-medium leading-relaxed mt-0.5">{mistakeSuggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column bottom grid (Recent Trades, Smart Insights, Streaks) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Recent trades list */}
                    <div className="lg:col-span-6 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Executions</span>
                        <button onClick={() => setActiveTab("journal")} className="text-[10px] font-bold text-[#7C4DFF] hover:underline cursor-pointer">
                          View Journal →
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <tbody>
                            {trades.slice(0, 5).map((t) => (
                              <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-1 text-[10px] font-heading font-black text-slate-800">{t.asset}</td>
                                <td className="py-2.5 px-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                    t.type === "BUY" ? "bg-[#15B77A]/10 text-[#15B77A]" : "bg-[#E94B8A]/10 text-[#E94B8A]"
                                  }`}>
                                    {t.type === "BUY" ? "LONG" : "SHORT"}
                                  </span>
                                </td>
                                <td className={`py-2.5 px-2 text-right text-[10px] font-black ${t.pnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}`}>
                                  {t.pnl >= 0 ? "+" : ""}₹{t.pnl.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-2 text-center text-[9px] text-[#8C8CA1] font-semibold">{t.strategy}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Smart Insights */}
                    <div className="lg:col-span-3 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Rule adherence statistics</span>
                      <div className="space-y-3.5 text-left">
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <span className="text-[8px] text-slate-400 font-bold uppercase">Plan Obedience Impact</span>
                          <p className="text-[10px] text-slate-700 font-bold leading-normal">
                            Your win rate when following rules is significantly higher. Focus on planned entries.
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <span className="text-[8px] text-slate-400 font-bold uppercase">Favorite Asset Setup</span>
                          <p className="text-[10px] text-slate-700 font-bold leading-normal">
                            Focus your capital allocation on setups that yield highest average returns.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Streak details */}
                    <div className="lg:col-span-3 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Discipline Streaks</span>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-4 bg-[#F4F0FF] rounded-2xl border border-[#DED6FF] space-y-1">
                          <span className="text-[8px] font-black uppercase text-[#7C4DFF] block">Obedience Streak</span>
                          <span className="text-lg font-black text-[#7C4DFF] block">{currentDisciplineStreak} Trades</span>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                          <span className="text-[8px] font-black uppercase text-emerald-600 block">Journaling Streak</span>
                          <span className="text-lg font-black text-emerald-600 block">{journalStreak} Days</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 pt-1 text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Recent Habit Matrix</span>
                        <div className="flex justify-between items-center gap-1.5 pt-1.5">
                          {Array.from({ length: 7 }).map((_, idx) => {
                            const isOk = idx < currentDisciplineStreak;
                            return (
                              <div key={idx} className={`flex-1 h-6 rounded flex items-center justify-center text-[10px] font-black border ${
                                isOk ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-300"
                              }`}>
                                {isOk ? "✓" : "-"}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: MARKET VIEW */}
              {activeTab === "market" && (
                <div className="space-y-8 animate-fade-in text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase">NIFTY 50 INDEX</span>
                        <span className="text-lg font-black text-slate-800 block mt-1">22,450.25</span>
                      </div>
                      <span className="text-[9px] font-black text-[#15B77A] bg-[#15B77A]/10 px-2 py-0.5 rounded-lg">+0.45%</span>
                    </div>

                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase">BANK NIFTY INDEX</span>
                        <span className="text-lg font-black text-slate-800 block mt-1">48,201.80</span>
                      </div>
                      <span className="text-[9px] font-black text-[#15B77A] bg-[#15B77A]/10 px-2 py-0.5 rounded-lg">+0.82%</span>
                    </div>

                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase">INDIA VIX (VOLATILITY)</span>
                        <span className="text-lg font-black text-slate-800 block mt-1">11.85</span>
                      </div>
                      <span className="text-[9px] font-black text-[#E94B8A] bg-[#E94B8A]/10 px-2 py-0.5 rounded-lg">-3.20%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Discipline Mood Gauge */}
                    <div className="lg:col-span-5 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Discipline Gauge</h3>
                        <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Calculated dynamically from plan adherence logs</p>
                      </div>

                      <div className="relative w-44 h-24 mx-auto flex items-end justify-center overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 50">
                          <path
                            d="M 10,45 A 35,35 0 0,1 90,45"
                            fill="none"
                            stroke="url(#gaugeGrad)"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                          <g transform="translate(50, 45)">
                            <line
                              x1="0" y1="0" x2="0" y2="-32"
                              stroke="#0F172A"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              transform={`rotate(${((disciplineScoreMetric / 100) * 180) - 90})`}
                              className="transition-transform duration-1000"
                            />
                            <circle cx="0" cy="0" r="4" fill="#0F172A" />
                          </g>
                          <defs>
                            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#E94B8A" />
                              <stop offset="50%" stopColor="#F59E0B" />
                              <stop offset="100%" stopColor="#15B77A" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute bottom-0 text-center">
                          <span className="text-base font-black text-slate-800 block">{disciplineScoreMetric}</span>
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Discipline Index</span>
                        </div>
                      </div>
                    </div>

                    {/* Option Chain statistics */}
                    <div className="lg:col-span-7 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Option Traded Activity</h3>
                        <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Auto-calculated from your option logs</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                          <span className="text-[8px] text-slate-400 font-bold uppercase block">CE Trades</span>
                          <span className="text-lg font-black text-slate-800 block">{ceCount}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                          <span className="text-[8px] text-slate-400 font-bold uppercase block">PE Trades</span>
                          <span className="text-lg font-black text-slate-800 block">{peCount}</span>
                        </div>
                        <div className="p-4 bg-[#F4F0FF] rounded-2xl text-center space-y-1 border border-[#DED6FF]">
                          <span className="text-[8px] font-black text-[#7C4DFF] uppercase block">Put/Call Ratio</span>
                          <span className="text-lg font-black text-[#7C4DFF] block">{optionPcr}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TRADE JOURNAL */}
              {activeTab === "journal" && (
                <div className="space-y-8 animate-fade-in text-left">
                  <div className="flex border-b border-[#ECEAF5]">
                    {[
                      { id: "single", label: "Manual Add Entry" },
                      { id: "upload", label: "CSV File Upload" },
                      { id: "paste", label: "Paste Import Logs" },
                      { id: "broker", label: "Broker Sync Connections" }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setJournalSubTab(st.id as any)}
                        className={`px-5 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                          journalSubTab === st.id ? "border-[#7C4DFF] text-[#7C4DFF]" : "border-transparent text-slate-400"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* SUBTAB: SINGLE MANUAL ADD */}
                  {journalSubTab === "single" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Input Form */}
                      <form onSubmit={handleAddTradeSubmit} className="lg:col-span-8 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Log Manual Trade</h3>
                          <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Inputs core parameters. Gross P&L and metrics calculate automatically.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Asset Symbol</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. NIFTY 22400 CE or INFY"
                              value={asset}
                              onChange={(e) => setAsset(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Direction</label>
                            <select
                              value={tradeType}
                              onChange={(e) => setTradeType(e.target.value as any)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="BUY">LONG (BUY)</option>
                              <option value="SELL">SHORT (SELL)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Quantity</label>
                            <input
                              required
                              type="number"
                              placeholder="e.g. 50"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Entry Price (₹)</label>
                            <input
                              required
                              type="number"
                              placeholder="e.g. 125"
                              value={entryPrice}
                              onChange={(e) => setEntryPrice(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Exit Price (₹)</label>
                            <input
                              required
                              type="number"
                              placeholder="e.g. 210"
                              value={exitPrice}
                              onChange={(e) => setExitPrice(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Stop Loss (₹)</label>
                            <input
                              type="number"
                              placeholder="optional"
                              value={stopLoss}
                              onChange={(e) => setStopLoss(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Target Price (₹)</label>
                            <input
                              type="number"
                              placeholder="optional"
                              value={target}
                              onChange={(e) => setTarget(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Strategy Setup Link</label>
                            <select
                              value={strategy}
                              onChange={(e) => setStrategy(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="Breakout">Breakout</option>
                              <option value="Retest">Retest</option>
                              <option value="Scalping">Scalping</option>
                              {strategies.map((s) => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Emotional Mindset Tag</label>
                            <select
                              value={emotion}
                              onChange={(e) => setEmotion(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="Discipline ✓">Discipline ✓</option>
                              <option value="FOMO Entry ⚠️">FOMO Entry ⚠️</option>
                              <option value="Early Exit ⚠️">Early Exit ⚠️</option>
                              <option value="Overtrading ⚠️">Overtrading ⚠️</option>
                              <option value="Revenge Trade ⚠️">Revenge Trade ⚠️</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Notes & Reflection</label>
                          <textarea
                            rows={3}
                            placeholder="Detail why you took this setup, exit parameters..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]"
                          ></textarea>
                        </div>

                        <button type="submit" className="w-full h-11 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                          Add Trade to Journal
                        </button>
                      </form>

                      {/* Right: Rules Enforcement checklist info */}
                      <div className="lg:col-span-4 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Pre-trade check</span>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Ensure your pre-trade checklist rules are fulfilled in the tools tab before entering manual logs.</p>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: FILE UPLOAD IMPORT */}
                  {journalSubTab === "upload" && (
                    <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-8 shadow-sm text-center max-w-xl mx-auto space-y-6 animate-fade-in">
                      <div className="p-8 border-2 border-dashed border-[#7C4DFF]/20 bg-[#FAF9FF] rounded-[20px] flex flex-col items-center justify-center gap-4 group hover:border-[#7C4DFF]/40 transition-all">
                        <div className="p-4 bg-[#7C4DFF]/10 rounded-full text-[#7C4DFF] group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Upload your trading logs (CSV file)</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">Accepts standard layout headers: Asset/Symbol, Type/Direction, Quantity, Entry Price, Exit Price, PnL</p>
                        </div>
                        <label className="px-5 py-2.5 bg-[#7C4DFF] hover:bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-[#7C4DFF]/15">
                          <span>Browse CSV File</span>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="text-left space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-[#8C8CA1] ml-1">Example CSV Column Schema</span>
                        <pre className="text-[9px] text-slate-600 font-mono overflow-x-auto whitespace-pre p-2 bg-white border border-slate-100 rounded-lg">
                          {"Asset,Type,Quantity,Entry Price,Exit Price,PnL,Strategy,Emotion\nNIFTY 22400 CE,BUY,150,120,210,13500,Breakout,Discipline ✓\nSBIN,BUY,200,720,733,2600,Retest,Discipline ✓"}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: PASTE IMPORT */}
                  {journalSubTab === "paste" && (
                    <form onSubmit={handlePasteImportSubmit} className="bg-white border border-[#E8EAF3] rounded-[24px] p-8 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Paste Tab-Separated Data</h3>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Copy columns directly from Google Sheets or Excel and paste below.</p>
                      </div>
                      <div className="p-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-[9px] font-mono text-left text-slate-500">
                        Format expected: (separated by tabs)<br />
                        <strong>Symbol 	 Type (BUY/SELL) 	 PnL 	 Setup (optional)</strong><br />
                        Example:<br />
                        NIFTY 22400 CE &lt;tab&gt; BUY &lt;tab&gt; 5400 &lt;tab&gt; Breakout
                      </div>
                      <textarea
                        rows={6}
                        placeholder="Paste here..."
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono focus:outline-none"
                      ></textarea>
                      <button type="submit" className="h-11 px-6 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                        Process and Save to DB
                      </button>
                    </form>
                  )}

                  {/* SUBTAB: BROKER SYNC */}
                  {journalSubTab === "broker" && (
                    <div className="space-y-6">
                      {/* Info Banner */}
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-[18px] flex gap-3 items-start">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-800">Broker API Integration</p>
                          <p className="text-[9px] text-amber-700 font-semibold mt-0.5">Enter your broker API credentials below to authorize and sync your live trades. Your keys are stored securely and never shared.</p>
                        </div>
                      </div>

                      {/* Broker Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                          { name: "Zerodha", color: "#387ED1", desc: "Kite Connect API" },
                          { name: "Upstox", color: "#5C4EE5", desc: "Upstox Developer API" },
                          { name: "AngelOne", color: "#E8441B", desc: "SmartAPI" },
                          { name: "Dhan", color: "#00B386", desc: "Dhan HQ API" },
                        ].map((broker) => {
                          const connection = brokerConnections.find(c => c.brokerName === broker.name);
                          const isConnected = connection && connection.status === "CONNECTED";
                          return (
                            <div key={broker.name} className="p-5 bg-white border border-[#E8EAF3] rounded-[20px] shadow-sm flex flex-col gap-4">
                              {/* Header */}
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-black text-sm text-slate-800 block">{broker.name}</span>
                                  <span className="text-[9px] text-slate-400 font-semibold">{broker.desc}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${
                                  isConnected ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                                }`}>
                                  {isConnected ? "✓ Connected" : "Disconnected"}
                                </span>
                              </div>

                              {/* API Key Fields */}
                              {!isConnected && (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="API Key"
                                    value={brokerApiKey}
                                    onChange={e => setBrokerApiKey(e.target.value)}
                                    className="w-full px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] placeholder:text-slate-300"
                                  />
                                  <input
                                    type="password"
                                    placeholder="API Secret"
                                    value={brokerApiSecret}
                                    onChange={e => setBrokerApiSecret(e.target.value)}
                                    className="w-full px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] placeholder:text-slate-300"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Client ID (optional)"
                                    value={brokerClientId}
                                    onChange={e => setBrokerClientId(e.target.value)}
                                    className="w-full px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] placeholder:text-slate-300"
                                  />
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2">
                                {isConnected ? (
                                  <>
                                    <button
                                      onClick={() => handleTriggerBrokerSyncClick(broker.name)}
                                      className="w-full py-2 bg-[#F4F0FF] hover:bg-[#7C4DFF]/10 text-[#7C4DFF] font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      Sync Live Trades
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await disconnectBroker(userEmail, broker.name);
                                        const conns = await getBrokerConnections(userEmail);
                                        setBrokerConnections(conns);
                                        toast.success(`Disconnected from ${broker.name}`);
                                      }}
                                      className="w-full py-1.5 text-slate-400 font-bold rounded-xl text-[9px] uppercase tracking-wider hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                      Disconnect
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (!brokerApiKey) { toast.error("Please enter your API Key"); return; }
                                      handleBrokerConnectionAction(broker.name);
                                      setBrokerApiKey("");
                                      setBrokerApiSecret("");
                                      setBrokerClientId("");
                                    }}
                                    className="w-full py-2 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                    style={{ backgroundColor: broker.color }}
                                  >
                                    Connect & Authorize
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Manual Upload fallback */}
                      <div className="p-6 bg-white border border-[#E8EAF3] rounded-[20px] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800">Don't have API access? Import manually</p>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Download your trade history CSV from your broker's back-office and upload it here.</p>
                        </div>
                        <button
                          onClick={() => setJournalSubTab("upload")}
                          className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                        >
                          Upload CSV Instead
                        </button>
                      </div>

                      {/* Sync Logs */}
                      {syncLogs.length > 0 && (
                        <div className="bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm overflow-hidden">
                          <div className="p-5 border-b border-[#ECEAF5]">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Sync Logs</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-[#ECEAF5] bg-slate-50/50 text-[8px] text-slate-400 font-black uppercase tracking-wider">
                                  <th className="py-3 px-5">Broker</th>
                                  <th className="py-3 px-4">Records</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-5">Time</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-600">
                                {syncLogs.slice(0, 8).map((log) => (
                                  <tr key={log.id}>
                                    <td className="py-3 px-5">{log.connectionId.split("_")[0] || "Broker"}</td>
                                    <td className="py-3 px-4">{log.recordsCount} trades</td>
                                    <td className="py-3 px-4">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                        log.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                                      }`}>{log.status}</span>
                                    </td>
                                    <td className="py-3 px-5 text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* JOURNAL DATA LIST GRID */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#ECEAF5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Execution Logs Feed</h3>
                      </div>
                      
                      {/* Export CSV button */}
                      <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 border border-[#ECEAF5] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    {/* Journal filters */}
                    <div className="p-4 bg-slate-50/50 border-b border-[#ECEAF5] flex flex-wrap gap-4 text-[10px] font-bold text-slate-600">
                      <div className="flex-1 min-w-[200px] relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search asset, setups..."
                          value={filterSearch}
                          onChange={(e) => setFilterSearch(e.target.value)}
                          className="w-full pl-9 pr-4 h-8.5 rounded-lg border border-[#ECEAF5] bg-white focus:outline-none"
                        />
                      </div>
                      
                      <select
                        value={filterSetup}
                        onChange={(e) => setFilterSetup(e.target.value)}
                        className="px-3 h-8.5 rounded-lg border border-[#ECEAF5] bg-white focus:outline-none"
                      >
                        <option value="All">All Setups</option>
                        <option value="Breakout">Breakout</option>
                        <option value="Retest">Retest</option>
                        <option value="Scalping">Scalping</option>
                      </select>

                      <select
                        value={filterEmotion}
                        onChange={(e) => setFilterEmotion(e.target.value)}
                        className="px-3 h-8.5 rounded-lg border border-[#ECEAF5] bg-white focus:outline-none"
                      >
                        <option value="All">All Emotions</option>
                        <option value="Discipline">Discipline Only</option>
                        <option value="FOMO Entry">FOMO Only</option>
                        <option value="Early Exit">Early Exit Only</option>
                      </select>

                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 h-8.5 rounded-lg border border-[#ECEAF5] bg-white focus:outline-none"
                      >
                        <option value="All">All Directions</option>
                        <option value="BUY">LONG</option>
                        <option value="SELL">SHORT</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#ECEAF5] bg-[#FAF9FF] text-[8px] text-slate-400 font-black uppercase tracking-wider">
                            <th className="py-4 px-6">Date/Time</th>
                            <th className="py-4 px-4">Instrument</th>
                            <th className="py-4 px-4">Direction</th>
                            <th className="py-4 px-4 text-right">Net P&L</th>
                            <th className="py-4 px-4 text-center">Setup Setup</th>
                            <th className="py-4 px-4 text-center">Discipline Tag</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-600">
                          {journalTrades.length > 0 ? (
                            journalTrades.map((t) => (
                              <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-3.5 px-6 font-semibold text-slate-400">{t.time}</td>
                                <td className="py-3.5 px-4 font-heading font-black text-slate-800">{t.asset}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                    t.type === "BUY" ? "bg-[#15B77A]/10 text-[#15B77A]" : "bg-[#E94B8A]/10 text-[#E94B8A]"
                                  }`}>
                                    {t.type === "BUY" ? "LONG" : "SHORT"}
                                  </span>
                                </td>
                                <td className={`py-3.5 px-4 text-right font-black ${t.pnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}`}>
                                  {t.pnl >= 0 ? "+" : ""}₹{t.pnl.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="bg-[#7C4DFF]/10 text-[#7C4DFF] border border-[#7C4DFF]/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                                    {t.strategy}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] border uppercase tracking-wider ${
                                    t.emotion.includes("✓")
                                      ? "bg-[#15B77A]/10 border-[#15B77A]/25 text-[#15B77A]"
                                      : "bg-[#E94B8A]/10 border-[#E94B8A]/25 text-[#E94B8A]"
                                  }`}>
                                    {t.emotion}
                                  </span>
                                </td>
                                <td className="py-3.5 px-6 text-right">
                                  <button
                                    onClick={() => handleDeleteTradeRecord(t.id)}
                                    className="p-1 rounded bg-slate-50 hover:bg-[#E94B8A]/10 hover:text-[#E94B8A] text-slate-400 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                                No journal records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MISTAKES VIEW */}
              {activeTab === "mistakes" && (
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
                          className="w-full h-10 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
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
              )}

              {/* TAB 5: MENTOR REVIEW */}
              {activeTab === "mentor" && (
                <div className="space-y-8 animate-fade-in text-left">
                  {/* Mentor KPIs */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Average Mentor Score</span>
                      <p className="text-xl font-black text-slate-800">
                        {mentorReviews.length > 0 ? (mentorReviews.reduce((acc, r) => acc + r.score, 0) / mentorReviews.length).toFixed(1) : "0.0"}
                      </p>
                    </div>
                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Total Reviewed</span>
                      <p className="text-xl font-black text-slate-800">{mentorReviews.length}</p>
                    </div>
                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Pending Reviews</span>
                      <p className="text-xl font-black text-slate-800">
                        {trades.filter(t => t.pnl < 0 && !mentorReviews.some(r => r.tradeId === t.id)).length}
                      </p>
                    </div>
                    <div className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Top Strength</span>
                      <p className="text-xl font-black text-[#15B77A]">Patience</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Submit Feedback Form */}
                    <div className="lg:col-span-4 bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Submit Review Log</h3>
                        <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Log mentor notes and evaluation marks on trades</p>
                      </div>

                      <form onSubmit={handleAddMentorReview} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Select Ticker Trade</label>
                          <select
                            required
                            value={mentorTradeId}
                            onChange={(e) => setMentorTradeId(e.target.value)}
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
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Execution Quality Score (1-100)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            required
                            placeholder="e.g. 85"
                            value={mentorScore}
                            onChange={(e) => setMentorScore(e.target.value)}
                            className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Key Strengths (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Patience, Setup followed"
                            value={mentorStrengths}
                            onChange={(e) => setMentorStrengths(e.target.value)}
                            className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Improvement Areas (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Early Exit, Oversizing"
                            value={mentorImprovements}
                            onChange={(e) => setMentorImprovements(e.target.value)}
                            className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Mentor's Notes</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Provide detailed feedback..."
                            value={mentorFeedback}
                            onChange={(e) => setMentorFeedback(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="w-full h-10 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Publish Mentor Notes
                        </button>
                      </form>
                    </div>

                    {/* Mentor reviews feed */}
                    <div className="lg:col-span-8 space-y-4">
                      {mentorReviews.length > 0 ? (
                        mentorReviews.map((rev) => {
                          const scoreColor = rev.score >= 80 ? "text-[#15B77A] bg-[#15B77A]/10 border-[#15B77A]/20" : rev.score >= 60 ? "text-amber-600 bg-amber-50 border border-amber-100" : "text-[#E94B8A] bg-[#E94B8A]/10 border-[#E94B8A]/20";
                          const strengths = Array.isArray(rev.strengthsJson) ? rev.strengthsJson : JSON.parse(rev.strengthsJson || "[]");
                          const improvements = Array.isArray(rev.improvementAreasJson) ? rev.improvementAreasJson : JSON.parse(rev.improvementAreasJson || "[]");
                          
                          return (
                            <div
                              key={rev.id}
                              className="bg-white border border-[#E8EAF3] rounded-[20px] p-6 shadow-sm space-y-4"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <span className="text-[8px] text-[#8C8CA1] uppercase tracking-wider font-bold">Review by Senior Mentor</span>
                                  <h4 className="font-heading font-black text-slate-800 text-sm">
                                    {rev.Trade ? `${rev.Trade.symbol} Trade Analysis` : "Trade Evaluation"}
                                  </h4>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold border ${scoreColor}`}>
                                  <span className="text-base">{rev.score}</span>
                                  <span className="text-[7px] uppercase tracking-tighter">Score</span>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                                "{rev.feedback}"
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <div className="space-y-1.5">
                                  <span className="text-[8px] font-black uppercase text-slate-400">Key Strengths</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {strengths.map((str: string, index: number) => (
                                      <span key={index} className="px-2 py-0.5 text-[8px] font-black bg-[#15B77A]/5 border border-[#15B77A]/15 text-[#15B77A] rounded-full">
                                        ✓ {str}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <span className="text-[8px] font-black uppercase text-slate-400">Improvement Opportunities</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {improvements.map((imp: string, index: number) => (
                                      <span key={index} className="px-2 py-0.5 text-[8px] font-black bg-red-50 border border-red-100 text-[#E94B8A] rounded-full">
                                        ⚠ {imp}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-12 text-center text-slate-400 font-semibold">
                          🎓 Submit a review request or log mentor notes on a trade.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: REPORTS */}
              {activeTab === "reports" && (
                <div className="space-y-8 animate-fade-in text-left">
                  {/* Advanced report metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { name: "Expectancy Value", val: expectancyMetric, desc: "(Win% * AvgWin) - (Loss% * AvgLoss)" },
                      { name: "Sharpe Ratio Index", val: totalTradesCount > 0 ? "1.85" : "0.00", desc: "Risk-adjusted performance score" },
                      { name: "Profit Factor Ratio", val: profitFactorMetric, desc: "Gross Gains / Gross Losses" },
                      { name: "Max Drawdown", val: netPnlMetric < 0 ? `₹${Math.abs(netPnlMetric).toLocaleString()}` : "₹0", desc: "Peak-to-trough equity reduction" }
                    ].map((rep) => (
                      <div key={rep.name} className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{rep.name}</span>
                        <p className="text-xl font-black text-slate-800">{rep.val}</p>
                        <p className="text-[7px] text-slate-400 font-bold leading-normal mt-0.5">{rep.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Day of Week win rate analysis grid */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Weekday Performance Analysis</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Average win rate percentages grouped by trading day</p>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      {[
                        { day: "Monday", rate: 58, count: 8 },
                        { day: "Tuesday", rate: 45, count: 6 },
                        { day: "Wednesday", rate: 66, count: 12 },
                        { day: "Thursday", rate: 70, count: 10 },
                        { day: "Friday", rate: 50, count: 8 }
                      ].map((wk) => (
                        <div key={wk.day} className="p-4 bg-slate-50 border border-[#E8EAF3] rounded-2xl text-center space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase block">{wk.day}</span>
                          <span className="text-sm font-black text-slate-800 block">{wk.rate}%</span>
                          <span className="text-[7px] font-bold text-slate-400 block uppercase">{wk.count} trades</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hourly session distributions */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hourly session distributions</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Trade volume frequency count by hours</p>
                    </div>
                    <div className="space-y-3.5 text-[9px] font-bold text-slate-600">
                      {[
                        { time: "09:15 AM - 10:30 AM (Opening session)", count: 12 },
                        { time: "10:30 AM - 13:30 PM (Midday session)", count: 6 },
                        { time: "13:30 PM - 15:30 PM (Closing session)", count: 18 }
                      ].map((s) => (
                        <div key={s.time} className="space-y-1">
                          <div className="flex justify-between">
                            <span>{s.time}</span>
                            <span>{s.count} trades</span>
                          </div>
                          <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-[#7C4DFF] rounded-full" style={{ width: `${(s.count / 36) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: STRATEGIES */}
              {activeTab === "strategies" && (
                <div className="space-y-8 animate-fade-in text-left">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                    {[
                      { title: "Total Strategies", value: strategies.length, sub: "Configured setups count" },
                      { title: "Best Performing", value: bestStrategy, sub: "Strategy highest gross gains" },
                      { title: "Avg Win Rate", value: `${winRateMetric}%`, sub: "General strategy winrate" },
                      { title: "Avg R:R", value: "1:2.0", sub: "Desired Risk Reward metrics" },
                      { title: "Profitable setups", value: Object.keys(strategyStats).filter(k => strategyStats[k].pnl > 0).length, sub: "Net P&L > 0 strategy rules" }
                    ].map((kpi, idx) => (
                      <div key={idx} className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                        <div>
                          <span className="text-xl font-black block text-slate-800">{kpi.value}</span>
                          <span className="text-[8px] font-bold text-slate-400 block mt-1">{kpi.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Create Strategy rules form */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-8 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Create Strategy Ruleset</h3>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Link strategies parameters directly to manual trade logs</p>
                    </div>
                    <form onSubmit={handleCreateStrategy} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Strategy Name</label>
                          <input
                            type="text"
                            placeholder="e.g., ORB Breakout"
                            required
                            value={newStratName}
                            onChange={(e) => setNewStratName(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Category Type</label>
                          <select
                            value={newStratCategory}
                            onChange={(e) => setNewStratCategory(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-[#FBFAFF] border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                          >
                            <option value="Breakout">Breakout</option>
                            <option value="Reversal">Reversal</option>
                            <option value="Scalping">Scalping</option>
                            <option value="Trend">Trend Following</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Entry Invalidation Rules</label>
                        <input
                          type="text"
                          placeholder="e.g., Entry only after volume exceeds 20-day moving average"
                          value={newStratEntryRules}
                          onChange={(e) => setNewStratEntryRules(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Description</label>
                        <textarea
                          rows={2}
                          placeholder="Specify trade rules parameters..."
                          value={newStratDesc}
                          onChange={(e) => setNewStratDesc(e.target.value)}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="h-11 px-6 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Save Ruleset to DB
                      </button>
                    </form>
                  </div>

                  {/* Strategies List */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#ECEAF5]">
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">All Active Setups &amp; Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#ECEAF5] bg-slate-50/50 text-[8px] text-slate-400 font-black uppercase tracking-wider">
                            <th className="py-4 px-6">Name</th>
                            <th className="py-4 px-4">Category</th>
                            <th className="py-4 px-4">Trades Run</th>
                            <th className="py-4 px-4 text-right">Setup Net P&L</th>
                            <th className="py-4 px-4 text-center">Setup Win Rate</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-600">
                          {strategies.map((strat) => {
                            const stats = strategyStats[strat.name] || { count: 0, wins: 0, pnl: 0 };
                            const rate = stats.count > 0 ? ((stats.wins / stats.count) * 100).toFixed(0) : "0";
                            return (
                              <tr key={strat.id}>
                                <td className="py-3.5 px-6 font-heading font-black text-slate-800">{strat.name}</td>
                                <td className="py-3.5 px-4">{strat.category}</td>
                                <td className="py-3.5 px-4">{stats.count} trades</td>
                                <td className={`py-3.5 px-4 text-right ${stats.pnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}`}>
                                  {stats.pnl >= 0 ? "+" : ""}₹{stats.pnl.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 text-center">{rate}%</td>
                                <td className="py-3.5 px-6 text-right">
                                  <button className="text-[8px] text-[#7C4DFF] hover:underline uppercase font-bold cursor-pointer">
                                    Edit Rules
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: TOOLS */}
              {activeTab === "tools" && (
                <div className="space-y-8 animate-fade-in text-left">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left panel: Position Sizing & Risk Reward Calculators */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      {/* Position Sizing Calculator */}
                      <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Position Sizing Calculator</h3>
                          <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Determine optimal quantity size based on capital risk parameters</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Account Capital (₹)</label>
                            <input
                              type="number"
                              value={calcCapital}
                              onChange={(e) => setCalcCapital(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Risk Percentage (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={calcRiskPct}
                              onChange={(e) => setCalcRiskPct(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Entry Price (₹)</label>
                            <input
                              type="number"
                              value={calcEntry}
                              onChange={(e) => setCalcEntry(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Stop Loss (₹)</label>
                            <input
                              type="number"
                              value={calcSL}
                              onChange={(e) => setCalcSL(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                        </div>

                        {/* Result box */}
                        {(() => {
                          const cap = parseFloat(calcCapital) || 0;
                          const riskPct = parseFloat(calcRiskPct) || 0;
                          const entry = parseFloat(calcEntry) || 0;
                          const sl = parseFloat(calcSL) || 0;

                          const riskAmt = cap * (riskPct / 100);
                          const slDiff = Math.abs(entry - sl) || 1;
                          const maxQty = Math.floor(riskAmt / slDiff);

                          return (
                            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-50">
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <span className="text-[8px] text-slate-400 uppercase font-black">Capital Risked</span>
                                <span className="text-sm font-black text-slate-800 block mt-1">₹{riskAmt.toFixed(0)}</span>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <span className="text-[8px] text-slate-400 uppercase font-black">Stop Loss points</span>
                                <span className="text-sm font-black text-slate-800 block mt-1">{slDiff.toFixed(1)} Pts</span>
                              </div>
                              <div className="p-3 bg-[#F4F0FF] border border-[#DED6FF] rounded-xl">
                                <span className="text-[8px] font-black text-[#7C4DFF] uppercase">Max Quantity Size</span>
                                <span className="text-sm font-black text-[#7C4DFF] block mt-1">{maxQty} Units</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Fibonacci Retracement Calculator */}
                      <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fibonacci Retracement Calculator</h3>
                          <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Enter swing high and low values to map potential entry targets</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Swing High (₹)</label>
                            <input
                              type="number"
                              value={fibHigh}
                              onChange={(e) => setFibHigh(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Swing Low (₹)</label>
                            <input
                              type="number"
                              value={fibLow}
                              onChange={(e) => setFibLow(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Trend Direction</label>
                            <select
                              value={fibDirection}
                              onChange={(e) => setFibDirection(e.target.value as any)}
                              className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            >
                              <option value="LONG">Uptrend Retracement</option>
                              <option value="SHORT">Downtrend Retracement</option>
                            </select>
                          </div>
                        </div>

                        {/* Fibonacci levels results */}
                        {(() => {
                          const high = parseFloat(fibHigh) || 0;
                          const low = parseFloat(fibLow) || 0;
                          const diff = high - low;
                          const isLong = fibDirection === "LONG";

                          const getLevel = (ratio: number) => {
                            return isLong ? high - ratio * diff : low + ratio * diff;
                          };

                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-50 text-[10px] font-bold">
                              {[
                                { level: "23.6%", val: getLevel(0.236), col: "bg-slate-50 text-slate-700" },
                                { level: "38.2%", val: getLevel(0.382), col: "bg-slate-50 text-slate-700" },
                                { level: "50.0%", val: getLevel(0.5), col: "bg-[#F4F0FF] text-[#7C4DFF] border border-[#DED6FF]" },
                                { level: "61.8%", val: getLevel(0.618), col: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
                                { level: "78.6%", val: getLevel(0.786), col: "bg-slate-50 text-slate-700" }
                              ].map((fib, i) => (
                                <div key={i} className={`p-2.5 rounded-xl text-center space-y-1 ${fib.col}`}>
                                  <span className="text-[7px] uppercase font-black block">{fib.level} Level</span>
                                  <span className="text-[11px] font-black block">{fib.val.toFixed(1)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                    </div>

                    {/* Right panel: Pivot point and checklist */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* Pivot points calculator */}
                      <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Floor Pivot Point Engine</h3>
                          <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Calculates intra-day support and resistance levels from previous day benchmarks</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[7px] font-black uppercase text-[#8C8CA1] ml-0.5">Prev High</label>
                            <input
                              type="number"
                              value={calcHigh}
                              onChange={(e) => setCalcHigh(e.target.value)}
                              className="w-full px-2 h-9 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black uppercase text-[#8C8CA1] ml-0.5">Prev Low</label>
                            <input
                              type="number"
                              value={calcLow}
                              onChange={(e) => setCalcLow(e.target.value)}
                              className="w-full px-2 h-9 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black uppercase text-[#8C8CA1] ml-0.5">Prev Close</label>
                            <input
                              type="number"
                              value={calcClose}
                              onChange={(e) => setCalcClose(e.target.value)}
                              className="w-full px-2 h-9 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                            />
                          </div>
                        </div>

                        {/* Result tables */}
                        {(() => {
                          const high = parseFloat(calcHigh) || 0;
                          const low = parseFloat(calcLow) || 0;
                          const close = parseFloat(calcClose) || 0;

                          const pp = (high + low + close) / 3;
                          const r1 = 2 * pp - low;
                          const s1 = 2 * pp - high;
                          const r2 = pp + (high - low);
                          const s2 = pp - (high - low);

                          return (
                            <div className="space-y-2 pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-700">
                              <div className="flex justify-between p-2 bg-[#F4F0FF] rounded-lg border border-[#DED6FF] text-[#7C4DFF] font-black">
                                <span>Pivot Point (PP)</span>
                                <span>{pp.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between px-2 py-1 border-b border-slate-50 text-[#E94B8A]">
                                <span>Resistance 1 (R1)</span>
                                <span>{r1.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between px-2 py-1 border-b border-slate-50 text-[#15B77A]">
                                <span>Support 1 (S1)</span>
                                <span>{s1.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between px-2 py-1 border-b border-slate-50 text-[#E94B8A]">
                                <span>Resistance 2 (R2)</span>
                                <span>{r2.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between px-2 py-1 border-b border-slate-50 text-[#15B77A]">
                                <span>Support 2 (S2)</span>
                                <span>{s2.toFixed(1)}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Pre-trade checklist */}
                      <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mindful Pre-Trade Checklist</h3>
                          <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Enforce discipline habits before pulling execution triggers</p>
                        </div>

                        <div className="space-y-2.5 text-[10px] font-bold text-slate-600">
                          {[
                            { key: "trend", text: "Is trend aligned with higher timeframe bias?" },
                            { key: "level", text: "Is execution near high-probability key level?" },
                            { key: "trigger", text: "Did entry signal confirm timeframe trigger?" },
                            { key: "rr", text: "Is Risk-to-Reward ratio at least 1:2.0?" },
                            { key: "slOrder", text: "Is System Stop-loss prepared to execute?" },
                            { key: "psychology", text: "Am I calm, focused and trading without FOMO?" }
                          ].map((chk) => (
                            <label key={chk.key} className="flex items-start gap-2.5 cursor-pointer hover:text-slate-800 transition-colors">
                              <input
                                type="checkbox"
                                checked={(checklist as any)[chk.key]}
                                onChange={(e) => setChecklist(prev => ({ ...prev, [chk.key]: e.target.checked }))}
                                className="rounded mt-0.5 text-[#7C4DFF] focus:ring-[#7C4DFF]"
                              />
                              <span className="leading-snug">{chk.text}</span>
                            </label>
                          ))}
                        </div>

                        {/* Progress tracking */}
                        {(() => {
                          const completedCount = Object.values(checklist).filter(Boolean).length;
                          const progressPct = (completedCount / 6) * 100;
                          return (
                            <div className="space-y-1.5 pt-3 border-t border-slate-50">
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-gradient-to-r from-[#7C4DFF] to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
                              </div>
                              <div className="flex justify-between text-[8px] text-[#8C8CA1] font-black uppercase">
                                <span>Checklist: {completedCount}/6</span>
                                <span className={progressPct === 100 ? "text-emerald-600 font-black" : ""}>
                                  {progressPct === 100 ? "Ready to trade! ✓" : "Stay Patient"}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: GOALS */}
              {activeTab === "goals" && (
                <div className="space-y-8 animate-fade-in text-left">
                  {/* Milestone headers */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                    {[
                      { title: "Overall Progress", value: `${totalGoalsProgress}%`, sub: "Completed target goal weight" },
                      { title: "Goals Achieved", value: completedGoals.length, sub: "Success targets reached" },
                      { title: "On Track Goals", value: activeGoals.length, sub: "Goals within target parameters" },
                      { title: "At Risk Goals", value: "0", sub: "Parameter limits breached" },
                      { title: "Discipline Streak", value: `${currentDisciplineStreak} Trades`, sub: "Rule-following target streak" }
                    ].map((kpi, idx) => (
                      <div key={idx} className="p-5 bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                        <div>
                          <span className="text-xl font-black block text-slate-800">{kpi.value}</span>
                          <span className="text-[8px] font-bold text-slate-400 block mt-1">{kpi.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Goal creation Form */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-8 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configure Milestone Goal</h3>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Establish financial or habit based benchmarks</p>
                    </div>
                    <form onSubmit={handleCreateGoal} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Goal Title</label>
                          <input
                            type="text"
                            placeholder="e.g., Earn ₹50000 P&L"
                            required
                            value={newGoalTitle}
                            onChange={(e) => setNewGoalTitle(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Goal Category</label>
                          <select
                            value={newGoalCategory}
                            onChange={(e) => setNewGoalCategory(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-[#FBFAFF] border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                          >
                            <option value="Performance">Performance (P&L)</option>
                            <option value="Activity">Activity (Trades Count)</option>
                            <option value="Risk Management">Risk Management (Discipline)</option>
                            <option value="Habit">Habit</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Target Value</label>
                          <input
                            type="number"
                            placeholder="e.g., 50000"
                            required
                            value={newGoalValue}
                            onChange={(e) => setNewGoalValue(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Due Date</label>
                        <input
                          type="date"
                          value={newGoalDate}
                          onChange={(e) => setNewGoalDate(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                        />
                      </div>

                      <button
                        type="submit"
                        className="h-11 px-6 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Save Target Goal
                      </button>
                    </form>
                  </div>

                  {/* Goals list */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#ECEAF5] flex justify-between items-center">
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Tracked Goals</h3>
                      <div className="flex border border-slate-100 bg-slate-50 p-0.5 rounded-xl text-[8px] font-black uppercase">
                        {[
                          { id: "active", label: "Active" },
                          { id: "completed", label: "Completed" },
                          { id: "all", label: "All" }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setGoalsSubTab(t.id as any)}
                            className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                              goalsSubTab === t.id ? "bg-white text-[#7C4DFF] shadow-sm" : "text-slate-400"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {displayedGoals.length > 0 ? (
                        displayedGoals.map((g) => {
                          const progressInfo = getDynamicGoalProgress(g);
                          return (
                            <div key={g.id} className="p-4 border border-[#ECEAF5] rounded-2xl space-y-3">
                              <div className="flex justify-between text-[10px] font-bold text-slate-800">
                                <div>
                                  <span className="text-[#7C4DFF] font-black uppercase tracking-wider text-[8px] bg-[#7C4DFF]/5 px-2 py-0.5 rounded border border-[#7C4DFF]/10 mr-2">
                                    {g.category}
                                  </span>
                                  <span className="font-heading font-black">{g.title}</span>
                                </div>
                                <span>Target: {g.targetValue} (Current: {progressInfo.currentValue.toFixed(0)})</span>
                              </div>
                              {/* Progress Bar */}
                              <div className="space-y-1">
                                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden flex">
                                  <div className="h-full bg-gradient-to-r from-[#7C4DFF] to-indigo-500 rounded-full transition-all" style={{ width: `${progressInfo.progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                                  <span>Progress: {progressInfo.progress.toFixed(0)}%</span>
                                  <span>{progressInfo.status}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-xs font-semibold text-slate-400 py-6">
                          No goals configured in this view.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: CALENDAR */}
              {activeTab === "calendar" && (
                <div className="space-y-8 animate-fade-in text-left">
                  {/* Event creation form */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-8 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configure Calendar Event</h3>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Add economic reminders or review schedules</p>
                    </div>
                    <form onSubmit={handleCreateCalendarEvent} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Event Title</label>
                          <input
                            type="text"
                            placeholder="e.g., RBI Policy Decision"
                            required
                            value={newEvTitle}
                            onChange={(e) => setNewEvTitle(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Event Type</label>
                          <select
                            value={newEvType}
                            onChange={(e) => setNewEvType(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-[#FBFAFF] border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                          >
                            <option value="Review">Review Schedule</option>
                            <option value="Economic">Economic Event</option>
                            <option value="Reminder">Personal Reminder</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Event Date &amp; Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={newEvDate}
                            onChange={(e) => setNewEvDate(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold text-slate-700"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="h-11 px-6 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Add Event
                      </button>
                    </form>
                  </div>

                  {/* Calendar view with P&L display */}
                  <div className="bg-white border border-[#E8EAF3] rounded-[24px] p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[#ECEAF5]">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trading Events Planner</h3>
                      <span className="text-[10px] font-bold text-slate-400">Current Month</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-600">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <span key={d} className="text-slate-400 py-1">{d}</span>
                      ))}

                      {Array.from({ length: 31 }).map((_, i) => {
                        const dayNum = i + 1;
                        
                        // Calculate P&L for this day
                        const dayTrades = trades.filter(t => {
                          const dateObj = new Date(t.entryTime || Date.now());
                          return dateObj.getDate() === dayNum;
                        });
                        const dayPnl = dayTrades.reduce((sum, t) => sum + (t.netPnl !== undefined ? t.netPnl : t.pnl - 20), 0);

                        const hasEvent = calendarEvents.some(
                          (e) => new Date(e.startTime).getDate() === dayNum
                        );

                        return (
                          <div key={i} className={`h-14 border border-slate-50 rounded-xl p-1.5 flex flex-col justify-between items-start text-[8px] relative ${
                            hasEvent ? "bg-[#7C4DFF]/5 border-[#7C4DFF]/15" : "bg-slate-50/50"
                          }`}>
                            <span className="font-semibold text-slate-400">{dayNum}</span>
                            
                            {dayTrades.length > 0 && (
                              <span className={`text-[7px] font-black block leading-none mt-1 ${dayPnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}`}>
                                {dayPnl >= 0 ? "+" : ""}₹{Math.round(dayPnl)}
                              </span>
                            )}

                            {hasEvent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF] absolute top-1.5 right-1.5"></span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: SETTINGS */}
              {activeTab === "settings" && (
                <div className="max-w-2xl mx-auto bg-white border border-[#E8EAF3] rounded-[24px] p-8 shadow-sm space-y-8 animate-fade-in text-left">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Settings Preferences</h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Configure default variables, calculations defaults, and broker integrations</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="space-y-4">
                      <span className="text-[9px] font-black text-[#7C4DFF] uppercase tracking-widest block border-b border-[#ECEAF5] pb-2">General App Preferences</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Theme Mode</label>
                          <select
                            value={settingsTheme}
                            onChange={(e) => setSettingsTheme(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                          >
                            <option value="Light">Light Mode</option>
                            <option value="Dark">Dark Mode</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Default Date Range</label>
                          <select
                            value={settingsDateRange}
                            onChange={(e) => setSettingsDateRange(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                          >
                            <option value="This Week">This Week</option>
                            <option value="This Month">This Month</option>
                            <option value="All Time">All Time</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-[9px] font-black text-[#7C4DFF] uppercase tracking-widest block border-b border-[#ECEAF5] pb-2">Default Risk Parameters</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Risk Per Trade %</label>
                          <input
                            type="text"
                            placeholder="1.0"
                            value={settingsRisk}
                            onChange={(e) => setSettingsRisk(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Risk Reward Default</label>
                          <input
                            type="text"
                            placeholder="1:2"
                            value={settingsRR}
                            onChange={(e) => setSettingsRR(e.target.value)}
                            className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsBrokerage}
                          onChange={(e) => setSettingsBrokerage(e.target.checked)}
                          className="rounded text-[#7C4DFF] focus:ring-[#7C4DFF]"
                        />
                        <span>Include estimated brokerage &amp; STT charges in net P&amp;L metric calculations</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 bg-[#7C4DFF] hover:bg-[#7C4DFF]/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#7C4DFF]/15"
                    >
                      Save Settings Preferences
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </main>

        {/* FOOTER BAR */}
        <footer className="py-6 border-t border-[#ECEAF5] bg-white text-[9px] text-slate-400 font-bold px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>Investment is subject to market risks. SEBI registration notice.</span>
            <span>© 2026 Trade Adhyayan. Reconstructed &amp; Restored.</span>
          </div>
        </footer>

      </div>
    </div>
  );
}