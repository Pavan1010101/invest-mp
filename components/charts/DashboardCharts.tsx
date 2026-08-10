/**
 * SISMP — Recharts Analytics Components for Executive Dashboards
 * Features:
 * - Sector Investment Distribution Chart
 * - Department Performance Leaderboard Bar Chart
 * - Country / Global Participation Breakdown
 */
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCompactINR } from '@/lib/utils';
import { Building2, Layers, Globe } from 'lucide-react';

const SECTOR_DATA = [
  { name: 'Renewable Energy', value: 120000, formatted: '₹1.20 Lakh Cr', color: '#059669' },
  { name: 'IT & Electronics', value: 95000, formatted: '₹95,000 Cr', color: '#3B82F6' },
  { name: 'Manufacturing', value: 85000, formatted: '₹85,000 Cr', color: '#1E3A8A' },
  { name: 'Pharma & Biotech', value: 55000, formatted: '₹55,000 Cr', color: '#E11D48' },
  { name: 'Automobile', value: 45000, formatted: '₹45,000 Cr', color: '#D97706' },
  { name: 'Agro Processing', value: 30000, formatted: '₹30,000 Cr', color: '#7C3AED' },
];

const DEPT_PERFORMANCE = [
  { dept: 'Industrial Policy', mous: 112, valueCr: 145000 },
  { dept: 'Renewable Energy', mous: 84, valueCr: 120000 },
  { dept: 'Science & Tech', mous: 76, valueCr: 95000 },
  { dept: 'Health & Pharma', mous: 48, valueCr: 55000 },
  { dept: 'MSME Dept', mous: 64, valueCr: 35000 },
];

const COUNTRY_DATA = [
  { country: 'India', investors: 3450, percentage: 65.8 },
  { country: 'United States', investors: 420, percentage: 8.0 },
  { country: 'United Kingdom', investors: 310, percentage: 5.9 },
  { country: 'Taiwan', investors: 280, percentage: 5.3 },
  { country: 'Germany', investors: 210, percentage: 4.0 },
  { country: 'Others (25+)', investors: 570, percentage: 11.0 },
];

export function SectorBreakdownChart() {
  return (
    <Card padding="md" variant="default" className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Sector Capital Allocation (₹ Cr)
        </h3>
        <span className="text-[10px] text-foreground-subtle font-mono">12 Key Sectors</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SECTOR_DATA} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tickFormatter={(val) => `₹${val / 1000}k Cr`} stroke="#64748b" fontSize={10} />
            <YAxis dataKey="name" type="category" stroke="#0f172a" fontSize={11} width={120} tickLine={false} />
            <Tooltip
              formatter={(val: any) => [`₹${(val as number).toLocaleString('en-IN')} Cr`, 'Investment Value']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {SECTOR_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function DepartmentPerformanceChart() {
  return (
    <Card padding="md" variant="default" className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> Department Performance Leaderboard (MoUs Signed)
        </h3>
        <span className="text-[10px] text-foreground-subtle font-mono">By Executed Agreements</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DEPT_PERFORMANCE} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="dept" stroke="#0f172a" fontSize={10} interval={0} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip
              formatter={(val: any, name: any) => [val, name === 'mous' ? 'MoUs Signed' : 'Value (₹ Cr)']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="mous" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="MoUs Signed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function CountryBreakdownTable() {
  return (
    <Card padding="md" variant="default" className="space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> International Delegation Breakdown
        </h3>
        <span className="text-[10px] text-foreground-subtle font-mono">30+ Countries</span>
      </div>

      <div className="space-y-2">
        {COUNTRY_DATA.map((item) => (
          <div key={item.country} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-foreground">{item.country}</span>
              <span className="font-data text-foreground-muted">{item.investors} Delegates ({item.percentage}%)</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden border border-border/60">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
