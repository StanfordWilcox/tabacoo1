import { NextRequest, NextResponse } from 'next/server';
import { loadDb } from '@/lib/serverDb';
import { verifyRefreshToken, signAccessToken } from '@/lib/jwt';
import { addSecurityHeaders } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const cookies = req.cookies;
    const refreshToken = cookies.get('ps_refresh_token')?.value;

    if (!refreshToken) {
      return addSecurityHeaders(NextResponse.json({ error: 'Refresh token is missing' }, { status: 400 }));
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return addSecurityHeaders(NextResponse.json({ error: 'Refresh token has expired or is invalid' }, { status: 401 }));
    }

    const db = loadDb();
    // Validate from DB
    const activeTokenObj = db.refreshTokens.find(
      (rt) => rt.token === refreshToken && rt.userId === payload.userId && new Date(rt.expiresAt) > new Date()
    );

    if (!activeTokenObj) {
      return addSecurityHeaders(NextResponse.json({ error: 'Refresh token has been revoked' }, { status: 401 }));
    }

    // Sign new access token
    const newAccessToken = await signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    const res = NextResponse.json({ success: true, message: 'Token refreshed successfully' });
    res.headers.set('Set-Cookie', `ps_access_token=${newAccessToken}; Max-Age=900; ${cookieOptions}`);

    return addSecurityHeaders(res);
  } catch (err) {
    console.error('Manual refresh failed:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'Refresh failed' }, { status: 500 }));
  }
}
