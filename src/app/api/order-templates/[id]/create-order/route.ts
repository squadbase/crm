import { NextRequest, NextResponse } from 'next/server';
import { getOrderTemplateById } from '@/models/order-templates';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;

    // Check if template exists and is active
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

    // Return template data (used by order creation page)
    return NextResponse.json({
      template: template,
      message: 'Template is ready for order creation'
    });
  } catch {
    // Failed to prepare template for order creation
    return NextResponse.json(
      { error: 'Failed to prepare template for order creation' },
      { status: 500 }
    );
  }
}