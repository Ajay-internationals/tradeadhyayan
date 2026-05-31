import { NextResponse } from "next/server";
import { runAutoDetectMistakes } from "@/app/actions/trades";

const DEFAULT_EMAIL = "test_prod_user_2026@example.com";

export async function POST() {
  try {
    const updatedMistakes = await runAutoDetectMistakes(DEFAULT_EMAIL);
    return NextResponse.json({ success: true, count: updatedMistakes.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
