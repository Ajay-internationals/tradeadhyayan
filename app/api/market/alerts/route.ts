import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache for user alerts (session-persistent)
interface PriceAlert {
  id: string;
  symbol: string;
  price: number;
  direction: "ABOVE" | "BELOW";
  status: "ACTIVE" | "TRIGGERED";
  createdAt: string;
}

// Global alerts store
const globalAlertsStore: Record<string, PriceAlert[]> = {};

// Helper to seed some default alerts for demonstration if store is empty
function getOrCreateUserAlerts(userId: string): PriceAlert[] {
  if (!globalAlertsStore[userId]) {
    globalAlertsStore[userId] = [
      {
        id: "alert_1",
        symbol: "RELIANCE",
        price: 3000.00,
        direction: "ABOVE",
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "alert_2",
        symbol: "HDFCBANK",
        price: 1550.00,
        direction: "BELOW",
        status: "TRIGGERED",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];
  }
  return globalAlertsStore[userId];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "default_user";
    const alerts = getOrCreateUserAlerts(email);

    return NextResponse.json({ success: true, alerts });
  } catch (error: any) {
    console.error("Alerts GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, symbol, price, direction } = body;
    const userKey = email || "default_user";

    if (!symbol || !price || !direction) {
      return NextResponse.json({ success: false, error: "Symbol, price, and direction are required" }, { status: 400 });
    }

    const alerts = getOrCreateUserAlerts(userKey);
    const newAlert: PriceAlert = {
      id: `alert_${Date.now()}`,
      symbol: symbol.toUpperCase().trim(),
      price: parseFloat(price),
      direction: direction === "BELOW" ? "BELOW" : "ABOVE",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };

    alerts.unshift(newAlert);
    globalAlertsStore[userKey] = alerts;

    return NextResponse.json({ success: true, alert: newAlert });
  } catch (error: any) {
    console.error("Alerts POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "default_user";
    const id = searchParams.get("id") || "";

    if (!id) {
      return NextResponse.json({ success: false, error: "Alert ID is required" }, { status: 400 });
    }

    const alerts = getOrCreateUserAlerts(email);
    const filteredAlerts = alerts.filter(a => a.id !== id);
    globalAlertsStore[email] = filteredAlerts;

    return NextResponse.json({ success: true, message: "Alert deleted successfully" });
  } catch (error: any) {
    console.error("Alerts DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
