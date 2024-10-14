import { NextRequest, NextResponse } from "next/server";
import { updateResumeProgress } from "@/app/lib/aptos";

export async function POST(req: NextRequest) {
  try {
    const {
      userAddress,
      courseName,
      challenges,
      courseId,
      courseIdU64,
      score,
      scoreU64,
      attempts,
      hints,
    } = await req.json();

    // Check if all required parameters are provided
    if (
      !userAddress ||
      !courseName ||
      !challenges ||
      !courseId ||
      !courseIdU64 ||
      !score ||
      !scoreU64 ||
      !attempts ||
      !hints
    ) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Call the updateResumeProgress function to update the developer's resume progress
    const transactionHash = await updateResumeProgress(
      userAddress,
      courseName,
      challenges,
      courseId,
      courseIdU64,
      score,
      scoreU64,
      attempts,
      hints
    );

    return NextResponse.json(
      {
        success: true,
        transactionHash,
        message: `Successfully updated resume progress for ${userAddress}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating resume progress:", error);
    return NextResponse.json(
      { success: false, message: "Error updating resume progress." },
      { status: 500 }
    );
  }
}
