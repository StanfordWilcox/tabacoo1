import { NextRequest, NextResponse } from 'next/server';
import { loadDb, User } from '@/lib/serverDb';
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from '@/lib/jwt';

interface AuthSuccess {
  authorized: true;
  user: User;
  newAccessToken?: string;
}

interface AuthFailure {
  authorized: false;
  response: NextResponse;
}

export type AdminAuthResult = AuthSuccess | AuthFailure;

/**
 * Robust helper to authenticate and authorize a Store Manager (Admin).
 * Supports token refreshing in-flight to prevent management session timeouts!
 */
export async function checkAdminAuth(req: NextRequest): Promise<AdminAuthResult> {
  const cookies = req.cookies;
  const accessToken = cookies.get('ps_access_token')?.value;
  const refreshToken = cookies.get('ps_refresh_token')?.value;

  let payload = accessToken ? await verifyAccessToken(accessToken) : null;
  let newAccessToken: string | undefined;

  // If access token is stale/expired, check refresh token
  if (!payload && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      const db = loadDb();
      // Ensure refresh token exists in DB and is not revoked
      const activeTokenObj = db.refreshTokens.find(
        (rt) => rt.token === refreshToken && rt.userId === refreshPayload.userId && new Date(rt.expiresAt) > new Date()
      );

      if (activeTokenObj) {
        payload = refreshPayload;
        // Auto-refresh access token on the fly
        newAccessToken = await signAccessToken({
          userId: refreshPayload.userId,
          email: refreshPayload.email,
          role: refreshPayload.role
        });
      }
    }
  }

  if (!payload) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'کاربر احراز هویت نشده است. لطفا وارد حساب خود شوید.' }, { status: 401 })
    };
  }

  // Ensure role is admin
  if (payload.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'شما دسترسی غیراصلی مأمور دفتری ندارید.' }, { status: 403 })
    };
  }

  // Load latest database profile
  const db = loadDb();
  const user = db.users.find((u) => u.id === payload.userId);

  if (!user || !user.isActive || user.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'حساب دفتری غیرفعال است یا دسترسی سلب شده است.' }, { status: 403 })
    };
  }

  return {
    authorized: true,
    user,
    newAccessToken
  };
}

/**
 * Appends token set cookies to the response if refreshed on the fly
 */
export function handleResponseCookies(res: NextResponse, authResult: AdminAuthResult) {
  if (authResult.authorized && authResult.newAccessToken) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.headers.set('Set-Cookie', `ps_access_token=${authResult.newAccessToken}; Max-Age=900; ${cookieOptions}`);
  }
  return res;
}
