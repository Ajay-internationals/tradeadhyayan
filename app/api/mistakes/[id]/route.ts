import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mistakeId = params.id;
    await prisma.mistake.delete({
      where: { id: mistakeId }
    });
    return NextResponse.json({ success: true, message: "Mistake deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
