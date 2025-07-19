import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderTemplates } from '@/lib/db/schema';
import { desc, and, or, eq, ilike, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // フィルター条件
    const paymentType = searchParams.get('paymentType');
    const serviceType = searchParams.get('serviceType');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // WHERE条件を構築
    const conditions = [];

    if (paymentType) {
      conditions.push(eq(orderTemplates.paymentType, paymentType as 'onetime' | 'subscription'));
    }

    if (serviceType) {
      conditions.push(eq(orderTemplates.serviceType, serviceType as 'product' | 'project'));
    }

    if (isActive !== null && isActive !== '') {
      conditions.push(eq(orderTemplates.isActive, isActive === 'true'));
    }

    // 多言語検索（日本語・英語対応）
    if (search) {
      const searchCondition = or(
        ilike(orderTemplates.templateName, `%${search}%`),
        ilike(orderTemplates.description, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // データ取得
    const [templates, totalResult] = await Promise.all([
      db
        .select()
        .from(orderTemplates)
        .where(whereClause)
        .orderBy(desc(orderTemplates.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(orderTemplates)
        .where(whereClause)
    ]);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // テンプレート作成
    const newTemplate = await db
      .insert(orderTemplates)
      .values({
        templateName,
        paymentType,
        serviceType,
        amount,
        description: description || null,
        isActive: isActive ?? true
      })
      .returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}