import { NextRequest, NextResponse } from 'next/server';
import { getOrderTemplateById, updateOrderTemplate, deleteOrderTemplate } from '@/models/order-templates';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;

    const template = await getOrderTemplateById(templateId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch {
    // Failed to fetch template
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;
    const body = await request.json();
    const { templateName, paymentType, amount, description, isActive } = body;

    // Validation
    if (!templateName || !paymentType || !amount) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Update template
    const updatedTemplate = await updateOrderTemplate(templateId, {
      templateName,
      paymentType,
      amount,
      description: description || null,
      isActive: isActive ?? true,
    });

    if (!updatedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTemplate);
  } catch {
    // Failed to update template
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;

    const deletedTemplate = await deleteOrderTemplate(templateId);

    if (!deletedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch {
    // Failed to delete template
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}