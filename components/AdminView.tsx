'use client';

import React, { useState, useMemo } from 'react';
import { useShop, Product, Category, Order, User, Coupon, Review, Settings } from '@/lib/store';
import {
  LayoutDashboard, Package, Folders, Ticket, ShoppingCart, Users, Star,
  BarChart3, Code, Settings as SettingsIcon, Bell, Search, Plus, Trash2,
  Edit2, Check, X, Shield, Printer, ArrowLeftRight, Eye, Key, Send, HelpCircle, Info,
  FileText
} from 'lucide-react';

interface AdminViewProps {
  onBackToCustomer: () => void;
  onAddToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminView({ onBackToCustomer, onAddToast }: AdminViewProps) {
  const {
    products, categories, orders, users, coupons, reviews, settings,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
    addCoupon, toggleCoupon,
    updateOrderStatus, approveReview, rejectReview,
    updateSettings
  } = useShop();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'coupons' | 'orders' | 'customers' | 'reviews' | 'reports' | 'api' | 'settings'>('dashboard');

  // Search filter inside admin tables
  const [adminSearch, setAdminSearch] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'سفارش جدید ORD-1003 نیاز به تایید دارد', time: '۱۰ دقیقه پیش' },
    { id: 2, text: 'طعم بلوبری یخ به حداقل موجودی رسید!', time: '۱ ساعت پیش' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- CRUD States ---
  // Product Form Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pCompare, setPCompare] = useState<number | undefined>(undefined);
  const [pStock, setPStock] = useState(10);
  const [pCategory, setPCategory] = useState(categories[0]?.id || 'cat-1');
  const [pBrand, setPBrand] = useState('دخانیات پارسی');
  const [pWeight, setPWeight] = useState('۵۰ گرم');
  const [pTags, setPTags] = useState('');
  const [pImage, setPImage] = useState('https://picsum.photos/seed/smoke/600/600');
  const [pIsFeatured, setPIsFeatured] = useState(false);

  // Category Form Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [cName, setCName] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cImage, setCImage] = useState('https://picsum.photos/seed/cat/400/300');

  // Order Details Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  
  // Create Coupon Modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [coCode, setCoCode] = useState('');
  const [coType, setCoType] = useState<'percent' | 'fixed'>('percent');
  const [coValue, setCoValue] = useState(10);
  const [coMinOrder, setCoMinOrder] = useState(100000);
  const [coMaxUses, setCoMaxUses] = useState(100);

  // Create API Key Map
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Zarinpal Connection V1', key: 'pk_live_832174...bb9a2', date: '۲۰۲۶/۰۳/۱۲', status: 'فعال' },
    { id: '2', name: 'Post Office Express Hook', key: 'pk_live_094124...cca12', date: '۲۰۲۶/۰۶/۰۱', status: 'غیرفعال' }
  ]);
  const [newApiKeyName, setNewApiKeyName] = useState('');

  // Settings Edit states
  const [sPhone, setSPhone] = useState(settings.phone);
  const [sEmail, setSEmail] = useState(settings.email);
  const [sAddress, setSAddress] = useState(settings.address);
  const [sMerchant, setSMerchant] = useState(settings.zarinpalMerchantId);
  const [sFreeShip, setSFreeShip] = useState(settings.freeShippingThreshold);

  // --- Handlers ---
  const handleOpenProductModal = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setPName(prod.name);
      setPSlug(prod.slug);
      setPPrice(prod.price);
      setPCompare(prod.comparePrice);
      setPStock(prod.stock);
      setPCategory(prod.categoryId);
      setPBrand(prod.brand);
      setPWeight(prod.weight);
      setPTags(prod.tags.join(', '));
      setPImage(prod.images[0]);
      setPIsFeatured(prod.isFeatured);
    } else {
      setEditingProduct(null);
      setPName('');
      setPSlug('');
      setPPrice(75000);
      setPCompare(undefined);
      setPStock(50);
      setPCategory(categories[0]?.id || 'cat-1');
      setPBrand('دخانیات پارسی');
      setPWeight('۵۰ گرم');
      setPTags('تنباکو، دوسیب، سنگین');
      setPImage('https://picsum.photos/seed/smoke/600/600');
      setPIsFeatured(false);
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pSlug || pPrice <= 0) {
      onAddToast('کادرهای ستاره‌دار باید به دقت پر شوند.', 'error');
      return;
    }

    const tagsArray = pTags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: pName,
        slug: pSlug,
        price: pPrice,
        comparePrice: pCompare,
        stock: pStock,
        categoryId: pCategory,
        brand: pBrand,
        weight: pWeight,
        tags: tagsArray,
        images: [pImage],
        isFeatured: pIsFeatured
      });
      onAddToast(`✓ محصول ${pName} با موفقیت در سیستم اصلاح شد.`, 'success');
    } else {
      addProduct({
        name: pName,
        slug: pSlug,
        description: 'طعم دهی و پخت دستی ممتاز تولیدی با نشان اصالت پارسی.',
        price: pPrice,
        comparePrice: pCompare,
        stock: pStock,
        categoryId: pCategory,
        brand: pBrand,
        weight: pWeight,
        tags: tagsArray,
        images: [pImage],
        isActive: true,
        isFeatured: pIsFeatured
      });
      onAddToast(`✓ محصول خارق‌العاده جدید ${pName} تولید و انبار شد.`, 'success');
    }
    setProductModalOpen(false);
  };

  const handleOpenCatModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCat(cat);
      setCName(cat.name);
      setCSlug(cat.slug);
      setCDesc(cat.description);
    } else {
      setEditingCat(null);
      setCName('');
      setCSlug('');
      setCDesc('');
    }
    setCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cSlug) return;

    if (editingCat) {
      updateCategory(editingCat.id, { name: cName, slug: cSlug, description: cDesc });
      onAddToast(`✓ شاخه ${cName} بازبینی شد.`, 'success');
    } else {
      addCategory({ name: cName, slug: cSlug, description: cDesc, image: cImage, isActive: true });
      onAddToast(`✓ گروه بندی جدید ${cName} به شجره فروشگاه پیوست.`, 'success');
    }
    setCatModalOpen(false);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coCode) return;

    addCoupon({
      code: coCode.toUpperCase(),
      type: coType,
      value: coValue,
      minOrder: coMinOrder,
      maxUses: coMaxUses,
      expiresAt: '2027-12-31T23:59:59Z',
      isActive: true
    });
    onAddToast(`✓ کوپن طلایی ${coCode} صادر و توزیع گردید.`, 'success');
    setCouponModalOpen(false);
    setCoCode('');
  };

  const handleAddApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKeyName) return;

    const newKey = {
      id: `${Date.now()}`,
      name: newApiKeyName,
      key: `pk_live_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      date: '۲۰۲۶/۰۶/۱۲',
      status: 'فعال'
    };
    setApiKeys([...apiKeys, newKey]);
    onAddToast('✓ کلید اتصال رمزنگاری شده API ایجاد شد.', 'success');
    setNewApiKeyName('');
  };

  const handleSaveSettings = () => {
    updateSettings({
      phone: sPhone,
      email: sEmail,
      address: sAddress,
      zarinpalMerchantId: sMerchant,
      freeShippingThreshold: sFreeShip
    });
    onAddToast('✓ پیکربندی سیستم با موفقیت به هاست دفتری اعمال شد.', 'success');
  };

  // --- Statistics computations for Dashboard ---
  const stats = useMemo(() => {
    const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((total, o) => total + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const activeClients = users.filter(u => u.isActive).length;
    const avgBasket = totalSales / (orders.length || 1);

    return { totalSales, pendingOrders, activeClients, avgBasket };
  }, [orders, users]);

  const filteredProdList = useMemo(() => {
    return products.filter(p => p.name.includes(adminSearch) || p.brand.includes(adminSearch));
  }, [products, adminSearch]);

  const filteredOrderList = useMemo(() => {
    return orders.filter(o => o.id.includes(adminSearch) || o.shippingAddress.fullName.includes(adminSearch));
  }, [orders, adminSearch]);

  return (
    <div className="min-h-screen bg-[#090400] text-[#F5E6C8] font-sans flex flex-col md:flex-row relative text-right">
      
      {/* 1. Sidebar Control (Fixed right hand side, 240px wide) */}
      <aside className="w-full md:w-[240px] bg-[#110800] border-l border-[#C8860A]/15 md:min-h-screen flex flex-col justify-between shrink-0 p-4 md:sticky md:top-0 z-40">
        <div className="space-y-8">
          {/* Logo with spinning mini-mandala */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-[#C8860A]/15 cursor-pointer" onClick={onBackToCustomer}>
            <div className="relative w-7 h-7 flex items-center justify-center bg-[#C8860A]/10 border border-[#C8860A]/50 rounded-full text-[#C8860A] overflow-hidden">
              <span className="animate-spin-slow text-[8px] font-serif font-black">⚜</span>
            </div>
            <div>
              <h1 className="font-serif text-sm font-bold text-[#C8860A] tracking-wider leading-none">دخانیات پارسی</h1>
              <span className="text-[9px] text-[#B8A07A] font-light mt-0.5 block">کنترل مرکزی فروشگاه</span>
            </div>
          </div>

          {/* Nav list grouped */}
          <div className="space-y-6">
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-[#9A8060] font-bold mb-3">آمار و عملکرد</span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  activeTab === 'dashboard' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-[#C8860A]" />
                <span>میز پیشخوان اداری</span>
              </button>
            </div>

            <div>
              <span className="block text-[9px] uppercase tracking-wider text-[#9A8060] font-bold mb-3">مدیریت غرفه</span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'products' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>انبار محصولات قلیان</span>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'categories' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <Folders className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>شاخه و دسته‌بندی‌ها</span>
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'coupons' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <Ticket className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>کدهای تخفیف دفتری</span>
                </button>
              </div>
            </div>

            <div>
              <span className="block text-[9px] uppercase tracking-wider text-[#9A8060] font-bold mb-3">دفتر فروش</span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'orders' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>سفارش‌های صادره</span>
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'customers' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>فهرست مشتریان</span>
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'reviews' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <Star className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>نظرات خریداران</span>
                </button>
              </div>
            </div>

            <div>
              <span className="block text-[9px] uppercase tracking-wider text-[#9A8060] font-bold mb-3">سیستم هسته</span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'reports' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>تراز و گزارش‌ها</span>
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'api' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <Code className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>پنل وب سرویس API</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-right px-3.5 py-2.5 sharp-border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    activeTab === 'settings' ? 'bg-[#C8860A]/10 text-[#C8860A] border-r-2 border-[#C8860A]' : 'text-[#9A8060] hover:text-[#F5E6C8] hover:bg-[#C8860A]/5'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4 shrink-0 text-[#C8860A]" />
                  <span>تنظیمات وب‌سایت</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin profile detail bottom of sidebar */}
        <div className="mt-8 pt-4 border-t border-[#C8860A]/15 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#C8860A]/15 border border-[#C8860A]/35 text-[#C8860A] font-bold text-center flex items-center justify-center">
              م‌پ
            </div>
            <div>
              <p className="font-bold text-[#F5E6C8]">مدیر دخانیات</p>
              <span className="text-[10px] text-[#9A8060] block tracking-wide">رئیس کل دپارتمان</span>
            </div>
          </div>

          <button
            onClick={onBackToCustomer}
            className="p-1 px-1.5 border border-[#C8860A]/30 hover:border-[#C8860A] sharp-border text-[9px] text-[#C8860A] hover:bg-[#C8860A]/10 transition-colors shrink-0"
            title="بازگشت به لایه غرفه خریداران"
          >
            غرفه مشتری
          </button>
        </div>
      </aside>

      {/* 2. Admin Content Area */}
      <main className="flex-grow flex flex-col min-w-0 bg-[#090400]">
        
        {/* Sticky topbar */}
        <header className="sticky top-0 bg-[#110800] border-b border-[#C8860A]/10 px-6 py-4 flex items-center justify-between z-30">
          <div>
            <h2 className="text-sm font-black text-[#F5E6C8] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C8860A]" />
              پیکربندی سیستم ⚜ {activeTab === 'dashboard' ? 'پیشخوان ارقام فروشگاه' : activeTab === 'products' ? 'کاتالوگ و انبارداری' : activeTab === 'categories' ? 'شاخه درخت اداری' : activeTab === 'orders' ? 'کنترل فاکتورها' : activeTab === 'reviews' ? 'ارزیابی دیدگاه‌ها' : activeTab === 'settings' ? 'تنظیمات کلی غرفه' : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative max-w-xs hidden sm:block">
              <input
                type="text"
                placeholder="تحقیق کلی..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="bg-[#1C0E00] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-8 py-2 text-[#F5E6C8] outline-none sharp-border text-right leading-none"
              />
              <Search className="w-3.5 h-3.5 text-[#C8860A] absolute left-2.5 top-2.5" />
            </div>

            {/* Notifications badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 border border-[#C8860A]/15 bg-[#1C0E00] hover:border-[#C8860A]/40 sharp-border relative"
                title="پیام‌ها"
              >
                <Bell className="w-4 h-4 text-[#C8860A]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B1A1A] absolute top-1.5 right-1.5 animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute left-0 mt-2 w-72 bg-[#1C0E00] border border-[#C8860A]/35 shadow-2xl p-2.5 text-right text-xs sharp-border z-50 space-y-2">
                  <span className="block font-bold text-[#E8A820] border-b border-[#C8860A]/10 pb-1.5">اطلاعیه‌های اخیر قلیان</span>
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 hover:bg-[#C8860A]/5 border-b border-[#C8860A]/5 last:border-0 leading-relaxed text-light">
                      <p className="text-[#F5E6C8] text-[11px]">{n.text}</p>
                      <span className="text-[9px] text-[#9A8060] block mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab content dashboards */}
        <div className="p-6 space-y-6">
          
          {/* VIEW 1: DASHBOARD STATS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#9A8060] font-bold block">مجموع تراز فروش دفتری</span>
                    <span className="text-xl font-sans font-black text-[#E8A820] mt-1.5 block">
                      {stats.totalSales.toLocaleString()} تومان
                    </span>
                  </div>
                  <BarChart3 className="w-8 h-8 text-[#C8860A]/40" />
                </div>

                <div className="stat-card crimson p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#9A8060] font-bold block">فاکتورهای بلاتکلیف انبار</span>
                    <span className="text-xl font-sans font-black text-[#8B1A1A] mt-1.5 block">
                      {stats.pendingOrders} سفارش
                    </span>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-[#8B1A1A]/40" />
                </div>

                <div className="stat-card green p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#9A8060] font-bold block">مشتریان فعال بیومتریک</span>
                    <span className="text-xl font-sans font-black text-green-500 mt-1.5 block">
                      {stats.activeClients} مشتری
                    </span>
                  </div>
                  <Users className="w-8 h-8 text-green-500/30" />
                </div>

                <div className="stat-card blue p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#9A8060] font-bold block">میانگین مبلغ هر سبد</span>
                    <span className="text-xl font-sans font-black text-blue-400 mt-1.5 block">
                      {Math.round(stats.avgBasket).toLocaleString()} تومان
                    </span>
                  </div>
                  <ArrowLeftRight className="w-8 h-8 text-blue-400/30" />
                </div>
              </div>

              {/* Weekly bar report charts & Best sellers */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Custom CSS Bar Charts */}
                <div className="panel lg:col-span-8 p-6 space-y-4">
                  <h3 className="font-bold text-xs text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-6">
                    نمودار تراز درآمد فیزیکی (هفتگی)
                  </h3>
                  
                  {/* Bars layout */}
                  <div className="h-60 flex items-end justify-between font-sans text-[10px] pt-4 pr-4">
                    {[
                      { day: 'شنبه', val: 75, Label: '۷۵۰,۰۰۰ ت' },
                      { day: 'یکشنبه', val: 90, Label: '۹۰۰,۰۰۰ ت' },
                      { day: 'دوشنبه', val: 40, Label: '۴۰۰,۰۰۰ ت' },
                      { day: 'سه شنبه', val: 120, Label: '۱.۲ م ت' },
                      { day: 'چهارشنبه', val: 180, Label: '۱.۸ م ت' },
                      { day: 'پنج شنبه', val: 240, Label: '۲.۴ م ت' },
                      { day: 'جمعه', val: 290, Label: '۲.۹ م ت' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 group w-12">
                        <span className="text-[#E8A820] font-sans font-black text-3xs opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-8 bg-[#110800] border border-[#C8860A]/30 p-1 rounded">
                          {item.Label}
                        </span>
                        <div
                          className="w-4 bg-gradient-to-t from-[#C8860A] to-[#E8A820] shadow-md group-hover:from-[#E8A820] sharp-border hover:brightness-110 cursor-pointer"
                          style={{ height: `${item.val}px` }}
                        />
                        <span className="text-[#9A8060] font-bold text-center mt-1 text-[9px] font-sans">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Best Selling */}
                <div className="panel lg:col-span-4 p-6 text-xs space-y-4">
                  <h3 className="font-bold text-xs text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-4">
                    محبوب‌ترین طعم‌های هفته
                  </h3>
                  <div className="space-y-3 pt-2">
                    {products.slice(0, 3).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-[#1C0E00] border border-[#C8860A]/10 hover:border-[#C8860A]/30 sharp-border">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-black text-[#C8860A]">{idx + 1}</span>
                          <span className="font-bold text-[#F5E6C8] line-clamp-1">{p.name}</span>
                        </div>
                        <span className="font-sans font-bold text-emerald-500">موجود</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full-width Recent orders table */}
              <div className="panel p-6">
                <h3 className="font-bold text-xs text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-6">
                  آخرین اسناد فاکتوری صادره
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full admin-table text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#C8860A]/15">
                        <th className="p-3">شماره معامله</th>
                        <th className="p-3">تحویل‌گیرنده</th>
                        <th className="p-3">مبلغ دریافتی</th>
                        <th className="p-3">روش پرداخت</th>
                        <th className="p-3">وضعیت اداری</th>
                        <th className="p-3">تاریخ سند</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C8860A]/10">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="transition-colors">
                          <td className="p-3 font-sans font-black text-[#C8860A]">{o.id}</td>
                          <td className="p-3 font-bold">{o.shippingAddress.fullName}</td>
                          <td className="p-3 font-sans font-bold text-[#E8A820]">{o.totalAmount.toLocaleString()} ت</td>
                          <td className="p-3 font-light text-2xs">{o.paymentMethod}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              o.status === 'delivered' ? 'bg-green-950/40 text-green-500' : 'bg-blue-950/40 text-blue-400'
                            }`}>
                              {o.status === 'delivered' ? 'تحویل شد' : 'در حال پردازش'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-[#9A8060]">
                            {new Date(o.createdAt).toLocaleDateString('fa-IR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PRODUCTS CATALOG MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-4">
                <h3 className="font-bold text-xs text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A]">
                  کنترل کل محصولات کاتالوگ ({products.length} کالا)
                </h3>
                
                <button
                  onClick={() => handleOpenProductModal()}
                  className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-4 py-2 hover:bg-[#E8A820] flex items-center gap-1.5 sharp-border"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تولید و ثبت کالا +</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full admin-table text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#C8860A]/15">
                        <th className="p-3">تصویر</th>
                        <th className="p-3">اسم تجاری</th>
                        <th className="p-3">برند</th>
                        <th className="p-3">موجودی انبار</th>
                        <th className="p-3">قیمت مصرف‌کننده</th>
                        <th className="p-3 text-left">عملیات دفتری</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C8860A]/10">
                      {filteredProdList.map((p) => {
                        return (
                          <tr key={p.id} className="transition-colors">
                            <td className="p-3">
                              <div className="w-10 h-10 bg-[#0E0600] border border-[#C8860A]/10 p-0.5 rounded">
                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="p-3 font-bold text-[#F5E6C8]">{p.name}</td>
                            <td className="p-3 text-[#9A8060] font-sans font-bold">{p.brand}</td>
                            <td className="p-3 font-sans">
                              {p.stock > 0 ? (
                                <span className="text-[#3DA050] font-bold">{p.stock} عدد</span>
                              ) : (
                                <span className="text-red-500 font-bold">ناموجود</span>
                              )}
                            </td>
                            <td className="p-3 font-sans font-bold text-[#E8A820]">{p.price.toLocaleString()} تومان</td>
                            <td className="p-3 text-left space-x-2">
                              {/* Edit */}
                              <button
                                onClick={() => handleOpenProductModal(p)}
                                className="p-1 px-2 border border-[#C8860A]/20 hover:border-[#C8860A] text-[#C8860A] text-[10px] sharp-border transition-colors font-bold inline-block"
                              >
                                ویرایش کالا
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => {
                                  deleteProduct(p.id);
                                  onAddToast(`محصول ${p.name} از کاتالوگ مرخص شد.`, 'info');
                                }}
                                className="p-1 px-2 border border-red-500/20 hover:border-red-500 text-red-400 text-[10px] sharp-border transition-colors font-bold inline-block"
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-4">
                <h3 className="font-bold text-xs text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A]">
                  شاخه و درخت دسته‌بندی‌های اداری
                </h3>

                <button
                  onClick={() => handleOpenCatModal()}
                  className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-4 py-2 hover:bg-[#E8A820] flex items-center gap-1.5 sharp-border"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>دسته‌بندی جدید +</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="panel p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0E0600] p-1 border border-[#C8860A]/15 overflow-hidden">
                        <img src={cat.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#F5E6C8]">{cat.name}</h4>
                        <span className="text-[10px] text-[#9A8060] font-mono block mt-1">{cat.slug}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#9A8060] leading-relaxed line-clamp-2">
                      {cat.description || 'توضیحات و اسناد حمایتی برای این شاخه ثبت نگردیده است.'}
                    </p>

                    <div className="flex justify-end gap-2 text-[10px] pt-3 border-t border-[#C8860A]/5">
                      <button
                        onClick={() => handleOpenCatModal(cat)}
                        className="p-1 px-2 border border-[#C8860A]/30 text-[#C8860A] hover:bg-[#C8860A] hover:text-[#0E0600] sharp-border font-bold"
                      >
                        اصلاح گروه
                      </button>
                      <button
                        onClick={() => {
                          deleteCategory(cat.id);
                          onAddToast('شاخه با موفقیت حذف گردید.', 'info');
                        }}
                        className="p-1 px-2 border border-red-500/20 text-red-400 hover:border-red-500 sharp-border font-bold"
                      >
                        حذف شاخه
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: COUPONS CODE HUB */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-4">
                <h3 className="font-bold text-xs text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A]">
                  سیاست‌گذاری و انتشار کدهای تخفیف
                </h3>

                <button
                  onClick={() => setCouponModalOpen(true)}
                  className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-4 py-2 hover:bg-[#E8A820] flex items-center gap-1.5 sharp-border"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>طرح تخفیف جدید +</span>
                </button>
              </div>

              {/* Coupons List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coupons.map((c) => (
                  <div key={c.id} className="panel p-5 relative overflow-hidden flex flex-col justify-between h-40">
                    <div className="flex items-center justify-between border-b border-[#C8860A]/10 pb-2.5">
                      <span className="font-sans font-black text-sm text-[#C8860A] tracking-widest">{c.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        c.isActive ? 'bg-green-950 text-green-500' : 'bg-red-950 text-red-500'
                      }`}>
                        {c.isActive ? 'فعال سیستم' : 'منقضی شده'}
                      </span>
                    </div>

                    <div className="text-xs space-y-2 py-3 text-[#9A8060]">
                      <div className="flex justify-between">
                        <span>نوع کسر بها:</span>
                        <span className="font-bold text-[#F5E6C8]">{c.type === 'percent' ? `${c.value} درصد کسر کل` : `${c.value.toLocaleString()} ت کسر ثابت`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>حداقل فاکتور فیزیکی:</span>
                        <span className="font-mono text-[#F5E6C8] font-bold">{c.minOrder.toLocaleString()} تومان</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-[#C8860A]/5">
                      <button
                        onClick={() => {
                          toggleCoupon(c.id);
                          onAddToast(`عملیات سوئیچ کد انجام پذیرفت.`, 'success');
                        }}
                        className="text-[10px] text-[#E8A820] hover:underline"
                      >
                        تغییر وضعیت فعال‌سازی
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 5: ORDERS MANAGEMENT & PROCESS TIMELINE */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="font-bold text-xs text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A] border-b border-[#C8860A]/15 pb-4 mb-4">
                تأیید فاکتورها و عملیات پستی سفارشات
              </h3>

              <div className="panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full admin-table text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#C8860A]/15">
                        <th className="p-3">شماره مرجع</th>
                        <th className="p-3">مشتری</th>
                        <th className="p-3">مبلغ نهایی</th>
                        <th className="p-3">گیرنده و استان</th>
                        <th className="p-3">وضعیت کنونی</th>
                        <th className="p-3 text-left">اقدام عملی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C8860A]/10">
                      {filteredOrderList.map((ord) => (
                        <tr key={ord.id}>
                          <td className="p-3 font-sans font-black text-[#C8860A]">{ord.id}</td>
                          <td className="p-3 font-bold">{ord.shippingAddress.fullName}</td>
                          <td className="p-3 font-sans font-bold text-[#E8A820]">{ord.totalAmount.toLocaleString()} تومان</td>
                          <td className="p-3 font-light text-2xs">{ord.shippingAddress.province}، {ord.shippingAddress.city}</td>
                          <td className="p-3">
                            <select
                              value={ord.status}
                              onChange={(e) => {
                                updateOrderStatus(ord.id, e.target.value as Order['status']);
                                onAddToast(`✓ وضعیت سفارش ${ord.id} اصلاح شد.`, 'success');
                              }}
                              className="bg-[#090400] border border-[#C8860A]/20 text-[10px] px-2 py-1 text-[#F5E6C8] outline-none sharp-border font-light"
                            >
                              <option value="pending">در انتظار پرداخت</option>
                              <option value="processing">در حال پردازش</option>
                              <option value="shipped">ارسال شده با پست</option>
                              <option value="delivered">تحویل داده شده</option>
                              <option value="cancelled">لغو شده</option>
                            </select>
                          </td>
                          <td className="p-3 text-left font-sans">
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setTrackingCodeInput(ord.trackingCode || '');
                              }}
                              className="p-1 px-2 border border-[#C8860A]/25 text-[#C8860A] hover:bg-[#C8860A]/10 text-[10px] sharp-border font-bold inline-block cursor-pointer"
                            >
                              بررسی فاکتور پستی
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h3 className="font-bold text-xs text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A] border-b border-[#C8860A]/15 pb-4 mb-4">
                فهرست کامل ثبت‌نام بیومتریک شتاب مشتریان
              </h3>

              <div className="panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full admin-table text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#C8860A]/15">
                        <th className="p-3">اسم کارفرما</th>
                        <th className="p-3">آدرس پست الکترونیکی</th>
                        <th className="p-3">شماره تماس فعال</th>
                        <th className="p-3">نقش سیستمی</th>
                        <th className="p-3">تاریخ الحاق به سامانه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C8860A]/10">
                      {users.map((usr) => (
                        <tr key={usr.id}>
                          <td className="p-3 font-bold text-[#F5E6C8]">{usr.name}</td>
                          <td className="p-3 font-sans font-light text-2xs">{usr.email}</td>
                          <td className="p-3 font-sans font-bold">{usr.phone}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              usr.role === 'admin' ? 'bg-amber-950 text-[#C8860A]' : 'bg-[#1C0E00] text-[#9A8060]'
                            }`}>
                              {usr.role === 'admin' ? 'مدیر ارشد' : 'مشتری VIP'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-[#9A8060]">
                            {new Date(usr.createdAt).toLocaleDateString('fa-IR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 7: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h3 className="font-bold text-xs text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A] border-b border-[#C8860A]/15 pb-4 mb-4">
                داشبورد ارزیابی و ممیزی دیدگاه‌های خریداران
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {reviews.map((rev) => {
                  const itemProdName = products.find(p => p.id === rev.productId)?.name || 'کالای ناشناس';
                  return (
                    <div key={rev.id} className="panel p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs border-b border-[#C8860A]/5 pb-2.5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#F5E6C8]">{rev.userName}</span>
                          <span className="text-[10px] text-[#9A8060] font-bold">برای محصول: <span className="text-[#C8860A]">{itemProdName}</span></span>
                        </div>

                        <span className={`px-2 py-0.5 text-[9px] font-semibold ${
                          rev.isApproved ? 'bg-green-950 text-green-500' : 'bg-yellow-950 text-yellow-500'
                        }`}>
                          {rev.isApproved ? 'تأیید شد' : 'در انتظار ممیزی'}
                        </span>
                      </div>

                      <div className="flex gap-0.5 text-amber-500 text-xs">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'opacity-20'}`} />
                        ))}
                      </div>

                      <p className="text-xs text-[#9A8060] leading-relaxed text-justify pr-1">{rev.comment}</p>

                      <div className="flex justify-end gap-2 text-[10px] pt-3 border-t border-[#C8860A]/5">
                        {!rev.isApproved && (
                          <button
                            onClick={() => {
                              approveReview(rev.id);
                              onAddToast('دیدگاه ممیزی و در تالار محصولات الحاق شد.', 'success');
                            }}
                            className="p-1 px-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold sharp-border"
                          >
                            تأیید بازنشر ✓
                          </button>
                        )}
                        <button
                          onClick={() => {
                            rejectReview(rev.id);
                            onAddToast('کمنت رد و از سرور بایگانی شد.', 'info');
                          }}
                          className="p-1 px-2 border border-red-500/20 text-red-400 hover:border-red-500 sharp-border font-bold animate-pulse"
                        >
                          رد پیام ✗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 8: REPORTS & PROGRESS INVENTORY */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="font-bold text-xs text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A] border-b border-[#C8860A]/15 pb-4 mb-4">
                تراز کل و سطح انبارداری فیزیکی
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Geographics breakdown list */}
                <div className="panel p-6 space-y-4">
                  <h4 className="font-bold text-xs text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-4">توزیع تقاضای مرسولات بر اساس استان</h4>
                  <div className="space-y-3.5 pt-2 text-xs">
                    {[
                      { state: 'تهران', num: 65, text: '۶۵ درصد تقاضا' },
                      { state: 'اصفهان', num: 15, text: '۱۵ درصد تقاضا' },
                      { state: 'فارس', num: 12, text: '۱۲ درصد تقاضا' },
                      { state: 'مازندران', num: 8, text: '۸ درصد تقاضا' }
                    ].map((g, i) => (
                      <div key={i} className="space-y-1.5 font-light">
                        <div className="flex justify-between text-2xs text-[#B8A07A]">
                          <span>استان {g.state}</span>
                          <span>{g.text}</span>
                        </div>
                        <div className="w-full bg-[#0E0600] h-2 sharp-border overflow-hidden">
                          <div className="bg-[#C8860A] h-full" style={{ width: `${g.num}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock Warning Progress Indicators */}
                <div className="panel p-6 space-y-4">
                  <h4 className="font-bold text-xs text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-4 text-rose-500">موجودی بحرانی اقلام انبار عمومی</h4>
                  <div className="space-y-3.5 pt-2 text-xs">
                    {products.slice(0, 4).map((p) => {
                      const percentLeft = Math.min(100, (p.stock / 200) * 100);
                      const isLow = p.stock < 30;

                      return (
                        <div key={p.id} className="space-y-1.5 font-light">
                          <div className="flex justify-between text-2xs text-[#B8A07A]">
                            <span className="font-bold">{p.name}</span>
                            <span className={isLow ? 'text-red-500 font-bold' : ''}>موجودی: {p.stock} عدد</span>
                          </div>
                          <div className="w-full bg-[#0E0600] h-2 sharp-border overflow-hidden">
                            <div className={`h-full ${isLow ? 'bg-red-600' : 'bg-emerald-600'}`} style={{ width: `${percentLeft}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 9: API PANELS (METHOD BADGES / API KEYS) */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              
              <div className="panel p-6 max-w-4xl mx-auto space-y-4">
                <div className="flex items-center gap-3 border-b border-[#C8860A]/10 pb-4 mb-4">
                  <Key className="w-5 h-5 text-[#C8860A]" />
                  <div>
                    <h3 className="font-bold text-sm text-[#F5E6C8]">Persian Smoke API Integration Hub v2.0</h3>
                    <p className="text-[10px] text-[#9A8060] mt-1 font-light">پلاگین‌ها و سرورهای خروجی وب‌سرویس اختصاصی دخانیات پارسی</p>
                  </div>
                </div>

                {/* API Method badges */}
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-[11px] text-[#B8A07A]">لیست اندپوینت‌های هسته لایه وب</h4>
                  
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between p-2.5 bg-[#0E0600] border border-[#C8860A]/10 text-3xs">
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[9px]">GET</span>
                        <span className="text-[#F5E6C8]">/api/v2/products</span>
                      </div>
                      <span className="text-[#9A8060] font-sans">فراخوانی کاتالوگ عمومی کالاها</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#0E0600] border border-[#C8860A]/10 text-3xs">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[9px]">POST</span>
                        <span className="text-[#F5E6C8]">/api/v2/products</span>
                      </div>
                      <span className="text-[#9A8060] font-sans">افزودن و انبارگذاری طعم جدید</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#0E0600] border border-[#C8860A]/10 text-3xs">
                      <div className="flex items-center gap-3">
                        <span className="bg-red-700 text-white font-bold px-2 py-0.5 rounded text-[9px]">DELETE</span>
                        <span className="text-[#F5E6C8]">/api/v2/products/:id</span>
                      </div>
                      <span className="text-[#9A8060] font-sans">حذف یا بایکوت کردن طعم</span>
                    </div>
                  </div>
                </div>

                {/* API Keys Table & Form */}
                <div className="space-y-4 pt-6 border-t border-[#C8860A]/10">
                  <h4 className="font-bold text-[11px] text-[#B8A07A]">توکن‌های اتصال سرور بانبع پستی</h4>
                  
                  <table className="w-full admin-table text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#C8860A]/10 text-3xs">
                        <th className="p-2">نام توکن</th>
                        <th className="p-2 text-left">رمز توکن API</th>
                        <th className="p-2 text-left">تکنولوژی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C8860A]/5 font-light">
                      {apiKeys.map((ak) => (
                        <tr key={ak.id}>
                          <td className="p-2.5 font-bold text-2xs">{ak.name}</td>
                          <td className="p-2.5 text-left font-mono text-[10px] text-[#9A8060]">{ak.key}</td>
                          <td className="p-2.5 text-left">
                            <span className="bg-green-950/40 text-green-500 font-bold px-2 py-0.5 text-[8px] rounded-full">{ak.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* API creation form */}
                  <form onSubmit={handleAddApiKey} className="flex gap-2.5 max-w-md">
                    <input
                      type="text"
                      required
                      placeholder="عنوان توکن جدید (مثال: درگاه بانک ملت)"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                      className="flex-grow bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3.5 py-2 text-[#F5E6C8] sharp-border outline-none text-right"
                    />
                    <button
                      type="submit"
                      className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-4 py-2 hover:bg-[#E8A820] sharp-border"
                    >
                      تولید توکن +
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 10: SETTINGS EDITORS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              <div className="panel p-6 max-w-2xl mx-auto space-y-6 text-xs font-light">
                <h3 className="font-bold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-6">
                  پیکربندی کلی سرور دخانیات پارسی
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">تلفن تماس دفتری پشتیبانی</label>
                    <input
                      type="text"
                      value={sPhone}
                      onChange={(e) => setSPhone(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">پست الکترونیکی</label>
                    <input
                      type="email"
                      value={sEmail}
                      onChange={(e) => setSEmail(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">آدرس فیزیکی دفتر مرکزی</label>
                    <input
                      type="text"
                      value={sAddress}
                      onChange={(e) => setSAddress(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">کد مرجع درگاه شتاب زرین‌پال</label>
                    <input
                      type="text"
                      value={sMerchant}
                      onChange={(e) => setSMerchant(e.target.value)}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#B8A07A]">آستانه تبرع ارسال رایگان (تومان)</label>
                    <input
                      type="number"
                      value={sFreeShip}
                      onChange={(e) => setSFreeShip(Number(e.target.value))}
                      className="w-full bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#C8860A]/10 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="bg-[#C8860A] text-[#0E0600] font-bold text-xs px-8 py-3 hover:bg-[#E8A820] sharp-border transition-colors uppercase"
                  >
                    ذخیره پیکربندی دفتری
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- CRUD MODALS & DRAWER RENDER --- */}

      {/* 1. Add/Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-right text-xs">
          <div className="bg-[#110800] border border-[#C8860A]/35 max-w-2xl w-full p-6 sharp-border space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-3">
              <h3 className="font-bold text-sm text-[#F5E6C8]">{editingProduct ? 'اصلاح کالا در کاتالوگ' : 'تولید و ثبت طعم تنباکو/زغال جدید'}</h3>
              <button onClick={() => setProductModalOpen(false)} className="p-1 hover:bg-[#C8860A]/10 sharp-border text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">عنوان تجاری کالا *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">آدرس یکتا اسلاگ (Slug) *</label>
                <input
                  type="text"
                  required
                  placeholder="double-apple-gold"
                  value={pSlug}
                  onChange={(e) => setPSlug(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">قیمت نهایی مصرف‌کننده (تومان) *</label>
                <input
                  type="number"
                  required
                  value={pPrice}
                  onChange={(e) => setPPrice(Number(e.target.value))}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">آستانه موجودی کالا (Stock) *</label>
                <input
                  type="number"
                  required
                  value={pStock}
                  onChange={(e) => setPStock(Number(e.target.value))}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">انتخاب دسته‌بندی</label>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">کمپانی سازنده (برند)</label>
                <input
                  type="text"
                  value={pBrand}
                  onChange={(e) => setPBrand(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">وزن بسته‌بندی</label>
                <input
                  type="text"
                  value={pWeight}
                  onChange={(e) => setPWeight(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">برچسب‌ها و تگ‌ها (مثال: تنباکو، یخ، میکس)</label>
                <input
                  type="text"
                  placeholder="تنباکو، دوسیب، سنگین"
                  value={pTags}
                  onChange={(e) => setPTags(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold font-mono">آدرس تصویر کالا (Image Remote URL)</label>
                <input
                  type="text"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border text-right font-sans"
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pFeatured"
                  checked={pIsFeatured}
                  onChange={(e) => setPIsFeatured(e.target.checked)}
                  className="accent-[#C8860A] w-4 h-4"
                />
                <label htmlFor="pFeatured" className="text-[11px] text-[#B8A07A] font-bold cursor-pointer">
                  به عنوان محصول پیشنهادی ویژه (Featured) در بوق سایت نمایش داده شود.
                </label>
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-[#C8860A]/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-red-500/30 text-red-400 font-bold sharp-border"
                >
                  لغو انصراف
                </button>
                <button
                  type="submit"
                  className="bg-[#C8860A] text-[#0E0600] font-black px-8 py-2 hover:bg-[#E8A820] sharp-border"
                >
                  {editingProduct ? 'اعمال نهایی اصلاحات' : 'درج محصول جدید در انبار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Order detail drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-right text-xs">
          <div className="bg-[#110800] border border-[#C8860A]/40 max-w-lg w-full p-6 sharp-border space-y-6">
            <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-3">
              <h3 className="font-bold text-sm text-[#F5E6C8] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                فاکتور جامع سفارش {selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-[#C8860A]/10 sharp-border text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-[#C8860A]/5 pb-4 text-[#9A8060]">
                <div>
                  <span className="block text-[10px] text-[#C8860A] font-bold">مشتری گیرنده:</span>
                  <span className="text-[#F5E6C8] font-bold mt-1 block">{selectedOrder.shippingAddress.fullName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#C8860A] font-bold">شماره تماس گیرنده:</span>
                  <span className="text-[#F5E6C8] font-bold font-sans mt-1 block">{selectedOrder.shippingAddress.phone}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 border-b border-[#C8860A]/5 pb-4">
                <span className="block text-[10px] text-[#C8860A] font-bold">اقلام مرسوله قلیان:</span>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between font-light text-2xs text-[#9A8060]">
                    <span>{item.productSnapshot.name} ({item.quantity} عدد)</span>
                    <span className="font-sans font-bold">{item.price.toLocaleString()} تومان</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-[#C8860A]/5 pb-4 space-y-1.5 text-[#9A8060]">
                <span className="block text-[10px] text-[#C8860A] font-bold">نشانی تفصیلی حمل‌ونقل:</span>
                <p className="text-[#F5E6C8] leading-relaxed font-light">{selectedOrder.shippingAddress.address}</p>
              </div>

              {/* Tracking Code form */}
              <div className="space-y-1.5">
                <span className="block text-[10px] text-[#C8860A] font-bold">کد رهگیری پست پیشتاز مرسوله:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="مثال: TRK-928174"
                    value={trackingCodeInput}
                    onChange={(e) => setTrackingCodeInput(e.target.value)}
                    className="flex-grow bg-[#0E0600] border border-[#C8860A]/20 focus:border-[#C8860A] text-xs px-3 py-2 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                  />
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, selectedOrder.status, trackingCodeInput);
                      onAddToast('✓ کد مرسوله پستی در سیستم ذخیره گردید.', 'success');
                      setSelectedOrder(null);
                    }}
                    className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-4 py-2 hover:bg-[#E8A820] sharp-border"
                  >
                    ذخیره کد رهگیری
                  </button>
                </div>
              </div>

              {/* Print action mock */}
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-[#1C0E00] hover:bg-[#C8860A]/10 border border-[#C8860A]/20 text-[#C8860A] font-bold text-xs py-2.5 sharp-border flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فاکتور فیزیکی خریدار</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Coupon Creation Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-right text-xs">
          <div className="bg-[#110800] border border-[#C8860A]/35 max-w-md w-full p-6 sharp-border space-y-6">
            <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-3">
              <h3 className="font-bold text-sm text-[#F5E6C8]">برنامه‌ریزی طرح و کوپن جدید</h3>
              <button onClick={() => setCouponModalOpen(false)} className="p-1 hover:bg-[#C8860A]/10 sharp-border text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">شناسه کوپن (کد تخفیف) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: WINTER20"
                  value={coCode}
                  onChange={(e) => setCoCode(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2 text-[#F5E6C8] sharp-border outline-none text-center font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">نوع تخفیف دار کسر بها</label>
                <select
                  value={coType}
                  onChange={(e) => setCoType(e.target.value as 'percent' | 'fixed')}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-2.5 py-2 text-[#F5E6C8] sharp-border outline-none text-right"
                >
                  <option value="percent">درصدی از کل فاکتور (٪)</option>
                  <option value="fixed">کسر مبلغ ثابت فیزیکی (تومان)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">مبلغ یا درصد کسر بها *</label>
                <input
                  type="number"
                  required
                  value={coValue}
                  onChange={(e) => setCoValue(Number(e.target.value))}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">حداقل رقم سفارش شرط استفاده (تومان) *</label>
                <input
                  type="number"
                  required
                  value={coMinOrder}
                  onChange={(e) => setCoMinOrder(Number(e.target.value))}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">سقف دفعات استفاده سیستم *</label>
                <input
                  type="number"
                  required
                  value={coMaxUses}
                  onChange={(e) => setCoMaxUses(Number(e.target.value))}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                />
              </div>

              <div className="pt-4 border-t border-[#C8860A]/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 border border-red-500/30 text-red-400 font-bold sharp-border"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-[#C8860A] text-[#0E0600] font-black px-6 py-2 hover:bg-[#E8A820] sharp-border"
                >
                  صدا زدن و ایجاد طرح تخفیف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add/Edit Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-right text-xs">
          <div className="bg-[#110800] border border-[#C8860A]/35 max-w-md w-full p-6 sharp-border space-y-6">
            <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-3">
              <h3 className="font-bold text-sm text-[#F5E6C8]">پیکربندی شاخه درخت کالا</h3>
              <button onClick={() => setCatModalOpen(false)} className="p-1 hover:bg-[#C8860A]/10 sharp-border text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">اسم دسته‌بندی *</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">معادل آدرس اسلاگ (Slug) *</label>
                <input
                  type="text"
                  required
                  value={cSlug}
                  onChange={(e) => setCSlug(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2.5 text-[#F5E6C8] sharp-border outline-none text-right font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#B8A07A] font-semibold">توضیحات تکمیلی شاخص</label>
                <textarea
                  rows={3}
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  className="w-full bg-[#0E0600] border border-[#C8860A]/20 text-xs px-3 py-2 text-[#F5E6C8] sharp-border outline-none text-right font-light leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-[#C8860A]/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 border border-red-500/30 text-red-400 font-bold sharp-border"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-[#C8860A] text-[#0E0600] font-black px-6 py-2 hover:bg-[#E8A820] sharp-border"
                >
                  ثبت تغییرات شاخه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
