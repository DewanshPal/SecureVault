import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/model/vault.model';
import { verifyPassword, signToken } from '@/lib/auth';
import { verifyTOTP, verifyBackupCode } from '@/lib/twoFactor';

export async function POST(request: NextRequest) {
  try {
    const { email, password, twoFactorToken, backupCode } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    

    // Connect to database
    await dbConnect();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // If 2FA is enabled but no token provided, request 2FA
      if (!twoFactorToken && !backupCode) {
        return NextResponse.json({
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        }, { status: 200 });
      }

      let isValid2FA = false;

      // Check backup code first
      if (backupCode) {
        const backupCodeIndex = user.backupCodes.findIndex((bc: any) => 
          !bc.used && verifyBackupCode(backupCode, bc.code)
        );
        
        if (backupCodeIndex !== -1) {
          // Mark backup code as used
          user.backupCodes[backupCodeIndex].used = true;
          await user.save();
          isValid2FA = true;
        }
      } 
      // Check TOTP token
      else if (twoFactorToken) {
        isValid2FA = verifyTOTP(twoFactorToken, user.twoFactorSecret);
      }

      if (!isValid2FA) {
        return NextResponse.json(
          { error: 'Invalid two-factor authentication code' },
          { status: 401 }
        );
      }
    }

    // Generate JWT token
    const token = signToken({ 
      userId: user._id, 
      email: user.email 
    });

    // Return success response
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
