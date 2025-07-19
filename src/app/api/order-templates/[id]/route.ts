import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;

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

    return NextResponse.json(template[0]);
  } catch (error) {
    console.error('Failed to fetch template:', error);
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
    const { templateName, paymentType, serviceType, amount, description, isActive } = body;

    // バリデーション
    if (!templateName || !paymentType || !serviceType || !amount) {
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

    // テンプレート更新
    const updatedTemplate = await db
      .update(orderTemplates)
      .set({
        templateName,
        paymentType,
        serviceType,
        amount,
        description: description || null,
        isActive: isActive ?? true,
        updatedAt: new Date()
      })
      .where(eq(orderTemplates.templateId, templateId))
      .returning();

    if (updatedTemplate.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;

    const deletedTemplate = await db
      .delete(orderTemplates)
      .where(eq(orderTemplates.templateId, templateId))
      .returning();

    if (deletedTemplate.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}