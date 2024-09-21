import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/next-app/lib/mongodb";
import { Progress } from "@/next-app/models/Progress";

export async function POST(req: NextRequest) {
  const { address, courseId, challengeId } = await req.json();

  if (!address || !courseId || !challengeId) {
    return NextResponse.json(
      { message: "Address, courseId, and challengeId are required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const progress = await Progress.findOneAndUpdate(
      { address, courseId, challengeId },
      { $inc: { hintsUsed: 1 } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, progress }, { status: 200 });
  } catch (error) {
    console.error("Error updating hint usage:", error);
    return NextResponse.json(
      { success: false, message: "Error updating hint usage" },
      { status: 500 }
    );
  }
}
