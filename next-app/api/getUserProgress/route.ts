import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Progress } from "@/app/models/Progress";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const courseId = searchParams.get("courseId");

  if (!address || !courseId) {
    return NextResponse.json(
      { message: "Address and courseId are required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const progress = await Progress.find({ address, courseId });

    if (!progress.length) {
      return NextResponse.json(
        { success: true, progress: [], completedChallenges: 0 },
        { status: 200 }
      );
    }

    const completedChallenges = progress.filter((p) => p.completed).length;

    return NextResponse.json({
      success: true,
      progress,
      completedChallenges,
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching progress" },
      { status: 500 }
    );
  }
}
