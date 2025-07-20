import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions, customers, subscriptionAmounts, subscriptionPaid } from '@/lib/db/schema';
import { eq, desc, and, isNull, or } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;
    console.log('Fetching subscription detail for ID:', subscriptionId);

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // サブスクリプション基本情報を取得
    const subscriptionData = await db
      .select({
        subscriptionId: subscriptions.subscriptionId,
        customerId: subscriptions.customerId,
        description: subscriptions.description,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        customerName: customers.customerName,
      })
      .from(subscriptions)
      .leftJoin(customers, eq(subscriptions.customerId, customers.customerId))
      .where(eq(subscriptions.subscriptionId, subscriptionId))
      .limit(1);

    if (subscriptionData.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const subscription = subscriptionData[0];
    console.log('Found subscription:', subscription);

    // サブスクリプション料金履歴を取得
    const amounts = await db
      .select()
      .from(subscriptionAmounts)
      .where(eq(subscriptionAmounts.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionAmounts.startDate));
    
    console.log('Found amounts:', amounts.length);

    // 現在有効な料金を取得（endDateがnullまたは今日以降のもので最新）
    const currentDate = new Date().toISOString().split('T')[0];
    const currentAmount = amounts.find(
      amount => amount.endDate === null || amount.endDate >= currentDate
    );

    // 支払い履歴を取得
    const payments = await db
      .select()
      .from(subscriptionPaid)
      .where(eq(subscriptionPaid.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionPaid.year), desc(subscriptionPaid.month));
    
    console.log('Found payments:', payments.length);

    // 支払い統計を計算
    const totalPaid = payments
      .filter(payment => payment.isPaid)
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    const totalUnpaid = payments
      .filter(payment => !payment.isPaid)
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    // ステータスを決定（支払い済みのレコードがあるかどうか）
    const status = payments.some(payment => payment.isPaid) ? 'active' : 'inactive';

    const response = {
      subscription: {
        subscriptionId: subscription.subscriptionId,
        customerId: subscription.customerId,
        customerName: subscription.customerName || 'Unknown Customer',
        description: subscription.description,
        status: status,
        createdAt: subscription.createdAt ? new Date(subscription.createdAt).toISOString() : null,
        updatedAt: subscription.updatedAt ? new Date(subscription.updatedAt).toISOString() : null,
        currentAmount: currentAmount ? parseFloat(currentAmount.amount) : 0,
        totalPaid: totalPaid,
        totalUnpaid: totalUnpaid,
      },
      amounts: amounts.map(amount => ({
        amountId: amount.amountId,
        subscriptionId: amount.subscriptionId,
        amount: parseFloat(amount.amount),
        startDate: amount.startDate,
        endDate: amount.endDate,
        createdAt: amount.createdAt ? new Date(amount.createdAt).toISOString() : null,
        updatedAt: amount.updatedAt ? new Date(amount.updatedAt).toISOString() : null,
      })),
      payments: payments.map(payment => ({
        paidId: payment.paidId,
        subscriptionId: payment.subscriptionId,
        year: payment.year,
        month: payment.month,
        amount: parseFloat(payment.amount),
        isPaid: payment.isPaid,
        createdAt: payment.createdAt ? new Date(payment.createdAt).toISOString() : null,
        updatedAt: payment.updatedAt ? new Date(payment.updatedAt).toISOString() : null,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Subscription detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}