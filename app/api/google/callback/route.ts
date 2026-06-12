import { getOAuthClient } from "@/lib/google-calendar";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const userId = url.searchParams.get("state"); // userId passed as state param

  if (!code || !userId) {
    return NextResponse.json(
      { error: "Missing authorization code or user ID" },
      { status: 400 }
    );
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return NextResponse.json(
        { error: "Failed to retrieve access token" },
        { status: 400 }
      );
    }

    await prisma.googleCalendarConnection.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        scope: tokens.scope,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        scope: tokens.scope,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trade-adhyayan-next.vercel.app";
    return NextResponse.redirect(`${appUrl}/mentor/dashboard?calendar=connected`);
  } catch (error: any) {
    console.error("Google Calendar callback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
