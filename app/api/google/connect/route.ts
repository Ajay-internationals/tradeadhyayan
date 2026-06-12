import { getGoogleAuthUrl } from "@/lib/google-calendar";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const url = getGoogleAuthUrl(userId);
  return NextResponse.redirect(url);
}
