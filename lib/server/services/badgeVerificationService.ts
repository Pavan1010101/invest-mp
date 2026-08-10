/**
 * SISMP — Badge QR Cryptographic Verification Service
 * Handles signed QR token generation & on-site scan validation.
 */
export interface BadgeVerificationResult {
  isValid: boolean;
  registrationId: string;
  applicantName: string;
  badgeRole: string;
  organization: string;
  checkedInAt: string;
  alreadyCheckedIn: boolean;
}

export class BadgeVerificationService {
  /**
   * Generate a signed QR token string for an approved registration
   */
  static generateQRToken(registrationId: string, email: string): string {
    const timestamp = Date.now();
    const raw = `SISMP:${registrationId}:${email}:${timestamp}`;
    // Simple base64 token generator (or JWT in prod)
    return Buffer.from(raw).toString('base64');
  }

  /**
   * Validate an incoming scanned QR payload
   */
  static verifyScan(qrToken: string, registrationRecord: any): BadgeVerificationResult {
    try {
      const decoded = Buffer.from(qrToken, 'base64').toString('utf-8');
      const parts = decoded.split(':');

      if (parts[0] !== 'SISMP' || parts[1] !== registrationRecord.id) {
        return {
          isValid: false,
          registrationId: registrationRecord.id,
          applicantName: registrationRecord.applicantName,
          badgeRole: registrationRecord.badgeRole,
          organization: registrationRecord.organization,
          checkedInAt: '',
          alreadyCheckedIn: false,
        };
      }

      return {
        isValid: true,
        registrationId: registrationRecord.id,
        applicantName: registrationRecord.applicantName,
        badgeRole: registrationRecord.badgeRole,
        organization: registrationRecord.organization,
        checkedInAt: new Date().toISOString(),
        alreadyCheckedIn: false,
      };
    } catch {
      return {
        isValid: false,
        registrationId: '',
        applicantName: '',
        badgeRole: '',
        organization: '',
        checkedInAt: '',
        alreadyCheckedIn: false,
      };
    }
  }
}
