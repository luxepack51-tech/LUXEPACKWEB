import React from 'react';
import { Sparkles, MessageCircle, ShoppingBag, ShoppingCart, ShieldCheck } from 'lucide-react';
import { StoreSettings, Package, Perfume } from '../../types/storefront';
import { useCart } from '../../context/CartContext';

interface HeaderProps {
  settings: StoreSettings;
  selectedPackage?: Package | null;
  selectedPerfumes?: Perfume[];
  packagesCount?: number;
  shopMode?: 'packages' | 'featured';
  onSelectShopMode?: (mode: 'packages' | 'featured') => void;
  onScrollToSection?: (sectionId: string) => void;
  onOpenCheckout?: () => void;
  onAddCurrentPackageToCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  selectedPackage = null,
  selectedPerfumes = [],
  packagesCount = 0,
  shopMode = 'packages',
  onSelectShopMode,
  onScrollToSection,
  onOpenCheckout,
  onAddCurrentPackageToCart
}) => {
  const { totalItemsCount, openCart, itemJustAdded, productsTotal } = useCart();
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;
  const isComplete = selectedPackage && selectedPerfumes.length === perfumesNeeded;

  const isFeaturedActive = shopMode === 'featured';
  const isPackagesActive = shopMode === 'packages';

  const rawWhatsapp = settings.whatsapp_number || settings.phone_number || '213796161396';
  let cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');
  if (cleanWhatsapp.startsWith('0')) {
    cleanWhatsapp = '213' + cleanWhatsapp.slice(1);
  }
  if (!cleanWhatsapp.startsWith('213')) {
    cleanWhatsapp = '213' + cleanWhatsapp;
  }
  const whatsappUrl = `https://wa.me/${cleanWhatsapp || '213796161396'}?text=${encodeURIComponent('مرحباً! أود الاستفسار بخصوص عطور المتجر.')}`;

  const handleFeaturedClick = () => {
    if (onSelectShopMode) {
      onSelectShopMode('featured');
    }
  };

  const handlePackagesClick = () => {
    if (onSelectShopMode) {
      onSelectShopMode('packages');
    }
    if (onScrollToSection) {
      onScrollToSection('packages');
    }
  };

  const handleLogoClick = () => {
    if (onSelectShopMode) {
      onSelectShopMode('packages');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
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

      {/* 2. Top Quick Actions & Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 max-w-4xl mx-auto">
          {/* WhatsApp Contact & Cart Buttons */}
          <div className="w-full sm:w-auto flex items-center gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-3 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>واتساب</span>
              <MessageCircle className="w-4 h-4 fill-current" />
            </a>

            {/* Global Shopping Cart Button */}
            <button
              type="button"
              id="header-cart-btn"
              onClick={openCart}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer relative ${
                totalItemsCount > 0
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 ring-2 ring-indigo-400/40 shadow-indigo-500/20 active:scale-98'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>السلة</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black transition-transform ${
                totalItemsCount > 0
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 scale-110 shadow-xs'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {totalItemsCount}
              </span>
            </button>
          </div>

          {/* Categories / Counters Tabs */}
          <div className="w-full sm:w-auto flex items-center justify-center gap-3">
            {/* Packages / الباكات */}
            <button
              type="button"
              id="shopmode-tab-packages"
              onClick={handlePackagesClick}
              className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer ${
                isPackagesActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-indigo-500/25 ring-2 ring-indigo-400/40 scale-[1.02]'
                  : 'bg-white border border-gray-200/90 hover:border-indigo-400 hover:text-indigo-700 text-gray-700'
              }`}
            >
              <span>🎁</span>
              <span>الباكات</span>
              {packagesCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
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
              className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer ${
                isFeaturedActive
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-amber-500/25 ring-2 ring-amber-400/40 scale-[1.02]'
                  : 'bg-white border border-gray-200/90 hover:border-amber-400 hover:text-amber-700 text-gray-700'
              }`}
            >
              <span>🌸</span>
              <span>العطور المميزة</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                isFeaturedActive ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                👑 حصري
              </span>
            </button>
          </div>
        </div>

        {/* Selected Package Banner indicator if active */}
        {selectedPackage && (
          <div className="mt-3 max-w-4xl mx-auto p-3.5 bg-indigo-50/90 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm shadow-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <span>🎁</span>
              <span>الباقة المختارة: {selectedPackage.name}</span>
              <span className="text-indigo-600 font-black">({selectedPerfumes.length} / {perfumesNeeded} عطور)</span>
            </div>
            {isComplete ? (
              <div className="w-full sm:w-auto flex items-center justify-end">
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold text-xs shadow-xs hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✓ تأكيد الطلب</span>
                </button>
              </div>
            ) : (
              <span className="text-amber-800 bg-amber-100/80 px-3 py-1 rounded-lg text-xs font-semibold">
                حدد {perfumesNeeded - selectedPerfumes.length} عطور متبقية لإكمال الباقة
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


