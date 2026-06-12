'use client';

import React from 'react';
import Mandala from './Mandala';
import Smoke from './Smoke';

interface HeroProps {
  setScreen: (screen: string) => void;
  setShopFilters?: (filters: { categoryId?: string }) => void;
}

export default function Hero({ setScreen, setShopFilters }: HeroProps) {
  const handleCtaClick = (categoryId?: string) => {
    setScreen('shop');
    if (setShopFilters && categoryId) {
      setShopFilters({ categoryId });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen bg-[#0E0600] flex flex-col justify-center items-center overflow-hidden px-4 pt-24 pb-12">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial-[circle_at_center] from-[#8B1A1A]/12 via-transparent to-transparent opacity-90 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-[circle_at_bottom_right] from-[#C8860A]/6 via-transparent to-transparent opacity-80 z-0 pointer-events-none" />

      {/* Arabesque Corner Borders */}
      <div className="absolute top-8 right-8 w-24 h-24 border-t border-r border-[#C8860A]/20 pointer-events-none z-10" />
      <div className="absolute top-8 left-8 w-24 h-24 border-t border-l border-[#C8860A]/20 pointer-events-none z-10" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-b border-r border-[#C8860A]/20 pointer-events-none z-10" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-b border-l border-[#C8860A]/20 pointer-events-none z-10" />

      {/* Rotating Mandala Background Component */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Mandala />
      </div>

      {/* Smoke Wisps Layer */}
      <Smoke className="z-10" />

      {/* Content Grid / Container */}
      <div className="relative max-w-4xl mx-auto text-center z-20 space-y-6">
        
        {/* Eyebrow Label */}
        <span className="inline-block arabesque-border px-4 py-1.5 bg-[#1A0A00] text-[#C8860A] text-2xs md:text-xs font-semibold tracking-widest uppercase sharp-border">
          ✨ تجربه‌ای اصیل و لوکس از هنر تدخین در قلب ایران زمین
        </span>

        {/* Playfair Display Title */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-[#F5E6C8] select-all leading-tight">
          Persian Smoke
        </h1>

        {/* Persian Subtitle */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#C8860A] tracking-wider font-sans">
          دخانیات شاهانه پارسی
        </h2>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-[#B8A07A] leading-relaxed font-light">
          مجموعه‌ای از برترین تنباکوهای دستچین و زغال‌های درجه یک لیمو با سوخت طولانی و بدون بو، برای کسانی که به جزئیات اهمیت می‌دهند.
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-30">
          <button
            onClick={() => handleCtaClick()}
            className="w-full sm:w-auto bg-[#C8860A] text-[#0E0600] text-sm font-black tracking-wider px-10 py-4 hover:bg-[#E8A820] active:scale-95 transition-all sharp-border shadow-[0_0_15px_rgba(200,134,10,0.3)] cursor-pointer"
          >
            مشاهده محصولات
          </button>
          
          <button
            onClick={() => handleCtaClick('cat-2')}
            className="w-full sm:w-auto border border-[#C8860A] text-[#C8860A] text-sm font-black tracking-wider px-10 py-4 hover:bg-[rgba(200,134,10,0.1)] transition-all sharp-border cursor-pointer"
          >
            درباره برند ما
          </button>
        </div>
      </div>

      {/* Bottom Marquee Scrolling strip */}
      <div className="absolute bottom-0 left-0 right-0 py-3 bg-[#C8860A] overflow-hidden z-20 flex items-center shadow-inner select-none uppercase text-2xs md:text-xs font-black tracking-widest text-[#0E0600]">
        <div className="animate-marquee whitespace-nowrap flex gap-8 items-center min-w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex gap-8 items-center">
              <span>● دخانیات پارسی</span>
              <span>● PERSIAN SMOKE</span>
              <span>● تنباکو دوسیب شلاقی</span>
              <span>● زغال لیمو جهرم</span>
              <span>● الخوانکی لایف‌تایم</span>
              <span>● پوست نارگیل فشرده مکعبی</span>
              <span>● النخلة لوکس</span>
              <span>● سری سفالی عتیقه شاه‌عباسی</span>
              <span>● ارسال اکسپرس رایگان</span>
            </span>
          ))}
        </div>
      </div>

      {/* Marquee Keyframes Inline style */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </section>
  );
}
