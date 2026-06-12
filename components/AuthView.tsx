'use client';

import React, { useState } from 'react';
import { useShop } from '@/lib/store';
import { ShieldAlert, Compass, UserCheck, Mail, Lock, User, Phone } from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
  onAddToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function AuthView({ onSuccess, onAddToast }: AuthViewProps) {
  const { loginUser, registerUser, currentUser } = useShop();

  const [isLogin, setIsLogin] = useState(true);

  // Login variables
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register variables
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      onAddToast('کادرهای ایمیل و کلمه عبور را پر نمایید.', 'error');
      return;
    }

    const result = await loginUser(loginEmail, loginPass);
    if (result.success) {
      onAddToast('✓ با موفقیت وارد شدید! به محفل دخانیات خوش آمدید.', 'success');
      onSuccess();
    } else {
      onAddToast(result.error || '✗ مشخصات وارد شده نامعتبر است. مجدداً اقدام کنید.', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPass) {
      onAddToast('پر کردن کلیه فیلدها اجباری است.', 'error');
      return;
    }

    if (regPass.length < 6) {
      onAddToast('رمز عبور باید حداقل ۶ نویسه داشته باشد.', 'error');
      return;
    }

    const result = await registerUser(regName, regEmail, regPhone, regPass);

    if (result.success) {
      onAddToast('✓ حساب کاربری VIP شما با موفقیت ثبت شد!', 'success');
      onSuccess();
    } else {
      onAddToast(result.error || 'ایمیل وارد شده قبلاً در سیستم ثبت گردیده است.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-32 text-right">
      <div className="bg-[#1A0A00] arabesque-border p-6 md:p-8 sharp-border space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Visual smoke subtle element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8860A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center font-serif space-y-2 pb-2">
          {/* Title or Seal */}
          <div className="w-12 h-12 rounded-full border border-[#C8860A]/35 bg-[#C8860A]/5 mx-auto flex items-center justify-center text-[#C8860A] text-lg font-bold mb-3 select-none">
            ⚜
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#F5E6C8] tracking-tight">
            {isLogin ? 'ورود به حساب دفتری' : 'عضویت در باشگاه VIP پارسی'}
          </h2>
          <p className="text-[11px] text-[#B8A07A] font-light">
            {isLogin ? 'تطبیق هویت به جهت مرور فاکتورها و خرید غلیظ' : 'بهره‌مندی از تخفیفات فصلی، اشانتیون و ارسال رایگان'}
          </p>
        </div>

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-light">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#B8A07A] block">نشانی پست الکترونیک (ایمیل)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] px-4 py-3 text-[#F5E6C8] sharp-border outline-none text-left font-sans"
                />
                <Mail className="w-4 h-4 text-[#C8860A]/30 absolute right-3.5 top-3.5" />
              </div>
              <span className="text-[9px] text-[#B8A07A]/50 block pr-1">مثال مدیر: admin@smoke.ir | مثال خریدار: user@smoke.ir</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#B8A07A] block">کلمه عبور امنیتی (رمز)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] px-4 py-3 text-[#F5E6C8] sharp-border outline-none text-left font-sans"
                />
                <Lock className="w-4 h-4 text-[#C8860A]/30 absolute right-3.5 top-3.5" />
              </div>
              <span className="text-[9px] text-[#B8A07A]/50 block pr-1">رمز پیش‌فرض مدیر: admin123 | رمز پیش‌فرض مشتری: amir123</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#C8860A] hover:bg-[#E8A820] text-[#0E0600] font-black py-3 sharp-border transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>ورود امن به اکانت</span>
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-light">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#B8A07A] block">نام کامل تحویل‌گیرنده</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: پارسا کمالی"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] px-4 py-3 text-[#F5E6C8] sharp-border outline-none text-right"
                />
                <User className="w-4 h-4 text-[#C8860A]/30 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#B8A07A] block">نشانی ایمیل</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="yours@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] px-4 py-3 text-[#F5E6C8] sharp-border outline-none text-left font-sans"
                />
                <Mail className="w-4 h-4 text-[#C8860A]/30 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#B8A07A] block">تلفن همراه فعال (مخصوص کدرهگیری)</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="09123456789"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] px-4 py-3 text-[#F5E6C8] sharp-border outline-none text-left font-sans"
                />
                <Phone className="w-4 h-4 text-[#C8860A]/30 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#B8A07A] block">تعیین کلمه عبور امنیتی</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="حداقل ۴ کاراکتر"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] px-4 py-3 text-[#F5E6C8] sharp-border outline-none text-left font-sans"
                />
                <Lock className="w-4 h-4 text-[#C8860A]/30 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#C8860A] hover:bg-[#E8A820] text-[#0E0600] font-black py-3 sharp-border transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>ایجاد حساب VIP</span>
            </button>
          </form>
        )}

        {/* Tab Swapper */}
        <div className="text-center pt-2 border-t border-[#C8860A]/10 text-xs">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#E8A820] font-semibold hover:underline"
          >
            {isLogin ? 'عضویت رایگان در باشگاه مشتریان دخانیات' : 'قبلاً حساب ساخته‌اید؟ ورود سریع'}
          </button>
        </div>

      </div>
    </div>
  );
}
