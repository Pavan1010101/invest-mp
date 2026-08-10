/**
 * SISMP — Event Organizer Agenda & Speaker Management
 * Used by Event Organizers to build summit tracks, manage speaker profiles, and track resource fulfillment.
 */
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { MOCK_AGENDA_SESSIONS, type AgendaSession } from '@/lib/api/mocks/crmMockData';
import {
  Calendar,
  Clock,
  Mic,
  Plus,
  CheckCircle2,
  Globe,
  Sparkles,
  Users,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EventsPage() {
  const [sessions, setSessions] = useState<AgendaSession[]>(MOCK_AGENDA_SESSIONS);
  const [activeDay, setActiveDay] = useState('Day 1 (Feb 24)');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newSession, setNewSession] = useState({
    title: '',
    track: 'Plenary',
    day: 'Day 1 (Feb 24)',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    hallName: 'Grand Plenary Auditorium A',
    speakerName: '',
    speakerTitle: '',
    speakerCompany: '',
  });

  const filteredSessions = sessions.filter((s) => s.day === activeDay);

  const handleTogglePublish = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPublished: !s.isPublished } : s))
    );
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AgendaSession = {
      id: `SESS-0${sessions.length + 1}`,
      title: newSession.title,
      track: newSession.track,
      day: newSession.day,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      hallName: newSession.hallName,
      speakers: newSession.speakerName
        ? [{ name: newSession.speakerName, title: newSession.speakerTitle, company: newSession.speakerCompany }]
        : [],
      isPublished: true,
    };

    setSessions((prev) => [...prev, created]);
    setShowAddModal(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Header Toolbar */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">Summit Agenda & Speaker Content Editor</h1>
          <p className="text-xs text-foreground-muted">
            Organize session tracks, manage speaker profiles, and publish live event agenda
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {['Day 1 (Feb 24)', 'Day 2 (Feb 25)'].map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  activeDay === day ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-foreground border-border hover:bg-background'
                )}
              >
                {day}
              </button>
            ))}
          </div>

          <Button variant="accent" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Add Agenda Session
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Agenda Sessions Timeline */}
        <div className="lg:col-span-8 p-6 border-r border-border overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Session Timeline — {activeDay} ({filteredSessions.length} sessions)
            </h2>
          </div>

          <div className="space-y-4">
            {filteredSessions.map((sess) => (
              <Card key={sess.id} padding="lg" variant="default" className="space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-data text-xs font-bold text-primary">{sess.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary border border-primary-200">
                      {sess.track}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                        sess.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {sess.isPublished ? 'Live Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-data font-semibold text-foreground-muted">
                    <Clock className="w-3.5 h-3.5 text-accent" /> {sess.startTime} - {sess.endTime}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground">{sess.title}</h3>
                  <p className="text-xs text-foreground-muted flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {sess.hallName}
                  </p>
                </div>

                {/* Speakers Grid */}
                {sess.speakers.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-primary" /> Featured Speakers
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sess.speakers.map((spk, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-background border border-border flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {spk.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{spk.name}</p>
                            <p className="text-[10px] text-foreground-muted truncate">{spk.title}</p>
                            <p className="text-[10px] text-primary font-semibold truncate">{spk.company}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant={sess.isPublished ? 'outline' : 'accent'}
                    size="sm"
                    onClick={() => handleTogglePublish(sess.id)}
                  >
                    {sess.isPublished ? 'Unpublish to Draft' : 'Publish Session Live'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Event Organizer Resource Fulfilment Checklist */}
        <div className="lg:col-span-4 p-6 bg-surface overflow-y-auto space-y-6">
          <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" /> Event Resource Fulfilment Board
          </h2>

          <div className="space-y-3">
            {[
              { label: 'Audio/Visual Mics & Projection Setup', hall: 'Grand Plenary Hall A', status: 'Completed' },
              { label: 'High-Speed Wi-Fi Dedicated Access Points', hall: 'Tech Innovation Hall C', status: 'Completed' },
              { label: 'Simultaneous Translation Equipment (Hindi/English)', hall: 'Renewable Hall B', status: 'In Progress' },
              { label: 'VVIP Security & Escort Protocol Verification', hall: 'VIP Lounge', status: 'In Progress' },
            ].map((item, idx) => (
              <Card key={idx} padding="md" variant="default" className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{item.label}</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-foreground-muted">{item.hall}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSession} className="bg-surface rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground">Add Agenda Session</h3>

            <div className="space-y-3">
              <Input
                label="Session Title"
                isRequired
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                placeholder="e.g. Panel Discussion on EV Ecosystem"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Track"
                  options={[
                    { value: 'Plenary', label: 'Plenary' },
                    { value: 'Sector Roundtable', label: 'Sector Roundtable' },
                    { value: 'Tech & Electronics', label: 'Tech & Electronics' },
                  ]}
                  value={newSession.track}
                  onChange={(e) => setNewSession({ ...newSession, track: e.target.value })}
                />
                <Select
                  label="Summit Day"
                  options={[
                    { value: 'Day 1 (Feb 24)', label: 'Day 1 (Feb 24)' },
                    { value: 'Day 2 (Feb 25)', label: 'Day 2 (Feb 25)' },
                  ]}
                  value={newSession.day}
                  onChange={(e) => setNewSession({ ...newSession, day: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Time"
                  value={newSession.startTime}
                  onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                />
                <Input
                  label="End Time"
                  value={newSession.endTime}
                  onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                />
              </div>

              <Input
                label="Speaker Name"
                value={newSession.speakerName}
                onChange={(e) => setNewSession({ ...newSession, speakerName: e.target.value })}
                placeholder="Speaker full name"
              />
              <Input
                label="Speaker Organization"
                value={newSession.speakerCompany}
                onChange={(e) => setNewSession({ ...newSession, speakerCompany: e.target.value })}
                placeholder="Company / Department"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm">
                Save & Publish Session
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
