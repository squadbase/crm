import { NextRequest, NextResponse } from 'next/server';
import { getOrderTemplates, getOrderTemplateCount, createOrderTemplate, OrderTemplateFilters } from '@/models/order-templates';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filter conditions
    const paymentType = searchParams.get('paymentType');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // Build filter object
    const filters: OrderTemplateFilters = {};
    
    if (paymentType) {
      filters.paymentType = paymentType as 'onetime' | 'subscription';
    }

    if (isActive !== null && isActive !== '') {
      filters.isActive = isActive === 'true';
    }

    if (search) {
      filters.search = search;
    }

    // Fetch data
    const [templates, total] = await Promise.all([
      getOrderTemplates({
        filters,
        sort: { field: 'created', direction: 'desc' },
        limit,
        offset
      }),
      getOrderTemplateCount(filters)
    ]);

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
  } catch {
    // Failed to fetch templates
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Create template
    const newTemplate = await createOrderTemplate({
      templateName,
      paymentType,
      amount,
      description: description || null,
      isActive: isActive ?? true
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch {
    // Failed to create template
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}