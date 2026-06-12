'use client';

import React, { useState, useMemo } from 'react';
import { useShop, Product, Review } from '@/lib/store';
import { ChevronRight, Heart, Star, ShoppingBag, Eye, Calendar, User, MessageCircle, Weight, Sparkles } from 'lucide-react';

interface ProductDetailViewProps {
  productSlug: string;
  onBackToShop: () => void;
  onProductClick: (slug: string) => void;
  onAddToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ProductDetailView({ productSlug, onBackToShop, onProductClick, onAddToast }: ProductDetailViewProps) {
  const { products, reviews, addReview, addToCart, currentUser } = useShop();

  // Find product
  const product = useMemo(() => {
    return products.find((p) => p.slug === productSlug);
  }, [products, productSlug]);

  // Gallery Active Image
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'reviews'>('info');

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Related products (same category, different ID)
  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isActive)
      .slice(0, 4);
  }, [products, product]);

  // Filter approved reviews for this product
  const productReviews = useMemo(() => {
    if (!product) return [];
    return reviews.filter((r) => r.productId === product.id && r.isApproved);
  }, [reviews, product]);

  // Fallback if product not found
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-right">
        <h2 className="text-xl font-bold text-[#F5E6C8]">محصول مورد نظر یافت نشد.</h2>
        <button onClick={onBackToShop} className="mt-4 bg-[#C8860A] text-[#0E0600] px-4 py-2 sharp-border text-xs font-bold">
          بازگشت به فروشگاه اکسپرس
        </button>
      </div>
    );
  }

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (product.stock <= 0) {
      onAddToast('این محصول در انبار موجود نیست.', 'error');
      return;
    }
    addToCart(product.id, qty);
    onAddToast(`✓ تعداد ${qty} عدد ${product.name} به سبد خریدتان اضافه گردید.`, 'success');
  };

  // Submit Review Form
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      onAddToast('لطفاً دیدگاه متنی خود را یادداشت کنید.', 'error');
      return;
    }
    addReview(product.id, reviewRating, reviewComment);
    onAddToast('✓ سپاسگزاریم؛ دیدگاه شما ثبت شده و پس از تأیید ناظر نمایش داده خواهد شد.', 'success');
    setReviewComment('');
    setReviewRating(5);
  };

  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-32 text-right">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#B8A07A] mb-8 select-none">
        <button onClick={onBackToShop} className="hover:text-[#C8860A] transition-colors">
          فروشگاه دخانیات
        </button>
        <ChevronRight className="w-3 H-3 shrink-0" />
        <span className="text-[#F5E6C8] font-bold line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Right sided block: Image with gallery (5 columns in RTL) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative h-96 bg-[#2D1500]/40 arabesque-border overflow-hidden flex items-center justify-center p-4">
            <img
              src={product.images[activeImage] || 'https://picsum.photos/seed/placeholder/400/400'}
              alt={product.name}
              className="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-zoom-in"
              referrerPolicy="no-referrer"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-[#8B1A1A] text-[#F5E6C8] text-xs font-bold px-3 py-1 sharp-border">
                {discountPercent}٪ تخفیف ویژه
              </span>
            )}
          </div>

          {/* Multiple Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 border sharp-border overflow-hidden bg-[#2D1500]/40 ${
                    activeImage === i ? 'border-[#C8860A]' : 'border-[#C8860A]/15 hover:border-[#C8860A]/40'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Left sided block: Buying controls & title (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-xs bg-[#2D1500] text-[#E8A820] border border-[#C8860A]/30 px-2.5 py-1 sharp-border font-bold">
                برند: {product.brand}
              </span>
              <span className="text-xs text-[#B8A07A] flex items-center gap-1">
                <Weight className="w-3.5 h-3.5" />
                وزن: {product.weight}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#F5E6C8] leading-tight mt-3">
              {product.name}
            </h1>
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-2 border-y border-[#C8860A]/10 py-3 text-xs text-[#B8A07A]">
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="font-bold text-[#F5E6C8]">۴.۹ از ۵</span>
            <span>(براساس دیدگاه‌های مستند مشتریان)</span>
          </div>

          <div className="space-y-4">
            {/* Short outline and pricing */}
            <p className="text-xs text-[#B8A07A]/80 leading-relaxed text-justify">
              {product.description.slice(0, 180)}...
            </p>

            <div className="bg-[#1A0A00] arabesque-border p-4 md:p-6 sharp-border flex items-baseline justify-between">
              <div>
                <span className="block text-2xs text-[#B8A07A] mb-1">قیمت نهایی مصرف‌کننده:</span>
                <span className="text-[#E8A820] font-sans font-black text-2xl md:text-3xl">
                  {product.price.toLocaleString()} تومان
                </span>
              </div>
              {product.comparePrice && (
                <div className="text-left">
                  <span className="block text-2xs text-[#B8A07A]/50 line-through font-mono">
                    {product.comparePrice.toLocaleString()} ت
                  </span>
                  <span className="text-[#8B1A1A] font-bold text-xs uppercase">
                    تخفیف دارد
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stock state */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-[#B8A07A]">وضعیت انبار:</span>
            {product.stock > 0 ? (
              <span className="text-[#3DA050] font-bold bg-[#3DA050]/10 px-2.5 py-1 sharp-border border border-[#3DA050]/25">
                ● موجود در انبار مرکزی ({product.stock} عدد)
              </span>
            ) : (
              <span className="text-[#8B1A1A] font-bold bg-[#8B1A1A]/10 px-2.5 py-1 sharp-border border border-[#8B1A1A]/25">
                ● اتمام موجودی! به من اطلاع بده
              </span>
            )}
          </div>

          {/* Quantity selector and checkout btn */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <div className="flex items-center bg-[#1A0A00] border border-[#C8860A]/20 sharp-border">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 text-[#C8860A] hover:bg-[#C8860A]/10 text-lg transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-sans font-bold text-sm text-[#F5E6C8]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-4 py-2 text-[#C8860A] hover:bg-[#C8860A]/10 text-lg transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full sm:flex-1 bg-[#C8860A] hover:bg-[#E8A820] text-[#0E0600] font-bold py-3.5 sharp-border flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>افزودن به سبد خرید شیک</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs panels */}
      <div className="mt-16 border border-[#C8860A]/15 bg-[#1A0A00] p-6 sharp-border">
        <div className="flex border-b border-[#C8860A]/15 mb-6 text-sm gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'info' ? 'border-[#C8860A] text-[#C8860A]' : 'border-transparent text-[#B8A07A] hover:text-[#F5E6C8]'
            }`}
          >
            توضیحات تکمیلی
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'specs' ? 'border-[#C8860A] text-[#C8860A]' : 'border-transparent text-[#B8A07A] hover:text-[#F5E6C8]'
            }`}
          >
            جدول مشخصات
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'reviews' ? 'border-[#C8860A] text-[#C8860A]' : 'border-transparent text-[#B8A07A] hover:text-[#F5E6C8]'
            }`}
          >
            نظرات خریداران ({productReviews.length})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'info' && (
          <div className="text-xs md:text-sm text-[#B8A07A] leading-relaxed space-y-4 font-light text-justify">
            <p>{product.description}</p>
            <p>
              تمامی محصولات ارسالی توسط دخانیات پارسی در بسته‌بندی‌های ایزوله بهداشتی ضدبو بسته‌بندی شده تا عطر و اصالت رطوبت طعم‌ها در طول مسیر حمل‌ونقل حفظ شوند.
            </p>
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === 'specs' && (
          <div className="space-y-1 max-w-xl text-xs md:text-sm">
            <div className="grid grid-cols-3 bg-[#0E0600] p-3 border-r-2 border-[#C8860A]">
              <span className="font-bold text-[#F5E6C8]">برند تولید کننده</span>
              <span className="col-span-2 text-[#B8A07A]">{product.brand}</span>
            </div>
            <div className="grid grid-cols-3 bg-[#2D1500]/30 p-3 border-r-2 border-[#C8860A]">
              <span className="font-bold text-[#F5E6C8]">وزن خالص بسته</span>
              <span className="col-span-2 text-[#B8A07A] font-sans">{product.weight}</span>
            </div>
            <div className="grid grid-cols-3 bg-[#0E0600] p-3 border-r-2 border-[#C8860A]">
              <span className="font-bold text-[#F5E6C8]">طعم و اسانس</span>
              <span className="col-span-2 text-[#B8A07A]">{product.tags.join('، ')}</span>
            </div>
            <div className="grid grid-cols-3 bg-[#2D1500]/30 p-3 border-r-2 border-[#C8860A]">
              <span className="font-bold text-[#F5E6C8]">تاریخ تولید دفتری</span>
              <span className="col-span-2 text-[#B8A07A] font-sans">۲۰۲۶</span>
            </div>
          </div>
        )}

        {/* Tab 3: Reviews with submission form */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Reviews display */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-4">
                دیدگاه‌های کاربران تایید شده
              </h3>
              {productReviews.length === 0 ? (
                <p className="text-xs text-[#B8A07A]/60 font-light pr-3">
                  تاکنون هیچ نظری برای این کالا نوشته نشده است. شما فرستنده اولین دیدگاه باشید!
                </p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {productReviews.map((rev) => (
                    <div key={rev.id} className="bg-[#0E0600] border border-[#C8860A]/10 p-4 sharp-border">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-[#F5E6C8]">{rev.userName}</span>
                        <span className="text-[10px] text-[#B8A07A]/60 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                      <div className="flex gap-0.5 text-amber-500 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'opacity-30'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#B8A07A] leading-relaxed text-justify">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submitting form */}
            <div className="bg-[#0E0600] border border-[#C8860A]/10 p-6 sharp-border">
              <h3 className="font-bold text-sm text-[#F5E6C8] pr-3 border-r-2 border-[#C8860A] mb-4">
                ثبت دیدگاه یا ارزیابی جدید
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-[#B8A07A]">امتیاز شما به طعم و کام کالا:</span>
                  <div className="flex gap-1.5 text-amber-500 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const score = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(score)}
                          className="hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${score <= reviewRating ? 'fill-current' : 'opacity-30'}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#B8A07A] block">متن دیدگاه شما</label>
                  <textarea
                    rows={4}
                    placeholder="نقاط قوت، کیفیت تبخیر، بو و تجربه کلیتان را اینجا برای همکارانمان بنویسید..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-[#1A0A00] border border-[#C8860A]/20 focus:border-[#C8860A] px-3.5 py-3 text-xs text-[#F5E6C8] outline-none sharp-border font-light text-right leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#C8860A] hover:bg-[#E8A820] text-[#0E0600] font-bold text-xs px-6 py-2.5 sharp-border transition-colors uppercase"
                >
                  ارسال نظر برای ناظر
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h3 className="font-bold text-lg text-[#F5E6C8] border-r-2 border-[#C8860A] pr-3 mb-6">
            دیگر محصولات مشابه که می‌پسندید
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => {
              return (
                <div
                  key={p.id}
                  onClick={() => onProductClick(p.slug)}
                  className="group bg-[#2D1500]/55 border border-[#C8860A]/15 hover:border-[#C8860A] p-4 sharp-border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div className="h-40 bg-[#0E0600] p-2 overflow-hidden flex items-center justify-center border-b border-[#C8860A]/10 mb-3">
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#C8860A] font-semibold">{p.brand}</span>
                    <h4 className="font-bold text-xs text-[#F5E6C8] line-clamp-1 mt-1">
                      {p.name}
                    </h4>
                    <span className="block text-[#E8A820] font-sans font-black text-xs md:text-sm mt-2">
                      {p.price.toLocaleString()} تومان
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
