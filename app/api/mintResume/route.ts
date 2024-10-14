import { NextRequest, NextResponse } from "next/server";
import { mintResume } from "@/app/lib/aptos";

export async function POST(req: NextRequest) {
  try {
    const { description, name, baseUri, recipientAddress } = await req.json();

    // Check if all required parameters are provided
    if (!description || !name || !baseUri || !recipientAddress) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Call the mintResume function to mint the developer resume for the user
    const transactionHash = await mintResume(
      description,
      name,
      baseUri,
      recipientAddress
    );

    return NextResponse.json(
      {
        success: true,
        transactionHash,
        message: `Successfully minted resume for ${recipientAddress}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error minting resume:", error);
    return NextResponse.json(
      { success: false, message: "Error minting resume." },
      { status: 500 }
    );
  }
}
