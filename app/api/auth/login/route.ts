import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { loadDb, saveDb, RefreshToken } from '@/lib/serverDb';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { rateLimiter, sanitizeInput, validateEmail, addSecurityHeaders } from '@/lib/security';

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const rateLimitResult = rateLimiter(req, 10, 60000); // Max 10 login attempts per minute
  if (rateLimitResult.isBlocked) {
    const res = NextResponse.json(
      { error: 'تعداد تلاش‌های ناموفق شما بیش از حد است. لطفاً کمی صبر کرده و سپس اقدام فرمایید.' },
      { status: 429 }
    );
    return addSecurityHeaders(res);
  }

  try {
    const body = await req.json();
    const sanitized = sanitizeInput(body);
    const { email, password } = sanitized;

    if (!email || !validateEmail(email)) {
      return addSecurityHeaders(NextResponse.json({ error: 'آدرس ایمیل نامعتبر است.' }, { status: 400 }));
    }
    if (!password) {
      return addSecurityHeaders(NextResponse.json({ error: 'وارد کردن رمز عبور الزامی است.' }, { status: 400 }));
    }

    const db = loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return addSecurityHeaders(NextResponse.json({ error: 'ایمیل یا رمز عبور اشتباه است.' }, { status: 401 }));
    }

    if (!user.isActive) {
      return addSecurityHeaders(NextResponse.json({ error: 'حساب کاربری شما غیرفعال شده است. با پشتیبانی تماس بگیرید.' }, { status: 403 }));
    }

    // Verify Password Hash
    const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      return addSecurityHeaders(NextResponse.json({ error: 'ایمیل یا رمز عبور اشتباه است.' }, { status: 401 }));
    }

    // Generate JWT access & refresh tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Save refresh token in database for safety
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const newRefreshToken: RefreshToken = {
      token: refreshToken,
      userId: user.id,
      expiresAt: expiresAt.toISOString()
    };

    // Remove obsolete refresh tokens for this user
    db.refreshTokens = db.refreshTokens.filter((rt) => rt.userId !== user.id && new Date(rt.expiresAt) > new Date());
    db.refreshTokens.push(newRefreshToken);
    saveDb(db);

    // Build Response and set Security Cookies
    const userSafeProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    const res = NextResponse.json({
      success: true,
      user: userSafeProfile
    });

    // Helper for secure cookie options
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    // Set Access Token (15 Min expiration - standard cookie max age 900)
    res.headers.append('Set-Cookie', `ps_access_token=${accessToken}; Max-Age=900; ${cookieOptions}`);
    
    // Set Refresh Token (7 Days expiration - standard cookie max age 604800)
    res.headers.append('Set-Cookie', `ps_refresh_token=${refreshToken}; Max-Age=604800; ${cookieOptions}`);

    return addSecurityHeaders(res);
  } catch (err) {
    console.error('Login failed:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی در ورود به سیستم رخ داد.' }, { status: 500 }));
  }
}
