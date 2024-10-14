import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };

    if (!decoded.address) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseId, price } = await req.json();

    if (
      !courseId ||
      typeof courseId !== "string" ||
      typeof price !== "number"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ address: decoded.address });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Ensure coursesUnlocked is initialized as an array
    if (!Array.isArray(user.coursesUnlocked)) {
      user.coursesUnlocked = [];
    }

    // Check if the course is already unlocked
    if (user.coursesUnlocked.includes(courseId)) {
      return NextResponse.json(
        { success: false, message: "Course already unlocked" },
        { status: 400 }
      );
    }

    // Unlock the course by adding the courseId to the user's coursesUnlocked array
    user.coursesUnlocked.push(courseId);

    // Save the user document
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Course unlocked successfully",
        user: {
          coursesUnlocked: user.coursesUnlocked,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unlocking course:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
