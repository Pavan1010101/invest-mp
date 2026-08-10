'use client';

import React, { useState, useEffect } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Users, Briefcase, Building2, Search, CalendarPlus, XCircle } from 'lucide-react';

export default function NetworkingPage() {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [targetAttendee, setTargetAttendee] = useState<any>(null);
  const [meetingForm, setMeetingForm] = useState({
    requestedDate: '2026-02-24',
    timeSlot: '10:00 AM - 10:45 AM',
    durationMins: 45
  });

  const TIME_SLOTS = [
    '10:00 AM - 10:45 AM',
    '11:00 AM - 11:45 AM',
    '12:00 PM - 12:45 PM',
    '02:00 PM - 02:45 PM',
    '03:00 PM - 03:45 PM',
    '04:00 PM - 04:45 PM'
  ];

  useEffect(() => {
    // Fetch all approved attendees to display in networking directory
    fetch('/api/v1/registrations?status=Approved')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then(data => {
        if (data.success && data.data) {
          // Filter out the current user if logged in
          const filtered = data.data.filter((a: any) => a.email !== user?.email && a.id !== (user as any)?.registrationId);
          setAttendees(filtered);
        }
      })
      .catch(console.error);
  }, [user]);

  const filteredAttendees = attendees.filter(a => 
    a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openMeetingModal = (attendee: any) => {
    if (!user) {
      alert("Please log in to request a meeting.");
      return;
    }
    setTargetAttendee(attendee);
    setShowModal(true);
  };

  const submitMeetingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetAttendee) return;

    try {
      const res = await fetch('/api/v1/requests/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The sender (you)
          applicantId: (user as any).registrationId || user.email || user.id || 'Unknown',
          applicantName: user.name || 'Current User',
          companyName: user.department || (user as any).organization || 'Independent',
          sector: 'General',
          
          // The target (them)
          officerId: targetAttendee.id, // target ID
          officerName: targetAttendee.applicantName, // using officerName field to store target name for P2P
          departmentName: targetAttendee.organization, // using departmentName field for target company

          requestedDate: meetingForm.requestedDate,
          timeSlot: meetingForm.timeSlot,
          durationMins: meetingForm.durationMins,
        })
      });
      
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.success) {
        alert("Meeting request sent successfully!");
        setShowModal(false);
      } else {
        alert("Error sending request: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send meeting request.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <PublicHeader />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" /> Peer-to-Peer Networking
            </h1>
            <p className="text-foreground-muted mt-2">
              Browse verified delegates, investors, and startups. Connect and request bilateral meetings during the summit.
            </p>
          </div>
          
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, company, or sector..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {attendees.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-medium">Loading networking directory...</div>
        ) : filteredAttendees.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-medium">No attendees match your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttendees.map(a => (
              <Card key={a.id} padding="lg" variant="default" className="flex flex-col justify-between hover:shadow-lg transition-shadow border-slate-800 dark:border-slate-800 bg-slate-950 dark:bg-slate-950">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{a.applicantName}</h3>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">{a.designation}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 dark:bg-slate-800 text-[10px] font-bold text-slate-300 dark:text-slate-300 uppercase tracking-wider">
                      {a.badgeRole || a.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-300 dark:text-slate-300 pt-2 border-t border-slate-800 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-200">{a.organization}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-500" />
                      <span>{a.sector}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 mt-auto">
                  <Button variant="accent" className="w-full shadow-md" onClick={() => openMeetingModal(a)}>
                    <CalendarPlus className="w-4 h-4 mr-2" /> Request Meeting
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showModal && targetAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request Bilateral Meeting</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitMeetingRequest} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 mb-4">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Target Attendee</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{targetAttendee.applicantName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{targetAttendee.designation}, {targetAttendee.organization}</p>
              </div>

              <Select
                label="Preferred Date"
                options={[{value: '2026-02-24', label: 'Day 1 - 24 Feb 2026'}, {value: '2026-02-25', label: 'Day 2 - 25 Feb 2026'}]}
                value={meetingForm.requestedDate}
                onChange={e => setMeetingForm({...meetingForm, requestedDate: e.target.value})}
              />

              <Select
                label="Preferred Time Slot"
                options={TIME_SLOTS.map(t => ({value: t, label: t}))}
                value={meetingForm.timeSlot}
                onChange={e => setMeetingForm({...meetingForm, timeSlot: e.target.value})}
              />
              
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Send Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PublicFooter />
    </div>
  );
}
