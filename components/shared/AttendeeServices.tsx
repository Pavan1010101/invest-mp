'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Store, Users, Briefcase, PlusCircle, CheckCircle2 } from 'lucide-react';
import { type StaffRegistrationRecord } from '@/lib/api/mocks/staffMockData';

interface AttendeeServicesProps {
  record: StaffRegistrationRecord;
}

export function AttendeeServices({ record }: AttendeeServicesProps) {
  const [pavilionRequests, setPavilionRequests] = useState<any[]>([]);
  const [meetingRequests, setMeetingRequests] = useState<any[]>([]);
  const [incomingMeetings, setIncomingMeetings] = useState<any[]>([]);
  const [mouRequests, setMouRequests] = useState<any[]>([]);
  const [isRequestingPavilion, setIsRequestingPavilion] = useState(false);
  const [isRequestingMeeting, setIsRequestingMeeting] = useState(false);
  const [pavilionForm, setPavilionForm] = useState({ hall: 'Hall A (Manufacturing)', kw: 2 });
  const [meetingForm, setMeetingForm] = useState({ sector: record.sector || 'General', durationMins: 30 });

  const loadRequests = async () => {
    try {
      const [pavRes, meetRes, incomingRes, mouRes] = await Promise.all([
        fetch(`/api/v1/requests/pavilions?applicantId=${encodeURIComponent(record.id)}`),
        fetch(`/api/v1/requests/meetings?applicantId=${encodeURIComponent(record.id)}`),
        fetch(`/api/v1/requests/meetings`), // Need to fetch all and filter for target
        fetch(`/api/v1/mou?applicantId=${encodeURIComponent(record.id)}`),
      ]);
      const [pavData, meetData, incomingData, mouData] = await Promise.all([pavRes.json(), meetRes.json(), incomingRes.json(), mouRes.json()]);
      if (pavData.success) setPavilionRequests(pavData.data);
      if (meetData.success) setMeetingRequests(meetData.data);
      if (incomingData.success) {
        // Filter incoming requests where this attendee is the target
        const incoming = incomingData.data.filter((m: any) => m.officerName === record.applicantName && m.applicantId !== record.id);
        setIncomingMeetings(incoming);
      }
      if (mouData.success) setMouRequests(mouData.data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [record.id]);

  const handleSubmitPavilion = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/v1/requests/pavilions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantId: record.id,
        applicantName: record.applicantName,
        companyName: record.organization,
        requestedHall: pavilionForm.hall,
        sector: record.sector,
        powerRequirementKW: pavilionForm.kw,
      }),
    });
    setIsRequestingPavilion(false);
    loadRequests();
  };

  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/v1/requests/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantId: record.id,
        applicantName: record.applicantName,
        companyName: record.organization,
        sector: meetingForm.sector,
        durationMins: meetingForm.durationMins,
      }),
    });
    setIsRequestingMeeting(false);
    loadRequests();
  };

  const handleCancelPavilion = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    await fetch('/api/v1/requests/pavilions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'Cancelled' }),
    });
    loadRequests();
  };

  const handleCancelMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this meeting request?')) return;
    await fetch('/api/v1/requests/meetings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'Cancelled' }),
    });
    loadRequests();
  };

  const handleRespondToMeeting = async (id: string, accept: boolean) => {
    await fetch('/api/v1/requests/meetings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: accept ? 'Accepted' : 'Declined' }),
    });
    loadRequests();
  };

  const StatusPill = ({ status }: { status: string }) => {
    const color = status === 'Approved' || status === 'Scheduled' || status === 'Executed' || status === 'Signed' ? 'bg-emerald-100 text-emerald-800' :
                  status === 'Pending' || status === 'Pending Signatures' ? 'bg-amber-100 text-amber-800' : 
                  status === 'Cancelled' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-800';
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>{status}</span>;
  };

  const handleSignMoU = async (mouId: string, party: 'investor' | 'target') => {
    try {
      const res = await fetch('/api/v1/mou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign', mouId, party }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to sign MoU. Ensure you have a scheduled meeting first.');
      } else {
        alert('MoU signed successfully!');
        loadRequests();
      }
    } catch (err) {
      alert('Error signing MoU.');
    }
  };

  const isInvestor = record.type.toLowerCase().includes('investor') || record.badgeRole?.toLowerCase() === 'investor';

  return (
    <Card variant="default" padding="lg" className="border-border shadow-sm space-y-6">
      <h3 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider border-b border-border/60 pb-2 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-primary" /> {isInvestor ? 'Investor Command Center' : 'Attendee Services & Requests'}
      </h3>

      <div className={`grid grid-cols-1 gap-6 ${isInvestor ? '' : 'md:grid-cols-2'}`}>
        {/* Pavilion Stalls Section */}
        <div className={`space-y-4 ${isInvestor ? 'bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm' : ''}`}>
          <div className="flex items-center justify-between">
            <h4 className={`font-bold flex items-center gap-2 ${isInvestor ? 'text-lg text-emerald-800 dark:text-emerald-400' : 'text-sm'}`}>
              <Store className={`${isInvestor ? 'w-6 h-6' : 'w-4 h-4'} text-emerald-600`} /> Pavilion Stalls
            </h4>
            <Button size={isInvestor ? 'md' : 'sm'} variant={isInvestor ? 'primary' : 'outline'} className={isInvestor ? '' : 'h-7 text-xs'} onClick={() => setIsRequestingPavilion(!isRequestingPavilion)}>
              {isRequestingPavilion ? 'Cancel' : <><PlusCircle className={`${isInvestor ? 'w-4 h-4' : 'w-3 h-3'} mr-1`} /> Request Stall</>}
            </Button>
          </div>

          {isRequestingPavilion && (
            <form onSubmit={handleSubmitPavilion} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Preferred Hall</label>
                <select 
                  value={pavilionForm.hall} 
                  onChange={e => setPavilionForm({...pavilionForm, hall: e.target.value})}
                  className="w-full text-xs p-2 rounded border mt-1"
                >
                  <option>Hall A (Manufacturing)</option>
                  <option>Hall B (IT & Innovation)</option>
                  <option>Hall C (Renewable Energy)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Power Req (KW)</label>
                <Input type="number" min="1" value={pavilionForm.kw} onChange={e => setPavilionForm({...pavilionForm, kw: Number(e.target.value)})} className="h-8 text-xs mt-1" />
              </div>
              <Button type="submit" size="sm" className="w-full text-xs h-8">Submit Request</Button>
            </form>
          )}

          {pavilionRequests.length === 0 && !isRequestingPavilion && (
            <div className="text-xs text-slate-400 italic">No stall requests submitted.</div>
          )}

          {pavilionRequests.map(req => (
            <div key={req.id} className={`bg-white dark:bg-slate-900 border rounded-lg flex items-center justify-between shadow-sm ${isInvestor ? 'p-5 border-emerald-200 dark:border-emerald-800' : 'p-3'}`}>
              <div>
                <div className={`${isInvestor ? 'text-lg text-emerald-900 dark:text-emerald-100' : 'text-xs'} font-bold`}>{req.requestedHall}</div>
                <div className={`${isInvestor ? 'text-xs mt-1' : 'text-[10px]'} text-slate-500`}>Requested: {new Date(req.requestDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className={isInvestor ? 'scale-110' : ''}><StatusPill status={req.status} /></div>
                {req.status !== 'Cancelled' && req.status !== 'Rejected' && (
                  <button onClick={() => handleCancelPavilion(req.id)} className={`${isInvestor ? 'text-sm' : 'text-[10px]'} text-red-500 hover:underline font-bold ml-1`}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* B2G Meetings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> B2G & Peer Meetings
            </h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => window.location.href = '/networking'}>
                Network Directory
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsRequestingMeeting(!isRequestingMeeting)}>
                {isRequestingMeeting ? 'Cancel' : <><PlusCircle className="w-3 h-3 mr-1" /> New B2G</>}
              </Button>
            </div>
          </div>

          {isRequestingMeeting && (
            <form onSubmit={handleSubmitMeeting} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Target Sector</label>
                  <Input 
                    value={meetingForm.sector} 
                    onChange={e => setMeetingForm({...meetingForm, sector: e.target.value})} 
                    className="h-8 text-xs mt-1" 
                    placeholder="e.g. IT, Automotive"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Duration</label>
                  <select 
                    value={meetingForm.durationMins} 
                    onChange={e => setMeetingForm({...meetingForm, durationMins: Number(e.target.value)})}
                    className="w-full h-8 text-xs p-1.5 rounded border mt-1 bg-background"
                  >
                    <option value="15">15 Mins</option>
                    <option value="30">30 Mins</option>
                    <option value="45">45 Mins</option>
                    <option value="60">60 Mins</option>
                  </select>
                </div>
              </div>
              <Button type="submit" size="sm" className="w-full text-xs h-8">Request Meeting</Button>
            </form>
          )}

          {meetingRequests.length === 0 && !isRequestingMeeting && (
            <div className="text-xs text-slate-400 italic">No B2G meetings requested.</div>
          )}

          {meetingRequests.map(req => (
            <div key={req.id} className="p-3 bg-white dark:bg-slate-900 border rounded-lg flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold">Meeting - {req.sector}</div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>Requested: {new Date(req.requestDate).toLocaleDateString()}</span>
                  {req.durationMins && (
                    <span className="font-semibold text-slate-600 dark:text-slate-400">({req.durationMins} mins)</span>
                  )}
                </div>
                {req.scheduledTime && (
                  <div className="text-[10px] font-bold text-blue-600 mt-1">{req.scheduledTime}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={req.status} />
                {req.status !== 'Cancelled' && req.status !== 'Declined' && (
                  <button onClick={() => handleCancelMeeting(req.id)} className="text-[10px] text-red-500 hover:underline font-bold ml-1">Cancel</button>
                )}
              </div>
            </div>
          ))}

          {incomingMeetings.length > 0 && (
            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Incoming Meeting Requests</h5>
              {incomingMeetings.map(req => (
                <div key={req.id} className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg flex items-center justify-between shadow-sm mb-2">
                  <div>
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-200">From: {req.investorName || req.applicantName}</div>
                    <div className="text-[10px] text-blue-700 dark:text-blue-300 mt-1">{req.companyName}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{req.requestedDate} • {req.timeSlot}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <StatusPill status={req.status} />
                    {req.status === 'Requested' && (
                      <div className="flex gap-1 mt-1">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handleRespondToMeeting(req.id, false)}>Decline</Button>
                        <Button size="sm" variant="primary" className="h-6 text-[10px] px-2 bg-blue-600 hover:bg-blue-700" onClick={() => handleRespondToMeeting(req.id, true)}>Accept</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MoU Management Section */}
      <div className={`mt-4 ${isInvestor ? 'pt-8 pb-4 bg-purple-50/40 dark:bg-purple-950/20 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-md' : 'pt-4 border-t border-border/60'}`}>
        <h4 className={`font-bold flex items-center gap-2 mb-6 ${isInvestor ? 'text-2xl text-purple-800 dark:text-purple-300' : 'text-sm text-foreground'}`}>
          <CheckCircle2 className={`${isInvestor ? 'w-8 h-8' : 'w-4 h-4'} text-purple-600`} /> Memorandums of Understanding (MoU)
        </h4>
        
        {mouRequests.length === 0 ? (
          <div className={`${isInvestor ? 'text-sm py-4' : 'text-xs'} text-slate-500 italic`}>No MoUs drafted for your account yet.</div>
        ) : (
          <div className={`grid grid-cols-1 ${isInvestor ? 'lg:grid-cols-2 gap-8' : 'md:grid-cols-2 gap-4'}`}>
            {mouRequests.map(mou => (
              <div key={mou.id} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm flex flex-col justify-between space-y-4 ${isInvestor ? 'p-6 border-2 border-purple-100 hover:border-purple-300 dark:border-purple-800/50 hover:shadow-lg transition-all' : 'p-4 border'}`}>
                <div>
                  <div className={`${isInvestor ? 'text-sm' : 'text-xs'} font-bold text-purple-600 uppercase tracking-wider`}>{mou.id}</div>
                  <div className={`${isInvestor ? 'text-xl' : 'text-sm'} font-bold text-foreground mt-2 leading-tight`}>{mou.mouTitle}</div>
                  <div className={`${isInvestor ? 'text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800' : 'text-[10px]'} text-slate-600 dark:text-slate-400 mt-4 flex gap-6`}>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Investment</div>
                      <div className={isInvestor ? 'font-bold text-emerald-700 dark:text-emerald-400' : ''}>₹{(mou.proposedInvestmentINR / 10000000).toFixed(2)} Cr</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Est. Jobs</div>
                      <div className={isInvestor ? 'font-bold text-blue-700 dark:text-blue-400' : ''}>{mou.estimatedJobs}</div>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center justify-between border-t ${isInvestor ? 'border-purple-100 dark:border-purple-900/30 pt-4 mt-2' : 'border-slate-100 dark:border-slate-800 pt-3'}`}>
                  <div className={isInvestor ? 'scale-110 origin-left' : ''}><StatusPill status={mou.status} /></div>
                  {(() => {
                    const isInitiator = record.id === mou.investorId;
                    const hasSigned = isInitiator ? mou.investorSigned : mou.targetSigned;
                    const partyType = isInitiator ? 'investor' : 'target';

                    if (!hasSigned) {
                      return (
                        <Button size={isInvestor ? 'md' : 'sm'} variant="primary" className={isInvestor ? 'bg-purple-600 hover:bg-purple-700 shadow-md font-bold' : 'h-7 text-[10px]'} onClick={() => handleSignMoU(mou.id, partyType)}>
                          {isInvestor ? 'Sign MoU Document' : 'Sign MoU'}
                        </Button>
                      );
                    }

                    return (
                      <span className={`${isInvestor ? 'text-sm' : 'text-[10px]'} text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full`}>
                        <CheckCircle2 className={isInvestor ? 'w-4 h-4' : 'w-3 h-3'} /> Signed
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
