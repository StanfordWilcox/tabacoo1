'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, Menu, X, Shield, User, Heart } from 'lucide-react';
import { useShop } from '@/lib/store';

interface NavbarProps {
  currentScreen: string;
  setScreen: (screen: string) => void;
  setShopFilters?: (filters: { categoryId?: string; search?: string }) => void;
}

export default function Navbar({ currentScreen, setScreen, setShopFilters }: NavbarProps) {
  const { cart, currentUser, logout, settings } = useShop();
  const [promoOpen, setPromoOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleNavClick = (screen: string, categoryId?: string) => {
    setScreen(screen);
    setMobileMenuOpen(false);
    if (screen === 'shop' && setShopFilters) {
      setShopFilters({ categoryId });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* 1. Promo Banner */}
      {promoOpen && (
        <div id="promo-banner" className="bg-[#8B1A1A] text-white text-xs font-bold px-4 py-2 flex items-center justify-between transition-all duration-300">
          <div className="flex-1 text-center font-sans tracking-wide">
            🔥 ارسال رایگان برای خریدهای بالای {settings.freeShippingThreshold.toLocaleString()} تومان در سراسر کشور!
          </div>
          <button
            onClick={() => setPromoOpen(false)}
            className="p-1 hover:opacity-80 transition-opacity"
            title="بستن بنر تبلیغاتی"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Navbar */}
      <nav id="main-nav" className="backdrop-blur-md bg-[#0E0600]/80 border-b border-[#C8860A]/15 px-4 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <span className="font-serif text-xl md:text-2xl font-bold text-[#C8860A] tracking-tight">
              دخانیات پارسی
            </span>
            <span className="hidden sm:inline font-serif text-sm md:text-base text-[#B8A07A] italic opacity-85">
              | Persian Smoke
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#F5E6C8]">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-[#C8860A] transition-colors py-1 ${
                currentScreen === 'home' ? 'border-b-2 border-[#C8860A] text-[#C8860A]' : ''
              }`}
            >
              خانه
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className={`hover:text-[#C8860A] transition-colors py-1 ${
                currentScreen === 'shop' ? 'border-b-2 border-[#C8860A] text-[#C8860A]' : ''
              }`}
            >
              فروشگاه
            </button>
            <button
              onClick={() => handleNavClick('shop', 'cat-1')}
              className="hover:text-[#C8860A] transition-colors py-1"
            >
              تنباکو
            </button>
            <button
              onClick={() => handleNavClick('shop', 'cat-2')}
              className="hover:text-[#C8860A] transition-colors py-1"
            >
              زغال طبیعی
            </button>
            <button
              onClick={() => handleNavClick('shop', 'cat-3')}
              className="hover:text-[#C8860A] transition-colors py-1"
            >
              اکسسوری قلیان
            </button>
            <a href="#about-section" className="hover:text-[#C8860A] transition-colors py-1">
              درباره ما
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* User Account / Login */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 text-xs font-semibold border border-[#C8860A]/15 bg-[#1A0A00] hover:border-[#C8860A]/40 px-3 py-1.5 text-[#F5E6C8] sharp-border transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-[#C8860A]" />
                    <span>{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-[#B8A07A]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-[#1A0A00] border border-[#C8860A]/30 shadow-2xl p-2 z-50 text-right text-xs sharp-border">
                      <button
                        onClick={() => {
                          setScreen('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 hover:bg-[#C8860A]/10 text-[#F5E6C8] block transition-colors"
                      >
                        داشبورد سفارشات
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          setScreen('home');
                        }}
                        className="w-full text-right px-3 py-2 text-red-400 hover:bg-red-900/15 block transition-colors border-t border-[#C8860A]/10"
                      >
                        خروج از حساب دفتری
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setScreen('auth')}
                  className="flex items-center gap-1.5 text-xs font-semibold hover:text-[#C8860A] text-[#F5E6C8] transition-colors px-1"
                >
                  <User className="w-4 h-4 text-[#C8860A]" />
                  <span className="hidden sm:inline">ورود / ثبت‌نام</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setScreen('cart')}
              className="flex items-center gap-2 bg-[#C8860A] text-[#0E0600] font-bold px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm shadow-[0_0_15px_rgba(200,134,10,0.3)] hover:bg-[#E8A820] transition-colors sharp-border active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>سبد خرید</span>
              <span className="bg-[#0E0600] text-[#C8860A] text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-sans font-bold">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 border border-[#C8860A]/20 text-[#F5E6C8] hover:text-[#C8860A] hover:border-[#C8860A] transition-all sharp-border"
              title="منوی موبایل"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-[#C8860A]/15 flex flex-col gap-3 text-sm text-[#F5E6C8] bg-[#0E0600]">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-right py-2 px-3 hover:bg-[#C8860A]/10 transition-all sharp-border ${
                currentScreen === 'home' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : ''
              }`}
            >
              خانه
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className={`text-right py-2 px-3 hover:bg-[#C8860A]/10 transition-all sharp-border ${
                currentScreen === 'shop' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : ''
              }`}
            >
              فروشگاه محصولات
            </button>
            <button
              onClick={() => handleNavClick('shop', 'cat-1')}
              className="text-right py-2 px-3 hover:bg-[#C8860A]/10 transition-all sharp-border text-[#B8A07A]"
            >
              ─ تنباکو میوه‌ای دوسیب و سنتی
            </button>
            <button
              onClick={() => handleNavClick('shop', 'cat-2')}
              className="text-right py-2 px-3 hover:bg-[#C8860A]/10 transition-all sharp-border text-[#B8A07A]"
            >
              ─ زغال طبیعی قلمی و کوبا
            </button>
            <button
              onClick={() => handleNavClick('shop', 'cat-3')}
              className="text-right py-2 px-3 hover:bg-[#C8860A]/10 transition-all sharp-border text-[#B8A07A]"
            >
              ─ شلنگ و لوازم لوکس قلیان
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
