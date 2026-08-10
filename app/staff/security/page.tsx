/**
 * SISMP — Security & Access Control Portal
 * Used on-site by Security Staff and Gate Officers.
 * Features:
 * - Live Camera QR Code Scanner via html5-qrcode
 * - Instant HID Barcode / Manual Reg ID Scanner
 * - Access Granted / Denied Indicator with VIP & Zone Access checks
 * - Live Gate Audit Log & Real-time Entry Statistics
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/patterns/StatusBadge';
import { BADGE_ROLES, BADGE_ROLE_COLORS } from '@/lib/constants/statuses';
import { MOCK_REGISTRATION_RECORDS, type StaffRegistrationRecord } from '@/lib/api/mocks/staffMockData';
import {
  ShieldCheck,
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  CameraOff,
  Search,
  User,
  Building,
  MapPin,
  Clock,
  RefreshCw,
  Zap,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLogEntry {
  id: string;
  regId: string;
  applicantName: string;
  organization: string;
  badgeRole: string;
  gate: string;
  status: 'GRANTED' | 'DENIED';
  timestamp: string;
  reason?: string;
}

export default function SecurityPage() {
  const [query, setQuery] = useState('');
  const [scannedRecord, setScannedRecord] = useState<StaffRegistrationRecord | null>(null);
  const [scanResult, setScanResult] = useState<'IDLE' | 'GRANTED' | 'DENIED'>('IDLE');
  const [denialReason, setDenialReason] = useState<string>('');
  
  // Camera scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  
  // Gate location state
  const [selectedGate, setSelectedGate] = useState('Gate 1 - Main Plenary Entrance');

  // Stats counters
  const [stats, setStats] = useState({
    totalScans: 0,
    granted: 0,
    denied: 0,
  });

  // Recent Audit Log
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // Load audit history on mount
  useEffect(() => {
    fetch('/api/v1/security/audit')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then((json) => {
        if (json.success) {
          setAuditLog(json.data);
          setStats(json.stats);
        }
      })
      .catch((err) => console.warn('Failed to load gate audit history:', err));
  }, []);

  // Clean up html5-qrcode camera instance on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  // Process a QR code or barcode payload
  const processScanCode = (rawCode: string) => {
    if (!rawCode) return;

    let targetId = rawCode.trim();

    // Check if raw payload is JSON string from BadgeQRCode
    try {
      if (targetId.startsWith('{')) {
        const parsed = JSON.parse(targetId);
        if (parsed.id) targetId = parsed.id;
      }
    } catch {
      // Fallback to raw string
    }

    setQuery(targetId);
    evaluateAccess(targetId);
  };

  const logAudit = async (payload: any) => {
    try {
      const res = await fetch('/api/v1/security/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (res.ok && json.success && json.data) {
        setAuditLog((prev) => [json.data, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalScans: prev.totalScans + 1,
          granted: payload.status === 'GRANTED' ? prev.granted + 1 : prev.granted,
          denied: payload.status === 'DENIED' ? prev.denied + 1 : prev.denied,
        }));
      }
    } catch (err) {
      console.warn('Failed to save audit log to DB:', err);
    }
  };

  // Access control decision engine (Fetches live registrations from API & database)
  const evaluateAccess = async (regId: string) => {
    const cleanId = regId.trim().toLowerCase();
    let record: StaffRegistrationRecord | null = null;

    // 1. Try fetching from live REST API / database endpoint
    try {
      const res = await fetch(`/api/v1/registrations/${encodeURIComponent(cleanId)}`);
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (res.ok && json.success && json.data) {
        record = json.data;
      }
    } catch (err) {
      console.warn('API lookup failed, falling back to storage:', err);
    }

    // 2. Fallback to localStorage submitted registrations
    if (!record && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sismp_submitted_registrations');
        if (stored) {
          const list: StaffRegistrationRecord[] = JSON.parse(stored);
          const found = list.find(
            (r) =>
              r.id.toLowerCase() === cleanId ||
              r.email.toLowerCase() === cleanId ||
              r.applicantName.toLowerCase().includes(cleanId)
          );
          if (found) record = found;
        }
      } catch {
        // fallback
      }
    }

    // 3. Fallback to static mock dataset
    if (!record) {
      const foundMock = MOCK_REGISTRATION_RECORDS.find(
        (r) =>
          r.id.toLowerCase() === cleanId ||
          r.email.toLowerCase() === cleanId ||
          r.applicantName.toLowerCase().includes(cleanId)
      );
      if (foundMock) record = foundMock;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!record) {
      setScannedRecord(null);
      setScanResult('DENIED');
      setDenialReason(`Invalid Registration ID "${regId}". Record not found in database.`);
      
      logAudit({
        regId: regId.toUpperCase(),
        applicantName: 'Unknown Attendee',
        organization: 'N/A',
        badgeRole: 'Unknown',
        gate: selectedGate,
        status: 'DENIED',
        reason: 'Unregistered Registration ID',
      });
      return;
    }

    setScannedRecord(record);

    // Check status condition (Approved or Submitted permits entry)
    if (record.status.toLowerCase() === 'approved' || record.status.toLowerCase() === 'submitted') {
      setScanResult('GRANTED');
      setDenialReason('');
      
      logAudit({
        regId: record.id,
        applicantName: record.applicantName,
        organization: record.organization,
        badgeRole: record.badgeRole || 'Investor',
        gate: selectedGate,
        status: 'GRANTED',
      });
    } else {
      setScanResult('DENIED');
      const denyReason = record.status.toLowerCase() === 'rejected'
          ? `Application REJECTED: ${record.rejectionReason || 'Verification failed'}`
          : `Application Status is "${record.status}" (Requires Nodal Officer Approval)`;
          
      setDenialReason(denyReason);
      
      logAudit({
        regId: record.id,
        applicantName: record.applicantName,
        organization: record.organization,
        badgeRole: record.badgeRole || 'Investor',
        gate: selectedGate,
        status: 'DENIED',
        reason: `Status: ${record.status}`,
      });
    }
  };

  // Toggle live camera scanner using html5-qrcode
  const toggleCameraScanner = async () => {
    if (isCameraActive) {
      if (scannerRef.current) {
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      setIsCameraActive(false);
      return;
    }

    setIsCameraActive(true);
    setCameraError(null);

    // Dynamic import to avoid SSR issues
    const { Html5QrcodeScanner } = await import('html5-qrcode');

    setTimeout(() => {
      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scannerRef.current = html5QrcodeScanner;

        html5QrcodeScanner.render(
          (decodedText: string) => {
            processScanCode(decodedText);
          },
          (errorMessage: string) => {
            // Ignore scan attempt errors
          }
        );
      } catch (err: any) {
        console.error('Camera initialization failed:', err);
        setCameraError('Camera access required. Please allow camera permissions or enter ID manually.');
        setIsCameraActive(false);
      }
    }, 100);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Top Header Toolbar */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Security & Venue Access Control</h1>
            <p className="text-xs text-foreground-muted">Scan attendee QR pass for real-time gate entry verification</p>
          </div>
        </div>

        {/* Gate Selection Dropdown */}
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: 'Gate 1 - Main Plenary Entrance', label: 'Gate 1 - Main Plenary Entrance' },
              { value: 'Gate 2 - VIP Lounge Entrance', label: 'Gate 2 - VIP Lounge Entrance' },
              { value: 'Gate 3 - Exhibition Pavilion', label: 'Gate 3 - Exhibition Pavilion' },
              { value: 'Gate 4 - B2G Meeting Suites', label: 'Gate 4 - B2G Meeting Suites' },
            ]}
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="text-xs font-semibold"
          />

          <Button
            variant={isCameraActive ? 'destructive' : 'primary'}
            size="sm"
            onClick={toggleCameraScanner}
          >
            {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {isCameraActive ? 'Close Camera' : 'Start Camera Scanner'}
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Scanner & Verification Panel */}
        <div className="lg:col-span-7 p-6 border-r border-border overflow-y-auto space-y-6">
          {/* Quick Search & Barcode Scan Input */}
          <Card padding="md" variant="default" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider">
                Scan QR Pass / Barcode / Registration ID
              </h2>
              <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" /> READY FOR SCANNER
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                processScanCode(query);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                <input
                  type="text"
                  placeholder="Scan QR payload or enter ID (e.g. IMP26-39324, IMP26-00104, IMP26-60557)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-border bg-background text-foreground font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <Button type="submit" variant="accent" size="md">
                Verify Pass
              </Button>
            </form>

            {/* Quick Demo Scan Buttons */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs">
              <span className="text-foreground-subtle text-[11px]">Quick Samples:</span>
              <button
                type="button"
                onClick={() => processScanCode('IMP26-39324')}
                className="px-2.5 py-1 rounded bg-primary-50 text-primary font-mono text-[11px] font-bold hover:bg-primary-100 transition-colors"
              >
                IMP26-39324 (Pawan)
              </button>
              <button
                type="button"
                onClick={() => processScanCode('IMP26-00104')}
                className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-bold hover:bg-blue-100 transition-colors"
              >
                IMP26-00104 (Birla)
              </button>
              <button
                type="button"
                onClick={() => processScanCode('IMP26-60557')}
                className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold hover:bg-emerald-100 transition-colors"
              >
                IMP26-60557 (Delegate)
              </button>
              <button
                type="button"
                onClick={() => processScanCode('IMP26-INVALID')}
                className="px-2.5 py-1 rounded bg-red-50 text-red-700 font-mono text-[11px] font-bold hover:bg-red-100 transition-colors"
              >
                IMP26-INVALID
              </button>
            </div>
          </Card>

          {/* Camera Feed Container */}
          {isCameraActive && (
            <Card padding="md" variant="default" className="space-y-3 border-2 border-primary">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-2">
                  <Camera className="w-4 h-4 animate-pulse" /> Live Camera Stream Active
                </span>
                <span className="text-[11px] text-foreground-subtle">Point phone or badge QR code at camera</span>
              </div>
              
              <div id="qr-reader" className="w-full rounded-xl overflow-hidden bg-black text-white min-h-[260px]" />
              
              {cameraError && (
                <p className="text-xs text-destructive font-semibold">{cameraError}</p>
              )}
            </Card>
          )}

          {/* Live Gate Verification Banner */}
          {scanResult !== 'IDLE' && (
            <div
              className={cn(
                'p-6 rounded-2xl border-2 transition-all duration-300 animate-fade-in space-y-4',
                scanResult === 'GRANTED'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
                  : 'bg-red-500/10 border-red-500/40 text-red-950 dark:text-red-100'
              )}
            >
              {/* Result Indicator Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {scanResult === 'GRANTED' ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <div>
                    <h2 className={cn('text-2xl font-black tracking-tight', scanResult === 'GRANTED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                      {scanResult === 'GRANTED' ? 'ACCESS GRANTED 🟢' : 'ACCESS DENIED 🔴'}
                    </h2>
                    <p className="text-xs opacity-80">{selectedGate}</p>
                  </div>
                </div>

                {scannedRecord && (
                  <span
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm',
                      BADGE_ROLE_COLORS[scannedRecord.badgeRole]?.bg || 'bg-slate-200',
                      BADGE_ROLE_COLORS[scannedRecord.badgeRole]?.text || 'text-slate-800'
                    )}
                  >
                    {scannedRecord.badgeRole}
                  </span>
                )}
              </div>

              {/* Scanned Attendee Card */}
              {scannedRecord ? (
                <div className="bg-surface/80 backdrop-blur rounded-xl p-4 border border-border/60 space-y-3">
                  <div className="flex items-start justify-between border-b border-border/40 pb-3">
                    <div>
                      <span className="font-data text-xs font-bold text-primary">{scannedRecord.id}</span>
                      <h3 className="text-lg font-bold text-foreground">{scannedRecord.applicantName}</h3>
                      <p className="text-xs text-foreground-muted">
                        {scannedRecord.designation} — <span className="font-semibold">{scannedRecord.organization}</span>
                      </p>
                    </div>
                    <StatusBadge status={scannedRecord.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-foreground-subtle block">SECTOR / DEPARTMENT</span>
                      <span className="font-semibold text-foreground">{scannedRecord.sector}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-foreground-subtle block">REGION / ORIGIN</span>
                      <span className="font-semibold text-foreground">{scannedRecord.state}, {scannedRecord.country}</span>
                    </div>
                  </div>

                  {/* Zone Access Matrix */}
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[10px] font-bold text-foreground-subtle block uppercase mb-1.5">
                      PERMITTED ACCESS ZONES
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        ✓ Main Plenary Hall
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        ✓ Exhibition Pavilions
                      </span>
                      {scannedRecord.badgeRole === BADGE_ROLES.INVESTOR && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300">
                          ✓ B2G Meeting Lounge
                        </span>
                      )}
                      {(scannedRecord.badgeRole === BADGE_ROLES.INVESTOR || scannedRecord.badgeRole === BADGE_ROLES.GOVERNMENT) && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          ✓ VIP Executive Dining
                        </span>
                      )}
                    </div>
                  </div>

                  {scanResult === 'GRANTED' ? (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Security check passed successfully. Access granted.
                      </p>
                    </div>
                  ) : scanResult === 'DENIED' ? (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {denialReason}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="bg-surface/80 backdrop-blur rounded-xl p-4 border border-red-500/30">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> {denialReason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Real-time Gate Entry Statistics Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card padding="sm" variant="default" className="text-center">
              <span className="text-[10px] font-bold text-foreground-subtle uppercase">Total Gate Scans</span>
              <p className="text-2xl font-black font-data text-foreground">{stats.totalScans}</p>
            </Card>

            <Card padding="sm" variant="default" className="text-center border-emerald-500/30">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Passed (Granted)</span>
              <p className="text-2xl font-black font-data text-emerald-600">{stats.granted}</p>
            </Card>

            <Card padding="sm" variant="default" className="text-center border-red-500/30">
              <span className="text-[10px] font-bold text-red-600 uppercase">Flagged (Denied)</span>
              <p className="text-2xl font-black font-data text-red-600">{stats.denied}</p>
            </Card>
          </div>
        </div>

        {/* Right Side: Security Audit Log Table */}
        <div className="lg:col-span-5 p-6 bg-surface flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Live Security Audit Trail</h3>
              <p className="text-xs text-foreground-muted">Real-time gate activity log</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE STREAM
            </span>
          </div>

          {/* Audit Trail List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {auditLog.map((log) => (
              <div
                key={log.id}
                onClick={() => {
                  setQuery(log.regId);
                  evaluateAccess(log.regId);
                }}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer hover:border-primary/50',
                  log.status === 'GRANTED'
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-data font-bold text-primary">{log.regId}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-extrabold',
                        log.status === 'GRANTED' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/20 text-red-700 dark:text-red-300'
                      )}
                    >
                      {log.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-foreground-subtle font-mono">{log.timestamp}</span>
                </div>

                <div className="mt-1">
                  <p className="text-xs font-bold text-foreground leading-tight">{log.applicantName}</p>
                  <p className="text-[11px] text-foreground-muted truncate">{log.organization}</p>
                </div>

                {log.reason && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-semibold">
                    ⚠️ {log.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
