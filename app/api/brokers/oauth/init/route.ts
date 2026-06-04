import { NextResponse } from "next/server";
import { ZerodhaAdapter } from "@/lib/brokers/zerodha.adapter";
import { UpstoxAdapter } from "@/lib/brokers/upstox.adapter";
import { FyersAdapter } from "@/lib/brokers/fyers.adapter";

// In a real app, this would come from the auth session.
const MOCK_USER_ID = "cmp86dqje0000l2040im7xgg1";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const broker = searchParams.get("broker");

    if (!broker) {
      return NextResponse.json({ error: "Broker parameter is required" }, { status: 400 });
    }

    let adapter;
    if (broker.toLowerCase() === "zerodha") {
      adapter = new ZerodhaAdapter();
    } else if (broker.toLowerCase() === "upstox") {
      adapter = new UpstoxAdapter();
    } else if (broker.toLowerCase() === "fyers") {
      adapter = new FyersAdapter();
    } else {
      return NextResponse.json({ error: "Unsupported broker" }, { status: 400 });
    }

    // Pass the base URL so adapters know where to redirect back
    const origin = new URL(req.url).origin;
    const loginUrl = await adapter.generateLoginUrl(MOCK_USER_ID, origin);
    
    return NextResponse.redirect(loginUrl);

  } catch (error: any) {
    console.error("Broker OAuth Init Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
