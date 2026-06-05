import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZerodhaAdapter } from "@/lib/brokers/zerodha.adapter";
import { UpstoxAdapter } from "@/lib/brokers/upstox.adapter";

// In a real app, this would come from the auth session.
const MOCK_USER_ID = "cmp86dqje0000l2040im7xgg1";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const broker = searchParams.get("broker") || searchParams.get("state")?.toLowerCase(); // Upstox might pass state if configured
    
    // Zerodha uses request_token, Upstox uses code
    const token = searchParams.get("request_token") || searchParams.get("code");
    
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token in callback" }, { status: 400 });
    }

    // Determine broker. If not in query, try to infer (Zerodha mostly uses request_token, Upstox uses code)
    let brokerName = broker;
    if (!brokerName) {
      brokerName = searchParams.has("request_token") ? "zerodha" : "upstox";
    }

    let adapter;
    if (brokerName.toLowerCase() === "zerodha") {
      adapter = new ZerodhaAdapter();
    } else if (brokerName.toLowerCase() === "upstox") {
      adapter = new UpstoxAdapter();
    } else {
      return NextResponse.json({ error: "Unsupported broker callback" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    
    // Exchange the code/request_token for an access token
    const brokerToken = await adapter.exchangeToken(token, MOCK_USER_ID, origin);

    // Save connection to DB
    const connectionId = `conn_${Date.now()}`;
    
    // Check if user already has this broker connected
    const existing = await prisma.brokerConnection.findFirst({
      where: { userId: MOCK_USER_ID, brokerName: adapter.brokerName }
    });

    if (existing) {
      await prisma.brokerConnection.update({
        where: { id: existing.id },
        data: {
          status: "CONNECTED",
          accessTokenEncrypted: brokerToken.accessToken,
          refreshTokenEncrypted: brokerToken.refreshToken || null,
          tokenExpiry: brokerToken.expiresIn ? new Date(Date.now() + brokerToken.expiresIn * 1000) : null,
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.brokerConnection.create({
        data: {
          id: connectionId,
          userId: MOCK_USER_ID,
          brokerName: adapter.brokerName,
          status: "CONNECTED",
          accessTokenEncrypted: brokerToken.accessToken,
          refreshTokenEncrypted: brokerToken.refreshToken || null,
          tokenExpiry: brokerToken.expiresIn ? new Date(Date.now() + brokerToken.expiresIn * 1000) : null,
          updatedAt: new Date()
        }
      });
    }

    // Redirect back to dashboard sync page
    return NextResponse.redirect(`${origin}/dashboard/trade-journal/broker-sync?status=success`);

  } catch (error: any) {
    console.error("Broker OAuth Callback Error:", error);
    // Redirect with error
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/dashboard/trade-journal/broker-sync?status=error&message=${encodeURIComponent(error.message)}`);
  }
}
