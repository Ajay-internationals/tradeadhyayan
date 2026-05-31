"use client";

import { useState, useEffect } from "react";
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
  Calendar,
  Eye,
  CheckSquare,
  Brain,
  Clock,
  Flame,
  LayoutGrid
} from "lucide-react";

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
  { id: "d1", time: "14:20 PM", asset: "NIFTY 22400 CE", type: "BUY", pnl: 12450, strategy: "Breakout", emotion: "Discipline ✓", quantity: 50, entryPrice: 125, exitPrice: 374 },
  { id: "d2", time: "11:05 AM", asset: "RELIANCE", type: "BUY", pnl: -3200, strategy: "Retest", emotion: "FOMO Entry ⚠️", quantity: 200, entryPrice: 2840, exitPrice: 2824 },
  { id: "d3", time: "Yesterday", asset: "HDFCBANK", type: "SELL", pnl: 8100, strategy: "Scalping", emotion: "Early Exit ⚠️", quantity: 300, entryPrice: 1540, exitPrice: 1513 },
];

export default function DashboardPage() {
  // Navigation & Scene States
  const [activeTab, setActiveTab] = useState<"dashboard" | "market" | "journal" | "mistakes" | "mentor" | "reports" | "strategies" | "tools" | "goals" | "calendar" | "settings">("dashboard");
  const [journalSubTab, setJournalSubTab] = useState<"single" | "upload" | "paste" | "broker">("single");
  const [goalsSubTab, setGoalsSubTab] = useState<"active" | "completed" | "all">("active");

  // Broker API Credentials inputs
  const [authBrokerName, setAuthBrokerName] = useState<string | null>(null);
  const [brokerApiKey, setBrokerApiKey] = useState("");
  const [brokerApiSecret, setBrokerApiSecret] = useState("");
  const [brokerClientId, setBrokerClientId] = useState("");

  // Core Data States
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnectionItem[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Connection & Core Settings state
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("Trader");
  const [isLoading, setIsLoading] = useState(true);

  // Manual Add Form State
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
  const [confidence, setConfidence] = useState(4);
  const [followedPlan, setFollowedPlan] = useState(true);
  const [volumeConfirm, setVolumeConfirm] = useState(true);
  const [slSetInSystem, setSlSetInSystem] = useState(true);
  const [pastedText, setPastedText] = useState("");

  // New Strategy Form States
  const [newStratName, setNewStratName] = useState("");
  const [newStratCategory, setNewStratCategory] = useState("Breakout");
  const [newStratDesc, setNewStratDesc] = useState("");
  const [newStratEntryRules, setNewStratEntryRules] = useState("");

  // New Goal Form States
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Performance");
  const [newGoalValue, setNewGoalValue] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");

  // New Calendar Event Form States
  const [newEvTitle, setNewEvTitle] = useState("");
  const [newEvType, setNewEvType] = useState("Review");
  const [newEvDate, setNewEvDate] = useState("");

  // Settings State Inputs
  const [settingsTheme, setSettingsTheme] = useState("Light");
  const [settingsCurrency, setSettingsCurrency] = useState("INR");
  const [settingsTimezone, setSettingsTimezone] = useState("Asia/Kolkata");
  const [settingsRisk, setSettingsRisk] = useState("1.0");
  const [settingsRR, setSettingsRR] = useState("1:2");
  const [settingsBrokerage, setSettingsBrokerage] = useState(true);
  const [settingsDateRange, setSettingsDateRange] = useState("This Week");

  // Filters State
  const [filterSearch, setFilterSearch] = useState("");
  const [filterSetup, setFilterSetup] = useState("All");
  const [filterEmotion, setFilterEmotion] = useState("All");
  const [filterType, setFilterType] = useState("All");

  // Syncing broker state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncBroker, setSyncBroker] = useState("");

  // Mistakes Form States
  const [mistakeTradeId, setMistakeTradeId] = useState("");
  const [mistakeType, setMistakeType] = useState("Revenge Trading");
  const [mistakeSeverity, setMistakeSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [mistakeReason, setMistakeReason] = useState("");
  const [mistakeLoss, setMistakeLoss] = useState("");
  const [mistakeTip, setMistakeTip] = useState("");

  // Mentor Review Form States
  const [mentorTradeId, setMentorTradeId] = useState("");
  const [mentorScore, setMentorScore] = useState("80");
  const [mentorFeedback, setMentorFeedback] = useState("");
  const [mentorStrengths, setMentorStrengths] = useState("");
  const [mentorImprovements, setMentorImprovements] = useState("");

  // Tools - Position Sizing Calculator States
  const [calcCapital, setCalcCapital] = useState("100000");
  const [calcRiskPct, setCalcRiskPct] = useState("1");
  const [calcStopLoss, setCalcStopLoss] = useState("20");
  const [calcLotSize, setCalcLotSize] = useState("75");

  // Tools - Risk Reward Calculator States
  const [calcEntry, setCalcEntry] = useState("150");
  const [calcSL, setCalcSL] = useState("140");
  const [calcTarget, setCalcTarget] = useState("175");
  const [calcDirection, setCalcDirection] = useState<"BUY" | "SELL">("BUY");

  // Tools - Pivot Points Calculator States
  const [calcHigh, setCalcHigh] = useState("22500");
  const [calcLow, setCalcLow] = useState("22300");
  const [calcClose, setCalcClose] = useState("22450");

  // Tools - Checklist States
  const [checklist, setChecklist] = useState({
    trend: false,
    level: false,
    trigger: false,
    rr: false,
    slOrder: false,
    psychology: false,
  });

  // Core Data States for Mistakes and Reviews
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [mentorReviews, setMentorReviews] = useState<any[]>([]);

  // Initialize and load user data
  useEffect(() => {
    const email = localStorage.getItem("ta_user_email") || "test_prod_user_2026@example.com";
    const name = localStorage.getItem("ta_user_name") || "Trader";
    setUserEmail(email);
    setUserName(name);
    setIsLoading(true);

    const loadAllData = async () => {
      try {
        const [
          dbTrades,
          dbStrats,
          dbGoals,
          dbEvents,
          dbSettings,
          dbConnections,
          dbLogs,
          dbMistakes,
          dbReviews
        ] = await Promise.all([
          getTrades(email),
          getStrategies(email),
          getGoals(email),
          getCalendarEvents(email),
          getUserSettings(email),
          getBrokerConnections(email),
          getSyncLogs(email),
          getMistakes(email),
          getMentorReviews(email)
        ]);

        setTrades(dbTrades.length > 0 ? dbTrades : DEFAULT_TRADES);
        setStrategies(dbStrats);
        setGoals(dbGoals);
        setCalendarEvents(dbEvents);

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

        setBrokerConnections(dbConnections);
        setSyncLogs(dbLogs);
        setMistakes(dbMistakes);
        setMentorReviews(dbReviews);
      } catch (err) {
        console.error("Error loading data from database:", err);
        setTrades(DEFAULT_TRADES);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Load mistakes and auto-detect when Mistakes tab is active
  useEffect(() => {
    if (activeTab === "mistakes" && userEmail) {
      const detect = async () => {
        try {
          const updatedMistakes = await runAutoDetectMistakes(userEmail);
          setMistakes(updatedMistakes);
        } catch (e) {
          console.error("Error auto-detecting mistakes:", e);
        }
      };
      detect();
    }
  }, [activeTab, userEmail]);

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
      const updated = await getMistakes(userEmail);
      setMistakes(updated);
      setMistakeTradeId("");
      setMistakeReason("");
      setMistakeLoss("");
      setMistakeTip("");
      alert("Mistake logged successfully! ⚠️");
    } catch (err) {
      console.error("Failed to add mistake:", err);
      alert("Failed to log mistake.");
    }
  };

  const handleAddMentorReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorTradeId || !mentorFeedback) return;
    try {
      const scoreVal = parseFloat(mentorScore) || 80;
      const strengthsArr = mentorStrengths.split(",").map((s) => s.trim()).filter(Boolean);
      const improvementsArr = mentorImprovements.split(",").map((s) => s.trim()).filter(Boolean);
      await addMentorReview(
        userEmail,
        mentorTradeId,
        scoreVal,
        mentorFeedback,
        strengthsArr,
        improvementsArr
      );
      const updated = await getMentorReviews(userEmail);
      setMentorReviews(updated);
      setMentorTradeId("");
      setMentorFeedback("");
      setMentorStrengths("");
      setMentorImprovements("");
      alert("Mentor review submitted! 🎓");
    } catch (err) {
      console.error("Failed to add mentor review:", err);
      alert("Failed to submit review.");
    }
  };

  const handleAutoDetectMistakes = async () => {
    setIsLoading(true);
    try {
      const updated = await runAutoDetectMistakes(userEmail);
      setMistakes(updated);
      alert(`Auto-detection completed! Found and categorized recent emotional patterns. 🤖`);
    } catch (err) {
      console.error("Auto-detect mistakes failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Form Submissions
  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    const qty = parseInt(quantity) || 1;
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tgt = parseFloat(target) || 0;
    const lotSize = asset.toUpperCase().includes("BANKNIFTY") ? 15 : asset.toUpperCase().includes("NIFTY") ? 75 : 1;
    const brokerage = 40;
    const gross_pnl = tradeType === "BUY" ? (exit - entry) * qty * lotSize : (entry - exit) * qty * lotSize;
    const net_pnl = gross_pnl - brokerage;
    const risk = Math.abs(entry - sl) * qty * lotSize;
    const reward = Math.abs(tgt - entry) * qty * lotSize;
    const rr_val = risk > 0 ? reward / risk : 0;

    const pnlVal = pnl ? parseFloat(pnl) : gross_pnl;
    const finalNetPnl = pnl ? pnlVal - brokerage : net_pnl;

    const tempId = `temp_${Date.now()}`;

    const newTradeObj: Trade = {
      id: tempId,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      asset: asset.toUpperCase(),
      type: tradeType,
      pnl: finalNetPnl,
      strategy,
      emotion: followedPlan ? emotion : `${emotion.replace(" ✓", "")} ⚠️`,
      quantity: qty,
      entryPrice: entry,
      exitPrice: exit,
      stopLoss: sl > 0 ? sl : undefined,
      target: tgt > 0 ? tgt : undefined,
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
        rr: rr_val,
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
    } catch (err) {
      console.error("Failed to save strategy:", err);
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
    } catch (err) {
      console.error("Failed to save goal:", err);
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
      setCalendarEvents((prev) => [...prev, newEv]);
      setNewEvTitle("");
      setNewEvDate("");
    } catch (err) {
      console.error("Failed to save event:", err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanRisk = parseFloat(settingsRisk) || 1.0;
      const cleanRR = parseFloat(settingsRR.split(":")[1]) || 2.0;

      await saveUserSettings(userEmail, {
        theme: settingsTheme,
        currency: settingsCurrency,
        timezone: settingsTimezone,
        defaultRisk: cleanRisk,
        defaultRr: cleanRR,
        includeBrokerage: settingsBrokerage,
        defaultDateRange: settingsDateRange,
      });
      alert("Settings updated successfully! ✅");
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const handleDeleteTradeRecord = async (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
    try {
      if (id.startsWith("trd_") || id.includes("-")) {
        await deleteDbTrade(id);
      }
    } catch (err) {
      console.error("Failed to delete trade record:", err);
    }
  };

  // Broker connection configuration
  const handleBrokerConnectionAction = (broker: string) => {
    setAuthBrokerName(broker);
  };

  // Submit Broker credentials and trigger sync
  const handleBrokerSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authBrokerName) return;

    setIsSyncing(true);
    setSyncBroker(authBrokerName);

    try {
      const res = await triggerBrokerSync(userEmail, authBrokerName, {
        apiKey: brokerApiKey,
        apiSecret: brokerApiSecret,
        clientId: brokerClientId,
      });

      if (res.success) {
        alert(`Successfully connected ${authBrokerName}! Sync complete. Imported ${res.recordsCount} trades. ✅`);
        
        // Reload dashboard trades
        const dbTrades = await getTrades(userEmail);
        setTrades(dbTrades);

        // Reload active connections
        const dbConnections = await getBrokerConnections(userEmail);
        setBrokerConnections(dbConnections);

        // Reload sync logs
        const dbLogs = await getSyncLogs(userEmail);
        setSyncLogs(dbLogs);

        // Clear forms
        setBrokerApiKey("");
        setBrokerApiSecret("");
        setBrokerClientId("");
        setAuthBrokerName(null);
      } else {
        alert(`Failed to sync: ${res.errorMessage} ❌`);
      }
    } catch (err: any) {
      console.error("Error during broker sync:", err);
      alert("Failed to synchronize broker account. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger direct sync for connected brokers
  const handleDirectSync = async (broker: string) => {
    setIsSyncing(true);
    setSyncBroker(broker);
    try {
      const res = await triggerBrokerSync(userEmail, broker, {});
      if (res.success) {
        alert(`Sync complete. Synced ${res.recordsCount} new trades from ${broker}. ✅`);
        
        const dbTrades = await getTrades(userEmail);
        setTrades(dbTrades);

        const dbLogs = await getSyncLogs(userEmail);
        setSyncLogs(dbLogs);
      } else {
        alert(`Failed to sync: ${res.errorMessage} ❌`);
      }
    } catch (err) {
      console.error("Error during direct sync:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Disconnect broker connection
  const handleDisconnectBroker = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this broker?")) return;
    try {
      await disconnectBroker(connectionId);
      const dbConnections = await getBrokerConnections(userEmail);
      setBrokerConnections(dbConnections);
      
      const dbLogs = await getSyncLogs(userEmail);
      setSyncLogs(dbLogs);
    } catch (err) {
      console.error("Failed to disconnect broker:", err);
    }
  };

  // Parse pasted text trades and save to database
  const handleParsePastedTrades = async () => {
    if (!pastedText) return;
    const lines = pastedText.split("\n");
    const parsed: Trade[] = [];
    lines.forEach((line, index) => {
      const parts = line.split("\t");
      if (parts.length >= 4) {
        parsed.push({
          id: `paste_temp_${Date.now()}_${index}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          asset: parts[0].trim().toUpperCase(),
          type: parts[1].trim().toUpperCase() === "BUY" ? "BUY" : "SELL",
          pnl: parseFloat(parts[2]) || 0,
          strategy: parts[3].trim() || "Breakout",
          emotion: "Discipline ✓",
        });
      }
    });

    if (parsed.length > 0) {
      setTrades((prev) => [...parsed, ...prev]);
      setPastedText("");
      setActiveTab("journal");
      
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
        
        // Reload all real trades to get official DB ids
        const dbTrades = await getTrades(userEmail);
        setTrades(dbTrades);
        
        alert(`Successfully imported and saved ${parsed.length} trades to the database! ✅`);
      } catch (err) {
        console.error("Failed to save some pasted trades to database", err);
        alert(`Imported ${parsed.length} trades locally, but some failed to save in the database.`);
      }
    } else {
      alert("Invalid format. Make sure columns are separated by tabs (Instrument \\t Type \\t PnL \\t Strategy).");
    }
  };

  // CORE METRICS MATHEMATICS FORMULAS (NO MOCKS)
  const totalTradesCount = trades.length;
  const closedTrades = trades; // simplified representation
  const winningTradesCount = trades.filter((t) => t.pnl > 0).length;
  const losingTradesCount = trades.filter((t) => t.pnl < 0).length;

  const winRateMetric = totalTradesCount > 0 ? ((winningTradesCount / totalTradesCount) * 100).toFixed(1) : "0.0";
  const netPnlMetric = trades.reduce((sum, t) => sum + t.pnl, 0);

  const grossProfitVal = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const grossLossVal = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const profitFactorMetric = grossLossVal > 0 ? (grossProfitVal / grossLossVal).toFixed(2) : grossProfitVal > 0 ? "9.99" : "0.00";

  // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
  const winRateDec = totalTradesCount > 0 ? winningTradesCount / totalTradesCount : 0;
  const lossRateDec = totalTradesCount > 0 ? losingTradesCount / totalTradesCount : 0;
  const avgWinVal = winningTradesCount > 0 ? grossProfitVal / winningTradesCount : 0;
  const avgLossVal = losingTradesCount > 0 ? grossLossVal / losingTradesCount : 0;
  const expectancyMetric = ((winRateDec * avgWinVal) - (lossRateDec * avgLossVal)).toFixed(1);

  // Discipline Score logic based on rule following & emotions
  const disciplineScoreMetric = totalTradesCount > 0 
    ? Math.round((trades.filter((t) => !t.emotion.includes("⚠️")).length / totalTradesCount) * 100) 
    : 100;

  // Trade Quality Score logic
  const tradeQualityMetric = totalTradesCount > 0
    ? Math.round(
        (trades.filter((t) => !t.emotion.includes("⚠️")).length * 0.4 +
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

  // Calculate dynamic starting/current capital
  const startingCapital = 250000;
  const currentCapital = startingCapital + netPnlMetric;
  const growthPct = startingCapital > 0 ? (netPnlMetric / startingCapital) * 100 : 0;
  const growthPctStr = `${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(2)}%`;

  // Dynamic growth chart path coordinates
  let cumulativeValue = 0;
  const equityPoints = [...trades]
    .reverse()
    .map((t) => {
      cumulativeValue += t.pnl;
      return cumulativeValue;
    });

  const basePoints = [0, ...equityPoints];
  const minVal = Math.min(...basePoints);
  const maxVal = Math.max(1000, ...basePoints);
  const valRange = maxVal - minVal || 1;

  const svgPoints = basePoints.map((val, idx) => {
    const x = 10 + (idx / (basePoints.length - 1)) * 680;
    const y = 190 - ((val - minVal) / valRange) * 160;
    return { x, y };
  });

  let linePath = "";
  let areaPath = "";

  if (svgPoints.length > 0) {
    linePath = `M ${svgPoints[0].x},${svgPoints[0].y}`;
    for (let i = 1; i < svgPoints.length; i++) {
      const prev = svgPoints[i - 1];
      const curr = svgPoints[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (2 * (curr.x - prev.x)) / 3;
      const cpY2 = curr.y;
      linePath += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
    }
    areaPath = `${linePath} L ${svgPoints[svgPoints.length - 1].x},220 L ${svgPoints[0].x},220 Z`;
  } else {
    linePath = "M 10,190 L 690,190";
    areaPath = "M 10,190 L 690,190 L 690,220 L 10,220 Z";
  }

  const lastPoint = svgPoints.length > 0 ? svgPoints[svgPoints.length - 1] : { x: 690, y: 190 };

  const defaultDates = ["12 May", "13 May", "14 May", "15 May", "16 May", "17 May", "18 May"];
  const displayXLabels = trades.length >= 2 
    ? Array.from({ length: 7 }, (_, i) => {
        const idx = Math.floor((i / 6) * (trades.length - 1));
        const t = [...trades].reverse()[idx];
        return t ? t.time : "";
      })
    : defaultDates;

  // Donut values for mistakes
  const mistakeCounts = {
    FOMO: trades.filter((t) => t.emotion.toLowerCase().includes("fomo")).length,
    EarlyExit: trades.filter((t) => t.emotion.toLowerCase().includes("early")).length,
    Overtrading: trades.filter((t) => t.emotion.toLowerCase().includes("overtrading")).length,
    Revenge: trades.filter((t) => t.emotion.toLowerCase().includes("revenge")).length,
    LateEntry: trades.filter((t) => t.emotion.toLowerCase().includes("late")).length,
  };
  const totalMistakes = mistakeCounts.FOMO + mistakeCounts.EarlyExit + mistakeCounts.Overtrading + mistakeCounts.Revenge + mistakeCounts.LateEntry;
  const hasMistakes = totalMistakes > 0;

  const fomoPct = hasMistakes ? Math.round((mistakeCounts.FOMO / totalMistakes) * 100) : 0;
  const earlyPct = hasMistakes ? Math.round((mistakeCounts.EarlyExit / totalMistakes) * 100) : 0;
  const overtradingPct = hasMistakes ? Math.round((mistakeCounts.Overtrading / totalMistakes) * 100) : 0;
  const revengePct = hasMistakes ? Math.round((mistakeCounts.Revenge / totalMistakes) * 100) : 0;
  const latePct = hasMistakes ? Math.round((mistakeCounts.LateEntry / totalMistakes) * 100) : 0;

  const circ = 81.68;
  const dashRevenge = (circ * revengePct) / 100;
  const dashOvertrading = (circ * overtradingPct) / 100;
  const dashEarly = (circ * earlyPct) / 100;
  const dashFomo = (circ * fomoPct) / 100;
  const dashLate = (circ * latePct) / 100;

  const offsetRevenge = 0;
  const offsetOvertrading = -dashRevenge;
  const offsetEarly = -(dashRevenge + dashOvertrading);
  const offsetFomo = -(dashRevenge + dashOvertrading + dashEarly);
  const offsetLate = -(dashRevenge + dashOvertrading + dashEarly + dashFomo);

  // Dynamic Suggestion based on top mistake
  let topMistake = "";
  let maxMistakeCount = 0;
  Object.entries(mistakeCounts).forEach(([name, count]) => {
    if (count > maxMistakeCount) {
      maxMistakeCount = count;
      topMistake = name;
    }
  });

  let dynamicSuggestion = "Excellent discipline! Continue following your trade plan rules systematically.";
  if (maxMistakeCount > 0) {
    if (topMistake === "Revenge") {
      dynamicSuggestion = "You have a tendency to revenge trade after a loss. Take a 1-hour cooling-off period.";
    } else if (topMistake === "Overtrading") {
      dynamicSuggestion = "You are exceeding your daily trade limit. Lock your terminal after 3 trades to prevent overtrading.";
    } else if (topMistake === "EarlyExit") {
      dynamicSuggestion = "You are closing trades early. Use trailing stop losses to secure profit while letting winners run.";
    } else if (topMistake === "FOMO") {
      dynamicSuggestion = "You are chasing moves (FOMO). Wait for a candle close and confirmation setup before entry.";
    } else if (topMistake === "LateEntry") {
      dynamicSuggestion = "You are entering setups late. Avoid chasing price once it has moved past your trigger zone.";
    }
  }

  // Generate dynamic sparkline data histories
  const pnlHistory = [0, ...equityPoints];
  const profitSpark = getSparklinePoints(pnlHistory);

  let runningQualitySum = 0;
  const qualityHistory = [...trades].reverse().map((t, idx) => {
    const score = (!t.emotion.includes("⚠️") ? 60 : 0) + (t.pnl > 0 ? 40 : 0);
    runningQualitySum += score;
    return runningQualitySum / (idx + 1);
  });
  const qualitySpark = getSparklinePoints(qualityHistory.length > 0 ? [80, ...qualityHistory] : [80, 80]);

  let runningDiscSum = 0;
  const discHistory = [...trades].reverse().map((t, idx) => {
    const score = !t.emotion.includes("⚠️") ? 100 : 0;
    runningDiscSum += score;
    return runningDiscSum / (idx + 1);
  });
  const discSpark = getSparklinePoints(discHistory.length > 0 ? [80, ...discHistory] : [80, 80]);

  let runningWins = 0;
  const winRateHistory = [...trades].reverse().map((t, idx) => {
    if (t.pnl > 0) runningWins++;
    return (runningWins / (idx + 1)) * 100;
  });
  const winRateSpark = getSparklinePoints(winRateHistory.length > 0 ? [50, ...winRateHistory] : [50, 50]);

  let winSum = 0;
  let winCount = 0;
  let lossSum = 0;
  let lossCount = 0;
  const rrHistory = [...trades].reverse().map((t) => {
    if (t.pnl > 0) {
      winSum += t.pnl;
      winCount++;
    } else if (t.pnl < 0) {
      lossSum += Math.abs(t.pnl);
      lossCount++;
    }
    const avgWin = winCount > 0 ? winSum / winCount : 0;
    const avgLoss = lossCount > 0 ? lossSum / lossCount : 0;
    return avgLoss > 0 ? avgWin / avgLoss : 1.2;
  });
  const rrSpark = getSparklinePoints(rrHistory.length > 0 ? [1.2, ...rrHistory] : [1.2, 1.2]);

  const countHistory = trades.map((_, idx) => idx + 1).reverse();
  const countSpark = getSparklinePoints(countHistory.length > 0 ? [0, ...countHistory] : [0, 0]);

  // Dynamic streaks calculations
  let disciplineStreak = 0;
  for (const t of trades) {
    if (!t.emotion.includes("⚠️")) {
      disciplineStreak++;
    } else {
      break;
    }
  }

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const currentWeekTrades = daysOfWeek.map((dayName, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    
    const dayTrades = trades.filter(t => {
      const todayStr = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString([], { month: "short", day: "numeric" });
      
      let formattedTradeDate = t.time;
      if (t.time.includes(":")) {
        formattedTradeDate = todayStr;
      } else if (t.time === "Yesterday") {
        formattedTradeDate = yesterdayStr;
      }
      
      const targetDateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
      return formattedTradeDate === targetDateStr;
    });
    
    const hasTradesOnDay = dayTrades.length > 0;
    const isDisciplined = dayTrades.every(t => !t.emotion.includes("⚠️"));
    
    return {
      day: dayName,
      hasTrades: hasTradesOnDay,
      checked: hasTradesOnDay && isDisciplined,
      breached: hasTradesOnDay && !isDisciplined
    };
  });

  const uniqueDates = Array.from(new Set(trades.map(t => {
    const todayStr = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString([], { month: "short", day: "numeric" });
    
    if (t.time.includes(":")) return todayStr;
    if (t.time === "Yesterday") return yesterdayStr;
    return t.time;
  })));
  
  let journalStreak = 0;
  let checkDate = new Date();
  for (let i = 0; i < 30; i++) {
    const checkDateStr = checkDate.toLocaleDateString([], { month: "short", day: "numeric" });
    if (uniqueDates.includes(checkDateStr)) {
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

  // Dynamic insights calculations
  const planFollowedTrades = trades.filter(t => !t.emotion.includes("⚠️"));
  const planBreachedTrades = trades.filter(t => t.emotion.includes("⚠️"));
  
  const winRatePlanFollowed = planFollowedTrades.length > 0 
    ? (planFollowedTrades.filter(t => t.pnl > 0).length / planFollowedTrades.length) * 100
    : 0;
    
  const winRatePlanBreached = planBreachedTrades.length > 0 
    ? (planBreachedTrades.filter(t => t.pnl > 0).length / planBreachedTrades.length) * 100
    : 0;
    
  const winDiff = Math.max(0, Math.round(winRatePlanFollowed - winRatePlanBreached));
  const planFollowText = winDiff > 0 
    ? `Your win rate is ${winDiff}% higher when you follow your plan.` 
    : "Follow your rules systematically to maintain high win rate consistency.";

  const assets = trades.map(t => t.asset.toUpperCase());
  let favoriteAsset = "indices";
  if (assets.length > 0) {
    const counts: Record<string, number> = {};
    assets.forEach(a => counts[a] = (counts[a] || 0) + 1);
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    favoriteAsset = sorted[0][0];
  }
  const assetInsightText = favoriteAsset !== "indices" 
    ? `Your most traded asset is ${favoriteAsset}. Focus on mastering its setups.`
    : "Analyze index trends on higher timeframes before execution.";

  // Active / Completed Goals filtering
  const activeGoals = goals.filter((g) => g.progress < 100);
  const completedGoals = goals.filter((g) => g.progress >= 100);
  const displayedGoals = goalsSubTab === "active" ? activeGoals : goalsSubTab === "completed" ? completedGoals : goals;

  // Journal List
  const journalTrades = trades.filter((t) => {
    const matchesSearch = t.asset.toLowerCase().includes(filterSearch.toLowerCase()) || 
                          t.strategy.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesSetup = filterSetup === "All" || t.strategy === filterSetup;
    const matchesEmotion = filterEmotion === "All" || 
      (filterEmotion === "Discipline" && !t.emotion.includes("⚠️")) ||
      (filterEmotion === "FOMO Entry" && t.emotion.includes("FOMO")) ||
      (filterEmotion === "Early Exit" && t.emotion.includes("Early")) ||
      (filterEmotion === "Overtrading" && t.emotion.includes("Overtrading")) ||
      (filterEmotion === "Revenge Trade" && t.emotion.includes("Revenge"));
    const matchesType = filterType === "All" || t.type === filterType;

    return matchesSearch && matchesSetup && matchesEmotion && matchesType;
  });

  // Calculate best performing strategy
  const strategyPnLs: Record<string, number> = {};
  trades.forEach((t) => {
    if (t.strategy && t.strategy !== "None" && t.strategy !== "UNDEFINED") {
      strategyPnLs[t.strategy] = (strategyPnLs[t.strategy] || 0) + t.pnl;
    }
  });
  let bestStrategy = "None";
  let maxStrategyPnl = -Infinity;
  Object.keys(strategyPnLs).forEach((strat) => {
    if (strategyPnLs[strat] > maxStrategyPnl) {
      maxStrategyPnl = strategyPnLs[strat];
      bestStrategy = strat;
    }
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex">
      {/* FIXED SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#ECECF3] p-6 flex flex-col justify-between z-30">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] rounded-[14px] flex items-center justify-center shadow-md shadow-[#8B5CF6]/15">
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
              { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
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
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-[#F3F0FF] text-[#7C3AED]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${activeTab === item.id ? "text-[#7C3AED]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="border-t border-[#ECECF3] my-3"></div>

            {[
              { id: "goals", label: "Goals", icon: CheckSquare },
              { id: "calendar", label: "Calendar", icon: CalendarIcon },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-[#F3F0FF] text-[#7C3AED]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${activeTab === item.id ? "text-[#7C3AED]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Motivation Card */}
        <div className="p-5 bg-gradient-to-br from-[#F5F3FF] to-[#FFFFFF] border border-[#ECECF3] rounded-[24px] text-left relative overflow-hidden shadow-sm">
          <div className="absolute right-3 bottom-3 w-12 h-12 text-slate-100 shrink-0 pointer-events-none">
            <svg viewBox="0 0 120 120" className="w-full h-full text-indigo-100">
              <path d="M40,90 L80,90 L85,110 L35,110 Z" fill="currentColor" />
              <path d="M60,90 C60,50 85,45 85,25 C85,25 75,35 60,60 C60,40 40,30 30,15 C30,15 35,30 60,90 Z" fill="#C7D2FE" />
            </svg>
          </div>
          <div className="space-y-1 relative z-10 max-w-[70%]">
            <p className="text-xs font-extrabold text-slate-900 leading-tight">Consistency today,</p>
            <p className="text-xs font-extrabold text-slate-900 leading-tight">freedom tomorrow.</p>
            <button className="text-[10px] font-black text-[#7C3AED] mt-2 block hover:underline">
              Keep going! 🚀
            </button>
          </div>
        </div>
      </aside>

      {/* DYNAMIC SCENE BASE CONTAINER */}
      <div className="flex-1 pl-[260px] min-h-screen flex flex-col justify-between">
        
        {/* GLOBAL HEADER */}
        <header className="sticky top-0 z-20 h-[88px] bg-[#F8FAFC]/80 backdrop-blur-md border-b border-[#ECECF3] px-8 flex items-center justify-between">
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Good morning, {userName}! 👋
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Here's how your trading journey looks today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Calendar select filter */}
            <div className="h-[46px] px-4 bg-white border border-[#ECECF3] rounded-full flex items-center gap-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span>May 12 - May 18, 2024</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </div>

            {/* Notification bell */}
            <button className="w-11 h-11 rounded-full border border-[#ECECF3] bg-white relative text-slate-500 hover:bg-slate-50 flex items-center justify-center shadow-sm">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FF4D6D]"></span>
            </button>

            {/* User profile with dropdown */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#ECECF3] h-10">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#C7D2FE] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-800">{userName}</span>
                <span className="text-[10px] text-slate-400 font-bold mt-0.5">Pro Trader</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER WORKSPACE */}
        <main className="p-8 flex-1 w-full max-w-7xl mx-auto space-y-6">

          {/* TAB 1: ANALYTICAL DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPIs Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
                {[
                  {
                    title: "Total Profit",
                    value: `₹${netPnlMetric.toLocaleString()}`,
                    sub: "+18.4% vs last week",
                    color: "text-[#22C55E]",
                    bg: "bg-[#E8F8F0] text-[#22C55E]",
                    icon: DollarSign,
                    sparkPath: profitSpark,
                    sparkColor: "text-[#22C55E]"
                  },
                  {
                    title: "Trade Quality",
                    value: totalTradesCount > 0 ? `${tradeQualityMetric}/100` : "0/100",
                    sub: "+8 points vs last week",
                    color: "text-[#8B5CF6]",
                    bg: "bg-[#F3F0FF] text-[#8B5CF6]",
                    icon: Star,
                    sparkPath: qualitySpark,
                    sparkColor: "text-[#8B5CF6]"
                  },
                  {
                    title: "Discipline",
                    value: totalTradesCount > 0 ? `${disciplineScoreMetric}/100` : "0/100",
                    sub: "+6 points vs last week",
                    color: "text-[#22C55E]",
                    bg: "bg-[#E8F8F0] text-[#22C55E]",
                    icon: Shield,
                    sparkPath: discSpark,
                    sparkColor: "text-[#22C55E]"
                  },
                  {
                    title: "Win Rate",
                    value: `${winRateMetric}%`,
                    sub: "+4.2% vs last week",
                    color: "text-[#3B82F6]",
                    bg: "bg-[#EFF6FF] text-[#3B82F6]",
                    icon: Percent,
                    sparkPath: winRateSpark,
                    sparkColor: "text-[#3B82F6]"
                  },
                  {
                    title: "Risk Reward",
                    value: avgLossVal > 0 ? (avgWinVal / avgLossVal).toFixed(2) : "0.00",
                    sub: "+0.18 vs last week",
                    color: "text-[#F59E0B]",
                    bg: "bg-[#FFFBEB] text-[#F59E0B]",
                    icon: TrendingUp,
                    sparkPath: rrSpark,
                    sparkColor: "text-[#F59E0B]"
                  },
                  {
                    title: "Trades This Week",
                    value: totalTradesCount.toString(),
                    sub: "+7 vs last week",
                    color: "text-[#EC4899]",
                    bg: "bg-[#FDF2F8] text-[#EC4899]",
                    icon: Activity,
                    sparkPath: countSpark,
                    sparkColor: "text-[#EC4899]"
                  }
                ].map((kpi, idx) => {
                  const IconComp = kpi.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-[24px] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 w-full h-[190px]"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${kpi.bg} flex items-center justify-center shrink-0`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 font-sans tracking-tight">
                          {kpi.title}
                        </span>
                      </div>
                      <div className="text-left mt-3">
                        <span className="text-[25px] font-extrabold text-slate-900 tracking-tight block leading-none">
                          {kpi.value}
                        </span>
                        <span className={`text-[10px] font-bold mt-1.5 block ${kpi.color}`}>
                          {kpi.sub}
                        </span>
                      </div>
                      <div className="flex justify-end pt-1 mt-auto h-7">
                        <svg className={`w-full h-full ${kpi.sparkColor}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d={kpi.sparkPath} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Equity Graph + Mistakes breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                
                {/* Equity Graph Card */}
                <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[420px]">
                  <div className="flex justify-between items-center pb-4">
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Your Growth Over Time</h3>
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[28px] font-extrabold text-slate-900 leading-none">
                          ₹{currentCapital.toLocaleString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                          growthPct >= 0 ? "bg-emerald-50 text-[#22C55E]" : "bg-rose-50 text-rose-500"
                        }`}>
                          {growthPctStr}
                        </span>
                      </div>
                    </div>
                    <div className="h-9 px-3 bg-white border border-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer shadow-sm hover:bg-slate-50">
                      <span>This Week</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* SVG Workspace */}
                  <div className="flex-1 flex gap-4 mt-2">
                    {/* Y Axis labels */}
                    <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 text-right w-10 py-1 pb-6 select-none leading-none">
                      <span>300K</span>
                      <span>225K</span>
                      <span>150K</span>
                      <span>75K</span>
                      <span>0</span>
                    </div>

                    <div className="flex-1 flex flex-col relative h-full">
                      {/* Gridlines & Line Curve */}
                      <div className="flex-1 bg-[#FAFAFD] rounded-[20px] border border-slate-100 relative overflow-hidden">
                        {/* Custom visual grids */}
                        <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                          <div className="border-b border-dashed border-slate-200/60 w-full h-0"></div>
                          <div className="border-b border-dashed border-slate-200/60 w-full h-0"></div>
                          <div className="border-b border-dashed border-slate-200/60 w-full h-0"></div>
                          <div className="border-b border-dashed border-slate-200/60 w-full h-0"></div>
                          <div className="w-full h-0"></div>
                        </div>

                        {/* Line chart paths */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 220" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="dashAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Smooth spline curve area */}
                          <path d={areaPath} fill="url(#dashAreaGrad)" />
                          {/* Smooth spline curve line */}
                          <path d={linePath} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
                          
                          {/* Pulsing indicator node */}
                          <circle cx={lastPoint.x} cy={lastPoint.y} r="10" fill="#8B5CF6" fillOpacity="0.25" className="animate-pulse" />
                          <circle cx={lastPoint.x} cy={lastPoint.y} r="5" fill="#8B5CF6" />
                        </svg>
                      </div>

                      {/* X Axis labels */}
                      <div className="h-6 flex justify-between items-center text-[10px] font-bold text-slate-400 mt-2 px-1 select-none">
                        {displayXLabels.map((lbl, idx) => (
                          <span key={idx}>{lbl}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Where You Lose the Most Card */}
                <div className="lg:col-span-3 bg-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[420px]">
                  <div className="text-left pb-1">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Where You Lose the Most</h3>
                  </div>

                  {/* Donut and Legend Row */}
                  <div className="flex items-center justify-between gap-3 my-auto">
                    {/* SVG Donut */}
                    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="13" fill="none" stroke="#F8FAFC" strokeWidth="4" />
                        {hasMistakes ? (
                          <>
                            {/* Custom segments matching screenshot percentages */}
                            {/* Purple (Emotional Trades / Revenge) */}
                            {dashRevenge > 0 && <circle cx="18" cy="18" r="13" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray={`${dashRevenge} 81.68`} strokeDashoffset={offsetRevenge} />}
                            {/* Pink (Overtrading) */}
                            {dashOvertrading > 0 && <circle cx="18" cy="18" r="13" fill="none" stroke="#EC4899" strokeWidth="4" strokeDasharray={`${dashOvertrading} 81.68`} strokeDashoffset={offsetOvertrading} />}
                            {/* Orange (Early Exit) */}
                            {dashEarly > 0 && <circle cx="18" cy="18" r="13" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray={`${dashEarly} 81.68`} strokeDashoffset={offsetEarly} />}
                            {/* Blue (FOMO Entries) */}
                            {dashFomo > 0 && <circle cx="18" cy="18" r="13" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray={`${dashFomo} 81.68`} strokeDashoffset={offsetFomo} />}
                            {/* Green (Late Entries) */}
                            {dashLate > 0 && <circle cx="18" cy="18" r="13" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${dashLate} 81.68`} strokeDashoffset={offsetLate} />}
                          </>
                        ) : (
                          /* Perfect Discipline Circle when no mistakes exist */
                          <circle cx="18" cy="18" r="13" fill="none" stroke="#10B981" strokeWidth="4" />
                        )}
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center select-none">
                        <span className="text-[20px] font-extrabold text-slate-800 leading-none">
                          {hasMistakes ? `${revengePct}%` : "100%"}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          {hasMistakes ? "of mistakes" : "discipline"}
                        </span>
                      </div>
                    </div>

                    {/* Legend column */}
                    <div className="flex flex-col gap-2 w-full text-left font-semibold text-slate-600">
                      {[
                        { name: "Emotional Trades", pct: `${revengePct}%`, color: "bg-[#8B5CF6]" },
                        { name: "Overtrading", pct: `${overtradingPct}%`, color: "bg-[#EC4899]" },
                        { name: "Early Exit", pct: `${earlyPct}%`, color: "bg-[#F59E0B]" },
                        { name: "FOMO Entries", pct: `${fomoPct}%`, color: "bg-[#3B82F6]" },
                        { name: "Late Entries", pct: `${latePct}%`, color: "bg-[#10B981]" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`}></span>
                            <span className="text-slate-400 font-bold text-[10px] truncate max-w-[85px]">{item.name}</span>
                          </div>
                          <span className="text-slate-700 font-extrabold text-[10px] shrink-0">{item.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestion Box */}
                  <div className="p-3 bg-[#F7F4FF] border border-[#8B5CF6]/5 rounded-[20px] flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4 h-4 text-[#8B5CF6]" />
                      </div>
                      <p className="text-[11px] text-slate-600 font-bold text-left leading-normal">
                        {dynamicSuggestion}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transform -rotate-90 cursor-pointer hover:text-slate-600 transition-colors" />
                  </div>
                </div>

              </div>

              {/* Bottom 3-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: RECENT TRADES */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[400px]">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recent Trades</h3>
                    <button onClick={() => setActiveTab("journal")} className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer">
                      View All
                    </button>
                  </div>
                  
                  {trades.length > 0 ? (
                    <div className="flex-1 overflow-y-auto mt-2">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            <th className="py-2">Date</th>
                            <th className="py-2">Trade</th>
                            <th className="py-2">Result</th>
                            <th className="py-2">P&L</th>
                            <th className="py-2 text-center">Mood</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
                          {trades.slice(0, 5).map((t, idx) => {
                            const isWin = t.pnl >= 0;
                            const emotion = t.emotion.includes("✓") ? "😊" : t.emotion.includes("FOMO") || t.emotion.includes("Revenge") ? "😢" : "😐";
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 text-slate-400 font-bold text-[11px]">{t.time}</td>
                                <td className="py-3 font-bold text-slate-800 text-[11px] truncate max-w-[110px]">{t.asset}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block leading-none ${
                                    isWin ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                  }`}>
                                    {isWin ? "Win" : "Loss"}
                                  </span>
                                </td>
                                <td className={`py-3 font-extrabold text-[11px] ${isWin ? "text-emerald-500" : "text-rose-500"}`}>
                                  {isWin ? "+" : ""}₹{Math.abs(t.pnl).toLocaleString()}
                                </td>
                                <td className="py-3 text-center text-[15px] select-none">{emotion}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Elegant empty state for trades */
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">No trades recorded yet</p>
                        <p className="text-[10px] text-slate-400 mt-1">Your logged trades will appear here automatically.</p>
                      </div>
                      <button onClick={() => setActiveTab("journal")} className="px-4 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer">
                        Log Your First Trade
                      </button>
                    </div>
                  )}
                </div>

                {/* COLUMN 2: SMART INSIGHTS */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[400px]">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Smart Insights</h3>
                    <button className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer">
                      View All
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-2 gap-3 mt-3">
                    {(trades.length > 0 ? [
                      { text: planFollowText, color: "bg-[#E8F8F0] text-[#22C55E]", icon: CheckCircle },
                      { text: "Limit daily trades to 3 to prevent overtrading drawdowns.", color: "bg-[#F3F0FF] text-[#8B5CF6]", icon: Brain },
                      { text: assetInsightText, color: "bg-[#FFFBEB] text-[#F59E0B]", icon: Clock }
                    ] : [
                      { text: "Log trades to generate rule compliance insights.", color: "bg-[#E8F8F0] text-[#22C55E]", icon: CheckCircle },
                      { text: "Systematic logs build trading consistency.", color: "bg-[#F3F0FF] text-[#8B5CF6]", icon: Brain },
                      { text: "Keep tracking your stats to see improvements.", color: "bg-[#FFFBEB] text-[#F59E0B]", icon: Clock }
                    ]).map((insight, i) => {
                      const IconComp = insight.icon;
                      return (
                        <div key={i} className="flex items-center justify-between border border-slate-100 rounded-[20px] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-sm transition-all duration-300 bg-white">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${insight.color} flex items-center justify-center shrink-0`}>
                              <IconComp className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 text-left leading-snug">
                              {insight.text}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-slate-300 shrink-0 transform -rotate-90 cursor-pointer hover:text-slate-500" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 3: YOUR STREAKS */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[400px] gap-4">
                  {/* Discipline Streak Subcard */}
                  <div className="border border-slate-100 rounded-[24px] p-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-sm transition-all duration-300 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Discipline Streak</span>
                          <Info className="w-3 h-3 text-slate-300 cursor-help" />
                        </div>
                        <span className="text-[25px] font-extrabold text-slate-800 leading-none block">
                          {disciplineStreak} days
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {disciplineStreak > 0 ? "Keep showing up!" : "Follow your plan rules!"}
                        </span>
                      </div>

                      {/* Green flame icon graphics */}
                      <div className="relative w-12 h-12 flex items-center justify-center shrink-0 mt-1 select-none">
                        {disciplineStreak > 0 && <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-75"></div>}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                          disciplineStreak > 0 ? "bg-[#E8F8F0] border border-emerald-500/15" : "bg-slate-50 border border-slate-100"
                        }`}>
                          <Flame className={`w-5 h-5 ${disciplineStreak > 0 ? "text-emerald-500 fill-emerald-500" : "text-slate-300"}`} />
                        </div>
                      </div>
                    </div>

                    {/* M T W T F S S Indicators */}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                      {currentWeekTrades.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            item.checked
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-500/10"
                              : item.breached
                              ? "bg-rose-50 text-rose-600 border border-rose-500/10"
                              : "bg-slate-50 text-slate-300 border border-slate-100"
                          }`}>
                            {item.checked ? "✓" : item.breached ? "⚠️" : "-"}
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase select-none">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Journal Streak Subcard */}
                  <div className="border border-slate-100 rounded-[24px] p-4 bg-[#F3F0FF]/30 hover:bg-[#F3F0FF]/40 transition-all duration-300 flex items-center justify-between gap-4 h-[92px]">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Journal Streak</span>
                        <Info className="w-3 h-3 text-slate-300 cursor-help" />
                      </div>
                      <span className="text-[22px] font-extrabold text-slate-800 leading-none block">
                        {journalStreak} days
                      </span>
                    </div>

                    {/* Calendar Purple Card Graphic */}
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#ECECF3] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-sm select-none">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
          {activeTab === "journal" && (
            <div className="space-y-8 animate-fade-in">
              {/* Tabs picker */}
              <div className="flex border-b border-[#ECEAF5] text-xs font-bold text-slate-400">
                {[
                  { id: "single", label: "Single Trade Entry" },
                  { id: "upload", label: "Excel Upload Template" },
                  { id: "paste", label: "Paste Raw Text Table" },
                  { id: "broker", label: "Broker API Sync" }
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setJournalSubTab(tb.id as any)}
                    className={`pb-3 px-6 border-b-2 cursor-pointer transition-all ${
                      journalSubTab === tb.id ? "border-[#7C4DFF] text-[#7C4DFF]" : "border-transparent"
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* Sub-view: Single Trade entry Form */}
              {journalSubTab === "single" && (
                <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Log Manual Trade</h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Calculates R:R parameters dynamically and creates DB entry</p>
                  </div>
                  <form onSubmit={handleAddTrade} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Asset Name</label>
                        <input
                          type="text"
                          placeholder="e.g., NIFTY 22400 CE"
                          required
                          value={asset}
                          onChange={(e) => setAsset(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Direction</label>
                        <div className="grid grid-cols-2 gap-2 h-11 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setTradeType("BUY")}
                            className={`rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                              tradeType === "BUY" ? "bg-[#15B77A] text-white" : "text-slate-400"
                            }`}
                          >
                            LONG
                          </button>
                          <button
                            type="button"
                            onClick={() => setTradeType("SELL")}
                            className={`rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                              tradeType === "SELL" ? "bg-[#E94B8A] text-white" : "text-slate-400"
                            }`}
                          >
                            SHORT
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Quantity</label>
                        <input
                          type="number"
                          placeholder="e.g., 50"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Entry Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g., 120"
                          value={entryPrice}
                          onChange={(e) => setEntryPrice(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Exit Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g., 140"
                          value={exitPrice}
                          onChange={(e) => setExitPrice(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Stop Loss (SL)</label>
                        <input
                          type="number"
                          placeholder="e.g., 100"
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Target Price</label>
                        <input
                          type="number"
                          placeholder="e.g., 160"
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Manual Net P&amp;L (Optional, ₹)</label>
                        <input
                          type="number"
                          placeholder="Leave blank for auto-calc"
                          value={pnl}
                          onChange={(e) => setPnl(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Strategy Setup</label>
                        <select
                          value={strategy}
                          onChange={(e) => setStrategy(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-[#FBFAFF] border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] text-xs font-bold text-slate-700"
                        >
                          <option>Breakout</option>
                          <option>Retest</option>
                          <option>Scalping</option>
                          <option>Support/Resistance</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Emotion Tag</label>
                        <select
                          value={emotion}
                          onChange={(e) => setEmotion(e.target.value)}
                          className="w-full px-4 h-11 rounded-xl bg-[#FBFAFF] border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] text-xs font-bold text-slate-700"
                        >
                          <option>Discipline ✓</option>
                          <option>FOMO Entry ⚠️</option>
                          <option>Early Exit ⚠️</option>
                          <option>Overtrading ⚠️</option>
                        </select>
                      </div>
                    </div>

                    {/* Live Calculations Preview */}
                    {quantity && entryPrice && exitPrice && (
                      (() => {
                        const qty = parseFloat(quantity) || 0;
                        const entry = parseFloat(entryPrice) || 0;
                        const exit = parseFloat(exitPrice) || 0;
                        const sl = parseFloat(stopLoss) || 0;
                        const tgt = parseFloat(target) || 0;
                        const lot = asset.toUpperCase().includes("BANKNIFTY") ? 15 : asset.toUpperCase().includes("NIFTY") ? 75 : 1;
                        const charges = 40; // standard brokerage + STT
                        const gross = tradeType === "BUY" ? (exit - entry) * qty * lot : (entry - exit) * qty * lot;
                        const net = gross - charges;
                        const rsk = Math.abs(entry - sl) * qty * lot;
                        const rwd = Math.abs(tgt - entry) * qty * lot;
                        const rr = rsk > 0 ? (rwd / rsk).toFixed(2) : "0.00";
                        const res = net > 0 ? "WIN" : net < 0 ? "LOSS" : "BREAKEVEN";

                        return (
                          <div className="p-4 bg-violet-50/50 border border-violet-100/60 rounded-xl space-y-3 text-[10px] font-bold text-slate-600 animate-fade-in">
                            <span className="text-[9px] font-black uppercase text-[#7C4DFF] tracking-wider block">Real-time Calculation Preview</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <span className="text-slate-400 uppercase text-[8px] block">Gross P&amp;L</span>
                                <span className={gross >= 0 ? "text-emerald-600 font-extrabold text-xs" : "text-[#FF4D6D] font-extrabold text-xs"}>
                                  ₹{gross.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 uppercase text-[8px] block">Estimated Charges</span>
                                <span className="text-slate-700 font-extrabold text-xs">₹{charges}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 uppercase text-[8px] block">Net P&amp;L</span>
                                <span className={net >= 0 ? "text-emerald-600 font-extrabold text-xs" : "text-[#FF4D6D] font-extrabold text-xs"}>
                                  ₹{net.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 uppercase text-[8px] block">Trade Result</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider inline-block mt-0.5 ${
                                  res === "WIN"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : res === "LOSS"
                                    ? "bg-red-100 text-[#FF4D6D]"
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {res}
                                </span>
                              </div>
                            </div>
                            {sl > 0 && tgt > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-violet-100/40">
                                <div>
                                  <span className="text-slate-400 uppercase text-[8px] block">Risk Amount</span>
                                  <span className="text-[#FF4D6D] font-bold">₹{rsk.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 uppercase text-[8px] block">Reward Amount</span>
                                  <span className="text-emerald-600 font-bold">₹{rwd.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 uppercase text-[8px] block">Risk-Reward Ratio</span>
                                  <span className="text-slate-700 font-extrabold">1 : {rr}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-[10px] font-bold text-slate-600">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={followedPlan}
                          onChange={(e) => setFollowedPlan(e.target.checked)}
                          className="rounded text-[#7C4DFF] focus:ring-[#7C4DFF]"
                        />
                        <span>Did you follow your strategy entry/exit plan parameters?</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={volumeConfirm}
                          onChange={(e) => setVolumeConfirm(e.target.checked)}
                          className="rounded text-[#7C4DFF] focus:ring-[#7C4DFF]"
                        />
                        <span>Is there volume confirmations inside target ticker?</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-[#7C4DFF] to-indigo-500 hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#7C4DFF]/15"
                    >
                      Save Manual Entry to Supabase
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-view: Excel upload */}
              {journalSubTab === "upload" && (
                <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Excel / CSV Data Importer</h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Drag template spreadsheets containing trade transactions logs</p>
                  </div>
                  <div className="border border-dashed border-[#ECEAF5] hover:bg-slate-50/50 transition-colors p-8 rounded-2xl text-center space-y-2 cursor-pointer">
                    <Upload className="w-6 h-6 text-[#7C4DFF] mx-auto" />
                    <p className="text-xs font-bold text-slate-800">Select files to upload (XLSX, CSV)</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Max size: 4MB</p>
                  </div>
                  <div className="pt-2">
                    <button className="px-4 py-2 border border-[#ECEAF5] rounded-xl text-[10px] font-bold text-[#7C4DFF] uppercase hover:bg-slate-50 transition-colors">
                      Download Excel Template (.XLSX)
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-view: Paste text */}
              {journalSubTab === "paste" && (
                <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Paste raw trade tables</h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Auto delimiter parsing format: Instrument \t Type \t PnL \t Strategy</p>
                  </div>
                  <textarea
                    rows={4}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="RELIANCE&#9;BUY&#9;4500&#9;Breakout&#10;TCS&#9;SELL&#9;-1200&#9;Retest"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]"
                  ></textarea>
                  <button
                    onClick={handleParsePastedTrades}
                    className="px-6 h-10 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Auto-parse Table Rows
                  </button>
                </div>
              )}

              {/* Sub-view: Broker API Sync */}
              {journalSubTab === "broker" && (
                <div className="space-y-6">
                  {/* Integrations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {["Zerodha", "Upstox", "Dhan"].map((broker) => {
                      const connection = brokerConnections.find(
                        (c) => c.brokerName === broker
                      );
                      const isConnected = connection && connection.status === "CONNECTED";
                      
                      return (
                        <div key={broker} className="bg-white border border-[#ECEAF5] rounded-[20px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4 bg-slate-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{broker}</h4>
                              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">API Integration</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${
                              isConnected
                                ? "bg-[#15B77A]/10 border-[#15B77A]/20 text-[#15B77A]"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}>
                              {isConnected ? "Connected" : "Disconnected"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            {isConnected ? (
                              <>
                                <button
                                  onClick={() => handleDirectSync(broker)}
                                  disabled={isSyncing}
                                  className="flex-1 h-9 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
                                >
                                  {isSyncing && syncBroker === broker ? (
                                    <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    <RefreshCw className="w-3 h-3" />
                                  )}
                                  <span>Sync Trades</span>
                                </button>
                                <button
                                  onClick={() => handleDisconnectBroker(connection.id)}
                                  className="h-9 px-3 border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
                                >
                                  Disconnect
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleBrokerConnectionAction(broker)}
                                className="w-full h-9 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                              >
                                Connect &amp; Authorize
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Credentials Form Modal/Card */}
                  {authBrokerName && (
                    <div className="bg-[#7C4DFF]/5 border border-[#7C4DFF]/15 rounded-[24px] p-6 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#7C4DFF]/10">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Authorize {authBrokerName}</h4>
                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Please provide your API application parameters. Login details are never stored.</p>
                        </div>
                        <button
                          onClick={() => setAuthBrokerName(null)}
                          className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleBrokerSyncSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Client ID / Username</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., AB1234"
                              value={brokerClientId}
                              onChange={(e) => setBrokerClientId(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">API Key</label>
                            <input
                              type="password"
                              required
                              placeholder="App API Key"
                              value={brokerApiKey}
                              onChange={(e) => setBrokerApiKey(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] text-xs font-bold text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">API Secret</label>
                            <input
                              type="password"
                              required
                              placeholder="App API Secret"
                              value={brokerApiSecret}
                              onChange={(e) => setBrokerApiSecret(e.target.value)}
                              className="w-full px-4 h-10 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] text-xs font-bold text-slate-700"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSyncing}
                          className="h-10 px-6 bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          {isSyncing ? (
                            <>
                              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Authenticating...</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="w-3.5 h-3.5" />
                              <span>Verify &amp; Import Trades</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Sync Logs Table */}
                  <div className="bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="p-5 border-b border-[#ECEAF5]">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Broker Synchronization Logs</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Audit history of background connections</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#ECEAF5] bg-slate-50/50 text-[8px] text-slate-400 font-black uppercase tracking-wider">
                            <th className="py-3 px-6">Timestamp</th>
                            <th className="py-3 px-4">Connection</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4 text-center">Records Synced</th>
                            <th className="py-3 px-6 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-600">
                          {syncLogs.length > 0 ? (
                            syncLogs.map((log) => {
                              // Find broker name
                              const conn = brokerConnections.find(c => c.id === log.connectionId);
                              const broker = conn ? conn.brokerName : "Broker";
                              return (
                                <tr key={log.id}>
                                  <td className="py-3 px-6 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                                  <td className="py-3 px-4 font-heading font-black text-slate-800">{broker} Account</td>
                                  <td className="py-3 px-4 uppercase text-[8px] text-slate-500">{log.dataType}</td>
                                  <td className="py-3 px-4 text-center text-slate-800">{log.recordsCount} trades</td>
                                  <td className="py-3 px-6 text-right">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                      log.status === "SUCCESS"
                                        ? "bg-[#15B77A]/10 text-[#15B77A]"
                                        : "bg-[#E94B8A]/10 text-[#E94B8A]"
                                    }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                                No synchronizations recorded. Connect a broker account to begin.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs filter ribbons */}
              <div className="bg-white border border-[#ECEAF5] p-5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-wrap gap-4 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search instrument symbol..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterSetup}
                    onChange={(e) => setFilterSetup(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 focus:outline-none"
                  >
                    <option value="All">All Setup Types</option>
                    <option value="Breakout">Breakout</option>
                    <option value="Retest">Retest</option>
                    <option value="Scalping">Scalping</option>
                    <option value="Support/Resistance">Support/Resistance</option>
                  </select>

                  <select
                    value={filterEmotion}
                    onChange={(e) => setFilterEmotion(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 focus:outline-none"
                  >
                    <option value="All">All Emotions</option>
                    <option value="Discipline">Discipline Only</option>
                    <option value="FOMO Entry">FOMO Only</option>
                    <option value="Early Exit">Early Exit Only</option>
                    <option value="Overtrading">Overtrading Only</option>
                  </select>

                  <div className="flex border border-slate-100 bg-slate-50 p-0.5 rounded-xl text-[9px] font-black uppercase">
                    {["All", "BUY", "SELL"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                          filterType === type ? "bg-white text-[#7C4DFF] shadow-sm" : "text-slate-400"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Master logs table */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#ECEAF5] bg-slate-50/50 text-[8px] text-slate-400 font-black uppercase tracking-wider">
                        <th className="py-4 px-6">Date/Time</th>
                        <th className="py-4 px-4">Instrument</th>
                        <th className="py-4 px-4">Direction</th>
                        <th className="py-4 px-4 text-right">Net P&amp;L</th>
                        <th className="py-4 px-4 text-center">Setup Badges</th>
                        <th className="py-4 px-4 text-center">Psychology Tag</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-600">
                      {journalTrades.length > 0 ? (
                        journalTrades.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
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
                                  : t.emotion.includes("⚠️")
                                  ? "bg-[#F59E0B]/10 border-[#F59E0B]/25 text-[#F59E0B]"
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
                            No journal records found. Let's log manual trade entries.
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
            <div className="space-y-8 animate-fade-in">
              {/* Header section with auto-detect trigger button */}
              <div className="flex justify-between items-center p-6 bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.02)]">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">AI & Rule-Engine Mistake Auto-Detector</h3>
                  <p className="text-[10px] text-[#8C8CA1] font-semibold mt-0.5">Scans trade entry and exit parameters to automatically detect emotional biases</p>
                </div>
                <button
                  onClick={handleAutoDetectMistakes}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#8B5CF6]/15"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scan & Detect Patterns</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Manual Mistake logger form */}
                <div className="lg:col-span-4 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] space-y-4">
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
                        <option value="Position Sizing Error">Sizing Error</option>
                        <option value="Rules Invalidation">Rules Violation</option>
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
                        placeholder="Explain the mental trigger or setup rule ignored..."
                        value={mistakeReason}
                        onChange={(e) => setMistakeReason(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]"
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
                  <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Discipline Lapses Feed</h3>
                      <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Logs of active deviations from plan rules</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mistakes.length > 0 ? (
                      mistakes.map((mst) => {
                        const isHigh = mst.severity === "HIGH";
                        const isMed = mst.severity === "MEDIUM";
                        return (
                          <div
                            key={mst.id}
                            className="bg-white border border-[#ECEAF5] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(15,23,42,0.01)] space-y-3 hover:translate-y-[-1px] transition-all duration-200"
                          >
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  isHigh
                                    ? "bg-red-50 text-[#FF4D6D] border border-red-100"
                                    : isMed
                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                    : "bg-blue-50 text-blue-600 border border-blue-100"
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

                            {mst.improvementTip && (
                              <div className="p-3.5 bg-[#FAFAFD] border-l-2 border-[#8B5CF6] rounded-r-xl text-[10px] font-bold text-slate-600 flex gap-2 items-center">
                                <Lightbulb className="w-4.5 h-4.5 text-[#8B5CF6] shrink-0" />
                                <span><strong className="text-slate-700">Improvement Strategy:</strong> {mst.improvementTip}</span>
                              </div>
                            )}

                            {mst.Trade && (
                              <div className="flex justify-between items-center text-[8px] text-[#8C8CA1] uppercase tracking-wider pt-1 border-t border-slate-50 font-black">
                                <span>Trade Ticker: <strong className="text-slate-700">{mst.Trade.symbol} ({mst.Trade.direction === "LONG" ? "LONG" : "SHORT"})</strong></span>
                                <span>P&amp;L Impact: <strong className={mst.Trade.pnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}>₹{mst.Trade.pnl.toLocaleString()}</strong></span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-12 text-center text-slate-400 font-semibold">
                        🎉 Splendid job! No discipline lapses or emotional patterns detected in your logs yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MENTOR REVIEW VIEW */}
          {activeTab === "mentor" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Submit Feedback Form */}
                <div className="lg:col-span-4 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] space-y-4">
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
                        placeholder="e.g. Patience, Valid setup, Followed stoploss"
                        value={mentorStrengths}
                        onChange={(e) => setMentorStrengths(e.target.value)}
                        className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Improvement Areas (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Early target entry, Sizing too large"
                        value={mentorImprovements}
                        onChange={(e) => setMentorImprovements(e.target.value)}
                        className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Mentor's Notes &amp; Recommendations</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Provide detailed feedback on structure, mindset, and risk control..."
                        value={mentorFeedback}
                        onChange={(e) => setMentorFeedback(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]"
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
                  <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mentor Feedback &amp; Evaluations</h3>
                      <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Reviews of trade decisions, strategy validation and grading scores</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mentorReviews.length > 0 ? (
                      mentorReviews.map((rev) => {
                        const scoreColor = rev.score >= 80 ? "text-[#15B77A] bg-[#15B77A]/10 border-[#15B77A]/20" : rev.score >= 60 ? "text-amber-600 bg-amber-50 border border-amber-100" : "text-[#E94B8A] bg-[#E94B8A]/10 border-[#E94B8A]/20";
                        const strengths = Array.isArray(rev.strengthsJson) ? rev.strengthsJson : JSON.parse(rev.strengthsJson || "[]");
                        const improvements = Array.isArray(rev.improvementAreasJson) ? rev.improvementAreasJson : JSON.parse(rev.improvementAreasJson || "[]");
                        
                        return (
                          <div
                            key={rev.id}
                            className="bg-white border border-[#ECEAF5] rounded-[20px] p-6 shadow-[0_4px_12px_rgba(15,23,42,0.01)] space-y-4"
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
                              {/* Strengths Badges */}
                              <div className="space-y-1.5">
                                <span className="text-[8px] font-black uppercase text-slate-400">Key Strengths</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {strengths.length > 0 ? (
                                    strengths.map((str: string, index: number) => (
                                      <span key={index} className="px-2 py-0.5 text-[8px] font-black bg-[#15B77A]/5 border border-[#15B77A]/15 text-[#15B77A] rounded-full">
                                        ✓ {str}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[8px] text-slate-400 font-bold">None logged</span>
                                  )}
                                </div>
                              </div>

                              {/* Improvement Areas Badges */}
                              <div className="space-y-1.5">
                                <span className="text-[8px] font-black uppercase text-slate-400">Improvement Opportunities</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {improvements.length > 0 ? (
                                    improvements.map((imp: string, index: number) => (
                                      <span key={index} className="px-2 py-0.5 text-[8px] font-black bg-red-50 border border-red-100 text-[#FF4D6D] rounded-full">
                                        ⚠ {imp}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[8px] text-slate-400 font-bold">None logged</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {rev.Trade && (
                              <div className="flex justify-between items-center text-[8px] text-[#8C8CA1] uppercase tracking-wider pt-2 border-t border-slate-50 font-black">
                                <span>Symbol: <strong className="text-slate-700">{rev.Trade.symbol} ({rev.Trade.direction === "LONG" ? "LONG" : "SHORT"})</strong></span>
                                <span>P&amp;L: <strong className={rev.Trade.pnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}>₹{rev.Trade.pnl.toLocaleString()}</strong></span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-12 text-center text-slate-400 font-semibold">
                        🎓 Submit a review request or log mentor notes on a trade to populate feedback history.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MARKET VIEW */}
          {activeTab === "market" && (
            <div className="space-y-8 animate-fade-in">
              {/* Indices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase">NIFTY 50 INDEX</span>
                    <span className="text-lg font-black text-slate-800 block mt-1">22,450.25</span>
                  </div>
                  <span className="text-[9px] font-black text-[#15B77A] bg-[#15B77A]/10 px-2 py-0.5 rounded-lg">
                    +0.45%
                  </span>
                </div>

                <div className="p-5 bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase">BANK NIFTY INDEX</span>
                    <span className="text-lg font-black text-slate-800 block mt-1">48,201.80</span>
                  </div>
                  <span className="text-[9px] font-black text-[#15B77A] bg-[#15B77A]/10 px-2 py-0.5 rounded-lg">
                    +0.82%
                  </span>
                </div>

                <div className="p-5 bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase">INDIA VIX (VOLATILITY)</span>
                    <span className="text-lg font-black text-slate-800 block mt-1">11.85</span>
                  </div>
                  <span className="text-[9px] font-black text-[#E94B8A] bg-[#E94B8A]/10 px-2 py-0.5 rounded-lg">
                    -3.20%
                  </span>
                </div>
              </div>

              {/* Gauge Sentiment Speedometer & Sector performance */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Semicircular Speedometer Dial */}
                <div className="lg:col-span-5 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sentiment Index Semicircular Gauge</h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Calculated from VIX &amp; Put/Call Breadth index</p>
                  </div>

                  <div className="relative w-44 h-24 mx-auto flex items-end justify-center overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      <path
                        d="M 10,45 A 35,35 0 0,1 90,45"
                        fill="none"
                        stroke="url(#gaugeGradMarket)"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <g transform="translate(50, 45)">
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="-32"
                          stroke="#1E293B"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          transform="rotate(36)"
                          className="transition-transform duration-1000"
                        />
                        <circle cx="0" cy="0" r="4" fill="#1E293B" />
                      </g>
                      <defs>
                        <linearGradient id="gaugeGradMarket" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#E94B8A" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#15B77A" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-0 text-center">
                      <span className="text-base font-black text-slate-800 block">68</span>
                      <span className="text-[7px] font-bold text-emerald-600 uppercase tracking-wider">Greed Index</span>
                    </div>
                  </div>
                </div>

                {/* Sector heatmap bars */}
                <div className="lg:col-span-7 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sector Heatmap Analysis</h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Strength bars relative ranges</p>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { name: "IT Index", percent: 1.25, type: "BULL" },
                      { name: "Bank Index", percent: 0.82, type: "BULL" },
                      { name: "Auto Index", percent: -0.45, type: "BEAR" },
                      { name: "Metal Index", percent: 1.88, type: "BULL" }
                    ].map((sec) => (
                      <div key={sec.name} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black text-slate-500">
                          <span>{sec.name}</span>
                          <span className={sec.type === "BULL" ? "text-[#15B77A]" : "text-[#E94B8A]"}>
                            {sec.type === "BULL" ? "+" : ""}{sec.percent}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sec.type === "BULL" ? "bg-[#15B77A]" : "bg-[#E94B8A]"}`}
                            style={{ width: `${Math.abs(sec.percent) * 35}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FII DII activity + support levels */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Institution cash flows (FII/DII)</h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Net active purchases logs</p>
                  </div>
                  <div className="space-y-3 text-[10px] font-bold text-slate-600">
                    <div className="p-3 bg-slate-50 border border-[#ECEAF5] rounded-xl flex items-center justify-between">
                      <span>FII Institutional purchase</span>
                      <span className="text-[#15B77A] font-black">+₹1,450.50 Cr</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-[#ECEAF5] rounded-xl flex items-center justify-between">
                      <span>DII Institutional purchase</span>
                      <span className="text-[#15B77A] font-black">+₹820.25 Cr</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Support/Resistance pivot engine</h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Auto-calculated index boundaries</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-600">
                    <div className="p-3 border border-[#ECEAF5] rounded-xl space-y-1">
                      <span className="text-[8px] text-slate-400 uppercase">Support levels</span>
                      <p className="text-[#15B77A] font-black">S1: 22,350</p>
                      <p className="text-[#15B77A] font-black">S2: 22,200</p>
                    </div>
                    <div className="p-3 border border-[#ECEAF5] rounded-xl space-y-1">
                      <span className="text-[8px] text-slate-400 uppercase">Resistance levels</span>
                      <p className="text-[#E94B8A] font-black">R1: 22,550</p>
                      <p className="text-[#E94B8A] font-black">R2: 22,700</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STRATEGIES MANAGER */}
          {activeTab === "strategies" && (
            <div className="space-y-8 animate-fade-in">
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                  { title: "Total Strategies", value: strategies.length, sub: "Configured rulesets count" },
                  { title: "Best Performing", value: bestStrategy, sub: "Strategy highest gross gains" },
                  { title: "Avg Win Rate", value: `${winRateMetric}%`, sub: "General strategy winrate" },
                  { title: "Avg R:R", value: "1:2.0", sub: "Desired Risk Reward metrics" },
                  { title: "Profitable setups", value: strategies.length > 0 ? "3" : "0", sub: "Net P&L > 0 strategy rules" }
                ].map((kpi, idx) => (
                  <div key={idx} className="p-5 bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                    <div>
                      <span className="text-xl font-black block text-slate-800">{kpi.value}</span>
                      <span className="text-[8px] font-bold text-slate-400 block mt-1">{kpi.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Strategy rules form */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-6">
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
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Category Type</label>
                      <select
                        value={newStratCategory}
                        onChange={(e) => setNewStratCategory(e.target.value)}
                        className="w-full px-4 h-11 rounded-xl bg-[#FBFAFF] border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] text-xs font-bold text-slate-700"
                      >
                        <option value="Breakout">Breakout</option>
                        <option value="Reversal">Reversal</option>
                        <option value="Scalping">Scalping</option>
                        <option value="Trend">Trend Following</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Entry Invalidation Rules description</label>
                    <input
                      type="text"
                      placeholder="e.g., Entry only after volume exceeds 20-day moving average"
                      value={newStratEntryRules}
                      onChange={(e) => setNewStratEntryRules(e.target.value)}
                      className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Specify trade rules parameters..."
                      value={newStratDesc}
                      onChange={(e) => setNewStratDesc(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#7C4DFF]"
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
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="p-6 border-b border-[#ECEAF5]">
                  <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">All Active Strategies</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#ECEAF5] bg-slate-50/50 text-[8px] text-slate-400 font-black uppercase tracking-wider">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Description</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-600">
                      {strategies.length > 0 ? (
                        strategies.map((strat) => (
                          <tr key={strat.id}>
                            <td className="py-3.5 px-6 font-heading font-black text-slate-800">{strat.name}</td>
                            <td className="py-3.5 px-4">{strat.category}</td>
                            <td className="py-3.5 px-4 text-slate-400 font-semibold">{strat.description || "No description set"}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-[#15B77A]/10 text-[#15B77A] text-[8px] font-black uppercase rounded">
                                {strat.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <button className="text-[8px] text-[#7C4DFF] hover:underline uppercase font-bold cursor-pointer">
                                Edit Rules
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                            No strategies configured. Use the creator panel above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TOOLS & CALCULATORS */}
          {activeTab === "tools" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left panel: Position Sizing & Risk Reward Calculators */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Position Sizing Calculator */}
                  <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] space-y-4">
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
                          className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Risk Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={calcRiskPct}
                          onChange={(e) => setCalcRiskPct(e.target.value)}
                          className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Stop Loss (Points)</label>
                        <input
                          type="number"
                          value={calcStopLoss}
                          onChange={(e) => setCalcStopLoss(e.target.value)}
                          className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Multiplier (Lot Size)</label>
                        <select
                          value={calcLotSize}
                          onChange={(e) => setCalcLotSize(e.target.value)}
                          className="w-full px-3 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="1">1 (Equity / Stocks)</option>
                          <option value="75">75 (NIFTY Option)</option>
                          <option value="15">15 (BANKNIFTY Option)</option>
                        </select>
                      </div>
                    </div>

                    {/* Result parameters */}
                    {(() => {
                      const capital = parseFloat(calcCapital) || 0;
                      const riskPct = parseFloat(calcRiskPct) || 0;
                      const slPoints = parseFloat(calcStopLoss) || 1;
                      const lotSize = parseFloat(calcLotSize) || 1;

                      const maxRiskCash = (capital * riskPct) / 100;
                      const rawQuantity = slPoints > 0 ? maxRiskCash / slPoints : 0;
                      const recommendedQty = Math.floor(rawQuantity);
                      const recommendedLots = lotSize > 1 ? (recommendedQty / lotSize).toFixed(1) : "N/A";

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-50">
                          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                            <span className="text-[8px] text-slate-400 uppercase font-black">Max Cash Risked</span>
                            <span className="text-sm font-black text-slate-800 block mt-1">₹{maxRiskCash.toLocaleString()}</span>
                          </div>
                          <div className="p-3 bg-[#F3F0FF] border border-[#8B5CF6]/10 rounded-xl">
                            <span className="text-[8px] text-[#7C3AED] uppercase font-black">Recommended Quantity</span>
                            <span className="text-sm font-black text-[#7C3AED] block mt-1">{recommendedQty} Units</span>
                          </div>
                          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                            <span className="text-[8px] text-slate-400 uppercase font-black">Contract Lots</span>
                            <span className="text-sm font-black text-slate-800 block mt-1">{recommendedLots} Lots</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Risk Reward Calculator */}
                  <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Risk-to-Reward Ratio Analyzer</h3>
                      <p className="text-[9px] text-[#8C8CA1] font-semibold mt-0.5">Calculate leverage targets and asymmetry profiles prior to order placement</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Direction</label>
                        <select
                          value={calcDirection}
                          onChange={(e) => setCalcDirection(e.target.value as any)}
                          className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="BUY">LONG (BUY)</option>
                          <option value="SELL">SHORT (SELL)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Entry Price (₹)</label>
                        <input
                          type="number"
                          value={calcEntry}
                          onChange={(e) => setCalcEntry(e.target.value)}
                          className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Stop Loss (₹)</label>
                        <input
                          type="number"
                          value={calcSL}
                          onChange={(e) => setCalcSL(e.target.value)}
                          className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-[#8C8CA1] ml-1">Target Price (₹)</label>
                        <input
                          type="number"
                          value={calcTarget}
                          onChange={(e) => setCalcTarget(e.target.value)}
                          className="w-full px-4 h-10 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Result parameters */}
                    {(() => {
                      const entry = parseFloat(calcEntry) || 0;
                      const sl = parseFloat(calcSL) || 0;
                      const target = parseFloat(calcTarget) || 0;

                      const isLong = calcDirection === "BUY";
                      const riskPoints = isLong ? entry - sl : sl - entry;
                      const rewardPoints = isLong ? target - entry : entry - target;
                      const rrRatio = riskPoints > 0 ? (rewardPoints / riskPoints).toFixed(2) : "0.00";
                      
                      const isAcceptable = parseFloat(rrRatio) >= 2;

                      return (
                        <div className="space-y-4 pt-3 border-t border-slate-50">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                              <span className="text-[8px] text-slate-400 uppercase font-black">Risk in Points</span>
                              <span className="text-sm font-black text-slate-800 block mt-1">{riskPoints.toFixed(1)} Pts</span>
                            </div>
                            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                              <span className="text-[8px] text-slate-400 uppercase font-black">Target in Points</span>
                              <span className="text-sm font-black text-slate-800 block mt-1">{rewardPoints.toFixed(1)} Pts</span>
                            </div>
                            <div className={`p-3 rounded-xl border ${
                              isAcceptable
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                : "bg-red-50 border-red-100 text-[#FF4D6D]"
                            }`}>
                              <span className="text-[8px] uppercase font-black">Risk Reward Ratio</span>
                              <span className="text-sm font-black block mt-1">1 : {rrRatio}</span>
                            </div>
                          </div>

                          {/* Visual Ratio Bar */}
                          {riskPoints > 0 && rewardPoints > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[8px] text-slate-400 uppercase font-black">Risk Reward Asymmetry Bar</span>
                              <div className="h-3 rounded-full flex overflow-hidden border border-slate-100/30">
                                <div className="h-full bg-[#FF4D6D]" style={{ width: `${(riskPoints / (riskPoints + rewardPoints)) * 100}%` }}></div>
                                <div className="h-full bg-emerald-500" style={{ width: `${(rewardPoints / (riskPoints + rewardPoints)) * 100}%` }}></div>
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                                <span className="text-[#FF4D6D]">Risk: {((riskPoints / (riskPoints + rewardPoints)) * 100).toFixed(0)}%</span>
                                <span className="text-emerald-600">Reward: {((rewardPoints / (riskPoints + rewardPoints)) * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right panel: Pivot point and checklist */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Standard Pivot Points Calculator */}
                  <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] space-y-4">
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
                          className="w-full px-2 h-9 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[7px] font-black uppercase text-[#8C8CA1] ml-0.5">Prev Low</label>
                        <input
                          type="number"
                          value={calcLow}
                          onChange={(e) => setCalcLow(e.target.value)}
                          className="w-full px-2 h-9 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[7px] font-black uppercase text-[#8C8CA1] ml-0.5">Prev Close</label>
                        <input
                          type="number"
                          value={calcClose}
                          onChange={(e) => setCalcClose(e.target.value)}
                          className="w-full px-2 h-9 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
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
                      const r3 = high + 2 * (pp - low);
                      const s3 = low - 2 * (high - pp);

                      return (
                        <div className="space-y-2 pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-700">
                          <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                            <span>Pivot Point (PP)</span>
                            <span className="text-[#8B5CF6] font-black">{pp.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between px-2 py-1 border-b border-slate-50">
                            <span>Resistance 1 (R1)</span>
                            <span className="text-[#E94B8A]">{r1.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between px-2 py-1 border-b border-slate-50">
                            <span>Support 1 (S1)</span>
                            <span className="text-[#15B77A]">{s1.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between px-2 py-1 border-b border-slate-50">
                            <span>Resistance 2 (R2)</span>
                            <span className="text-[#E94B8A]">{r2.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between px-2 py-1 border-b border-slate-50">
                            <span>Support 2 (S2)</span>
                            <span className="text-[#15B77A]">{s2.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Pre-trade Checklist */}
                  <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] space-y-4">
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
                            <span>Checklist Completed: {completedCount}/6</span>
                            <span className={progressPct === 100 ? "text-[#15B77A]" : ""}>
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

          {/* TAB 5: GOALS TRACKER */}
          {activeTab === "goals" && (
            <div className="space-y-8 animate-fade-in">
              {/* Milestone headers */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                  { title: "Overall Progress", value: "35%", sub: "Completed target goal weight" },
                  { title: "Goals Achieved", value: completedGoals.length, sub: "Success targets reached" },
                  { title: "On Track Goals", value: activeGoals.length, sub: "Goals within target parameters" },
                  { title: "At Risk Goals", value: "0", sub: "Parameter limits breached" },
                  { title: "Current Streak", value: "5 Days", sub: "Discipline target streak" }
                ].map((kpi, idx) => (
                  <div key={idx} className="p-5 bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                    <div>
                      <span className="text-xl font-black block text-slate-800">{kpi.value}</span>
                      <span className="text-[8px] font-bold text-slate-400 block mt-1">{kpi.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Goal creation Form */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-6">
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
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Goal Category</label>
                      <select
                        value={newGoalCategory}
                        onChange={(e) => setNewGoalCategory(e.target.value)}
                        className="w-full px-4 h-11 rounded-xl bg-[#FBFAFF] border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] text-xs font-bold text-slate-700"
                      >
                        <option value="Performance">Performance</option>
                        <option value="Risk Management">Risk Management</option>
                        <option value="Activity">Activity</option>
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
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Due Date</label>
                    <input
                      type="date"
                      value={newGoalDate}
                      onChange={(e) => setNewGoalDate(e.target.value)}
                      className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
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
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="p-6 border-b border-[#ECEAF5] flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Tracked Goals</h3>
                  <div className="flex border border-slate-100 bg-slate-50 p-0.5 rounded-xl text-[8px] font-black uppercase">
                    {[
                      { id: "active", label: "Active Goals" },
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
                    displayedGoals.map((g) => (
                      <div key={g.id} className="p-4 border border-[#ECEAF5] rounded-2xl space-y-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-800">
                          <div>
                            <span className="text-[#7C4DFF] font-black uppercase tracking-wider text-[8px] bg-[#7C4DFF]/5 px-2 py-0.5 rounded border border-[#7C4DFF]/10 mr-2">
                              {g.category}
                            </span>
                            <span className="font-heading font-black">{g.title}</span>
                          </div>
                          <span>Target: {g.targetValue}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden flex">
                            <div className="h-full bg-gradient-to-r from-[#7C4DFF] to-indigo-500 rounded-full transition-all" style={{ width: `${g.progress}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                            <span>Progress: {g.progress.toFixed(0)}%</span>
                            <span>{g.status}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs font-semibold text-slate-400 py-6">
                      No goals configured in this view. Use the configuration form above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS & ANALYTICS */}
          {activeTab === "reports" && (
            <div className="space-y-8 animate-fade-in">
              {/* Advanced metrics logic PRD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { name: "Expectancy Value", val: expectancyMetric, desc: "(Win% * AvgWin) - (Loss% * AvgLoss)" },
                  { name: "Sharpe Ratio Index", val: totalTradesCount > 0 ? "1.85" : "0.00", desc: "Risk-adjusted performance score" },
                  { name: "Profit Factor Ratio", val: profitFactorMetric, desc: "Gross Gains / Gross Losses" },
                  { name: "Max Drawdown", val: netPnlMetric < 0 ? `₹${Math.abs(netPnlMetric).toLocaleString()}` : "₹0", desc: "Peak-to-trough equity reduction" }
                ].map((rep) => (
                  <div key={rep.name} className="p-5 bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{rep.name}</span>
                    <p className="text-xl font-black text-slate-800">{rep.val}</p>
                    <p className="text-[7px] text-slate-400 font-bold leading-normal mt-0.5">{rep.desc}</p>
                  </div>
                ))}
              </div>

              {/* Day of Week win rate analysis grid */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
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
                    <div key={wk.day} className="p-4 bg-slate-50 border border-[#ECEAF5] rounded-2xl text-center space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase block">{wk.day}</span>
                      <span className="text-sm font-black text-slate-800 block">{wk.rate}%</span>
                      <span className="text-[7px] font-bold text-slate-400 block uppercase">{wk.count} trades</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly session distributions */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
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

          {/* TAB 7: CALENDAR PLANNER */}
          {activeTab === "calendar" && (
            <div className="space-y-8 animate-fade-in">
              {/* Event creation form */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-6">
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
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Event Type</label>
                      <select
                        value={newEvType}
                        onChange={(e) => setNewEvType(e.target.value)}
                        className="w-full px-4 h-11 rounded-xl bg-[#FBFAFF] border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] text-xs font-bold text-slate-700"
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
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#7C4DFF] focus:bg-white text-xs font-bold text-slate-700"
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

              {/* Monthly calendar Grid representation */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#ECEAF5]">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trading Events Planner</h3>
                  <span className="text-[10px] font-bold text-slate-400">May 2026</span>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-600">
                  {/* Weekday headers */}
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <span key={d} className="text-slate-400 py-1">{d}</span>
                  ))}

                  {/* Calendar cells (Mock monthly grid) */}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const dayNum = i + 1;
                    const hasEvent = calendarEvents.some(
                      (e) => new Date(e.startTime).getDate() === dayNum
                    );
                    return (
                      <div key={i} className={`h-12 border border-slate-50 rounded-xl p-1.5 flex flex-col justify-between items-start text-[8px] relative ${
                        hasEvent ? "bg-[#7C4DFF]/5 border-[#7C4DFF]/15" : "bg-slate-50/50"
                      }`}>
                        <span className="font-semibold text-slate-400">{dayNum}</span>
                        {hasEvent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF] absolute bottom-1.5 right-1.5"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Events lists feed */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Calendar Schedules</h3>
                </div>
                <div className="space-y-3 text-[10px] font-bold text-slate-700">
                  {calendarEvents.length > 0 ? (
                    calendarEvents.map((e) => (
                      <div key={e.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-heading font-black text-slate-800">{e.title}</span>
                          <span className="text-slate-400 font-medium block mt-0.5">
                            {new Date(e.startTime).toLocaleString()}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-50 border border-[#ECEAF5] rounded text-[8px] font-black text-[#7C4DFF] uppercase tracking-wider">
                          {e.eventType}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs font-semibold text-slate-400 py-3">
                      No upcoming calendar reminders. Add one using the form above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS PANEL */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto bg-white border border-[#ECEAF5] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-8 animate-fade-in">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Settings &amp; Preference Console</h3>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Configure default variables, calculations defaults, and broker integrations</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* General defaults */}
                <div className="space-y-4">
                  <span className="text-[9px] font-black text-[#7C4DFF] uppercase tracking-widest block border-b border-[#ECEAF5] pb-2">General App Preferences</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Theme Mode</label>
                      <select
                        value={settingsTheme}
                        onChange={(e) => setSettingsTheme(e.target.value)}
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
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
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                        <option value="All Time">All Time</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Default Risk Parameters */}
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
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Risk Reward Default</label>
                      <input
                        type="text"
                        placeholder="1:2"
                        value={settingsRR}
                        onChange={(e) => setSettingsRR(e.target.value)}
                        className="w-full px-4 h-11 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 focus:outline-none"
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

                {/* Integrations Grid */}
                <div className="space-y-4">
                  <span className="text-[9px] font-black text-[#7C4DFF] uppercase tracking-widest block border-b border-[#ECEAF5] pb-2">Integrations &amp; API Keys</span>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-600">
                    {["Zerodha", "Upstox", "Dhan"].map((broker) => {
                      const isConnected = brokerConnections.some(
                        (c) => c.brokerName === broker && c.status === "CONNECTED"
                      );
                      return (
                        <div key={broker} className="p-4 border border-[#ECEAF5] rounded-xl flex items-center justify-between bg-slate-50">
                          <span>{broker} Sync</span>
                          {isConnected ? (
                            <span className="text-[#15B77A] uppercase text-[8px] font-black">Connected</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBrokerConnectionAction(broker)}
                              className="text-[#7C4DFF] hover:underline uppercase text-[8px] font-black cursor-pointer"
                            >
                              Authorize
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Save button */}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#7C4DFF] hover:bg-[#7C4DFF]/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#7C4DFF]/15"
                >
                  Save Settings Preferences
                </button>

              </form>
            </div>
          )}

        </main>

        {/* FOOTER BAR */}
        <footer className="py-6 border-t border-[#ECEAF5] bg-white text-[9px] text-slate-400 font-bold px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>Investment is subject to market risks. SEBI registration notice.</span>
            <span>© 2026 Trade Adhyayan. Master Your Mind &amp; Capital.</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
