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
      return NextResponse.json(
        { valid: false, message: "No token found" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    return NextResponse.json(
      { valid: true, address: decoded.address },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { valid: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
