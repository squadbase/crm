import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

    // テンプレートが存在し、アクティブかどうか確認
    const template = await db
      .select()
      .from(orderTemplates)
      .where(eq(orderTemplates.templateId, templateId))
      .limit(1);

    if (template.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template[0].isActive) {
      return NextResponse.json(
        { error: 'Template is not active' },
        { status: 400 }
      );
    }

    // テンプレートデータを返す（注文作成ページで使用）
    return NextResponse.json({
      template: template[0],
      message: 'Template is ready for order creation'
    });
  } catch (error) {
    console.error('Failed to prepare template for order creation:', error);
    return NextResponse.json(
      { error: 'Failed to prepare template for order creation' },
      { status: 500 }
    );
  }
}