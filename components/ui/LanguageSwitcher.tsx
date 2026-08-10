/**
 * SISMP — Language Switcher
 * Toggle between English and Hindi.
 */
'use client';

import React from 'react';
import { useTranslations, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslations();

  const toggle = () => {
    setLocale(locale === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg',
        'border border-border bg-surface text-foreground-muted',
        'hover:bg-primary-50 hover:text-primary hover:border-primary-200',
        'transition-all duration-200',
        className
      )}
      aria-label={`Switch language to ${locale === 'en' ? 'Hindi' : 'English'}`}
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'en' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
}
