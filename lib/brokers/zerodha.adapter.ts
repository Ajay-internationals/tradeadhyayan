import crypto from "crypto";
import { BrokerAdapter, BrokerConnectionData, BrokerToken, NormalizedExecution, NormalizedOrder, NormalizedPosition, NormalizedHolding } from "./adapter.interface";

export class ZerodhaAdapter implements BrokerAdapter {
  brokerName = "Zerodha";

  private get apiKey() {
    return process.env.ZERODHA_API_KEY || "";
  }

  private get apiSecret() {
    return process.env.ZERODHA_API_SECRET || "";
  }

  async generateLoginUrl(userId: string, origin?: string): Promise<string> {
    if (!this.apiKey) throw new Error("Zerodha API Key not configured");
    return `https://kite.zerodha.com/connect/login?v=3&api_key=${this.apiKey}`;
  }

  async exchangeToken(authCode: string, userId: string, origin?: string): Promise<BrokerToken> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error("Zerodha API keys not configured");
    }

    const checksum = crypto
      .createHash("sha256")
      .update(this.apiKey + authCode + this.apiSecret)
      .digest("hex");

    const params = new URLSearchParams();
    params.append("api_key", this.apiKey);
    params.append("request_token", authCode);
    params.append("checksum", checksum);

    const res = await fetch("https://api.kite.trade/session/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Kite-Version": "3"
      },
      body: params.toString()
    });

    const data = await res.json();
    if (data.status !== "success") {
      throw new Error(data.message || "Failed to exchange Zerodha token");
    }

    return {
      accessToken: data.data.access_token,
    };
  }

  async fetchOrders(connection: BrokerConnectionData): Promise<NormalizedOrder[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to Zerodha");

    const res = await fetch("https://api.kite.trade/orders", {
      method: "GET",
      headers: {
        "X-Kite-Version": "3",
        "Authorization": `token ${this.apiKey}:${connection.accessTokenEncrypted}`
      }
    });
    const data = await res.json();
    if (data.status !== "success") throw new Error(data.message || "Failed to fetch orders");

    return (data.data || []).map((o: any) => ({
      brokerName: this.brokerName,
      brokerOrderId: o.order_id,
      symbol: o.tradingsymbol,
      exchange: o.exchange,
      transactionType: o.transaction_type, // BUY, SELL
      productType: o.product,
      quantity: o.quantity,
      price: o.average_price || o.price || 0,
      status: o.status, // REJECTED, COMPLETE, CANCELLED, OPEN
      orderTime: o.order_timestamp,
    }));
  }

  async fetchTrades(connection: BrokerConnectionData): Promise<NormalizedExecution[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to Zerodha");

    const res = await fetch("https://api.kite.trade/portfolio/trades", {
      method: "GET",
      headers: {
        "X-Kite-Version": "3",
        "Authorization": `token ${this.apiKey}:${connection.accessTokenEncrypted}`
      }
    });

    const data = await res.json();
    if (data.status !== "success") {
      throw new Error(data.message || "Failed to fetch trades from Zerodha");
    }

    const rawTrades = data.data || [];
    
    return rawTrades.map((t: any) => ({
      brokerName: this.brokerName,
      brokerOrderId: t.order_id,
      brokerTradeId: t.trade_id,
      symbol: t.tradingsymbol,
      exchange: t.exchange,
      segment: t.instrument_token ? "OPTIONS" : "STOCK", // Simplified mapping
      productType: t.product,
      transactionType: t.transaction_type, // BUY, SELL
      quantity: t.quantity,
      price: t.average_price,
      orderTime: t.order_timestamp,
      tradeTime: t.exchange_timestamp,
      status: "COMPLETE",
    }));
  }

  async fetchPositions(connection: BrokerConnectionData): Promise<NormalizedPosition[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to Zerodha");

    const res = await fetch("https://api.kite.trade/portfolio/positions", {
      method: "GET",
      headers: {
        "X-Kite-Version": "3",
        "Authorization": `token ${this.apiKey}:${connection.accessTokenEncrypted}`
      }
    });
    const data = await res.json();
    if (data.status !== "success") throw new Error(data.message || "Failed to fetch positions");

    // Zerodha returns 'net' and 'day' positions. We will map 'net' for overall open positions
    const positions = data.data?.net || [];
    return positions.map((p: any) => ({
      brokerName: this.brokerName,
      symbol: p.tradingsymbol,
      exchange: p.exchange,
      productType: p.product,
      quantity: p.quantity,
      averagePrice: p.average_price,
      mtm: p.m2m || 0,
      realizedPnl: p.realised || 0,
      unrealizedPnl: p.unrealised || 0,
    }));
  }

  async fetchHoldings(connection: BrokerConnectionData): Promise<NormalizedHolding[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to Zerodha");

    const res = await fetch("https://api.kite.trade/portfolio/holdings", {
      method: "GET",
      headers: {
        "X-Kite-Version": "3",
        "Authorization": `token ${this.apiKey}:${connection.accessTokenEncrypted}`
      }
    });
    const data = await res.json();
    if (data.status !== "success") throw new Error(data.message || "Failed to fetch holdings");

    const holdings = data.data || [];
    return holdings.map((h: any) => ({
      brokerName: this.brokerName,
      symbol: h.tradingsymbol,
      exchange: h.exchange,
      quantity: h.quantity,
      averagePrice: h.average_price,
      currentPrice: h.last_price,
      currentValue: h.quantity * h.last_price,
      pnl: h.pnl || 0,
    }));
  }

  async fetchFunds(connection: BrokerConnectionData): Promise<any | null> {
    return null;
  }
}
