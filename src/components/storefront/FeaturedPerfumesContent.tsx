import React, { useState } from 'react';
import { FeaturedPerfume } from '../../types/storefront';
import { useCart } from '../../context/CartContext';
import { 
  ShoppingBag, ShoppingCart, AlertCircle, RefreshCw, Crown, 
  Sparkles, Plus, Check, Tag, CheckCircle2 
} from 'lucide-react';
import { trackTikTokViewContent } from '../../services/tiktok';
import { trackMetaViewContent } from '../../services/meta';

interface FeaturedPerfumesContentProps {
  featuredPerfumes: FeaturedPerfume[];
  isLoading: boolean;
  error: string | null;
  currency: string;
  onOrderPerfume: (perfume: FeaturedPerfume) => void;
  onRetry?: () => void;
}

export const FeaturedPerfumesContent: React.FC<FeaturedPerfumesContentProps> = ({
  featuredPerfumes,
  isLoading,
  error,
  currency,
  onOrderPerfume,
  onRetry
}) => {
  // Category Switcher Gender: Default is 'women' as required
  const [selectedGender, setSelectedGender] = useState<'women' | 'men'>('women');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [addedId, setAddedId] = useState<string | null>(null);

  const { 
    addFeaturedPerfumeToCart, 
    cartItems, 
    isDiscountActive, 
    totalFeaturedQuantity,
    openCart,
    discountMessage 
  } = useCart();

  const handleImageError = (id: string) => {
    setBrokenImages(prev => ({ ...prev, [id]: true }));
  };

  const handleAddToCart = (perfume: FeaturedPerfume) => {
    addFeaturedPerfumeToCart(perfume, 1);
    setAddedId(perfume.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  // Filter ONLY by the active selected category
  const displayedPerfumes = featuredPerfumes.filter(p => p.gender === selectedGender);
  const womenCount = featuredPerfumes.filter(p => p.gender === 'women').length;
  const menCount = featuredPerfumes.filter(p => p.gender === 'men').length;

  return (
    <section id="featured-perfumes" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in scroll-mt-24 sm:scroll-mt-28">
      {/* 1. Header & Category Switcher */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        {/* Subtle Crown Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-black shadow-2xs">
          <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
          <span>المجموعة الحصرية الفاخرة</span>
        </div>

        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          العطور المميزة
        </h2>

        {/* Short Description */}
        <p className="text-gray-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          أجمل وأرقى العطور المختارة بعناية
        </p>

        {/* Dynamic Promotional Offer Banner */}
        <div className={`max-w-xl mx-auto p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 ${
          isDiscountActive
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300/80 shadow-emerald-500/10 shadow-sm'
            : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="text-xl shrink-0">{isDiscountActive ? '🎁' : '👑'}</span>
            <div>
              <p className={`font-black text-xs sm:text-sm leading-tight ${isDiscountActive ? 'text-emerald-900' : 'text-amber-950'}`}>
                👑 العطور المميزة: خصم 20% على كل عطر عند شراء 2 أو أكثر
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                {isDiscountActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    تم تفعيل خصم 20% على جميع العطور المميزة في السلة!
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-800">
                    {totalFeaturedQuantity === 1
                      ? '💡 أضف عطراً مميزاً آخر لتحصل على خصم 20% فوراً!'
                      : 'أضف أي عطرين مميزين أو أكثر واستمتع بخصم 20% تلقائياً'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Switcher Tabs: [ 🌸 نساء ] [ 👜 رجال ] */}
        <div className="pt-1 flex items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-sm mx-auto">
          {/* Women Category Button (Default Active: 🌸 نساء) */}
          <button
            type="button"
            id="featured-tab-women"
            onClick={() => setSelectedGender('women')}
            className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              selectedGender === 'women'
                ? 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white shadow-lg shadow-rose-500/25 ring-2 ring-rose-400/40 scale-[1.02]'
                : 'bg-white border border-gray-200/90 text-gray-700 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/70 shadow-2xs'
            }`}
          >
            <span className="text-sm sm:text-base">🌸</span>
            <span>نساء</span>
            {womenCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedGender === 'women' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {womenCount}
              </span>
            )}
          </button>

          {/* Men Category Button: 👜 رجال */}
          <button
            type="button"
            id="featured-tab-men"
            onClick={() => setSelectedGender('men')}
            className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              selectedGender === 'men'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/40 scale-[1.02]'
                : 'bg-white border border-gray-200/90 text-gray-700 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/70 shadow-2xs'
            }`}
          >
            <span className="text-sm sm:text-base">👜</span>
            <span>رجال</span>
            {menCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedGender === 'men' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {menCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-3 animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Error State */}
      {!isLoading && error && (
        <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="font-bold text-red-900 text-sm sm:text-base">حدث خطأ أثناء تحميل العطور</h3>
          <p className="text-xs text-red-700">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Loaded Active Category Cards */}
      {!isLoading && !error && (
        <>
          {displayedPerfumes.length === 0 ? (
            /* Empty State for the active gender */
            <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-gray-100 shadow-2xs space-y-3 max-w-lg mx-auto">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-3xl ${
                selectedGender === 'women' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
              }`}>
                {selectedGender === 'women' ? '🌸' : '👜'}
              </div>
              <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                لا توجد عطور مميزة حاليًا
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                سيتم إضافة عطور جديدة قريبًا.
              </p>
            </div>
          ) : (
            /* Responsive Grid of Cards */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {displayedPerfumes.map((perfume) => {
                const inCartItem = cartItems.find(
                  item => item.type === 'featured_perfume' && (item.featured_perfume_id === perfume.id || item.id === `feat_${perfume.id}`)
                );
                const inCartQuantity = inCartItem?.quantity || 0;
                const isJustAdded = addedId === perfume.id;

                return (
                  <div
                    key={perfume.id}
                    className="group relative bg-white rounded-3xl p-3 sm:p-4 border border-gray-200/80 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Category Pill */}
                    <div className="flex items-center justify-between gap-1 mb-2 z-10">
                      <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border ${
                        selectedGender === 'women'
                          ? 'bg-rose-50 text-rose-700 border-rose-200/70'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200/70'
                      }`}>
                        {selectedGender === 'women' ? 'عطور نساء' : 'عطور رجال'}
                      </span>
                      <span className="text-amber-500 text-xs">⭐ مميز</span>
                    </div>

                    {/* Perfume Image */}
                    <div className="relative w-full aspect-square bg-[#fbfbfe] rounded-2xl overflow-hidden mb-3 border border-gray-100 flex items-center justify-center p-2 group-hover:bg-gray-50/50 transition-colors">
                      {!brokenImages[perfume.id] && perfume.image_url ? (
                        <img
                          src={perfume.image_url}
                          alt={perfume.name}
                          onError={() => handleImageError(perfume.id)}
                          loading="lazy"
                          className="w-full h-full object-contain object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                          <span className="text-4xl sm:text-5xl">{selectedGender === 'women' ? '🌸' : '👜'}</span>
                          <span className="text-[10px] text-gray-400">عطر فاخر</span>
                        </div>
                      )}

                      {/* Quantity in Cart Badge */}
                      {inCartQuantity > 0 && (
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
                          بالسلة: {inCartQuantity}
                        </div>
                      )}
                    </div>

                    {/* Perfume Info */}
                    <div className="space-y-1.5 text-right flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-gray-900 text-xs sm:text-base leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 transition-colors">
                          {perfume.name}
                        </h3>

                        {perfume.description ? (
                          <p className="text-gray-500 text-[11px] sm:text-xs line-clamp-2 mt-0.5 leading-relaxed">
                            {perfume.description}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-[11px] sm:text-xs mt-0.5 italic">
                            عطر أصلي فاخر بثبات عالي
                          </p>
                        )}
                      </div>

                      {/* Pricing & CTA Buttons */}
                      <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
                        {/* Price: Clearly visible on every card */}
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-[10px] sm:text-xs text-gray-500 font-bold">السعر:</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base sm:text-xl font-black text-indigo-600 tracking-tight">
                              {perfume.price.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-gray-700">{currency}</span>
                          </div>
                        </div>

                        {/* Action Buttons: Add to Cart + Order Now */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {/* 1. Add to Cart Button */}
                          <button
                            type="button"
                            onClick={() => handleAddToCart(perfume)}
                            className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              isJustAdded
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 active:scale-95'
                            }`}
                            title="إضافة إلى سلة التسوق"
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>تمت الإضافة</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                                <span>أضف للسلة</span>
                              </>
                            )}
                          </button>

                          {/* 2. Order Now Button (Direct checkout) */}
                          <button
                            type="button"
                            onClick={() => {
                              const price = Number(perfume.price) || 0;
                              trackTikTokViewContent({
                                id: perfume.id,
                                name: perfume.name,
                                price,
                                type: 'product',
                                category: 'عطور مميزة'
                              });
                              trackMetaViewContent({
                                id: perfume.id,
                                name: perfume.name,
                                price,
                                type: 'product',
                                category: 'عطور مميزة'
                              });
                              onOrderPerfume(perfume);
                            }}
                            className="py-2 px-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>اطلب الآن</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};

