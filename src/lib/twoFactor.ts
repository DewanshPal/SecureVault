import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate a new 2FA secret for a user
 */
export function generate2FASecret(userEmail: string, appName: string = 'SecureVault') {
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: appName,
    length: 32
  });

  if (!secret.base32 || !secret.otpauth_url) {
    throw new Error('Failed to generate 2FA secret');
  }

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url
  };
}

/**
 * Generate QR code data URL for 2FA setup
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTOTP(token: string, secret: string, window: number = 1): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window // Allow some time drift
  });
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Hash backup codes for secure storage
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Verify a backup code against stored hash
 */
export function verifyBackupCode(code: string, hash: string): boolean {
  const codeHash = hashBackupCode(code);
  return crypto.timingSafeEqual(Buffer.from(codeHash), Buffer.from(hash));
}

/**
 * Format backup codes for display (groups of 4 characters)
 */
export function formatBackupCode(code: string): string {
  return code.match(/.{1,4}/g)?.join('-') || code;
}
