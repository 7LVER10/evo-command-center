import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Password required' },
        { status: 400 }
      );
    }

    const ownerPassword = process.env.EVO_OWNER_PASSWORD;

    if (!ownerPassword) {
      console.error('EVO_OWNER_PASSWORD environment variable not set');
      return NextResponse.json(
        { valid: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const isValid = password === ownerPassword;

    return NextResponse.json({ valid: isValid });
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
