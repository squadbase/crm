import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // サーバーサイドでのみ環境変数を読み取り
    const language = process.env.LANGUAGE || 'en';
    const currency = process.env.CURRENCY || 'usd';

    return NextResponse.json({
      language: language.toLowerCase(),
      currency: currency.toLowerCase()
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}