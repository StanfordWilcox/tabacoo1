import type {Metadata} from 'next';
import { Vazirmatn, Playfair_Display } from 'next/font/google';
import { ShopProvider } from '@/lib/store';
import './globals.css'; // Global styles

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600', '700', '900'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'دخانیات پارسی | Persian Smoke',
  description: 'فروشگاه پرمیوم تنباکو، زغال زغال‌سنگ و اکسسوری قلیان با کیفیت بی‌نظیر',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${playfair.variable}`}>
      <body className="bg-[#0E0600] text-[#F5E6C8] font-sans selection:bg-[#C8860A] selection:text-[#0E0600]" suppressHydrationWarning>
        <ShopProvider>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
