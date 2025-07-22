import { NextResponse } from 'next/server';
import { getOrderTemplatesSummary } from '@/models/order-templates';

export async function GET() {
  try {
    const summary = await getOrderTemplatesSummary();

    return NextResponse.json({
      totalTemplates: summary.totalCount,
      activeTemplates: summary.activeCount,
      inactiveTemplates: summary.inactiveCount
    });
  } catch {
    // Failed to fetch template summary
    return NextResponse.json(
      { error: 'Failed to fetch template summary' },
      { status: 500 }
    );
  }
}