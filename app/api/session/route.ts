import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedToken extends jwt.JwtPayload {
  address: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    return NextResponse.json({
      loggedIn: true,
      address: decoded.address, 
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
