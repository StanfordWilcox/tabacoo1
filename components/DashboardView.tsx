'use client';

import React, { useState, useMemo } from 'react';
import { useShop, Order, Address } from '@/lib/store';
import { ShoppingBag, MapPin, User, LogOut, ChevronLeft, Check, Compass, Trash2, Calendar, ShieldCheck, FileText } from 'lucide-react';

interface DashboardViewProps {
  onBackToShop: () => void;
  onAddToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function DashboardView({ onBackToShop, onAddToast }: DashboardViewProps) {
  const { orders, addresses, currentUser, logout, updateAddress, deleteAddress, addAddress } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // New Address Form States
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Filter orders for logged-in user
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter((o) => o.userId === currentUser.id);
  }, [orders, currentUser]);

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !province || !city || !addressLine || !postalCode) {
      onAddToast('پر کردن تمامی کادرهای آدرس اجباری است.', 'error');
      return;
    }
    
    addAddress({
      fullName,
      phone,
      province,
      city,
      address: addressLine,
      postalCode,
      isDefault: addresses.length === 0,
    });

    onAddToast('✓ آدرس جدید با موفقیت به دفترچه شما اضافه شد.', 'success');
    setShowForm(false);
    setProvince('');
    setCity('');
    setAddressLine('');
    setPostalCode('');
  };

  const statusMap: Record<Order['status'], { text: string; bg: string; textCol: string }> = {
    pending: { text: 'در انتظار پرداخت دفتری', bg: 'bg-amber-500/10', textCol: 'text-amber-500' },
    processing: { text: 'در حال پردازش فیزیکی قلیان', bg: 'bg-blue-500/10', textCol: 'text-blue-400' },
    shipped: { text: 'ارسال شده با مرسوله شتاب', bg: 'bg-purple-500/10', textCol: 'text-purple-400' },
    delivered: { text: 'تحویل داده شده نهایی', bg: 'bg-green-500/10', textCol: 'text-green-500' },
    cancelled: { text: 'لغو شده دفتری', bg: 'bg-red-500/10', textCol: 'text-red-400' },
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center text-right space-y-4">
        <h2 className="text-xl font-bold text-[#F5E6C8]">جهت دسترسی به داشبورد، لطفاً وارد سیستم شوید.</h2>
        <button
          onClick={onBackToShop}
          className="bg-[#C8860A] text-[#0E0600] px-6 py-2.5 sharp-border font-bold text-xs"
        >
          ورود به فروشگاه دخانیات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-32 text-right">
      
      {/* Page Title */}
      <div className="border-b border-[#C8860A]/15 pb-6 mb-10">
        <h1 className="font-serif text-3xl font-black text-[#F5E6C8]">داشبورد کاربری مشتری</h1>
        <p className="text-xs text-[#B8A07A] mt-2 font-light">
          مدیریت آدرس‌ها، فاکتورهای فیزیکی صادر شده و مشخصات بیومتریک شما
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar (3 columns on RHS in Custom RTL) */}
        <div className="lg:col-span-3 bg-[#1A0A00] arabesque-border p-6 sharp-border shrink-0 self-start text-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#C8860A]/10">
            <div className="w-10 h-10 rounded-full bg-[#C8860A]/15 border border-[#C8860A]/35 flex items-center justify-center font-sans font-black text-sm text-[#C8860A]">
              {currentUser.name[0]}
            </div>
            <div>
              <h4 className="font-bold text-[#F5E6C8] text-sm leading-tight">{currentUser.name}</h4>
              <span className="text-[10px] text-[#B8A07A] font-sans block mt-1">{currentUser.phone}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`text-right px-4 py-2.5 sharp-border transition-all flex items-center justify-between font-bold ${
                activeTab === 'orders'
                  ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]'
                  : 'text-[#B8A07A] hover:bg-[#C8860A]/5 hover:text-[#F5E6C8]'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>تاریخچه سفارشات قلیان</span>
              </div>
              <span className="bg-[#0E0600] text-[#B8A07A] font-sans text-[10px] px-1.5 py-0.5 rounded-full">
                {userOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`text-right px-4 py-2.5 sharp-border transition-all flex items-center justify-between font-bold ${
                activeTab === 'addresses'
                  ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]'
                  : 'text-[#B8A07A] hover:bg-[#C8860A]/5 hover:text-[#F5E6C8]'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>دفترچه نشانی‌های من</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`text-right px-4 py-2.5 sharp-border transition-all flex items-center justify-between font-bold ${
                activeTab === 'profile'
                  ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]'
                  : 'text-[#B8A07A] hover:bg-[#C8860A]/5 hover:text-[#F5E6C8]'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 shrink-0" />
                <span>پروفایل و مشخصات کاربری</span>
              </div>
            </button>
          </div>
        </div>

        {/* Contents area (9 columns) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Tab 1: Orders list */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-4">
                سفارشات پستی ثبت شده
              </h3>

              {userOrders.length === 0 ? (
                <div className="arabesque-border bg-[#1A0A00] p-12 text-center sharp-border space-y-4">
                  <ShoppingBag className="w-12 h-12 text-[#C8860A]/30 mx-auto" />
                  <h4 className="font-bold text-[#F5E6C8]">شما تاکنون هیچ سفارشی ثبت نکرده‌اید!</h4>
                  <button
                    onClick={onBackToShop}
                    className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-4 py-2 sharp-border"
                  >
                    شروع اولین خرید لذت‌بخش
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((ord) => {
                    const iconStyle = statusMap[ord.status];
                    return (
                      <div
                        key={ord.id}
                        className="bg-[#1A0A00] arabesque-border p-6 sharp-border space-y-4"
                      >
                        {/* Header details */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#C8860A]/10 text-xs">
                          <div className="flex gap-4 items-center">
                            <span className="font-sans font-black text-[#C8860A]">{ord.id}</span>
                            <span className="text-[#B8A07A]/60 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(ord.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                          </div>

                          <span className={`px-2.5 py-1 text-[10px] font-bold sharp-border ${iconStyle?.bg} ${iconStyle?.textCol}`}>
                            {iconStyle?.text}
                          </span>
                        </div>

                        {/* Items listed */}
                        <div className="space-y-2.5">
                          {ord.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs font-light">
                              <span className="text-[#F5E6C8] font-bold">
                                {item.productSnapshot.name} <span className="font-sans text-[10px] text-[#B8A07A] pr-1">({item.quantity} عدد)</span>
                              </span>
                              <span className="font-sans font-bold text-[#B8A07A]">
                                {item.price.toLocaleString()} تومان
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order breakdown */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#C8860A]/10 text-xs text-[#B8A07A]">
                          <div>
                            <span className="text-[11px] block text-[#B8A07A]/75">مرسوله به آدرس:</span>
                            <p className="font-light pr-1 leading-relaxed mt-0.5">{ord.shippingAddress.address}</p>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="text-[11px] block text-[#B8A07A]/75">مبلغ کل فاکتور:</span>
                            <span className="text-[#E8A820] font-sans font-black mt-0.5 block text-sm">
                              {ord.totalAmount.toLocaleString()} تومان
                            </span>
                          </div>
                        </div>

                        {/* Tracking code panel */}
                        {ord.trackingCode && (
                          <div className="bg-[#0E0600] border border-purple-500/20 p-2.5 sharp-border flex items-center justify-between text-xs text-purple-400 mt-2 font-mono">
                            <span>کد رهگیری پست پیشتاز:</span>
                            <span className="font-bold tracking-widest">{ord.trackingCode}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Addresses manager */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-4 mb-4">
                <h3 className="font-bold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3">
                  نشانی‌های پستی ذخیره شده
                </h3>

                <button
                  onClick={() => setShowForm(!showForm)}
                  className="text-xs bg-[#C8860A]/10 text-[#C8860A] hover:bg-[#C8860A] hover:text-[#0E0600] px-3.5 py-2 sharp-border transition-colors font-bold"
                >
                  {showForm ? 'انصراف' : 'ثبت نشانی جدید +'}
                </button>
              </div>

              {showForm ? (
                <form onSubmit={handleCreateAddress} className="bg-[#1A0A00] arabesque-border p-6 sharp-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">نام کامل گیرنده</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">تلفن تماس مستقیم</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">استان</label>
                    <input
                      type="text"
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">شهر</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">آدرس تفصیلی دقیق</label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-light"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">کد پستی ۱۰ رقمی</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="bg-[#C8860A] text-[#0E0600] px-8 py-2.5 text-xs font-bold sharp-border hover:bg-[#E8A820]"
                    >
                      ثبت نشانی جدید در لایه امن
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="bg-[#1A0A00] border border-[#C8860A]/15 p-4 sharp-border text-xs space-y-3 relative"
                    >
                      <div className="flex items-center justify-between border-b border-[#C8860A]/5 pb-2.5">
                        <span className="font-bold text-[#F5E6C8] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C8860A]" />
                          {a.fullName}
                        </span>
                        
                        <button
                          onClick={() => {
                            deleteAddress(a.id);
                            onAddToast('نشانی با موفقیت حذف گردید.', 'info');
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="حذف نشانی"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[#B8A07A] leading-relaxed font-light">{`${a.province}، ${a.city}، ${a.address}`}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-[#B8A07A]/65 font-mono pt-1">
                        <span>کد پستی: {a.postalCode}</span>
                        <span>تلفن: {a.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: User profiles info */}
          {activeTab === 'profile' && (
            <div className="bg-[#1A0A00] arabesque-border p-6 sharp-border space-y-6">
              <h3 className="font-bold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-4">
                تطبیق بیومتریک و پروفایل کاربری
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#B8A07A] font-light">
                <div className="space-y-1 bg-[#0E0600] p-3 border border-[#C8860A]/5">
                  <span className="text-[10px] text-[#C8860A] font-semibold">ایمیل کارفرما:</span>
                  <p className="font-sans font-bold text-[#F5E6C8] mt-1 pr-1">{currentUser.email}</p>
                </div>

                <div className="space-y-1 bg-[#0E0600] p-3 border border-[#C8860A]/5">
                  <span className="text-[10px] text-[#C8860A] font-semibold">تلفن همراه فعال:</span>
                  <p className="font-sans font-bold text-[#F5E6C8] mt-1 pr-1">{currentUser.phone}</p>
                </div>

                <div className="space-y-1 bg-[#0E0600] p-3 border border-[#C8860A]/5">
                  <span className="text-[10px] text-[#C8860A] font-semibold">سطح کاربری سیستم:</span>
                  <p className="font-bold text-[#E8A820] mt-1 pr-1">مشتری ویژه VIP دخانیات پارسی</p>
                </div>

                <div className="space-y-1 bg-[#0E0600] p-3 border border-[#C8860A]/5">
                  <span className="text-[10px] text-[#C8860A] font-semibold">تاریخ تسلیم مدارک/عضویت:</span>
                  <p className="font-sans text-[#F5E6C8] mt-1 pr-1">۲۰۲۶/۰۶/۱۲</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
