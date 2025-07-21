import { NextRequest, NextResponse } from 'next/server';
import { getOrderTemplateById } from '@/models/order-templates';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;

    // テンプレートが存在し、アクティブかどうか確認
    const template = await getOrderTemplateById(templateId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.isActive) {
      return NextResponse.json(
        { error: 'Template is not active' },
        { status: 400 }
      );
    }

    // テンプレートデータを返す（注文作成ページで使用）
    return NextResponse.json({
      template: template,
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