/**
 * SISMP — Notification Template Manager
 * Manage Email, SMS, and Push notification templates.
 * Features:
 * - Variable tag insertion ({{investor_name}}, {{registration_id}}, {{status}}, {{venue}})
 * - Side-by-side bilingual preview (English + Devanagari Hindi)
 * - Test notification dispatch simulator
 */
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import {
  Bell,
  Mail,
  MessageSquare,
  Globe,
  Save,
  Send,
  Sparkles,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  channel: 'Email' | 'SMS' | 'Push';
  subjectEn: string;
  subjectHi: string;
  bodyEn: string;
  bodyHi: string;
}

const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tmpl-1',
    key: 'registration_approved',
    name: 'Registration Approved Notification',
    channel: 'Email',
    subjectEn: 'Approved: Invest Madhya Pradesh GIS-2026 Participation',
    subjectHi: 'स्वीकृत: इन्वेस्ट मध्य प्रदेश जीआईएस-2026 सहभागिता',
    bodyEn: 'Dear {{investor_name}},\n\nWe are pleased to inform you that your registration (#{{registration_id}}) for the Invest Madhya Pradesh Global Investors Summit 2026 has been APPROVED by the Department of Industrial Policy.\n\nYour physical badge pass can be collected at the venue entrance using QR code or Registration ID.\n\nVenue: {{venue}}\nDate: February 24-25, 2026',
    bodyHi: 'प्रिय {{investor_name}},\n\nहमें आपको यह सूचित करते हुए खुशी हो रही है कि इन्वेस्ट मध्य प्रदेश वैश्विक निवेशक शिखर सम्मेलन 2026 के लिए आपका पंजीकरण (#{{registration_id}}) स्वीकृत हो गया है।\n\nस्थान: {{venue}}\nदिनांक: 24-25 फरवरी 2026',
  },
  {
    id: 'tmpl-2',
    key: 'b2g_meeting_confirmed',
    name: 'B2G Meeting Confirmation Notice',
    channel: 'SMS',
    subjectEn: 'B2G Meeting Confirmed - GIS 2026',
    subjectHi: 'बी2जी बैठक की पुष्टि - जीआईएस 2026',
    bodyEn: 'GIS-2026 Alert: Your B2G meeting with {{officer_name}} is CONFIRMED for {{meeting_time}} at {{room_name}}. Reg ID: {{registration_id}}.',
    bodyHi: 'जीआईएस-2026 अलर्ट: {{officer_name}} के साथ आपकी बी2जी बैठक की पुष्टि हो गई है। समय: {{meeting_time}}, स्थान: {{room_name}}।',
  },
  {
    id: 'tmpl-3',
    key: 'mou_ready_for_signature',
    name: 'MoU Ready for Digital Signature',
    channel: 'Email',
    subjectEn: 'Action Required: Digital Signature Pending for MoU {{mou_id}}',
    subjectHi: 'कार्रवाई आवश्यक: एमओयू {{mou_id}} के लिए डिजिटल हस्ताक्षर लंबित',
    bodyEn: 'Dear {{investor_name}},\n\nThe draft MoU agreement (#{{mou_id}}) for {{company_name}} has been cleared by the Department Officer and is now ready for your digital signature.',
    bodyHi: 'प्रिय {{investor_name}},\n\n{{company_name}} के लिए ड्राफ्ट एमओयू समझौता (#{{mou_id}}) डिजिटल हस्ताक्षर के लिए तैयार है।',
  },
];

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate>(templates[0]);

  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('officer@mp.gov.in');
  const [testSent, setTestSent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const VARIABLE_TAGS = [
    '{{investor_name}}',
    '{{registration_id}}',
    '{{company_name}}',
    '{{status}}',
    '{{meeting_time}}',
    '{{room_name}}',
    '{{venue}}',
    '{{officer_name}}',
  ];

  const handleUpdate = (field: keyof NotificationTemplate, value: string) => {
    const updated = { ...selectedTemplate, [field]: value };
    setSelectedTemplate(updated);
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const insertVariable = (tag: string) => {
    handleUpdate('bodyEn', selectedTemplate.bodyEn + ' ' + tag);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsSaving(false);
  };

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    setTestSent(true);
    setTimeout(() => {
      setTestSent(false);
      setShowTestModal(false);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Header Toolbar */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notification Template Manager</h1>
          <p className="text-xs text-foreground-muted">
            Configure bilingual Email, SMS, and Push notification templates with variable tags
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowTestModal(true)}>
            <Send className="w-4 h-4" /> Send Test Dispatch
          </Button>
          <Button variant="accent" size="sm" isLoading={isSaving} onClick={handleSave}>
            <Save className="w-4 h-4" /> Save Templates
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Template Selector List */}
        <div className="lg:col-span-4 p-6 border-r border-border overflow-y-auto space-y-3">
          <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider">
            System Notification Templates ({templates.length})
          </h2>

          {templates.map((t) => {
            const isSelected = selectedTemplate.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all duration-150 space-y-2',
                  isSelected ? 'bg-primary-50/70 border-primary shadow-sm' : 'bg-surface border-border hover:bg-background'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{t.key}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary">
                    {t.channel}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{t.name}</h3>
              </div>
            );
          })}
        </div>

        {/* Right Side: Bilingual Rich Editor */}
        <div className="lg:col-span-8 p-6 bg-background overflow-y-auto space-y-6">
          <Card padding="lg" variant="default" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{selectedTemplate.key}</span>
                <h3 className="text-xl font-bold text-foreground">{selectedTemplate.name}</h3>
              </div>
              <Select
                options={[
                  { value: 'Email', label: 'Email Channel' },
                  { value: 'SMS', label: 'SMS Gateway' },
                  { value: 'Push', label: 'Mobile Push' },
                ]}
                value={selectedTemplate.channel}
                onChange={(e) => handleUpdate('channel', e.target.value as any)}
              />
            </div>

            {/* Insert Variable Tags Toolbar */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle block">
                Available Dynamic Variables (Click to Insert):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertVariable(tag)}
                    className="px-2 py-1 rounded bg-background border border-border text-[11px] font-mono font-semibold text-primary hover:bg-primary-50 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Bilingual Side-by-Side Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* English Version */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> English Template
                  </span>
                </div>
                <Input
                  label="Subject Line (English)"
                  value={selectedTemplate.subjectEn}
                  onChange={(e) => handleUpdate('subjectEn', e.target.value)}
                />
                <Textarea
                  label="Message Body (English)"
                  rows={8}
                  value={selectedTemplate.bodyEn}
                  onChange={(e) => handleUpdate('bodyEn', e.target.value)}
                />
              </div>

              {/* Hindi Version (Devanagari) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> हिन्दी (Devanagari) Template
                  </span>
                </div>
                <Input
                  label="विषय (Subject in Hindi)"
                  value={selectedTemplate.subjectHi}
                  onChange={(e) => handleUpdate('subjectHi', e.target.value)}
                />
                <Textarea
                  label="संदेश विवरण (Body in Devanagari)"
                  rows={8}
                  value={selectedTemplate.bodyHi}
                  onChange={(e) => handleUpdate('bodyHi', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Test Dispatch Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSendTest} className="bg-surface rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Send Test Notification Dispatch
            </h3>

            {testSent ? (
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> Test dispatch sent to {testRecipient}!
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  label="Recipient Email / Phone Number"
                  isRequired
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                />
                <p className="text-xs text-foreground-muted">
                  Will render dynamic tags with sample mock investor data and dispatch via {selectedTemplate.channel}.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowTestModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm" disabled={testSent}>
                Dispatch Test Message
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
