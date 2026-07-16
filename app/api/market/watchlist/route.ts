import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMarketQuotes } from "@/lib/market-cache";

export const dynamic = "force-dynamic";

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

function formatVolume(vol: number | undefined): string {
  if (!vol) return "0";
  if (vol >= 10000000) return (vol / 10000000).toFixed(1) + " Cr";
  if (vol >= 100000) return (vol / 100000).toFixed(1) + " L";
  if (vol >= 1000) return (vol / 1000).toFixed(1) + " K";
  return vol.toString();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
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

    // Collect all unique symbols to fetch from Yahoo Finance
    const symbolsToFetch = new Set<string>();
    watchlists.forEach(w => {
      w.items.forEach(item => {
        let sym = item.symbol.toUpperCase().trim();
        if (item.exchange === "NSE" && !sym.endsWith(".NS")) {
          sym += ".NS";
        } else if (item.exchange === "BSE" && !sym.endsWith(".BO")) {
          sym += ".BO";
        }
        symbolsToFetch.add(sym);
      });
    });

    const quotes = await getMarketQuotes(Array.from(symbolsToFetch));

    // Map watchlists and populate live prices
    const watchlistsWithData = watchlists.map(w => {
      const itemsWithRates = w.items.map(item => {
        let yahooSym = item.symbol.toUpperCase().trim();
        if (item.exchange === "NSE" && !yahooSym.endsWith(".NS")) {
          yahooSym += ".NS";
        } else if (item.exchange === "BSE" && !yahooSym.endsWith(".BO")) {
          yahooSym += ".BO";
        }

        const q = quotes[yahooSym];
        if (!q) {
          return {
            ...item,
            ltp: 0, change: 0, changePercent: 0, volume: "0", dayHigh: 0, dayLow: 0, signal: "Sideways"
          };
        }

        const ltp = q.regularMarketPrice || 0;
        const prev = q.regularMarketPreviousClose || ltp;
        const change = parseFloat((ltp - prev).toFixed(2));
        const changePercent = parseFloat(q.regularMarketChangePercent?.toFixed(2) || "0");
        const dayHigh = q.regularMarketDayHigh || ltp;
        const dayLow = q.regularMarketDayLow || ltp;

        let signal = "Sideways";
        if (changePercent > 1) signal = "Bullish";
        else if (changePercent < -1) signal = "Bearish";

        return {
          ...item,
          ltp,
          change,
          changePercent,
          volume: formatVolume(q.regularMarketVolume),
          dayHigh,
          dayLow,
          signal
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
