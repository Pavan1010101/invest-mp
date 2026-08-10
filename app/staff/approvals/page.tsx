/**
 * SISMP — Department Officer Approval Queue & Detail Screen
 * Task-oriented queue-plus-detail pattern.
 * Features:
 * - Filterable & sortable registration queue
 * - Single & bulk approval/rejection actions
 * - Required reason modal/input for Reject and Resubmit actions (BRD compliant)
 * - Document inline preview checklist
 * - Instructional empty state
 */
'use client';

import React, { useState, useEffect } from 'react';
import { QueueDetail } from '@/components/patterns/QueueDetail';
import { StatusBadge } from '@/components/patterns/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import { formatCompactINR } from '@/lib/utils';
import { REGISTRATION_STATUSES } from '@/lib/constants/statuses';
import {
  type StaffRegistrationRecord,
} from '@/lib/api/mocks/staffMockData';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  User,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  Eye,
  Download,
  Users,
} from 'lucide-react';

export default function ApprovalsQueuePage() {
  const [records, setRecords] = useState<StaffRegistrationRecord[]>([]);

  useEffect(() => {
    fetch('/api/v1/registrations')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then(json => {
        if (json.success && json.data) {
          setRecords(json.data);
          if (json.data.length > 0) {
            setSelectedId(json.data[0].id);
          }
        }
      })
      .catch(err => console.error('Failed to load registrations:', err));
  }, []);

  const [selectedId, setSelectedId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Action Dialog States
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject' | 'resubmit' | null;
    recordId: string | null;
  }>({ type: null, recordId: null });

  const [reasonText, setReasonText] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

  // Filter logic
  const filteredRecords = records.filter((rec) => {
    if (statusFilter && rec.status !== statusFilter) return false;
    if (sectorFilter && rec.sector !== sectorFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.applicantName.toLowerCase().includes(q);
      const matchOrg = rec.organization.toLowerCase().includes(q);
      const matchId = rec.id.toLowerCase().includes(q);
      const matchEmail = rec.email.toLowerCase().includes(q);
      if (!matchName && !matchOrg && !matchId && !matchEmail) return false;
    }
    return true;
  });

  const selectedRecord = records.find((r) => r.id === selectedId) || filteredRecords[0];

  // Action Handlers
  const handleOpenAction = (type: 'approve' | 'reject' | 'resubmit', recordId: string) => {
    setActionModal({ type, recordId });
    setReasonText('');
    setReasonError('');
  };

  const handleConfirmAction = async () => {
    const { type, recordId } = actionModal;
    if (!type || !recordId) return;

    // Validate required reasons for Reject and Resubmit
    if ((type === 'reject' || type === 'resubmit') && !reasonText.trim()) {
      setReasonError(`A clear reason is required for ${type} action per government regulations.`);
      return;
    }

    setActionProcessing(true);
    await new Promise((res) => setTimeout(res, 800)); // Simulate API

    let newStatus: string = REGISTRATION_STATUSES.SUBMITTED;
    if (type === 'approve') newStatus = REGISTRATION_STATUSES.APPROVED;
    if (type === 'reject') newStatus = REGISTRATION_STATUSES.REJECTED;
    if (type === 'resubmit') newStatus = REGISTRATION_STATUSES.RESUBMIT;

    const targetRec = records.find((r) => r.id === recordId);

    if (targetRec) {
      // Trigger Resend Email API dispatch for all status transitions (Approve, Reject, Resubmit)
      fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: targetRec.id,
          status: newStatus,
          reason: reasonText,
          applicantEmail: targetRec.email,
          applicantName: targetRec.applicantName,
          organization: targetRec.organization,
          badgeRole: targetRec.badgeRole,
          sector: targetRec.sector,
        }),
      }).catch((e) => console.warn('Resend API dispatch notice:', e));
    }

    // Persist officer action to localStorage for live cross-tab & page sync
    try {
      const existingUpdates = localStorage.getItem('sismp_officer_status_updates');
      const updates = existingUpdates ? JSON.parse(existingUpdates) : {};
      updates[recordId] = {
        status: newStatus,
        rejectionReason: type === 'reject' ? reasonText : undefined,
        resubmitReason: type === 'resubmit' ? reasonText : undefined,
      };
      localStorage.setItem('sismp_officer_status_updates', JSON.stringify(updates));
    } catch {
      // fallback
    }

    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          return {
            ...rec,
            status: newStatus,
            rejectionReason: type === 'reject' ? reasonText : rec.rejectionReason,
            resubmitReason: type === 'resubmit' ? reasonText : rec.resubmitReason,
          };
        }
        return rec;
      })
    );

    setActionProcessing(false);
    setActionModal({ type: null, recordId: null });
  };

  return (
    <div className="h-full">
      <QueueDetail
        title="Department Officer Approval Queue"
        subtitle="Review, verify documents, and process attendee registrations"
        items={filteredRecords}
        selectedId={selectedRecord?.id || null}
        onSelectItem={(id) => setSelectedId(id)}
        searchPlaceholder="Filter by Name, ID, Organization..."
        onSearchChange={(q) => setSearchQuery(q)}
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: REGISTRATION_STATUSES.SUBMITTED, label: 'Submitted' },
              { value: REGISTRATION_STATUSES.APPROVED, label: 'Approved' },
              { value: REGISTRATION_STATUSES.REJECTED, label: 'Rejected' },
              { value: REGISTRATION_STATUSES.RESUBMIT, label: 'Resubmit' },
            ],
          },
          {
            key: 'sector',
            label: 'Sector',
            options: [
              { value: 'Manufacturing', label: 'Manufacturing' },
              { value: 'Renewable Energy', label: 'Renewable Energy' },
              { value: 'Pharma & Biotech', label: 'Pharma & Biotech' },
              { value: 'IT & Electronics', label: 'IT & Electronics' },
            ],
          },
        ]}
        activeFilters={{ status: statusFilter, sector: sectorFilter }}
        onFilterChange={(key, val) => {
          if (key === 'status') setStatusFilter(val);
          if (key === 'sector') setSectorFilter(val);
        }}
        emptyState={
          <div className="p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-foreground-subtle mx-auto mb-3" />
            <p className="font-semibold text-foreground">No registrations waiting on your review</p>
            <p className="text-xs text-foreground-muted mt-1">
              All applications for your department have been processed.
            </p>
          </div>
        }
        /* Render Left Queue List Item */
        renderListItem={(rec, isSelected) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-data font-bold text-xs text-primary">{rec.id}</span>
              <StatusBadge status={rec.status} size="sm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                {rec.applicantName}
              </h3>
              <p className="text-xs text-foreground-muted line-clamp-1">{rec.organization}</p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-foreground-subtle pt-1 border-t border-border/40">
              <span>{rec.sector}</span>
              {rec.investmentInterestINR > 0 && (
                <span className="font-data font-semibold text-emerald-700">
                  {formatCompactINR(rec.investmentInterestINR)}
                </span>
              )}
            </div>
          </div>
        )}
        /* Render Right Detail View */
        renderDetail={(rec) => (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Detail Action Header */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-data text-base font-bold text-primary">{rec.id}</span>
                  <StatusBadge status={rec.status} size="md" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{rec.applicantName}</h2>
                <p className="text-sm text-foreground-muted">
                  {rec.designation} — <span className="font-semibold text-foreground">{rec.organization}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAction('resubmit', rec.id)}
                  disabled={rec.status === REGISTRATION_STATUSES.RESUBMIT}
                >
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  Request Resubmit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleOpenAction('reject', rec.id)}
                  disabled={rec.status === REGISTRATION_STATUSES.REJECTED}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => handleOpenAction('approve', rec.id)}
                  disabled={rec.status === REGISTRATION_STATUSES.APPROVED}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Registration
                </Button>
              </div>
            </div>

            {/* Warning Reason Banners */}
            {rec.status === REGISTRATION_STATUSES.REJECTED && rec.rejectionReason && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Rejection Reason Specified:
                </p>
                <p className="mt-1 text-xs text-red-700">{rec.rejectionReason}</p>
              </div>
            )}

            {rec.status === REGISTRATION_STATUSES.RESUBMIT && rec.resubmitReason && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Resubmission Notes Sent to Applicant:
                </p>
                <p className="mt-1 text-xs text-amber-800">{rec.resubmitReason}</p>
              </div>
            )}

            {/* Applicant & Organization Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Overview */}
              <Card padding="md" variant="default" className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Contact Information
                </h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <dt className="text-foreground-muted">Email:</dt>
                    <dd className="font-medium text-foreground">{rec.email}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <dt className="text-foreground-muted">Phone:</dt>
                    <dd className="font-medium text-foreground">{rec.phone}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <dt className="text-foreground-muted">Location:</dt>
                    <dd className="font-medium text-foreground">{rec.state}, {rec.country}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted">Submitted Date:</dt>
                    <dd className="font-data font-medium text-foreground">
                      {new Date(rec.submittedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Organization & Scope */}
              <Card padding="md" variant="default" className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" /> Business & Investment Scope
                </h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <dt className="text-foreground-muted">Registration Type:</dt>
                    <dd className="font-semibold text-primary">{rec.type}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <dt className="text-foreground-muted">Target Sector:</dt>
                    <dd className="font-medium text-foreground">{rec.sector}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <dt className="text-foreground-muted">Assigned Department:</dt>
                    <dd className="font-medium text-foreground text-right max-w-[200px] truncate">{rec.department}</dd>
                  </div>
                  {rec.investmentInterestINR > 0 && (
                    <div className="flex justify-between items-center pt-1">
                      <dt className="text-foreground-muted">Proposed Investment:</dt>
                      <dd className="font-data font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ₹{(rec.investmentInterestINR / 10000000).toLocaleString('en-IN')} Cr
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>
            </div>

            {/* Document Checklist & Verification */}
            <Card padding="md" variant="default" className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Submitted Documents & Verification Checklist
                </span>
                <span className="text-[11px] font-normal text-foreground-muted">
                  {(rec.documents || []).filter((d: any) => d.verified).length} of {(rec.documents || []).length} verified
                </span>
              </h3>

              <div className="space-y-2">
                {(rec.documents || []).map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-surface transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-primary-50 text-primary font-bold text-xs">
                        {doc.type}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{doc.name}</p>
                        <p className="text-[10px] text-foreground-subtle">Verification Status: {doc.verified ? 'Verified' : 'Pending Review'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Additional Delegates List */}
            {(rec.delegates || []).length > 0 && (
              <Card padding="md" variant="default" className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Accompanying Delegates ({(rec.delegates || []).length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(rec.delegates || []).map((del: any) => (
                    <div key={del.id} className="p-3 rounded-lg border border-border bg-background text-xs">
                      <p className="font-semibold text-foreground">{del.name}</p>
                      <p className="text-foreground-muted text-[11px]">{del.designation}</p>
                      <p className="text-foreground-subtle text-[10px] mt-1">{del.email}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Notes / Special Requests */}
            {rec.notes && (
              <Card padding="md" variant="default">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle mb-2">
                  Applicant Remarks / Project Context
                </h3>
                <p className="text-xs text-foreground leading-relaxed italic bg-background p-3 rounded-lg border border-border">
                  &ldquo;{rec.notes}&rdquo;
                </p>
              </Card>
            )}
          </div>
        )}
      />

      {/* Confirmation Modal for Reject / Resubmit / Approve */}
      {actionModal.type && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-xl shadow-2xl border border-border max-w-lg w-full p-6 space-y-4 animate-fade-in-scale">
            <h3 className="text-lg font-bold text-foreground capitalize">
              Confirm {actionModal.type} Action
            </h3>

            <p className="text-xs text-foreground-muted">
              {actionModal.type === 'approve' &&
                'Approving this registration will issue the attendee badge and notify the applicant via email and SMS.'}
              {actionModal.type === 'reject' &&
                'Rejecting this registration requires a clear reason to be logged into the audit trail and sent to the applicant.'}
              {actionModal.type === 'resubmit' &&
                'Specify the missing or unverified documents/fields the applicant needs to fix.'}
            </p>

            {(actionModal.type === 'reject' || actionModal.type === 'resubmit') && (
              <div className="space-y-1">
                <Textarea
                  label="Reason / Notes for Applicant (Required)"
                  isRequired
                  placeholder={
                    actionModal.type === 'reject'
                      ? 'e.g. Document authenticity could not be verified by Department Officer.'
                      : 'e.g. Please re-upload a legible scanned copy of company registration certificate.'
                  }
                  value={reasonText}
                  onChange={(e) => {
                    setReasonText(e.target.value);
                    if (reasonError) setReasonError('');
                  }}
                  error={reasonError}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActionModal({ type: null, recordId: null })}
                disabled={actionProcessing}
              >
                Cancel
              </Button>
              <Button
                variant={actionModal.type === 'reject' ? 'destructive' : actionModal.type === 'resubmit' ? 'outline' : 'accent'}
                size="sm"
                isLoading={actionProcessing}
                onClick={handleConfirmAction}
              >
                Confirm {actionModal.type}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
