/**
 * SISMP — REST API Route Handler: /api/v1/analytics/funnel
 * Live Executive Analytics & Funnel Controller with NFR "as of [time]" timestamp.
 */



import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/server/services/analyticsService';

export async function GET() {
  try {
    const analytics = AnalyticsService.getLiveFunnelMetrics();

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
