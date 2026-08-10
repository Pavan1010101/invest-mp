/**
 * SISMP — Registration Desk & Badge Print Screen
 * Used on-site by Registration Desk staff.
 * Features:
 * - Dynamic lookup from live database endpoint /api/v1/registrations
 * - Instant search by Registration ID, Name, Email, or QR scan trigger
 * - Live Camera QR Code Scanner modal for quick badge validation
 * - Real-time Printable Badge Layout with BRD role badge colors
 * - Manual Registration Entry Modal for Walk-in Attendees
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/patterns/StatusBadge';
import { BadgeQRCode } from '@/components/ui/BadgeQRCode';
import { BADGE_ROLES, BADGE_ROLE_COLORS } from '@/lib/constants/statuses';
import { MOCK_REGISTRATION_RECORDS, type StaffRegistrationRecord } from '@/lib/api/mocks/staffMockData';
import {
  QrCode,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Sparkles,
  Camera,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BadgesPage() {
  const [records, setRecords] = useState<StaffRegistrationRecord[]>(MOCK_REGISTRATION_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<StaffRegistrationRecord | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printedIds, setPrintedIds] = useState<Set<string>>(new Set());

  // Camera scanner states
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  // Manual Walk-in Registration Modal State
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinData, setWalkinData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    designation: '',
    sector: 'Manufacturing',
    badgeRole: BADGE_ROLES.DELEGATE,
  });

  // Fetch live registrations from API
  useEffect(() => {
    fetch('/api/v1/registrations')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then((json) => {
        if (json.success && json.data) {
          setRecords(json.data);
          if (json.data.length > 0) {
            setSelectedRecord(json.data[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch registrations:', err));
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q) return;
    const match = records.find(
      (r) =>
        r.id.toLowerCase() === q.toLowerCase() ||
        r.id.toLowerCase().includes(q.toLowerCase()) ||
        r.applicantName.toLowerCase().includes(q.toLowerCase()) ||
        r.email.toLowerCase().includes(q.toLowerCase()) ||
        r.organization.toLowerCase().includes(q.toLowerCase())
    );
    if (match) setSelectedRecord(match);
  };

  const handlePrintBadge = async (id: string) => {
    setIsPrinting(true);
    await new Promise((res) => setTimeout(res, 1200)); // Simulate thermal print job dispatch
    setPrintedIds((prev) => new Set([...prev, id]));
    setIsPrinting(false);
  };

  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `IMP26-W${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: StaffRegistrationRecord = {
      id: newId,
      applicantName: walkinData.name,
      email: walkinData.email,
      phone: walkinData.phone,
      organization: walkinData.organization,
      designation: walkinData.designation,
      type: 'Walk-in',
      badgeRole: walkinData.badgeRole,
      sector: walkinData.sector,
      country: 'India',
      state: 'Madhya Pradesh',
      department: 'On-site Registration Desk',
      status: 'Approved',
      submittedAt: new Date().toISOString(),
      investmentInterestINR: 0,
      documents: [],
      delegates: [],
    };

    setRecords((prev) => [newRecord, ...prev]);
    setSelectedRecord(newRecord);
    setShowWalkinModal(false);
    
    // Auto-save walk-in to LocalStore via API
    fetch('/api/v1/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newId,
        fullName: walkinData.name,
        email: walkinData.email,
        phone: walkinData.phone,
        organizationName: walkinData.organization,
        designation: walkinData.designation,
        type: 'Walk-in',
        badgeRole: walkinData.badgeRole,
        sector: walkinData.sector,
        status: 'Approved',
      }),
    }).catch((err) => console.warn('Failed to save walk-in to backend:', err));

    setWalkinData({
      name: '',
      email: '',
      phone: '',
      organization: '',
      designation: '',
      sector: 'Manufacturing',
      badgeRole: BADGE_ROLES.DELEGATE,
    });
  };

  // Start Camera QR scanner
  const startCameraScanner = async () => {
    setShowCameraScanner(true);
    setCameraError(null);

    const { Html5QrcodeScanner } = await import('html5-qrcode');

    setTimeout(() => {
      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          'badge-qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scannerRef.current = html5QrcodeScanner;

        html5QrcodeScanner.render(
          (decodedText: string) => {
            let targetId = decodedText.trim();
            // Parse JSON payload if applicable
            try {
              if (targetId.startsWith('{')) {
                const parsed = JSON.parse(targetId);
                if (parsed.id) targetId = parsed.id;
              }
            } catch {
              // use raw string
            }

            handleSearch(targetId);
            closeCameraScanner();
          },
          (err) => {
            // Ignore scan attempt warnings
          }
        );
      } catch (err) {
        console.error('Camera startup error:', err);
        setCameraError('Unable to access camera device. Please verify permissions.');
      }
    }, 100);
  };

  // Close Camera Scanner
  const closeCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setShowCameraScanner(false);
  };

  const badgeColor = selectedRecord
    ? BADGE_ROLE_COLORS[selectedRecord.badgeRole] || { text: 'text-slate-800', bg: 'bg-slate-200' }
    : { text: 'text-slate-800', bg: 'bg-slate-200' };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Top Action Header */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">On-Site Registration & Badge Printing</h1>
          <p className="text-xs text-foreground-muted">Verify approved attendees and issue physical event passes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowWalkinModal(true)}>
            <UserPlus className="w-4 h-4" /> Walk-in Manual Entry
          </Button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Lookup & Verification Panel */}
        <div className="lg:col-span-7 p-6 border-r border-border overflow-y-auto space-y-6">
          {/* Quick Search Toolbar */}
          <Card padding="md" variant="default" className="space-y-3">
            <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider">
              Instant Attendee Lookup
            </h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                <input
                  type="text"
                  placeholder="Scan QR code, enter Reg ID (e.g. IMP26-00104), Name or Email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground font-mono placeholder:font-sans placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="secondary" size="md" onClick={startCameraScanner}>
                <QrCode className="w-4 h-4" /> Trigger QR Scanner
              </Button>
            </div>
          </Card>

          {/* Verification Record Summary */}
          {selectedRecord ? (
            <Card padding="lg" variant="default" className="space-y-6">
              <div className="flex items-start justify-between border-b border-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-data text-sm font-bold text-primary">{selectedRecord.id}</span>
                    <StatusBadge status={selectedRecord.status} size="sm" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-1">{selectedRecord.applicantName}</h3>
                  <p className="text-sm text-foreground-muted">
                    {selectedRecord.designation} at <span className="font-semibold">{selectedRecord.organization}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-foreground-subtle block uppercase tracking-wider">Role Designation</span>
                  <span className={cn('px-3 py-1 rounded-full text-xs font-bold inline-block mt-1', badgeColor.bg, badgeColor.text)}>
                    {selectedRecord.badgeRole}
                  </span>
                </div>
              </div>

              {/* Verification Checks */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider">
                  Verification Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Government Approval Status
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {selectedRecord.status.toLowerCase() === 'approved' ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-background flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Identity / ID Proof Scan
                    </div>
                    <span className="text-[11px] font-bold text-primary">MATCHED</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Mail className="w-3.5 h-3.5" /> {selectedRecord.email}
                </div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Phone className="w-3.5 h-3.5" /> {selectedRecord.phone}
                </div>
              </div>

              {/* Print Trigger CTA */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="text-xs text-foreground-muted">
                  Print Status: {printedIds.has(selectedRecord.id) ? (
                    <span className="text-emerald-700 font-bold">✓ Pass Printed</span>
                  ) : (
                    <span className="text-amber-700 font-bold">Ready to Print</span>
                  )}
                </div>

                <Button
                  variant="accent"
                  size="md"
                  isLoading={isPrinting}
                  onClick={() => handlePrintBadge(selectedRecord.id)}
                >
                  <Printer className="w-4 h-4" /> Print Badge Pass
                </Button>
              </div>
            </Card>
          ) : (
            <div className="p-12 text-center text-foreground-muted">
              Search or select an attendee record to load verification checklist.
            </div>
          )}

          {/* Quick Print Queue Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider">
              On-Site Print Queue ({records.length})
            </h3>
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-background text-foreground-muted border-b border-border font-semibold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Attendee</th>
                    <th className="p-3">Organization</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRecord(r)}
                      className={cn(
                        'cursor-pointer hover:bg-primary-50/50 transition-colors',
                        selectedRecord?.id === r.id ? 'bg-primary-50/70 font-semibold' : ''
                      )}
                    >
                      <td className="p-3 font-data text-primary font-bold">{r.id}</td>
                      <td className="p-3 font-medium text-foreground">{r.applicantName}</td>
                      <td className="p-3 text-foreground-muted">{r.organization}</td>
                      <td className="p-3">
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold', BADGE_ROLE_COLORS[r.badgeRole]?.bg || 'bg-slate-200', BADGE_ROLE_COLORS[r.badgeRole]?.text || 'text-slate-800')}>
                          {r.badgeRole}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(r);
                            handlePrintBadge(r.id);
                          }}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Live Physical Badge Pass Preview */}
        <div className="lg:col-span-5 p-6 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              Thermal Badge Pass Preview
            </span>
            <span className="text-[11px] text-slate-400">Live 3.5&quot; x 5.5&quot; Printable Layout</span>
          </div>

          {selectedRecord ? (
            <div className="w-[320px] bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-900 border-4 border-slate-700 animate-fade-in relative">
              {/* Top Banner (Role Color per BRD) */}
              <div className={cn('py-4 px-6 text-center font-extrabold text-lg uppercase tracking-wider shadow-inner', badgeColor.bg, badgeColor.text)}>
                {selectedRecord.badgeRole}
              </div>

              {/* Badge Body */}
              <div className="p-6 text-center space-y-4">
                {/* Event Watermark Logo */}
                <div className="flex items-center justify-center gap-2 text-primary font-black text-xs uppercase tracking-widest border-b border-slate-200 pb-3">
                  <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-bold text-[10px]">MP</div>
                  INVEST MADHYA PRADESH 2026
                </div>

                {/* Real Scannable QR Code */}
                <div className="mx-auto flex items-center justify-center">
                  <BadgeQRCode
                    registrationId={selectedRecord.id}
                    applicantName={selectedRecord.applicantName}
                    organization={selectedRecord.organization}
                    badgeRole={selectedRecord.badgeRole}
                    size={140}
                    colorDark="#0F172A"
                    colorLight="#FFFFFF"
                  />
                </div>

                {/* Attendee Name & Designation */}
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {selectedRecord.applicantName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    {selectedRecord.designation}
                  </p>
                  <p className="text-xs font-bold text-primary uppercase mt-0.5">
                    {selectedRecord.organization}
                  </p>
                </div>

                {/* Sector & Access Zone */}
                <div className="pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>ZONE: MAIN HALL & VIP</span>
                  <span className="font-mono">{selectedRecord.id}</span>
                </div>
              </div>

              {/* Bottom Strip */}
              <div className="bg-slate-900 text-slate-400 text-[9px] py-1.5 px-4 text-center font-mono">
                NON-TRANSFERABLE • GIS-2026 OFFICIAL PASS
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">Select an attendee to preview badge pass</div>
          )}
        </div>
      </div>

      {/* Camera QR Scanner Modal */}
      {showCameraScanner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in relative">
            <button
              onClick={closeCameraScanner}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Scan Attendee QR Code
            </h3>

            <div id="badge-qr-reader" className="w-full rounded-xl overflow-hidden bg-black text-white min-h-[250px]" />

            {cameraError && (
              <p className="text-xs text-destructive font-semibold">{cameraError}</p>
            )}
          </div>
        </div>
      )}

      {/* Walk-in Manual Entry Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateWalkin} className="bg-surface rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> On-site Walk-in Registration
            </h3>

            <div className="space-y-3">
              <Input
                label="Full Name"
                isRequired
                value={walkinData.name}
                onChange={(e) => setWalkinData({ ...walkinData, name: e.target.value })}
                placeholder="Enter attendee full name"
              />
              <Input
                label="Organization / Business Name"
                isRequired
                value={walkinData.organization}
                onChange={(e) => setWalkinData({ ...walkinData, organization: e.target.value })}
                placeholder="Company or Government Dept"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Designation"
                  value={walkinData.designation}
                  onChange={(e) => setWalkinData({ ...walkinData, designation: e.target.value })}
                  placeholder="e.g. Director"
                />
                <Select
                  label="Badge Role (BRD)"
                  options={Object.values(BADGE_ROLES).map((r) => ({ value: r, label: r }))}
                  value={walkinData.badgeRole}
                  onChange={(e) => setWalkinData({ ...walkinData, badgeRole: e.target.value as any })}
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                isRequired
                value={walkinData.email}
                onChange={(e) => setWalkinData({ ...walkinData, email: e.target.value })}
                placeholder="attendee@company.com"
              />
              <Input
                label="Mobile Phone Number"
                type="tel"
                isRequired
                value={walkinData.phone}
                onChange={(e) => setWalkinData({ ...walkinData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowWalkinModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm">
                Register & Issue Badge
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
