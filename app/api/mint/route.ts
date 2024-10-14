import { NextRequest, NextResponse } from "next/server";
import { mintTokens } from "@/app/lib/aptos";

export async function POST(req: NextRequest) {
  try {
    const { address, amount } = await req.json();

    // Check if the address and amount are provided
    if (!address || !amount) {
      return NextResponse.json(
        { message: "Address and amount are required." },
        { status: 400 }
      );
    }

    // Call the mintTokens function to mint tokens for the user
    const transactionHash = await mintTokens(address, amount);

    return NextResponse.json(
      {
        success: true,
        transactionHash,
        message: `Successfully minted ${amount} tokens to ${address}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error minting tokens:", error);
    return NextResponse.json(
      { success: false, message: "Error minting tokens." },
      { status: 500 }
    );
  }
}
