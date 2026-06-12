'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useShop, Product } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ShopView from '@/components/ShopView';
import ProductDetailView from '@/components/ProductDetailView';
import CartView from '@/components/CartView';
import CheckoutView from '@/components/CheckoutView';
import DashboardView from '@/components/DashboardView';
import AuthView from '@/components/AuthView';
import { Star, ShieldAlert, Zap, Award, Sparkles, X, ChevronLeft, ArrowUp } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Page() {
  const { currentUser, products, categories, cart } = useShop();

  // Page Routing State
  const [activeView, setActiveView] = useState<'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'auth' | 'dashboard' | 'admin'>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');

  // Toast Notifications Stack
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Back to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll height
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}`;
    const newToast: Toast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    // Self-destruct toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check URL query parameters for errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      if (error === 'unauthorized_admin') {
        setTimeout(() => {
          addToast('شما دسترسی ورود به پنل مدیریت را ندارید. لطفاً با یک حساب مدیریت لاگین کنید.', 'error');
        }, 100);
        // Clean URL to prevent recurring toast on refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Route security gatekeeper
  const handleNavigate = (view: 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'auth' | 'dashboard' | 'admin', slug: string = '') => {
    if (slug) {
      setSelectedProductSlug(slug);
    }

    // Auth validation
    if (view === 'checkout' && !currentUser) {
      addToast('لطفاً جهت ثبت نهایی فاکتورهای سفارش ابتدا وارد حساب خود شوید.', 'info');
      setActiveView('auth');
      return;
    }

    if (view === 'dashboard' && !currentUser) {
      setActiveView('auth');
      return;
    }

    if (view === 'admin') {
      window.location.href = '/admin';
      return;
    }

    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter 4 featured products for landing homepage
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.isFeatured && p.isActive).slice(0, 4);
  }, [products]);

  // Handle scroll to top trigger
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Content based on active view block
  const renderViewContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="space-y-24 pb-20">
            {/* Landing Hero */}
            <Hero
              setScreen={(screen) => handleNavigate(screen as any)}
            />

            {/* Quick Category Quick Links Section */}
            <section className="max-w-7xl mx-auto px-4 md:px-12">
              <div className="text-center space-y-2 mb-12">
                <span className="text-[11px] text-[#C8860A] font-bold uppercase tracking-wider block">دسته‌بندی‌های مرجع غرفه</span>
                <h2 className="font-serif text-2xl md:text-3xl font-black text-[#F5E6C8]">کاوش در خانواده طعم‌ها</h2>
                <div className="w-12 h-0.5 bg-[#C8860A] mx-auto mt-3" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleNavigate('shop')}
                    className="group relative h-64 arabesque-border overflow-hidden sharp-border cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-black/55 group-hover:bg-black/35 transition-colors z-10" />
                    <img
                      src={cat.image}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-6 right-6 left-6 z-20 text-right space-y-1.5">
                      <h3 className="text-lg font-bold text-[#F5E6C8]">{cat.name}</h3>
                      <p className="text-2xs text-[#B8A07A] font-light line-clamp-1">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Product grid */}
            <section className="max-w-7xl mx-auto px-4 md:px-12">
              <div className="text-center space-y-2 mb-12">
                <span className="text-[11px] text-[#C8860A] font-bold uppercase tracking-wider block">سازماندهی برترین کالاها</span>
                <h2 className="font-serif text-2xl md:text-3xl font-black text-[#F5E6C8]">پیشنهادهای ویژه شاهانه</h2>
                <div className="w-12 h-0.5 bg-[#C8860A] mx-auto mt-3" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((p) => {
                  const discountPct = p.comparePrice
                    ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
                    : 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleNavigate('product-detail', p.slug)}
                      className="group bg-[#1A0A00] arabesque-border hover:border-[#C8860A] p-4 sharp-border cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(200,134,10,0.15)] flex flex-col justify-between"
                    >
                      <div className="relative h-48 bg-[#0E0600] border border-[#C8860A]/5 p-2 overflow-hidden flex items-center justify-center mb-4">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                        />
                        {discountPct > 0 && (
                          <span className="absolute top-2 right-2 bg-[#8B1A1A] text-[#F5E6C8] text-[9px] font-bold px-2 py-0.5 sharp-border font-sans">
                            {discountPct}٪ تخفیف
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-right">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-[#C8860A] font-semibold tracking-wider font-sans">{p.brand}</span>
                          <span className="text-[9px] text-[#B8A07A] font-light">{p.weight}</span>
                        </div>
                        <h3 className="font-bold text-xs text-[#F5E6C8] line-clamp-1 group-hover:text-[#C8860A] transition-colors">
                          {p.name}
                        </h3>
                        <div className="flex items-baseline justify-between pt-1 font-mono">
                          <span className="text-xs text-[#E8A820] font-sans font-black">
                            {p.price.toLocaleString()} تومان
                          </span>
                          {p.comparePrice && (
                            <span className="text-[10px] text-[#B8A07A]/40 line-through">
                              {p.comparePrice.toLocaleString()} ت
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quality Seals banner row */}
            <section className="bg-[#110800] border-y border-[#C8860A]/10 py-12">
              <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-xs text-[#B8A07A]">
                <div className="space-y-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#C8860A]/10 border border-[#C8860A]/35 text-[#C8860A] flex items-center justify-center mx-auto">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#F5E6C8]">پخت و آماده‌سازی دستی ممتاز</h4>
                  <p className="font-light pr-1 text-light leading-relaxed max-w-xs mx-auto">تمام طعم‌های ممتاز با حفظ رطوبت طبیعی اسانس‌ها بسته‌بندی شده‌اند.</p>
                </div>

                <div className="space-y-3.5 border-y md:border-y-0 md:border-x border-[#C8860A]/10 py-8 md:py-0">
                  <div className="w-10 h-10 rounded-full bg-[#C8860A]/10 border border-[#C8860A]/35 text-[#C8860A] flex items-center justify-center mx-auto">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#F5E6C8]">پست فشرده و غلیظ دفتری</h4>
                  <p className="font-light pr-1 text-light leading-relaxed max-w-xs mx-auto">تحویل ضربتی و فوق سریع کالا در مرکز تهران و شهرستان‌ها در بسته‌بندی محرمانه.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#C8860A]/10 border border-[#C8860A]/35 text-[#C8860A] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#F5E6C8]">تضمین اصالت طعم و بی بو بودن</h4>
                  <p className="font-light pr-1 text-light leading-relaxed max-w-xs mx-auto">بکاپ و ضمانت کامل عودت مبلغ فاکتور در صورت مغایرت طعم تنباکو.</p>
                </div>
              </div>
            </section>
          </div>
        );

      case 'shop':
        return (
          <ShopView
            onProductClick={(slug) => handleNavigate('product-detail', slug)}
            onAddToast={addToast}
          />
        );

      case 'product-detail':
        return (
          <ProductDetailView
            productSlug={selectedProductSlug}
            onBackToShop={() => handleNavigate('shop')}
            onProductClick={(slug) => handleNavigate('product-detail', slug)}
            onAddToast={addToast}
          />
        );

      case 'cart':
        return (
          <CartView
            onBackToShop={() => handleNavigate('shop')}
            onCheckout={() => handleNavigate('checkout')}
            onAddToast={addToast}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
          />
        );

      case 'checkout':
        return (
          <CheckoutView
            onBackToCart={() => handleNavigate('cart')}
            onOrderSuccess={(orderId) => handleNavigate('dashboard')}
            onAddToast={addToast}
            couponCode={couponCode}
          />
        );

      case 'auth':
        return (
          <AuthView
            onSuccess={() => {
              // Redirect to dashboard, or if coming from checkout, go back to checkout
              handleNavigate('dashboard');
            }}
            onAddToast={addToast}
          />
        );

      case 'dashboard':
        return (
          <DashboardView
            onBackToShop={() => handleNavigate('shop')}
            onAddToast={addToast}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div dir="rtl" className="bg-[#0F0800] min-h-screen text-[#F5E6C8] selection:bg-[#C8860A] selection:text-black flex flex-col justify-between">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentScreen={activeView}
        setScreen={(screen) => handleNavigate(screen as any)}
      />

      {/* 2. Main content viewports */}
      <main className="flex-grow">
        {renderViewContent()}
      </main>

      {/* 3. Global Footer block */}
      <Footer setScreen={(screen) => handleNavigate(screen as any)} />

      {/* Back to top float button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 p-2.5 bg-[#C8860A] text-[#0E0600] border border-[#C8860A]/40 shadow-xl hover:bg-[#E8A820] active:scale-95 transition-all text-xs z-50 sharp-border"
          title="بازگشت به قله تارک غرفه"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Global Toasts Stack */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50 max-w-sm w-full pointer-events-none text-right">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3.5 shadow-2xl border pointer-events-auto flex items-start justify-between gap-3 sharp-border transition-all duration-300 animate-slide-in text-xs ${
              t.type === 'error'
                ? 'bg-red-950/95 text-red-300 border-red-500/35'
                : t.type === 'info'
                ? 'bg-[#1C0E00] text-amber-300 border-amber-500/20'
                : 'bg-[#1C0E00]/95 text-[#F5E6C8] border-[#C8860A]/45 shadow-[#C8860A]/5'
            }`}
          >
            <div className="flex-grow leading-relaxed font-semibold">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="opacity-60 hover:opacity-100 transition-opacity p-0.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
