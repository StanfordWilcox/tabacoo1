'use client';

import React, { useState, useMemo } from 'react';
import { useShop, Product } from '@/lib/store';
import { Trash2, AlertCircle, ShoppingCart, Tag, Ticket, HelpCircle } from 'lucide-react';

interface CartViewProps {
  onBackToShop: () => void;
  onCheckout: () => void;
  onAddToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
}

export default function CartView({ onBackToShop, onCheckout, onAddToast, couponCode, setCouponCode }: CartViewProps) {
  const { cart, products, updateCartQty, removeFromCart, getCartTotal, verifyCoupon, settings } = useShop();
  
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const [couponDiscountFixed, setCouponDiscountFixed] = useState<number>(0);
  const [activeCoupon, setActiveCoupon] = useState<string>('');

  const cartItemsWithDetails = useMemo(() => {
    return cart.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        ...item,
        product: prod,
      };
    }).filter(item => item.product !== undefined) as Array<typeof cart[0] & { product: Product }>;
  }, [cart, products]);

  // Totals calculations
  const totals = useMemo(() => {
    const calc = getCartTotal();
    let discount = 0;
    if (couponDiscountPercent > 0) {
      discount = Math.round(calc.subtotal * (couponDiscountPercent / 100));
    } else if (couponDiscountFixed > 0) {
      discount = Math.min(calc.subtotal, couponDiscountFixed);
    }
    return {
      subtotal: calc.subtotal,
      shippingCost: calc.shippingCost,
      discount,
      total: Math.max(0, calc.subtotal + calc.shippingCost - discount)
    };
  }, [getCartTotal, couponDiscountPercent, couponDiscountFixed]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      onAddToast('کد تخفیف را وارد کنید.', 'error');
      return;
    }
    
    const verify = verifyCoupon(couponInput);
    if (!verify.success || !verify.coupon) {
      onAddToast(verify.error || 'کد تخفیف فاقد اعتبار است.', 'error');
      setCouponDiscountPercent(0);
      setCouponDiscountFixed(0);
      setActiveCoupon('');
      return;
    }

    if (totals.subtotal < verify.coupon.minOrder) {
      onAddToast(`حداقل سفارش برای استفاده از این کد ${verify.coupon.minOrder.toLocaleString()} تومان است.`, 'error');
      return;
    }

    if (verify.coupon.type === 'percent') {
      setCouponDiscountPercent(verify.coupon.value);
      setCouponDiscountFixed(0);
    } else {
      setCouponDiscountFixed(verify.coupon.value);
      setCouponDiscountPercent(0);
    }

    setCouponCode(verify.coupon.code);
    setActiveCoupon(verify.coupon.code);
    onAddToast(`✓ کد تخفیف ${verify.coupon.code} با موفقیت اعمال شد.`, 'success');
  };

  const clearCoupon = () => {
    setCouponInput('');
    setCouponCode('');
    setCouponDiscountPercent(0);
    setCouponDiscountFixed(0);
    setActiveCoupon('');
    onAddToast('کد تخفیف حذف گردید.', 'info');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center text-right space-y-4">
        <ShoppingCart className="w-16 h-16 text-[#C8860A]/40 mx-auto" />
        <h2 className="text-xl font-bold text-[#F5E6C8]">سبد خرید شما فعلاً خالی است!</h2>
        <p className="text-xs text-[#B8A07A]">محصولات ارشمندی با طعم‌های عالی در ویترین فروشگاه در انتظار شماست.</p>
        <button
          onClick={onBackToShop}
          className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-6 py-2.5 sharp-border hover:bg-[#E8A820] transition-colors"
        >
          ورود به تالار تنباکو و زغال
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-32 text-right">
      
      {/* View Title */}
      <div className="border-b border-[#C8860A]/15 pb-6 mb-10">
        <h1 className="font-serif text-3xl font-black text-[#F5E6C8]">سبد خرید من</h1>
        <p className="text-xs text-[#B8A07A] mt-2 font-light">مرور مجدد فاکتور کالاها پیش از پرداخت نهایی</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Right side: Items list (8 lines) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#1A0A00] arabesque-border p-4 md:p-6 sharp-border space-y-4">
            {cartItemsWithDetails.map((item) => {
              const sub = item.product.price * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#C8860A]/10 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-[#0E0600] border border-[#C8860A]/10 p-1 sharp-border flex-shrink-0">
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Item Info */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs md:text-sm text-[#F5E6C8] pr-1 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <div className="flex gap-2 text-[10px] text-[#B8A07A]">
                        <span>برند: {item.product.brand}</span>
                        <span>•</span>
                        <span>وزن: {item.product.weight}</span>
                      </div>
                      <span className="text-xs text-[#C8860A] font-sans font-bold block pt-1">
                        {item.product.price.toLocaleString()} تومان
                      </span>
                    </div>
                  </div>

                  {/* Quantity adjustment & delete */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center bg-[#0E0600] border border-[#C8860A]/20 text-xs">
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                        className="px-2.5 py-1 text-[#C8860A] hover:bg-[#C8860A]/10"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-sans font-bold text-[#F5E6C8]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                        className="px-2.5 py-1 text-[#C8860A] hover:bg-[#C8860A]/10"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Subtotal */}
                      <span className="text-sm font-sans font-black text-[#E8A820]">
                        {sub.toLocaleString()} تومان
                      </span>
                      {/* Trash */}
                      <button
                        onClick={() => {
                          removeFromCart(item.productId);
                          onAddToast('کالا از سبد حذف شد.', 'info');
                        }}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/20 Transition-all sharp-border"
                        title="حذف از سبد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onBackToShop}
            className="text-xs text-[#E8A820] hover:underline"
          >
            ← افزودن کالاهای بیشتر به سبد خرید
          </button>
        </div>

        {/* Left side: Invoice breakdown & Coupons */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon input */}
          <div className="bg-[#1A0A00] arabesque-border p-6 sharp-border">
            <h3 className="font-bold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-3">
              کوبون یا کد تخفیف دخانیات
            </h3>
            {activeCoupon ? (
              <div className="bg-[#C8860A]/10 border border-[#C8860A]/30 p-3 sharp-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#C8860A] font-bold">✓ کد {activeCoupon} فعال شد!</span>
                  <span className="block text-[10px] text-[#B8A07A] mt-0.5">
                    {couponDiscountPercent > 0 ? `${couponDiscountPercent}٪ کسر گردید` : `${couponDiscountFixed.toLocaleString()} تومان کسر گردید`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearCoupon}
                  className="text-xs text-red-400 hover:underline"
                >
                  حذف کوپن
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثال: SMOKE20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2 text-[#F5E6C8] outline-none sharp-border font-mono text-center"
                />
                <button
                  type="submit"
                  className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-4 py-2 hover:bg-[#E8A820] transition-colors sharp-border"
                >
                  اعمال
                </button>
              </form>
            )}
          </div>

          {/* Pricing summary cards */}
          <div className="bg-[#1A0A00] arabesque-border p-6 sharp-border space-y-4">
            <h3 className="font-bold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-1">
              خلاصه صورت‌حساب دفتری
            </h3>

            <div className="space-y-2 text-xs border-b border-[#C8860A]/10 pb-4">
              <div className="flex items-center justify-between text-[#B8A07A]">
                <span>جمع کل اقلام قلیان</span>
                <span className="font-sans font-bold">{totals.subtotal.toLocaleString()} ت</span>
              </div>
              <div className="flex items-center justify-between text-[#B8A07A]">
                <span>هزینه بسته‌بندی و پست</span>
                {totals.shippingCost === 0 ? (
                  <span className="text-green-500 font-bold">رایگان</span>
                ) : (
                  <span className="font-sans font-bold">{totals.shippingCost.toLocaleString()} ت</span>
                )}
              </div>
              {totals.discount > 0 && (
                <div className="flex items-center justify-between text-red-400">
                  <span>تخفیف کوپن اعمال شده</span>
                  <span className="font-sans font-bold">-{totals.discount.toLocaleString()} ت</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5E6C8]">مبلغ نهایی قابل پرداخت:</span>
              <span className="text-[#E8A820] font-sans font-black text-xl">
                {totals.total.toLocaleString()} تومان
              </span>
            </div>

            {/* Alert info threshold */}
            {totals.subtotal < settings.freeShippingThreshold && (
              <div className="flex items-start gap-2 bg-[#C8860A]/5 border border-[#C8860A]/10 p-3 text-[10px] text-[#B8A07A] leading-relaxed sharp-border">
                <AlertCircle className="w-4 h-4 text-[#C8860A] shrink-0 mt-0.5" />
                <span>
                  شما تنها با خرید <span className="text-[#E8A820] font-bold font-sans">{(settings.freeShippingThreshold - totals.subtotal).toLocaleString()}</span> تومان دیگر، از کادو ارسال رایگان سیستم برخوردار خواهید شد!
                </span>
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={onCheckout}
              className="w-full bg-[#C8860A] hover:bg-[#E8A820] text-[#0E0600] font-bold py-3.5 sharp-border flex items-center justify-center gap-2 transition-all text-sm shadow-xl active:scale-95"
            >
              <span>برو به بخش آدرس و پرداخت</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
