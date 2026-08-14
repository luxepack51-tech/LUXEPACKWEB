import React from 'react';
import { Sparkles, MessageCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { StoreSettings, Package, Perfume } from '../../types/storefront';

interface HeaderProps {
  settings: StoreSettings;
  selectedPackage: Package | null;
  selectedPerfumes: Perfume[];
  packagesCount?: number;
  onScrollToSection: (sectionId: string) => void;
  onOpenCheckout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  selectedPackage,
  selectedPerfumes,
  packagesCount = 0,
  onScrollToSection,
  onOpenCheckout
}) => {
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;
  const isComplete = selectedPackage && selectedPerfumes.length === perfumesNeeded;

  const rawWhatsapp = settings.whatsapp_number || settings.phone_number || '213796161396';
  let cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');
  if (cleanWhatsapp.startsWith('0')) {
    cleanWhatsapp = '213' + cleanWhatsapp.slice(1);
  }
  if (!cleanWhatsapp.startsWith('213')) {
    cleanWhatsapp = '213' + cleanWhatsapp;
  }
  const whatsappUrl = `https://wa.me/${cleanWhatsapp || '213796161396'}?text=${encodeURIComponent('مرحباً! أود الاستفسار بخصوص عطور المتجر.')}`;

  return (
    <div className="w-full">
      {/* 1. Gradient Top Header Banner */}
      <header className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-6 sm:py-8 px-4 text-center shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl md:text-4xl">🌸</span>
            <span>{settings.store_name || 'متجر العطور الفاخرة'}</span>
          </h1>
          <p className="text-blue-100 text-xs sm:text-base font-medium max-w-2xl mx-auto">
            {settings.hero_subtitle || 'اختر عطورك وأكمل طلبك بسهولة مع التوصيل والدفع عند الاستلام'}
          </p>
        </div>
      </header>

      {/* 2. Top Quick Actions & Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 max-w-4xl mx-auto">
          {/* WhatsApp Contact Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>تواصل معنا عبر واتساب</span>
            <MessageCircle className="w-4 h-4 fill-current" />
          </a>

          {/* Categories / Counters Tabs */}
          <div className="w-full sm:w-auto flex items-center justify-center gap-3">
            {/* Featured / المميزة */}
            <button
              type="button"
              onClick={() => onScrollToSection('perfumes')}
              className="flex-1 sm:flex-initial py-2 sm:py-2.5 px-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>مميزة</span>
              <span>👑</span>
            </button>

            {/* Packages / الباكات */}
            <button
              type="button"
              onClick={() => onScrollToSection('packages')}
              className="flex-1 sm:flex-initial py-2 sm:py-2.5 px-5 rounded-2xl bg-white border-2 border-indigo-500 text-indigo-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span className="text-indigo-600 font-bold">{packagesCount || 0}</span>
              <span>🎁</span>
              <span>الباكات</span>
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
              <button
                onClick={onOpenCheckout}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold text-xs shadow-xs hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✓ تأكيد الطلب</span>
              </button>
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


