import React from 'react';
import { ArrowDown, Truck, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { StoreSettings } from '../../types/storefront';

interface HeroProps {
  settings: StoreSettings;
  onChoosePackage: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onChoosePackage }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-gray-50/50 text-gray-900 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-bold mb-5 shadow-2xs">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>توصيل سريع لجميع الولايات 🇩🇿 — الدفع عند الاستلام</span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-tight mb-4">
          اختر باقتك المفضلة <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            من أرقى العطور العالمية الفاخرة
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
          {settings.hero_subtitle || "عطور أصلية فاخرة بثبات يدوم طويلاً. اختر باقتك المفضلة واستفد من التخفيضات الحصرية."}
        </p>

        {/* Primary CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={onChoosePackage}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>ابدأ باختيار الباقة</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 max-w-3xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-right sm:text-right">
              <h4 className="text-xs font-bold text-gray-900">توصيل لكل الولايات</h4>
              <p className="text-[10px] text-gray-500 hidden sm:block">للمنزل أو المكتب</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-right sm:text-right">
              <h4 className="text-xs font-bold text-gray-900">الدفع عند الاستلام</h4>
              <p className="text-[10px] text-gray-500 hidden sm:block">افحص قبل الدفع</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-right sm:text-right">
              <h4 className="text-xs font-bold text-gray-900">جودة وثبات عالي</h4>
              <p className="text-[10px] text-gray-500 hidden sm:block">روائح تدوم طويلاً</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

