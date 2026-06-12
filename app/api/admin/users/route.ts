import { NextRequest, NextResponse } from 'next/server';
import { loadDb, saveDb, User } from '@/lib/serverDb';
import { checkAdminAuth, handleResponseCookies } from '@/lib/adminAuth';
import { sanitizeInput, addSecurityHeaders } from '@/lib/security';

// GET - List all users (excluding password hashes)
export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authorized) {
    return addSecurityHeaders(auth.response);
  }

  const db = loadDb();
  const safeUsers = db.users.map(({ passwordHash, ...user }) => user);

  const res = NextResponse.json({ success: true, users: safeUsers });
  return addSecurityHeaders(handleResponseCookies(res, auth));
}

// PUT - Update user role or status (block / unblock)
export async function PUT(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authorized) {
    return addSecurityHeaders(auth.response);
  }

  try {
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);

    const { id, role, isActive } = body;

    if (!id) {
      return addSecurityHeaders(NextResponse.json({ error: 'شناسه کاربر الزامی است.' }, { status: 400 }));
    }

    const db = loadDb();
    const userIndex = db.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return addSecurityHeaders(NextResponse.json({ error: 'کاربر مورد نظر یافت نشد.' }, { status: 404 }));
    }

    // Safety: prevent admin from disabling themself
    if (db.users[userIndex].id === auth.user.id) {
      if (isActive === false) {
        return addSecurityHeaders(NextResponse.json({ error: 'شما نمی‌توانید حساب کاربری مدیر فعال خودتان را غیرفعال کنید!' }, { status: 400 }));
      }
      if (role === 'customer') {
        return addSecurityHeaders(NextResponse.json({ error: 'شما نمی‌توانید نقش مدیریت خودتان را تنزل دهید!' }, { status: 400 }));
      }
    }

    const currentUser = db.users[userIndex];

    const updatedUser: User = {
      ...currentUser,
      role: role === 'admin' || role === 'customer' ? role : currentUser.role,
      isActive: isActive !== undefined ? !!isActive : currentUser.isActive
    };

    db.users[userIndex] = updatedUser;
    saveDb(db);

    const { passwordHash, ...safeProfile } = updatedUser;

    const res = NextResponse.json({ success: true, user: safeProfile });
    return addSecurityHeaders(handleResponseCookies(res, auth));
  } catch (err) {
    console.error('Failed to update user:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی در ثبت تغییرات کاربر رخ داد.' }, { status: 500 }));
  }
}
