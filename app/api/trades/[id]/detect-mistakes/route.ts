import { NextResponse } from "next/server";
import { detectAndSaveMistakesForTrade } from "@/app/actions/trades";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tradeId = params.id;
    await detectAndSaveMistakesForTrade(DEFAULT_USER_ID, tradeId);
    return NextResponse.json({ success: true, message: "Mistakes analyzed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
