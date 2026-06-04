// lib/brokers/zerodha.adapter.ts

import { BrokerAdapter, BrokerConnectionData, BrokerToken, NormalizedExecution } from "./adapter.interface";

export class ZerodhaAdapter implements BrokerAdapter {
  brokerName = "Zerodha";

  async generateLoginUrl(userId: string): Promise<string> {
    // In a real scenario, this uses the apiKey from the connection config
    return `https://kite.zerodha.com/connect/login?v=3&api_key=SAMPLE_KEY`;
  }

  async exchangeToken(authCode: string, userId: string): Promise<BrokerToken> {
    // Mock exchange token
    return {
      accessToken: "mock-zerodha-access-token",
    };
  }

  async fetchOrders(connection: BrokerConnectionData): Promise<any[]> {
    return [];
  }

  async fetchTrades(connection: BrokerConnectionData): Promise<NormalizedExecution[]> {
    if (!connection.accessTokenEncrypted) {
      throw new Error("Not connected to Zerodha");
    }

    // Mock API call to Kite connect /portfolio/trades
    // Let's return some mock normalized executions based on real API structure
    return [
      {
        brokerName: this.brokerName,
        brokerOrderId: "order_12345",
        brokerTradeId: "trade_54321",
        symbol: "NIFTY24MAY22500CE",
        exchange: "NFO",
        segment: "OPTIONS",
        productType: "MIS",
        transactionType: "BUY",
        quantity: 50,
        price: 150.25,
        orderTime: new Date().toISOString(),
        tradeTime: new Date().toISOString(),
        status: "COMPLETE",
      },
      {
        brokerName: this.brokerName,
        brokerOrderId: "order_12346",
        brokerTradeId: "trade_54322",
        symbol: "NIFTY24MAY22500CE",
        exchange: "NFO",
        segment: "OPTIONS",
        productType: "MIS",
        transactionType: "SELL",
        quantity: 50,
        price: 180.50,
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
      availableBalance: 250000,
      utilizedMargin: 50000,
    };
  }
}
