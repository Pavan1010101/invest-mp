/**
 * SISMP — Departmental Officers & Staff Login Portal
 * Official authentication portal for Sector Nodal Officers, Desk Staff, MPIDC Admin, CMO, and Pass Holders.
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  DEPARTMENT_OFFICER_CREDENTIALS,
  APPROVED_ATTENDEE_CREDENTIALS,
  getStoredOfficerCredentials,
  type DepartmentOfficerCredential,
} from '@/lib/auth/officerCredentials';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Landmark,
  ArrowRight,
  AlertCircle,
  Building,
  Key,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'directory'>('form');
  const [displayOfficers, setDisplayOfficers] = useState<DepartmentOfficerCredential[]>(DEPARTMENT_OFFICER_CREDENTIALS);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  React.useEffect(() => {
    fetch('/api/v1/officers')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          // Merge fetched data with original plaintext passwords for display
          const displayData = json.data.map((fetchedOfficer: any) => {
            const staticOfficer = DEPARTMENT_OFFICER_CREDENTIALS.find(o => o.email.toLowerCase() === fetchedOfficer.email.toLowerCase());
            const staticAttendee = APPROVED_ATTENDEE_CREDENTIALS.find(a => a.email.toLowerCase() === fetchedOfficer.email.toLowerCase());
            
            let displayPassword = '*(Hidden)*';
            if (staticOfficer) {
              displayPassword = staticOfficer.password;
            } else if (staticAttendee) {
              displayPassword = staticAttendee.password;
            }
            
            return {
              ...fetchedOfficer,
              password: displayPassword
            };
          });
          
          setDisplayOfficers(displayData);
        } else {
          setDisplayOfficers(getStoredOfficerCredentials());
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch officials from DB, using fallback list:', err);
        setDisplayOfficers(getStoredOfficerCredentials());
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputEmail = email.trim().toLowerCase();

    if (!email || !password) {
      setError('Please enter both Email Address / Registration ID and Password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputEmail, password })
      });
      const resData = await response.json();

      if (response.ok && resData.success && resData.data) {
        const matchedUser = resData.data;
        login({
          id: matchedUser.id || matchedUser.email,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          department: matchedUser.department || matchedUser.organization,
        });

        setIsLoading(false);

        if (matchedUser.role === 'super_admin') {
          router.push('/dashboards/super-admin');
        } else if (matchedUser.role === 'cmo_official') {
          router.push('/dashboards/cmo');
        } else if (matchedUser.role === 'mpidc_admin') {
          router.push('/dashboards/mpidc');
        } else if (matchedUser.role === 'security_staff') {
          router.push('/staff/security');
        } else if (matchedUser.role === 'registration_desk') {
          router.push('/staff/badges');
        } else if (matchedUser.role === 'pavilion_manager') {
          router.push('/staff/pavilions');
        } else if (matchedUser.role === 'event_organizer') {
          router.push('/staff/events');
        } else if (matchedUser.role === 'relationship_manager') {
          router.push('/staff/crm');
        } else if (matchedUser.role === 'attendee') {
          router.push(`/status?id=${matchedUser.id}`);
        } else {
          router.push('/staff/approvals');
        }
        return;
      } else {
        setIsLoading(false);
        setError(resData.error || 'Invalid credentials.');
        return;
      }
    } catch (err) {
      console.warn('Failed to resolve login:', err);
    }

    setIsLoading(false);
    setError('Invalid credentials. Please verify your Email/Registration ID and password.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary font-semibold text-xs mb-2">
              <Landmark className="w-4 h-4 text-primary" /> Invest Madhya Pradesh GIS-2026 Authentication Portal
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Single Sign-On Portal
            </h1>
            <p className="text-sm text-foreground-muted max-w-md mx-auto">
              Secure authentication for Sector Nodal Officers, Staff Desks, MPIDC Admins, CMO, and Approved Pass Holders.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex justify-center border-b border-border text-sm font-medium">
            <button
              onClick={() => setActiveTab('form')}
              className={cn(
                'px-6 py-2.5 border-b-2 font-bold text-xs transition-colors flex items-center gap-2',
                activeTab === 'form'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-muted hover:text-foreground'
              )}
            >
              <Lock className="w-4 h-4" /> Account Sign-In
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={cn(
                'px-6 py-2.5 border-b-2 font-bold text-xs transition-colors flex items-center gap-2',
                activeTab === 'directory'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-muted hover:text-foreground'
              )}
            >
              <Key className="w-4 h-4" /> Sector & Role Credentials Directory
            </button>
          </div>

          {activeTab === 'form' ? (
            <div className="max-w-md mx-auto w-full">
              {/* Form Card */}
              <Card padding="lg" variant="default" className="space-y-6 shadow-xl border-primary-100">
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-50 text-primary flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    Portal Sign-In
                  </h2>
                  <p className="text-xs text-foreground-muted">
                    Enter your official Email / Registration ID and password to access your workspace.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    label="Email Address / Registration ID"
                    type="text"
                    isRequired
                    placeholder="e.g. industrial.policy@mp.gov.in or IMP26-16070"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <div className="space-y-1 relative">
                    <label className="text-xs font-semibold text-foreground flex justify-between">
                      <span>Password Code</span>
                      <span className="text-primary hover:underline cursor-pointer text-[11px]">
                        Forgot password?
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full shadow-lg shadow-accent/20"
                    isLoading={isLoading}
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                <div className="text-center pt-2 border-t border-border/60">
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5" /> View All Sector Officer & Pass Credentials &rarr;
                  </button>
                </div>
              </Card>
            </div>
          ) : (
            /* Complete Directory Table */
            <div className="space-y-6">
              {/* Sector Officers & Staff Credentials */}
              <Card padding="lg" variant="default" className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary" /> Sector Nodal Officers & Staff Desk Credentials
                    </h3>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      Exact login credentials per sector and operational desk role
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary border border-primary-200">
                    {displayOfficers.length} Official Accounts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-background text-foreground-muted border-b border-border font-bold">
                      <tr>
                        <th className="p-3">Official / Designation</th>
                        <th className="p-3">Sector & Department</th>
                        <th className="p-3">Official Email / ID</th>
                        <th className="p-3">Password</th>
                        <th className="p-3">Role Badge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {displayOfficers.map((c) => (
                        <tr key={c.id} className="hover:bg-primary-50/50 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-foreground block">{c.name}</span>
                            <span className="text-[10px] text-foreground-subtle font-mono">{c.id}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-primary block">{c.sector}</span>
                            <span className="text-[10px] text-foreground-subtle">{c.department}</span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-foreground">{c.email}</td>
                          <td className="p-3 font-mono">
                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded w-fit text-amber-800 font-bold">
                              <span>{revealedPasswords[c.id] ? c.password : '••••••••••••'}</span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(c.id)}
                                className="text-amber-700 hover:text-amber-900 transition-colors"
                                title={revealedPasswords[c.id] ? 'Hide password' : 'Show password'}
                              >
                                {revealedPasswords[c.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                              {c.badgeRole}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Approved Attendees / Pass Holders */}
              <Card padding="lg" variant="default" className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" /> Approved Attendee & Pass Holder Login Credentials
                    </h3>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      Use these credentials to view approved Digital Entry Passes & QR badges
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {APPROVED_ATTENDEE_CREDENTIALS.length} Pass Roles
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-background text-foreground-muted border-b border-border font-bold">
                      <tr>
                        <th className="p-3">Registration ID</th>
                        <th className="p-3">Applicant & Enterprise</th>
                        <th className="p-3">Sector</th>
                        <th className="p-3">Pass Role</th>
                        <th className="p-3">Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {APPROVED_ATTENDEE_CREDENTIALS.map((a) => (
                        <tr key={a.registrationId} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-primary">{a.registrationId}</td>
                          <td className="p-3">
                            <span className="font-bold text-foreground block">{a.name}</span>
                            <span className="text-[10px] text-foreground-subtle block">{a.organization}</span>
                            <span className="text-[10px] font-mono text-slate-500">{a.email}</span>
                          </td>
                          <td className="p-3 text-foreground-muted font-semibold">{a.sector}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {a.badgeRole}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded w-fit text-amber-800 font-bold">
                              <span>{revealedPasswords[a.registrationId] ? a.password : '••••••••••••'}</span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(a.registrationId)}
                                className="text-amber-700 hover:text-amber-900 transition-colors"
                                title={revealedPasswords[a.registrationId] ? 'Hide password' : 'Show password'}
                              >
                                {revealedPasswords[a.registrationId] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
