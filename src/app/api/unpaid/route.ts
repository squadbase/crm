import { NextResponse } from 'next/server';
import { getUnpaidPayments } from '@/models/unpaid';

export async function GET() {
  try {
    const result = await getUnpaidPayments();
    
    return NextResponse.json({
      unpaidPayments: result.unpaidPayments,
      totalCount: result.totalCount,
      totalAmount: result.totalAmount,
      currentMonthStart: result.currentMonthStart,
    });

  } catch {
    // Unpaid payments API error
    return NextResponse.json(
      { error: 'Failed to fetch unpaid payments' },
      { status: 500 }
    );
  }
}