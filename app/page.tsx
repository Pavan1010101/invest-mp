/**
 * SISMP — Public Portal Landing Page
 * Government investment summit — credible, high-stakes, institutional.
 * Features Official Invest Madhya Pradesh Global Investors Summit Banner.
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/lib/i18n/config';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Building2,
  Users,
  Globe,
  TrendingUp,
  Factory,
  Zap,
  Cpu,
  Leaf,
  Pill,
  Car,
  Wheat,
  GraduationCap,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Shield,
  Award,
  BarChart3,
  Landmark,
  Sparkles,
} from 'lucide-react';

/** Animated counter with intersection observer */
function useAnimatedCounter(target: number, duration = 2000): [number, React.RefObject<HTMLDivElement | null>] {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);

  return [count, ref];
}

function StatCard({ icon: Icon, value, label, suffix = '', color }: {
  icon: React.ElementType; value: number; label: string; suffix?: string; color: string;
}) {
  const [animatedValue, ref] = useAnimatedCounter(value);
  return (
    <div ref={ref} className="accent-bar-top bg-white rounded-xl shadow-card p-6 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      <div className={cn('w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center', color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="font-data text-3xl sm:text-4xl font-bold text-foreground mb-1 tracking-tight">
        {animatedValue.toLocaleString('en-IN')}{suffix}
      </div>
      <div className="text-sm text-foreground-muted font-medium">{label}</div>
    </div>
  );
}

const SECTORS = [
  { icon: Factory, name: 'Manufacturing', nameHi: 'विनिर्माण', desc: 'Auto, textiles, cement, steel', color: 'bg-blue-50 text-blue-600' },
  { icon: Cpu, name: 'IT & Electronics', nameHi: 'आईटी और इलेक्ट्रॉनिक्स', desc: 'IT parks, semiconductor, data centers', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Zap, name: 'Renewable Energy', nameHi: 'नवीकरणीय ऊर्जा', desc: 'Solar, wind, green hydrogen', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Pill, name: 'Pharma & Biotech', nameHi: 'फार्मा और बायोटेक', desc: 'API, formulations, medical devices', color: 'bg-rose-50 text-rose-600' },
  { icon: Wheat, name: 'Agro Processing', nameHi: 'कृषि प्रसंस्करण', desc: 'Food processing, cold chain', color: 'bg-amber-50 text-amber-600' },
  { icon: Car, name: 'Automobile', nameHi: 'ऑटोमोबाइल', desc: 'EV, auto components, testing', color: 'bg-sky-50 text-sky-600' },
  { icon: Leaf, name: 'Tourism', nameHi: 'पर्यटन', desc: 'Eco-tourism, heritage, wellness', color: 'bg-teal-50 text-teal-600' },
  { icon: GraduationCap, name: 'Education & Skills', nameHi: 'शिक्षा और कौशल', desc: 'Universities, skill centers, R&D', color: 'bg-purple-50 text-purple-600' },
];

const HIGHLIGHTS = [
  { icon: Shield, title: 'Single Window Clearance', titleHi: 'एकल खिड़की मंजूरी', desc: 'Fast-track approvals through dedicated MPIDC facilitation', color: 'from-blue-600 to-indigo-700' },
  { icon: Award, title: 'Attractive Incentives', titleHi: 'आकर्षक प्रोत्साहन', desc: 'Competitive fiscal incentives, subsidies, and land allotment', color: 'from-amber-500 to-orange-600' },
  { icon: BarChart3, title: 'Proven Track Record', titleHi: 'सिद्ध ट्रैक रिकॉर्ड', desc: 'Over ₹4.5 lakh crore in investment commitments', color: 'from-emerald-500 to-teal-600' },
  { icon: Globe, title: 'Strategic Location', titleHi: 'रणनीतिक स्थान', desc: 'Central India with connectivity to all major markets', color: 'from-purple-500 to-indigo-600' },
];

export default function LandingPage() {
  const { t, locale } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* ===== HERO WITH OFFICIAL BANNER ===== */}
        <section className="hero-gradient text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Headline & Action Controls */}
              <div className="lg:col-span-7 space-y-6 animate-fade-in">
                {/* Date badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.1] border border-white/[0.2] text-xs sm:text-sm text-white font-semibold backdrop-blur-md shadow-sm">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>24 & 25 February 2026</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Bhopal, Madhya Pradesh</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                  {t('landing', 'heroTitle')}
                </h1>
                
                <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
                  {t('landing', 'heroDescription')}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/register">
                    <Button size="xl" className="bg-accent hover:bg-accent-dark text-white shadow-xl shadow-accent/25 hover:shadow-accent/40 font-bold transition-all">
                      {t('landing', 'registerNow')}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/status">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-white/90 hover:text-white border border-white/30 hover:bg-white/[0.12] font-semibold"
                    >
                      {t('landing', 'trackStatus')}
                    </Button>
                  </Link>
                </div>

                {/* Trust bar */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-3">
                    {t('landing', 'organizedBy')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {['Government of Madhya Pradesh', 'MPIDC', 'Dept. of Industrial Policy'].map((org) => (
                      <div key={org} className="px-3.5 py-1.5 bg-white/10 border border-white/15 rounded-lg text-xs text-white font-medium backdrop-blur-md">
                        {org}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Official Summit Banner Card */}
              <div className="lg:col-span-5 animate-fade-in">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 bg-white group hover:scale-[1.01] transition-transform duration-300">
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src="/images/gis-banner.jpg"
                      alt="Invest Madhya Pradesh Global Investors Summit Official Banner"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-3 bg-gradient-to-r from-primary-900 to-primary-800 text-white flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Official Summit Banner 2026
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      Government of MP
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Angled cut */}
          <div className="relative h-12 -mb-px">
            <svg viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <path d="M0 64L1440 0V64H0Z" fill="var(--color-background)" />
            </svg>
          </div>
        </section>

        {/* ===== OFFICIAL SUMMIT BANNER HIGHLIGHT ===== */}
        <section className="py-10 bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl overflow-hidden border border-primary-200 bg-white shadow-lg p-2 sm:p-4">
              <div className="relative w-full rounded-xl overflow-hidden">
                <img
                  src="/images/gis-banner.jpg"
                  alt="Invest Madhya Pradesh Banner Showcase"
                  className="w-full h-auto max-h-[500px] object-contain mx-auto bg-slate-50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t('landing', 'keyStats')}
              </h2>
              <div className="section-accent" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 stagger-children">
              <StatCard icon={Building2} value={5000} label={t('landing', 'expectedInvestors')} suffix="+" color="bg-blue-50 text-blue-600" />
              <StatCard icon={Globe} value={30} label={t('landing', 'countriesRepresented')} suffix="+" color="bg-indigo-50 text-indigo-600" />
              <StatCard icon={TrendingUp} value={12} label={t('landing', 'sectorsOpen')} color="bg-emerald-50 text-emerald-600" />
              <StatCard icon={Users} value={450000} label={t('landing', 'previousInvestment')} suffix=" Cr" color="bg-amber-50 text-amber-700" />
            </div>
          </div>
        </section>

        {/* ===== WHY INVEST ===== */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t('landing', 'whyInvest')}
              </h2>
              <div className="section-accent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {HIGHLIGHTS.map((item, i) => (
                <div
                  key={i}
                  className="group flex gap-5 p-6 rounded-xl border border-border bg-white hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={cn(
                    'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow',
                    item.color
                  )}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1.5">
                      {locale === 'hi' ? item.titleHi : item.title}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTORS ===== */}
        <section className="py-16 lg:py-24 bg-background" id="sectors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
                {t('landing', 'sectors')}
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto mb-4">
                Explore investment opportunities across diverse high-growth sectors
              </p>
              <div className="section-accent" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
              {SECTORS.map((sector, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-xl border border-border p-6 text-center hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className={cn(
                    'w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300',
                    sector.color,
                    'group-hover:scale-110'
                  )}>
                    <sector.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">
                    {locale === 'hi' ? sector.nameHi : sector.name}
                  </h3>
                  <p className="text-xs text-foreground-muted leading-relaxed">{sector.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== EVENT INFO ===== */}
        <section className="py-16 lg:py-24 bg-white" id="agenda">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {t('landing', 'eventHighlights')}
                </h2>
                <div className="section-accent !mx-0 mb-8" />
                <div className="space-y-3">
                  {[
                    { icon: Calendar, label: 'Inaugural Session & Plenary', time: 'Day 1 · 9:00 AM' },
                    { icon: Users, label: 'Sector-specific Roundtables', time: 'Day 1 · 11:00 AM' },
                    { icon: Building2, label: 'B2G Meetings & MoU Signing', time: 'Day 1 · 2:00 PM' },
                    { icon: Globe, label: 'Country Sessions', time: 'Day 2 · 9:00 AM' },
                    { icon: TrendingUp, label: 'Startup Showcase & Pitch', time: 'Day 2 · 11:00 AM' },
                    { icon: Award, label: 'Valedictory & Commitments', time: 'Day 2 · 3:00 PM' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground-muted shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Venue card */}
              <div className="lg:sticky lg:top-24">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
                  <div className="hero-gradient p-8 sm:p-10 text-white relative">
                    <MapPin className="w-8 h-8 mb-5 text-amber-400" />
                    <h3 className="text-2xl font-bold mb-2">{t('landing', 'venue')}</h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">
                      Brilliant Convention Centre, Indore<br />
                      Madhya Pradesh, India
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                      <div>
                        <div className="text-3xl font-bold font-data">24–25</div>
                        <div className="text-xs text-white/50 mt-1">February 2026</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold font-data">2</div>
                        <div className="text-xs text-white/50 mt-1">Days of Summit</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-white flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{t('landing', 'registerNow')}</h4>
                      <p className="text-sm text-foreground-muted">Secure your spot at the summit</p>
                    </div>
                    <Link href="/register">
                      <Button className="bg-accent hover:bg-accent-dark text-white shadow-md">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="hero-gradient text-white relative overflow-hidden">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
              Ready to Invest in Madhya Pradesh?
            </h2>
            <p className="text-lg text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed">
              Register now to secure your participation. Early registration ensures priority meeting slots with government officials.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" className="bg-accent hover:bg-accent-dark text-white shadow-xl shadow-accent/25">
                  {t('landing', 'registerNow')}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/status">
                <Button variant="ghost" size="lg" className="text-white/80 border border-white/20 hover:bg-white/[0.08]">
                  {t('landing', 'trackStatus')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
