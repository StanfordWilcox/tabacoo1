'use client';

import React, { useState, useMemo } from 'react';
import { useShop, Address, Order } from '@/lib/store';
import { Truck, CreditCard, ClipboardCheck, ArrowRight, MapPin, CheckCircle, Smartphone, AlertCircle, RefreshCw, Lock, Shield } from 'lucide-react';

interface CheckoutViewProps {
  onBackToCart: () => void;
  onOrderSuccess: (orderId: string) => void;
  onAddToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  couponCode: string;
}

export default function CheckoutView({ onBackToCart, onOrderSuccess, onAddToast, couponCode }: CheckoutViewProps) {
  const { addresses, cart, products, addAddress, getCartTotal, verifyCoupon, createOrder, currentUser } = useShop();

  // Steps state: 1: Address, 2: Payment, 3: Success
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ''
  );

  // New Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newFullName, setNewFullName] = useState(currentUser?.name || '');
  const [newPhone, setNewPhone] = useState(currentUser?.phone || '');
  const [newProvince, setNewProvince] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('درگاه آنلاین زرین‌پال');
  const [orderNotes, setOrderNotes] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');

  // Payment Gateway states (Simulating Shaparak portal)
  const [showShaparak, setShowShaparak] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [otpTimer, setOtpTimer] = useState(0);
  const [paymentTimer, setPaymentTimer] = useState(600); // 10 minutes
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Calculations
  const totals = useMemo(() => {
    const calc = getCartTotal();
    let discount = 0;
    if (couponCode) {
      const verify = verifyCoupon(couponCode);
      if (verify.success && verify.coupon) {
        if (verify.coupon.type === 'percent') {
          discount = Math.round(calc.subtotal * (verify.coupon.value / 100));
        } else {
          discount = Math.min(calc.subtotal, verify.coupon.value);
        }
      }
    }
    return {
      subtotal: calc.subtotal,
      shippingCost: calc.shippingCost,
      discount,
      total: Math.max(0, calc.subtotal + calc.shippingCost - discount)
    };
  }, [getCartTotal, couponCode, verifyCoupon]);

  // Payment Gateway timer effects
  React.useEffect(() => {
    let interval: any;
    if (showShaparak && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer((prev) => {
          if (prev <= 1) {
            setShowShaparak(false);
            onAddToast('زمان قانونی تراکنش پرداخت به پایان رسید.', 'error');
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showShaparak, paymentTimer, onAddToast]);

  React.useEffect(() => {
    let interval: any;
    if (showShaparak && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showShaparak, otpTimer]);

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newProvince || !newCity || !newAddress || !newPostalCode) {
      onAddToast('پر کردن تمامی کادرهای آدرس اجباری است.', 'error');
      return;
    }
    
    // Simulate API save
    addAddress({
      fullName: newFullName,
      phone: newPhone,
      province: newProvince,
      city: newCity,
      address: newAddress,
      postalCode: newPostalCode,
      isDefault: addresses.length === 0,
    });

    onAddToast('✓ نشانی جدید با موفقیت به بانک آدرس‌های شما الحاق شد.', 'success');
    setShowAddressForm(false);
    
    // Clear
    setNewProvince('');
    setNewCity('');
    setNewAddress('');
    setNewPostalCode('');
  };

  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const handleNextToPayment = () => {
    if (!selectedAddressId && addresses.length > 0) {
      onAddToast('لطفاً یکی از آدرس‌های ثبت شده را انتخاب نمایید.', 'error');
      return;
    }
    if (addresses.length === 0) {
      onAddToast('لطفاً آدرس دریافت بسته غلیظ را مشخص فرمایید.', 'error');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    const activeAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!activeAddress) {
      onAddToast('آدرس فرستنده یا گیرنده معتبر نیست.', 'error');
      return;
    }

    try {
      // Place the order via Context CRUD
      const placed = await createOrder({
        totalAmount: totals.total,
        shippingCost: totals.shippingCost,
        discountAmount: totals.discount,
        couponCode: couponCode || undefined,
        shippingAddress: {
          fullName: activeAddress.fullName,
          phone: activeAddress.phone,
          province: activeAddress.province,
          city: activeAddress.city,
          address: activeAddress.address,
          postalCode: activeAddress.postalCode,
        },
        paymentMethod,
        notes: orderNotes || undefined,
      });

      setCreatedOrderId(placed.id);
      setStep(3);
      onOrderSuccess(placed.id);
      onAddToast(`✓ سفارش ${placed.id} با موفقیت ثبت شد و فاکتور مالی تأیید گردید!`, 'success');
    } catch (err: any) {
      onAddToast(err.message || 'ثبت سفارش با تکاپو مواجه شد. لطفاً مجدداً امتحان کنید.', 'error');
    }
  };

  const handleInitiatePayment = () => {
    const activeAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!activeAddress) {
      onAddToast('آدرس فرستنده یا گیرنده معتبر نیست.', 'error');
      return;
    }

    if (paymentMethod === 'درگاه آنلاین زرین‌پال') {
      // Re-initialize Shaparak gateway state
      setCardNumber('');
      setCvv2('');
      setExpMonth('');
      setExpYear('');
      setOtp('');
      setCaptchaInput('');
      setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());
      setOtpTimer(0);
      setPaymentTimer(600); // 10 mins
      setPaymentError('');
      setPaymentLoading(false);
      setShowShaparak(true);
    } else {
      // Direct placement (offline / card to card)
      handlePlaceOrder();
    }
  };

  const getBankDetails = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.startsWith('603799')) return { name: 'بانک ملی ایران', color: 'bg-[#004b93] text-white' };
    if (cleanNum.startsWith('610433')) return { name: 'بانک ملت', color: 'bg-[#cb1a2e] text-white' };
    if (cleanNum.startsWith('621986')) return { name: 'بانک سامان', color: 'bg-[#037c8c] text-white' };
    if (cleanNum.startsWith('502229')) return { name: 'بانک پاسارگاد', color: 'bg-[#ffc107] text-black font-extrabold' };
    if (cleanNum.startsWith('589210')) return { name: 'بانک سپه', color: 'bg-[#d0a000] text-black' };
    if (cleanNum.startsWith('627359')) return { name: 'بانک صادرات ایران', color: 'bg-[#102d6b] text-white' };
    if (cleanNum.startsWith('627412')) return { name: 'بانک اقتصاد نوین', color: 'bg-[#5a2c84] text-white' };
    if (cleanNum.startsWith('628023')) return { name: 'بانک مسکن', color: 'bg-[#e45b00] text-white' };
    return null;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += '-';
      }
      formatted += value[i];
    }
    setCardNumber(formatted);
  };

  const handleRequestOtp = () => {
    if (cardNumber.replace(/\D/g, '').length < 16) {
      setPaymentError('لطفاً ابتدا شماره کارت ۱۶ رقمی معتبر را وارد نمایید.');
      return;
    }
    setOtpTimer(120);
    const fakeOtp = Math.floor(100000 + Math.random() * 900000).toString();
    onAddToast(`رمز پویا صادر گردید و به سیم‌کارت شما ارسال شد: ${fakeOtp}`, 'info');
    setTimeout(() => {
      setOtp(fakeOtp);
      onAddToast('رمز پویا دریافت شده از پیامک، بصورت خودکار تکمیل شد.', 'success');
    }, 1500);
  };

  if (showShaparak) {
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    const handleShaparakSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPaymentError('');

      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 16) {
        setPaymentError('شماره کارت باید ۱۶ رقم باشد.');
        return;
      }
      if (cvv2.length < 3) {
        setPaymentError('کد CVV2 باید ۳ یا ۴ رقم باشد.');
        return;
      }
      if (!expMonth || parseInt(expMonth, 10) < 1 || parseInt(expMonth, 10) > 12) {
        setPaymentError('ماه انقضا معتبر نیست (باید بین ۰۱ و ۱۲ باشد).');
        return;
      }
      if (!expYear || expYear.length < 2) {
        setPaymentError('سال انقضا معتبر نیست (به صورت ۲ رقمی وارد کنید، مثال: ۰۹).');
        return;
      }
      if (captchaInput !== captchaCode) {
        setPaymentError('کد امنیتی تصویر صحیح نمی‌باشد.');
        setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString());
        return;
      }
      if (!otp) {
        setPaymentError('رمز دوم پویا وارد نشده است. شستی "درخواست رمز پویا" را بفشارید.');
        return;
      }

      setPaymentLoading(true);

      setTimeout(async () => {
        try {
          await handlePlaceOrder();
          setShowShaparak(false);
        } catch (error: any) {
          setPaymentError(error.message || 'خطا در ارتباط با سرورهای اعتبارسنجی شتاب. مجدداً اقدام کنید.');
          setPaymentLoading(false);
        }
      }, 2000);
    };

    const detectedBank = getBankDetails(cardNumber);

    return (
      <div dir="rtl" className="fixed inset-0 z-50 overflow-y-auto bg-[#e9ebed] text-[#333333] font-sans pb-12">
        {/* Safety Header Warning */}
        <div className="bg-[#fff3cd] text-[#856404] text-[11px] font-bold text-center py-2 px-4 shadow-sm border-b border-[#ffeeba]">
          ⚠️ پذیرنده گرامی، جهت افزایش ضریب امنیت تراکنش، لطفاً پیش از ورود هرگونه اطلاعات از وجود پسوند <span className="underline text-red-700">shaparak.ir</span> در آدرس بار مرورگر مطمئن گردید.
        </div>

        {/* Navigation Banner for Shaparak */}
        <header className="max-w-5xl mx-auto mt-4 px-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-300 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-right">
              <h1 className="text-sm font-black text-gray-800 tracking-tight">سامانه پرداخت الکترونیکی کارت (شاپرک)</h1>
              <p className="text-[10px] text-gray-500 font-bold">زیرنظر بانک مرکزی جمهوری اسلامی ایران</p>
            </div>
          </div>
          {/* Bank Emblem Simulated */}
          <div className="flex items-center gap-2 bg-white/75 px-4 py-1.5 rounded border border-gray-300 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-505 bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-800 font-extrabold tracking-tight">اتصال با لایه امن الکترونیک SSL برقرار است</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto mt-6 px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Merchant Parameters Section */}
          <section className="bg-white border border-gray-300 p-5 rounded shadow-sm md:col-span-4 space-y-4 text-right">
            <div className="border-b border-gray-200 pb-2 mb-2">
              <h2 className="text-xs font-black text-gray-400">اطلاعات پرونده مالی پذیرنده:</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500">پذیرنده وب‌سایت:</span>
                <span className="font-bold text-gray-800">مجموعه سلطنتی قلیان و دخانیات پارسی</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500">کد ترمینال شتاب:</span>
                <span className="font-mono text-gray-800 tracking-widest font-semibold">۴۹۹۱۸۲۳۷</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500">شماره مرجع پایانه:</span>
                <span className="font-mono text-gray-800 tracking-widest font-semibold">۹۱۸۶۲۲۳</span>
              </div>
              <div className="flex justify-between items-baseline text-right" dir="ltr">
                <span className="font-mono text-gray-800 text-[10px] font-semibold text-right">
                  {typeof window !== 'undefined' ? window.location.host : 'smoke.ir'}
                </span>
                <span className="text-gray-500 text-right">آدرس اینترنتی دکان:</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-bold text-gray-500">مجموع خالص سبد خرید:</span>
                <span className="text-xs font-black text-gray-800">{totals.total.toLocaleString()} تومان</span>
              </div>
              <div className="bg-emerald-50 text-emerald-950 p-3 rounded border border-emerald-200 flex flex-col items-center">
                <span className="text-[9px] font-extrabold tracking-wider uppercase text-emerald-700">مبلغ نهایی تراکنش جهت کسر از شتاب (ریال)</span>
                <span className="text-base font-black tracking-widest font-mono mt-1 text-emerald-950">
                  {(totals.total * 10).toLocaleString()} <span className="text-[10px] font-normal font-sans">ریال</span>
                </span>
              </div>
            </div>

            {/* Timer card */}
            <div className="bg-gray-50 border border-gray-200 p-3 rounded flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-700">
                <AlertCircle className="w-4 h-4 animate-bounce" />
                <span className="font-bold">زمان باقیمانده اتصال:</span>
              </div>
              <span className="font-mono text-base font-black text-amber-700 animate-pulse">
                {formatTime(paymentTimer)}
              </span>
            </div>
          </section>

          {/* Secure Card Inputs Section */}
          <section className="bg-white border border-gray-300 p-6 rounded shadow-sm md:col-span-8 text-right">
            <div className="border-b border-gray-200 pb-3 mb-5 flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-800">مشخصات کارت بانکی معتبر را وارد نمایید:</h2>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>

            {paymentError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded p-3 text-xs font-bold leading-relaxed mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700 animate-pulse" />
                <span>{paymentError}</span>
              </div>
            )}

            {paymentLoading ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="font-bold text-gray-800 text-sm">در حال اعتبارسنجی شبکه شتاب و تسویه شاپرک...</h3>
                <p className="text-xs text-gray-500 font-light">لطفاً اتصال اینترنت خود را قطع نکرده و چند ثانیه شکیبا باشید.</p>
              </div>
            ) : (
              <form onSubmit={handleShaparakSubmit} className="space-y-4 text-xs">
                
                {/* 1. Card number */}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                  <label className="sm:col-span-1 font-bold text-gray-700">شماره کارت ۱۶ رقمی:</label>
                  <div className="sm:col-span-3 relative">
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-[#fafbfc] border border-gray-300 focus:border-emerald-600 focus:bg-white text-sm font-mono tracking-widest px-4 py-2.5 rounded shadow-inner outline-none text-center"
                      maxLength={19}
                      required
                    />
                    {detectedBank && (
                      <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded text-[9px] font-black tracking-tight ${detectedBank.color}`}>
                        {detectedBank.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. CVV2 */}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                  <label className="sm:col-span-1 font-bold text-gray-700">کد امنیتی CVV2:</label>
                  <div className="sm:col-span-3">
                    <input
                      type="password"
                      dir="ltr"
                      maxLength={4}
                      placeholder="کد ۳ یا ۴ رقمی پشت کارت"
                      value={cvv2}
                      onChange={(e) => setCvv2(e.target.value.replace(/\D/g, ''))}
                      className="max-w-[150px] bg-[#fafbfc] border border-gray-300 focus:border-emerald-600 focus:bg-white px-3 py-2 rounded text-center font-mono tracking-widest outline-none shadow-inner text-sm"
                      required
                    />
                  </div>
                </div>

                {/* 3. Expiration Date */}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                  <label className="sm:col-span-1 font-bold text-gray-700">تاریخ انقضاء کارت:</label>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="ماه (مثال: 08)"
                      maxLength={2}
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, ''))}
                      className="w-24 bg-[#fafbfc] border border-gray-300 focus:border-emerald-600 focus:bg-white px-2 py-2.5 rounded text-center font-mono outline-none shadow-inner"
                      required
                    />
                    <span className="text-gray-400 font-bold">/</span>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="سال (مثال: 09)"
                      maxLength={2}
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value.replace(/\D/g, ''))}
                      className="w-24 bg-[#fafbfc] border border-gray-300 focus:border-emerald-600 focus:bg-white px-2 py-2.5 rounded text-center font-mono outline-none shadow-inner"
                      required
                    />
                  </div>
                </div>

                {/* 4. Captcha Code */}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                  <label className="sm:col-span-1 font-bold text-gray-700">کد امنیتی تصویر:</label>
                  <div className="sm:col-span-3 flex items-center gap-3">
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={4}
                      placeholder="کد ۴ رقمی مقابل"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                      className="w-32 bg-[#fafbfc] border border-gray-300 focus:border-emerald-600 focus:bg-white px-3 py-2.5 rounded text-center font-mono text-sm tracking-widest outline-none shadow-inner"
                      required
                    />
                    
                    {/* Captcha representation block */}
                    <div className="bg-[#eaeded] px-4 py-1.5 rounded border border-gray-300 flex items-center gap-2.5 font-mono select-none">
                      <span className="italic line-through tracking-widest text-[#2c3e50] font-black text-lg select-none">
                        {captchaCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString())}
                        className="text-gray-500 hover:text-black py-1 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. OTP (رمز دوم پویا) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 pt-3 border-t border-gray-100 mt-2">
                  <label className="sm:col-span-1 font-bold text-gray-700 pt-3">رمز دوم / رمز پویا:</label>
                  <div className="sm:col-span-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="password"
                        dir="ltr"
                        placeholder="رمز عبور پویا شتاب"
                        maxLength={8}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-48 bg-[#fafbfc] border border-gray-300 focus:border-emerald-600 focus:bg-white px-3 py-2.5 rounded text-center font-mono tracking-widest outline-none shadow-inner text-sm"
                        required
                      />
                      
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={otpTimer > 0}
                        className={`px-4 py-2.5 font-black transition-all border text-xs ${
                          otpTimer > 0
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow shadow-emerald-500/10 active:scale-95'
                        } rounded`}
                      >
                        {otpTimer > 0 ? `ارسال مجدد (${otpTimer} ثانیه)` : 'درخواست رمز پویا پیامکی'}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      برای فعال‌شدن تراکنش، کلیک روی دکمه بالا شبیه‌ساز دریافت پیامک مخابرات را اجرا کرده و رمز را بلافاصله تکمیل خواهد نمود (کدهای فرضی: ۶۰۳۷۹۹ ملی، ۶۱۰۴۳۳ ملت).
                    </p>
                  </div>
                </div>

                {/* Buttons Action Row */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded text-xs tracking-wider shadow-md transition-all active:scale-95"
                  >
                    پرداخت قطعی صورت‌حساب دخانیات
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShaparak(false);
                      onAddToast('تراکنش پرداخت آنلاین توسط کاربر لغو گردید.', 'info');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3.5 rounded text-xs transition-all animate-none"
                  >
                    انصراف و لغو پرداخت شتاب
                  </button>
                </div>
              </form>
            )}
          </section>
        </main>

        {/* Security guidelines footer */}
        <footer className="max-w-5xl mx-auto mt-8 px-4 py-6 border-t border-gray-300 text-[11px] text-gray-500 leading-relaxed text-right space-y-2">
          <p className="font-extrabold text-gray-700 text-xs">نکات ایمنی پرداخت الکترونیکی کارت (شتاب):</p>
          <ul className="list-decimal pr-4 space-y-1 font-medium">
            <li>آدرس صحیح درگاه پرداخت بانک ملت حتما باید با <span className="underline select-all text-blue-700 font-mono">https://</span> آغاز شده و عبارت <span className="text-emerald-700 font-bold font-mono">shaparak.ir</span> در ادامه آن ثبت شده باشد.</li>
            <li>از افشای رمز اول و دوم (پویا)، تاریخ انقضا و CVV2 خود به هر شخص ثالث تحت هر عنوانی خودداری فرمایید.</li>
            <li>سیستم فیلترینگ هوشمند تراکنش به گونه‌ای طراحی شده است که اطلاعات مشکوک را مسدود خواهد کرد.</li>
          </ul>
        </footer>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-32 text-right">
      
      {/* 1. Steps indicator bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-16 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#C8860A]/10 -translate-y-1/2 z-0" />
        
        {/* Step 1 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 1 ? 'bg-[#C8860A] text-[#0E0600]' : 'bg-[#1A0A00] border border-[#C8860A]/30 text-[#B8A07A]'
          }`}>
            <Truck className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#F5E6C8]">نشانی حمل‌ونقل</span>
        </div>

        {/* Step 2 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 2 ? 'bg-[#C8860A] text-[#0E0600]' : 'bg-[#1A0A00] border border-[#C8860A]/30 text-[#B8A07A]'
          }`}>
            <CreditCard className="w-4 h-4" />
          </div>
          <span className={`text-[11px] font-bold ${step >= 2 ? 'text-[#F5E6C8]' : 'text-[#B8A07A]/50'}`}>درگاه پرداخت</span>
        </div>

        {/* Step 3 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 3 ? 'bg-[#C8860A] text-[#0E0600]' : 'bg-[#1A0A00] border border-[#C8860A]/30 text-[#B8A07A]'
          }`}>
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <span className={`text-[11px] font-bold ${step >= 3 ? 'text-[#F5E6C8]' : 'text-[#B8A07A]/50'}`}>ثبت موفق</span>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* List of addresses (8 lines in RTL grid) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1A0A00] arabesque-border p-6 sharp-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-sm text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A]">
                  نشانی تحویل مرسوله قلیان
                </h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs bg-[#C8860A]/10 hover:bg-[#C8860A] hover:text-[#0E0600] text-[#C8860A] px-3.5 py-1.5 transition-colors font-bold sharp-border"
                >
                  {showAddressForm ? 'انصراف' : 'ثبت نشانی جدید +'}
                </button>
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddNewAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">نام تحویل‌گیرنده</label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">شماره تلفن تماس</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">استان</label>
                    <input
                      type="text"
                      required
                      placeholder="تهران، اصفهان، فارس..."
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">شهر</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">آدرس پستی تفصیلی</label>
                    <input
                      type="text"
                      required
                      placeholder="خیابان اصلی، بلوار، کوچه، طبقه، واحد..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-light"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">کد پستی ۱۰ رقمی</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-8 py-2.5 hover:bg-[#E8A820] transition-colors sharp-border"
                    >
                      ذخیره نشانی جدید
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#B8A07A]/60">
                      هیچ آدرسی در دفترچه ثبت نشده. لطفاً دکمه ثبت نشانی جدید را بفشارید.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => setSelectedAddressId(a.id)}
                          className={`border p-4 sharp-border cursor-pointer transition-all text-xs space-y-2 mt-2 relative ${
                            selectedAddressId === a.id
                              ? 'border-[#C8860A] bg-[#C8860A]/5 shadow-lg'
                              : 'border-[#C8860A]/10 bg-[#0E0600] hover:border-[#C8860A]/35'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#F5E6C8]">{a.fullName}</span>
                            {a.isDefault && (
                              <span className="bg-[#C8860A]/20 text-[#C8860A] shrink-0 font-bold px-2 py-0.5 text-[8px] rounded-full">
                                پیش‌فرض
                              </span>
                            )}
                          </div>
                          <p className="text-[#B8A07A] leading-relaxed line-clamp-2">{`${a.province}، ${a.city}، ${a.address}`}</p>
                          <div className="flex items-center justify-between font-sans text-[10px] text-[#B8A07A]/75 pt-2 border-t border-[#C8860A]/5">
                            <span>کد پستی: {a.postalCode}</span>
                            <span>تلفن: {a.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={onBackToCart}
                className="text-xs text-[#B8A07A] hover:text-[#C8860A] flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                بازگشت به سبد کالای قلیان
              </button>

              <button
                onClick={handleNextToPayment}
                className="bg-[#C8860A] hover:bg-[#E8A820] text-[#0E0600] font-bold text-sm px-8 py-3 sharp-border flex items-center gap-2 shadow-xl active:scale-95"
              >
                <span>ادامه و انتخاب شیوه پرداخت</span>
              </button>
            </div>
          </div>

          {/* Left panel: Cart Summary */}
          <div className="lg:col-span-4 bg-[#1A0A00] arabesque-border p-6 sharp-border self-start space-y-4">
            <h3 className="font-bold text-sm text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A] mb-1">
              خلاصه نهایی صورت‌حساب
            </h3>
            <div className="space-y-2 text-xs border-b border-[#C8860A]/10 pb-4 text-[#B8A07A]">
              <div className="flex justify-between">
                <span>جمع کل اقلام</span>
                <span className="font-sans font-bold">{totals.subtotal.toLocaleString()} ت</span>
              </div>
              <div className="flex justify-between">
                <span>پست فشرده دخانیات</span>
                <span>{totals.shippingCost === 0 ? 'رایگان' : `${totals.shippingCost.toLocaleString()} ت`}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>کسر کوپن</span>
                  <span className="font-sans font-bold">-{totals.discount.toLocaleString()} ت</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-xs font-bold text-[#F5E6C8]">جمع پرداختی نهایی:</span>
              <span className="text-xl font-sans font-black text-[#E8A820]">
                {totals.total.toLocaleString()} تومان
              </span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto arabesque-border bg-[#1A0A00] p-6 md:p-8 sharp-border space-y-8">
          
          <h3 className="font-bold text-base text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A]">
            درگاه مستقیم بانکی یا حواله دفتری
          </h3>

          <div className="space-y-3.5">
            {/* Method 1 */}
            <div
              onClick={() => setPaymentMethod('درگاه آنلاین زرین‌پال')}
              className={`border p-4 sharp-border cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === 'درگاه آنلاین زرین‌پال'
                  ? 'border-[#C8860A] bg-[#C8860A]/5'
                  : 'border-[#C8860A]/15 bg-[#0E0600] hover:border-[#C8860A]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-[18px] h-[18px] rounded-full border-2 border-[#C8860A] flex items-center justify-center">
                  {paymentMethod === 'درگاه آنلاین زرین‌پال' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C8860A]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#F5E6C8]">پرداخت سریع اینترنتی زرین‌پال (شتاب)</h4>
                  <p className="text-[10px] text-[#B8A07A] mt-1 font-light">استفاده امن از کلیه کارت‌های بانکی ثبت شده در سیستم شتاب</p>
                </div>
              </div>
              <Smartphone className="w-5 h-5 text-[#C8860A]" />
            </div>

            {/* Method 2 */}
            <div
              onClick={() => setPaymentMethod('کارت به کارت')}
              className={`border p-4 sharp-border cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === 'کارت به کارت'
                  ? 'border-[#C8860A] bg-[#C8860A]/5'
                  : 'border-[#C8860A]/15 bg-[#0E0600] hover:border-[#C8860A]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-[18px] h-[18px] rounded-full border-2 border-[#C8860A] flex items-center justify-center">
                  {paymentMethod === 'کارت به کارت' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C8860A]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#F5E6C8]">حواله کارت به کارت (ثبت دستی و آفلاین)</h4>
                  <p className="text-[10px] text-[#B8A07A] mt-1 font-light">انتقال مبلغ به کارفرمای دفتری و ارسال فیش انتقال در واتساپ</p>
                </div>
              </div>
              <CreditCard className="w-5 h-5 text-[#C8860A]" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#B8A07A] block">یادداشت برای سفارش قلیان (اختیاری)</label>
            <textarea
              rows={3}
              placeholder="مثلا: ساعت تحویل بعد از ظهر، زغال پوست نارگیل حتما بدون خرده باشد، یا طعم تنباکو دوسیب شلاقی تاقچه طلایی باشد..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] px-3.5 py-2.5 text-xs text-[#F5E6C8] sharp-border outline-none text-right font-light leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#C8860A]/10">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-[#B8A07A] hover:text-[#C8860A]"
            >
              بازگشت به نشانی گیرنده
            </button>

            <button
              onClick={handleInitiatePayment}
              className="bg-[#C8860A] hover:bg-[#E8A820] text-[#0E0600] font-black text-sm px-10 py-3.5 sharp-border flex items-center gap-2 shadow-2xl active:scale-95"
            >
              <span>تایید نهایی و تراکنش بانکی</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-md mx-auto arabesque-border bg-[#1A0A00] p-8 text-center sharp-border space-y-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
          <h2 className="text-xl sm:text-2xl font-black text-[#F5E6C8] tracking-tight">سفارش شما با موفقیت ثبت شد!</h2>
          <p className="text-xs text-[#B8A07A] leading-relaxed">
            کارفرما گرامی، فاکتور خرید فیزیکی شما با شماره مرجع <span className="text-[#C8860A] font-bold font-sans">{createdOrderId}</span> در سیستم دفتری دخانیات ثبت گردید و بسته بلافاصله در بخش پردازش فیزیکی قلیان قرار گرفت.
          </p>

          <div className="bg-[#0E0600] border border-[#C8860A]/10 p-4 sharp-border space-y-2 text-xs text-right text-[#B8A07A]">
            <div className="flex justify-between">
              <span>شماره فاکتور:</span>
              <span className="font-sans font-bold text-[#F5E6C8]">{createdOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span>مبلغ کسر از شتاب:</span>
              <span className="font-sans font-bold text-[#E8A820]">{totals.total.toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between">
              <span>درگاه فعال:</span>
              <span className="font-sans text-green-500">{paymentMethod}</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => onOrderSuccess(createdOrderId)}
              className="bg-[#C8860A] hover:bg-[#E8A820] text-[#0E0600] font-bold text-xs px-6 py-2.5 sharp-border shadow-md"
            >
              پیگیری سفارش در داشبورد من
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
