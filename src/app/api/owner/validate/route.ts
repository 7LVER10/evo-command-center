import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Token required' },
        { status: 400 }
      );
    }

    const ownerToken = process.env.EVO_OWNER_TOKEN;

    if (!ownerToken) {
      return NextResponse.json(
        { valid: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const isValid = password === ownerToken;

    return NextResponse.json({ valid: isValid });
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
