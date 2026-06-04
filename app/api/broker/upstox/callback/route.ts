import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpstoxAdapter } from "@/lib/brokers/upstox.adapter";

const MOCK_USER_ID = "cmp86dqje0000l2040im7xgg1";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("code");
    
    if (!token) {
      return NextResponse.json({ error: "Missing authorization code in callback" }, { status: 400 });
    }

    const adapter = new UpstoxAdapter();
    const origin = new URL(req.url).origin;
    
    // Exchange the code for an access token
    const brokerToken = await adapter.exchangeToken(token, MOCK_USER_ID, origin);

    // Save connection to DB
    const connectionId = `conn_${Date.now()}`;
    
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

    return NextResponse.redirect(`${origin}/dashboard/trade-journal/broker-sync?status=success`);

  } catch (error: any) {
    console.error("Upstox OAuth Callback Error:", error);
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/dashboard/trade-journal/broker-sync?status=error&message=${encodeURIComponent(error.message)}`);
  }
}
