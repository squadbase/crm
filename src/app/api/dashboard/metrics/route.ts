import { NextRequest, NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/models/dashboard';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const result = await getDashboardMetrics(startDate || undefined, endDate || undefined);
    return NextResponse.json(result);
  } catch {
    // Dashboard metrics API error
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}