import React, { useState, useMemo } from 'react';
import { Perfume, Category, Package } from '../../types/storefront';
import { Check, Plus, AlertCircle, Sparkles, Filter, PackageX } from 'lucide-react';

interface PerfumeSectionProps {
  perfumes: Perfume[];
  categories: Category[];
  selectedPackage: Package | null;
  selectedPerfumes: Perfume[];
  onTogglePerfume: (perfume: Perfume) => void;
  isLoading: boolean;
  onScrollToDelivery: () => void;
}

export const PerfumeSection: React.FC<PerfumeSectionProps> = ({
  perfumes,
  categories,
  selectedPackage,
  selectedPerfumes,
  onTogglePerfume,
  isLoading,
  onScrollToDelivery
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  const requiredCount = selectedPackage ? selectedPackage.perfumes_count : 0;
  const currentCount = selectedPerfumes.length;
  const isTargetReached = selectedPackage && currentCount === requiredCount;

  // Category filter logic (الكل, عطور نسائية, عطور رجالية)
  const filteredPerfumes = useMemo(() => {
    if (selectedCategory === 'all') return perfumes;

    if (selectedCategory === 'women' || selectedCategory === 'cat-women') {
      return perfumes.filter(p => p.category.includes('نسائ') || p.category.includes('نساء') || p.category === 'عطور نسائية');
    }

    if (selectedCategory === 'men' || selectedCategory === 'cat-men') {
      return perfumes.filter(p => p.category.includes('رجال') || p.category.includes('رجل') || p.category === 'عطور رجالية');
    }

    return perfumes.filter(p => p.category_id === selectedCategory || p.category === selectedCategory);
  }, [perfumes, selectedCategory]);


  const handleSelectClick = (perfume: Perfume, isAlreadySelected: boolean) => {
    if (!selectedPackage) {
      setLimitWarning('يرجى اختيار الباقة أولاً للتمكن من اختيار العطور');
      setTimeout(() => setLimitWarning(null), 3500);
      return;
    }

    if (!isAlreadySelected && currentCount >= requiredCount) {
      setLimitWarning(`لقد وصلت إلى الحد الأقصى لباقتك المختارة (${requiredCount} عطور). لإضافة عطر آخر قم بإلغاء عطر سابق أو اختر باقة أكبر.`);
      setTimeout(() => setLimitWarning(null), 4000);
      return;
    }

    setLimitWarning(null);
    onTogglePerfume(perfume);
  };

  return (
    <section id="perfumes" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>الخطوة الثانية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            اختر عطورك المفضلة
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            {selectedPackage 
              ? `اختر بالضبط ${requiredCount} عطور من تشكيلتنا الفاخرة للاستمرار`
              : 'يرجى اختيار الباقة أولاً لتحديد عدد العطور المطلوب'}
          </p>
        </div>

        {/* Progress Counter Badge */}
        {selectedPackage && (
          <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 w-full md:w-auto justify-between md:justify-end shadow-lg">
            <div className="text-right">
              <span className="text-xs text-zinc-400 block font-medium">تقدم التحديد:</span>
              <span className={`text-xl sm:text-2xl font-black ${isTargetReached ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentCount} / {requiredCount} عطور
              </span>
            </div>

            <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shrink-0">
              {isTargetReached ? (
                <Check className="w-7 h-7 text-emerald-400 stroke-[3]" />
              ) : (
                <span className="text-amber-400 font-bold text-sm">
                  {requiredCount > 0 ? Math.round((currentCount / requiredCount) * 100) : 0}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warning banner */}
      {limitWarning && (
        <div className="mb-6 p-4 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{limitWarning}</span>
        </div>
      )}

      {/* Category Tabs - 100% Dynamic from Supabase */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        <div className="flex items-center gap-2 shrink-0 text-xs text-zinc-400 pl-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span>التصنيف:</span>
        </div>

        {categories.map((cat, idx) => (
          <button
            key={`${cat.id}-${idx}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>


      {/* Perfume Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800 p-4">
              <div className="h-44 bg-zinc-800 rounded-xl mb-4"></div>
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-zinc-800/60 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredPerfumes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 flex flex-col items-center justify-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <PackageX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">لا توجد عطور متوفرة حالياً</h3>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md leading-relaxed mb-4">
            تأكد من إضافة وتفعيل العطور في قاعدة البيانات من خلال لوحة التحكم (Admin Dashboard).
          </p>
          <a
            href="/dashboard/perfumes"
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors shadow-md"
          >
            الانتقال إلى لوحة التحكم لإضافة عطور →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredPerfumes.map((perfume, idx) => {
            const isSelected = selectedPerfumes.some(p => p.id === perfume.id);

            return (
              <div
                key={`${perfume.id}-${idx}`}
                onClick={() => handleSelectClick(perfume, isSelected)}
                className={`group relative rounded-2xl bg-zinc-900/90 border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-950/40 to-zinc-900 shadow-lg shadow-amber-500/10 scale-[1.01]'
                    : 'border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-900'
                }`}
              >
                {/* Category Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-amber-300 text-[10px] sm:text-xs font-medium">
                    {perfume.category}
                  </span>
                </div>

                {/* Selected Check Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-950 p-2 flex items-center justify-center">
                  {perfume.image_url ? (
                    <img
                      src={perfume.image_url}
                      alt={perfume.name}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.img-fallback');
                          if (fallback) fallback.classList.remove('hidden');
                        }
                      }}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : null}

                  <div className={`img-fallback ${perfume.image_url ? 'hidden' : ''} flex flex-col items-center justify-center text-zinc-600 p-4 text-center`}>
                    <Sparkles className="w-8 h-8 text-amber-500/40 mb-2" />
                    <span className="text-[10px] text-zinc-500 font-medium">{perfume.name}</span>
                  </div>
                </div>

                {/* Info & Select Button */}
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-base leading-snug mb-1 line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {perfume.name}
                    </h3>
                    {perfume.description && (
                      <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed line-clamp-2 mb-3 font-light">
                        {perfume.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectClick(perfume, isSelected);
                    }}
                    className={`w-full py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 shadow-md'
                        : 'bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم الاختيار</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>اختيار العطر</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Banner CTA */}
      {isTargetReached && (
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-emerald-950/80 border border-emerald-500/40 text-center flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-right">
            <h4 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>أحسنت! لقد اخترت {requiredCount} عطور كاملة</span>
            </h4>
            <p className="text-zinc-300 text-xs sm:text-sm mt-1">
              أنت جاهز لإتمام بيانات التوصيل والدفع عند الاستلام.
            </p>
          </div>

          <button
            onClick={onScrollToDelivery}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-400/20 transition-all cursor-pointer whitespace-nowrap"
          >
            المتابعة لإدخال عنوان التوصيل ←
          </button>
        </div>
      )}
    </section>
  );
};
