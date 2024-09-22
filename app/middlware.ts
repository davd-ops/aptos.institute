import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    jwt.verify(token, JWT_SECRET);

    return NextResponse.next();
  } catch (error) {
    console.error("Invalid or expired JWT token:", error);

    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
    matcher: ['/profile', '/course/:path*'], 
  };