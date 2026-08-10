/**
 * SISMP — MoU Management & Drafting Screen
 * Used by Department Officers & Relationship Managers.
 * Key interaction pattern per prompt Section 5:
 * - Signature Status Panel clearly displaying signature status for BOTH parties (Investor + Department Officer).
 * - "Mark Signed / Execute" button is STRICTLY DISABLED unless BOTH signatures are verified on file!
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/patterns/StatusBadge';
import { MOU_STATUSES } from '@/lib/constants/statuses';
import { formatCompactINR } from '@/lib/utils';
import { type MoURecord } from '@/lib/api/mocks/crmMockData';
import {
  FileSignature,
  CheckCircle2,
  AlertCircle,
  Download,
  Building2,
  ShieldCheck,
  Plus,
  Lock,
  Landmark,
  XCircle
} from 'lucide-react';

export default function MoUPage() {
  const [mous, setMous] = useState<MoURecord[]>([]);
  const [selectedMoU, setSelectedMoU] = useState<MoURecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  
  const [draftForm, setDraftForm] = useState({
    applicantId: '',
    investorName: '',
    companyName: '',
    departmentName: 'Department of Industrial Policy',
    mouTitle: '',
    proposedInvestmentINR: 100000000,
    estimatedJobs: 100,
    sector: 'IT & ITES',
    meetingId: '',
    targetId: '',
    targetName: '',
  });

  const [meetings, setMeetings] = useState<any[]>([]);

  const loadMoUs = async () => {
    try {
      const res = await fetch('/api/v1/mou');
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (res.ok && json.success && json.data) {
        setMous(json.data);
        setSelectedMoU((prev) => {
          if (!prev) return json.data.length > 0 ? json.data[0] : null;
          return json.data.find((m: MoURecord) => m.id === prev.id) || prev;
        });
      }
    } catch (err) {
      console.warn('Failed to load MoUs:', err);
    }
  };

  const loadMeetings = async () => {
    try {
      const res = await fetch('/api/v1/requests/meetings');
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (res.ok && json.success && json.data) {
        setMeetings(json.data);
        
        // Auto-prefill if meetingId is in URL
        const params = new URLSearchParams(window.location.search);
        const mId = params.get('meetingId');
        if (mId) {
          const mtg = json.data.find((m: any) => m.id === mId);
          if (mtg) {
            setDraftForm(prev => ({
              ...prev,
              meetingId: mtg.id,
              applicantId: mtg.applicantId,
              investorName: mtg.applicantName || mtg.investorName,
              companyName: mtg.companyName,
              departmentName: mtg.departmentName || 'Department of Industrial Policy',
              targetId: mtg.officerId || '',
              targetName: mtg.officerName || '',
              sector: mtg.sector || 'General',
              mouTitle: `MoU - ${mtg.companyName} & ${mtg.departmentName || 'Dept'}`,
            }));
            setShowDraftModal(true);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load meetings:', err);
    }
  };

  useEffect(() => {
    loadMoUs();
    loadMeetings();
  }, []);

  function isTimeSlotPassed(dateStr: string, timeSlotStr: string) {
    if (timeSlotStr === 'Pending' || !timeSlotStr) return false;
    const parts = timeSlotStr.split(' - ');
    if (parts.length < 2) return false;
    const endStr = parts[1]; 
    const timeParts = endStr.split(' ');
    if (timeParts.length < 2) return false;
    const [time, period] = timeParts;
    const hm = time.split(':').map(Number);
    let h = hm[0], m = hm[1];
    let endHour = h;
    if (period === 'PM' && h !== 12) endHour += 12;
    if (period === 'AM' && h === 12) endHour = 0;
    
    const endDateTime = new Date(dateStr);
    endDateTime.setHours(endHour, m, 0, 0);
    
    return new Date() > endDateTime;
  }

  const handleDraftMoU = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verification check: Does this investor have a completed meeting?
    const hasCompletedMeeting = meetings.some((m: any) => {
      if (draftForm.meetingId && m.id === draftForm.meetingId) return true;
      const matchName = m.applicantName === draftForm.investorName || m.investorName === draftForm.investorName;
      if (!matchName) return false;
      const status = m.status === 'Pending' ? 'Requested' : m.status;
      if (status === 'Completed') return true;
      if ((status === 'Confirmed' || status === 'Scheduled') && isTimeSlotPassed(m.requestedDate || '2026-02-24', m.scheduledTime || m.timeSlot)) {
        return true;
      }
      return false;
    });

    if (!hasCompletedMeeting) {
      alert("WARNING: MoU Draft Blocked.\nNo completed meeting found for this investor. Bilateral meetings must be completed before an MoU can be drafted.");
      return;
    }

    const payloadDraftData = {
      ...draftForm,
      meetingId: draftForm.meetingId,
      targetId: draftForm.targetId,
      targetName: draftForm.targetName,
    };

    const res = await fetch('/api/v1/mou', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'draft', draftData: payloadDraftData }),
    });
    if (res.ok) {
      setShowDraftModal(false);
      loadMoUs();
    }
  };

  // Toggle department signature (Simulating Officer signing the MoU)
  const handleDepartmentSign = async (id: string, isRevoke: boolean = false) => {
    const res = await fetch('/api/v1/mou', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isRevoke ? 'revoke' : 'sign', mouId: id, party: 'department' }),
    });
    if (res.ok) loadMoUs();
  };

  // Execute MoU (Only allowed when both parties signed)
  const handleExecuteMoU = async (id: string) => {
    setIsProcessing(true);
    const res = await fetch('/api/v1/mou', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'execute', mouId: id }),
    });
    if (res.ok) loadMoUs();
    setIsProcessing(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Header Toolbar */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">MoU Drafting & Execution Management</h1>
          <p className="text-xs text-foreground-muted">
            Track MoU lifecycle, verify bilateral digital signatures, and execute binding investment agreements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="accent" size="sm" onClick={() => setShowDraftModal(true)}>
            <Plus className="w-4 h-4" /> Draft New MoU
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: MoU List Queue */}
        <div className="lg:col-span-5 p-6 border-r border-border overflow-y-auto space-y-4">
          <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider">
            MoU Agreement Records ({mous.length})
          </h2>

          <div className="space-y-3">
            {mous.map((m) => {
              const isSelected = selectedMoU?.id === m.id;
              const bothSigned = m.investorSigned && m.departmentSigned;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMoU(m)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 space-y-2 ${
                    isSelected
                      ? 'bg-primary-50/70 border-primary shadow-sm'
                      : 'bg-surface border-border hover:bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-data text-xs font-bold text-primary">{m.id}</span>
                    <StatusBadge status={m.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{m.mouTitle}</h3>
                  <p className="text-xs text-foreground-muted truncate">{m.companyName}</p>

                  <div className="flex items-center justify-between text-[11px] text-foreground-subtle pt-2 border-t border-border/40 font-data">
                    <span>Investment: <strong className="text-emerald-700">{formatCompactINR(m.proposedInvestmentINR)}</strong></span>
                    <span>Jobs: <strong>{m.estimatedJobs.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: MoU Detail View */}
        <div className="lg:col-span-7 bg-surface p-6 overflow-y-auto">
          {selectedMoU ? (
            <div className="space-y-6 max-w-3xl">
              {/* Header Details Card */}
              <Card padding="lg" variant="default" className="space-y-4">
                <div className="flex items-start justify-between border-b border-border/60 pb-3">
                  <div>
                    <span className="font-data text-xs font-bold text-primary">{selectedMoU.id}</span>
                    <h2 className="text-xl font-extrabold text-foreground mt-1">{selectedMoU.mouTitle}</h2>
                    <p className="text-sm text-foreground-muted">
                      {selectedMoU.companyName} &bull; {selectedMoU.departmentName}
                    </p>
                  </div>
                  <StatusBadge status={selectedMoU.status} size="md" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-foreground-subtle block">Proposed Investment:</span>
                    <span className="font-data font-bold text-emerald-700 text-sm">
                      {formatCompactINR(selectedMoU.proposedInvestmentINR)}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground-subtle block">Estimated Employment:</span>
                    <span className="font-data font-semibold text-foreground">
                      {selectedMoU.estimatedJobs.toLocaleString('en-IN')} Jobs
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground-subtle block">Sector:</span>
                    <span className="font-medium text-foreground">{selectedMoU.sector}</span>
                  </div>
                </div>
              </Card>

              {/* Bilateral Signature Status Panel */}
              <Card padding="md" variant="outlined" className="space-y-4 bg-background">
                <h3 className="text-sm font-bold text-foreground">Bilateral & Department Signature Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Party 1: Investor Signature */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      selectedMoU.investorSigned
                        ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50/50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" /> Party 1: Investor Signature
                        </span>
                        <span>{selectedMoU.investorSigned ? '✓ SIGNED' : 'PENDING'}</span>
                      </div>
                      <p className="text-xs font-medium">{selectedMoU.investorName}</p>
                      <p className="text-[11px] opacity-80">{selectedMoU.companyName}</p>
                    </div>

                    {selectedMoU.investorSigned && selectedMoU.investorSignedAt && (
                      <p className="text-[10px] font-mono opacity-70">
                        Signed: {new Date(selectedMoU.investorSignedAt).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  {/* Party 2: Target Attendee Signature */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      selectedMoU.targetSigned
                        ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50/50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" /> Party 2: Target Signature
                        </span>
                        <span>{selectedMoU.targetSigned ? '✓ SIGNED' : 'PENDING'}</span>
                      </div>
                      <p className="text-xs font-medium">{selectedMoU.targetName || 'Target Attendee'}</p>
                      {selectedMoU.targetId && <p className="text-[11px] opacity-80">{selectedMoU.targetId}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-foreground-muted">
                      {selectedMoU.targetSigned ? (
                         <span>Signed securely by attendee</span>
                      ) : (
                         <span>Awaiting signature from attendee</span>
                      )}
                    </div>

                    {selectedMoU.targetSigned && selectedMoU.targetSignedAt && (
                      <p className="text-[10px] font-mono opacity-70">
                        Signed: {new Date(selectedMoU.targetSignedAt).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  {/* Party 3: Department Signature */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      selectedMoU.departmentSigned
                        ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50/50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <Landmark className="w-4 h-4" /> Party 3: Department Signature
                        </span>
                        <span>{selectedMoU.departmentSigned ? '✓ SIGNED' : 'PENDING'}</span>
                      </div>
                      <p className="text-xs font-medium">Authorized Department Officer</p>
                      <p className="text-[11px] opacity-80">{selectedMoU.departmentName}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        variant={selectedMoU.departmentSigned ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleDepartmentSign(selectedMoU.id, selectedMoU.departmentSigned)}
                      >
                        {selectedMoU.departmentSigned ? 'Revoke Signature' : 'Sign as Dept Officer'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Prompt Section 5 Rule Enforcer Warning */}
                {(!selectedMoU.investorSigned || !selectedMoU.targetSigned || !selectedMoU.departmentSigned) && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold">Execution Rule Enforced:</span> &ldquo;Mark Executed&rdquo; action is strictly disabled until the Investor, Target Attendee, and Department Officer signatures are verified on file.
                    </div>
                  </div>
                )}
              </Card>

              {/* Execution Toolbar */}
              <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" /> Download PDF Draft
                </Button>

                <Button
                  variant="accent"
                  size="md"
                  disabled={!selectedMoU.investorSigned || !selectedMoU.targetSigned || !selectedMoU.departmentSigned || selectedMoU.status === MOU_STATUSES.EXECUTED}
                  isLoading={isProcessing}
                  onClick={() => handleExecuteMoU(selectedMoU.id)}
                >
                  <ShieldCheck className="w-4 h-4" /> Mark Signed & Execute MoU
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-foreground-muted text-sm">
              Select an MoU record to view bilateral signature status.
            </div>
          )}
        </div>
      </div>

      {/* Draft New MoU Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Draft New MoU</h2>
              <button onClick={() => setShowDraftModal(false)} className="text-foreground-muted hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleDraftMoU} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground-subtle uppercase">MoU Title</label>
                <Input required value={draftForm.mouTitle} onChange={e => setDraftForm({...draftForm, mouTitle: e.target.value})} placeholder="e.g. Strategic Investment in EV Manufacturing" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground-subtle uppercase">Applicant ID (Investor)</label>
                  <Input required value={draftForm.applicantId} onChange={e => setDraftForm({...draftForm, applicantId: e.target.value})} placeholder="e.g. IMP26-84015" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground-subtle uppercase">Investor Name</label>
                  <Input required value={draftForm.investorName} onChange={e => setDraftForm({...draftForm, investorName: e.target.value})} placeholder="e.g. Elena Rostova" />
                </div>
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground-subtle uppercase">Meeting ID (Optional)</label>
                    <Input value={draftForm.meetingId} onChange={e => setDraftForm({...draftForm, meetingId: e.target.value})} placeholder="e.g. meet-..." disabled={!!draftForm.meetingId} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground-subtle uppercase">Target Attendee</label>
                    <Input value={draftForm.targetName} onChange={e => setDraftForm({...draftForm, targetName: e.target.value})} placeholder="e.g. Govt Official Name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground-subtle uppercase">Company Name</label>
                  <Input required value={draftForm.companyName} onChange={e => setDraftForm({...draftForm, companyName: e.target.value})} placeholder="e.g. FutureTech Corp" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground-subtle uppercase">Target Sector</label>
                  <Input required value={draftForm.sector} onChange={e => setDraftForm({...draftForm, sector: e.target.value})} placeholder="e.g. IT & ITES" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground-subtle uppercase">Proposed Investment (₹)</label>
                  <Input type="number" min="0" required value={draftForm.proposedInvestmentINR} onChange={e => setDraftForm({...draftForm, proposedInvestmentINR: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground-subtle uppercase">Estimated Jobs</label>
                  <Input type="number" min="0" required value={draftForm.estimatedJobs} onChange={e => setDraftForm({...draftForm, estimatedJobs: Number(e.target.value)})} />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowDraftModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create Draft</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
