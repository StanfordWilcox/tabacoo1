'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces matching Database schema
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  categoryId: string;
  brand: string;
  weight: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productSnapshot: Partial<Product>;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  couponCode?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingCode?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Settings {
  siteName: string;
  logoText: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  telegram: string;
  zarinpalMerchantId: string;
  freeShippingThreshold: number;
  shippingCost: number;
}

interface ShopContextType {
  // Data State
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  addresses: Address[];
  reviews: Review[];
  coupons: Coupon[];
  settings: Settings;
  currentUser: User | null;

  // Actions
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setCurrentUserRole: (role: 'admin' | 'customer') => Promise<void>;

  // Cart Actions
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; shippingCost: number; discount: number; total: number };

  // Order Actions
  createOrder: (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status' | 'paymentStatus' | 'items'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingCode?: string) => Promise<void>;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Review Actions
  addReview: (productId: string, rating: number, comment: string) => void;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;

  // Coupon Actions
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  toggleCoupon: (id: string) => void;
  verifyCoupon: (code: string) => { success: boolean; coupon?: Coupon; error?: string };

  // Address Actions
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Settings Action
  updateSettings: (settings: Partial<Settings>) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Local Seed backups in case network fails
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'تنباکو میوه‌ای', slug: 'tobacco', description: 'انواع تنباکوهای میوه‌ای و لوکس و سنتی', image: 'https://picsum.photos/seed/tobacco/400/300', isActive: true },
  { id: 'cat-2', name: 'زغال طبیعی قلیان', slug: 'charcoal', description: 'زغال برتر مرکبات و لیمو و زغال‌های نارگیل فشرده', image: 'https://picsum.photos/seed/charcoal/400/300', isActive: true },
  { id: 'cat-3', name: 'لوازم جانبی و اکسسوری', slug: 'accessories', description: 'طيف وسیعی از شلنگ، سری‌های سفالی و انبرهای منقش سنتی', image: 'https://picsum.photos/seed/hose/400/300', isActive: true },
];

const DEFAULT_COUPONS: Coupon[] = [
  { id: 'coup-1', code: 'SMOKE20', type: 'percent', value: 20, minOrder: 300000, maxUses: 100, usedCount: 12, expiresAt: '2026-12-31T23:59:59Z', isActive: true },
  { id: 'coup-2', code: 'WINTER50', type: 'fixed', value: 50000, minOrder: 200000, maxUses: 50, usedCount: 5, expiresAt: '2026-09-30T23:59:59Z', isActive: true },
  { id: 'coup-3', code: 'YALDA', type: 'percent', value: 15, minOrder: 150000, maxUses: 200, usedCount: 198, expiresAt: '2026-07-01T23:59:59Z', isActive: false }
];

const DEFAULT_SETTINGS: Settings = {
  siteName: 'دخانیات پارسی',
  logoText: 'Persian Smoke',
  phone: '۰۲۱-۸۸۸۸۴۴۴۴',
  email: 'info@persiansmoke.ir',
  address: 'تهران، خیابان ولیعصر، نرسیده به چهارراه ولیعصر، پاساژ پارسی، واحد ۱۱۰',
  instagram: '@persian.smoke',
  telegram: '@persiansmoke_support',
  zarinpalMerchantId: 'zarinpal_merchant_id_dummy_1234567890',
  freeShippingThreshold: 500000,
  shippingCost: 35000
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize and synchronise state with backend APIs
  const refreshFeedsAndSession = async () => {
    try {
      // 1. Fetch current authenticated session
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          setCurrentUser(meData.user);

          // If current user is administrator, fetch all administrative lists
          if (meData.user.role === 'admin') {
            const prodRes = await fetch('/api/admin/products');
            if (prodRes.ok) {
              const pData = await prodRes.json();
              setProducts(pData.products || []);
            }
            const orderRes = await fetch('/api/admin/orders');
            if (orderRes.ok) {
              const oData = await orderRes.json();
              setOrders(oData.orders || []);
            }
            const userRes = await fetch('/api/admin/users');
            if (userRes.ok) {
              const uData = await userRes.json();
              setUsers(uData.users || []);
            }
          } else {
            // Standard Customer: fetch their own active orders
            const orderRes = await fetch('/api/orders');
            if (orderRes.ok) {
              const oData = await orderRes.json();
              setOrders(oData.orders || []);
            }
          }
        }
      }

      // 2. Fetch standard public products feed
      const publicRes = await fetch('/api/products');
      if (publicRes.ok) {
        const publicData = await publicRes.json();
        setProducts(publicData.products || []);
        setCategories(publicData.categories || DEFAULT_CATEGORIES);
      }
    } catch (err) {
      console.error('Session sync error:', err);
    } finally {
      setInitialized(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Sync cart and non-sensitive configurations from local storage on mount
      try {
        const storedCart = localStorage.getItem('ps_cart');
        if (storedCart) setCart(JSON.parse(storedCart));

        const storedAddresses = localStorage.getItem('ps_addresses');
        if (storedAddresses) setAddresses(JSON.parse(storedAddresses));

        const storedReviews = localStorage.getItem('ps_reviews');
        if (storedReviews) setReviews(JSON.parse(storedReviews));

        const storedCoupons = localStorage.getItem('ps_coupons');
        if (storedCoupons) setCoupons(JSON.parse(storedCoupons));

        const storedSettings = localStorage.getItem('ps_settings');
        if (storedSettings) setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Failed to load storage on mount:', e);
      }

      refreshFeedsAndSession();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save changes locally
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('ps_cart', JSON.stringify(cart));
    localStorage.setItem('ps_addresses', JSON.stringify(addresses));
    localStorage.setItem('ps_reviews', JSON.stringify(reviews));
    localStorage.setItem('ps_coupons', JSON.stringify(coupons));
    localStorage.setItem('ps_settings', JSON.stringify(settings));
  }, [cart, addresses, reviews, coupons, settings, initialized]);

  // Auth Actions
  const loginUser = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'خطایی رخ داد' };
      }
      setCurrentUser(data.user);
      await refreshFeedsAndSession();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'سرور در دسترس نیست.' };
    }
  };

  const registerUser = async (name: string, email: string, phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      // Log user in automatically after register
      return await loginUser(email, password);
    } catch (err) {
      return { success: false, error: 'ثبت‌نام با خطا مواجه شد.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setOrders([]);
    await refreshFeedsAndSession();
  };

  const setCurrentUserRole = async (role: 'admin' | 'customer') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentUser.id, role })
      });
      if (res.ok) {
        await refreshFeedsAndSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cart Actions
  const addToCart = (productId: string, quantity = 1) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || prod.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, prod.stock);
        return prev.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item));
      }
      return [...prev, { id: `cart-${Date.now()}-${productId}`, productId, quantity: Math.min(quantity, prod.stock) }];
    });
  };

  const updateCartQty = (productId: string, quantity: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const availableQty = Math.min(quantity, prod.stock);
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity: availableQty } : item)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    let subtotal = 0;
    cart.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        subtotal += prod.price * item.quantity;
      }
    });

    const isFree = subtotal >= settings.freeShippingThreshold;
    const shippingCost = subtotal === 0 ? 0 : isFree ? 0 : settings.shippingCost;
    const discount = 0; // calculated inside checkout

    return {
      subtotal,
      shippingCost,
      discount,
      total: subtotal + shippingCost - discount,
    };
  };

  // Order Actions
  const createOrder = async (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status' | 'paymentStatus' | 'items'>) => {
    const totals = getCartTotal();
    
    // Structure cart items for server
    const orderRawItems = cart.map((c) => ({
      productId: c.productId,
      quantity: c.quantity
    }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: orderRawItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        couponCode: orderData.couponCode,
        discountAmount: orderData.discountAmount,
        shippingCost: totals.shippingCost,
        totalAmount: totals.total
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'ثبت سفارش با مشکل مواجه گردید.');
    }

    const resData = await res.json();
    clearCart();
    await refreshFeedsAndSession();
    return resData.order;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingCode?: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status, trackingCode })
      });
      if (res.ok) {
        await refreshFeedsAndSession();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Product Actions CRUD (calls Real Protected APIs!)
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        await refreshFeedsAndSession();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields })
      });
      if (res.ok) {
        await refreshFeedsAndSession();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await refreshFeedsAndSession();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Category Actions (fallback local modifiers)
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCat: Category = { ...category, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
  };
  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));
  };
  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Review Actions
  const addReview = (productId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'مشتری میهمان',
      rating,
      comment,
      isApproved: false,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
  };
  const approveReview = (reviewId: string) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, isApproved: true } : r)));
  };
  const rejectReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  // Coupon Actions
  const addCoupon = (coupon: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newC = { ...coupon, id: `coup-${Date.now()}`, usedCount: 0 };
    setCoupons((prev) => [...prev, newC]);
  };
  const toggleCoupon = (id: string) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };
  const verifyCoupon = (code: string) => {
    const activeC = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!activeC) return { success: false, error: 'کد تخفیف معتبر نیست یا اشتباه وارد شده است.' };
    if (!activeC.isActive) return { success: false, error: 'این کد تخفیف منقضی या غیرفعال شده است.' };
    if (new Date(activeC.expiresAt) < new Date()) return { success: false, error: 'تاریخ استفاده به پایان رسیده است.' };
    if (activeC.usedCount >= activeC.maxUses) return { success: false, error: 'سقف ظرفیت استفاده پر شده است.' };
    return { success: true, coupon: activeC };
  };

  // Address Actions
  const addAddress = (address: Omit<Address, 'id' | 'userId'>) => {
    const newAddr = { ...address, id: `addr-${Date.now()}`, userId: currentUser?.id || 'guest' };
    setAddresses((prev) => {
      const items = address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [...items, newAddr];
    });
  };
  const updateAddress = (id: string, updatedFields: Partial<Address>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) return { ...a, ...updatedFields };
        if (updatedFields.isDefault && a.id !== id) return { ...a, isDefault: false };
        return a;
      })
    );
  };
  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };
  const setDefaultAddress = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  // Settings Actions
  const updateSettings = (updatedFields: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <ShopContext.Provider
      value={{
        users,
        categories,
        products,
        orders,
        cart,
        addresses,
        reviews,
        coupons,
        settings,
        currentUser,
        loginUser,
        registerUser,
        logout,
        setCurrentUserRole,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        getCartTotal,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addReview,
        approveReview,
        rejectReview,
        addCoupon,
        toggleCoupon,
        verifyCoupon,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        updateSettings,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
