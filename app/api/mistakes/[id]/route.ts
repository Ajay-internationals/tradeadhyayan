import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mistakeId = params.id;
    const { status, rootCause, mentorNote } = await request.json();

    // Try updating TradeMistake first
    try {
      const updatedTradeMistake = await prisma.tradeMistake.update({
        where: { id: mistakeId },
        data: {
          status: status || undefined,
          rootCause: rootCause !== undefined ? rootCause : undefined,
          mentorNote: mentorNote !== undefined ? mentorNote : undefined,
        }
      });
      return NextResponse.json({ success: true, updated: updatedTradeMistake, type: "TradeMistake" });
    } catch (dbErr: any) {
      // RecordNotFound error code is P2025
      if (dbErr.code === "P2025") {
        // Fallback to legacy Mistake model
        const dataToUpdate: any = {};
        if (status === "REVIEWED") {
          dataToUpdate.reviewed = true;
        } else if (status === "FIXED") {
          dataToUpdate.userConfirmed = true;
        } else if (status === "OPEN") {
          dataToUpdate.reviewed = false;
          dataToUpdate.userConfirmed = false;
        }

        if (rootCause) {
          dataToUpdate.reason = rootCause; // map rootCause to reason in legacy Mistake
        }

        const updatedMistake = await prisma.mistake.update({
          where: { id: mistakeId },
          data: dataToUpdate
        });
        return NextResponse.json({ success: true, updated: updatedMistake, type: "Mistake" });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("Error in PATCH /api/mistakes/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mistakeId = params.id;

    // Try deleting from TradeMistake first
    try {
      await prisma.tradeMistake.delete({
        where: { id: mistakeId }
      });
      return NextResponse.json({ success: true, message: "Trade mistake deleted." });
    } catch (dbErr: any) {
      if (dbErr.code === "P2025") {
        // Fallback to legacy Mistake model
        await prisma.mistake.delete({
          where: { id: mistakeId }
        });
        return NextResponse.json({ success: true, message: "Legacy mistake deleted." });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("Error in DELETE /api/mistakes/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
