import { NextRequest, NextResponse } from 'next/server';
import { calculateAndUpdateMonthlyPayments } from '@/models/subscriptions';
import { z } from 'zod';

const calculateMonthlySchema = z.object({
  // For backward compatibility, support single month
  year: z.number().int().min(2020).max(2050).optional(),
  month: z.number().int().min(1).max(12).optional(),
  // For date range support
  startYear: z.number().int().min(2020).max(2050).optional(),
  startMonth: z.number().int().min(1).max(12).optional(),
  endYear: z.number().int().min(2020).max(2050).optional(),
  endMonth: z.number().int().min(1).max(12).optional(),
}).refine((data) => {
  // Either single month (year + month) or date range (startYear + startMonth) must be provided
  const hasSingleMonth = data.year && data.month;
  const hasDateRange = data.startYear && data.startMonth;
  return hasSingleMonth || hasDateRange;
}, {
  message: "Either year+month or startYear+startMonth must be provided",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = calculateMonthlySchema.parse(body);

    // Determine parameters (backward compatibility or date range)
    let startYear: number;
    let startMonth: number;
    let endYear: number | undefined;
    let endMonth: number | undefined;
    
    if (validatedData.year && validatedData.month) {
      // Single month mode (backward compatibility)
      startYear = validatedData.year;
      startMonth = validatedData.month;
      endYear = undefined; // Single month mode - no end date
      endMonth = undefined;
    } else {
      // Date range mode
      startYear = validatedData.startYear!;
      startMonth = validatedData.startMonth!;
      endYear = validatedData.endYear;
      endMonth = validatedData.endMonth;
    }

    // Calculate and update monthly payments
    const result = await calculateAndUpdateMonthlyPayments(startYear, startMonth, endYear, endMonth);

    const messageRange = endYear && endMonth 
      ? `${startYear}/${startMonth} to ${endYear}/${endMonth}`
      : `${startYear}/${startMonth}`;

    return NextResponse.json({
      success: true,
      message: `Monthly payments calculated for ${messageRange}`,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error', 
          details: error.issues,
          message: 'Invalid year or month provided'
        },
        { status: 400 }
      );
    }
    
    // Error calculating monthly payments
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to calculate monthly payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}