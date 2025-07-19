import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderTemplates } from '@/lib/db/schema';
import { count, eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    // 統計データを並列で取得
    const [
      totalResult,
      activeResult,
      inactiveResult,
      productResult,
      projectResult
    ] = await Promise.all([
      // 総テンプレート数
      db.select({ count: count() }).from(orderTemplates),
      
      // アクティブテンプレート数
      db.select({ count: count() }).from(orderTemplates).where(eq(orderTemplates.isActive, true)),
      
      // 非アクティブテンプレート数
      db.select({ count: count() }).from(orderTemplates).where(eq(orderTemplates.isActive, false)),
      
      // プロダクトテンプレート数（アクティブのみ）
      db.select({ count: count() }).from(orderTemplates).where(
        and(
          eq(orderTemplates.serviceType, 'product'),
          eq(orderTemplates.isActive, true)
        )
      ),
      
      // プロジェクトテンプレート数（アクティブのみ）
      db.select({ count: count() }).from(orderTemplates).where(
        and(
          eq(orderTemplates.serviceType, 'project'),
          eq(orderTemplates.isActive, true)
        )
      )
    ]);

    const summary = {
      totalTemplates: totalResult[0].count,
      activeTemplates: activeResult[0].count,
      inactiveTemplates: inactiveResult[0].count,
      productTemplates: productResult[0].count,
      projectTemplates: projectResult[0].count
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Failed to fetch template summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template summary' },
      { status: 500 }
    );
  }
}