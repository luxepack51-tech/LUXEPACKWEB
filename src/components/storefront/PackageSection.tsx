import React from 'react';
import { Package } from '../../types/storefront';
import { Sparkles, Check, Gift } from 'lucide-react';

interface PackageSectionProps {
  packages: Package[];
  selectedPackage: Package | null;
  onSelectPackage: (pkg: Package) => void;
  isLoading: boolean;
  currency: string;
}

export const PackageSection: React.FC<PackageSectionProps> = ({
  packages,
  selectedPackage,
  onSelectPackage,
  isLoading,
  currency
}) => {
  return (
    <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 scroll-mt-20">
      <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="text-right">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 flex items-center justify-start gap-2.5">
              <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 text-base sm:text-lg">🎁</span>
              <span>اختر الباقة المناسبة لك</span>
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              حدد عدد العطور التي تريد الحصول عليها للاستفادة من أفضل سعر وتخفيض
            </p>
          </div>

          {selectedPackage && (
            <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold text-xs">
              الباقة المحددة: {selectedPackage.name}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 sm:h-28 rounded-2xl bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 font-bold text-sm">لا توجد باقات متاحة حالياً.</p>
            <p className="text-gray-400 text-xs mt-1">يرجى مراجعة لوحة التحكم لتفعيل الباقات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {packages.map((pkg, idx) => {
              const isSelected = selectedPackage?.id === pkg.id;
              const isPopular = pkg.perfumes_count === 3 || idx === 1;

              return (
                <button
                  type="button"
                  key={`${pkg.id}-${idx}`}
                  onClick={() => onSelectPackage(pkg)}
                  className={`group relative rounded-2xl p-3.5 sm:p-5 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'border-2 border-indigo-600 bg-gradient-to-b from-indigo-50/70 to-white shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20 scale-[1.02]'
                      : 'border border-gray-200/80 bg-white hover:border-indigo-300 hover:shadow-sm hover:bg-gray-50/50'
                  }`}
                >
                  {/* Badge */}
                  {isPopular && !isSelected && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-xs">
                      الأكثر طلباً ⭐
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> تم الاختيار
                    </span>
                  )}

                  <div className="space-y-1 text-center w-full">
                    <span className={`block text-xs sm:text-base ${isSelected ? 'font-black text-indigo-950' : 'font-bold text-gray-800'}`}>
                      {pkg.name}
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-500 block">
                      اختر {pkg.perfumes_count} عطور من التشكيلة
                    </span>
                  </div>

                  <div className="w-full pt-2 border-t border-gray-100 flex items-center justify-center gap-1">
                    <span className={`text-sm sm:text-lg ${isSelected ? 'font-black text-indigo-600' : 'font-bold text-gray-900'}`}>
                      {pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{currency}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};


