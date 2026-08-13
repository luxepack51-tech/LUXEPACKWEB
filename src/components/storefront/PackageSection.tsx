import React from 'react';
import { Package } from '../../types/storefront';
import { Check, Sparkles, Box } from 'lucide-react';

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
    <section id="packages" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Box className="w-4 h-4" />
          <span>الخطوة الأولى</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
          اختر باقتك المفضلة
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          حدد العرض المناسب لك للحصول على عدد العطور المتاح بأفضل سعر
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-zinc-800 rounded w-2/3"></div>
                <div className="h-4 bg-zinc-800/60 rounded w-full"></div>
                <div className="h-4 bg-zinc-800/60 rounded w-4/5"></div>
              </div>
              <div className="h-10 bg-zinc-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-sm">لا توجد باقات متاحة حالياً، يرجى التحقق لاحقاً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg, idx) => {
            const isSelected = selectedPackage?.id === pkg.id;
            const isPopular = pkg.perfumes_count === 3 || pkg.name.includes('3') || pkg.name.includes('الأكثر');

            return (
              <div
                key={`${pkg.id}-${idx}`}
                onClick={() => onSelectPackage(pkg)}
                className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-950/60 via-zinc-900 to-zinc-950 border-2 border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02]'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 hover:scale-[1.01]'
                }`}
              >
                {/* Popular Ribbon / Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>العرض الأكثر طلباً ⭐</span>
                  </div>
                )}

                <div>
                  {/* Selected check badge top left */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {pkg.name}
                    </h3>
                    {isSelected && (
                      <span className="w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 shadow-lg">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Price Banner */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-amber-400">
                        {pkg.price.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-zinc-300">{currency}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                      {pkg.description}
                    </p>
                  )}

                  {/* Perfume Count Indicator */}
                  <div className="py-2.5 px-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-amber-200/90 font-medium mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    <span>اختر <strong className="text-amber-400 font-bold text-sm px-1">{pkg.perfumes_count}</strong> عطور من تشكيلتنا الفاخرة</span>
                  </div>
                </div>

                {/* Button */}
                <button
                  type="button"
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                      : 'bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم اختيار الباقة — اختر عطورك الآن</span>
                    </>
                  ) : (
                    <span>اختر هذه الباقة</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
