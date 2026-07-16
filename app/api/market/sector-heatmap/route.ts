import { NextResponse } from "next/server";
import { getMarketQuotes } from "@/lib/market-cache";

export const dynamic = "force-dynamic";

const SECTOR_SYMBOLS: Record<string, string> = {
  "Nifty IT": "^CNXIT",
  "Nifty Bank": "^NSEBANK",
  "Nifty Auto": "^CNXAUTO",
  "Nifty FMCG": "^CNXFMCG",
  "Nifty Pharma": "^CNXPHARMA",
  "Nifty Realty": "^CNXREALTY",
  "Nifty Metal": "^CNXMETAL",
  "Nifty Energy": "^CNXENERGY",
  "Nifty PSU Bank": "^CNXPSUBANK",
  "Nifty Financial Services": "NIFTY_FIN_SERVICE.NS"
};

export async function GET(req: Request) {
  try {
    const symbols = Object.values(SECTOR_SYMBOLS);
    const quotes = await getMarketQuotes(symbols);

    const sectors = Object.entries(SECTOR_SYMBOLS).map(([name, symbol]) => {
      const q = quotes[symbol];
      if (!q) {
        return { name, ltp: 0, change: 0, changePercent: 0, heatColor: "neutral" };
      }

      const ltp = q.regularMarketPrice || 0;
      const prev = q.regularMarketPreviousClose || ltp;
      const change = parseFloat((ltp - prev).toFixed(2));
      const changePercent = parseFloat(q.regularMarketChangePercent?.toFixed(2) || "0");

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
