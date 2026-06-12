'use client';

import React, { useState, useMemo } from 'react';
import { useShop, Address, Order } from '@/lib/store';
import { Truck, CreditCard, ClipboardCheck, ArrowRight, MapPin, CheckCircle, Smartphone } from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState('درگاه زرین‌پال اول');
  const [orderNotes, setOrderNotes] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');

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

  const handlePlaceOrder = () => {
    const activeAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!activeAddress) {
      onAddToast('آدرس فرستنده یا گیرنده معتبر نیست.', 'error');
      return;
    }

    // Place the order via Context CRUD
    const placed = createOrder({
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
  };

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
              onClick={handlePlaceOrder}
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
