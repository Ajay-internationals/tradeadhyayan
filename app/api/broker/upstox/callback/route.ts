import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpstoxAdapter } from "@/lib/brokers/upstox.adapter";

export const dynamic = "force-dynamic";

const MOCK_USER_ID = "cmp86dqje0000l2040im7xgg1";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("code");
    
    if (!token) {
      return NextResponse.json({ error: "Missing authorization code in callback" }, { status: 400 });
    }

    const cookieHeader = req.headers.get("cookie") || "";
    const emailCookie = cookieHeader.split(";").find(c => c.trim().startsWith("oauth_user_email="));
    const email = emailCookie ? decodeURIComponent(emailCookie.split("=")[1].trim()) : null;

    let userId = MOCK_USER_ID;
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      if (user) {
        userId = user.id;
      }
    }

    const adapter = new UpstoxAdapter();
    const origin = new URL(req.url).origin;
    
    // Exchange the code for an access token
    const brokerToken = await adapter.exchangeToken(token, userId, origin);

    // Save connection to DB
    const connectionId = `conn_${Date.now()}`;
    
    const existing = await prisma.brokerConnection.findFirst({
      where: { userId, brokerName: adapter.brokerName }
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
          userId,
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
