import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Interfaces matching database collections
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  passwordHash: string;
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

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
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

export interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: string;
}

interface DatabaseSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  settings: Settings;
  refreshTokens: RefreshToken[];
}

const DB_FILE = path.join(process.cwd(), 'smoke_backend_db.json');

// Master Default Seeds
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
    stock: 25,
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

// Singleton data cache in-memory to prevent multiple IOs during rendering
let dbCache: DatabaseSchema | null = null;

export function loadDb(): DatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      return dbCache!;
    }
  } catch (err) {
    console.error('Failed to load DB file, reinitializing...', err);
  }

  // Pre-generate passwords: admin123 and customer123
  const seedUsers: User[] = [
    {
      id: 'user-admin',
      name: 'مدیر دخانیات پارسی',
      email: 'admin@smoke.ir',
      phone: '09121234567',
      role: 'admin',
      isActive: true,
      passwordHash: bcrypt.hashSync('admin123', 10),
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-cust1',
      name: 'امیر مؤمنی',
      email: 'amirmomeni177@gmail.com',
      phone: '09355554321',
      role: 'customer',
      isActive: true,
      passwordHash: bcrypt.hashSync('customer123', 10),
      createdAt: new Date().toISOString()
    }
  ];

  dbCache = {
    users: seedUsers,
    categories: DEFAULT_CATEGORIES,
    products: DEFAULT_PRODUCTS,
    orders: [],
    reviews: [],
    coupons: DEFAULT_COUPONS,
    settings: DEFAULT_SETTINGS,
    refreshTokens: []
  };

  saveDb(dbCache);
  return dbCache;
}

export function saveDb(data: DatabaseSchema): void {
  dbCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}
