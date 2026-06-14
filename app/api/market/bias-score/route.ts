import { NextResponse } from "next/server";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sandbox = searchParams.get("sandbox") === "true";
    const isLive = checkMarketOpen() || sandbox;

    if (!isLive) {
      return NextResponse.json({
        success: true,
        score: 2,
        status: "Moderately Bullish Day",
        suggestedMode: "Buy on pullbacks",
        avoid: "Shorting near resistance",
        color: "#86EFAC",
        parameters: {
          giftNifty: { label: "GIFT Nifty", value: "+0.15%", status: "Bullish" },
          globalMarkets: { label: "US Markets (Dow/Nas)", value: "+0.45%", status: "Bullish" },
          fiiFlow: { label: "FII Net Flow", value: "₹1,245 Cr", status: "Buying" },
          diiFlow: { label: "DII Net Flow", value: "₹890 Cr", status: "Buying" },
          indiaVix: { label: "India VIX", value: "13.45 (Falling)", status: "Bullish" },
          niftyVwap: { label: "VWAP Position", value: "Above VWAP", status: "Bullish" },
          emaCrossover: { label: "EMA 9 / EMA 30", value: "EMA9 > EMA30", status: "Bullish" },
          trendStrength: { label: "Trend (ADX)", value: "ADX 22.4 (Trending)", status: "Neutral" },
          rsiZone: { label: "RSI Zone", value: "RSI 58", status: "Neutral" },
          optionsPcr: { label: "Option PCR", value: "1.15 (Balanced)", status: "Neutral" }
        }
      });
    }

    // Simulated inputs that fluctuate slightly to feel live
    const giftNiftyDir = Math.random() > 0.3 ? "Bullish" : "Bearish";
    const giftNiftyPct = parseFloat((giftNiftyDir === "Bullish" ? Math.random() * 0.5 : -Math.random() * 0.4).toFixed(2));
    
    const dowNasdaqPct = parseFloat((0.2 + Math.random() * 0.6).toFixed(2)); // +0.2% to +0.8%
    const fiiNet = Math.floor(500 + Math.random() * 1500); // +500 to +2000 Cr
    const diiNet = Math.floor(100 + Math.random() * 1000); // +100 to +1100 Cr
    
    const vix = parseFloat((12.5 + Math.random() * 2).toFixed(2));
    const vixRising = Math.random() > 0.6;
    
    const niftyAboveVWAP = Math.random() > 0.35;
    const ema9Above30 = Math.random() > 0.3;
    const adx = parseFloat((18 + Math.random() * 10).toFixed(1)); // 18 to 28
    const rsi = Math.floor(45 + Math.random() * 25); // 45 to 70
    
    const pcr = parseFloat((0.85 + Math.random() * 0.5).toFixed(2)); // 0.85 to 1.35
    
    // Scoring Algorithm
    let score = 0;
    
    if (niftyAboveVWAP) score += 1;
    else score -= 1;
    
    if (ema9Above30) score += 1;
    else score -= 1;
    
    if (adx > 20) score += 1;
    
    if (rsi > 60) score += 1;
    if (rsi < 40) score -= 1;
    
    if (pcr > 1.2) score += 1;
    if (pcr < 0.8) score -= 1;
    
    if (vixRising) score -= 1;
    else score += 1;

    if (giftNiftyPct > 0) score += 1;
    else score -= 1;

    // Status mapping based on composite score
    // Max score is +6, Min is -6
    let status = "Sideways Day";
    let suggestedMode = "Scalping range extremes";
    let avoid = "Chasing breakouts";
    let color = "#E2E8F0"; // Slate/neutral

    if (score >= 4) {
      status = "Strong Bullish Day";
      suggestedMode = "Breakout buying only";
      avoid = "Counter-trend shorts";
      color = "#15B77A"; // Green
    } else if (score >= 1) {
      status = "Moderately Bullish Day";
      suggestedMode = "Buy on pullbacks";
      avoid = "Shorting near resistance";
      color = "#86EFAC"; // Light Green
    } else if (score <= -4) {
      status = "Strong Bearish Day";
      suggestedMode = "Sell on rallies / Short breakouts";
      avoid = "Counter-trend longs";
      color = "#E94B8A"; // Red
    } else if (score <= -1) {
      status = "Moderately Bearish Day";
      suggestedMode = "Short near resistance";
      avoid = "Buying breakouts";
      color = "#FCA5A5"; // Light Red
    }

    return NextResponse.json({
      success: true,
      score,
      status,
      suggestedMode,
      avoid,
      color,
      parameters: {
        giftNifty: { label: "GIFT Nifty", value: `${giftNiftyPct > 0 ? "+" : ""}${giftNiftyPct}%`, status: giftNiftyDir },
        globalMarkets: { label: "US Markets (Dow/Nas)", value: `+${dowNasdaqPct}%`, status: "Bullish" },
        fiiFlow: { label: "FII Net Flow", value: `₹${fiiNet} Cr`, status: "Buying" },
        diiFlow: { label: "DII Net Flow", value: `₹${diiNet} Cr`, status: "Buying" },
        indiaVix: { label: "India VIX", value: `${vix} (${vixRising ? "Rising" : "Falling"})`, status: vixRising ? "Bearish" : "Bullish" },
        niftyVwap: { label: "VWAP Position", value: niftyAboveVWAP ? "Above VWAP" : "Below VWAP", status: niftyAboveVWAP ? "Bullish" : "Bearish" },
        emaCrossover: { label: "EMA 9 / EMA 30", value: ema9Above30 ? "EMA9 > EMA30" : "EMA9 < EMA30", status: ema9Above30 ? "Bullish" : "Bearish" },
        trendStrength: { label: "Trend (ADX)", value: `ADX ${adx} (${adx > 20 ? "Trending" : "Range"})`, status: adx > 20 ? "Neutral" : "Caution" },
        rsiZone: { label: "RSI Zone", value: `RSI ${rsi}`, status: rsi > 60 ? "Overbought" : rsi < 40 ? "Oversold" : "Neutral" },
        optionsPcr: { label: "Option PCR", value: `${pcr} (${pcr > 1.2 ? "High Put OI" : pcr < 0.8 ? "High Call OI" : "Balanced"})`, status: pcr > 1.2 ? "Bullish" : pcr < 0.8 ? "Bearish" : "Neutral" }
      }
    });

  } catch (error: any) {
    console.error("Bias Score API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
