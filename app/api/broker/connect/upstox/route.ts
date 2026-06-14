import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const origin = new URL(req.url).origin;

    // Redirect to the main oauth init endpoint
    const redirectUrl = `${origin}/api/brokers/oauth/init?broker=upstox&email=${encodeURIComponent(email)}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Upstox Connect Redirect Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
