import { NextRequest, NextResponse } from 'next/server';
import { updateOrderTemplate } from '@/models/order-templates';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean value' },
        { status: 400 }
      );
    }

    // Update template active status
    const updatedTemplate = await updateOrderTemplate(templateId, {
      isActive,
    });

    if (!updatedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTemplate);
  } catch {
    // Failed to update template status
    return NextResponse.json(
      { error: 'Failed to update template status' },
      { status: 500 }
    );
  }
}