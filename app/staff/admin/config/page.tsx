/**
 * SISMP — Master System Configuration Screen
 * Admin configuration for master data, auto-escalation rules, and API integration settings.
 */
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import {
  Settings,
  Database,
  Sliders,
  Key,
  Save,
  Check,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<'master' | 'workflow' | 'integrations'>('workflow');

  // Workflow Rules State
  const [slaHours, setSlaHours] = useState('24');
  const [escalateHours, setEscalateHours] = useState('48');
  const [autoExpireMeetingsHours, setAutoExpireMeetingsHours] = useState('24');

  // Integration Settings State
  const [smsEndpoint, setSmsEndpoint] = useState('https://api.gov.in/sms/v2/send');
  const [apiKey, setApiKey] = useState('mpidc_live_sk_9938128391238912');
  const [webhookUrl, setWebhookUrl] = useState('https://summit.mp.gov.in/webhooks/crm');

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Header Toolbar */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">Master System Configuration</h1>
          <p className="text-xs text-foreground-muted">
            Configure platform master data, workflow SLA escalation parameters, and integration stubs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="accent" size="sm" isLoading={isSaving} onClick={handleSave}>
            <Save className="w-4 h-4" /> Save System Settings
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" /> Master system configuration saved successfully!
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border text-sm font-medium">
          {[
            { id: 'workflow', label: 'Workflow & SLA Escalation Rules', icon: Sliders },
            { id: 'master', label: 'Master Data (Sectors & Docs)', icon: Database },
            { id: 'integrations', label: 'API Keys & Gateway Integration', icon: Key },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2.5 border-b-2 font-semibold text-xs transition-colors flex items-center gap-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-muted hover:text-foreground'
              )}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Workflow & SLA Rules */}
        {activeTab === 'workflow' && (
          <form onSubmit={handleSave} className="space-y-6">
            <Card padding="lg" variant="default" className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                Registration Approval SLA Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <Input
                  label="Target Approval SLA Window (Hours)"
                  type="number"
                  value={slaHours}
                  onChange={(e) => setSlaHours(e.target.value)}
                  helperText="Applications pending longer than this generate amber warnings"
                />
                <Input
                  label="Auto-Escalation Threshold (Hours)"
                  type="number"
                  value={escalateHours}
                  onChange={(e) => setEscalateHours(e.target.value)}
                  helperText="Applications pending longer than this escalate to Department Secretary"
                />
              </div>
            </Card>

            <Card padding="lg" variant="default" className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                B2G Meeting Request Rules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <Input
                  label="Unconfirmed Meeting Auto-Expiry Window (Hours)"
                  type="number"
                  value={autoExpireMeetingsHours}
                  onChange={(e) => setAutoExpireMeetingsHours(e.target.value)}
                  helperText="Unconfirmed meeting requests auto-expire after this duration (Prompt Section 5)"
                />
              </div>
            </Card>
          </form>
        )}

        {/* Tab 2: Master Data */}
        {activeTab === 'master' && (
          <div className="space-y-6">
            <Card padding="lg" variant="default" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                  Managed Investment Sectors (12 Active)
                </h3>
                <Button variant="outline" size="sm">
                  <Plus className="w-3.5 h-3.5" /> Add Sector
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  'Manufacturing',
                  'Renewable Energy',
                  'IT & Electronics',
                  'Pharma & Biotech',
                  'Agro Processing',
                  'Automobile',
                  'Tourism',
                  'Education & Skills',
                  'Infrastructure',
                  'Textiles & Garments',
                ].map((sec) => (
                  <div key={sec} className="p-3 rounded-lg border border-border bg-background flex items-center justify-between">
                    <span className="font-semibold text-foreground">{sec}</span>
                    <button className="text-foreground-subtle hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: API Integration Credentials */}
        {activeTab === 'integrations' && (
          <form onSubmit={handleSave} className="space-y-6">
            <Card padding="lg" variant="default" className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> API Integration & Gateway Credentials
              </h3>

              <div className="space-y-4 text-xs">
                <Input
                  label="Government SMS Gateway Dispatch API Endpoint"
                  value={smsEndpoint}
                  onChange={(e) => setSmsEndpoint(e.target.value)}
                />
                <Input
                  label="MPIDC API Secret Key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Input
                  label="CRM Sync Webhook Callback URL"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
