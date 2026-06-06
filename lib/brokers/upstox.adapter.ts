import { BrokerAdapter, BrokerConnectionData, BrokerToken, NormalizedExecution, NormalizedOrder, NormalizedPosition, NormalizedHolding } from "./adapter.interface";

export class UpstoxAdapter implements BrokerAdapter {
  brokerName = "Upstox";

  private get clientId() {
    return process.env.UPSTOX_CLIENT_ID || "";
  }

  private get clientSecret() {
    return process.env.UPSTOX_CLIENT_SECRET || "";
  }

  private get apiBaseUrl() {
    return process.env.UPSTOX_API_BASE_URL || "https://api-v2.upstox.com";
  }

  private get proxySecret() {
    return process.env.PROXY_SECRET_TOKEN || "";
  }

  async generateLoginUrl(userId: string, origin?: string): Promise<string> {
    if (!this.clientId) throw new Error("Upstox Client ID not configured");
    // Use the specific callback URL configured in the user's Upstox app
    const redirectUri = origin ? `${origin}/api/broker/upstox/callback` : "";
    return `https://api-v2.upstox.com/login/authorization/dialog?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  async exchangeToken(authCode: string, userId: string, origin?: string): Promise<BrokerToken> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Upstox API keys not configured");
    }

    // Must match exactly the redirect_uri used during login
    const redirectUri = origin ? `${origin}/api/broker/upstox/callback` : "";

    const params = new URLSearchParams();
    params.append("code", authCode);
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);
    params.append("redirect_uri", redirectUri);
    params.append("grant_type", "authorization_code");

    const res = await fetch(`${this.apiBaseUrl}/login/authorization/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        ...(this.proxySecret ? { "x-proxy-secret": this.proxySecret } : {})
      },
      body: params.toString()
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.errors?.[0]?.message || "Failed to exchange Upstox token");
    }

    return {
      accessToken: data.access_token,
      expiresIn: 86400, // Upstox tokens typically valid for 1 day
    };
  }

  async fetchOrders(connection: BrokerConnectionData): Promise<NormalizedOrder[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to Upstox");

    try {
      const res = await fetch(`${this.apiBaseUrl}/order/retrieve-all`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${connection.accessTokenEncrypted}`,
          ...(this.proxySecret ? { "x-proxy-secret": this.proxySecret } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.message || "Failed to fetch orders");

      const rawOrders = data.data || [];
      return rawOrders.map((o: any) => ({
        brokerName: this.brokerName,
        brokerOrderId: o.order_id,
        symbol: o.tradingsymbol || o.trading_symbol,
        exchange: o.exchange,
        transactionType: o.transaction_type, // BUY, SELL
        productType: o.product,
        quantity: o.quantity,
        price: o.average_price || o.price || 0,
        status: o.status,
        orderTime: o.order_timestamp,
      }));
    } catch (err) {
      console.warn("Gracefully ignored Upstox orders fetch failure (likely due to static IP restriction):", err);
      return [];
    }
  }

  async fetchTrades(connection: BrokerConnectionData): Promise<NormalizedExecution[]> {
    if (!connection.accessTokenEncrypted) {
      throw new Error("Not connected to Upstox");
    }

    try {
      // Calculate today's date in IST (UTC +5:30)
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const todayStr = istTime.toISOString().split("T")[0];

      // Fetch trades from the historical-trades API which is exempt from Static IP restrictions.
      // We fetch both Equity (EQ) and Futures & Options (FO) segments.
      const segments = ["EQ", "FO"];
      const fetchPromises = segments.map(async (segment) => {
        const url = `https://api.upstox.com/v2/charges/historical-trades?segment=${segment}&start_date=${todayStr}&end_date=${todayStr}&page_number=1&page_size=100`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${connection.accessTokenEncrypted}`
          }
        });
        if (!res.ok) {
          console.warn(`Upstox trade history fetch failed for segment ${segment} (might be empty):`, await res.text());
          return [];
        }
        const json = await res.json();
        return json.data || [];
      });

      const results = await Promise.all(fetchPromises);
      const rawTrades = results.flat();

      return rawTrades.map((t: any) => ({
        brokerName: this.brokerName,
        brokerOrderId: t.order_id,
        brokerTradeId: t.trade_id,
        symbol: t.trading_symbol || t.tradingsymbol,
        exchange: t.exchange,
        segment: (t.trading_symbol?.includes("CE") || t.trading_symbol?.includes("PE") || t.instrument_token) ? "OPTIONS" : "STOCK",
        productType: t.product,
        transactionType: t.transaction_type, // BUY, SELL
        quantity: t.quantity,
        price: t.average_price || t.price || 0,
        orderTime: t.order_timestamp,
        tradeTime: t.exchange_timestamp || t.trade_timestamp || t.order_timestamp,
        status: "COMPLETE",
      }));
    } catch (err: any) {
      // If historical-trades fails or is not supported, fallback to the standard endpoint
      console.warn("Upstox historical trades fetch failed, falling back to standard endpoint:", err);
      
      const res = await fetch(`${this.apiBaseUrl}/order/trades`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${connection.accessTokenEncrypted}`,
          ...(this.proxySecret ? { "x-proxy-secret": this.proxySecret } : {})
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.errors?.[0]?.message || "Failed to fetch trades from Upstox");
      }

      const rawTrades = data.data || [];
      
      return rawTrades.map((t: any) => ({
        brokerName: this.brokerName,
        brokerOrderId: t.order_id,
        brokerTradeId: t.trade_id,
        symbol: t.tradingsymbol || t.trading_symbol,
        exchange: t.exchange,
        segment: t.instrument_token ? "OPTIONS" : "STOCK",
        productType: t.product,
        transactionType: t.transaction_type,
        quantity: t.quantity,
        price: t.average_price || t.price || 0,
        orderTime: t.order_timestamp,
        tradeTime: t.trade_timestamp,
        status: "COMPLETE",
      }));
    }
  }

  async fetchPositions(connection: BrokerConnectionData): Promise<NormalizedPosition[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to Upstox");

    const res = await fetch(`${this.apiBaseUrl}/portfolio/short-term-positions`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${connection.accessTokenEncrypted}`,
        ...(this.proxySecret ? { "x-proxy-secret": this.proxySecret } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.message || "Failed to fetch positions");

    const positions = data.data || [];
    return positions.map((p: any) => ({
      brokerName: this.brokerName,
      symbol: p.tradingsymbol,
      exchange: p.exchange,
      productType: p.product,
      quantity: p.net_qty || p.quantity || 0,
      averagePrice: p.average_price || p.buy_price || 0, // Simplified fallback
      mtm: p.m2m || 0,
      realizedPnl: p.realised || 0,
      unrealizedPnl: p.unrealised || 0,
    }));
  }

  async fetchHoldings(connection: BrokerConnectionData): Promise<NormalizedHolding[]> {
    if (!connection.accessTokenEncrypted) throw new Error("Not connected to Upstox");

    const res = await fetch(`${this.apiBaseUrl}/portfolio/long-term-holdings`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${connection.accessTokenEncrypted}`,
        ...(this.proxySecret ? { "x-proxy-secret": this.proxySecret } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.message || "Failed to fetch holdings");

    const holdings = data.data || [];
    return holdings.map((h: any) => ({
      brokerName: this.brokerName,
      symbol: h.tradingsymbol,
      exchange: h.exchange,
      quantity: h.quantity,
      averagePrice: h.average_price,
      currentPrice: h.last_price,
      currentValue: (h.quantity || 0) * (h.last_price || 0),
      pnl: h.pnl || 0,
    }));
  }

  async fetchFunds(connection: BrokerConnectionData): Promise<any | null> {
    return null;
  }
}
