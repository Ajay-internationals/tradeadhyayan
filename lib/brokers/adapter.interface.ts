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

export interface BrokerAdapter {
  brokerName: string;

  generateLoginUrl(userId: string): Promise<string>;

  exchangeToken(authCode: string, userId: string): Promise<BrokerToken>;

  fetchOrders(connection: BrokerConnectionData): Promise<any[]>;

  fetchTrades(connection: BrokerConnectionData): Promise<NormalizedExecution[]>;

  fetchPositions(connection: BrokerConnectionData): Promise<any[]>;

  fetchHoldings(connection: BrokerConnectionData): Promise<any[]>;

  fetchFunds(connection: BrokerConnectionData): Promise<any | null>;
}
