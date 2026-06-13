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
  { id: 'cat-4', name: 'قلیان‌های مدرن و لوکس', slug: 'hookahs', description: 'انواع قلیان‌های لوکس آلومینیومی، برنجی مدرن، شیشه‌ای پیرکس و مسافرتی کیف‌دار', image: 'https://picsum.photos/seed/hookah/400/300', isActive: true },
  { id: 'cat-5', name: 'تنباکو ویژه‌ ترکیبی', slug: 'mixed-tobacco', description: 'میکس‌های اختصاصی و طعم‌های ترکیبی سنگین، خاص، سرد و گرم سلطنتی', image: 'https://picsum.photos/seed/mixed1/400/300', isActive: true },
  { id: 'cat-6', name: 'سر شیشه و لوازم سرامیکی', slug: 'heads', description: 'انواع سری‌های سیلیکونی نسوز، سرامیکی فانتزی، فونل مدرن و سری‌های سفالی سفارشی', image: 'https://picsum.photos/seed/bowl/400/300', isActive: true },
  { id: 'cat-7', name: 'ابزار نگهداری و نظافت', slug: 'cleaning', description: 'برس‌های نانو نظافت، پودر تمیزکننده تنه و شلنگ، رسوب‌زدا و واشرهای باکیفیت', image: 'https://picsum.photos/seed/brush/400/300', isActive: true },
  { id: 'cat-8', name: 'زغال سرخ‌کن و آتش‌زن', slug: 'burners', description: 'دستگاه زغال‌سرخ‌کن برقی ارگانیک، زغال برقی نسوز و فندک‌های جت شعله سنگین', image: 'https://picsum.photos/seed/burner/400/300', isActive: true }
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
    id: 'prod-11',
    name: 'تنباکو هلو زعفران سنتی سنگین ویژه شیراز',
    slug: 'peach-saffron',
    description: 'ترکیبی معطر، اصیل و سنگین ملهم از سنت‌های دیرین شیراز. عطر هلوی شیرین رسیده به همراه تارهای ممتاز زعفران ایرانی، دودی غلیظ، آرام و کاملاً مجلسی به ارمغان می‌آورد.',
    price: 88000,
    stock: 90,
    images: ['https://picsum.photos/seed/peach1/600/600'],
    categoryId: 'cat-1',
    brand: 'الواحه',
    weight: '۵۰ گرم',
    tags: ['هلو', 'زعفران', 'سنگین', 'سنتی'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-11T14:20:00Z',
  },
  {
    id: 'prod-12',
    name: 'تنباکو لیمو نعناع اسپشیال ترش و سرد',
    slug: 'lemon-mint-special',
    description: 'احساس نشاط کامل با طعم ترش ترنج و لیموی تازه ارگانیک، هم‌نشین با برگ‌های خنک نعناع. انتخابی بی‌نظیر برای فصول گرم سال و کام‌دهی پیوسته.',
    price: 78000,
    stock: 110,
    images: ['https://picsum.photos/seed/lemonmint1/600/600'],
    categoryId: 'cat-1',
    brand: 'النخلة',
    weight: '۵۰ گرم',
    tags: ['لیمو', 'نعناع', 'خنک', 'ترش'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-12T09:00:00Z',
  },
  {
    id: 'prod-13',
    name: 'تنباکو انار سرخ ممتاز ساوه',
    slug: 'pomegranate-sauveh',
    description: 'طعم ملس و جذاب انار یاقوتی ساوه با شیرینی متعادل و عطر ملایم طبیعت پاییز. لذتی نوستالژیک برای طرفداران پروپاقرص تنباکوهای میوه‌ای ترش و شیرین.',
    price: 82000,
    stock: 75,
    images: ['https://picsum.photos/seed/pome1/600/600'],
    categoryId: 'cat-1',
    brand: 'مزایا',
    weight: '۵۰ گرم',
    tags: ['انار', 'میوه‌ای', 'ملس'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-13T16:45:00Z',
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
    id: 'prod-21',
    name: 'زغال لیمو سکه‌ای ممتاز شیراز بدون بادزن',
    slug: 'coin-lemon-charcoal',
    description: 'زغال سکه‌ای دست‌چین شده ممتاز بدون رطوبت. این زغال با روشن شدن سریع، حرارت یکدست و بدون جرقه، یکی از محبوب‌ترین گزینه‌ها برای استفاده آسان روزمره است.',
    price: 95000,
    stock: 160,
    images: ['https://picsum.photos/seed/charcoalcoin/600/600'],
    categoryId: 'cat-2',
    brand: 'پارس زغال',
    weight: '۱ کیلوگرام',
    tags: ['زغال', 'لیمو', 'سکه‌ای', 'آسان'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-21T11:00:00Z',
  },
  {
    id: 'prod-22',
    name: 'زغال ارگانیک پوست پسته صادراتی رفسنجان',
    slug: 'pistachio-charcoal',
    description: 'تولید شده به روش مدرن پیرولیز بدون هیچگونه آسیب محیطی. کاملاً با دوام، با ماندگاری شگفت‌انگیز خاکستر ناچیز و کاملاً ارگانیک.',
    price: 110000,
    stock: 80,
    images: ['https://picsum.photos/seed/pistacio/600/600'],
    categoryId: 'cat-2',
    brand: 'کرمان ذغال',
    weight: '۱ کیلوگرام',
    tags: ['زغال', 'پسته', 'ارگانیک', 'بادوام'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-22T13:10:00Z',
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
  },
  {
    id: 'prod-31',
    name: 'محافظ بادگیر و جازغالی استیل ضدزنگ و ضدباد',
    slug: 'windguard-stainless-steel',
    description: 'بادگیر بسیار کارآمد مدل توری شش ضلعی از جنس استیل سنگین ضدزنگ. مانع پخش شدن خاکستر زغال در محیط می‌شود و دمای سری را به‌خوبی غنی و متوازن نگه می‌دارد.',
    price: 145000,
    stock: 40,
    images: ['https://picsum.photos/seed/windguard/600/600'],
    categoryId: 'cat-3',
    brand: 'استیل‌تک',
    weight: '۳۰۰ گرم',
    tags: ['جازغالی', 'بادگیر', 'استیل'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-31T10:00:00Z',
  },
  {
    id: 'prod-32',
    name: 'انبر باستانی برنجی نفیس کار برجسته طلاکوب شاهانه',
    slug: 'brass-antique-tongs',
    description: 'انبر بسیار شیک و سنگین از الیاژ برنج اصیل اصفهان با نقوش و حکاکی‌های به جا مانده از عهد صفوی. ابزاری فوق‌العاده زیبا برای چیدن زغال‌ها بر روی سر شیشه.',
    price: 180000,
    stock: 35,
    images: ['https://picsum.photos/seed/tongs/600/600'],
    categoryId: 'cat-3',
    brand: 'صفوی هنر',
    weight: '۱۸۰ گرم',
    tags: ['انبر', 'برنجی', 'لوکس', 'هنری'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-31T15:20:00Z',
  },
  {
    id: 'prod-33',
    name: 'تبریدکننده شلنگ (کپسول یخ لایت) بسیار خنک',
    slug: 'hose-ice-capsule',
    description: 'دارای ژل منجمد شونده غیرسمی مخصوص. کافیست نیم ساعت قبل از مصرف داخل فریزر قرار گیرد تا تجربه دودی لرزان، منجمد و استثنایی را در هر کام تجربه کنید.',
    price: 65000,
    stock: 120,
    images: ['https://picsum.photos/seed/icecapsule/600/600'],
    categoryId: 'cat-3',
    brand: 'آیس کینگ',
    weight: '۱۵۰ گرم',
    tags: ['یخ شلنگ', 'خنک', 'اکسسوری'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-31T17:40:00Z',
  },
  {
    id: 'prod-41',
    name: 'قلیان طلایی سلطنتی برنجی قلم‌زنی دست‌ساز اصفهان',
    slug: 'royal-brass-isfahan-hookah',
    description: 'شاهکاری بی‌بدیل از مسگران نصف جهان. بدنه تماماً تراش‌خورده و قلم‌زنی دستی سنتی از جنس برنج ممتاز به همراه جام شیشه‌ای با نقوش زرکوب قجری. صدای سنگین و روانی کام بی‌نظیر.',
    price: 2450000,
    comparePrice: 2900000,
    stock: 10,
    images: ['https://picsum.photos/seed/hookahgold/600/600'],
    categoryId: 'cat-4',
    brand: 'عتیق اصفهان',
    weight: '۲.۵ کیلوگرم',
    tags: ['قلیان', 'برنجی', 'لوکس', 'صنایع دستی'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-15T12:00:00Z',
  },
  {
    id: 'prod-42',
    name: 'قلیان مدرن آلومینیومی مگا اسموک مدل تیتانیوم اسپورت',
    slug: 'modern-aluminum-titanium-hookah',
    description: 'قلیان مدرن تمام فلزی از جنس آلومینیوم تقویت شده گرید هوافضا. دارای سیستم سوپاپ تخلیه دود عمودی دورانی شگفت‌انگیز و لوله سایلنسر بی‌صدا.',
    price: 1950000,
    comparePrice: 2300000,
    stock: 15,
    images: ['https://picsum.photos/seed/hookahmodern/600/600'],
    categoryId: 'cat-4',
    brand: 'MegaSmoke',
    weight: '۱.۸ کیلوگرم',
    tags: ['قلیان', 'مدرن', 'آلومینیوم', 'سایلنسر'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-16T14:00:00Z',
  },
  {
    id: 'prod-43',
    name: 'قلیان پیرکس نشکن مسافرتی کیف‌دار کتابی پرتابل',
    slug: 'portable-pyrex-travel-hookah',
    description: 'قلیان فلت مسافرتی کتابی از جنس پیرکس ضخیم ضد شوک حرارتی. فوق‌العاده سبک، کم‌حجم، به همراه شلنگ مغناطیسی مدرن و کیف چرمی ضدضربه عالی برای طبیعت‌گردی.',
    price: 850000,
    stock: 25,
    images: ['https://picsum.photos/seed/hookahpyrex/600/600'],
    categoryId: 'cat-4',
    brand: 'مینی اسموک',
    weight: '۹۰۰ گرم',
    tags: ['قلیان', 'مسافرتی', 'پیرکس', 'کتابی'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-17T18:00:00Z',
  },
  {
    id: 'prod-44',
    name: 'قلیان سنتی چوب گردو صیقلی اصیل خوانسار',
    slug: 'traditional-walnut-khansar-hookah',
    description: 'تنه چوبی تراش سه‌بعدی شده از تنه درخت گردوی صد ساله خوانسار قلیان‌سازان معروف. روغن‌کاری عمیق طبیعی برای جلوگیری از بو گرفتن و ترک خوردن چوب در درازمدت.',
    price: 1200000,
    stock: 8,
    images: ['https://picsum.photos/seed/hookahwood/600/600'],
    categoryId: 'cat-4',
    brand: 'خوانسار چوب',
    weight: '۱.۵ کیلوگرم',
    tags: ['قلیان', 'چوبی', 'گردو', 'خوانسار'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-18T10:30:00Z',
  },
  {
    id: 'prod-51',
    name: 'تنباکو میکس بلک مامبا (توت‌های وحشی ترش و یخ مفرط)',
    slug: 'black-mamba-tobacco',
    description: 'ترکیب رازآمیز و بسیار هیجان‌انگیز از تمشک سیاه، شاه‌توت، زغال‌اخته جنگلی و خنکی قطبی یخ خالص. پرفروش‌ترین میکس فانتزی مدرن با طعم گیرا و سنگین.',
    price: 95000,
    stock: 65,
    images: ['https://picsum.photos/seed/blackmamba/600/600'],
    categoryId: 'cat-5',
    brand: 'الفخر',
    weight: '۵۰ گرم',
    tags: ['تنباکو', 'میکس', 'بلک مامبا', 'ترش'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-25T11:00:00Z',
  },
  {
    id: 'prod-52',
    name: 'تنباکو میکس هفت ستاره رویال گلد لوکس عسلی',
    slug: 'seven-star-royal-tobacco',
    description: 'ترکیب غنی و پر احساس عسل طبیعی جنگلی با رایحه چرم سنتی و تنباکوی کوبایی. دودی سنگین و مجلل مخصوص مهمانی‌های شام مجلل و جلسات اداری.',
    price: 105000,
    stock: 50,
    images: ['https://picsum.photos/seed/sevenstar/600/600'],
    categoryId: 'cat-5',
    brand: 'Starbuzz',
    weight: '۵۰ گرم',
    tags: ['تنباکو', 'میکس', 'عسلی', 'رویال'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-26T16:00:00Z',
  },
  {
    id: 'prod-53',
    name: 'تنباکو میکس شیرین دارچین تند آتشین نوستالژی',
    slug: 'sweet-cinnamon-gum',
    description: 'میکسی دل‌نشین و گرمابخش از اسانس دارچین قنادی و عطر خوش آدامس بادکنکی قدیمی. طعمی بسیار پرحرارت و مناسب برای تسکین ذهن و فصول پاییزی زرد.',
    price: 85000,
    stock: 100,
    images: ['https://picsum.photos/seed/cinnamon/600/600'],
    categoryId: 'cat-5',
    brand: 'مزایا',
    weight: '۵۰ گرم',
    tags: ['میکس', 'دارچین', 'گرم', 'نوستالژی'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-27T08:30:00Z',
  },
  {
    id: 'prod-54',
    name: 'تنباکو میکس استوایی هندوانه شیوا طالبی شیفون خامه',
    slug: 'tropical-watermelon-melon-cream',
    description: 'معجون همگون، فوق‌العاده معطر و بسیار لطیف شیرین متشکل از عصاره خربزه مشهدی، طالبی ارگانیک شهددار، به همراه قطعات هندوانه سرخ و طعم خامه سوئیسی.',
    price: 88000,
    stock: 90,
    images: ['https://picsum.photos/seed/tropicalcream/600/600'],
    categoryId: 'cat-5',
    brand: 'الواحه',
    weight: '۵۰ گرم',
    tags: ['میکس', 'استوایی', 'هندوانه', 'خامه‌ای'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-28T15:10:00Z',
  },
  {
    id: 'prod-61',
    name: 'سری فونل سرامیکی با لعاب شیشه‌ای نسوز نبل',
    slug: 'funnel-ceramic-glazed-bowl',
    description: 'طراحی ویژه تک مجرا هوریکانی (فونل) که شیرابه تنباکو را در خود حفظ می‌کند و مانع افت طعم می‌گردد. سرامیک لعاب‌دیده حرارت زغال را به اوج توازن می‌رساند.',
    price: 165000,
    comparePrice: 195000,
    stock: 40,
    images: ['https://picsum.photos/seed/funnelbowl/600/600'],
    categoryId: 'cat-6',
    brand: 'هوشمند',
    weight: '۲۵۰ گرم',
    tags: ['سری', 'سرامیکی', 'لعاب‌دار', 'فونل'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-19T10:00:00Z',
  },
  {
    id: 'prod-62',
    name: 'سری سیلیکونی درجه یک طبی چرخشی ضد دفرمگی',
    slug: 'silicone-premium-bowl',
    description: 'ساخته شده از سیلیکون خالص پزشکی صد در صد بهداشتی و نسور. کاملا نشکن در برابر سقوط، بدون انتقال کوچکترین بوی نامطبوع به تنباکو در سخت‌ترین حرارت زغال.',
    price: 135000,
    stock: 60,
    images: ['https://picsum.photos/seed/siliconebowl/600/600'],
    categoryId: 'cat-6',
    brand: 'SilicaSmoke',
    weight: '۱۸۰ گرم',
    tags: ['سری', 'سیلیکونی', 'نشکن', 'نسوز'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-20T17:15:00Z',
  },
  {
    id: 'prod-63',
    name: 'سری دو طبقه سفالی سنتی عميق پخت کویر یزد',
    slug: 'two-tier-clay-bowl',
    description: 'سری خاک سرخ پخته یزد سنتی با شیار بندیهای طولی جهت سوخت ملو و تدریجی با حجم زیاد تنباکو مناسب برای دورهمی‌های طولانی خانوادگی بزرگ.',
    price: 115000,
    stock: 25,
    images: ['https://picsum.photos/seed/claybowlclassic/600/600'],
    categoryId: 'cat-6',
    brand: 'کویر یزد',
    weight: '۳۰۰ گرم',
    tags: ['سری', 'سفالی', 'دو طبقه', 'یزد'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-21T09:40:00Z',
  },
  {
    id: 'prod-71',
    name: 'پکیج کامل برس‌های نانو آنتی‌باکتریال نظافت تنه و شلنگ',
    slug: 'nano-cleaning-brush-kit',
    description: 'شامل ۳ عدد فرچه و برس با انعطاف و قطرهای طولی بالا برای پاک کردن رسوبات، جرم‌ها و شیرابه‌های درون شلنگ سیلیکونی، کوزه‌ها و مجرای فلزی تنه قلیان.',
    price: 75000,
    stock: 150,
    images: ['https://picsum.photos/seed/cleaningbrush/600/600'],
    categoryId: 'cat-7',
    brand: 'نانوکلیانی',
    weight: '۱۰۰ گرم',
    tags: ['برس', 'نظافت', 'پاک‌کننده'],
    isActive: true,
    isFeatured: false,
    createdAt: '2020-05-13T10:40:00Z',
  },
  {
    id: 'prod-72',
    name: 'مایع جرم‌زدا و خوشبوکننده کوزه و تنه با رایحه کاج',
    slug: 'pine-cleaning-liquid',
    description: 'فرمولاسیون گیاهی بدون حساسیت ریوی. از بین برنده فوری رسوب‌ها، بوهای مانده تنباکوهای دوسیب سنگین شیوا و سفید کننده بسیار قوی جام‌های بلوری و تیتانیومی قلیان.',
    price: 49000,
    stock: 200,
    images: ['https://picsum.photos/seed/cleanerliquid/600/600'],
    categoryId: 'cat-7',
    brand: 'پاک‌سای',
    weight: '۵۰۰ میلی‌لیتر',
    tags: ['مایع نظافت', 'جرم‌زدا', 'رایحه کاج'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-14T11:25:00Z',
  },
  {
    id: 'prod-73',
    name: 'ست واشر سیلیکونی آب‌بندی کامل تنه، شلنگ و سری',
    slug: 'silicone-gasket-grommet-set',
    description: 'مجموعه ۵ تایی واشرهای بسیار الاستیک ضخیم جهت مسدودسازی کامل درزهای هوا. هماهنگی عالی مکش روان و مانع هرگونه نشتی دود به بیرون سیستم.',
    price: 15000,
    stock: 500,
    images: ['https://picsum.photos/seed/gaskets/600/600'],
    categoryId: 'cat-7',
    brand: 'پارس واشر',
    weight: '۱۰ گرم',
    tags: ['واشر', 'سیلیکون', 'آب‌بندی'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-15T15:30:00Z',
  },
  {
    id: 'prod-81',
    name: 'زغال‌سرخ‌کن برقی پرانرژی توربو مجهز به کابل ضخیم نسوز',
    slug: 'electric-charcoal-burner-turbo',
    description: 'سرخ‌کن زغال ۱۰۰۰ واتی با المنت ضخیم تمام مارپیچی تمام چدنی. زغال‌های طبیعی لیمو و نارگیل فشرده را در کمتر از ۵ دقیقه مثل گدازه آتشفشان گداخته کاملا قرمز می‌کند.',
    price: 450000,
    comparePrice: 550000,
    stock: 30,
    images: ['https://picsum.photos/seed/burner1/600/600'],
    categoryId: 'cat-8',
    brand: 'برق‌آسا',
    weight: '۱.۲ کیلوگرم',
    tags: ['برقی', 'زغال‌سرخ‌کن', 'المنت', 'سرعت'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-29T10:00:00Z',
  },
  {
    id: 'prod-82',
    name: 'فندک اتمی سه شعله جت کلاسیک توربو با مخزن گاز بزرگ',
    slug: 'jet-torch-lighter-coals',
    description: 'فندک اتمی نیمه صنعتی سنگین با سه کانون شعله سوزنی متمرکز زاویه‌دار. بهترین انتخاب دستی برای افروختن سریع زغالهای مسافرتی و روشن کردن جازغالی گنبد.',
    price: 125000,
    stock: 80,
    images: ['https://picsum.photos/seed/lighter/600/600'],
    categoryId: 'cat-8',
    brand: 'اتمست',
    weight: '۱۵۰ گرم',
    tags: ['فندک', 'اتمی', 'توربو', 'زغال‌زن'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-30T14:45:00Z',
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

  let dbLoaded = false;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      dbLoaded = true;
    }
  } catch (err) {
    console.error('Failed to load DB file, reinitializing...', err);
  }

  // Pre-generate passwords: admin123 and customer123
  if (!dbLoaded || !dbCache) {
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
  } else {
    // Check if the loaded schema requires category or product injection
    let hasUpdates = false;
    if (!dbCache.categories || dbCache.categories.length < DEFAULT_CATEGORIES.length) {
      dbCache.categories = DEFAULT_CATEGORIES;
      hasUpdates = true;
    }
    if (!dbCache.products || dbCache.products.length < DEFAULT_PRODUCTS.length) {
      dbCache.products = DEFAULT_PRODUCTS;
      hasUpdates = true;
    }
    if (hasUpdates) {
      saveDb(dbCache);
    }
  }

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
