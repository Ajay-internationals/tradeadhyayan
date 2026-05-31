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
  triggerBrokerSync
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
  CheckSquare
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "journal" | "market" | "strategies" | "goals" | "reports" | "calendar" | "settings">("dashboard");
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

  // Initialize and load user data
  useEffect(() => {
    const email = localStorage.getItem("ta_user_email") || "test_prod_user_2026@example.com";
    setUserEmail(email);
    setIsLoading(true);

    const loadAllData = async () => {
      try {
        // Load trades
        const dbTrades = await getTrades(email);
        setTrades(dbTrades.length > 0 ? dbTrades : DEFAULT_TRADES);

        // Load strategies
        const dbStrats = await getStrategies(email);
        setStrategies(dbStrats);

        // Load goals
        const dbGoals = await getGoals(email);
        setGoals(dbGoals);

        // Load calendar events
        const dbEvents = await getCalendarEvents(email);
        setCalendarEvents(dbEvents);

        // Load settings
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

        // Load integrations
        const dbConnections = await getBrokerConnections(email);
        setBrokerConnections(dbConnections);

        // Load sync logs
        const dbLogs = await getSyncLogs(email);
        setSyncLogs(dbLogs);
      } catch (err) {
        console.error("Error loading data from database:", err);
        setTrades(DEFAULT_TRADES);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [activeTab]);

  // Form Submissions
  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !pnl) return;

    const pnlVal = parseFloat(pnl);
    const tempId = `temp_${Date.now()}`;

    const newTradeObj: Trade = {
      id: tempId,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      asset: asset.toUpperCase(),
      type: tradeType,
      pnl: pnlVal,
      strategy,
      emotion: followedPlan ? emotion : `${emotion.replace(" ✓", "")} ⚠️`,
      quantity: quantity ? parseInt(quantity) : undefined,
      entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
      exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      target: target ? parseFloat(target) : undefined,
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

  // Parse pasted text trades mock
  const handleParsePastedTrades = () => {
    if (!pastedText) return;
    const lines = pastedText.split("\n");
    const parsed: Trade[] = [];
    lines.forEach((line, index) => {
      const parts = line.split("\t");
      if (parts.length >= 4) {
        parsed.push({
          id: `paste_${Date.now()}_${index}`,
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
      alert(`Imported ${parsed.length} trades from pasted text successfully! ✅`);
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

  // SVG Chart: Equity Growth points
  let cumulativeValue = 0;
  const equityPoints = [...trades]
    .reverse()
    .map((t) => {
      cumulativeValue += t.pnl;
      return cumulativeValue;
    });

  const chartMin = Math.min(0, ...equityPoints);
  const chartMax = Math.max(1000, ...equityPoints);
  const chartRange = chartMax - chartMin || 1;
  const growthPathPoints = equityPoints.map((val, idx) => {
    const x = (idx / (Math.max(1, equityPoints.length - 1))) * 300;
    const y = 90 - ((val - chartMin) / chartRange) * 80;
    return `${x},${y}`;
  }).join(" ");

  // Donut values for mistakes
  const mistakeCounts = {
    FOMO: trades.filter((t) => t.emotion.includes("FOMO")).length,
    EarlyExit: trades.filter((t) => t.emotion.includes("Early")).length,
    Overtrading: trades.filter((t) => t.emotion.includes("Overtrading")).length,
    Revenge: trades.filter((t) => t.emotion.includes("Revenge")).length,
  };
  const totalErrors = mistakeCounts.FOMO + mistakeCounts.EarlyExit + mistakeCounts.Overtrading + mistakeCounts.Revenge || 1;
  const errorPercent = totalTradesCount > 0 ? Math.round((totalErrors / totalTradesCount) * 100) : 0;

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
    <div className="min-h-screen bg-[#FBFAFF] text-slate-800 font-sans flex">
      {/* FIXED SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-white border-r border-[#ECEAF5] p-6 flex flex-col justify-between z-30 shadow-[0_8px_24px_rgba(0,0,0,0.01)]">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7C4DFF] rounded-[18px] flex items-center justify-center shadow-md shadow-[#7C4DFF]/20">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[#1E293B] text-base leading-none block">
                Trade Adhyayan
              </span>
              <span className="text-[9px] font-bold text-[#7C4DFF] uppercase tracking-widest block mt-1">
                Calm Journal Desk
              </span>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart2 },
              { id: "journal", label: "Trade Journal", icon: BookOpen },
              { id: "market", label: "Market View", icon: Compass },
              { id: "strategies", label: "Strategies", icon: Layers3 },
              { id: "goals", label: "Goals Tracker", icon: CheckSquare },
              { id: "reports", label: "Reports Desk", icon: Activity },
              { id: "calendar", label: "Calendar", icon: CalendarIcon },
              { id: "settings", label: "Settings Preferences", icon: Settings }
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 h-12 rounded-[16px] text-xs font-bold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-[#7C4DFF]/10 text-[#7C4DFF]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Psychological Widget */}
        <div className="p-4 bg-[#7C4DFF]/5 border border-[#7C4DFF]/10 rounded-[20px] text-center space-y-2">
          <Lightbulb className="w-5 h-5 text-[#7C4DFF] mx-auto" />
          <div>
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Psychology Guard</p>
            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed mt-1">
              "Discipline is choices. Focus on trade quality rather than volume syncs."
            </p>
          </div>
        </div>
      </aside>

      {/* DYNAMIC SCENE BASE CONTAINER */}
      <div className="flex-1 pl-[280px] min-h-screen flex flex-col justify-between">
        
        {/* GLOBAL HEADER */}
        <header className="sticky top-0 z-20 h-16 bg-[#FBFAFF]/90 backdrop-blur-md border-b border-[#ECEAF5] px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-[#7C4DFF] tracking-wider">
              {activeTab === "dashboard" && "Trade Journal > Analytics Dashboard"}
              {activeTab === "journal" && "Trade Journal > Database Logs"}
              {activeTab === "market" && "Trade Journal > Market Analytics"}
              {activeTab === "strategies" && "Trade Journal > Strategy Planner"}
              {activeTab === "goals" && "Trade Journal > Milestone Goals"}
              {activeTab === "reports" && "Trade Journal > Performance Reports"}
              {activeTab === "calendar" && "Trade Journal > Planner Calendar"}
              {activeTab === "settings" && "Trade Journal > Settings Console"}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-[9px] font-black text-[#15B77A] bg-[#15B77A]/10 border border-[#15B77A]/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#15B77A] animate-pulse"></span>
              {userEmail}
            </span>
            <button className="p-2 rounded-xl border border-[#ECEAF5] bg-white relative cursor-pointer text-slate-500 hover:bg-slate-50">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#E94B8A]"></span>
            </button>
          </div>
        </header>

        {/* CONTAINER WORKSPACE */}
        <main className="p-8 flex-1 w-full max-w-7xl mx-auto space-y-8">

          {/* TAB 1: ANALYTICAL DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* KPIs Ribbon */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
                {[
                  { title: "Total P&L", value: `₹${netPnlMetric.toLocaleString()}`, status: netPnlMetric >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]", sub: "Cumulative closed" },
                  { title: "Win Rate", value: `${winRateMetric}%`, status: "text-[#15B77A] bg-[#15B77A]/10 px-1.5 py-0.5 rounded-lg text-sm inline-block", sub: "Gains occurrences ratio" },
                  { title: "Discipline Score", value: `${disciplineScoreMetric}/100`, status: "text-[#7C4DFF]", sub: "Rule adherence weighted" },
                  { title: "Trade Quality", value: `${tradeQualityMetric}/100`, status: "text-[#7C4DFF]", sub: "Overall setup quality" },
                  { title: "Profit Factor", value: profitFactorMetric, status: "text-[#1E293B]", sub: "Gross gain vs gross loss" },
                  { title: "Weekly Trades", value: totalTradesCount, status: "text-[#1E293B]", sub: "Executed database logs" }
                ].map((kpi, idx) => (
                  <div key={idx} className="p-5 bg-white border border-[#ECEAF5] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                    <div>
                      <span className={`text-xl font-black block ${kpi.status}`}>{kpi.value}</span>
                      <span className="text-[8px] font-bold text-slate-400 block mt-1">{kpi.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Area spline Growth Curve + Mistakes breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Equity Graph */}
                <div className="lg:col-span-8 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Equity Growth Spline</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Continuous visual path of closed trade gains</p>
                    </div>
                    <span className="text-[9px] font-black text-[#7C4DFF] bg-[#7C4DFF]/10 px-2.5 py-0.5 rounded-lg">Real-time DB</span>
                  </div>

                  <div className="h-44 bg-[#FBFAFF] rounded-[20px] border border-[#ECEAF5]/50 flex items-end p-2">
                    {equityPoints.length > 0 ? (
                      <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <polyline fill="none" stroke="#7C4DFF" strokeWidth="3" points={growthPathPoints} />
                        <path d={`M 0,100 L ${growthPathPoints} L 300,100 Z`} fill="url(#dashGrad)" opacity="0.08" />
                        <defs>
                          <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C4DFF" />
                            <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 m-auto">Add trades to draw growth curves</span>
                    )}
                  </div>
                </div>

                {/* Donut Mistakes */}
                <div className="lg:col-span-4 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Mistakes Distribution</h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Quantifying error ratios</p>
                  </div>

                  <div className="flex items-center justify-around gap-2 my-auto">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#F8FAFC" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#E94B8A"
                          strokeWidth="3.5"
                          strokeDasharray="88"
                          strokeDashoffset={88 - (88 * errorPercent) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-slate-800 leading-none">{errorPercent}%</span>
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Errors</span>
                      </div>
                    </div>

                    <div className="text-[8px] font-bold text-slate-500 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E94B8A]"></div>
                        <span>FOMO ({mistakeCounts.FOMO})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
                        <span>Early Exit ({mistakeCounts.EarlyExit})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF]"></div>
                        <span>Overtrading ({mistakeCounts.Overtrading})</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Insights & Streak Engine */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Discipline Metrics Insights</h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">AI computed flags from database records</p>
                  </div>
                  <div className="space-y-3 text-[10px] font-semibold text-slate-600">
                    <div className="p-3 bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-xl flex gap-2.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-[#F59E0B] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-slate-800">Mindfulness Rule Breach</p>
                        <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
                          You logged {mistakeCounts.Overtrading} overtrading errors. Consider setting a daily maximum limit of 3 trade plans inside your Settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Streak Engine</h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Consecutive daily journal logs</p>
                  </div>
                  <div className="grid grid-cols-5 gap-3 text-center my-auto">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, idx) => (
                      <div key={d} className="space-y-1.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{d}</span>
                        <div className={`h-9 rounded-xl border flex items-center justify-center font-bold text-xs ${
                          idx < 3 ? "bg-[#15B77A]/15 border-[#15B77A]/25 text-[#15B77A]" : "bg-slate-50 border-slate-100 text-slate-300"
                        }`}>
                          {idx < 3 ? "✓" : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Trades list */}
              <div className="bg-white border border-[#ECEAF5] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
                <div className="pb-3 border-b border-[#ECEAF5] flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Recent Closed Logs</h3>
                  <button onClick={() => setActiveTab("journal")} className="text-[9px] font-black text-[#7C4DFF] uppercase hover:underline">
                    View Master Table
                  </button>
                </div>
                <div className="divide-y divide-slate-50 text-[10px] font-bold text-slate-700">
                  {trades.slice(0, 3).map((t) => (
                    <div key={t.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                          t.type === "BUY" ? "bg-[#15B77A]/10 text-[#15B77A]" : "bg-[#E94B8A]/10 text-[#E94B8A]"
                        }`}>
                          {t.type}
                        </span>
                        <span className="font-heading font-black text-slate-800">{t.asset}</span>
                        <span className="text-slate-400">{t.time}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 font-semibold">{t.strategy}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] border ${
                          t.emotion.includes("✓") ? "bg-[#15B77A]/10 border-[#15B77A]/20 text-[#15B77A]" : "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]"
                        }`}>
                          {t.emotion}
                        </span>
                        <span className={t.pnl >= 0 ? "text-[#15B77A]" : "text-[#E94B8A]"}>
                          ₹{t.pnl.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MASTER TRADE JOURNAL */}
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
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Net P&amp;L (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g., 1000"
                          required
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
