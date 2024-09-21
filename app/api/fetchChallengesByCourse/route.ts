import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Challenge } from "@/app/models/Challenges";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { message: "Course ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const challenges = await Challenge.find({ courseId });

    return NextResponse.json({ challenges }, { status: 200 });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { message: "Error fetching challenges" },
      { status: 500 }
    );
  }
}
