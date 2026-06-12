import { NextRequest, NextResponse } from 'next/server';
import { loadDb, saveDb, Product } from '@/lib/serverDb';
import { checkAdminAuth, handleResponseCookies } from '@/lib/adminAuth';
import { sanitizeInput, addSecurityHeaders } from '@/lib/security';

// 1. GET - List all products for admin panel
export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authorized) {
    return addSecurityHeaders(auth.response);
  }

  const db = loadDb();
  const res = NextResponse.json({ success: true, products: db.products });
  return addSecurityHeaders(handleResponseCookies(res, auth));
}

// 2. POST - Create new product
export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authorized) {
    return addSecurityHeaders(auth.response);
  }

  try {
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);

    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      stock,
      images,
      categoryId,
      brand,
      weight,
      tags,
      isActive,
      isFeatured
    } = body;

    // Direct Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return addSecurityHeaders(NextResponse.json({ error: 'نام کالا الزامی است.' }, { status: 400 }));
    }
    if (!description || typeof description !== 'string') {
      return addSecurityHeaders(NextResponse.json({ error: 'توضیحات کالا الزامی است.' }, { status: 400 }));
    }
    if (typeof price !== 'number' || price <= 0) {
      return addSecurityHeaders(NextResponse.json({ error: 'قیمت کالا باید رقمی معتبر باشد.' }, { status: 400 }));
    }
    if (typeof stock !== 'number' || stock < 0) {
      return addSecurityHeaders(NextResponse.json({ error: 'موجودی انبار نمی‌تواند منفی باشد.' }, { status: 400 }));
    }
    if (!categoryId) {
      return addSecurityHeaders(NextResponse.json({ error: 'دسته بندی کالا الزامی است.' }, { status: 400 }));
    }

    const db = loadDb();
    
    // Auto-generate safe slug if empty or duplicate
    const finalSlug = slug ? slug.trim() : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF-]/g, '');

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      price,
      comparePrice: comparePrice || undefined,
      stock,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://picsum.photos/seed/default/600/600'],
      categoryId,
      brand: brand ? brand.trim() : 'متفرقه',
      weight: weight ? weight.trim() : 'نامشخص',
      tags: Array.isArray(tags) ? tags : [],
      isActive: isActive !== undefined ? !!isActive : true,
      isFeatured: isActive !== undefined ? !!isFeatured : false,
      createdAt: new Date().toISOString()
    };

    db.products.push(newProduct);
    saveDb(db);

    const res = NextResponse.json({ success: true, product: newProduct });
    return addSecurityHeaders(handleResponseCookies(res, auth));
  } catch (err) {
    console.error('Failed to create product:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی در ایجاد کالا رخ داد.' }, { status: 500 }));
  }
}

// 3. PUT - Update an existing product
export async function PUT(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authorized) {
    return addSecurityHeaders(auth.response);
  }

  try {
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { id, ...updates } = body;

    if (!id) {
      return addSecurityHeaders(NextResponse.json({ error: 'شناسه کالا ارسال نشده است.' }, { status: 400 }));
    }

    const db = loadDb();
    const productIndex = db.products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return addSecurityHeaders(NextResponse.json({ error: 'کالای مورد نظر یافت نشد.' }, { status: 404 }));
    }

    // Preserve immutable attributes and update others
    const currentProduct = db.products[productIndex];
    const updatedProduct: Product = {
      ...currentProduct,
      ...updates,
      id: currentProduct.id, // cannot change ID
      createdAt: currentProduct.createdAt // preserve creation date
    };

    db.products[productIndex] = updatedProduct;
    saveDb(db);

    const res = NextResponse.json({ success: true, product: updatedProduct });
    return addSecurityHeaders(handleResponseCookies(res, auth));
  } catch (err) {
    console.error('Failed to update product:', err);
    return addSecurityHeaders(NextResponse.json({ error: 'خطایی در بروزرسانی کالا رخ داد.' }, { status: 500 }));
  }
}

// 4. DELETE - Delete/Deactivate a product
export async function DELETE(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authorized) {
    return addSecurityHeaders(auth.response);
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return addSecurityHeaders(NextResponse.json({ error: 'شناسه کالا الزامی است.' }, { status: 400 }));
  }

  const db = loadDb();
  // Instead of deleting from index directly, we can filter or toggle isActive: false for references safety
  const productIndex = db.products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return addSecurityHeaders(NextResponse.json({ error: 'کالا یافت نشد.' }, { status: 404 }));
  }

  // Pure deletion as requested by CRUD Manage Products
  db.products.splice(productIndex, 1);
  saveDb(db);

  const res = NextResponse.json({ success: true, message: 'کالا با موفقیت حذف شد.' });
  return addSecurityHeaders(handleResponseCookies(res, auth));
}
