import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Baseline prices and simulated weights
const SECTOR_BASELINES: Record<string, { base: number; prev: number }> = {
  "Nifty IT": { base: 35420.50, prev: 35110.00 },
  "Nifty Bank": { base: 49850.30, prev: 49725.80 },
  "Nifty Auto": { base: 21800.80, prev: 21530.00 },
  "Nifty FMCG": { base: 54900.40, prev: 55120.00 },
  "Nifty Pharma": { base: 19100.60, prev: 19045.00 },
  "Nifty Realty": { base: 920.15, prev: 898.00 },
  "Nifty Metal": { base: 8750.40, prev: 8890.00 },
  "Nifty Energy": { base: 39200.20, prev: 39020.00 },
  "Nifty PSU Bank": { base: 7200.75, prev: 7080.00 },
  "Nifty Financial Services": { base: 22800.50, prev: 22840.00 }
};

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

// Helper to fluctuate prices slightly
function fluctuate(base: number, isLive: boolean, range = 0.002) {
  if (!isLive) return base;
  const offset = (Math.random() - 0.5) * 2 * range;
  return parseFloat((base * (1 + offset)).toFixed(2));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sandbox = searchParams.get("sandbox") === "true";
    const isLive = checkMarketOpen() || sandbox;

    const sectors = Object.entries(SECTOR_BASELINES).map(([name, data]) => {
      const ltp = fluctuate(data.base, isLive);
      const prev = data.prev;
      const change = parseFloat((ltp - prev).toFixed(2));
      const changePercent = parseFloat(((change / prev) * 100).toFixed(2));

      // Calculate heat color coding
      // if changePercent > 1 => strong green
      // if changePercent > 0 => light green
      // if changePercent < -1 => strong red
      // if changePercent < 0 => light red
      let heatColor = "neutral";
      if (changePercent >= 1.0) {
        heatColor = "strong-green";
      } else if (changePercent > 0.0) {
        heatColor = "light-green";
      } else if (changePercent <= -1.0) {
        heatColor = "strong-red";
      } else if (changePercent < 0.0) {
        heatColor = "light-red";
      }

      return {
        name,
        ltp,
        change,
        changePercent,
        heatColor
      };
    });

    return NextResponse.json({ success: true, sectors });
  } catch (error: any) {
    console.error("Failed to generate sector heatmap:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
