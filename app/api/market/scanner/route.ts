import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Base universe of stocks to scan
const SCANNER_UNIVERSE = [
  "RELIANCE", "HDFCBANK", "TCS", "INFY", "ICICIBANK", "SBIN",
  "TATASTEEL", "BHARTIARTL", "WIPRO", "LT", "ITC", "AXISBANK",
  "MARUTI", "KOTAKBANK", "HCLTECH", "SUNPHARMA", "BAJFINANCE", "ONGC"
];

function checkMarketOpen() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  
  const day = ist.getDay();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeNum = hours * 100 + minutes;

  return day >= 1 && day <= 5 && timeNum >= 915 && timeNum <= 1530;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sandbox = searchParams.get("sandbox") === "true";
    const isLive = checkMarketOpen() || sandbox;

    if (!isLive) {
      return NextResponse.json({
        success: true,
        breakout: [
          { symbol: "RELIANCE", ltp: 2950.20, signal: "BUY", rangeHigh: 2940.00, rangeLow: 2888.00, volume: "2.4x Avg", time: "09:32 AM" }
        ],
        vwapTrend: [
          { symbol: "SBIN", ltp: 830.15, signal: "BULLISH TREND", vwap: 825.40, ema9: 828.10, ema30: 824.50, adx: 24.5 }
        ],
        bollingerRange: [
          { symbol: "HDFCBANK", ltp: 1585.40, signal: "BUY LOWER BAND", lowerBand: 1588.00, upperBand: 1620.00, rsi: 35, adx: 14.2 }
        ]
      });
    }

    const breakoutMatches: any[] = [];
    const vwapMatches: any[] = [];
    const bollingerMatches: any[] = [];

    SCANNER_UNIVERSE.forEach(symbol => {
      // Simulate indicator stats for each stock
      const ltp = parseFloat((100 + Math.random() * 3000).toFixed(2));
      const rsi = Math.floor(25 + Math.random() * 55); // 25 to 80
      const adx = parseFloat((12 + Math.random() * 18).toFixed(1)); // 12 to 30
      
      const vwap = ltp * (1 + (Math.random() - 0.5) * 0.01);
      const ema9 = ltp * (1 + (Math.random() - 0.5) * 0.005);
      const ema30 = ltp * (1 + (Math.random() - 0.5) * 0.008);

      const upperBand = ltp * 1.02;
      const lowerBand = ltp * 0.98;

      // 1. 9:30 Breakout Setup Check
      // Simulating some matches
      if (Math.random() > 0.8) {
        const isBuy = Math.random() > 0.5;
        const rangeHigh = ltp * (isBuy ? 0.985 : 1.01);
        const rangeLow = ltp * (isBuy ? 0.97 : 1.005);
        breakoutMatches.push({
          symbol,
          ltp,
          signal: isBuy ? "BUY" : "SELL",
          rangeHigh: parseFloat(rangeHigh.toFixed(2)),
          rangeLow: parseFloat(rangeLow.toFixed(2)),
          volume: `${(Math.random() * 5 + 2).toFixed(1)}x Avg`,
          time: "09:32 AM"
        });
      }

      // 2. VWAP Trend Setup Check
      // Close > VWAP && EMA9 > EMA30 && ADX > 20
      if (adx > 20) {
        const isBullish = ltp > vwap && ema9 > ema30;
        const isBearish = ltp < vwap && ema9 < ema30;

        if (isBullish || isBearish) {
          vwapMatches.push({
            symbol,
            ltp,
            signal: isBullish ? "BULLISH TREND" : "BEARISH TREND",
            vwap: parseFloat(vwap.toFixed(2)),
            ema9: parseFloat(ema9.toFixed(2)),
            ema30: parseFloat(ema30.toFixed(2)),
            adx
          });
        }
      }

      // 3. Bollinger Range Setup Check
      // ADX < 18
      if (adx < 18) {
        // Buy Near Lower Band: close <= lowerBand && rsi < 40
        // Sell Near Upper Band: close >= upperBand && rsi > 60
        const isBuy = rsi < 40;
        const isSell = rsi > 60;

        if (isBuy || isSell) {
          bollingerMatches.push({
            symbol,
            ltp,
            signal: isBuy ? "BUY LOWER BAND" : "SELL UPPER BAND",
            lowerBand: parseFloat(lowerBand.toFixed(2)),
            upperBand: parseFloat(upperBand.toFixed(2)),
            rsi,
            adx
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      breakout: breakoutMatches,
      vwapTrend: vwapMatches,
      bollingerRange: bollingerMatches
    });

  } catch (error: any) {
    console.error("Scanner API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
