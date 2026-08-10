/**
 * SISMP — Badge QR Code Component
 * Generates real, scannable QR codes using qrcode.react for event badge passes.
 * Encodes registration ID, name, organization, and role into a structured JSON payload.
 */
'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface BadgeQRCodeProps {
  registrationId: string;
  applicantName: string;
  organization: string;
  badgeRole: string;
  /** Width/height in pixels (default 200) */
  size?: number;
  /** Primary color for QR dots */
  colorDark?: string;
  /** Background color */
  colorLight?: string;
}

export function BadgeQRCode({
  registrationId,
  applicantName,
  organization,
  badgeRole,
  size = 200,
  colorDark = '#0F172A',
  colorLight = '#FFFFFF',
}: BadgeQRCodeProps) {
  // Build structured payload for scanning
  const qrPayload = JSON.stringify({
    event: 'INVEST-MP-2026',
    id: registrationId,
    name: applicantName,
    org: organization,
    role: badgeRole,
    ts: new Date().toISOString(),
  });

  return (
    <div
      className="flex flex-col items-center justify-center gap-2"
      aria-label={`QR Code for ${applicantName} (${registrationId})`}
      role="img"
    >
      <QRCodeSVG
        value={qrPayload}
        size={size}
        bgColor={colorLight}
        fgColor={colorDark}
        level="M"
        marginSize={2}
      />
      <span
        className="text-[11px] font-mono text-slate-500 font-semibold tracking-wide"
      >
        {registrationId}
      </span>
    </div>
  );
}
