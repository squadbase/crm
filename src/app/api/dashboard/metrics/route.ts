import { NextRequest, NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/app/models/dashboard';

export async function GET(request: NextRequest) {
  try {
    const result = await getDashboardMetrics();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Dashboard metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}