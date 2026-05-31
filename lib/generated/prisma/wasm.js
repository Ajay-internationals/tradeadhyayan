
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AIInsightScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  insightType: 'insightType',
  inputHash: 'inputHash',
  content: 'content',
  tokensUsed: 'tokensUsed',
  costEstimate: 'costEstimate',
  createdAt: 'createdAt'
};

exports.Prisma.BrokerConnectionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  brokerName: 'brokerName',
  status: 'status',
  accessTokenEncrypted: 'accessTokenEncrypted',
  refreshTokenEncrypted: 'refreshTokenEncrypted',
  tokenExpiry: 'tokenExpiry',
  lastSyncAt: 'lastSyncAt',
  autoSyncEnabled: 'autoSyncEnabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CalendarEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventType: 'eventType',
  title: 'title',
  startTime: 'startTime',
  status: 'status'
};

exports.Prisma.DailyAnalyticsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  totalTrades: 'totalTrades',
  winningTrades: 'winningTrades',
  losingTrades: 'losingTrades',
  totalPnl: 'totalPnl',
  winRate: 'winRate',
  avgWin: 'avgWin',
  avgLoss: 'avgLoss',
  profitFactor: 'profitFactor',
  avgRR: 'avgRR',
  mistakeCount: 'mistakeCount',
  disciplineScore: 'disciplineScore',
  tradeQualityScore: 'tradeQualityScore',
  createdAt: 'createdAt'
};

exports.Prisma.GoalScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  category: 'category',
  targetValue: 'targetValue',
  currentValue: 'currentValue',
  progress: 'progress',
  status: 'status',
  targetDate: 'targetDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ManualImportBatchScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sourceType: 'sourceType',
  totalRows: 'totalRows',
  validRows: 'validRows',
  invalidRows: 'invalidRows',
  createdAt: 'createdAt'
};

exports.Prisma.MarketSnapshotScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  score: 'score',
  marketBias: 'marketBias',
  marketType: 'marketType',
  trendProbability: 'trendProbability',
  resistance: 'resistance',
  support: 'support',
  executionStrategy: 'executionStrategy',
  macroIndicators: 'macroIndicators',
  flowIndicators: 'flowIndicators',
  structureIndicators: 'structureIndicators',
  createdAt: 'createdAt'
};

exports.Prisma.MentorReviewScalarFieldEnum = {
  id: 'id',
  mentorId: 'mentorId',
  studentId: 'studentId',
  tradeId: 'tradeId',
  score: 'score',
  feedback: 'feedback',
  strengthsJson: 'strengthsJson',
  improvementAreasJson: 'improvementAreasJson',
  createdAt: 'createdAt'
};

exports.Prisma.MistakeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tradeId: 'tradeId',
  mistakeType: 'mistakeType',
  severity: 'severity',
  reason: 'reason',
  estimatedLoss: 'estimatedLoss',
  improvementTip: 'improvementTip',
  detectedAutomatically: 'detectedAutomatically',
  confidenceScore: 'confidenceScore',
  detectionSource: 'detectionSource',
  userConfirmed: 'userConfirmed',
  reviewed: 'reviewed',
  createdAt: 'createdAt'
};

exports.Prisma.StrategyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  description: 'description',
  rulesJson: 'rulesJson',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  category: 'category'
};

exports.Prisma.SyncLogScalarFieldEnum = {
  id: 'id',
  connectionId: 'connectionId',
  dataType: 'dataType',
  recordsCount: 'recordsCount',
  status: 'status',
  errorMessage: 'errorMessage',
  createdAt: 'createdAt'
};

exports.Prisma.TradeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  brokerConnectionId: 'brokerConnectionId',
  source: 'source',
  symbol: 'symbol',
  instrumentType: 'instrumentType',
  optionType: 'optionType',
  expiryDate: 'expiryDate',
  direction: 'direction',
  entryTime: 'entryTime',
  exitTime: 'exitTime',
  entryPrice: 'entryPrice',
  exitPrice: 'exitPrice',
  quantity: 'quantity',
  stopLoss: 'stopLoss',
  target: 'target',
  setup: 'setup',
  strategyId: 'strategyId',
  result: 'result',
  pnl: 'pnl',
  charges: 'charges',
  netPnl: 'netPnl',
  rr: 'rr',
  mood: 'mood',
  notes: 'notes',
  screenshotUrl: 'screenshotUrl',
  followedPlan: 'followedPlan',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TradePlanScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tradeId: 'tradeId',
  plannedEntry: 'plannedEntry',
  plannedStopLoss: 'plannedStopLoss',
  plannedTarget: 'plannedTarget',
  maxRiskAmount: 'maxRiskAmount',
  maxRiskPercent: 'maxRiskPercent',
  maxTradesPerDay: 'maxTradesPerDay',
  allowedStartTime: 'allowedStartTime',
  allowedEndTime: 'allowedEndTime',
  checklistCompleted: 'checklistCompleted',
  createdAt: 'createdAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  passwordHash: 'passwordHash',
  timezone: 'timezone',
  currency: 'currency',
  plan: 'plan',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  initialCapital: 'initialCapital'
};

exports.Prisma.UserSettingScalarFieldEnum = {
  userId: 'userId',
  theme: 'theme',
  currency: 'currency',
  timezone: 'timezone',
  defaultRisk: 'defaultRisk',
  defaultRr: 'defaultRr',
  includeBrokerage: 'includeBrokerage',
  defaultDateRange: 'defaultDateRange',
  maxTradesPerDay: 'maxTradesPerDay',
  revengeTradeWindowMinutes: 'revengeTradeWindowMinutes',
  minRr: 'minRr',
  intradayCutoffTime: 'intradayCutoffTime',
  allowedEntryDeviationPercent: 'allowedEntryDeviationPercent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.BrokerStatus = exports.$Enums.BrokerStatus = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  FAILED: 'FAILED'
};

exports.GoalStatus = exports.$Enums.GoalStatus = {
  NOT_STARTED: 'NOT_STARTED',
  ON_TRACK: 'ON_TRACK',
  AT_RISK: 'AT_RISK',
  ACHIEVED: 'ACHIEVED'
};

exports.MistakeSeverity = exports.$Enums.MistakeSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

exports.InstrumentType = exports.$Enums.InstrumentType = {
  NIFTY: 'NIFTY',
  BANKNIFTY: 'BANKNIFTY',
  STOCK: 'STOCK',
  OPTION: 'OPTION',
  FUTURE: 'FUTURE'
};

exports.OptionType = exports.$Enums.OptionType = {
  CE: 'CE',
  PE: 'PE'
};

exports.TradeDirection = exports.$Enums.TradeDirection = {
  LONG: 'LONG',
  SHORT: 'SHORT'
};

exports.TradeResult = exports.$Enums.TradeResult = {
  WIN: 'WIN',
  LOSS: 'LOSS',
  BREAKEVEN: 'BREAKEVEN'
};

exports.Plan = exports.$Enums.Plan = {
  FREE: 'FREE',
  PRO: 'PRO',
  MENTOR: 'MENTOR'
};

exports.Prisma.ModelName = {
  AIInsight: 'AIInsight',
  BrokerConnection: 'BrokerConnection',
  CalendarEvent: 'CalendarEvent',
  DailyAnalytics: 'DailyAnalytics',
  Goal: 'Goal',
  ManualImportBatch: 'ManualImportBatch',
  MarketSnapshot: 'MarketSnapshot',
  MentorReview: 'MentorReview',
  Mistake: 'Mistake',
  Strategy: 'Strategy',
  SyncLog: 'SyncLog',
  Trade: 'Trade',
  TradePlan: 'TradePlan',
  User: 'User',
  UserSetting: 'UserSetting'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
