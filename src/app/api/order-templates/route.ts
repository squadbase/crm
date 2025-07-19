import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderTemplates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentType = searchParams.get('paymentType');
    const serviceType = searchParams.get('serviceType');

    // フィルタリング条件がある場合のみフィルタリングを適用
    const whereConditions = [eq(orderTemplates.isActive, true)];

    if (paymentType) {
      whereConditions.push(eq(orderTemplates.paymentType, paymentType as 'onetime' | 'subscription'));
    }
    if (serviceType) {
      whereConditions.push(eq(orderTemplates.serviceType, serviceType as 'product' | 'project'));
    }

    const templates = await db.select().from(orderTemplates).where(and(...whereConditions));

    return NextResponse.json({
      templates: templates.map(template => ({
        templateId: template.templateId,
        paymentType: template.paymentType,
        serviceType: template.serviceType,
        templateName: template.templateName,
        amount: template.amount,
        description: template.description
      }))
    });
  } catch (error) {
    console.error('Error fetching order templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order templates' },
      { status: 500 }
    );
  }
}