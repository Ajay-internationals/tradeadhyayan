// lib/brokers/adapter.interface.ts

export type NormalizedExecution = {
  brokerName: string;
  brokerOrderId: string;
  brokerTradeId?: string;

  symbol: string;
  exchange: string;
  segment: string;
  productType: string;

  transactionType: "BUY" | "SELL";
  quantity: number;
  price: number;

  orderTime: string;
  tradeTime: string;
  status: string; // "COMPLETE" | "TRADED" | "FILLED" | "EXECUTED"
};

export interface BrokerToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface BrokerConnectionData {
  clientId?: string | null;
  apiKey?: string | null;
  accessTokenEncrypted?: string | null;
  refreshTokenEncrypted?: string | null;
  brokerName: string;
}

export type NormalizedOrder = {
  brokerName: string;
  brokerOrderId: string;
  symbol: string;
  exchange: string;
  transactionType: "BUY" | "SELL";
  productType: string;
  quantity: number;
  price: number;
  status: string; // "PENDING", "EXECUTED", "CANCELLED", "REJECTED"
  orderTime: string;
};

export type NormalizedPosition = {
  brokerName: string;
  symbol: string;
  exchange: string;
  productType: string;
  quantity: number;
  averagePrice: number;
  mtm: number;
  realizedPnl: number;
  unrealizedPnl: number;
};

export type NormalizedHolding = {
  brokerName: string;
  symbol: string;
  exchange: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
};

export interface BrokerAdapter {
  brokerName: string;

  generateLoginUrl(userId: string, origin?: string): Promise<string>;

  exchangeToken(authCode: string, userId: string, origin?: string): Promise<BrokerToken>;

  fetchOrders(connection: BrokerConnectionData): Promise<NormalizedOrder[]>;

  fetchTrades(connection: BrokerConnectionData): Promise<NormalizedExecution[]>;

  fetchPositions(connection: BrokerConnectionData): Promise<NormalizedPosition[]>;

  fetchHoldings(connection: BrokerConnectionData): Promise<NormalizedHolding[]>;

  fetchFunds(connection: BrokerConnectionData): Promise<any | null>;
}
