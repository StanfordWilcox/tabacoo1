import { NextRequest, NextResponse } from 'next/server';
import { loadDb, saveDb, Order, OrderItem } from '@/lib/serverDb';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, TokenPayload } from '@/lib/jwt';
import { sanitizeInput, addSecurityHeaders } from '@/lib/security';

// Helper to authenticate standard customer
async function authenticateCustomer(req: NextRequest): Promise<{ authorized: boolean; payload?: TokenPayload; newAccessToken?: string }> {
  const cookies = req.cookies;
  const accessToken = cookies.get('ps_access_token')?.value;
  const refreshToken = cookies.get('ps_refresh_token')?.value;

  let payload = accessToken ? await verifyAccessToken(accessToken) : null;
  let newAccessToken: string | undefined;

  if (!payload && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      const db = loadDb();
      const activeTokenObj = db.refreshTokens.find(
        (rt) => rt.token === refreshToken && rt.userId === refreshPayload.userId && new Date(rt.expiresAt) > new Date()
      );
      if (activeTokenObj) {
        payload = refreshPayload;
        newAccessToken = await signAccessToken({
          userId: refreshPayload.userId,
          email: refreshPayload.email,
          role: refreshPayload.role
        });
      }
    }
  }

  if (!payload) return { authorized: false };

  return { authorized: true, payload, newAccessToken };
}

// 1. GET - Fetch the customer's own orders
export async function GET(req: NextRequest) {
  const auth = await authenticateCustomer(req);
  if (!auth.authorized) {
    return addSecurityHeaders(NextResponse.json({ error: 'احراز هویت کاربر ناموفق بود.' }, { status: 401 }));
  }

  const db = loadDb();
  // Filter orders matching the logged-in customer's ID
  const userOrders = db.orders.filter((o) => o.userId === auth.payload!.userId);

  const res = NextResponse.json({ success: true, orders: userOrders });
  
  if (auth.newAccessToken) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');
    res.headers.set('Set-Cookie', `ps_access_token=${auth.newAccessToken}; Max-Age=900; ${cookieOptions}`);
  }

  return addSecurityHeaders(res);
}

// 2. POST - Create customer order
export async function POST(req: NextRequest) {
  const auth = await authenticateCustomer(req);
  if (!auth.authorized) {
    return addSecurityHeaders(NextResponse.json({ error: 'عضویت منقضی شده است. لطفا وارد حساب شوید.' }, { status: 401 }));
  }

  try {
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);

    const { items, shippingAddress, paymentMethod, couponCode, discountAmount, shippingCost, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return addSecurityHeaders(NextResponse.json({ error: 'سبد خرید خالی است.' }, { status: 400 }));
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return addSecurityHeaders(NextResponse.json({ error: 'اطلاعات گیرنده و آدرس ارسال نامعتبر است.' }, { status: 400 }));
    }

    const db = loadDb();

    // Verify stock availability and build checkout order snapshots
    const orderItems: OrderItem[] = [];
    for (const cartItem of items) {
      const product = db.products.find((p) => p.id === cartItem.productId);
      if (!product) {
        return addSecurityHeaders(NextResponse.json({ error: `کالایی با شناسه ${cartItem.productId} یافت نشد.` }, { status: 400 }));
      }
      if (product.stock < cartItem.quantity) {
        return addSecurityHeaders(NextResponse.json({ error: `موجودی ناکافی برای کالا: ${product.name}` }, { status: 400 }));
      }

      // Deduct stock in DB!
      product.stock -= cartItem.quantity;

      orderItems.push({
        id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
        productSnapshot: {
          id: product.id,
          name: product.name,
          price: product.price,
          categoryId: product.categoryId,
          brand: product.brand,
          weight: product.weight
        }
      });
    }

    const newOrder: Order = {
      id: `ORD-${1000 + db.orders.length + 1}`,
      userId: auth.payload!.userId,
      status: 'pending',
      totalAmount,
      shippingCost,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || undefined,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone || '',
        province: shippingAddress.province || '',
        city: shippingAddress.city || '',
        address: shippingAddress.address.trim(),
        postalCode: shippingAddress.postalCode || ''
      },
      paymentMethod: paymentMethod || 'درگاه مستقیم بانکی',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      items: orderItems
    };

    db.orders.push(newOrder);
    saveDb(db);

    const res = NextResponse.json({ success: true, order: newOrder });

    if (auth.newAccessToken) {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = [
        'HttpOnly',
        'Path=/',
        'SameSite=Lax',
        isProduction ? 'Secure' : ''
      ].filter(Boolean).join('; ');
      res.headers.set('Set-Cookie', `ps_access_token=${auth.newAccessToken}; Max-Age=900; ${cookieOptions}`);
    }

    return addSecurityHeaders(res);
  } catch (err) {
    console.error('Failed to create customer order:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی در ثبت نهایی سفارش رخ داد.' }, { status: 500 }));
  }
}
