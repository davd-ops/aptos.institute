import { NextRequest, NextResponse } from "next/server";
import { getQuestTokenBalance } from "@/app/lib/aptos";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    // Check if the userAddress is provided
    if (!address) {
      return NextResponse.json(
        { message: "User address is required." },
        { status: 400 }
      );
    }

    // Call the getQuestTokenBalance function to get the user's balance
    const balance = await getQuestTokenBalance(address);

    return NextResponse.json(
      {
        success: true,
        balance,
        message: `QUEST token balance for ${address}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching QUEST token balance:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching QUEST token balance." },
      { status: 500 }
    );
  }
}
