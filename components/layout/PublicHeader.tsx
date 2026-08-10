/**
 * SISMP — Public Portal Header
 * Official, trustworthy header for the summit registration portal with Auth state support.
 */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/config';
import { useAuth } from '@/lib/auth/AuthProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Menu, X, LogOut, User } from 'lucide-react';

export function PublicHeader() {
  const router = useRouter();
  const { t } = useTranslations();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 glass-header border-b border-border/50" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo / Summit Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-primary-100 group-hover:shadow-lg transition-all">
              <img
                src="/images/favicon.png"
                alt="Invest Madhya Pradesh Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-bold text-primary leading-tight">
                {t('common', 'appName')}
              </span>
              <span className="block text-xs text-foreground-muted leading-tight">
                {t('common', 'tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-foreground-muted hover:text-primary rounded-lg hover:bg-primary-50 transition-all duration-200"
            >
              {t('nav', 'home')}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-foreground-muted hover:text-primary rounded-lg hover:bg-primary-50 transition-all duration-200"
            >
              {t('nav', 'register')}
            </Link>
            <Link
              href="/status"
              className="px-4 py-2 text-sm font-medium text-foreground-muted hover:text-primary rounded-lg hover:bg-primary-50 transition-all duration-200"
            >
              {t('nav', 'status')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {mounted && <ThemeToggle />}
            {mounted && <LanguageSwitcher className="hidden sm:flex" />}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={
                    user.role === 'super_admin' ? '/dashboards/super-admin' :
                    user.role === 'cmo_official' ? '/dashboards/cmo' :
                    user.role === 'mpidc_admin' ? '/dashboards/mpidc' :
                    user.role === 'security_staff' ? '/staff/security' :
                    user.role === 'registration_desk' ? '/staff/badges' :
                    user.role === 'pavilion_manager' ? '/staff/pavilions' :
                    user.role === 'event_organizer' ? '/staff/events' :
                    user.role === 'relationship_manager' ? '/staff/crm' :
                    ['investor', 'delegate', 'startup', 'foreign_investor'].includes(user.role) ? '/status' :
                    '/staff/approvals'
                  }
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 text-primary text-xs font-bold border border-primary-200"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name.split(' ')[0]} ({user.role.replace('_', ' ')})</span>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="font-semibold" style={{ color: '#1E3A8A', borderColor: '#1E3A8A' }}>
                    Login
                  </Button>
                </Link>

                <Link href="/register" className="hidden md:block">
                  <Button variant="accent" size="sm">
                    {t('landing', 'registerNow')}
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-primary-50 text-foreground-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-surface animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-primary-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav', 'home')}
            </Link>
            <Link
              href="/register"
              className="block px-4 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-primary-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav', 'register')}
            </Link>
            <Link
              href="/status"
              className="block px-4 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-primary-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav', 'status')}
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout Session
              </button>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2.5 text-sm font-bold text-primary rounded-lg hover:bg-primary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
