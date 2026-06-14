import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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

// Helper to simulate a small fluctuation around a base price
function fluctuate(base: number, isLive: boolean, percentRange: number = 0.0015) {
  if (!isLive) return base;
  const changePercent = (Math.random() - 0.5) * 2 * percentRange;
  const newValue = base * (1 + changePercent);
  return parseFloat(newValue.toFixed(2));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const sandbox = searchParams.get("sandbox") === "true";
    const isLive = checkMarketOpen() || sandbox;

    // Base values for indices
    let nifty = 23210.50;
    let banknifty = 49850.30;
    let sensex = 76450.40;
    let finnifty = 21950.20;
    let midcap = 11540.80;
    let vix = 13.45;

    // Apply simulation fluctuations
    const niftyLtp = fluctuate(nifty, isLive);
    const bankniftyLtp = fluctuate(banknifty, isLive);
    const sensexLtp = fluctuate(sensex, isLive);
    const finniftyLtp = fluctuate(finnifty, isLive);
    const midcapLtp = fluctuate(midcap, isLive);
    const vixLtp = fluctuate(vix, isLive, 0.01); // VIX fluctuates a bit more

    // Calculate previous closes (assumed slightly lower to show positive change)
    const prevNifty = 23086.00;
    const prevBanknifty = 49725.80;
    const prevSensex = 75980.20;
    const prevFinnifty = 21880.50;
    const prevMidcap = 11495.20;
    const prevVix = 13.80;

    // Helper to format index card details
    const createIndexCard = (symbol: string, ltp: number, prevClose: number, highOffset: number, lowOffset: number, volStr: string) => {
      const change = parseFloat((ltp - prevClose).toFixed(2));
      const changePercent = parseFloat(((change / prevClose) * 100).toFixed(2));
      
      // Calculate indicators for trend calculation
      const vwap = prevClose * 1.002;
      const ema9 = ltp * 0.9995;
      const ema30 = ltp * 0.9985;
      
      const trend = ltp > vwap && ema9 > ema30 ? "Bullish"
                  : ltp < vwap && ema9 < ema30 ? "Bearish"
                  : "Sideways";

      const open = parseFloat((prevClose * (1 + (Math.random() - 0.3) * 0.002)).toFixed(2));
      const high = parseFloat((Math.max(ltp, open) + highOffset).toFixed(2));
      const low = parseFloat((Math.min(ltp, open) - lowOffset).toFixed(2));

      return {
        symbol,
        ltp,
        change,
        changePercent,
        trend,
        range: `${low.toLocaleString("en-IN")} - ${high.toLocaleString("en-IN")}`,
        dayHigh: high,
        dayLow: low,
        open,
        previousClose: prevClose,
        volume: volStr
      };
    };

    const indices = [
      createIndexCard("NIFTY 50", niftyLtp, prevNifty, 45, 30, "42.1 Cr"),
      createIndexCard("BANK NIFTY", bankniftyLtp, prevBanknifty, 150, 110, "21.4 Cr"),
      createIndexCard("SENSEX", sensexLtp, prevSensex, 220, 140, "12.8 Cr"),
      createIndexCard("FINNIFTY", finniftyLtp, prevFinnifty, 65, 40, "8.9 Cr"),
      createIndexCard("MIDCAP NIFTY", midcapLtp, prevMidcap, 35, 25, "18.3 Cr"),
      createIndexCard("INDIA VIX", vixLtp, prevVix, 0.4, 0.3, "-")
    ];

    // Calculate Breadth
    const advancingStocks = Math.floor(Math.random() * 10) + 30; // 30 to 39
    const decliningStocks = Math.floor(Math.random() * 10) + 10; // 10 to 19
    const unchangedStocks = 50 - advancingStocks - decliningStocks;
    const adRatio = parseFloat((advancingStocks / Math.max(1, decliningStocks)).toFixed(2));
    const breadthStatus = adRatio > 1.5 ? "Strong Bullish"
                        : adRatio < 0.7 ? "Weak/Bearish"
                        : "Neutral";

    const topGainers = [
      { symbol: "TATASTEEL", ltp: 182.40, changePct: 3.45, volume: "12L" },
      { symbol: "RELIANCE", ltp: 2950.20, changePct: 2.10, volume: "45L" },
      { symbol: "BHARTIARTL", ltp: 1422.50, changePct: 1.85, volume: "18L" },
      { symbol: "INFY", ltp: 1510.60, changePct: 1.62, volume: "22L" },
      { symbol: "ICICIBANK", ltp: 1125.80, changePct: 1.48, volume: "29L" }
    ];

    const topLosers = [
      { symbol: "HDFCBANK", ltp: 1585.40, changePct: -1.78, volume: "32L" },
      { symbol: "HINDALCO", ltp: 672.30, changePct: -1.45, volume: "15L" },
      { symbol: "LT", ltp: 3512.00, changePct: -1.22, volume: "11L" },
      { symbol: "ITC", ltp: 428.60, changePct: -0.95, volume: "27L" },
      { symbol: "AXISBANK", ltp: 1178.50, changePct: -0.82, volume: "14L" }
    ];

    const volumeBuzzers = [
      { symbol: "GMRINFRA", ltp: 88.45, changePct: 4.82, volumeMul: "3.5x" },
      { symbol: "WIPRO", ltp: 478.20, changePct: 2.34, volumeMul: "2.8x" },
      { symbol: "SBIN", ltp: 832.50, changePct: 1.15, volumeMul: "2.4x" }
    ];

    const high52Weeks = ["RELIANCE", "BHARTIARTL", "TATASTEEL", "MAHSEAMLES"];
    const low52Weeks = ["ASIANPAINT", "UPL", "ZEEL"];

    return NextResponse.json({
      success: true,
      indices,
      breadth: {
        advancingStocks,
        decliningStocks,
        unchangedStocks,
        advanceDeclineRatio: adRatio,
        breadth: breadthStatus,
        topGainers,
        topLosers,
        volumeBuzzers,
        high52Weeks,
        low52Weeks
      }
    });

  } catch (error: any) {
    console.error("Failed to fetch market snapshot:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
