import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Helper to calculate next Thursdays
function getNextThursdays(count = 4) {
  const dates: string[] = [];
  const current = new Date();
  
  // Find the next Thursday
  let daysUntilThursday = (4 - current.getDay() + 7) % 7;
  if (daysUntilThursday === 0) daysUntilThursday = 7; // If today is Thursday, get next week
  
  current.setDate(current.getDate() + daysUntilThursday);
  
  for (let i = 0; i < count; i++) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

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
    const symbol = (searchParams.get("symbol") || "NIFTY").toUpperCase();
    const expiryParam = searchParams.get("expiry");
    const sandbox = searchParams.get("sandbox") === "true";
    const isLive = checkMarketOpen() || sandbox;

    const expiries = getNextThursdays();
    const expiry = expiryParam || expiries[0];

    // Determine base parameters based on symbol
    let indexLtp = 23210.50;
    let strikeGap = 50;
    
    if (symbol === "BANKNIFTY" || symbol === "BANK NIFTY") {
      indexLtp = 49850.30;
      strikeGap = 100;
    } else if (symbol === "SENSEX") {
      indexLtp = 76450.40;
      strikeGap = 100;
    } else if (symbol === "FINNIFTY" || symbol === "FIN NIFTY") {
      indexLtp = 21950.20;
      strikeGap = 50;
    }

    // Fluctuate the index slightly to feel live
    const randOffset = isLive ? (Math.random() - 0.5) * 0.0006 * indexLtp : 0;
    const ltp = parseFloat((indexLtp + randOffset).toFixed(2));

    const atmStrike = Math.round(ltp / strikeGap) * strikeGap;

    // Generate strikes: 7 strikes ITM, 7 strikes OTM, plus ATM
    const strikeCount = 15;
    const strikes: number[] = [];
    const startStrike = atmStrike - Math.floor(strikeCount / 2) * strikeGap;
    
    for (let i = 0; i < strikeCount; i++) {
      strikes.push(startStrike + i * strikeGap);
    }

    // Generate option chain rows
    const rows = strikes.map((strike, idx) => {
      // Calculate distance from ATM
      const diff = strike - ltp;
      const isCallITM = strike < ltp;
      const isPutITM = strike > ltp;

      // Base LTP calculations
      const ivVal = 12.5 + Math.abs(diff) / 1000;
      const iv = parseFloat((isLive ? (ivVal + (Math.random() - 0.5)) : ivVal).toFixed(2));
      
      // Call LTP: high for low strikes (deep ITM), decays to near 0 for high strikes (OTM)
      const ceBasePrice = Math.max(5, (ltp - strike) + 120 * Math.exp(-Math.abs(diff) / 300));
      const ceLtp = parseFloat(fluctuateValue(ceBasePrice, isLive ? 0.02 : 0).toFixed(2));

      // Put LTP: high for high strikes (deep ITM), decays to near 0 for low strikes (OTM)
      const peBasePrice = Math.max(5, (strike - ltp) + 120 * Math.exp(-Math.abs(diff) / 300));
      const peLtp = parseFloat(fluctuateValue(peBasePrice, isLive ? 0.02 : 0).toFixed(2));

      // Open Interest: Peak near ATM, lower further away
      const ceOiBase = Math.floor(4000000 * Math.exp(-Math.pow(diff / 400, 2)));
      const ceOi = Math.floor(fluctuateValue(ceOiBase, isLive ? 0.05 : 0));
      const ceOiChange = Math.floor(ceOi * (isLive ? (0.05 + (Math.random() - 0.5) * 0.1) : 0.05));

      const peOiBase = Math.floor(4200000 * Math.exp(-Math.pow(diff / 400, 2)));
      const peOi = Math.floor(fluctuateValue(peOiBase, isLive ? 0.05 : 0));
      const peOiChange = Math.floor(peOi * (isLive ? (0.04 + (Math.random() - 0.5) * 0.1) : 0.04));

      const ceVolume = Math.floor(ceOi * (1.2 + (isLive ? Math.random() : 0.2)));
      const peVolume = Math.floor(peOi * (1.1 + (isLive ? Math.random() : 0.2)));

      // Option Greeks (approximations)
      const deltaFactor = 1 / (1 + Math.exp(diff / 150));
      const ceDelta = parseFloat(deltaFactor.toFixed(2));
      const peDelta = parseFloat((deltaFactor - 1).toFixed(2));

      const ceGamma = parseFloat((Math.exp(-Math.pow(diff / 150, 2)) / (150 * Math.sqrt(2 * Math.PI))).toFixed(4));
      const peGamma = ceGamma;

      const ceThetaVal = -15 * Math.exp(-Math.pow(diff / 250, 2));
      const ceTheta = parseFloat((isLive ? (ceThetaVal - Math.random() * 2) : ceThetaVal).toFixed(2));
      const peThetaVal = -14 * Math.exp(-Math.pow(diff / 250, 2));
      const peTheta = parseFloat((isLive ? (peThetaVal - Math.random() * 2) : peThetaVal).toFixed(2));

      const ceVega = parseFloat((0.25 * Math.exp(-Math.pow(diff / 180, 2))).toFixed(2));
      const peVega = ceVega;

      return {
        strike,
        isATM: strike === atmStrike,
        ce: {
          ltp: ceLtp,
          oi: ceOi,
          oiChange: ceOiChange,
          volume: ceVolume,
          iv,
          delta: ceDelta,
          gamma: ceGamma,
          theta: ceTheta,
          vega: ceVega,
          isITM: isCallITM
        },
        pe: {
          ltp: peLtp,
          oi: peOi,
          oiChange: peOiChange,
          volume: peVolume,
          iv,
          delta: peDelta,
          gamma: peGamma,
          theta: peTheta,
          vega: peVega,
          isITM: isPutITM
        }
      };
    });

    // Calculate PCR
    let totalCE_OI = 0;
    let totalPE_OI = 0;
    let maxCallOi = -1;
    let maxPutOi = -1;
    let callResistance = atmStrike;
    let putSupport = atmStrike;

    rows.forEach(r => {
      totalCE_OI += r.ce.oi;
      totalPE_OI += r.pe.oi;
      
      if (r.ce.oi > maxCallOi) {
        maxCallOi = r.ce.oi;
        callResistance = r.strike;
      }
      
      if (r.pe.oi > maxPutOi) {
        maxPutOi = r.pe.oi;
        putSupport = r.strike;
      }
    });

    const pcr = parseFloat((totalPE_OI / Math.max(1, totalCE_OI)).toFixed(2));
    const bias = pcr > 1.2 ? "Bullish"
               : pcr < 0.8 ? "Bearish"
               : "Neutral";

    // Max Pain calculation
    // Max pain is the strike where option sellers' total loss is minimized at expiry.
    let minPayout = Infinity;
    let maxPainStrike = atmStrike;

    strikes.forEach(targetStrike => {
      let payout = 0;
      rows.forEach(r => {
        // CE payout = CE_OI * max(0, Spot_at_expiry - CE_Strike)
        if (targetStrike > r.strike) {
          payout += r.ce.oi * (targetStrike - r.strike);
        }
        // PE payout = PE_OI * max(0, PE_Strike - Spot_at_expiry)
        if (targetStrike < r.strike) {
          payout += r.pe.oi * (r.strike - targetStrike);
        }
      });

      if (payout < minPayout) {
        minPayout = payout;
        maxPainStrike = targetStrike;
      }
    });

    return NextResponse.json({
      success: true,
      symbol,
      expiry,
      expiries,
      ltp,
      atmStrike,
      rows,
      metrics: {
        pcr,
        bias,
        maxPain: maxPainStrike,
        support: putSupport,
        resistance: callResistance,
        totalCallOi: totalCE_OI,
        totalPutOi: totalPE_OI
      }
    });

  } catch (error: any) {
    console.error("Failed to generate option chain:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper to fluctuate values slightly
function fluctuateValue(val: number, range: number) {
  if (range === 0) return val;
  const offset = (Math.random() - 0.5) * 2 * range;
  return val * (1 + offset);
}
