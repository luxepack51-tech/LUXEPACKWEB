import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, ShoppingBag, ShoppingCart, ShieldCheck } from 'lucide-react';
import { StoreSettings, Package, Perfume } from '../../types/storefront';
import { useCart } from '../../context/CartContext';

interface HeaderProps {
  settings: StoreSettings;
  selectedPackage?: Package | null;
  selectedPerfumes?: Perfume[];
  packagesCount?: number;
  activeSection?: 'packages' | 'featured';
  onNavigateSection?: (section: 'packages' | 'featured') => void;
  onOpenCheckout?: () => void;
  onAddCurrentPackageToCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  selectedPackage = null,
  selectedPerfumes = [],
  packagesCount = 0,
  activeSection = 'packages',
  onNavigateSection,
  onOpenCheckout,
  onAddCurrentPackageToCart
}) => {
  const { totalItemsCount, openCart } = useCart();
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;
  const isComplete = selectedPackage && selectedPerfumes.length === perfumesNeeded;

  const isPackagesActive = activeSection === 'packages';
  const isFeaturedActive = activeSection === 'featured';

  const rawWhatsapp = settings.whatsapp_number || settings.phone_number || '213796161396';
  let cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');
  if (cleanWhatsapp.startsWith('0')) {
    cleanWhatsapp = '213' + cleanWhatsapp.slice(1);
  }
  if (!cleanWhatsapp.startsWith('213')) {
    cleanWhatsapp = '213' + cleanWhatsapp;
  }
  const whatsappUrl = `https://wa.me/${cleanWhatsapp || '213796161396'}?text=${encodeURIComponent('مرحباً! أود الاستفسار بخصوص عطور المتجر.')}`;

  const handlePackagesClick = () => {
    if (onNavigateSection) {
      onNavigateSection('packages');
    } else {
      const el = document.getElementById('packages-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleFeaturedClick = () => {
    if (onNavigateSection) {
      onNavigateSection('featured');
    } else {
      const el = document.getElementById('featured-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. Gradient Top Header Banner */}
      <header className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-6 sm:py-8 px-4 text-center shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleLogoClick}
            className="group inline-block text-center cursor-pointer transition-transform active:scale-98"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl group-hover:rotate-12 transition-transform">🌸</span>
              <span>{settings.store_name || 'متجر العطور الفاخرة'}</span>
            </h1>
          </button>
          <p className="text-blue-100 text-xs sm:text-base font-medium max-w-2xl mx-auto">
            {settings.hero_subtitle || 'اختر عطورك وأكمل طلبك بسهولة مع التوصيل والدفع عند الاستلام'}
          </p>
        </div>
      </header>

      {/* 2. Sticky Quick Actions & Tabs Bar (Always visible during scrolling) */}
      <nav
        id="storefront-sticky-nav"
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-sm py-2.5 sm:py-3 transition-all duration-200"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-4xl mx-auto">
            
            {/* Quick Actions (WhatsApp & Cart) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="تواصل عبر واتساب"
                className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span className="hidden md:inline">واتساب</span>
              </a>

              {/* Global Shopping Cart Button */}
              <button
                type="button"
                id="header-cart-btn"
                onClick={openCart}
                className={`p-2 sm:px-4 sm:py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all duration-200 cursor-pointer relative ${
                  totalItemsCount > 0
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 ring-2 ring-indigo-400/40 shadow-indigo-500/20 active:scale-98'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">السلة</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-black transition-transform ${
                  totalItemsCount > 0
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 scale-110 shadow-xs'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {totalItemsCount}
                </span>
              </button>
            </div>

            {/* Categories / Counters Tabs */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 max-w-sm sm:max-w-none">
              {/* Packages / الباكات */}
              <button
                type="button"
                id="shopmode-tab-packages"
                onClick={handlePackagesClick}
                className={`flex-1 sm:flex-initial py-2 sm:py-2.5 px-3 sm:px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition-all duration-200 cursor-pointer ${
                  isPackagesActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-indigo-500/25 ring-2 ring-indigo-400/40 scale-[1.02]'
                    : 'bg-white border border-gray-200/90 hover:border-indigo-400 hover:text-indigo-700 text-gray-700'
                }`}
              >
                <span>🎁</span>
                <span>الباكات</span>
                {packagesCount > 0 && (
                  <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold ${
                    isPackagesActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {packagesCount}
                  </span>
                )}
              </button>

              {/* Featured / العطور المميزة */}
              <button
                type="button"
                id="shopmode-tab-featured"
                onClick={handleFeaturedClick}
                className={`flex-1 sm:flex-initial py-2 sm:py-2.5 px-3 sm:px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition-all duration-200 cursor-pointer ${
                  isFeaturedActive
                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-amber-500/25 ring-2 ring-amber-400/40 scale-[1.02]'
                    : 'bg-white border border-gray-200/90 hover:border-amber-400 hover:text-amber-700 text-gray-700'
                }`}
              >
                <span>👑</span>
                <span>العطور المميزة</span>
                <span className={`hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isFeaturedActive ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  حصري
                </span>
              </button>
            </div>

          </div>

          {/* Selected Package Banner indicator if active */}
          {selectedPackage && (
            <div className="mt-2 max-w-4xl mx-auto p-2.5 sm:p-3 bg-indigo-50/95 border border-indigo-100/90 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 text-xs shadow-xs">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold truncate">
                <span>🎁</span>
                <span className="truncate">الباك: {selectedPackage.name}</span>
                <span className="text-indigo-600 font-black shrink-0">({selectedPerfumes.length} / {perfumesNeeded})</span>
              </div>
              {isComplete ? (
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  className="px-3.5 py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-xs hover:opacity-95 cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <span>✓ تأكيد الطلب</span>
                </button>
              ) : (
                <span className="text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[11px] font-semibold shrink-0">
                  حدد {perfumesNeeded - selectedPerfumes.length} متبقية
                </span>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};


