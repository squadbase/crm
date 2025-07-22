import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptions, getSubscriptionCount, getSubscriptionPaymentSummary, createSubscription, SubscriptionFilters } from '@/models/subscriptions';
import { db } from '@/lib/db';
import { subscriptionAmounts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    // Build filter object
    const filters: SubscriptionFilters = {};
    const offset = (page - 1) * limit;
    
    if (search) {
      filters.search = search;
    }

    // Fetch data
    const [subscriptionsData, total] = await Promise.all([
      getSubscriptions({
        filters,
        sort: { field: 'startDate', direction: 'desc' },
        limit,
        offset
      }),
      getSubscriptionCount(filters)
    ]);

    // Get detailed information for each subscription
    const enrichedSubscriptions = await Promise.all(
      subscriptionsData.map(async (sub) => {
        const paymentSummary = await getSubscriptionPaymentSummary(sub.subscriptionId);
        
        // Get subscription pricing history to calculate current amount and contract end date
        const amounts = await db
          .select()
          .from(subscriptionAmounts)
          .where(eq(subscriptionAmounts.subscriptionId, sub.subscriptionId))
          .orderBy(desc(subscriptionAmounts.startDate));

        // Get current date and time
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Get pricing valid for current date (start date <= current date <= end date or end date is null)
        const currentAmountRecord = amounts.find(a => {
          const startDate = a.startDate;
          const endDate = a.endDate;
          
          // Start date is before or equal to current date and (end date is null or end date is after current date)
          return startDate <= today && (!endDate || endDate > today);
        });
        
        const currentAmount = currentAmountRecord ? parseFloat(currentAmountRecord.amount) : 0;
        
        // Get the latest pricing configuration (record with most recent start date)
        const latestAmountRecord = amounts.length > 0 ? amounts[0] : null;
        const latestAmount = latestAmountRecord ? parseFloat(latestAmountRecord.amount) : 0;
        
        // Get end date of the last terminated contract if it exists
        const lastEndedAmount = amounts.find(a => a.endDate);
        const endDate = lastEndedAmount ? lastEndedAmount.endDate : null;

        // Status determination (active if there's valid pricing for current date, inactive otherwise)
        const status = currentAmountRecord ? 'active' : 'inactive';

        return {
          ...sub,
          currentAmount: currentAmount,
          latestAmount: latestAmount,
          startDate: sub.startDate ? sub.startDate.toString() : null,
          endDate: endDate ? endDate.toString() : null,
          totalPaid: paymentSummary.paidAmount,
          totalUnpaid: paymentSummary.unpaidAmount,
          totalAmount: paymentSummary.totalAmount, // Add payment total separately
          status
        };
      })
    );

    const filteredSubscriptions = enrichedSubscriptions;

    return NextResponse.json({
      subscriptions: filteredSubscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    // Subscriptions API error
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, description } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await createSubscription({
      customerId,
      description: description || null
    });

    return NextResponse.json({
      subscription: {
        subscriptionId: subscription.subscriptionId,
        customerId: subscription.customerId,
        description: subscription.description,
        createdAt: subscription.createdAt ? new Date(subscription.createdAt).toISOString() : null,
        updatedAt: subscription.updatedAt ? new Date(subscription.updatedAt).toISOString() : null,
      }
    });
  } catch {
    // Subscription creation error
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}