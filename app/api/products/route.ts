import { NextRequest, NextResponse } from 'next/server';
import { loadDb } from '@/lib/serverDb';
import { addSecurityHeaders } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const db = loadDb();
    
    // Only return active items for public safety!
    const activeProducts = db.products.filter((p) => p.isActive);
    const activeCategories = db.categories.filter((c) => c.isActive);

    const res = NextResponse.json({
      success: true,
      products: activeProducts,
      categories: activeCategories
    });

    return addSecurityHeaders(res);
  } catch (err) {
    console.error('Failed to load public feeds:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی رخ داد' }, { status: 500 }));
  }
}
