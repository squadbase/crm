import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, subscriptionPaid } from '@/lib/db/schema';
import { sum, count, sql, gte, lte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salesStartDt = searchParams.get('salesStartDt');
    const salesEndDt = searchParams.get('salesEndDt');

    // WHERE条件を構築 (createdAtベースでフィルタリング)
    const onetimeConditions = [];
    const subscriptionConditions = [];
    
    if (salesStartDt) {
      onetimeConditions.push(gte(orders.createdAt, new Date(salesStartDt)));
      subscriptionConditions.push(sql`make_date(${subscriptionPaid.year}, ${subscriptionPaid.month}, 1) >= ${salesStartDt}`);
    }
    if (salesEndDt) {
      onetimeConditions.push(lte(orders.createdAt, new Date(salesEndDt)));
      subscriptionConditions.push(sql`make_date(${subscriptionPaid.year}, ${subscriptionPaid.month}, 1) <= ${salesEndDt}`);
    }

    // 一回払い注文の集計
    const onetimeSummary = await db
      .select({
        totalOrders: count(),
        totalAmount: sum(orders.amount),
        paidAmount: sql<string>`SUM(CASE WHEN ${orders.isPaid} = true THEN ${orders.amount} ELSE 0 END)`,
        unpaidAmount: sql<string>`SUM(CASE WHEN ${orders.isPaid} = false THEN ${orders.amount} ELSE 0 END)`,
      })
      .from(orders)
      .where(onetimeConditions.length > 0 ? and(...onetimeConditions) : undefined);

    // サブスクリプション支払いの集計
    const subscriptionSummary = await db
      .select({
        totalOrders: count(),
        totalAmount: sum(subscriptionPaid.amount),
        paidAmount: sql<string>`SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END)`,
        unpaidAmount: sql<string>`SUM(CASE WHEN ${subscriptionPaid.isPaid} = false THEN ${subscriptionPaid.amount} ELSE 0 END)`,
      })
      .from(subscriptionPaid)
      .where(subscriptionConditions.length > 0 ? and(...subscriptionConditions) : undefined);

    // 合計を計算
    const onetimeData = onetimeSummary[0];
    const subscriptionData = subscriptionSummary[0];

    const combinedSummary = {
      totalOrders: Number(onetimeData.totalOrders) + Number(subscriptionData.totalOrders),
      totalAmount: (parseFloat(onetimeData.totalAmount || '0') + parseFloat(subscriptionData.totalAmount || '0')).toString(),
      paidAmount: (parseFloat(onetimeData.paidAmount || '0') + parseFloat(subscriptionData.paidAmount || '0')).toString(),
      unpaidAmount: (parseFloat(onetimeData.unpaidAmount || '0') + parseFloat(subscriptionData.unpaidAmount || '0')).toString(),
    };

    // サービス種別ごとの集計（一回払いとサブスクリプションの2種類）
    const serviceTypeSummary = [
      {
        serviceType: 'onetime',
        count: Number(onetimeData.totalOrders),
        totalAmount: onetimeData.totalAmount || '0',
      },
      {
        serviceType: 'subscription',
        count: Number(subscriptionData.totalOrders),
        totalAmount: subscriptionData.totalAmount || '0',
      }
    ];

    return NextResponse.json({
      summary: combinedSummary,
      serviceTypes: serviceTypeSummary,
    });
  } catch (error) {
    console.error('Orders summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders summary' },
      { status: 500 }
    );
  }
}