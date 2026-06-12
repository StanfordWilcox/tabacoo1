'use client';

import React, { useState, useEffect } from 'react';
import { useShop } from '@/lib/store';
import AdminView from '@/components/AdminView';
import AuthView from '@/components/AuthView';
import { X, ShieldAlert, ArrowRight } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminPage() {
  const { currentUser } = useShop();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}`;
    const newToast: Toast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!isClient) {
    return (
      <div className="bg-[#090400] min-h-screen flex items-center justify-center text-[#F5E6C8] font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#C8860A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-light">در حال بازخوانی اطلاعات دفتری...</p>
        </div>
      </div>
    );
  }

  // Gatekeeping - Not logged in
  if (!currentUser) {
    return (
      <div dir="rtl" className="bg-[#090400] min-h-screen text-[#F5E6C8] selection:bg-[#C8860A] selection:text-black flex flex-col justify-center py-12 px-4">
        <div className="text-center max-w-sm mx-auto mb-6">
          <span className="text-[11px] text-[#C8860A] font-bold uppercase tracking-wider block mb-2">🔒 درگاه حفاظت‌شده دفتری</span>
          <h2 className="font-serif text-2xl font-black text-[#F5E6C8]">ورود مأمورین ارشد سیستم</h2>
          <p className="text-[11px] text-[#B8A07A] font-light mt-1">لطفاً جهت دسترسی به پنل مدیریت وارد حساب دفتری خود شوید.</p>
        </div>
        
        <AuthView
          onSuccess={() => {
            addToast('ورود با موفقیت انجام شد.', 'success');
          }}
          onAddToast={addToast}
        />
        
        <div className="text-center mt-6">
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#B8A07A] hover:text-[#C8860A] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به عمارت و فروشگاه اصلی</span>
          </button>
        </div>

        {/* Global Toasts */}
        <div className="fixed bottom-6 right-6 space-y-3 z-50 max-w-sm w-full pointer-events-none text-right">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-3.5 shadow-2xl border pointer-events-auto flex items-start gap-2.5 sharp-border transition-all duration-300 animate-slide-in text-xs ${
                t.type === 'error'
                  ? 'bg-red-950/95 text-red-300 border-red-500/35'
                  : t.type === 'info'
                  ? 'bg-[#1C0E00] text-blue-300 border-blue-500/35'
                  : 'bg-[#1C0E00] text-[#F5E6C8] border-[#C8860A]/45 shadow-[#C8860A]/5'
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

  // Not an admin role
  if (currentUser.role !== 'admin') {
    return (
      <div dir="rtl" className="bg-[#090400] min-h-screen text-[#F5E6C8] selection:bg-[#C8860A] selection:text-black flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#1A0A00] border border-[#C8860A]/15 p-8 sharp-border space-y-6">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          <h2 className="font-serif text-2xl font-black text-[#F5E6C8]">سطح دسترسی ناکافی!</h2>
          <p className="text-xs text-[#B8A07A] leading-relaxed">
            شناسه کاربری شما (<span className="font-sans font-semibold text-[#C8860A]">{currentUser.email}</span>) فاقد دسترسی ارشد اداری دفتری است. لطفاً با یک حساب مدیریت لاگین کنید.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full sm:w-auto bg-[#C8860A] text-black text-xs font-bold px-6 py-2.5 sharp-border hover:bg-[#E8A820] active:scale-95 transition-all text-center cursor-pointer"
            >
              بازگشت به خانه فروشگاه
            </button>
            <button
              onClick={() => {
                // Clear active user and reload to force login page
                localStorage.removeItem('ps_current_user');
                window.location.reload();
              }}
              className="w-full sm:w-auto border border-[#C8860A]/30 hover:border-[#C8860A] hover:bg-[#C8860A]/5 text-[#C8860A] text-xs font-bold px-6 py-2.5 sharp-border transition-all text-center cursor-pointer"
            >
              خروج و لاگین مجدد با حساب مدیر
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin render
  return (
    <div dir="rtl" className="bg-[#090400] min-h-screen text-[#F5E6C8] selection:bg-[#C8860A] selection:text-black">
      <AdminView
        onBackToCustomer={() => {
          window.location.href = '/';
        }}
        onAddToast={addToast}
      />

      {/* Global Toasts rendering */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50 max-w-sm w-full pointer-events-none text-right">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3.5 shadow-2xl border pointer-events-auto flex items-start gap-2.5 sharp-border transition-all duration-300 animate-slide-in text-xs ${
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
