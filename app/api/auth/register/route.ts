import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { loadDb, saveDb, User } from '@/lib/serverDb';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { rateLimiter, sanitizeInput, validateEmail, addSecurityHeaders } from '@/lib/security';

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const rateLimitResult = rateLimiter(req, 10, 60000); // Max 10 register attempts per minute
  if (rateLimitResult.isBlocked) {
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً یک دقیقه دیگر تلاش کنید.' },
        { status: 429 }
      )
    );
  }

  try {
    const body = await req.json();
    const sanitized = sanitizeInput(body);
    const { name, email, phone, password } = sanitized;

    if (!name || name.trim() === '') {
      return addSecurityHeaders(NextResponse.json({ error: 'وارد کردن نام الزامی است.' }, { status: 400 }));
    }
    if (!email || !validateEmail(email)) {
      return addSecurityHeaders(NextResponse.json({ error: 'آدرس ایمیل نامعتبر است.' }, { status: 400 }));
    }
    if (!phone || phone.trim() === '') {
      return addSecurityHeaders(NextResponse.json({ error: 'وارد کردن شماره همراه الزامی است.' }, { status: 400 }));
    }
    if (!password || password.length < 6) {
      return addSecurityHeaders(NextResponse.json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' }, { status: 400 }));
    }

    const db = loadDb();
    
    // Check if user already exists
    const emailExists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return addSecurityHeaders(NextResponse.json({ error: 'کاربری با این ایمیل پیش‌تر ثبت‌نام کرده است.' }, { status: 409 }));
    }

    // 4. Strong Password Hashing
    const passwordHash = bcrypt.hashSync(password, 10);

    // 5. Structure New Customer User
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'customer' as const,
      isActive: true,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    // 6. Generate secure Tokens
    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Keep active refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    db.refreshTokens.push({
      token: refreshToken,
      userId: newUser.id,
      expiresAt: expiresAt.toISOString()
    });

    saveDb(db);

    const userSafeProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    const res = NextResponse.json({
      success: true,
      user: userSafeProfile,
      accessToken
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    // Set Access Token (15 Min expiration)
    res.headers.append('Set-Cookie', `ps_access_token=${accessToken}; Max-Age=900; ${cookieOptions}`);
    
    // Set Refresh Token (7 Days expiration)
    res.headers.append('Set-Cookie', `ps_refresh_token=${refreshToken}; Max-Age=604800; ${cookieOptions}`);

    return addSecurityHeaders(res);
  } catch (err: any) {
    console.error('Registration failed:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی در سامانه ثبت نام رخ داد. لطفاً مجدداً تلاش کنید.' }, { status: 500 }));
  }
}
