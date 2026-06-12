import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loadDb } from '@/lib/serverDb';
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from '@/lib/jwt';
import { addSecurityHeaders } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('ps_access_token')?.value;
    const refreshToken = cookieStore.get('ps_refresh_token')?.value;

    let payload = accessToken ? await verifyAccessToken(accessToken) : null;
    let newAccessTokenSet = false;
    let newAccessTokenVal = '';

    const db = loadDb();

    if (!payload && refreshToken) {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        // Validate from DB
        const activeTokenObj = db.refreshTokens.find(
          (rt) => rt.token === refreshToken && rt.userId === refreshPayload.userId && new Date(rt.expiresAt) > new Date()
        );

        if (activeTokenObj) {
          payload = refreshPayload;
          // Sign new access token
          newAccessTokenVal = await signAccessToken({
            userId: refreshPayload.userId,
            email: refreshPayload.email,
            role: refreshPayload.role
          });
          newAccessTokenSet = true;
        }
      }
    }

    if (!payload) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'کاربر احراز هویت نشده است.' }, { status: 401 })
      );
    }

    // Load full user info from DB
    const user = db.users.find((u) => u.id === payload.userId);
    if (!user || !user.isActive) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'کاربر یافت نشد یا حساب غیرفعال شده است.' }, { status: 401 })
      );
    }

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
      user: userSafeProfile,
    });

    if (newAccessTokenSet) {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = [
        'HttpOnly',
        'Path=/',
        'SameSite=Lax',
        isProduction ? 'Secure' : ''
      ].filter(Boolean).join('; ');
      res.headers.set('Set-Cookie', `ps_access_token=${newAccessTokenVal}; Max-Age=900; ${cookieOptions}`);
    }

    return addSecurityHeaders(res);
  } catch (err) {
    console.error('Error in me api route:', err);
    return addSecurityHeaders(
      NextResponse.json({ error: 'خطایی رخ داد.' }, { status: 500 })
    );
  }
}
