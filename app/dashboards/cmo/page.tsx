/**
 * SISMP — Chief Minister's Office (CMO) Executive Summary Dashboard
 * High-stakes, read-heavy, live-data executive dashboard.
 * Features:
 * - Signature Element: Investment Funnel Visualization
 * - High-impact stat counters (₹4.5 Lakh Cr Investment, 3.85 Lakh Jobs, 5,240 Registrations)
 * - Country & Sector breakdowns
 * - Department Performance Leaderboard
 * - Universal Filter Chrome with live "as of [time]" freshness indicator & real exports
 */
'use client';

import React, { useState } from 'react';
import { FilterChrome, type DashboardFilterState } from '@/components/patterns/FilterChrome';
import { InvestmentFunnel } from '@/components/charts/InvestmentFunnel';
import {
  SectorBreakdownChart,
  DepartmentPerformanceChart,
  CountryBreakdownTable,
} from '@/components/charts/DashboardCharts';
import { Card } from '@/components/ui/Card';
import { formatCompactINR } from '@/lib/utils';
import {
  Building2,
  Users,
  Globe,
  TrendingUp,
  FileSignature,
  Calendar,
  CheckCircle2,
  Award,
  Zap,
  Activity,
  Landmark,
} from 'lucide-react';

export default function CMODashboardPage() {
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
        title="CMO Executive Summary Dashboard"
        subtitle="Global Investors Summit 2026 — Macro Investment & Employment Performance"
        scopeLabel="Chief Minister's Office Scope"
        onFilterChange={(f) => setFilters(f)}
      />

      {/* Main Content Area */}
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Key Performance Indicators (KPIs) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md" variant="default" className="space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Total Capital Committed</span>
              <Award className="w-4 h-4 text-accent" />
            </div>
            <div className="font-data text-3xl font-extrabold text-emerald-700 tracking-tight">
              ₹4.50 Lakh Cr
            </div>
            <p className="text-[11px] text-foreground-muted">Target of ₹4.0 Lakh Cr Exceeded</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Estimated Employment</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="font-data text-3xl font-extrabold text-foreground tracking-tight">
              3,85,000
            </div>
            <p className="text-[11px] text-foreground-muted">Direct & Indirect Jobs Created</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>MoUs Executed & Signed</span>
              <FileSignature className="w-4 h-4 text-primary" />
            </div>
            <div className="font-data text-3xl font-extrabold text-primary tracking-tight">
              384
            </div>
            <p className="text-[11px] text-foreground-muted">Across 12 Nodal Departments</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Live Attendance Counter</span>
              <Activity className="w-4 h-4 text-emerald-600 live-pulse" />
            </div>
            <div className="font-data text-3xl font-extrabold text-foreground tracking-tight">
              4,890
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">93.3% On-site Check-in Rate</p>
          </Card>
        </div>

        {/* Signature Element: Investment Funnel Visualization */}
        <InvestmentFunnel />

        {/* Analytics Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectorBreakdownChart />
          <DepartmentPerformanceChart />
        </div>

        {/* Global Delegation & Live Summit Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CountryBreakdownTable />
          </div>

          <div className="lg:col-span-2">
            <Card padding="md" variant="default" className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-primary" /> Key Mega-Investment Agreements Executed Today
                </h3>
                <span className="text-[10px] text-foreground-subtle font-mono">Live Audit Feed</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { company: 'Foxconn Electronics Technology', sector: 'IT & Electronics', value: '₹65,000 Cr', jobs: '12,000 Jobs', dept: 'Dept of Science & Tech' },
                  { company: 'Vestas Wind Systems A/S', sector: 'Renewable Energy', value: '₹42,000 Cr', jobs: '3,200 Jobs', dept: 'Dept of Renewable Energy' },
                  { company: 'Grasim Industries Ltd (Aditya Birla)', sector: 'Manufacturing', value: '₹25,000 Cr', jobs: '4,500 Jobs', dept: 'Dept of Industrial Policy' },
                  { company: 'Lupin Pharmaceuticals Ltd', sector: 'Pharma & Biotech', value: '₹8,500 Cr', jobs: '1,800 Jobs', dept: 'Health & Pharma Dept' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-foreground">{item.company}</h4>
                      <p className="text-foreground-muted text-[11px]">{item.sector} &bull; {item.dept}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-data font-bold text-emerald-700 block">{item.value}</span>
                      <span className="text-[10px] text-foreground-subtle">{item.jobs}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
