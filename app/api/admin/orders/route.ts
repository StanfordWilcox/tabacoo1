import { NextRequest, NextResponse } from 'next/server';
import { loadDb, saveDb, Order } from '@/lib/serverDb';
import { checkAdminAuth, handleResponseCookies } from '@/lib/adminAuth';
import { sanitizeInput, addSecurityHeaders } from '@/lib/security';

// GET - Retrieve all orders for management
export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authorized) {
    return addSecurityHeaders(auth.response);
  }

  const db = loadDb();
  const res = NextResponse.json({ success: true, orders: db.orders });
  return addSecurityHeaders(handleResponseCookies(res, auth));
}

// PUT - Update order status or details
export async function PUT(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authorized) {
    return addSecurityHeaders(auth.response);
  }

  try {
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);

    const { id, status, paymentStatus, trackingCode } = body;

    if (!id) {
      return addSecurityHeaders(NextResponse.json({ error: 'شناسه سفارش الزامی است.' }, { status: 400 }));
    }

    const db = loadDb();
    const orderIndex = db.orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return addSecurityHeaders(NextResponse.json({ error: 'سفارش مورد نظر یافت نشد.' }, { status: 404 }));
    }

    const currentOrder = db.orders[orderIndex];

    // Validate states
    if (status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return addSecurityHeaders(NextResponse.json({ error: 'وضعیت سفارش نامعتبر است.' }, { status: 400 }));
    }
    if (paymentStatus && !['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return addSecurityHeaders(NextResponse.json({ error: 'وضعیت پرداخت نامعتبر است.' }, { status: 400 }));
    }

    const updatedOrder: Order = {
      ...currentOrder,
      status: status || currentOrder.status,
      paymentStatus: paymentStatus || currentOrder.paymentStatus,
      trackingCode: trackingCode !== undefined ? trackingCode : currentOrder.trackingCode
    };

    db.orders[orderIndex] = updatedOrder;
    saveDb(db);

    const res = NextResponse.json({ success: true, order: updatedOrder });
    return addSecurityHeaders(handleResponseCookies(res, auth));
  } catch (err) {
    console.error('Failed to update order status:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی در ثبت تغییرات سفارش رخ داد.' }, { status: 500 }));
  }
}
