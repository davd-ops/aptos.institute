import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";

export async function POST(req: NextRequest) {
  try {
    const { address, courseId } = await req.json();

    if (!address || !courseId) {
      return NextResponse.json(
        { message: "Address and courseId are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { address },
      { $addToSet: { coursesCompleted: courseId } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // TODO: Implement reward logic here

    return NextResponse.json(
      {
        success: true,
        reward: 10,
        courseName: "Aptos Course 1",
        message: "Course completed and reward issued",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing course:", error);
    return NextResponse.json(
      { success: false, message: "Error completing course" },
      { status: 500 }
    );
  }
}
