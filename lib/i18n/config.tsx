/**
 * SISMP — i18n Configuration
 * Simple context-based i18n with EN + HI support.
 * Every user-facing string goes through useTranslations().
 */
'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import en from '@/messages/en.json';
import hi from '@/messages/hi.json';

export type Locale = 'en' | 'hi';

type Messages = typeof en;
type MessageSection = keyof Messages;

const messages: Record<Locale, Messages> = { en, hi };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (section: MessageSection, key: string, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function I18nProvider({ children, defaultLocale = 'en' }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = useCallback(
    (section: MessageSection, key: string, params?: Record<string, string | number>): string => {
      const sectionMessages = messages[locale]?.[section];
      if (!sectionMessages) return `[${section}.${key}]`;
      const value = (sectionMessages as Record<string, string>)[key];
      if (!value) return `[${section}.${key}]`;
      return interpolate(value, params);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: 'ltr' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslations must be used within I18nProvider');
  return context;
}
