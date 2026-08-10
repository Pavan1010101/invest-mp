/**
 * SISMP — Registration Type Picker
 * First step: choose your registration category.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/config';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  Globe,
  Rocket,
  Landmark,
  ChevronRight,
  FileText,
  Clock,
} from 'lucide-react';

const TYPES = [
  {
    slug: 'investor',
    icon: Building2,
    color: 'from-blue-500 to-blue-700',
    iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    en: 'Investor',
    hi: 'निवेशक',
    descEn: 'Domestic companies and individuals looking to invest in Madhya Pradesh',
    descHi: 'मध्य प्रदेश में निवेश करने वाली घरेलू कंपनियां और व्यक्ति',
    docs: ['Company Registration Certificate', 'PAN Card', 'Authorization Letter'],
    time: 10,
  },
  {
    slug: 'delegate',
    icon: Users,
    color: 'from-teal-500 to-teal-700',
    iconBg: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
    en: 'Delegate',
    hi: 'प्रतिनिधि',
    descEn: 'Industry representatives, trade body members, and professional delegates',
    descHi: 'उद्योग प्रतिनिधि, व्यापार निकाय के सदस्य और पेशेवर प्रतिनिधि',
    docs: ['ID Proof', 'Organization Authorization'],
    time: 7,
  },
  {
    slug: 'foreign-investor',
    icon: Globe,
    color: 'from-indigo-500 to-indigo-700',
    iconBg: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    en: 'Foreign Investor',
    hi: 'विदेशी निवेशक',
    descEn: 'International investors, FDI-interested companies, and global businesses',
    descHi: 'अंतरराष्ट्रीय निवेशक, एफडीआई-इच्छुक कंपनियां और वैश्विक व्यवसाय',
    docs: ['Passport', 'Company Registration', 'Investment Intent Letter'],
    time: 12,
  },
  {
    slug: 'startup',
    icon: Rocket,
    color: 'from-purple-500 to-purple-700',
    iconBg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    en: 'Startup',
    hi: 'स्टार्टअप',
    descEn: 'DPIIT-recognized startups seeking investment and partnership opportunities',
    descHi: 'डीपीआईआईटी-मान्यता प्राप्त स्टार्टअप जो निवेश और साझेदारी के अवसर तलाश रहे हैं',
    docs: ['DPIIT Recognition Certificate', 'Pitch Deck', 'Founder ID'],
    time: 8,
  },
  {
    slug: 'department-visitor',
    icon: Landmark,
    color: 'from-slate-500 to-slate-700',
    iconBg: 'bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white',
    en: 'Department Visitor',
    hi: 'विभागीय आगंतुक',
    descEn: 'Government department officials and institutional visitors',
    descHi: 'सरकारी विभाग के अधिकारी और संस्थागत आगंतुक',
    docs: ['Government ID', 'Department Authorization Letter'],
    time: 5,
  },
];

export default function RegisterPage() {
  const { t, locale } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {t('registration', 'selectType')}
            </h1>
            <p className="text-foreground-muted text-lg max-w-xl mx-auto">
              {t('registration', 'selectTypeDescription')}
            </p>
          </div>

          {/* Type cards */}
          <div className="space-y-4">
            {TYPES.map((type) => (
              <Link key={type.slug} href={`/register/${type.slug}`}>
                <Card variant="interactive" padding="none" className="group overflow-hidden">
                  <div className="flex items-stretch">
                    {/* Left color bar */}
                    <div className={cn('w-1.5 bg-gradient-to-b shrink-0 rounded-l-xl', type.color)} />

                    <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Icon */}
                      <div className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                        type.iconBg
                      )}>
                        <type.icon className="w-7 h-7" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {locale === 'hi' ? type.hi : type.en}
                        </h3>
                        <p className="text-sm text-foreground-muted line-clamp-2">
                          {locale === 'hi' ? type.descHi : type.descEn}
                        </p>
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-foreground-subtle">
                            <Clock className="w-3.5 h-3.5" />
                            {t('registration', 'estimatedTime', { minutes: String(type.time) })}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-foreground-subtle">
                            <FileText className="w-3.5 h-3.5" />
                            {type.docs.length} {t('registration', 'requiredDocuments')}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-foreground-subtle group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0 hidden sm:block" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Already registered? */}
          <div className="mt-8 text-center">
            <p className="text-sm text-foreground-muted">
              Already registered?{' '}
              <Link href="/status" className="text-primary font-medium hover:underline">
                {t('landing', 'trackStatus')}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
