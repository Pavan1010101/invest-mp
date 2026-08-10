/**
 * SISMP — B2G & B2B Meeting Scheduler Screen
 * Key interaction pattern per prompt Section 5:
 * - Calendar & room slot grid visually blocking double-booked rooms/slots
 * - Live countdown & auto-expiry indicator on pending requests (24h timer)
 * - Confirmation & room allocation workflow
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { MOCK_MEETING_REQUESTS, type MeetingRequest } from '@/lib/api/mocks/staffMockData';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  User,
  Plus,
  MapPin,
  Flame,
  FileSignature,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROOMS = [
  { id: 'RM-A01', name: 'VVIP Pavilion Conference Room A-01', capacity: 12 },
  { id: 'RM-A02', name: 'VVIP Pavilion Conference Room A-02', capacity: 12 },
  { id: 'RM-B01', name: 'Green Energy Lounge B-01', capacity: 8 },
  { id: 'RM-B02', name: 'Green Energy Lounge B-02', capacity: 8 },
  { id: 'RM-C01', name: 'MSME Incubator Hub C-01', capacity: 6 },
];

const TIME_SLOTS = [
  '09:30 AM - 10:15 AM',
  '10:30 AM - 11:15 AM',
  '11:30 AM - 12:15 PM',
  '02:00 PM - 02:45 PM',
  '03:00 PM - 03:45 PM',
  '04:00 PM - 04:45 PM',
];

/** Live Countdown Hook for 24h Expiration Timer */
function useCountdown(targetIsoDate: string) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const updateTimer = () => {
      const target = new Date(targetIsoDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetIsoDate]);

  return timeLeft;
}

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

function CountdownBadge({ expiresAt }: { expiresAt: string }) {
  const { hours, minutes, seconds, isExpired } = useCountdown(expiresAt);

  if (isExpired) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
        Expired (24h auto-expire)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-sm animate-pulse">
      <Flame className="w-3.5 h-3.5 text-amber-600" />
      Expires in: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('2026-02-24');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPendingMeeting, setSelectedPendingMeeting] = useState<any | null>(null);

  // Drag-to-scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    fetch('/api/v1/requests/meetings')
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP error ${r.status}`);
        const text = await r.text();
        return text ? JSON.parse(text) : {};
      })
      .then(d => {
        if (d.success && d.data) {
          // Normalize DB data format with some UI fields
          const mapped = d.data.map((m: any) => {
            let status = m.status === 'Pending' ? 'Requested' : m.status;
            if ((status === 'Confirmed' || status === 'Scheduled') && isTimeSlotPassed(m.requestedDate || '2026-02-24', m.scheduledTime || m.timeSlot)) {
              status = 'Completed';
            }
            return {
              id: m.id,
              applicantId: m.applicantId,
              officerId: m.officerId,
              investorName: m.applicantName || m.investorName,
              companyName: m.companyName,
              departmentName: m.sector || m.departmentName,
              officerName: m.officerName || 'Pending Assignment',
              requestedDate: m.requestedDate || '2026-02-24',
              timeSlot: m.scheduledTime || m.timeSlot || 'Pending',
              roomId: m.roomId || 'TBD',
              roomName: m.roomName || 'TBD',
              status: status,
              durationMins: m.durationMins || 30,
              expiresAt: m.expiresAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              createdAt: m.createdAt || new Date().toISOString(),
              notes: m.notes
            };
          })
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setMeetings(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const AVAILABLE_TARGETS = [
    { name: 'Shri R. K. Vardhan (IAS)', company: 'Department of Industrial Policy' },
    { name: 'Smt. Ananya Verma (IAS)', company: 'Department of New & Renewable Energy' },
    { name: 'Vikramaditya Birla', company: 'Grasim Industries Ltd.' },
    { name: 'Sarah Jenkins', company: 'Vestas Wind Systems A/S' },
  ];

  // New Request Form State
  const [newMeeting, setNewMeeting] = useState({
    targetUser: AVAILABLE_TARGETS[0].name,
    requestedDate: '2026-02-24',
    timeSlot: TIME_SLOTS[0],
  });

  // Check if a slot + room combination is already booked
  const isSlotBooked = (roomId: string, timeSlot: string, date: string) => {
    return meetings.some(
      (m) =>
        m.roomId === roomId &&
        m.timeSlot === timeSlot &&
        m.requestedDate === date &&
        (m.status === 'Confirmed' || m.status === 'Requested' || m.status === 'Scheduled')
    );
  };

  const handleConfirmMeeting = async (id: string, roomId: string, roomName: string, timeSlot: string) => {
    try {
      await fetch('/api/v1/requests/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Scheduled', scheduledTime: timeSlot, roomId, roomName })
      });
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'Scheduled', timeSlot, roomId, roomName } : m))
      );
      setSelectedPendingMeeting(null);
    } catch(err) { console.error(err); }
  };

  const handleAcceptMeeting = async (id: string) => {
    try {
      await fetch('/api/v1/requests/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Accepted' })
      });
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'Accepted' } : m))
      );
    } catch(err) { console.error(err); }
  };

  const handleCancelMeeting = async (id: string) => {
    try {
      await fetch('/api/v1/requests/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Cancelled' })
      });
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'Cancelled' } : m))
      );
    } catch(err) { console.error(err); }
  };

  const handleCompleteMeeting = async (id: string) => {
    try {
      await fetch('/api/v1/requests/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Completed' })
      });
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'Completed' } : m))
      );
    } catch(err) { console.error(err); }
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();

    const target = AVAILABLE_TARGETS.find(t => t.name === newMeeting.targetUser);
    
    const created: MeetingRequest = {
      id: `MTG-${Math.floor(800 + Math.random() * 200)}`,
      investorName: user?.name || 'Current User',
      companyName: user?.department || (user as any)?.organization || 'Independent',
      departmentName: target?.company || 'Unknown',
      officerName: newMeeting.targetUser,
      requestedDate: newMeeting.requestedDate,
      timeSlot: newMeeting.timeSlot,
      roomId: 'TBD',
      roomName: 'TBD',
      status: 'Requested',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setMeetings((prev) => [created, ...prev]);
    setShowScheduleModal(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex flex-col lg:overflow-hidden bg-background">
      {/* Top Header Toolbar */}
      <div className="p-4 lg:px-6 lg:h-16 bg-surface border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">B2G & B2B Meeting Scheduler</h1>
          <p className="text-xs text-foreground-muted">
            Manage high-stakes officer & investor meeting slots with conflict prevention & 24h auto-expiry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="accent" size="sm" onClick={() => setShowScheduleModal(true)}>
            <Plus className="w-4 h-4" /> Request B2G Meeting
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:overflow-hidden">
        {/* Left Side: Pending Meeting Requests Inbox */}
        <div className="lg:col-span-6 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-border lg:overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider">
              Pending & Scheduled Requests ({meetings.length})
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setSelectedDate('2026-02-24')}
                className={cn('px-2.5 py-1 rounded font-medium', selectedDate === '2026-02-24' ? 'bg-primary text-white' : 'bg-surface border text-foreground')}
              >
                Day 1 (Feb 24)
              </button>
              <button
                onClick={() => setSelectedDate('2026-02-25')}
                className={cn('px-2.5 py-1 rounded font-medium', selectedDate === '2026-02-25' ? 'bg-primary text-white' : 'bg-surface border text-foreground')}
              >
                Day 2 (Feb 25)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {meetings.map((mtg) => (
              <Card key={mtg.id} padding="md" variant="default" className="space-y-3 relative overflow-hidden">
                {/* Status Indicator Bar */}
                <div
                  className={cn(
                    'absolute top-0 left-0 bottom-0 w-1.5',
                    (mtg.status === 'Confirmed' || mtg.status === 'Scheduled') && 'bg-emerald-600',
                    mtg.status === 'Requested' && 'bg-blue-600',
                    mtg.status === 'Accepted' && 'bg-amber-500',
                    mtg.status === 'Cancelled' && 'bg-red-500',
                    mtg.status === 'Completed' && 'bg-purple-600',
                    mtg.status === 'Expired' && 'bg-slate-400'
                  )}
                />

                <div className="pl-2 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <span className="font-data text-xs font-bold text-primary">{mtg.id}</span>
                      <h3 className="text-base font-bold text-foreground">
                        {mtg.investorName} <span className="text-xs font-normal text-foreground-muted ml-1">({mtg.applicantId})</span>
                      </h3>
                      <p className="text-xs text-foreground-muted">{mtg.companyName}</p>
                    </div>

                    {mtg.status === 'Requested' ? (
                      <CountdownBadge expiresAt={mtg.expiresAt} />
                    ) : (
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-bold',
                          (mtg.status === 'Confirmed' || mtg.status === 'Scheduled') && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                          mtg.status === 'Accepted' && 'bg-amber-50 text-amber-700 border border-amber-200',
                          mtg.status === 'Cancelled' && 'bg-red-50 text-red-700 border border-red-200',
                          mtg.status === 'Completed' && 'bg-purple-50 text-purple-700 border border-purple-200',
                          mtg.status === 'Expired' && 'bg-slate-100 text-slate-600 border border-slate-200'
                        )}
                      >
                        {mtg.status}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-background p-2.5 rounded-lg border border-border">
                    <div>
                      <span className="text-foreground-subtle block text-[10px]">Target Attendee/Officer:</span>
                      <span className="font-medium text-foreground">
                        {mtg.officerName} 
                        {mtg.officerId && <span className="text-[10px] text-foreground-muted ml-1">({mtg.officerId})</span>}
                        <span className="ml-1">({mtg.durationMins}m)</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground-subtle block text-[10px]">Time Slot:</span>
                      <span className="font-data font-semibold text-primary">{mtg.timeSlot}</span>
                    </div>
                    <div className="col-span-2 border-t border-border/40 pt-1.5 mt-0.5">
                      <span className="text-foreground-subtle block text-[10px]">Room / Venue:</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-accent" /> {mtg.roomName}
                      </span>
                    </div>
                  </div>

                  {mtg.notes && (
                    <p className="text-xs text-foreground-muted italic">
                      &ldquo;{mtg.notes}&rdquo;
                    </p>
                  )}

                  {/* Actions */}
                  {mtg.status === 'Requested' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelMeeting(mtg.id)}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleAcceptMeeting(mtg.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept Meeting
                      </Button>
                    </div>
                  )}
                  {mtg.status === 'Accepted' && user?.role === 'relationship_manager' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant={selectedPendingMeeting?.id === mtg.id ? "primary" : "accent"}
                        size="sm"
                        onClick={() => setSelectedPendingMeeting(selectedPendingMeeting?.id === mtg.id ? null : mtg)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {selectedPendingMeeting?.id === mtg.id ? "Cancel Allocation" : "Allocate Slot"}
                      </Button>
                    </div>
                  )}
                  {mtg.status === 'Scheduled' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteMeeting(mtg.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                      </Button>
                    </div>
                  )}
                  {mtg.status === 'Completed' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => window.location.href = `/staff/mou?meetingId=${mtg.id}`}
                      >
                        <FileSignature className="w-3.5 h-3.5" /> Draft MoU
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Room & Time Slot Conflict Grid */}
        <div className="lg:col-span-6 p-4 lg:p-6 bg-surface lg:overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Room Availability Grid ({selectedDate})
              </h2>
              <p className="text-xs text-foreground-muted">
                Visual conflict prevention — disabled slots are already booked
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1 text-slate-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Booked / Disabled
              </span>
            </div>
          </div>
          
          {selectedPendingMeeting && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold animate-pulse">
              Select an available slot below to schedule {selectedPendingMeeting.companyName}'s meeting.
            </div>
          )}

          {/* Grid Table */}
          <div 
            className="border border-border rounded-xl overflow-x-auto bg-background cursor-grab active:cursor-grabbing select-none"
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <table className="w-full text-xs text-left min-w-[800px]">
              <thead className="bg-surface border-b border-border font-bold text-foreground-muted">
                <tr>
                  <th className="p-3">Time Slot</th>
                  {ROOMS.map((r) => (
                    <th key={r.id} className="p-3 text-center border-l border-border min-w-[100px]">
                      <span className="block font-data text-primary">{r.id}</span>
                      <span className="text-[10px] text-foreground-subtle font-normal block truncate">{r.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot}>
                    <td className="p-3 font-data font-semibold text-foreground whitespace-nowrap bg-surface">
                      {slot}
                    </td>
                    {ROOMS.map((room) => {
                      const booked = isSlotBooked(room.id, slot, selectedDate);
                      return (
                        <td
                          key={room.id}
                          className={cn(
                            'p-3 text-center border-l border-border transition-colors',
                            booked
                              ? 'bg-slate-100/90 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-50/40 text-emerald-800 hover:bg-emerald-100/60 cursor-pointer'
                          )}
                          onClick={() => {
                            if (!booked) {
                              if (selectedPendingMeeting) {
                                handleConfirmMeeting(selectedPendingMeeting.id, room.id, room.name, slot);
                              } else {
                                setNewMeeting((prev) => ({
                                  ...prev,
                                  roomId: room.id,
                                  timeSlot: slot,
                                  requestedDate: selectedDate,
                                }));
                                setShowScheduleModal(true);
                              }
                            }
                          }}
                        >
                          {booked ? (
                            <span className="font-bold text-[10px] uppercase text-slate-500">BOOKED</span>
                          ) : (
                            <span className="font-semibold text-[10px] text-emerald-700">+ RESERVE</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateMeeting}
            className="bg-surface rounded-xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in"
          >
            <h3 className="text-lg font-bold text-foreground">Schedule B2G Meeting Request</h3>

            <div className="space-y-3">
              <Select
                label="Target User"
                options={AVAILABLE_TARGETS.map(t => ({ value: t.name, label: `${t.name} (${t.company})` }))}
                value={newMeeting.targetUser}
                onChange={(e) => setNewMeeting({ ...newMeeting, targetUser: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Preferred Time Slot"
                  options={TIME_SLOTS.map((s) => ({ value: s, label: s }))}
                  value={newMeeting.timeSlot}
                  onChange={(e) => setNewMeeting({ ...newMeeting, timeSlot: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="sm"
              >
                Submit Meeting Request
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
