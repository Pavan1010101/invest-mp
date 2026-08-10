/**
 * SISMP — MPIDC Admin Operational Dashboard
 * Focused on workflow bottlenecks, approval aging, pavilion occupancy, and CRM pipeline.
 */
'use client';

import React, { useState } from 'react';
import { FilterChrome, type DashboardFilterState } from '@/components/patterns/FilterChrome';
import { InvestmentFunnel } from '@/components/charts/InvestmentFunnel';
import { Card } from '@/components/ui/Card';
import { formatCompactINR } from '@/lib/utils';
import {
  CheckSquare,
  Clock,
  Calendar,
  Grid,
  TrendingUp,
  AlertTriangle,
  Layers,
  Building,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MPIDCDashboardPage() {
  const [filters, setFilters] = useState<DashboardFilterState>({
    dateRange: 'all',
    country: 'all',
    sector: 'all',
    department: 'all',
  });

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-y-auto">
      {/* Top Filter Chrome */}
      <FilterChrome
        title="MPIDC Admin Operational Dashboard"
        subtitle="Cross-Department Approvals Aging, Pavilion Occupancy, and Lead Funnel Tracking"
        scopeLabel="MPIDC State Admin Scope"
        onFilterChange={(f) => setFilters(f)}
      />

      {/* Main Content Area */}
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Operational Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md" variant="default" className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Pending Approvals Queue</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-data text-3xl font-extrabold text-amber-600">350</div>
            <p className="text-[11px] text-foreground-muted">Applications Awaiting Review</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Scheduled B2G Meetings</span>
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="font-data text-3xl font-extrabold text-foreground">1,420</div>
            <p className="text-[11px] text-foreground-muted">24h Expiry Monitoring Active</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Pavilion Stall Occupancy</span>
              <Grid className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-data text-3xl font-extrabold text-emerald-700">82.5%</div>
            <p className="text-[11px] text-foreground-muted">165 of 200 Stalls Allocated</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Escalated Leads</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="font-data text-3xl font-extrabold text-red-600">14</div>
            <p className="text-[11px] text-red-700 font-semibold">Requires Secretary Action</p>
          </Card>
        </div>

        {/* Approval Aging Distribution Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card padding="md" variant="default" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Pending Application Aging Distribution
              </h3>
              <span className="text-[10px] text-foreground-subtle font-mono">Service SLA Target: &lt;24h</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block">&lt; 24 Hours</span>
                <span className="font-data text-2xl font-extrabold text-emerald-700">220</span>
                <span className="text-[10px] text-emerald-800 block mt-1">Within SLA Window</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block">24 – 48 Hours</span>
                <span className="font-data text-2xl font-extrabold text-amber-700">95</span>
                <span className="text-[10px] text-amber-800 block mt-1">Warning Threshold</span>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <span className="text-xs font-bold text-red-900 block">&gt; 48 Hours (Overdue)</span>
                <span className="font-data text-2xl font-extrabold text-red-700">35</span>
                <span className="text-[10px] text-red-800 block mt-1">Auto-Escalated to Admin</span>
              </div>
            </div>
          </Card>

          {/* Pavilion Floorplan Heatmap Summary */}
          <Card padding="md" variant="default" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                <Grid className="w-4 h-4 text-primary" /> Pavilion Occupancy Summary
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { hall: 'Hall A (Manufacturing)', allocated: 45, total: 50, percent: 90 },
                { hall: 'Hall B (IT & Innovation)', allocated: 60, total: 70, percent: 85.7 },
                { hall: 'Hall C (Renewable Energy)', allocated: 40, total: 50, percent: 80 },
                { hall: 'Hall D (Agro & Food)', allocated: 20, total: 30, percent: 66.6 },
              ].map((h) => (
                <div key={h.hall} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-foreground">{h.hall}</span>
                    <span className="font-data text-foreground-muted">{h.allocated}/{h.total} ({h.percent.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${h.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Investment Conversion Funnel */}
        <InvestmentFunnel />
      </div>
    </div>
  );
}
