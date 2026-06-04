import crypto from "crypto";
import { BrokerAdapter, BrokerConnectionData, BrokerToken, NormalizedExecution, NormalizedOrder, NormalizedPosition, NormalizedHolding } from "./adapter.interface";

export class FyersAdapter implements BrokerAdapter {
  brokerName = "FYERS";

  private get appId() {
    return process.env.FYERS_APP_ID || "";
  }

  private get appSecret() {
    return process.env.FYERS_SECRET_KEY || "";
  }

  async generateLoginUrl(userId: string, origin?: string): Promise<string> {
    if (!this.appId) throw new Error("FYERS App ID not configured");
    const redirectUri = origin ? `${origin}/api/broker/fyers/callback` : "";
    return `https://api-t1.fyers.in/api/v3/generate-authcode?client_id=${this.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=sample`;
  }

  async exchangeToken(authCode: string, userId: string, origin?: string): Promise<BrokerToken> {
    if (!this.appId || !this.appSecret) {
      throw new Error("FYERS API keys not configured");
    }

    const appIdHash = crypto
      .createHash("sha256")
      .update(`${this.appId}:${this.appSecret}`)
      .digest("hex");

    const res = await fetch("https://api-t1.fyers.in/api/v3/validate-authcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        appIdHash: appIdHash,
        code: authCode
      })
    });

    const data = await res.json();
    if (data.s !== "ok") {
      throw new Error(data.message || "Failed to exchange FYERS token");
    }

    return {
      accessToken: data.access_token,
    };
  }

  async fetchOrders(connection: BrokerConnectionData): Promise<NormalizedOrder[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to FYERS");

    const res = await fetch("https://api-t1.fyers.in/api/v3/orders", {
      method: "GET",
      headers: {
        "Authorization": `${this.appId}:${connection.accessTokenEncrypted}`
      }
    });

    const data = await res.json();
    if (data.s !== "ok") throw new Error(data.message || "Failed to fetch orders");

    const rawOrders = data.orderBook || [];
    return rawOrders.map((o: any) => ({
      brokerName: this.brokerName,
      brokerOrderId: o.id,
      symbol: o.symbol,
      exchange: o.ex_sym || "NSE",
      transactionType: o.side === 1 ? "BUY" : "SELL",
      productType: o.productType,
      quantity: o.qty,
      price: o.tradedPrice || o.limitPrice || 0,
      status: o.status === 1 ? "CANCELLED" : o.status === 2 ? "EXECUTED" : o.status === 6 ? "PENDING" : "REJECTED",
      orderTime: o.orderDateTime,
    }));
  }

  async fetchTrades(connection: BrokerConnectionData): Promise<NormalizedExecution[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to FYERS");

    const res = await fetch("https://api-t1.fyers.in/api/v3/tradebook", {
      method: "GET",
      headers: {
        "Authorization": `${this.appId}:${connection.accessTokenEncrypted}`
      }
    });

    const data = await res.json();
    if (data.s !== "ok") throw new Error(data.message || "Failed to fetch trades");

    const rawTrades = data.tradeBook || [];
    
    return rawTrades.map((t: any) => ({
      brokerName: this.brokerName,
      brokerOrderId: t.orderNumber,
      brokerTradeId: t.id,
      symbol: t.symbol,
      exchange: t.exchange || "NSE",
      segment: t.symbol.includes("OPT") ? "OPTIONS" : "STOCK",
      productType: t.productType,
      transactionType: t.transactionType === 1 ? "BUY" : "SELL",
      quantity: t.tradedQty,
      price: t.tradePrice,
      orderTime: t.orderDateTime,
      tradeTime: t.tradeTime || t.orderDateTime,
      status: "COMPLETE",
    }));
  }

  async fetchPositions(connection: BrokerConnectionData): Promise<NormalizedPosition[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to FYERS");

    const res = await fetch("https://api-t1.fyers.in/api/v3/positions", {
      method: "GET",
      headers: {
        "Authorization": `${this.appId}:${connection.accessTokenEncrypted}`
      }
    });

    const data = await res.json();
    if (data.s !== "ok") throw new Error(data.message || "Failed to fetch positions");

    const positions = data.netPositions || [];
    return positions.map((p: any) => ({
      brokerName: this.brokerName,
      symbol: p.symbol,
      exchange: "NSE",
      productType: p.productType,
      quantity: p.netQty,
      averagePrice: p.avgPrice,
      mtm: p.pl || 0,
      realizedPnl: p.realized_profit || 0,
      unrealizedPnl: p.unrealized_profit || 0,
    }));
  }

  async fetchHoldings(connection: BrokerConnectionData): Promise<NormalizedHolding[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to FYERS");

    const res = await fetch("https://api-t1.fyers.in/api/v3/holdings", {
      method: "GET",
      headers: {
        "Authorization": `${this.appId}:${connection.accessTokenEncrypted}`
      }
    });

    const data = await res.json();
    if (data.s !== "ok") throw new Error(data.message || "Failed to fetch holdings");

    const holdings = data.holdings || [];
    return holdings.map((h: any) => ({
      brokerName: this.brokerName,
      symbol: h.symbol,
      exchange: "NSE",
      quantity: h.quantity,
      averagePrice: h.costPrice,
      currentPrice: h.ltp,
      currentValue: h.marketVal,
      pnl: h.pl || 0,
    }));
  }

  async fetchFunds(connection: BrokerConnectionData): Promise<any | null> {
    return null;
  }
}
