import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";

export async function POST(req: NextRequest) {
  const { address } = await req.json();

  if (!address) {
    return NextResponse.json(
      { message: "Address is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    let existingUser = await User.findOne({ address });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    } else {
      const userCount = await User.countDocuments();
      const userName = `User${userCount}`;

      const newUser = new User({ address, userName });
      await newUser.save();

      return NextResponse.json(
        { success: true, message: "User created successfully" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Error creating user" },
      { status: 500 }
    );
  }
}
