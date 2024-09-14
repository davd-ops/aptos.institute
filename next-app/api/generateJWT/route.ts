import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });

    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, //1h
    });

    return response;
  } catch (error) {
    console.error('JWT generation error:', error);
    return NextResponse.json({ error: 'JWT generation failed' }, { status: 500 });
  }
}
