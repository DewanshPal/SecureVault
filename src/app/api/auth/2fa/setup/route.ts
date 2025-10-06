import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/model/vault.model';
import { getAuthenticatedUser } from '@/lib/middleware';
import { generate2FASecret, generateQRCode, generateBackupCodes, hashBackupCode } from '@/lib/twoFactor';

// POST - Setup 2FA for user
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userDoc = await User.findById(user.userId);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new 2FA secret
    const { secret, qrCodeUrl } = generate2FASecret(userDoc.email);
    
    if (!qrCodeUrl) {
      return NextResponse.json(
        { error: 'Failed to generate QR code URL' },
        { status: 500 }
      );
    }
    
    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(qrCodeUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(code => ({
      code: hashBackupCode(code),
      used: false
    }));

    // Save the secret and backup codes (but don't enable 2FA yet)
    userDoc.twoFactorSecret = secret;
    userDoc.backupCodes = hashedBackupCodes;
    await userDoc.save();

    return NextResponse.json({
      secret,
      qrCode: qrCodeDataUrl,
      backupCodes, // Return plain text codes for user to save
      manualEntryKey: secret
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
