import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/model/vault.model';
import { getAuthenticatedUser } from '@/lib/middleware';
import { verifyTOTP} from '@/lib/twoFactor';

// POST - Verify and enable 2FA
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const userDoc = await User.findById(user.userId);
    if (!userDoc || !userDoc.twoFactorSecret) {
      return NextResponse.json(
        { error: 'User not found or 2FA not set up' },
        { status: 404 }
      );
    }

    // Verify the TOTP token
    const isValid = verifyTOTP(token, userDoc.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Enable 2FA
    userDoc.twoFactorEnabled = true;
    await userDoc.save();

    return NextResponse.json({
      message: '2FA enabled successfully'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required to disable 2FA' },
        { status: 400 }
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

    if (!userDoc.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify the TOTP token before disabling
    const isValid = verifyTOTP(token, userDoc.twoFactorSecret!);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Disable 2FA and clear secret
    userDoc.twoFactorEnabled = false;
    userDoc.twoFactorSecret = null;
    userDoc.backupCodes = [];
    await userDoc.save();

    return NextResponse.json({
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
