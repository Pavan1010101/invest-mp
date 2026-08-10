/**
 * SISMP — Registration Confirmation Page
 * Shown after successful submission with registration ID and next steps.
 */
'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/config';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  Copy,
  ArrowRight,
  FileSearch,
  Mail,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const registrationId = searchParams.get('id') || 'IMP26-00001';
  const [copied, setCopied] = React.useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-12 lg:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Success icon */}
          <div className="mb-8 animate-fade-in-scale">
            <div className="w-20 h-20 rounded-full bg-success-bg mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in">
            {t('confirmation', 'title')}
          </h1>
          <p className="text-lg text-foreground-muted mb-8 animate-fade-in">
            {t('confirmation', 'message')}
          </p>

          {/* Registration ID Card */}
          <Card variant="elevated" padding="lg" className="mb-8 animate-slide-in-up">
            <p className="text-sm text-foreground-muted mb-2">
              {t('confirmation', 'registrationId')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-data text-3xl font-bold text-primary tracking-wider">
                {registrationId}
              </span>
              <button
                onClick={copyId}
                className="p-2 rounded-lg hover:bg-primary-50 text-foreground-muted hover:text-primary transition-colors"
                aria-label="Copy registration ID"
              >
                {copied ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-foreground-subtle mt-2">
              {t('confirmation', 'saveId')}
            </p>
          </Card>

          {/* What happens next */}
          <Card variant="outlined" padding="lg" className="text-left mb-8 animate-slide-in-up">
            <h3 className="font-semibold text-foreground mb-4">
              {t('confirmation', 'whatNext')}
            </h3>
            <div className="space-y-4">
              {[
                { icon: FileSearch, text: t('confirmation', 'step1'), step: 1 },
                { icon: Mail, text: t('confirmation', 'step2'), step: 2 },
                { icon: CreditCard, text: t('confirmation', 'step3'), step: 3 },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-50 text-primary flex items-center justify-center shrink-0 text-sm font-semibold">
                    {item.step}
                  </div>
                  <p className="text-sm text-foreground-muted pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link href={`/status?id=${registrationId}`}>
              <Button variant="primary" size="lg">
                {t('confirmation', 'trackStatus')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                {t('confirmation', 'registerAnother')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-foreground-muted">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
