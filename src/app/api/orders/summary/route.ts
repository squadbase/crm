import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { sum, sql, gte, lte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesStartDt = searchParams.get('salesStartDt');
    const salesEndDt = searchParams.get('salesEndDt');

    // WHERE条件を構築 (salesAtベースでフィルタリング)
    const onetimeConditions = [];
    
    if (salesStartDt) {
      onetimeConditions.push(gte(orders.salesAt, new Date(salesStartDt)));
    }
    if (salesEndDt) {
      onetimeConditions.push(lte(orders.salesAt, new Date(salesEndDt)));
    }

    // 一回払い注文の集計（選んだ期間のtotalAmountとunpaidAmountのみ）
    const onetimeSummary = await db
      .select({
        totalAmount: sum(orders.amount),
        unpaidAmount: sql<string>`SUM(CASE WHEN ${orders.isPaid} = false THEN ${orders.amount} ELSE 0 END)`,
      })
      .from(orders)
      .where(onetimeConditions.length > 0 ? and(...onetimeConditions) : undefined);

    // 合計を計算（一回払いのみを対象とする）
    const onetimeData = onetimeSummary[0];

    const summary = {
      totalAmount: onetimeData.totalAmount || '0',
      unpaidAmount: onetimeData.unpaidAmount || '0',
    };

    return NextResponse.json({
      summary,
      serviceTypes: [], // 不要になったので空配列
    });
  } catch (error) {
    console.error('Orders summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders summary' },
      { status: 500 }
    );
  }
}