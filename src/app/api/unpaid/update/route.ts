import { NextRequest, NextResponse } from 'next/server';
import { updatePaymentStatus } from '@/models/unpaid';

interface UpdateRequest {
  items: Array<{
    id: string;
    type: 'onetime' | 'subscription';
    subscriptionId?: string;
    year?: number;
    month?: number;
  }>;
}

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateRequest = await request.json();
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: items array is required' },
        { status: 400 }
      );
    }

    const results = await updatePaymentStatus(body.items);
    
    // Count successful and failed updates
    const successCount = results.filter(r => r.result && r.result.length > 0).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: failureCount === 0,
      updatedCount: successCount,
      failedCount: failureCount,
      results: results.map(r => ({
        type: r.type,
        success: r.result && r.result.length > 0,
        result: r.result
      }))
    });

  } catch {
    // Payment update API error
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}