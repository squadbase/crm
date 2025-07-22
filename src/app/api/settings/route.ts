import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Read environment variables only on server side
    const language = process.env.LANGUAGE || 'en';
    const currency = process.env.CURRENCY || 'usd';

    return NextResponse.json({
      language: language.toLowerCase(),
      currency: currency.toLowerCase()
    });
  } catch {
    // Settings API error
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}