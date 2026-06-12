'use client';

import React from 'react';
import { useShop } from '@/lib/store';
import { Send, Phone, MapPin, Mail, Instagram, MessageSquare } from 'lucide-react';

interface FooterProps {
  setScreen: (screen: string) => void;
}

export default function Footer({ setScreen }: FooterProps) {
  const { settings } = useShop();

  return (
    <footer id="footer" className="bg-[#090400] border-t border-[#C8860A]/15 text-[#B8A07A] pt-16 pb-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#C8860A]">دخانیات پارسی</span>
            <span className="text-xs italic text-[#B8A07A] opacity-70">| Persian Smoke</span>
          </div>
          <p className="text-xs leading-relaxed text-[#B8A07A]/80 font-light text-justify">
            دخانیات پارسی ارائه‌دهنده مرغوب‌ترین طعم‌های تنباکو میوه‌ای، زغال‌های طبیعی قلمی جهرم و نارگیل فشرده صادراتی و باکیفیت‌ترین شلنگ‌ها و ابزارهای تزیینی قلیان در سراسر ایران با نشان اصالت و طعم قوی.
          </p>
          <div className="flex items-center gap-3 pt-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 border border-[#C8860A]/20 hover:border-[#C8860A] hover:bg-[#C8860A]/10 text-[#C8860A] hover:text-[#E8A820] transition-all sharp-border"
              title="صفحه اینستاگرام ما"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="p-2 border border-[#C8860A]/20 hover:border-[#C8860A] hover:bg-[#C8860A]/10 text-[#C8860A] hover:text-[#E8A820] transition-all sharp-border"
              title="کانال تلگرام ما"
            >
              <Send className="w-4 h-4" />
            </a>
            <button
              onClick={() => setScreen('admin')}
              className="p-2 border border-[#C8860A]/20 hover:border-[#C8860A] hover:bg-[#C8860A]/10 text-[#C8860A] hover:text-[#E8A820] transition-all sharp-border text-[10px]"
              title="پنل اداری"
            >
              مدیر
            </button>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3">دسترسی سریع</h4>
          <ul className="space-y-2 text-xs flex flex-col items-start pr-3">
            <li>
              <button onClick={() => setScreen('home')} className="hover:text-[#C8860A] transition-colors">
                صفحه نخست خانه
              </button>
            </li>
            <li>
              <button onClick={() => setScreen('shop')} className="hover:text-[#C8860A] transition-colors">
                فروشگاه آنلاین دخانیات
              </button>
            </li>
            <li>
              <button onClick={() => setScreen('cart')} className="hover:text-[#C8860A] transition-colors">
                سبد خرید شما
              </button>
            </li>
            <li>
              <button onClick={() => setScreen('dashboard')} className="hover:text-[#C8860A] transition-colors">
                پنل سفارشات مشتری
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Policy & Support */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3">پشتیبانی و اصالت</h4>
          <ul className="space-y-2 text-xs flex flex-col items-start pr-3">
            <li>
              <span className="text-[#B8A07A]/80 cursor-default">ضمانت ۱۰۰٪ بازگشت وجه</span>
            </li>
            <li>
              <span className="text-[#B8A07A]/80 cursor-default">پشتیبانی تلفنی و واتساپ</span>
            </li>
            <li>
              <span className="text-[#B8A07A]/80 cursor-default">حفظ حریم خصوصی مشتریان</span>
            </li>
            <li>
              <span className="text-[#B8A07A]/80 cursor-default">راهنمای استفاده از کدهای تخفیف</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3">تماس با دخانیات پارسی</h4>
          <ul className="space-y-3.5 text-xs text-right">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C8860A] shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[#B8A07A]/80">{settings.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#C8860A] shrink-0" />
              <span className="text-[#B8A07A]/80 font-sans">{settings.phone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#C8860A] shrink-0" />
              <span className="text-[#B8A07A]/80 font-sans">{settings.email}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer bottom bar */}
      <div className="max-w-7xl mx-auto border-t border-[#C8860A]/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light text-[#B8A07A]/60">
        <div>
          © {new Date().getFullYear()} فروشگاه دخانیات پارسی | Persian Smoke. تمامی حقوق مادی و معنوی محفوظ است.
        </div>
        <div className="flex items-center gap-4">
          <span>توسعه یافته با طعم سنتی و تکنولوژی مدرن</span>
        </div>
      </div>
    </footer>
  );
}
