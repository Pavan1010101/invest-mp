/**
 * SISMP — Public Portal Footer
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/config';

export function PublicFooter() {
  const { t } = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white/80">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div>
                <span className="block text-white font-bold">{t('common', 'appName')}</span>
                <span className="block text-sm text-white/60">{t('common', 'tagline')}</span>
              </div>
            </div>
            <p className="text-sm text-white/60 max-w-md leading-relaxed">
              {t('landing', 'heroDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t('nav', 'register')}
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t('nav', 'status')}
                </Link>
              </li>
              <li>
                <Link href="/#sectors" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t('landing', 'sectors')}
                </Link>
              </li>
              <li>
                <Link href="/#agenda" className="text-sm text-white/60 hover:text-white transition-colors">
                  {t('landing', 'agenda')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('landing', 'contactUs')}
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>MPIDC, Bhopal</li>
              <li>Madhya Pradesh, India</li>
              <li>
                <a href="mailto:summit@mpidc.gov.in" className="hover:text-white transition-colors">
                  summit@mpidc.gov.in
                </a>
              </li>
              <li>
                <a href="tel:+917552660001" className="hover:text-white transition-colors">
                  +91 755 266 0001
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-white/40">
              {t('footer', 'copyright', { year: String(currentYear) })}
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {t('footer', 'privacy')}
              </Link>
              <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {t('footer', 'terms')}
              </Link>
              <Link href="/accessibility" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {t('footer', 'accessibility')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
