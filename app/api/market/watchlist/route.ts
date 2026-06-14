import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Baseline stock price map to simulate live rates
const STOCK_BASELINES: Record<string, { price: number; changePct: number; volume: string; signal: string }> = {
  RELIANCE: { price: 2950.20, changePct: 1.20, volume: "45L", signal: "Bullish" },
  HDFCBANK: { price: 1585.40, changePct: -0.40, volume: "31L", signal: "Weak" },
  TCS: { price: 3820.60, changePct: 0.85, volume: "18L", signal: "Bullish" },
  INFY: { price: 1510.80, changePct: -1.10, volume: "22L", signal: "Weak" },
  ICICIBANK: { price: 1125.50, changePct: 1.48, volume: "29L", signal: "Bullish" },
  SBIN: { price: 830.15, changePct: 2.10, volume: "55L", signal: "Bullish" },
  TATASTEEL: { price: 182.40, changePct: 3.45, volume: "85L", signal: "Bullish" },
  BHARTIARTL: { price: 1422.50, changePct: 1.85, volume: "18L", signal: "Bullish" },
  WIPRO: { price: 478.20, changePct: 2.34, volume: "24L", signal: "Bullish" },
  LT: { price: 3512.00, changePct: -1.22, volume: "12L", signal: "Weak" },
  ITC: { price: 428.60, changePct: -0.95, volume: "41L", signal: "Sideways" },
  AXISBANK: { price: 1178.50, changePct: -0.82, volume: "19L", signal: "Sideways" }
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

function getStockData(symbol: string, isLive: boolean) {
  const cleanSym = symbol.toUpperCase().trim();
  const base = STOCK_BASELINES[cleanSym] || { price: 150.0, changePct: 0.5, volume: "10L", signal: "Sideways" };
  
  // Fluctuate price
  const changePctRange = 0.002;
  const randOffset = isLive ? (Math.random() - 0.5) * 2 * changePctRange : 0;
  const ltp = parseFloat((base.price * (1 + randOffset)).toFixed(2));
  
  const originalClose = parseFloat((base.price / (1 + base.changePct / 100)).toFixed(2));
  const change = parseFloat((ltp - originalClose).toFixed(2));
  const changePercent = parseFloat(((change / originalClose) * 100).toFixed(2));

  const dayHigh = parseFloat((Math.max(ltp, originalClose) + (isLive ? Math.random() * 10 : 1.5)).toFixed(2));
  const dayLow = parseFloat((Math.min(ltp, originalClose) - (isLive ? Math.random() * 10 : 1.5)).toFixed(2));
  
  let signal = base.signal;
  if (changePercent > 1) signal = "Bullish";
  else if (changePercent < -1) signal = "Bearish";
  else if (Math.abs(changePercent) <= 0.5) signal = "Sideways";

  return {
    ltp,
    change,
    changePercent,
    volume: base.volume,
    dayHigh,
    dayLow,
    signal
  };
}

const MOCK_USER_ID = "cmp86dqje0000l2040im7xgg1";

async function getUserIdByEmail(email: string): Promise<string> {
  if (!email) return MOCK_USER_ID;
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() }
  });
  if (user) return user.id;

  // Fallback to first user in db if any
  const firstUser = await prisma.user.findFirst();
  if (firstUser) return firstUser.id;

  return MOCK_USER_ID;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const sandbox = searchParams.get("sandbox") === "true";
    const isLive = checkMarketOpen() || sandbox;
    const userId = await getUserIdByEmail(email);

    // Fetch watchlists for user
    let watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: { items: true }
    });

    // Seed default watchlist if empty
    if (watchlists.length === 0) {
      const defaultWatchlist = await prisma.watchlist.create({
        data: {
          userId,
          name: "My Watchlist",
          items: {
            create: [
              { symbol: "RELIANCE", exchange: "NSE" },
              { symbol: "HDFCBANK", exchange: "NSE" },
              { symbol: "TCS", exchange: "NSE" },
              { symbol: "INFY", exchange: "NSE" },
              { symbol: "ICICIBANK", exchange: "NSE" },
              { symbol: "SBIN", exchange: "NSE" }
            ]
          }
        },
        include: { items: true }
      });
      watchlists = [defaultWatchlist];
    }

    // Map watchlists and populate live prices
    const watchlistsWithData = watchlists.map(w => {
      const itemsWithRates = w.items.map(item => {
        const rates = getStockData(item.symbol, isLive);
        return {
          ...item,
          ...rates
        };
      });
      return {
        ...w,
        items: itemsWithRates
      };
    });

    return NextResponse.json({ success: true, watchlists: watchlistsWithData });
  } catch (error: any) {
    console.error("Watchlist GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, name, watchlistId, symbol, exchange } = body;
    const userId = await getUserIdByEmail(email);

    if (action === "create_watchlist") {
      if (!name) {
        return NextResponse.json({ success: false, error: "Watchlist name is required" }, { status: 400 });
      }
      const watchlist = await prisma.watchlist.create({
        data: { userId, name },
        include: { items: true }
      });
      return NextResponse.json({ success: true, watchlist });
    }

    if (action === "add_item") {
      if (!watchlistId || !symbol) {
        return NextResponse.json({ success: false, error: "watchlistId and symbol are required" }, { status: 400 });
      }

      // Verify watchlist belongs to user
      const watchlist = await prisma.watchlist.findFirst({
        where: { id: watchlistId, userId }
      });

      if (!watchlist) {
        return NextResponse.json({ success: false, error: "Watchlist not found or unauthorized" }, { status: 404 });
      }

      // Check if symbol already exists in watchlist
      const existingItem = await prisma.watchlistItem.findFirst({
        where: { watchlistId, symbol: symbol.toUpperCase() }
      });

      if (existingItem) {
        return NextResponse.json({ success: false, error: "Symbol already exists in watchlist" }, { status: 400 });
      }

      const item = await prisma.watchlistItem.create({
        data: {
          watchlistId,
          symbol: symbol.toUpperCase(),
          exchange: exchange || "NSE"
        }
      });

      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Watchlist POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const action = searchParams.get("action") || "";
    const id = searchParams.get("id") || "";
    const userId = await getUserIdByEmail(email);

    if (!action || !id) {
      return NextResponse.json({ success: false, error: "Action and ID are required" }, { status: 400 });
    }

    if (action === "delete_watchlist") {
      // Verify watchlist belongs to user
      const watchlist = await prisma.watchlist.findFirst({
        where: { id, userId }
      });

      if (!watchlist) {
        return NextResponse.json({ success: false, error: "Watchlist not found or unauthorized" }, { status: 404 });
      }

      await prisma.watchlist.delete({
        where: { id }
      });

      return NextResponse.json({ success: true, message: "Watchlist deleted successfully" });
    }

    if (action === "remove_item") {
      // Find item and verify it belongs to user's watchlist
      const item = await prisma.watchlistItem.findFirst({
        where: {
          id,
          watchlist: { userId }
        }
      });

      if (!item) {
        return NextResponse.json({ success: false, error: "Watchlist item not found or unauthorized" }, { status: 404 });
      }

      await prisma.watchlistItem.delete({
        where: { id }
      });

      return NextResponse.json({ success: true, message: "Watchlist item removed successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Watchlist DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
