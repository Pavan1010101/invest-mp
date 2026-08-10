/**
 * SISMP — Signature Element: Investment Funnel Visualization
 * Recognized identity element for the SISMP summit platform.
 * Visualizes the full conversion lifecycle:
 * Registrations -> Approved -> B2G Meetings -> MoUs Signed -> ₹ Investment Value -> Jobs Created.
 */
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCompactINR } from '@/lib/utils';
import {
  Users,
  CheckCircle2,
  Calendar,
  FileSignature,
  IndianRupee,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  unit: string;
  conversionRate: string;
  color: string;
  bgGrad: string;
  icon: React.ElementType;
}

interface InvestmentFunnelProps {
  data?: FunnelStage[];
}

const DEFAULT_FUNNEL_DATA: FunnelStage[] = [
  {
    id: 'reg',
    label: 'Registrations Submitted',
    count: 5240,
    unit: 'Attendees',
    conversionRate: '100%',
    color: 'border-blue-500 text-blue-700',
    bgGrad: 'from-blue-600 to-indigo-700 text-white',
    icon: Users,
  },
  {
    id: 'app',
    label: 'Registrations Approved',
    count: 4890,
    unit: 'Approved (93%)',
    conversionRate: '93.3%',
    color: 'border-indigo-500 text-indigo-700',
    bgGrad: 'from-indigo-600 to-blue-700 text-white',
    icon: CheckCircle2,
  },
  {
    id: 'mtg',
    label: 'B2G Meetings Scheduled',
    count: 1420,
    unit: 'Sessions',
    conversionRate: '29.0%',
    color: 'border-purple-500 text-purple-700',
    bgGrad: 'from-purple-600 to-indigo-700 text-white',
    icon: Calendar,
  },
  {
    id: 'mou',
    label: 'MoUs & Agreements Signed',
    count: 384,
    unit: 'MoUs Signed',
    conversionRate: '27.0%',
    color: 'border-amber-500 text-amber-700',
    bgGrad: 'from-amber-500 to-orange-600 text-white',
    icon: FileSignature,
  },
  {
    id: 'val',
    label: 'Total Investment Value',
    count: 4500000000000, // ₹4.5 Lakh Cr
    unit: 'Cr INR',
    conversionRate: 'Target Exceeded',
    color: 'border-emerald-500 text-emerald-700',
    bgGrad: 'from-emerald-600 to-teal-700 text-white',
    icon: IndianRupee,
  },
  {
    id: 'emp',
    label: 'Estimated Employment Created',
    count: 385000,
    unit: 'Jobs',
    conversionRate: 'High Impact',
    color: 'border-teal-500 text-teal-700',
    bgGrad: 'from-teal-600 to-emerald-700 text-white',
    icon: TrendingUp,
  },
];

export function InvestmentFunnel({ data = DEFAULT_FUNNEL_DATA }: InvestmentFunnelProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  return (
    <Card padding="lg" variant="default" className="space-y-6 overflow-hidden relative">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">
              Summit Investment Conversion Funnel
            </h2>
          </div>
          <p className="text-xs text-foreground-muted">
            End-to-end lifecycle conversion from attendee registration to ₹ investment commitments & jobs
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
          Signature Analytics Element
        </span>
      </div>

      {/* Funnel Layout */}
      <div className="space-y-3">
        {data.map((stage, idx) => {
          const Icon = stage.icon;
          const isHovered = hoveredStage === stage.id;
          // Calculate width percentage to create a funnel shape
          const widthPercent = 100 - idx * 10;

          return (
            <div
              key={stage.id}
              onMouseEnter={() => setHoveredStage(stage.id)}
              onMouseLeave={() => setHoveredStage(null)}
              className="group cursor-pointer transition-all duration-300"
            >
              <div
                className={cn(
                  'mx-auto rounded-xl p-4 flex items-center justify-between shadow-md transition-all duration-300 relative overflow-hidden bg-gradient-to-r',
                  stage.bgGrad,
                  isHovered ? 'scale-[1.02] shadow-xl ring-4 ring-primary/20' : ''
                )}
                style={{ width: `${widthPercent}%`, minWidth: '280px' }}
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white/80 block uppercase tracking-wider">
                      Stage {idx + 1}: {stage.label}
                    </span>
                    <span className="text-xs text-white/70">
                      Conversion Rate: <strong className="text-white">{stage.conversionRate}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right relative z-10">
                  <div className="font-data text-2xl font-extrabold tracking-tight">
                    {stage.id === 'val'
                      ? formatCompactINR(stage.count)
                      : stage.count.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] font-semibold text-white/80">{stage.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border text-center text-xs">
        <div className="p-2.5 rounded-lg bg-background border border-border">
          <span className="text-foreground-subtle block text-[10px]">Total Registrations</span>
          <span className="font-data font-bold text-foreground">5,240</span>
        </div>
        <div className="p-2.5 rounded-lg bg-background border border-border">
          <span className="text-foreground-subtle block text-[10px]">Total MoUs Signed</span>
          <span className="font-data font-bold text-primary">384 Agreements</span>
        </div>
        <div className="p-2.5 rounded-lg bg-background border border-border">
          <span className="text-foreground-subtle block text-[10px]">Committed Capital</span>
          <span className="font-data font-bold text-emerald-700">₹4.5 Lakh Cr</span>
        </div>
        <div className="p-2.5 rounded-lg bg-background border border-border">
          <span className="text-foreground-subtle block text-[10px]">New Employment</span>
          <span className="font-data font-bold text-foreground">3.85 Lakh Jobs</span>
        </div>
      </div>
    </Card>
  );
}
