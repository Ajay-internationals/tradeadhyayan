import { NextResponse } from "next/server";
import { getMarketQuotes } from "@/lib/market-cache";

export const dynamic = "force-dynamic";

function formatVolume(vol: number | undefined): string {
  if (!vol) return "0";
  if (vol >= 10000000) return (vol / 10000000).toFixed(1) + " Cr";
  if (vol >= 100000) return (vol / 100000).toFixed(1) + " L";
  if (vol >= 1000) return (vol / 1000).toFixed(1) + " K";
  return vol.toString();
}

export async function GET(req: Request) {
  try {
    const indicesSymbols = ["^NSEI", "^NSEBANK", "^BSESN", "^INDIAVIX", "NIFTY_FIN_SERVICE.NS", "^CRSMID"];
    const topStocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "LT.NS", "BAJFINANCE.NS", "AXISBANK.NS", "KOTAKBANK.NS", "ASIANPAINT.NS", "TATAMOTORS.NS", "HUL.NS", "MARUTI.NS", "TATASTEEL.NS", "SUNPHARMA.NS", "TITAN.NS", "ULTRACEMCO.NS"];
    
    const quotes = await getMarketQuotes([...indicesSymbols, ...topStocks]);

    const createIndexCard = (name: string, symbol: string) => {
      const q = quotes[symbol];
      if (!q) return { symbol: name, ltp: 0, change: 0, changePercent: 0, trend: "Sideways", range: "0 - 0", dayHigh: 0, dayLow: 0, open: 0, previousClose: 0, volume: "0" };
      
      const ltp = q.regularMarketPrice || 0;
      const prevClose = q.regularMarketPreviousClose || ltp;
      const change = parseFloat((ltp - prevClose).toFixed(2));
      const changePercent = parseFloat(q.regularMarketChangePercent?.toFixed(2) || "0");
      const high = q.regularMarketDayHigh || ltp;
      const low = q.regularMarketDayLow || ltp;
      const open = q.regularMarketOpen || ltp;
      
      const trend = changePercent > 0.5 ? "Bullish" : changePercent < -0.5 ? "Bearish" : "Sideways";

      return {
        symbol: name,
        ltp,
        change,
        changePercent,
        trend,
        range: `${low.toLocaleString("en-IN")} - ${high.toLocaleString("en-IN")}`,
        dayHigh: high,
        dayLow: low,
        open,
        previousClose: prevClose,
        volume: formatVolume(q.regularMarketVolume)
      };
    };

    const indices = [
      createIndexCard("NIFTY 50", "^NSEI"),
      createIndexCard("BANK NIFTY", "^NSEBANK"),
      createIndexCard("SENSEX", "^BSESN"),
      createIndexCard("FINNIFTY", "NIFTY_FIN_SERVICE.NS"),
      createIndexCard("MIDCAP NIFTY", "^CRSMID"),
      createIndexCard("INDIA VIX", "^INDIAVIX")
    ];

    const stockData = topStocks.map(sym => {
      const q = quotes[sym];
      if (!q) return null;
      return {
        symbol: sym.replace(".NS", ""),
        ltp: q.regularMarketPrice || 0,
        changePct: parseFloat(q.regularMarketChangePercent?.toFixed(2) || "0"),
        volume: formatVolume(q.regularMarketVolume),
        rawVol: q.regularMarketVolume || 0
      };
    }).filter(Boolean) as any[];

    stockData.sort((a, b) => b.changePct - a.changePct);
    const topGainers = stockData.slice(0, 5);
    
    stockData.sort((a, b) => a.changePct - b.changePct);
    const topLosers = stockData.slice(0, 5);

    stockData.sort((a, b) => b.rawVol - a.rawVol);
    const volumeBuzzers = stockData.slice(0, 3).map(s => ({ symbol: s.symbol, ltp: s.ltp, changePct: s.changePct, volumeMul: s.volume }));

    const advancingStocks = stockData.filter(s => s.changePct > 0).length;
    const decliningStocks = stockData.filter(s => s.changePct < 0).length;
    const unchangedStocks = stockData.length - advancingStocks - decliningStocks;
    
    const scale = 50 / Math.max(1, stockData.length);
    const scaledAdv = Math.round(advancingStocks * scale);
    const scaledDec = Math.round(decliningStocks * scale);
    const scaledUnc = 50 - scaledAdv - scaledDec;

    const adRatio = parseFloat((scaledAdv / Math.max(1, scaledDec)).toFixed(2));
    const breadthStatus = adRatio > 1.5 ? "Strong Bullish"
                        : adRatio < 0.7 ? "Weak/Bearish"
                        : "Neutral";

    return NextResponse.json({
      success: true,
      indices,
      breadth: {
        advancingStocks: scaledAdv,
        decliningStocks: scaledDec,
        unchangedStocks: scaledUnc,
        advanceDeclineRatio: adRatio,
        breadth: breadthStatus,
        topGainers,
        topLosers,
        volumeBuzzers,
        high52Weeks: [],
        low52Weeks: []
      }
    });

  } catch (error: any) {
    console.error("Failed to fetch market snapshot:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
