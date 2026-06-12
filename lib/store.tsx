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
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  registerUser: (name: string, email: string, phone: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  setCurrentUserRole: (role: 'admin' | 'customer') => void;

  // Cart Actions
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; shippingCost: number; discount: number; total: number };

  // Order Actions
  createOrder: (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status' | 'paymentStatus' | 'items'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingCode?: string) => void;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

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

// Seeds
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'تنباکو میوه‌ای', slug: 'tobacco', description: 'انواع تنباکوهای میوه‌ای و لوکس و سنتی', image: 'https://picsum.photos/seed/tobacco/400/300', isActive: true },
  { id: 'cat-2', name: 'زغال طبیعی قلیان', slug: 'charcoal', description: 'زغال برتر مرکبات و لیمو و زغال‌های نارگیل فشرده', image: 'https://picsum.photos/seed/charcoal/400/300', isActive: true },
  { id: 'cat-3', name: 'لوازم جانبی و اکسسوری', slug: 'accessories', description: 'طيف وسیعی از شلنگ، سری‌های سفالی و انبرهای منقش سنتی', image: 'https://picsum.photos/seed/hose/400/300', isActive: true },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'تنباکو دوسیب شلاقی غلیظ سری طلایی',
    slug: 'double-apple-gold',
    description: 'تنباکو سنتی دوسیب با عطر بی‌نظیر و غلیظ که تجربه اصیل قهوه‌خانه‌ای را برای شما تداعی می‌کند. این تنباکو با پخت کند چوب درخت تهیه شده و ماندگاری و کام‌دهی فوق‌العاده بالایی دارد.',
    price: 85000,
    comparePrice: 110000,
    stock: 120,
    images: ['https://picsum.photos/seed/apple1/600/600', 'https://picsum.photos/seed/apple2/600/600'],
    categoryId: 'cat-1',
    brand: 'دخانیات پارسی',
    weight: '۵۰ گرم',
    tags: ['تنباکو', 'دوسیب', 'سنگین', 'ویژه'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'تنباکو پرتقال خامه ملو شاهانه',
    slug: 'orange-cream-king',
    description: 'یک ترکیب خنک، ملایم و فوق‌العاده خوش‌طعم از پرتقال ارگانیک و خامه غلیظ سوئیسی. مناسب برای کسانی که طعم‌های سرد و خامه‌ای را می‌پسندند.',
    price: 75000,
    stock: 85,
    images: ['https://picsum.photos/seed/orange1/600/600'],
    categoryId: 'cat-1',
    brand: 'النخلة',
    weight: '۵۰ گرم',
    tags: ['پرتقال خامه', 'ملایم', 'خنک'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-02T11:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'تنباکو بلوبری بلک لایت یخ',
    slug: 'blueberry-ice',
    description: 'نعنای وحشی به همراه عصاره بلوبری‌های استوایی و بلورهای یخ طبیعی. غلیظ‌ترین کام ممکن را با این طعم شگفت‌انگیز و مدرن تجربه کنید.',
    price: 90000,
    comparePrice: 120000,
    stock: 0, // Out of stock to demonstrate product availability
    images: ['https://picsum.photos/seed/blueberry1/600/600'],
    categoryId: 'cat-1',
    brand: 'الخوانکی',
    weight: '۵۰ گرم',
    tags: ['بلوبری', 'یخ', 'مدرن'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-03T09:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'تنباکو نعناع کوهی خنک طبیعی',
    slug: 'wild-mint',
    description: 'نعنای کاملا خالص دشت‌های کردستان، مناسب برای میکس یا استفاده به صورت تکی. طراوت بخش و خنک‌کننده گلو.',
    price: 80000,
    stock: 200,
    images: ['https://picsum.photos/seed/mint1/600/600'],
    categoryId: 'cat-1',
    brand: 'دخانیات پارسی',
    weight: '۵۰ گرم',
    tags: ['نعناع', 'خنک', 'میکس'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-04T12:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'زغال لیمو قلمی جهرم ویژه مجلسی',
    slug: 'premium-lemon-charcoal',
    description: 'برترین زغال لیموی جنوب کشور، بدون سردرد، بدون دود و خاکستر اضافی با روشن ماندن بیش از ۲ ساعت مستمر. دست‌گزین شده بدون خرده و شکستگی.',
    price: 120000,
    comparePrice: 160000,
    stock: 50,
    images: ['https://picsum.photos/seed/coal1/600/600', 'https://picsum.photos/seed/coal2/600/600'],
    categoryId: 'cat-2',
    brand: 'پارس زغال',
    weight: '۱ کیلوگرام',
    tags: ['زغال', 'لیمو', 'قلمی', 'بدون سردرد'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-05T15:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'زغال فشرده مکعبی کوکو کینگ درجه یک',
    slug: 'king-coconut-charcoal',
    description: 'تولید شده صد درصد از پوست نارگیل خالص سری فشرده صادراتی. بدون هیچ‌گونه بوی نامطبوع و سوختن کاملا همگن و بدون شکستگی.',
    price: 140000,
    stock: 150,
    images: ['https://picsum.photos/seed/coco1/600/600'],
    categoryId: 'cat-2',
    brand: 'کینگ کوکو',
    weight: '۱ کیلوگرام',
    tags: ['نارگیل', 'فشرده', 'مکعبی'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-06T10:30:00Z',
  },
  {
    id: 'prod-7',
    name: 'شلنگ سیلیکونی با دسته فلزی طلایی طرح سلطنتی',
    slug: 'royal-golden-hose',
    description: 'شلنگ سیلیکونی بهداشتی قابل شستشو به همراه دسته آلومینیومی تراش‌خورده به رنگ طلایی مجلل ضدزنگ. مکش هوای فوق‌العاده روان.',
    price: 220000,
    comparePrice: 280000,
    stock: 25,
    images: ['https://picsum.photos/seed/hose1/600/600'],
    categoryId: 'cat-3',
    brand: 'الخوانکی',
    weight: '۳۵۰ گرم',
    tags: ['شلنگ', 'طلایی', 'فلزی'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-07T14:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'سری سفالی پخته دستی طرح شاه عباسی',
    slug: 'shah-abbasi-clay-bowl',
    description: 'سری سفالی سنتی با خاک رس ممتاز گل‌ولای جهرم پخته شده در دمای بالا برای توزیع حرارت متوازن و جلوگیری از سوختن سریع طعم.',
    price: 95000,
    comparePrice: 110000,
    stock: 18,
    images: ['https://picsum.photos/seed/bowl1/600/600'],
    categoryId: 'cat-3',
    brand: 'هنر پارس',
    weight: '۲۰۰ گرم',
    tags: ['سری', 'سفالی', 'شاه عباسی'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-08T09:12:00Z',
  }
];

const DEFAULT_USERS: User[] = [
  { id: 'user-admin', name: 'مدیر دخانیات پارسی', email: 'admin@smoke.ir', phone: '09121234567', role: 'admin', isActive: true, createdAt: '2026-01-01T12:00:00Z' },
  { id: 'user-cust1', name: 'امیر مؤمنی', email: 'amirmomeni177@gmail.com', phone: '09355554321', role: 'customer', isActive: true, createdAt: '2026-05-10T14:30:00Z' }
];

const DEFAULT_COUPONS: Coupon[] = [
  { id: 'coup-1', code: 'SMOKE20', type: 'percent', value: 20, minOrder: 300000, maxUses: 100, usedCount: 12, expiresAt: '2026-12-31T23:59:59Z', isActive: true },
  { id: 'coup-2', code: 'WINTER50', type: 'fixed', value: 50000, minOrder: 200000, maxUses: 50, usedCount: 5, expiresAt: '2026-09-30T23:59:59Z', isActive: true },
  { id: 'coup-3', code: 'YALDA', type: 'percent', value: 15, minOrder: 150000, maxUses: 200, usedCount: 198, expiresAt: '2026-07-01T23:59:59Z', isActive: false }
];

const DEFAULT_REVIEWS: Review[] = [
  { id: 'rev-1', productId: 'prod-1', userId: 'user-cust1', userName: 'امیر مؤمنی', rating: 5, comment: 'فوق العاده غلیظ و بدون سردرد. واقعا دوسیب شلاقی لقب برازنده‌ایه براش. دمتون گرم.', isApproved: true, createdAt: '2026-06-11T16:00:00Z' },
  { id: 'rev-2', productId: 'prod-5', userId: 'user-cust1', userName: 'آرش علوی', rating: 5, comment: 'بهترین زغال لیمویی که تا حالا خریدم. کاملا قلمی و بی بو، دو ساعت راحت روشنه.', isApproved: true, createdAt: '2026-06-10T12:00:00Z' },
  { id: 'rev-3', productId: 'prod-2', userId: 'user-cust1', userName: 'سارا رضایی', rating: 4, comment: 'خیلی طعم خامه پرتقال جالب و دلنشینی داره. فقط یکم سریع طعمش تموم شد.', isApproved: false, createdAt: '2026-06-11T19:30:00Z' }
];

const DEFAULT_ADDRESSES: Address[] = [
  { id: 'addr-1', userId: 'user-cust1', fullName: 'امیر مؤمنی', phone: '09355554321', province: 'تهران', city: 'تهران', address: 'بلوار اصلی، خیابان ولیعصر، کوچه دهم، پلاک ۱۲، واحد ۴', postalCode: '1456789123', isDefault: true }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ORD-1002',
    userId: 'user-cust1',
    status: 'delivered',
    totalAmount: 290000,
    shippingCost: 0,
    discountAmount: 0,
    shippingAddress: {
      fullName: 'امیر مؤمنی',
      phone: '09355554321',
      province: 'تهران',
      city: 'تهران',
      address: 'بلوار اصلی، خیابان ولیعصر، کوچه دهم، پلاک ۱۲، واحد ۴',
      postalCode: '1456789123',
    },
    paymentMethod: 'درگاه آنلاین زرین‌پال',
    paymentStatus: 'paid',
    trackingCode: 'TRK-983174',
    createdAt: '2026-06-08T14:45:00Z',
    items: [
      { id: 'oi-1', productId: 'prod-1', quantity: 2, price: 85000, productSnapshot: { name: 'تنباکو دوسیب شلاقی غلیظ سری طلایی', price: 85000 } },
      { id: 'oi-2', productId: 'prod-5', quantity: 1, price: 120000, productSnapshot: { name: 'زغال لیمو قلمی جهرم ویژه مجلسی', price: 120000 } }
    ]
  },
  {
    id: 'ORD-1003',
    userId: 'user-cust1',
    status: 'processing',
    totalAmount: 215000,
    shippingCost: 35000,
    discountAmount: 40000,
    couponCode: 'SMOKE20',
    shippingAddress: {
      fullName: 'امیر مؤمنی',
      phone: '09355554321',
      province: 'تهران',
      city: 'تهران',
      address: 'بلوار اصلی، خیابان ولیعصر، کوچه دهم، پلاک ۱۲، واحد ۴',
      postalCode: '1456789123',
    },
    paymentMethod: 'کارت به کارت',
    paymentStatus: 'paid',
    createdAt: '2026-06-11T10:15:00Z',
    items: [
      { id: 'oi-3', productId: 'prod-2', quantity: 2, price: 75000, productSnapshot: { name: 'تنباکو پرتقال خامه ملو شاهانه', price: 75000 } },
      { id: 'oi-4', productId: 'prod-4', quantity: 1, price: 80000, productSnapshot: { name: 'تنباکو نعناع کوهی خنک طبیعی', price: 80000 } }
    ]
  }
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load from local storage
  useEffect(() => {
    const getData = <T,>(key: string, defaultVal: T): T => {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultVal;
      } catch (err) {
        return defaultVal;
      }
    };

    const timer = setTimeout(() => {
      setUsers(getData('ps_users', DEFAULT_USERS));
      setCategories(getData('ps_categories', DEFAULT_CATEGORIES));
      setProducts(getData('ps_products', DEFAULT_PRODUCTS));
      setOrders(getData('ps_orders', DEFAULT_ORDERS));
      setCart(getData('ps_cart', []));
      setAddresses(getData('ps_addresses', DEFAULT_ADDRESSES));
      setReviews(getData('ps_reviews', DEFAULT_REVIEWS));
      setCoupons(getData('ps_coupons', DEFAULT_COUPONS));
      setSettings(getData('ps_settings', DEFAULT_SETTINGS));

      const activeUser = getData<User | null>('ps_current_user', DEFAULT_USERS[1]); // Default logged in as Customer 'Amir' for smooth testing
      setCurrentUser(activeUser);
      setInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save to local storage when state changes
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('ps_users', JSON.stringify(users));
    localStorage.setItem('ps_categories', JSON.stringify(categories));
    localStorage.setItem('ps_products', JSON.stringify(products));
    localStorage.setItem('ps_orders', JSON.stringify(orders));
    localStorage.setItem('ps_cart', JSON.stringify(cart));
    localStorage.setItem('ps_addresses', JSON.stringify(addresses));
    localStorage.setItem('ps_reviews', JSON.stringify(reviews));
    localStorage.setItem('ps_coupons', JSON.stringify(coupons));
    localStorage.setItem('ps_settings', JSON.stringify(settings));
    localStorage.setItem('ps_current_user', JSON.stringify(currentUser));
  }, [users, categories, products, orders, cart, addresses, reviews, coupons, settings, currentUser, initialized]);

  // Auth Actions
  const loginUser = (email: string, password: string) => {
    const usr = users.find((u) => u.email === email);
    if (!usr) {
      return { success: false, error: 'کاربری با این ایمیل یافت نشد.' };
    }
    // We are simply matching mock password or any password for testing
    if (password.length < 4) {
      return { success: false, error: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' };
    }
    setCurrentUser(usr);
    return { success: true };
  };

  const registerUser = (name: string, email: string, phone: string, password: string) => {
    if (users.some((u) => u.email === email)) {
      return { success: false, error: 'ایمیل وارد شده قبلاً ثبت شده است.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const setCurrentUserRole = (role: 'admin' | 'customer') => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
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

    // Apply Coupon checking (if coupon verified by checkout state etc.)
    // We will compute final discount when requested by UI. This is a helper.
    const discount = 0; // Handled directly in Checkout with code

    return {
      subtotal,
      shippingCost,
      discount,
      total: subtotal + shippingCost - discount,
    };
  };

  // Order Actions
  const createOrder = (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status' | 'paymentStatus' | 'items'>) => {
    const totalCalc = getCartTotal();
    const orderItems: OrderItem[] = cart
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return null;
        return {
          id: `oi-${Date.now()}-${prod.id}`,
          productId: prod.id,
          quantity: item.quantity,
          price: prod.price,
          productSnapshot: {
            name: prod.name,
            price: prod.price,
            brand: prod.brand,
            weight: prod.weight,
          },
        };
      })
      .filter(Boolean) as OrderItem[];

    // Reduce stock
    cart.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.productId) {
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          }
          return p;
        })
      );
    });

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${1000 + orders.length + 1}`,
      userId: currentUser?.id || 'guest',
      status: 'pending',
      paymentStatus: 'paid', // Simple checkout payment simulation
      createdAt: new Date().toISOString(),
      items: orderItems,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], trackingCode?: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status, trackingCode: trackingCode || ord.trackingCode } : ord))
    );
  };

  // Product Actions
  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProd]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Category Actions
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
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
      isApproved: false, // requires admin approval
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
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup-${Date.now()}`,
      usedCount: 0,
    };
    setCoupons((prev) => [...prev, newCoupon]);
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const verifyCoupon = (code: string) => {
    const activeC = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!activeC) {
      return { success: false, error: 'کد تخفیف معتبر نیست یا اشتباه وارد شده است.' };
    }
    if (!activeC.isActive) {
      return { success: false, error: 'این کد تخفیف منقضی یا غیرفعال شده است.' };
    }
    const now = new Date();
    if (new Date(activeC.expiresAt) < now) {
      return { success: false, error: 'تاریخ استفاده از این کد تخفیف به پایان رسیده است.' };
    }
    if (activeC.usedCount >= activeC.maxUses) {
      return { success: false, error: 'سقف ظرفیت استفاده از این کد تخفیف پر شده است.' };
    }
    return { success: true, coupon: activeC };
  };

  // Address Actions
  const addAddress = (address: Omit<Address, 'id' | 'userId'>) => {
    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
      userId: currentUser?.id || 'guest',
    };
    setAddresses((prev) => {
      const items = address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [...items, newAddr];
    });
  };

  const updateAddress = (id: string, updatedFields: Partial<Address>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, ...updatedFields };
        }
        if (updatedFields.isDefault && a.id !== id) {
          return { ...a, isDefault: false };
        }
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

  // Settings Action
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
