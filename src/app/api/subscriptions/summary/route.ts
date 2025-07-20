import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions, subscriptionPaid, subscriptionAmounts } from '@/lib/db/schema';
import { count, sum, sql, and, or, eq, isNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 総サブスクリプション数
    const totalSubscriptionsResult = await db
      .select({ count: count() })
      .from(subscriptions);

    // アクティブサブスクリプション数（現在有効な料金設定があるもの）
    const activeSubscriptionsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${subscriptions.subscriptionId})` })
      .from(subscriptions)
      .leftJoin(subscriptionAmounts, eq(subscriptions.subscriptionId, subscriptionAmounts.subscriptionId))
      .where(
        and(
          or(
            isNull(subscriptionAmounts.endDate), // 終了日がnull（継続中）
            sql`${subscriptionAmounts.endDate} >= CURRENT_DATE` // または終了日が今日以降
          )
        )
      );

    // 月間売上予定（全アクティブサブスクリプションの現在料金合計）
    const monthlyRevenueResult = await db
      .select({ 
        totalAmount: sql<string>`SUM(${subscriptionAmounts.amount})` 
      })
      .from(subscriptionAmounts)
      .where(
        or(
          isNull(subscriptionAmounts.endDate), // 終了日がnull（継続中）
          sql`${subscriptionAmounts.endDate} >= CURRENT_DATE` // または終了日が今日以降
        )
      );

    // 今月の支払い状況
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const thisMonthPaymentResult = await db
      .select({
        paidAmount: sql<string>`SUM(CASE WHEN ${subscriptionPaid.isPaid} = true THEN ${subscriptionPaid.amount} ELSE 0 END)`,
        unpaidAmount: sql<string>`SUM(CASE WHEN ${subscriptionPaid.isPaid} = false THEN ${subscriptionPaid.amount} ELSE 0 END)`,
      })
      .from(subscriptionPaid)
      .where(
        and(
          eq(subscriptionPaid.year, currentYear),
          eq(subscriptionPaid.month, currentMonth)
        )
      );

    const totalSubscriptions = totalSubscriptionsResult[0]?.count || 0;
    const activeSubscriptions = activeSubscriptionsResult[0]?.count || 0;
    const totalMonthlyRevenue = monthlyRevenueResult[0]?.totalAmount || '0';
    const paidThisMonth = thisMonthPaymentResult[0]?.paidAmount || '0';
    const unpaidThisMonth = thisMonthPaymentResult[0]?.unpaidAmount || '0';

    return NextResponse.json({
      totalSubscriptions,
      activeSubscriptions,
      totalMonthlyRevenue,
      paidThisMonth,
      unpaidThisMonth,
    });
  } catch (error) {
    console.error('Subscriptions summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions summary' },
      { status: 500 }
    );
  }
}