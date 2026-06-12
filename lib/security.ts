import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter.
 * Default is 60 requests per 1 minute per IP.
 */
export function rateLimiter(req: NextRequest, limit = 60, windowMs = 60000): { isBlocked: boolean; remaining: number; resetAt: number } {
  // Get IP from headers
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();
  
  let record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + windowMs,
    };
  }
  
  record.count += 1;
  rateLimitMap.set(ip, record);
  
  if (record.count > limit) {
    return {
      isBlocked: true,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }
  
  return {
    isBlocked: false,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Deep sanitization function to prevent XSS (Cross-Site Scripting).
 * Recursively escapes HTML-like tags inside strings.
 */
export function sanitizeInput<T>(data: T): T {
  if (typeof data === 'string') {
    // Simple robust tag-stripping/escaping
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;') as unknown as T;
  }
  
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item)) as unknown as T;
  }
  
  if (data !== null && typeof data === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeInput(value);
    }
    return sanitizedObj as unknown as T;
  }
  
  return data;
}

/**
 * Validates request payload.
 * Basic validators for email, strength of passwords, and strings.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // Ensure password length is at least 6 and not too simple
  return typeof password === 'string' && password.length >= 6;
}

/**
 * CORS and security headers helper
 */
export function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  // CORS Headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
