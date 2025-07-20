import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, subscriptionPaid } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

    const results = [];
    
    // 各アイテムを個別に処理
    for (const item of body.items) {
      try {
        if (item.type === 'onetime') {
          // Onetime orders の支払い状態を更新
          await db
            .update(orders)
            .set({ 
              isPaid: true,
              updatedAt: new Date()
            })
            .where(eq(orders.orderId, item.id));
          
          results.push({
            id: item.id,
            type: 'onetime',
            success: true
          });
          
        } else if (item.type === 'subscription') {
          // Subscription payments の支払い状態を更新
          if (!item.subscriptionId || !item.year || !item.month) {
            results.push({
              id: item.id,
              type: 'subscription',
              success: false,
              error: 'Missing subscription details'
            });
            continue;
          }
          
          await db
            .update(subscriptionPaid)
            .set({ 
              isPaid: true,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(subscriptionPaid.subscriptionId, item.subscriptionId),
                eq(subscriptionPaid.year, item.year),
                eq(subscriptionPaid.month, item.month)
              )
            );
          
          results.push({
            id: item.id,
            type: 'subscription',
            success: true
          });
        } else {
          results.push({
            id: item.id,
            type: item.type,
            success: false,
            error: 'Invalid item type'
          });
        }
      } catch (itemError) {
        console.error(`Error updating item ${item.id}:`, itemError);
        results.push({
          id: item.id,
          type: item.type,
          success: false,
          error: 'Database update failed'
        });
      }
    }

    // 成功した件数と失敗した件数を集計
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failureCount === 0,
      updatedCount: successCount,
      failedCount: failureCount,
      results
    });

  } catch (error) {
    console.error('Payment update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}