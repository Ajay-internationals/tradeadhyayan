import { google } from "googleapis";
import { prisma } from "@/lib/db";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
}

export async function getGoogleCalendarClient(userId: string) {
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    throw new Error("Google Calendar not connected for this user");
  }

  const oauth2Client = getOAuthClient();

  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.expiryDate?.getTime(),
  });

  // Auto-save refreshed tokens
  oauth2Client.on("tokens", async (tokens) => {
    await prisma.googleCalendarConnection.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token || connection.accessToken,
        refreshToken: tokens.refresh_token || connection.refreshToken,
        expiryDate: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : connection.expiryDate,
      },
    });
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export function getGoogleAuthUrl(userId: string) {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    state: userId,
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
}
