import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Progress } from "@/app/models/Progress";

export async function POST(req: NextRequest) {
  const { address, courseId, challengeId, success } = await req.json();

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
      {
        $inc: { attempts: 1 },
        completed: success ? true : false,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, progress }, { status: 200 });
  } catch (error) {
    console.error("Error updating challenge progress:", error);
    return NextResponse.json(
      { success: false, message: "Error updating progress" },
      { status: 500 }
    );
  }
}
