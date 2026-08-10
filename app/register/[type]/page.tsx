/**
 * SISMP — Multi-Step Registration Wizard
 * Universal form for Investors, Delegates, Media, Govt, Exhibitors, Speakers, Startups.
 * Saves registration to local storage & backend store so Sector Officers see it immediately.
 */
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/config';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Wizard } from '@/components/patterns/Wizard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BADGE_ROLES } from '@/lib/constants/statuses';
import { generateRegistrationId } from '@/lib/utils';
import {
  User,
  Building,
  Upload,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';

const SECTORS = [
  'Manufacturing',
  'Renewable Energy',
  'IT & Electronics',
  'Pharma & Biotech',
  'Agro & MSME',
  'Automobile',
  'Tourism & Hospitality',
  'Urban Infrastructure',
];

interface Delegate {
  id: string;
  name: string;
  email: string;
  designation: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  organizationName: string;
  sector: string;
  country: string;
  state: string;
  city: string;
  investmentInterestINR: string;
  notes: string;
}

const getBadgeRoleFromType = (type: string): string => {
  const t = (type || '').toLowerCase();
  if (t.includes('investor')) return BADGE_ROLES.INVESTOR;
  if (t.includes('govt') || t.includes('official')) return BADGE_ROLES.GOVERNMENT;
  if (t.includes('media')) return BADGE_ROLES.MEDIA;
  if (t.includes('startup')) return BADGE_ROLES.STARTUP;
  return BADGE_ROLES.DELEGATE;
};

const getDepartmentFromSector = (sector: string): string => {
  const s = (sector || '').toLowerCase();
  if (s.includes('renewable') || s.includes('energy')) return 'Department of New & Renewable Energy';
  if (s.includes('it') || s.includes('electronics') || s.includes('tech')) return 'Department of Science & Technology';
  if (s.includes('pharma') || s.includes('health') || s.includes('biotech')) return 'Department of Public Health & Medical Education';
  if (s.includes('msme') || s.includes('agro')) return 'MP Micro, Small & Medium Enterprises (MSME)';
  if (s.includes('auto')) return 'Department of Automobile & Heavy Engineering';
  if (s.includes('tourism')) return 'Department of Tourism & Culture';
  return 'Department of Industrial Policy & Investment Promotion';
};

export default function RegistrationWizardPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslations();
  const registrationType = (params?.type as string) || 'investor';

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    organizationName: '',
    sector: SECTORS[0],
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Bhopal',
    investmentInterestINR: '100000000',
    notes: '',
  });

  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, [errors]);

  const validateStep1 = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = t('errors', 'required');
    if (!formData.email.trim()) newErrors.email = t('errors', 'required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('errors', 'invalidEmail');
    if (!formData.phone.trim()) newErrors.phone = t('errors', 'required');
    if (!formData.organizationName.trim()) newErrors.organizationName = t('errors', 'required');
    if (!formData.sector) newErrors.sector = t('errors', 'required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const addDelegate = useCallback(() => {
    setDelegates((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', email: '', designation: '' },
    ]);
  }, []);

  const removeDelegate = useCallback((id: string) => {
    setDelegates((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateDelegate = useCallback((id: string, field: keyof Delegate, value: string) => {
    setDelegates((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;
    const newFiles: UploadedFile[] = Array.from(uploaded).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!termsAccepted) return;
    setIsSubmitting(true);
    setSubmitError('');

    const regId = generateRegistrationId();
    const now = new Date().toISOString();
    const badgeRole = getBadgeRoleFromType(registrationType);
    const department = getDepartmentFromSector(formData.sector);

    const newRecord = {
      id: regId,
      applicantName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      designation: formData.designation || 'Representative',
      organization: formData.organizationName,
      type: registrationType.charAt(0).toUpperCase() + registrationType.slice(1),
      badgeRole: badgeRole,
      sector: formData.sector,
      country: formData.country || 'India',
      state: formData.state || 'Madhya Pradesh',
      city: formData.city || 'Indore',
      department: department,
      status: 'Submitted',
      submittedAt: now,
      investmentInterestINR: parseInt(formData.investmentInterestINR || '0', 10),
      notes: formData.notes || '',
      documents: files.map((f) => ({
        id: f.id,
        name: f.name,
        type: 'PDF',
        url: '#',
        verified: false,
      })),
      delegates: delegates,
    };

    try {
      // Call REST API endpoint synchronously to validate duplication
      const res = await fetch('/api/v1/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok || !json.success) {
        setIsSubmitting(false);
        setSubmitError(json.error || `Failed to submit registration (HTTP ${res.status}).`);
        return;
      }

      // Save to LocalStorage for Sector Officers queue
      try {
        const existing = localStorage.getItem('sismp_submitted_registrations');
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(newRecord);
        localStorage.setItem('sismp_submitted_registrations', JSON.stringify(list));
      } catch (e) {
        console.warn('Failed to save submitted registration to localStorage:', e);
      }

      router.push(`/register/confirmation?id=${regId}`);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Network error submitting registration. Please try again.');
    }
  }, [termsAccepted, formData, registrationType, files, delegates, router]);

  // Step 1: Personal Details
  const Step1PersonalDetails = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">{t('registration', 'personalDetails')}</h2>
          <p className="text-xs text-foreground-muted">Please provide official contact & organization details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label={t('registration', 'fullName')}
          isRequired
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          error={errors.fullName}
          placeholder="Enter your full name"
        />
        <Input
          label={t('registration', 'email')}
          isRequired
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          placeholder="you@company.com"
        />
        <Input
          label={t('registration', 'phone')}
          isRequired
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          error={errors.phone}
          placeholder="+91 98765 43210"
        />
        <Input
          label={t('registration', 'designation')}
          value={formData.designation}
          onChange={(e) => updateField('designation', e.target.value)}
          placeholder="e.g. Managing Director, Founder"
        />
        <Input
          label={t('registration', 'organization')}
          isRequired
          value={formData.organizationName}
          onChange={(e) => updateField('organizationName', e.target.value)}
          error={errors.organizationName}
          placeholder="Company / Enterprise Name"
        />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            {t('registration', 'sector')} <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.sector}
            onChange={(e) => updateField('sector', e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SECTORS.map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-border pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Country"
          value={formData.country}
          onChange={(e) => updateField('country', e.target.value)}
        />
        <Input
          label="State / Province"
          value={formData.state}
          onChange={(e) => updateField('state', e.target.value)}
        />
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => updateField('city', e.target.value)}
        />
      </div>

      <div className="border-t border-border pt-4">
        <Input
          label="Proposed Investment Amount (INR ₹)"
          type="number"
          value={formData.investmentInterestINR}
          onChange={(e) => updateField('investmentInterestINR', e.target.value)}
          placeholder="e.g. 100000000 (10 Cr)"
        />
      </div>
    </div>
  );

  // Step 2: Delegates
  const Step2Delegates = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t('registration', 'delegateInfo')}</h2>
            <p className="text-sm text-foreground-muted">Add accompanying team members</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={addDelegate}>
          <Plus className="w-4 h-4" /> Add Delegate
        </Button>
      </div>

      {delegates.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-surface">
          <User className="w-8 h-8 text-foreground-subtle mx-auto mb-2" />
          <p className="text-sm text-foreground-muted">No accompanying delegates added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {delegates.map((d, index) => (
            <div key={d.id} className="p-4 rounded-lg border border-border bg-surface space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-primary">
                <span>Delegate #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeDelegate(d.id)}
                  className="text-destructive hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Name"
                  value={d.name}
                  onChange={(e) => updateDelegate(d.id, 'name', e.target.value)}
                  placeholder="Delegate full name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={d.email}
                  onChange={(e) => updateDelegate(d.id, 'email', e.target.value)}
                  placeholder="delegate@company.com"
                />
                <Input
                  label="Designation"
                  value={d.designation}
                  onChange={(e) => updateDelegate(d.id, 'designation', e.target.value)}
                  placeholder="VP, Director..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 3: Documents
  const Step3Documents = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('registration', 'documentUpload')}</h2>
          <p className="text-sm text-foreground-muted">Company Registration Certificate, Board Resolution, or ID proof</p>
        </div>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-primary-200 hover:border-primary rounded-xl p-8 text-center cursor-pointer bg-primary-50/20 hover:bg-primary-50/40 transition-colors"
      >
        <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-sm font-semibold text-foreground">Click to upload verification files</p>
        <p className="text-xs text-foreground-muted mt-1">PDF, PNG, JPG up to 10MB</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{file.name}</span>
                <span className="text-foreground-subtle">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={() => removeFile(file.id)} className="text-destructive hover:underline">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 4: Review & Confirm
  const Step4Review = (
    <div className="space-y-6 animate-fade-in">
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-200 text-xs space-y-2">
        <h3 className="font-bold text-primary text-sm">Review Registration Summary</h3>
        <p><strong>Name:</strong> {formData.fullName}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Organization:</strong> {formData.organizationName}</p>
        <p><strong>Sector:</strong> {formData.sector} ({getDepartmentFromSector(formData.sector)})</p>
        <p><strong>Investment Amount:</strong> ₹{(parseInt(formData.investmentInterestINR || '0', 10) / 10000000).toFixed(2)} Cr</p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-surface">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 rounded text-primary focus:ring-primary h-4 w-4"
        />
        <label htmlFor="terms" className="text-xs text-foreground cursor-pointer leading-relaxed">
          I hereby certify that all information submitted is accurate and official. I agree to abide by the rules and regulations of the Invest Madhya Pradesh Global Investors Summit 2026.
        </label>
      </div>
    </div>
  );

  const steps = [
    {
      id: 'personal',
      title: t('registration', 'personalDetails'),
      description: 'Contact & Company',
      content: Step1PersonalDetails,
      validate: validateStep1,
    },
    {
      id: 'delegates',
      title: t('registration', 'delegateInfo'),
      description: 'Additional attendees',
      content: Step2Delegates,
    },
    {
      id: 'documents',
      title: t('registration', 'documentUpload'),
      description: 'Upload required docs',
      content: Step3Documents,
    },
    {
      id: 'review',
      title: t('registration', 'reviewSubmit'),
      description: 'Confirm & submit',
      content: Step4Review,
      validate: () => termsAccepted,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-8 lg:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm text-foreground-muted">
            <span>{t('registration', 'title')}</span>
            <span className="mx-2">›</span>
            <span className="text-foreground font-medium capitalize">
              {registrationType?.replace('-', ' ')}
            </span>
          </nav>

          <Wizard
            steps={steps}
            onComplete={handleSubmit}
            storageKey={`sismp-reg-${registrationType}`}
            submitLabel={t('registration', 'submitRegistration')}
            submittingLabel={t('registration', 'submitting')}
            isSubmitting={isSubmitting}
            backLabel={t('common', 'back')}
            nextLabel={t('common', 'next')}
          />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
