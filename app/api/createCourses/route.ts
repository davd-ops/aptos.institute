import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Course } from "@/app/models/Courses";

const courses = [
  {
    courseId: "course_1",
    title: "Aptos: Beginner's Guide to Blockchain",
    description: "An introduction to blockchain technology using Aptos.",
    tags: ["Aptos", "Blockchain", "Beginner"],
    imageUrl: "/images/aptos.png",
    price: 0,
    rewards: 10,
  },
  {
    courseId: "course_2",
    title: "MOVE: Aptos Programming Language Masterclass",
    description:
      "Learn how to write, deploy, and manage smart contracts using the MOVE language on Aptos.",
    tags: ["MOVE", "Aptos", "Intermediate"],
    imageUrl: "/images/move.png",
    price: 0,
    rewards: 15,
  },
  {
    courseId: "course_3",
    title: "Aptos: Security Best Practices",
    description:
      "Dive into best security practices for smart contract development on Aptos.",
    tags: ["Aptos", "Security", "Advanced"],
    imageUrl: "/images/aptos-security.png",
    price: 25,
    rewards: 50,
  },
];

export async function POST() {
  try {
    await connectToDatabase();

    for (const course of courses) {
      const existingCourse = await Course.findOne({
        courseId: course.courseId,
      });

      if (!existingCourse) {
        await Course.create(course);
      }
    }

    return NextResponse.json({ message: "Courses created" }, { status: 201 });
  } catch (error) {
    console.error("Error creating courses:", error);
    return NextResponse.json(
      { message: "Error creating courses" },
      { status: 500 }
    );
  }
}
