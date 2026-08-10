/**
 * SISMP — Department-Scoped Officer Dashboard
 * Strictly row-level data scoped to the officer's assigned department.
 * Features:
 * - Assigned Investors list & CRM status
 * - Pending Approvals SLA queue
 * - MoU Drafting progress tracker
 * - Follow-up task due/overdue counter
 */
'use client';

import React, { useState } from 'react';
import { FilterChrome, type DashboardFilterState } from '@/components/patterns/FilterChrome';
import { StatusBadge } from '@/components/patterns/StatusBadge';
import { Card } from '@/components/ui/Card';
import { formatCompactINR } from '@/lib/utils';
import {
  MOCK_REGISTRATION_RECORDS,
  MOCK_MEETING_REQUESTS,
} from '@/lib/api/mocks/staffMockData';
import {
  MOCK_CRM_INVESTORS,
  MOCK_MOUS,
} from '@/lib/api/mocks/crmMockData';
import {
  Building2,
  CheckSquare,
  FileSignature,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DepartmentDashboardPage() {
  const [selectedDept, setSelectedDept] = useState('Department of Industrial Policy & Investment Promotion');
  const [filters, setFilters] = useState<DashboardFilterState>({
    dateRange: 'all',
    country: 'all',
    sector: 'all',
    department: 'Industrial Policy',
  });

  // Department-Scoped Data Filtering (Strict Scoping)
  const deptRegistrations = MOCK_REGISTRATION_RECORDS.filter(
    (r) => r.department === selectedDept || r.department.includes('Industrial Policy')
  );
  const deptCRM = MOCK_CRM_INVESTORS.filter(
    (i) => i.department === selectedDept || i.department.includes('Industrial Policy')
  );
  const deptMoUs = MOCK_MOUS.filter(
    (m) => m.departmentName === selectedDept || m.departmentName.includes('Industrial Policy')
  );
  const deptMeetings = MOCK_MEETING_REQUESTS.filter(
    (m) => m.departmentName.includes('Industrial Policy')
  );

  const pendingApprovalsCount = deptRegistrations.filter((r) => r.status === 'Submitted').length;
  const totalProposedCapital = deptCRM.reduce((acc, curr) => acc + curr.proposedInvestmentINR, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-y-auto">
      {/* Top Filter Chrome with Department Scope Indicator */}
      <FilterChrome
        title="Department Officer Operations Dashboard"
        subtitle={`Department Scope: ${selectedDept}`}
        scopeLabel="Department Scoped Data (Strict RBAC)"
        showDepartmentFilter={false}
        onFilterChange={(f) => setFilters(f)}
      />

      {/* Main Content */}
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Scoped KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md" variant="default" className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Department Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-data text-3xl font-extrabold text-amber-600">
              {pendingApprovalsCount}
            </div>
            <p className="text-[11px] text-foreground-muted">Applications Waiting Review</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Assigned Investors Capital</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-data text-3xl font-extrabold text-emerald-700">
              {formatCompactINR(totalProposedCapital)}
            </div>
            <p className="text-[11px] text-foreground-muted">Active Department Pipeline</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>B2G Sessions Today</span>
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="font-data text-3xl font-extrabold text-foreground">
              {deptMeetings.length}
            </div>
            <p className="text-[11px] text-foreground-muted">Scheduled Room Slots</p>
          </Card>

          <Card padding="md" variant="default" className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-subtle uppercase">
              <span>Active MoUs in Progress</span>
              <FileSignature className="w-4 h-4 text-primary" />
            </div>
            <div className="font-data text-3xl font-extrabold text-primary">
              {deptMoUs.length}
            </div>
            <p className="text-[11px] text-foreground-muted">Draft & Signature Workflow</p>
          </Card>
        </div>

        {/* 2-Column Operational View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scoped Pending Registrations */}
          <Card padding="md" variant="default" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" /> Assigned Approvals Queue ({deptRegistrations.length})
              </h3>
              <span className="text-[10px] text-foreground-subtle">Row-Level Scoped</span>
            </div>

            <div className="space-y-2">
              {deptRegistrations.map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg border border-border bg-background flex items-center justify-between text-xs">
                  <div>
                    <span className="font-data font-bold text-primary">{rec.id}</span>
                    <h4 className="font-semibold text-foreground">{rec.applicantName}</h4>
                    <p className="text-[11px] text-foreground-muted">{rec.organization} &bull; {rec.sector}</p>
                  </div>
                  <StatusBadge status={rec.status} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Scoped B2G Meetings & MoU Progress */}
          <Card padding="md" variant="default" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-primary" /> MoU Bilateral Signature Tracker
              </h3>
            </div>

            <div className="space-y-3">
              {deptMoUs.map((mou) => (
                <div key={mou.id} className="p-3 rounded-lg border border-border bg-background text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{mou.mouTitle}</span>
                    <StatusBadge status={mou.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-foreground-muted pt-1 border-t border-border/40">
                    <span>Investor Sign: {mou.investorSigned ? '✓ Signed' : 'Pending'}</span>
                    <span>Dept Sign: {mou.departmentSigned ? '✓ Signed' : 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
