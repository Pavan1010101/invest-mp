/**
 * SISMP — Client Providers Wrapper
 * Bundles ThemeProvider (Light/Dark mode), I18nProvider, and SISMP AuthProvider.
 */
'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { I18nProvider } from '@/lib/i18n/config';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider defaultLocale="en">
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
