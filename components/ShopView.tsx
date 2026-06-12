'use client';

import React, { useState, useMemo } from 'react';
import { useShop, Product } from '@/lib/store';
import { Search, SlidersHorizontal, ArrowUpDown, Coins, Package, PackageX, Weight, Star } from 'lucide-react';

interface ShopViewProps {
  initialCategoryId?: string;
  initialSearch?: string;
  onProductClick: (slug: string) => void;
  onAddToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function ShopView({ initialCategoryId = '', initialSearch = '', onProductClick, onAddToast }: ShopViewProps) {
  const { products, categories, addToCart } = useShop();
  
  // States
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(300000);
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc, stock

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMaxPrice(300000);
    setSortBy('newest');
  };

  // Get brands
  const brands = useMemo(() => {
    const bSet = new Set(products.map(p => p.brand));
    return Array.from(bSet);
  }, [products]);

  // Handle Add to Cart
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      onAddToast(`محصول ${product.name} در حال حاضر موجود نیست.`, 'error');
      return;
    }
    addToCart(product.id, 1);
    onAddToast(`✓ ${product.name} به سبد خرید شما اضافه گردید.`, 'success');
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.isActive) return false;
        const sMatch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                      p.brand.toLowerCase().includes(search.toLowerCase()) ||
                      p.description.toLowerCase().includes(search.toLowerCase());
        const cMatch = selectedCategory ? p.categoryId === selectedCategory : true;
        const bMatch = selectedBrand ? p.brand === selectedBrand : true;
        const pMatch = p.price <= maxPrice;
        return sMatch && cMatch && bMatch && pMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        if (sortBy === 'stock') {
          return b.stock - a.stock;
        }
        return 0;
      });
  }, [products, search, selectedCategory, selectedBrand, maxPrice, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-32 text-right">
      
      {/* Page Title */}
      <div className="border-b border-[#C8860A]/15 pb-6 mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-black text-[#F5E6C8] tracking-tight">
            فروشگاه آنلاین دخانیات پارسی
          </h1>
          <p className="text-xs md:text-sm text-[#B8A07A] mt-2 font-light">
            مجموعه تخصصی تنباکوهای میوه‌ای، زغال‌های جهرم و ابزارهای تزیینی سنتی و مدرن
          </p>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-[#E8A820] hover:underline"
        >
          پاک کردن تمام فیلترها
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Right Column: Filters Dashboard (Desktop / RTL is right sided) */}
        <div id="filters-sidebar" className="bg-[#1A0A00] arabesque-border p-6 sharp-border shrink-0 self-start space-y-8">
          <div className="flex items-center justify-between border-b border-[#C8860A]/15 pb-4 mb-4">
            <h3 className="font-bold text-sm text-[#F5E6C8] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C8860A]" />
              فیلترهای پیشرفته
            </h3>
          </div>

          {/* 1. Search Bar */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#B8A07A]">جستجو در محصولات</label>
            <div className="relative">
              <input
                type="text"
                placeholder="نام طعم، برند یا محصول..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0E0600] border border-[#C8860A]/20 hover:border-[#C8860A]/40 focus:border-[#C8860A] text-xs px-10 py-3 text-[#F5E6C8] outline-none sharp-border transition-colors font-light text-right"
              />
              <Search className="w-4 h-4 text-[#C8860A]/60 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* 2. Categories Filter */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#B8A07A] block">دسته‌بندی‌ها</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-right text-xs px-3 py-2 sharp-border transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-[#C8860A] text-[#0E0600] font-bold' 
                    : 'bg-[#0E0600] hover:bg-[#C8860A]/10 text-[#F5E6C8]'
                }`}
              >
                همه دسته‌ها
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-right text-xs px-3 py-2 sharp-border transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-[#C8860A] text-[#0E0600] font-bold' 
                      : 'bg-[#0E0600] hover:bg-[#C8860A]/10 text-[#F5E6C8]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Brand Filter */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#B8A07A] block">برند تجاری</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-[#0E0600] border border-[#C8860A]/20 hover:border-[#C8860A]/40 focus:border-[#C8860A] text-xs px-3 py-2.5 text-[#F5E6C8] outline-none sharp-border font-light"
            >
              <option value="">همه برندها</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* 4. Price range Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#B8A07A]">حداکثر قیمت:</span>
              <span className="font-mono text-[#E8A820] font-bold">
                {maxPrice.toLocaleString()} ت
              </span>
            </div>
            <input
              type="range"
              min="30000"
              max="300000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C8860A]"
            />
            <div className="flex justify-between text-[10px] text-[#B8A07A]/60 font-mono">
              <span>۳۰,۰۰۰ تومان</span>
              <span>۳۰۰,۰۰۰ تومان</span>
            </div>
          </div>
        </div>

        {/* Left Column: Products Grid & Sorting (Desktop) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Sort Controls Bar */}
          <div className="bg-[#1A0A00] arabesque-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sharp-border">
            <div className="text-xs text-[#B8A07A]/80 font-light">
              یافت شده: <span className="text-[#C8860A] font-bold font-sans">{filteredProducts.length}</span> محصول منطبق
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C8860A]" />
              <span className="text-xs text-[#B8A07A]">مرتب‌سازی:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#0E0600] border border-[#C8860A]/20 text-xs px-2 py-1.5 text-[#F5E6C8] outline-none sharp-border font-light text-right"
              >
                <option value="newest">جدیدترین‌ها</option>
                <option value="price-asc">قیمت: کم به زیاد</option>
                <option value="price-desc">قیمت: زیاد به کم </option>
                <option value="stock">بیشترین موجودی</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#1A0A00] arabesque-border text-center py-20 sharp-border space-y-4">
              <PackageX className="w-12 h-12 text-[#C8860A]/40 mx-auto" />
              <h3 className="font-bold text-lg text-[#F5E6C8]">هیچ محصولی پیدا نشد!</h3>
              <p className="text-xs text-[#B8A07A]/70 max-w-sm mx-auto">
                فیلترهای جستجوی انتخابی شما هیچ خروجی مادی به همراه نداشت. لطفاً فیلترها را ریست کنید.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#C8860A] text-[#0E0600] text-xs font-bold px-4 py-2 sharp-border hover:bg-[#E8A820] transition-colors"
              >
                پاک کردن تمام فیلترها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const discountPercent = p.comparePrice 
                  ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) 
                  : 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => onProductClick(p.slug)}
                    className="group bg-[#2D1500]/55 arabesque-border hover:border-[#C8860A] sharp-border cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(200,134,10,0.15)] flex flex-col justify-between"
                  >
                    {/* Image space */}
                    <div className="relative h-48 bg-[#0E0600] overflow-hidden flex items-center justify-center border-b border-[#C8860A]/10">
                      <img
                        src={p.images[0] || 'https://picsum.photos/seed/placeholder/300/300'}
                        alt={p.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
                        {p.stock === 0 && (
                          <span className="bg-red-800 text-white text-[9px] font-bold px-2 py-0.5 sharp-border">
                            ناموجود
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="bg-[#8B1A1A] text-[#F5E6C8] text-[9px] font-bold px-2 py-0.5 sharp-border">
                            {discountPercent}٪ تخفیف
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="bg-[#C8860A] text-[#0E0600] text-[9px] font-bold px-2 py-0.5 sharp-border">
                            ویژه
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta info block */}
                    <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Brand & Weight */}
                        <div className="flex items-center justify-between text-[10px] text-[#B8A07A]">
                          <span className="font-semibold text-[#C8860A]">{p.brand}</span>
                          <span className="flex items-center gap-1">
                            <Weight className="w-3 h-3" />
                            {p.weight}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-xs md:text-sm text-[#F5E6C8] line-clamp-2 mt-1.5">
                          {p.name}
                        </h4>
                      </div>

                      <div className="pt-2">
                        {/* Star Rating Simulation */}
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 mb-1.5">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-current" />
                            ))}
                          </div>
                          <span className="text-[#B8A07A]/60">(۴.۹)</span>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xs text-[#B8A07A]/70 line-through font-mono">
                            {p.comparePrice ? `${p.comparePrice.toLocaleString()} ت` : ''}
                          </span>
                          <span className="text-[#E8A820] font-sans font-black text-sm md:text-base">
                            {p.price.toLocaleString()} تومان
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart full-width trigger */}
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      disabled={p.stock <= 0}
                      className={`w-full text-xs font-bold py-2.5 sharp-border flex items-center justify-center gap-2 transition-all ${
                        p.stock <= 0
                          ? 'bg-[#1A0A00] text-[#B8A07A]/40 border-t border-[#C8860A]/5 cursor-not-allowed'
                          : 'bg-[#C8860A]/10 text-[#C8860A] border-t border-[#C8860A]/20 hover:bg-[#C8860A] hover:text-[#0E0600]'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>{p.stock <= 0 ? 'اتمام موجودی انبار' : 'افزودن به سبد خرید'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
