import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loadDb, saveDb } from '@/lib/serverDb';
import { addSecurityHeaders } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('ps_refresh_token')?.value;

    if (refreshToken) {
      const db = loadDb();
      db.refreshTokens = db.refreshTokens.filter((rt) => rt.token !== refreshToken);
      saveDb(db);
    }

    // Clear the JWT cookies by setting maxAge to 0
    cookieStore.set('ps_access_token', '', { maxAge: 0, path: '/' });
    cookieStore.set('ps_refresh_token', '', { maxAge: 0, path: '/' });

    const res = NextResponse.json({ success: true, message: 'خروج با موفقیت انجام شد.' });
    return addSecurityHeaders(res);
  } catch (err) {
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی در جریان خروج رخ داد.' }, { status: 500 }));
  }
}
