import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { Course } from "@/app/models/Courses";

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

    const course = await Course.findOne({ courseId });
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const { title: courseName, rewards: reward } = course;

    const user = await User.findOne({ address });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.coursesCompleted.includes(courseId)) {
      return NextResponse.json(
        {
          success: false,
          message: `Course '${courseName}' has already been completed.`,
        },
        { status: 400 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { address },
      {
        $addToSet: { coursesCompleted: courseId },
        $inc: { balance: reward },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        reward,
        courseName,
        newBalance: updatedUser.balance,
        message: `Course '${courseName}' completed and reward of ${reward} tokens issued`,
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
