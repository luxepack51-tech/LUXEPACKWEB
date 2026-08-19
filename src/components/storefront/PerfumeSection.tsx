import React, { useState, useMemo, useEffect } from 'react';
import { Perfume, Category, Package } from '../../types/storefront';
import { Check, AlertCircle, PackageX, Sparkles } from 'lucide-react';
import { trackTikTokViewContent, trackTikTokAddToCart } from '../../services/tiktok';

interface PerfumeSectionProps {
  perfumes: Perfume[];
  categories: Category[];
  selectedPackage: Package | null;
  selectedPerfumes: Perfume[];
  onTogglePerfume: (perfume: Perfume) => void;
  isLoading: boolean;
  onScrollToDelivery: () => void;
  onAddPackageToCart?: () => void;
}

const getCategoryIcon = (catName: string): string => {
  const lower = catName.toLowerCase();
  if (lower.includes('رجال') || lower.includes('men')) return '💼';
  if (lower.includes('نسائ') || lower.includes('نساء') || lower.includes('women')) return '🌸';
  if (lower.includes('ميكس') || lower.includes('mix') || lower.includes('يونيسكس')) return '✨';
  if (lower.includes('مميز') || lower.includes('vip') || lower.includes('فاخر')) return '👑';
  return '💎';
};

export const PerfumeSection: React.FC<PerfumeSectionProps> = ({
  perfumes,
  categories,
  selectedPackage,
  selectedPerfumes,
  onTogglePerfume,
  isLoading,
  onScrollToDelivery,
  onAddPackageToCart
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  // Default to women's category when categories load or when a package is selected
  useEffect(() => {
    if (categories && categories.length > 0) {
      const womenCat = categories.find(c => c.name.includes('نسائ') || c.name.includes('نساء') || c.id === 'women' || c.slug === 'women');
      if (womenCat) {
        setSelectedCategoryId(womenCat.id);
      } else {
        setSelectedCategoryId(categories[0].id);
      }
    }
  }, [categories, selectedPackage?.id]);

  const requiredCount = selectedPackage ? selectedPackage.perfumes_count : 0;
  const currentCount = selectedPerfumes.length;
  const isTargetReached = selectedPackage && currentCount === requiredCount;

  // Filter perfumes based on selected category dynamically
  const filteredPerfumes = useMemo(() => {
    if (selectedCategoryId === 'all') return perfumes;

    const currentCatObj = categories.find(c => c.id === selectedCategoryId);
    const catName = currentCatObj ? currentCatObj.name : selectedCategoryId;

    return perfumes.filter(p => {
      if (p.category_id && p.category_id === selectedCategoryId) return true;
      if (p.category === catName) return true;
      if (catName.includes('نسائ') && (p.category.includes('نسائ') || p.category.includes('نساء'))) return true;
      if (catName.includes('رجال') && (p.category.includes('رجال') || p.category.includes('رجل'))) return true;
      return false;
    });
  }, [perfumes, selectedCategoryId, categories]);

  const handleSelectClick = (perfume: Perfume, isAlreadySelected: boolean) => {
    // Track ViewContent on click
    trackTikTokViewContent({
      id: perfume.id,
      name: perfume.name,
      type: 'perfume',
      category: perfume.category
    });

    if (!selectedPackage) {
      setLimitWarning('يرجى اختيار الباك أولاً من الأعلى للتمكن من تحديد العطور');
      setTimeout(() => setLimitWarning(null), 3500);
      return;
    }

    if (!isAlreadySelected && currentCount >= requiredCount) {
      setLimitWarning(`لقد وصلت للحد الأقصى (${requiredCount} عطور) لباك ${selectedPackage.name}. لإضافة عطر آخر، ألغِ عطر سابق أو اختر باك أكبر.`);
      setTimeout(() => setLimitWarning(null), 4000);
      return;
    }

    // Track AddToCart when selecting a perfume into the package
    if (!isAlreadySelected) {
      trackTikTokAddToCart({
        id: perfume.id,
        name: perfume.name,
        type: 'perfume',
        category: perfume.category,
        quantity: 1
      });
    }

    setLimitWarning(null);
    onTogglePerfume(perfume);
  };

  return (
    <section id="perfumes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-mt-24 sm:scroll-mt-28">
      
      {/* Category Tabs: Dynamic from Supabase */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-full sm:w-auto flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 p-1.5 bg-white/80 backdrop-blur-xs rounded-2xl sm:rounded-full border border-gray-200/80 shadow-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const icon = getCategoryIcon(cat.name);

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`flex-1 sm:flex-initial py-2.5 sm:py-2 px-5 sm:px-6 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-transparent text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <span>{icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Warning banner if limit reached or package not selected */}
      {limitWarning && (
        <div className="max-w-2xl mx-auto mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center justify-center gap-2 animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">{limitWarning}</span>
        </div>
      )}

      {/* Selected Package Counter Status for Desktop & Tablet */}
      {selectedPackage && (
        <div className={`max-w-3xl mx-auto mb-6 px-4 py-3 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isTargetReached
            ? 'bg-emerald-50 border-emerald-300 shadow-sm'
            : 'bg-indigo-50/60 border-indigo-100'
        }`}>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm">
            <span className="font-bold text-indigo-950">
              الباك: <span className="text-indigo-600">{selectedPackage.name}</span>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              العطور المختارة: <strong className="text-indigo-700 font-black">{currentCount}</strong> من أصل <strong className="text-indigo-700 font-black">{requiredCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: requiredCount }).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx < currentCount
                      ? isTargetReached
                        ? 'bg-emerald-600 ring-2 ring-emerald-300'
                        : 'bg-indigo-600 ring-2 ring-indigo-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* In-header CTA if limit reached */}
            {isTargetReached && (
              <button
                type="button"
                onClick={onScrollToDelivery}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <span>✓ تأكيد الطلب</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Perfumes Grid - Responsive 2 cols (mobile), 3 (tablet), 4 (desktop), 5-6 (large desktop) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredPerfumes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 max-w-lg mx-auto flex flex-col items-center justify-center">
          <PackageX className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-700 mb-1">لا توجد عطور متوفرة في هذا التصنيف</h3>
          <p className="text-gray-400 text-xs">يرجى التحقق من التصنيفات الأخرى أو إضافة عطور عبر لوحة التحكم.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {filteredPerfumes.map((perfume, idx) => {
            const isSelected = selectedPerfumes.some(p => p.id === perfume.id);
            const selectedIndex = selectedPerfumes.findIndex(p => p.id === perfume.id);

            return (
              <div
                key={`${perfume.id}-${idx}`}
                onClick={() => handleSelectClick(perfume, isSelected)}
                className={`group relative rounded-2xl bg-white border transition-all duration-200 flex flex-col overflow-hidden cursor-pointer p-2 sm:p-2.5 ${
                  isSelected
                    ? 'border-2 border-indigo-600 bg-indigo-50/30 shadow-md ring-2 ring-indigo-500/20 scale-[1.01]'
                    : 'border-gray-100 hover:border-indigo-300 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Selected Indicator Number Badge */}
                {isSelected && (
                  <div className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md text-xs font-black ring-2 ring-white">
                    {selectedIndex + 1}
                  </div>
                )}

                {/* Perfume Image container */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
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
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}

                  <div className={`img-fallback ${perfume.image_url ? 'hidden' : ''} flex flex-col items-center justify-center text-gray-400 p-3 text-center`}>
                    <span className="text-2xl">🌸</span>
                  </div>
                </div>

                {/* Perfume Info */}
                <div className="pt-2.5 pb-1 text-center">
                  <h3 className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                    isSelected ? 'text-indigo-950 font-black' : 'text-gray-800'
                  }`}>
                    {perfume.name}
                  </h3>
                  {perfume.category && (
                    <span className="text-[10px] text-gray-400 block mt-0.5 truncate">
                      {perfume.category}
                    </span>
                  )}
                </div>

                {/* Hover Add Button indicator on Desktop */}
                <div className="mt-1 pt-1.5 border-t border-gray-50 text-center">
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'}`}>
                    {isSelected ? '✓ تم التحديد' : '+ اختر العطر'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Banner */}
      {isTargetReached && (
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm max-w-4xl mx-auto">
          <div className="text-right">
            <h4 className="text-sm sm:text-base font-bold text-emerald-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">✓</span>
              <span>أحسنت! اكتمل تحديد {requiredCount} عطور لباك ({selectedPackage.name})</span>
            </h4>
            <p className="text-emerald-700 text-xs sm:text-sm mt-1">
              يمكنك الآن إكمال تفاصيل التوصيل وتأكيد الطلب
            </p>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end">
            <button
              type="button"
              onClick={onScrollToDelivery}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-sm sm:text-base shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              <span>✓ تأكيد الطلب وإكمال التوصيل</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};


