import React from 'react';
import { ArrowDown, Truck, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { StoreSettings } from '../../types/storefront';

interface HeroProps {
  settings: StoreSettings;
  onChoosePackage: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onChoosePackage }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-amber-500/10">
      {/* Background glow & luxury decorative circles */}
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 left-10 w-64 h-64 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>توصيل سريع وسريع إلى 58 ولاية — الدفع يد بيد عند الاستلام</span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          اكتشف عطرك المفضل <br />
          <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
            بأفضل العروض والباقت الفاخرة
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-300 text-base sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-light">
          {settings.hero_subtitle || "اختر باقتك، اختر عطورك، ونحن نتكفل بالباقي. عطور أصلية فاخرة بثبات تدوم طويلاً لجميع المناسبات."}
        </p>

        {/* Primary CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={onChoosePackage}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold text-lg shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>اختر باقتك الآن</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8 border-t border-zinc-800/80 max-w-4xl mx-auto text-right">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">توصيل إلى 58 ولاية</h4>
              <p className="text-[11px] text-zinc-400">توصيل للمنزل أو المكتب</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">الدفع عند الاستلام COD</h4>
              <p className="text-[11px] text-zinc-400">افحص طلبك قبل الدفع</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 justify-center md:justify-start">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">ضمان الثبات والجودة</h4>
              <p className="text-[11px] text-zinc-400">تركيز عالي ونفحات ساحرة</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
