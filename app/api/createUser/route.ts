import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { mintResume } from "@/app/lib/aptos";

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

    const existingUser = await User.findOne({ address });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    } else {
      const userCount = await User.countDocuments();
      const userName = `User${userCount}`;

      // Create the new user
      const newUser = new User({ address, userName });
      await newUser.save();

      // Mint the developer resume NFT for the new user
      const description = "Developer Resume for Aptos Courses";
      const name = `Developer Resume ${userCount}`;
      const baseUri = "https://aptos-institute.vercel.app/resume/";

      const transactionHash = await mintResume(
        description,
        name,
        baseUri,
        address
      );

      return NextResponse.json(
        {
          success: true,
          message: "User created successfully and resume NFT minted.",
          transactionHash,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating user or minting NFT:", error);
    return NextResponse.json(
      { success: false, message: "Error creating user or minting NFT" },
      { status: 500 }
    );
  }
}
