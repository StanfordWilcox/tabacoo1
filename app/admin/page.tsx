'use client';

import React, { useState, useEffect } from 'react';
import { useShop } from '@/lib/store';
import AdminView from '@/components/AdminView';
import { X, ShieldAlert, ArrowRight, Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminPage() {
  const { currentUser, logout, loginUser } = useShop();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Dedicated Admin Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('لطفاً آدرس ایمیل و رمز عبور دفتری را وارد نمایید.');
      return;
    }

    setIsLoading(true);
    const res = await loginUser(email, password);
    setIsLoading(false);

    if (!res.success) {
      setFormError(res.error || 'خطایی در جریان احراز هویت رخ داد.');
    } else {
      addToast('خوش آمدید قربان. هویت شما با موفقیت تایید شد.', 'success');
    }
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
      <div dir="rtl" className="bg-[#090400] min-h-screen text-[#F5E6C8] selection:bg-[#C8860A] selection:text-black flex flex-col justify-center py-12 px-4 font-sans">
        <div className="text-center max-w-sm mx-auto mb-6">
          <span className="text-[11px] text-[#C8860A] font-bold uppercase tracking-wider block mb-2">🔒 درگاه حفاظت‌شده دفتری</span>
          <h2 className="font-serif text-2xl font-black text-[#F5E6C8]">ورود مأمورین ارشد سیستم</h2>
          <p className="text-[11px] text-[#B8A07A] font-light mt-1">لطفاً جهت دسترسی به پنل مدیریت وارد حساب دفتری خود شوید.</p>
        </div>
        
        <div className="max-w-md w-full mx-auto bg-[#1A0A00] border border-[#C8860A]/30 p-8 shadow-2xl relative sharp-border">
          {formError && (
            <div className="mb-4 p-3 bg-red-950/70 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 sharp-border">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#B8A07A] mb-1.5">آدرس ایمیل مدیریت</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smoke.ir"
                  className="w-full bg-[#050200] border border-[#C8860A]/20 focus:border-[#C8860A] px-3 py-2.5 pl-10 text-xs text-[#F5E6C8] font-sans outline-none focus:ring-1 focus:ring-[#C8860A]/30 transition-all sharp-border"
                />
                <Mail className="w-4 h-4 text-[#B8A07A]/40 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#B8A07A] mb-1.5">رمز عبور ارشد</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050200] border border-[#C8860A]/20 focus:border-[#C8860A] px-3 py-2.5 pl-10 text-xs text-[#F5E6C8] font-sans outline-none focus:ring-1 focus:ring-[#C8860A]/30 transition-all sharp-border"
                />
                <div 
                  className="absolute left-3.5 top-3 flex items-center gap-1.5 cursor-pointer text-[#B8A07A]/40 hover:text-[#C8860A] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C8860A] hover:bg-[#E8A820] text-black text-xs font-bold py-3 px-4 sharp-border active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>تایید هویت و ورود به شعبه مرکزی</span>
                </>
              )}
            </button>
          </form>
        </div>
        
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
              onClick={async () => {
                // Clear active user cookie and reload to force login page
                await logout();
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
