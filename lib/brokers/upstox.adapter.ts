// lib/brokers/upstox.adapter.ts

import { BrokerAdapter, BrokerConnectionData, BrokerToken, NormalizedExecution } from "./adapter.interface";

export class UpstoxAdapter implements BrokerAdapter {
  brokerName = "Upstox";

  async generateLoginUrl(userId: string): Promise<string> {
    return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=SAMPLE_ID&redirect_uri=https://localhost:3000/api/broker/callback/upstox`;
  }

  async exchangeToken(authCode: string, userId: string): Promise<BrokerToken> {
    return {
      accessToken: "mock-upstox-access-token",
    };
  }

  async fetchOrders(connection: BrokerConnectionData): Promise<any[]> {
    return [];
  }

  async fetchTrades(connection: BrokerConnectionData): Promise<NormalizedExecution[]> {
    if (!connection.accessTokenEncrypted) {
      throw new Error("Not connected to Upstox");
    }

    return [
      {
        brokerName: this.brokerName,
        brokerOrderId: "ord_UP998",
        brokerTradeId: "trd_UP998",
        symbol: "RELIANCE",
        exchange: "NSE",
        segment: "EQ",
        productType: "INTRADAY",
        transactionType: "BUY",
        quantity: 100,
        price: 2900.50,
        orderTime: new Date().toISOString(),
        tradeTime: new Date().toISOString(),
        status: "COMPLETE",
      },
      {
        brokerName: this.brokerName,
        brokerOrderId: "ord_UP999",
        brokerTradeId: "trd_UP999",
        symbol: "RELIANCE",
        exchange: "NSE",
        segment: "EQ",
        productType: "INTRADAY",
        transactionType: "SELL",
        quantity: 100,
        price: 2915.20,
        orderTime: new Date().toISOString(),
        tradeTime: new Date().toISOString(),
        status: "COMPLETE",
      },
    ];
  }

  async fetchPositions(connection: BrokerConnectionData): Promise<any[]> {
    return [];
  }

  async fetchHoldings(connection: BrokerConnectionData): Promise<any[]> {
    return [];
  }

  async fetchFunds(connection: BrokerConnectionData): Promise<any | null> {
    return {
      availableBalance: 125000,
      utilizedMargin: 0,
    };
  }
}
