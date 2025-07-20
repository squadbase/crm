import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions, subscriptionPaid, subscriptionAmounts } from '@/lib/db/schema';
import { sql, or, eq, isNull } from 'drizzle-orm';

export async function GET() {
  try {
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

    // 総未払い金額（全ての期間の未払い合計）
    const totalUnpaidResult = await db
      .select({
        totalUnpaid: sql<string>`SUM(${subscriptionPaid.amount})`
      })
      .from(subscriptionPaid)
      .where(eq(subscriptionPaid.isPaid, false));

    // 平均継続月数の計算
    const continuationMonthsResult = await db
      .select({
        subscriptionId: subscriptions.subscriptionId,
        startDate: sql<string>`MIN(${subscriptionAmounts.startDate})`,
        endDate: sql<string>`MAX(${subscriptionAmounts.endDate})`
      })
      .from(subscriptions)
      .leftJoin(subscriptionAmounts, eq(subscriptions.subscriptionId, subscriptionAmounts.subscriptionId))
      .groupBy(subscriptions.subscriptionId);

    // 各サブスクリプションの継続月数を計算
    let totalMonths = 0;
    let subscriptionCount = 0;
    const currentDate = new Date();

    for (const sub of continuationMonthsResult) {
      if (sub.startDate) {
        const startDate = new Date(sub.startDate);
        const endDate = sub.endDate ? new Date(sub.endDate) : currentDate;
        
        // 月数の差を計算
        const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (endDate.getMonth() - startDate.getMonth()) + 1;
        
        totalMonths += monthDiff;
        subscriptionCount++;
      }
    }

    const averageContinuationMonths = subscriptionCount > 0 ? totalMonths / subscriptionCount : 0;

    const totalMonthlyRevenue = monthlyRevenueResult[0]?.totalAmount || '0';
    const totalUnpaid = totalUnpaidResult[0]?.totalUnpaid || '0';

    return NextResponse.json({
      totalMonthlyRevenue,
      totalUnpaid,
      averageContinuationMonths,
    });
  } catch (error) {
    console.error('Subscriptions summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions summary' },
      { status: 500 }
    );
  }
}