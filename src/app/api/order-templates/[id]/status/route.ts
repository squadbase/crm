import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    // テンプレートのアクティブ状態を更新
    const updatedTemplate = await db
      .update(orderTemplates)
      .set({
        isActive,
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
    console.error('Failed to update template status:', error);
    return NextResponse.json(
      { error: 'Failed to update template status' },
      { status: 500 }
    );
  }
}