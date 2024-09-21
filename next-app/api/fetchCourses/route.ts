import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Course } from "@/app/models/Courses";

export async function GET() {
  try {
    await connectToDatabase();
    const courses = await Course.find();

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching courses", error },
      { status: 500 }
    );
  }
}
