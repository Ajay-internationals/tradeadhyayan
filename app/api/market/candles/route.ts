import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get("symbol") || "NIFTY").toUpperCase();
    const interval = searchParams.get("interval") || "5m";
    const countParam = searchParams.get("count") || "100";
    const count = Math.min(200, parseInt(countParam, 10));

    // Base price settings
    let basePrice = 23200;
    if (symbol.includes("BANK")) basePrice = 49800;
    else if (symbol.includes("SENSEX")) basePrice = 76400;
    else if (symbol.includes("FIN")) basePrice = 21900;
    else if (symbol === "RELIANCE") basePrice = 2950;
    else if (symbol === "HDFCBANK") basePrice = 1585;

    // Generate candle sequence backwards from now
    const candles: any[] = [];
    const now = new Date();
    
    // Interval delta in minutes
    let intervalMins = 5;
    if (interval === "1m") intervalMins = 1;
    else if (interval === "3m") intervalMins = 3;
    else if (interval === "15m") intervalMins = 15;
    else if (interval === "30m") intervalMins = 30;
    else if (interval === "1D" || interval === "D") intervalMins = 1440;

    let currentPrice = basePrice;

    for (let i = 0; i < count; i++) {
      const candleTime = new Date(now.getTime() - i * intervalMins * 60 * 1000);
      
      // Generate standard random walk
      const volatility = 0.0015; // 0.15% per candle
      const change = currentPrice * (Math.random() - 0.5) * 2 * volatility;
      const open = parseFloat((currentPrice - change).toFixed(2));
      const close = parseFloat(currentPrice.toFixed(2));
      
      const high = parseFloat((Math.max(open, close) + Math.random() * (currentPrice * 0.001)).toFixed(2));
      const low = parseFloat((Math.min(open, close) - Math.random() * (currentPrice * 0.001)).toFixed(2));
      const volume = Math.floor(5000 + Math.random() * 95000);

      candles.push({
        time: candleTime.toISOString(),
        open,
        high,
        low,
        close,
        volume
      });

      // Walk backward
      currentPrice = open;
    }

    // Return chronological order (oldest to newest)
    return NextResponse.json({
      success: true,
      symbol,
      interval,
      candles: candles.reverse()
    });

  } catch (error: any) {
    console.error("Candles API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
