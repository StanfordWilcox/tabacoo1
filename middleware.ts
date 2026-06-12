import { NextResponse, NextRequest } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from './lib/jwt';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // Protect Admin API paths ONLY
  if (pathname.startsWith('/api/admin')) {
    const accessToken = req.cookies.get('ps_access_token')?.value;
    const refreshToken = req.cookies.get('ps_refresh_token')?.value;

    let payload = accessToken ? await verifyAccessToken(accessToken) : null;

    if (!payload && refreshToken) {
      payload = await verifyRefreshToken(refreshToken);
    }

    if (!payload) {
      return NextResponse.json(
        { error: 'احراز هویت غیرمجاز است. لطفا وارد شوید.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'دسترسی محدود شده است. شما مدیر نیستید.' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: ['/api/admin/:path*'],
};
