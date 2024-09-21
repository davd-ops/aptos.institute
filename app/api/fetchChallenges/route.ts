import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Challenge } from "@/app/models/Challenges";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    await connectToDatabase();

    const challenges = await Challenge.find();
    return NextResponse.json({ challenges }, { status: 200 });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { message: "Error fetching challenges" },
      { status: 500 }
    );
  }
}
