/**
 * SISMP — Investor 360° Profile & CRM Lifecycle Dashboard
 * Used by Relationship Managers and Department Officers.
 * Features:
 * - Interactive Pipeline Funnel (New -> In Discussion -> Committed -> Invested -> Closed)
 * - Overdue/Escalated state highlight indicators
 * - 360° Profile tabbed view: Overview, Communications Timeline (append-only), Follow-up Task Board, Site Visits
 * - Append-only Communication Log entry form
 */
'use client';

import React, { useState, useEffect } from 'react';
import { QueueDetail } from '@/components/patterns/QueueDetail';
import { StatusBadge } from '@/components/patterns/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { CRM_STATUSES } from '@/lib/constants/statuses';
import { formatCompactINR } from '@/lib/utils';
import {
  MOCK_CRM_INVESTORS,
  type CRMInvestorRecord,
} from '@/lib/api/mocks/crmMockData';
import {
  Users,
  Building,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  AlertOctagon,
  CheckSquare,
  MapPin,
  MessageSquare,
  Plus,
  TrendingUp,
  FileText,
  Clock,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CRMPage() {
  const [investors, setInvestors] = useState<CRMInvestorRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'comms' | 'tasks' | 'visits' | 'mous'>('overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [mous, setMous] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/crm')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then(json => {
        if (json.success && json.data) {
          setInvestors(json.data);
          if (json.data.length > 0 && !selectedId) {
            setSelectedId(json.data[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Modal State for Append-Only Communication Log
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    type: 'meeting' as 'email' | 'call' | 'meeting' | 'site_visit',
    summary: '',
    loggedBy: 'Relationship Manager',
  });

  const filteredInvestors = investors.filter((inv) => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = inv.investorName.toLowerCase().includes(q);
      const matchCompany = inv.companyName.toLowerCase().includes(q);
      const matchId = inv.id.toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchId) return false;
    }
    return true;
  });

  const selectedInvestor = investors.find((i) => i.id === selectedId) || filteredInvestors[0];

  useEffect(() => {
    if (selectedInvestor?.registrationId) {
      fetch('/api/v1/mou?participantId=' + encodeURIComponent(selectedInvestor.registrationId))
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          const text = await res.text();
          return text ? JSON.parse(text) : {};
        })
        .then(json => {
          if (json.success && json.data) {
            setMous(json.data);
          } else {
            setMous([]);
          }
        })
        .catch(console.error);
    } else {
      setMous([]);
    }
  }, [selectedInvestor?.registrationId]);

  // Append-only comms log handler
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.summary.trim() || !selectedInvestor) return;

    const newComm = {
      id: `comm-${Date.now()}`,
      type: logForm.type,
      summary: logForm.summary,
      loggedBy: logForm.loggedBy,
      loggedAt: new Date().toISOString(),
    };

    setInvestors((prev) =>
      prev.map((inv) =>
        inv.id === selectedInvestor.id
          ? {
              ...inv,
              lastContactDate: new Date().toISOString(),
              communications: [newComm, ...inv.communications],
            }
          : inv
      )
    );

    setShowLogModal(false);
    setLogForm({ type: 'meeting', summary: '', loggedBy: 'Relationship Manager' });
  };

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    if (!selectedInvestor) return;
    setInvestors((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvestor.id) {
          return {
            ...inv,
            tasks: inv.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)),
          };
        }
        return inv;
      })
    );
  };

  return (
    <div className="h-full">
      <QueueDetail
        title="Investor 360° Profile & CRM Lifecycle"
        subtitle="Manage high-value investor relationships, timeline interactions, and escalated follow-up tasks"
        items={filteredInvestors}
        selectedId={selectedInvestor?.id || null}
        onSelectItem={(id) => setSelectedId(id)}
        searchPlaceholder="Search by Investor, Company or CRM ID..."
        onSearchChange={(q) => setSearchQuery(q)}
        filterOptions={[
          {
            key: 'status',
            label: 'Pipeline Stage',
            options: [
              { value: CRM_STATUSES.NEW, label: 'New' },
              { value: CRM_STATUSES.IN_DISCUSSION, label: 'In Discussion' },
              { value: CRM_STATUSES.COMMITTED, label: 'Committed' },
              { value: CRM_STATUSES.INVESTED, label: 'Invested' },
              { value: CRM_STATUSES.CLOSED, label: 'Closed' },
            ],
          },
        ]}
        activeFilters={{ status: statusFilter }}
        onFilterChange={(_, val) => setStatusFilter(val)}
        /* Left Queue Item */
        renderListItem={(inv) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-data text-xs font-bold text-primary">{inv.id}</span>
              <StatusBadge status={inv.status} size="sm" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground">{inv.investorName}</h3>
                {inv.isEscalated && (
                  <span className="p-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]" title="Escalated / Overdue Action">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-600 inline" />
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground-muted">{inv.companyName}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-foreground-subtle pt-1 border-t border-border/40 font-data">
              <span>{inv.sector}</span>
              <span className="font-bold text-emerald-700">
                {formatCompactINR(inv.proposedInvestmentINR)}
              </span>
            </div>
          </div>
        )}
        /* Right Detail View */
        renderDetail={(inv) => (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Top 360 Header */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-card space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-data text-sm font-bold text-primary">{inv.id}</span>
                    <StatusBadge status={inv.status} size="md" />
                    {inv.isEscalated && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 animate-pulse">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600" /> ESCALATED / OVERDUE
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground mt-1">{inv.investorName}</h2>
                  <p className="text-sm text-foreground-muted">
                    <span className="font-semibold text-foreground">{inv.companyName}</span> • Assigned RM: {inv.relationshipManager}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="accent" size="sm" onClick={() => setShowLogModal(true)}>
                    <Plus className="w-4 h-4" /> Log Interaction
                  </Button>
                </div>
              </div>

              {/* Escalation Alert Banner */}
              {inv.isEscalated && inv.escalationReason && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Escalation Notice:</span> {inv.escalationReason}
                  </div>
                </div>
              )}

              {/* Pipeline Milestone Stage Bar */}
              <div className="pt-3 border-t border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle block mb-2">
                  CRM Lifecycle Funnel Progress
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {[
                    CRM_STATUSES.NEW,
                    CRM_STATUSES.IN_DISCUSSION,
                    CRM_STATUSES.COMMITTED,
                    CRM_STATUSES.INVESTED,
                    CRM_STATUSES.CLOSED,
                  ].map((stage, idx) => {
                    const stagesOrder = [
                      CRM_STATUSES.NEW,
                      CRM_STATUSES.IN_DISCUSSION,
                      CRM_STATUSES.COMMITTED,
                      CRM_STATUSES.INVESTED,
                      CRM_STATUSES.CLOSED,
                    ];
                    const currentIdx = stagesOrder.indexOf(inv.status as any);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={stage}
                        className={cn(
                          'py-1.5 px-1 rounded text-[10px] font-bold border transition-all',
                          isCurrent
                            ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary-100'
                            : isDone
                            ? 'bg-primary-50 text-primary border-primary-200'
                            : 'bg-background text-foreground-subtle border-border'
                        )}
                      >
                        {stage}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Profile Tab Navigation */}
            <div className="flex border-b border-border text-sm font-medium">
              {[
                { id: 'overview', label: '360° Overview' },
                { id: 'comms', label: `Communication Log (${inv.communications.length})` },
                { id: 'tasks', label: `Follow-up Tasks (${inv.tasks.filter((t) => !t.isCompleted).length} pending)` },
                { id: 'visits', label: `Site Visit Log (${inv.siteVisits.length})` },
                { id: 'mous', label: `MoUs (${mous.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'px-4 py-2.5 border-b-2 font-semibold text-xs transition-colors',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground-muted hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card padding="md" variant="default" className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Investment Scope
                  </h3>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <dt className="text-foreground-muted">Proposed Investment:</dt>
                      <dd className="font-data font-bold text-sm text-emerald-700">
                        {formatCompactINR(inv.proposedInvestmentINR)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <dt className="text-foreground-muted">Expected Jobs Created:</dt>
                      <dd className="font-data font-semibold text-foreground">{inv.expectedEmployment.toLocaleString('en-IN')}</dd>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <dt className="text-foreground-muted">Sector:</dt>
                      <dd className="font-medium text-foreground">{inv.sector}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-foreground-muted">Nodal Department:</dt>
                      <dd className="font-medium text-foreground truncate max-w-[180px]">{inv.department}</dd>
                    </div>
                  </dl>
                </Card>

                <Card padding="md" variant="default" className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Key Contact
                  </h3>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <dt className="text-foreground-muted">Email:</dt>
                      <dd className="font-medium text-foreground">{inv.email}</dd>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <dt className="text-foreground-muted">Phone:</dt>
                      <dd className="font-medium text-foreground">{inv.phone}</dd>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                      <dt className="text-foreground-muted">Country:</dt>
                      <dd className="font-medium text-foreground">{inv.country}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-foreground-muted">Last Contacted:</dt>
                      <dd className="font-data font-medium text-foreground">
                        {new Date(inv.lastContactDate).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}
                      </dd>
                    </div>
                  </dl>
                </Card>
              </div>
            )}

            {/* Tab 2: Communications Timeline (Append-Only) */}
            {activeTab === 'comms' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                    Interaction History (Append-Only Timeline)
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setShowLogModal(true)}>
                    <Plus className="w-3.5 h-3.5" /> Append Log Entry
                  </Button>
                </div>

                <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {inv.communications.map((comm) => (
                    <div key={comm.id} className="relative pl-10">
                      <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold ring-4 ring-background">
                        ✓
                      </div>
                      <div className="p-3.5 rounded-lg border border-border bg-surface text-xs space-y-1">
                        <div className="flex items-center justify-between text-foreground-subtle">
                          <span className="font-bold text-primary uppercase text-[10px]">{comm.type}</span>
                          <span className="font-data text-[10px]">
                            {new Date(comm.loggedAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="font-medium text-foreground leading-relaxed">{comm.summary}</p>
                        <p className="text-[10px] text-foreground-subtle pt-1">Logged by: {comm.loggedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Follow-up Tasks */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                    Action Tasks & Follow-up Checklist
                  </h3>
                </div>

                <div className="space-y-2">
                  {inv.tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t.id)}
                      className={cn(
                        'p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors text-xs',
                        t.isCompleted ? 'bg-background border-border opacity-60' : 'bg-surface border-border hover:border-primary-200'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={t.isCompleted}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className={cn('font-medium', t.isCompleted ? 'line-through text-foreground-muted' : 'text-foreground')}>
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-data text-foreground-subtle">Due: {t.dueDate}</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                            t.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          )}
                        >
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Site Visits */}
            {activeTab === 'visits' && (
              <div className="space-y-3">
                {inv.siteVisits.length === 0 ? (
                  <div className="p-8 text-center text-foreground-muted text-xs">
                    No site visits recorded yet for this investor.
                  </div>
                ) : (
                  inv.siteVisits.map((sv) => (
                    <Card key={sv.id} padding="md" variant="default" className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary" /> {sv.locationName}
                        </span>
                        <span className="font-data text-foreground-subtle">{sv.visitDate}</span>
                      </div>
                      <p className="text-xs text-foreground-muted">{sv.notes}</p>
                      <div className="text-[10px] text-foreground-subtle flex items-center justify-between pt-2 border-t border-border/40">
                        <span>Conducted by: {sv.conductedBy}</span>
                        <span>{sv.attachmentsCount} Photos/Docs Uploaded</span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Tab 5: MoUs */}
            {activeTab === 'mous' && (
              <div className="space-y-3">
                {mous.length === 0 ? (
                  <div className="p-8 text-center text-foreground-muted text-xs">
                    No MoUs associated with this investor.
                  </div>
                ) : (
                  mous.map((m: any) => (
                    <Card key={m.id} padding="md" variant="default" className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground font-mono">{m.id}</span>
                        <StatusBadge status={m.status} />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{m.mouTitle}</h4>
                      <div className="flex flex-col gap-1 text-[11px] text-foreground-muted">
                        <p><strong>Party 1 (Investor):</strong> {m.investorName} {m.investorSigned ? '✅' : '⏳'}</p>
                        {m.targetName && (
                          <p><strong>Party 2 (Target):</strong> {m.targetName} {m.targetSigned ? '✅' : '⏳'}</p>
                        )}
                        <p><strong>Dept Officer:</strong> {m.departmentOfficerName} {m.departmentSigned ? '✅' : '⏳'}</p>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      />

      {/* Append-Only Communication Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddLog} className="bg-surface rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground">Log Interaction Entry (Append-Only)</h3>

            <div className="space-y-3">
              <Select
                label="Interaction Type"
                options={[
                  { value: 'meeting', label: 'B2G / B2B Meeting' },
                  { value: 'call', label: 'Phone Call / Teleconference' },
                  { value: 'email', label: 'Email Communication' },
                  { value: 'site_visit', label: 'Industrial Site Inspection' },
                ]}
                value={logForm.type}
                onChange={(e) => setLogForm({ ...logForm, type: e.target.value as any })}
              />

              <Textarea
                label="Interaction Summary & Action Points"
                isRequired
                placeholder="Detail the discussion points, investor commitments, or required follow-ups..."
                value={logForm.summary}
                onChange={(e) => setLogForm({ ...logForm, summary: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowLogModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm">
                Save Log Entry
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
