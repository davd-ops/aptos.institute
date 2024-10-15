import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Course } from "@/app/models/Courses";

const courses = [
  {
    courseId: "course_1",
    title: "Aptos: Fundamentals of Blockchain Development",
    description:
      "Learn the essential concepts of blockchain development using Aptos. This course guides you through the creation of smart contracts, managing data with structs, vectors, tables, and implementing key blockchain features with practical challenges.",
    tags: ["Aptos", "Blockchain", "MOVE", "Beginner"],
    imageUrl: "/images/course_1.png",
    price: 0,
    rewards: 10,
  },
  {
    courseId: "course_2",
    title: "Aptos: First Fungible Asset",
    description:
      "Learn how to create, manage, and interact with fungible assets on the Aptos blockchain. This course covers token creation, minting, transferring, burning, and advanced features like freezing accounts and managing metadata. By the end, you'll have built a fully functional fungible asset.",
    tags: ["Aptos", "Blockchain", "Intermediate", "MOVE", "Fungible Assets"],
    imageUrl: "/images/course_2.png",
    price: 10,
    rewards: 30,
  },
  {
    courseId: "course_3",
    title: "Aptos: First Digital Asset",
    description:
      "Dive into best security practices for smart contract development on Aptos.",
    tags: ["Aptos", "Blockchain", "Advanced", "MOVE", "Digital Assets"],
    imageUrl: "/images/course_3.png",
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
