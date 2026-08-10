/**
 * SISMP — Dynamic Registration Status Tracker
 * Looks up real attendee registration status by Registration ID (e.g. IMP26-84015) or email.
 * Visual pipeline: Submitted → Under Review → Approved / Rejected / Resubmit.
 */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/config';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/patterns/StatusBadge';
import { BadgeQRCode } from '@/components/ui/BadgeQRCode';
import { MOCK_REGISTRATION_RECORDS, type StaffRegistrationRecord } from '@/lib/api/mocks/staffMockData';
import { REGISTRATION_STATUSES, BADGE_ROLES, BADGE_ROLE_COLORS } from '@/lib/constants/statuses';
import { cn } from '@/lib/utils';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Building,
  User,
  Mail,
  RefreshCw,
  Landmark,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { AttendeeServices } from '@/components/shared/AttendeeServices';

const STATUS_PIPELINE = [
  { key: 'Submitted', icon: FileText, label: 'Submitted' },
  { key: 'Under Review', icon: Clock, label: 'Under Review' },
  { key: 'Decision', icon: CheckCircle2, label: 'Decision' },
];

function StatusTrackerContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const initialId = searchParams.get('id') || '';

  const [searchValue, setSearchValue] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [record, setRecord] = useState<StaffRegistrationRecord | null>(null);
  const [mous, setMous] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'meetings'>('status');

  const fetchMoUs = async (query: string) => {
    try {
      const res = await fetch('/api/v1/mou?participantId=' + encodeURIComponent(query));
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (res.ok && json.success && json.data) {
        setMous(json.data);
      } else {
        setMous([]);
      }
    } catch (err) {
      console.error('Failed to fetch MoUs:', err);
      setMous([]);
    }
  };

  const performSearch = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setRecord(null);
      setNotFound(false);
      setMous([]);
      setMeetings([]);
      return;
    }

    setIsSearching(true);
    setNotFound(false);

    try {
      const res = await fetch('/api/v1/registrations/' + encodeURIComponent(q));
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (res.ok && json.success && json.data) {
        const resolvedId = json.data.id;
        setSearchValue(resolvedId);
        
        // Update URL to show the ID instead of email
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('id', resolvedId);
          window.history.replaceState({}, '', url);
        }

        setRecord(json.data);
        await fetchMoUs(resolvedId);
        
        // Fetch Meetings
        const mRes = await fetch('/api/v1/requests/meetings?applicantId=' + encodeURIComponent(resolvedId));
        const mText = await mRes.text();
        const mJson = mText ? JSON.parse(mText) : {};
        if (mRes.ok && mJson.success && mJson.data) {
          setMeetings(mJson.data);
        } else {
          setMeetings([]);
        }
      } else {
        setRecord(null);
        setNotFound(true);
        setMous([]);
        setMeetings([]);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setRecord(null);
      setNotFound(true);
      setMous([]);
      setMeetings([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSignMoU = async (mouId: string, party: 'investor' | 'target') => {
    try {
      const res = await fetch('/api/v1/mou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign', mouId, party }),
      });
      if (res.ok) {
        await fetchMoUs(searchValue);
      }
    } catch (err) {
      console.error('Failed to sign MoU:', err);
    }
  };

  useEffect(() => {
    if (initialId) {
      setSearchValue(initialId);
      performSearch(initialId);
    } else {
      setRecord(MOCK_REGISTRATION_RECORDS[0]);
      setSearchValue(MOCK_REGISTRATION_RECORDS[0].id);
    }
  }, [initialId]);

  const getStepStatus = (stepKey: string) => {
    if (!record) return 'pending';
    const statusOrder = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Resubmit'];
    const regStatusIndex = statusOrder.indexOf(record.status);
    if (stepKey === 'Decision') {
      if (regStatusIndex >= 2) return 'completed';
      return 'pending';
    }
    if (stepKey === 'Submitted') return 'completed';
    if (stepKey === 'Under Review') return regStatusIndex >= 1 ? 'completed' : 'current';
    return 'pending';
  };

  const generateTimeline = (r: StaffRegistrationRecord) => {
    const baseDate = (r as any).submittedAt || (r as any).createdAt || new Date().toISOString();
    
    const events = [
      {
        status: 'Submitted',
        date: baseDate,
        description: 'Application submitted via SISMP Public Portal',
      },
      {
        status: 'Under Review',
        date: new Date(new Date(baseDate).getTime() + 1800000).toISOString(),
        description: `Queued for ${r.department || 'Department Nodal Officer'} verification`,
      },
    ];

    if (r.status === REGISTRATION_STATUSES.APPROVED) {
      events.push({
        status: 'Approved',
        date: new Date(new Date(baseDate).getTime() + 3600000 * 24).toISOString(),
        description: 'Approved by Nodal Officer. QR Badge & Entry Pass dispatched via Resend Email.',
      });
    } else if (r.status === REGISTRATION_STATUSES.REJECTED) {
      events.push({
        status: 'Rejected',
        date: new Date(new Date(baseDate).getTime() + 3600000 * 18).toISOString(),
        description: r.rejectionReason ? `Reason: ${r.rejectionReason}` : 'Application rejected by Department Officer.',
      });
    } else if (r.status === REGISTRATION_STATUSES.RESUBMIT) {
      events.push({
        status: 'Resubmit Requested',
        date: new Date(new Date(baseDate).getTime() + 3600000 * 12).toISOString(),
        description: r.resubmitReason ? `Action required: ${r.resubmitReason}` : 'Additional documentation required.',
      });
    }

    return events;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-primary" /> Live Application Status Verification
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {t('status', 'title')}
            </h1>
            <p className="text-foreground-muted text-sm max-w-md mx-auto">
              Enter your Registration ID (e.g. <span className="font-mono font-bold text-primary">IMP26-84015</span>) or registered email address to check approval status.
            </p>
          </div>

          {/* Search Card */}
          <Card variant="elevated" padding="lg" className="border-primary-100 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="e.g. IMP26-84015 or v.birla@adityabirla.com"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') performSearch(searchValue);
                  }}
                />
              </div>
              <Button
                variant="accent"
                onClick={() => performSearch(searchValue)}
                isLoading={isSearching}
                className="sm:w-auto w-full shadow-md"
              >
                <Search className="w-4 h-4" />
                {t('status', 'trackButton')}
              </Button>
            </div>

            {/* Quick Demo ID suggestions */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-subtle pt-1">
              <span className="font-bold">Try Sample IDs:</span>
              {['IMP26-84015', 'IMP26-00104', 'IMP26-00105', 'IMP26-00106', 'IMP26-00107'].map((sampleId) => (
                <button
                  key={sampleId}
                  onClick={() => {
                    setSearchValue(sampleId);
                    performSearch(sampleId);
                  }}
                  className="px-2 py-0.5 rounded bg-surface hover:bg-primary-50 border border-border hover:border-primary-300 font-mono text-[11px] font-semibold text-primary transition-colors"
                >
                  {sampleId}
                </button>
              ))}
            </div>

            {notFound && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>No registration record found for &quot;{searchValue}&quot;. Please verify your Registration ID.</span>
              </div>
            )}
          </Card>

          {/* Results Display */}
          {record && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Tabs Navigation */}
              <div className="flex border-b border-border mb-6">
                <button
                  className={cn("px-4 py-2 font-bold text-sm", activeTab === 'status' ? "border-b-2 border-primary text-primary" : "text-foreground-muted hover:text-foreground")}
                  onClick={() => setActiveTab('status')}
                >
                  Application Status
                </button>
                <button
                  className={cn("px-4 py-2 font-bold text-sm", activeTab === 'meetings' ? "border-b-2 border-primary text-primary" : "text-foreground-muted hover:text-foreground")}
                  onClick={() => setActiveTab('meetings')}
                >
                  Meetings Inbox {meetings.filter((m: any) => m.officerId === record.id && (m.status === 'Pending_Peer_Acceptance' || m.status === 'Pending')).length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{meetings.filter((m: any) => m.officerId === record.id && (m.status === 'Pending_Peer_Acceptance' || m.status === 'Pending')).length}</span>
                  )}
                </button>
              </div>

              {activeTab === 'status' && (
                <>
              {/* Pipeline Card */}
              <Card variant="default" padding="lg" className="border-border shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-primary" /> Current Verification Stage
                  </h2>
                  <StatusBadge status={record.status} size="md" />
                </div>

                {/* Visual Pipeline */}
                <div className="flex items-center justify-between px-4 py-2">
                  {STATUS_PIPELINE.map((step, i) => {
                    const status = getStepStatus(step.key);
                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={cn(
                              'w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm',
                              status === 'completed' && 'bg-emerald-600 text-white',
                              status === 'current' && 'bg-primary text-white ring-4 ring-primary-100',
                              status === 'pending' && 'bg-surface border-2 border-border text-foreground-subtle'
                            )}
                          >
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <step.icon className="w-5 h-5" />
                            )}
                          </div>
                          <span
                            className={cn(
                              'text-xs font-bold text-center',
                              status === 'completed' && 'text-emerald-700',
                              status === 'current' && 'text-primary',
                              status === 'pending' && 'text-foreground-subtle'
                            )}
                          >
                            {step.key === 'Decision' ? record.status : step.label}
                          </span>
                        </div>
                        {i < STATUS_PIPELINE.length - 1 && (
                          <div
                            className={cn(
                              'flex-1 h-1 mx-3 rounded-full',
                              getStepStatus(STATUS_PIPELINE[i + 1].key) !== 'pending' ? 'bg-emerald-500' : 'bg-border'
                            )}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Status Message Boxes */}
                {record.status === REGISTRATION_STATUSES.SUBMITTED && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Clock className="w-4 h-4 text-blue-600" /> Application Submitted & Under Review
                    </div>
                    <p className="text-xs text-blue-800">
                      Your application <strong>#{record.id}</strong> has been successfully submitted and is currently queued for document verification by the <strong>{record.department || 'Department Nodal Officer'}</strong>.
                    </p>
                  </div>
                )}

                {record.status === REGISTRATION_STATUSES.APPROVED && (
                  <div className="space-y-6">
                    {/* Access Approved Alert Banner */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Summit Access Approved
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        Your registration has been approved by the Nodal Officer. Your official digital pass, scannable badge entry QR code, and credentials have been dispatched. Present this QR code at the venue gate for entry.
                      </p>
                    </div>

                    {/* Official Digital Entry Pass (Printable Card) */}
                    <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border/60">
                      <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest block mb-4">
                        Your Digital Entry Pass
                      </span>

                      {/* Pass Card Container */}
                      <div id="attendee-pass-card" className="w-[300px] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 relative">
                        {/* Top Band (Role Color per BRD) */}
                        <div className={cn(
                          'py-3.5 px-4 text-center font-extrabold text-sm uppercase tracking-wider',
                          (BADGE_ROLE_COLORS[record.badgeRole] || BADGE_ROLE_COLORS.Investor).bg,
                          (BADGE_ROLE_COLORS[record.badgeRole] || BADGE_ROLE_COLORS.Investor).text
                        )}>
                          {record.badgeRole || 'Investor'}
                        </div>

                        {/* Pass Body Content */}
                        <div className="p-5 text-center space-y-4">
                          {/* Event Watermark Logo */}
                          <div className="flex items-center justify-center gap-1.5 text-primary dark:text-primary-light font-black text-[10px] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center font-bold text-[9px]">MP</div>
                            INVEST MADHYA PRADESH 2026
                          </div>

                          {/* Live Generated QR Code */}
                          <div className="mx-auto flex items-center justify-center bg-white p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <BadgeQRCode
                              registrationId={record.id}
                              applicantName={record.applicantName}
                              organization={record.organization}
                              badgeRole={record.badgeRole || 'Investor'}
                              size={130}
                              colorDark="#0F172A"
                              colorLight="#FFFFFF"
                            />
                          </div>

                          {/* Attendee Name, Designation, and Org */}
                          <div>
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                              {record.applicantName}
                            </h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                              {record.designation || 'Participant'}
                            </p>
                            <p className="text-xs font-bold text-primary dark:text-primary-light uppercase mt-0.5">
                              {record.organization}
                            </p>
                          </div>

                          {/* Venue Hall Access Scopes */}
                          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                            <span>ZONE: MAIN HALL & VIP</span>
                            <span>{record.id}</span>
                          </div>
                        </div>

                        {/* Bottom Pass Bar */}
                        <div className="bg-slate-900 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[8px] py-1.5 px-3 text-center font-mono uppercase tracking-wider">
                          NON-TRANSFERABLE • GIS-2026 OFFICIAL PASS
                        </div>
                      </div>

                      {/* Print Pass CTA */}
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') window.print();
                        }}
                        className="print-hide mt-5 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold border border-border shadow-sm text-foreground transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print / Save Pass
                      </button>
                    </div>
                  </div>
                )}

                {record.status === REGISTRATION_STATUSES.REJECTED && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-600" /> Application Rejected
                    </div>
                    <p className="text-xs text-red-800">
                      Reason: <strong className="font-semibold">{record.rejectionReason || 'Document verification criteria not met.'}</strong>
                    </p>
                  </div>
                )}

                {record.status === REGISTRATION_STATUSES.RESUBMIT && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <RefreshCw className="w-4 h-4 text-amber-600" /> Action Required: Resubmit Documentation
                    </div>
                    <p className="text-xs text-amber-800">
                      Nodal Officer Request: <strong className="font-semibold">{record.resubmitReason || 'Please upload a clearer copy of your company registration certificate.'}</strong>
                    </p>
                  </div>
                )}
              </Card>

              {/* Registration Record Details Card */}
              <Card variant="default" padding="lg" className="border-border shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider border-b border-border/60 pb-2">
                  Registration Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground-subtle block text-[11px]">Registration ID</span>
                      <span className="font-mono font-bold text-foreground text-sm">{record.id}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground-subtle block text-[11px]">Applicant Name</span>
                      <span className="font-bold text-foreground">{record.applicantName}</span>
                      {record.designation && (
                        <span className="text-foreground-muted block text-[11px]">{record.designation}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground-subtle block text-[11px]">Official Email</span>
                      <span className="font-semibold text-foreground font-mono">{record.email}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground-subtle block text-[11px]">Enterprise & Sector</span>
                      <span className="font-bold text-foreground">{record.organization}</span>
                      <span className="text-primary font-semibold block text-[11px]">{record.sector}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground-subtle block text-[11px]">Submission Date</span>
                      <span className="font-medium text-foreground">
                        {new Date((record as any).submittedAt || (record as any).createdAt || new Date()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground-subtle block text-[11px]">Assigned Nodal Department</span>
                      <span className="font-medium text-foreground">{record.department || 'Department of Industrial Policy'}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Dynamic Attendee Services Portal (Only for Approved Attendees) */}
              {record.status === REGISTRATION_STATUSES.APPROVED && (
                <AttendeeServices record={record} />
              )}

              {/* Assigned MoUs Card */}
              {mous.length > 0 && (
                <Card variant="default" padding="lg" className="border-border shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider border-b border-border/60 pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Assigned Memorandums of Understanding (MoU)
                  </h3>
                  <div className="space-y-4">
                    {mous.map((m) => {
                      const isInvestor = m.applicantId === record.id;
                      const isTarget = m.targetId === record.id;
                      const hasSigned = (isInvestor && m.investorSigned) || (isTarget && m.targetSigned);
                      
                      return (
                        <div key={m.id} className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-semibold text-primary">{m.id}</span>
                              <span className="text-[10px] uppercase font-bold text-foreground-subtle px-2 py-0.5 rounded-full bg-background border border-border">
                                {isInvestor ? 'Party 1 (Investor)' : 'Party 2 (Target Attendee)'}
                              </span>
                            </div>
                            <p className="font-bold text-sm text-foreground">{m.mouTitle}</p>
                            <p className="text-xs text-foreground-muted">Sector: {m.sector}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            {hasSigned ? (
                              <div className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Signed Successfully
                              </div>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSignMoU(m.id, isInvestor ? 'investor' : 'target')}
                              >
                                Sign MoU Now
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Audit Timeline Card */}
              <Card variant="default" padding="lg" className="border-border shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider border-b border-border/60 pb-2">
                  Audit Log Timeline
                </h3>

                <div className="space-y-4 pt-1">
                  {generateTimeline(record).map((event, i, arr) => (
                    <div key={i} className="flex gap-4 items-start relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full shrink-0 mt-1',
                            i === arr.length - 1 ? 'bg-primary ring-4 ring-primary-100' : 'bg-emerald-500'
                          )}
                        />
                        {i < arr.length - 1 && <div className="w-0.5 h-10 bg-border my-1" />}
                      </div>

                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-foreground block">{event.status}</span>
                        <span className="text-xs text-foreground-muted block">{event.description}</span>
                        <span className="text-[10px] text-foreground-subtle font-mono block">
                          {new Date(event.date).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              </>
              )}

              {activeTab === 'meetings' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground">B2B Meetings Inbox</h3>
                  <p className="text-sm text-foreground-muted pb-4 border-b border-border">
                    Manage meeting requests with other investors and startup founders.
                  </p>

                  {meetings.length === 0 ? (
                    <div className="p-8 text-center border border-border rounded-xl bg-surface">
                      <p className="text-foreground-muted text-sm font-semibold">No meeting requests found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {meetings.map((m: any) => {
                        const isIncoming = m.officerId === record.id;
                        const isPendingAcceptance = m.status === 'Pending_Peer_Acceptance' || m.status === 'Pending';

                        const handleAcceptDecline = async (action: 'accept' | 'decline') => {
                          try {
                            const res = await fetch(`/api/v1/meetings/${m.id}/accept`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action })
                            });
                            if (res.ok) {
                              alert(`Meeting ${action}ed successfully!`);
                              window.location.reload();
                            } else {
                              alert(`Failed to ${action} meeting.`);
                            }
                          } catch (e) {
                            alert('An error occurred.');
                          }
                        };

                        return (
                          <div key={m.id} className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-semibold text-primary">{m.id}</span>
                                <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border", 
                                  isIncoming ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
                                )}>
                                  {isIncoming ? 'Incoming Request' : 'Outgoing Request'}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                  {m.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="font-bold text-sm text-foreground">
                                {isIncoming ? `From: ${m.applicantName} (${m.companyName})` : `To: ${m.officerName} (${m.departmentName})`}
                              </p>
                              <p className="text-xs text-foreground-muted mt-1">
                                Requested Date: {m.requestedDate || 'TBD'} | Duration: 30 mins
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {isIncoming && isPendingAcceptance && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => handleAcceptDecline('decline')} className="border-red-200 text-red-600 hover:bg-red-50">
                                    Decline
                                  </Button>
                                  <Button variant="primary" size="sm" onClick={() => handleAcceptDecline('accept')} className="bg-emerald-600 hover:bg-emerald-700">
                                    Accept Meeting
                                  </Button>
                                </>
                              )}
                              {!isPendingAcceptance && m.status === 'Requested' && (
                                <span className="text-xs font-semibold text-amber-600">Waiting for RM Scheduling</span>
                              )}
                              {m.status === 'Scheduled' && (
                                <span className="text-xs font-bold text-emerald-600">Scheduled: {m.timeSlot}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-foreground-muted text-sm font-semibold">
          Loading Application Status...
        </div>
      }
    >
      <StatusTrackerContent />
    </Suspense>
  );
}
