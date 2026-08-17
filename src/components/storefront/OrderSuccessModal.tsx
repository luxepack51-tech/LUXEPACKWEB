import React from 'react';
import { CreatedOrder, StoreSettings } from '../../types/storefront';
import { 
  Check, 
  User, 
  Phone, 
  MapPin, 
  Package, 
  Sparkles, 
  Truck, 
  ShoppingBag, 
  Clock, 
  Heart,
  ChevronLeft
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: CreatedOrder;
  settings: StoreSettings;
  onReset: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  settings,
  onReset
}) => {
  // Separate perfumes into Package Perfumes and Featured Perfumes
  const isFeatured = (p: { category?: string; type?: string; name?: string }) => {
    return (
      p.category === 'عطور مميزة' ||
      p.type === 'featured' ||
      p.type === 'featured_perfume' ||
      (typeof p.name === 'string' && p.name.includes('عطر مميز'))
    );
  };

  const featuredPerfumes = (order.selected_perfumes || []).filter(isFeatured);
  const packagePerfumes = (order.selected_perfumes || []).filter(p => !isFeatured(p));

  // Determine if this order has a package (not just a standalone featured perfume direct order)
  const isDirectFeaturedOrder = order.package_id?.startsWith('feat-');
  const hasPackage = !isDirectFeaturedOrder && (packagePerfumes.length > 0 || (order.package_name && !order.package_name.includes('عطر مميز:')));

  // Clean perfume names from internal tags
  const cleanPackagePerfumeName = (name: string) => {
    return name.replace(/\s*\(ضمن باقة.*?\)/i, '').trim();
  };

  const cleanFeaturedPerfumeName = (name: string) => {
    return name.replace(/\s*\(عطر مميز.*?\)/i, '').trim();
  };

  const currency = settings?.currency || 'DZD';

  return (
    <div 
      id="order-success-overlay"
      dir="rtl"
      className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
    >
      <div 
        id="order-success-card"
        className="bg-[#FCFCFA] text-stone-800 border border-amber-900/10 rounded-3xl max-w-xl w-full p-5 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto space-y-6"
      >
        
        {/* ========================================================================= */}
        {/* SECTION 1: SUCCESS HEADER & CELEBRATION */}
        {/* ========================================================================= */}
        <div id="order-success-header" className="text-center pt-2">
          {/* Large Success Checkmark Circle */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 p-2 mx-auto mb-3 shadow-md shadow-emerald-500/10 flex items-center justify-center">
            <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-inner">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-1.5 tracking-tight">
            🎉 تم تأكيد طلبك بنجاح!
          </h2>
          
          <div className="space-y-1">
            <p className="text-stone-700 font-semibold text-sm sm:text-base flex items-center justify-center gap-1">
              <span>شكرًا لثقتك بنا</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
            </p>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              سنتواصل معك هاتفيًا لتأكيد الطلب وتفاصيل التوصيل.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: CUSTOMER INFORMATION */}
        {/* ========================================================================= */}
        <div id="customer-info-section" className="bg-white rounded-2xl border border-stone-200/70 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm pb-2 border-b border-stone-100">
            <User className="w-4 h-4 text-amber-700" />
            <span>👤 معلومات الاستلام</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium mb-0.5">اسم المستلم</span>
              <span className="font-bold text-stone-800">{order.customer_name}</span>
            </div>

            <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium mb-0.5">رقم الهاتف</span>
              <span className="font-bold text-stone-800 font-mono" dir="ltr">{order.phone}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: ORDER ITEMS / CONTENT */}
        {/* ========================================================================= */}
        <div id="order-content-section" className="bg-white rounded-2xl border border-stone-200/70 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm pb-2 border-b border-stone-100">
            <ShoppingBag className="w-4 h-4 text-amber-700" />
            <span>🛍️ محتوى طلبك</span>
          </div>

          {/* PACKAGE ITEMS */}
          {hasPackage && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="text-[11px] text-amber-800 font-medium block">🎁 الباقة المختارة</span>
                    <span className="font-bold text-stone-900 text-xs sm:text-sm">
                      {order.package_name || 'باقة العطور'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fragrances in package */}
              {packagePerfumes.length > 0 && (
                <div className="space-y-2 pr-1">
                  <span className="text-[11px] font-semibold text-stone-500 block">العطور داخل الباقة:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {packagePerfumes.map((perfume, idx) => (
                      <div 
                        key={`pkg-perf-${perfume.id || idx}`}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50/80 border border-stone-200/60 text-xs"
                      >
                        {perfume.image_url ? (
                          <img 
                            src={perfume.image_url} 
                            alt={perfume.name}
                            className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0 bg-white"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-stone-800 block truncate">
                            {cleanPackagePerfumeName(perfume.name)}
                          </span>
                          {perfume.category && (
                            <span className="text-[10px] text-stone-400 block truncate">
                              {perfume.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FEATURED PERFUMES (IF ANY) */}
          {featuredPerfumes.length > 0 && (
            <div className={`space-y-2.5 ${hasPackage ? 'pt-3 border-t border-stone-100' : ''}`}>
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs pb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>⭐ العطور المميزة</span>
              </div>

              <div className="space-y-2">
                {featuredPerfumes.map((feat, idx) => (
                  <div 
                    key={`feat-perf-${feat.id || idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {feat.image_url ? (
                        <img 
                          src={feat.image_url} 
                          alt={feat.name}
                          className="w-10 h-10 rounded-lg object-cover border border-amber-200 shrink-0 bg-white shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-stone-900 block truncate">
                          {cleanFeaturedPerfumeName(feat.name)}
                        </span>
                        <span className="text-[11px] text-amber-700/80 font-medium">
                          عطر فاخر مميز
                        </span>
                      </div>
                    </div>

                    <span className="font-bold text-stone-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200/80 text-xs shrink-0">
                      الكمية: {feat.quantity || 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: DELIVERY INFORMATION */}
        {/* ========================================================================= */}
        <div id="delivery-info-section" className="bg-white rounded-2xl border border-stone-200/70 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm pb-2 border-b border-stone-100">
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>📍 معلومات التوصيل</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium mb-0.5">الولاية</span>
              <span className="font-bold text-stone-800">{order.wilaya_name}</span>
            </div>

            <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium mb-0.5">البلدية</span>
              <span className="font-bold text-stone-800">{order.commune_name}</span>
            </div>
          </div>

          <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-stone-500 font-medium">طريقة التوصيل:</span>
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              {order.delivery_type === 'home' ? (
                <>
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>🚚 التوصيل إلى المنزل</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>🏢 التوصيل إلى المكتب</span>
                </>
              )}
            </span>
          </div>

          {order.address && order.address !== order.commune_name && (
            <div className="text-xs text-stone-500 bg-stone-50/60 p-2 rounded-lg border border-stone-100">
              <span className="font-medium text-stone-600">العنوان التفصيلي: </span>
              <span>{order.address}</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: FINAL AMOUNT / TOTAL */}
        {/* ========================================================================= */}
        <div id="order-total-section" className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border-2 border-amber-300/80 p-4 sm:p-5 shadow-sm text-center space-y-1.5">
          <span className="text-amber-900 font-bold text-xs sm:text-sm block">
            💰 المبلغ عند الاستلام
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
            {Number(order.total_price || 0).toLocaleString()} {currency}
          </div>
          <span className="text-stone-500 text-xs font-medium block">
            (شامل تكلفة التوصيل)
          </span>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 6: WHAT HAPPENS NEXT */}
        {/* ========================================================================= */}
        <div id="what-happens-next-section" className="bg-white rounded-2xl border border-stone-200/70 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-xs sm:text-sm pb-1 border-b border-stone-100">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>📦 ماذا سيحدث الآن؟</span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm pt-1">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50/70">
              <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[11px] flex items-center justify-center shrink-0">
                1
              </span>
              <span className="font-medium text-stone-700">سنتصل بك هاتفيًا لتأكيد تفاصيل الطلب</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50/70">
              <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[11px] flex items-center justify-center shrink-0">
                2
              </span>
              <span className="font-medium text-stone-700">نقوم بتجهيز عطورك الفاخرة وتغليفها بعناية</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50/70">
              <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[11px] flex items-center justify-center shrink-0">
                3
              </span>
              <span className="font-medium text-stone-700">يتم إرسال طردك إليك واستلام المبلغ عند الباب 🚚</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 7: IMPORTANT NOTICE */}
        {/* ========================================================================= */}
        <div id="phone-notice-box" className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 flex items-center gap-2.5 text-xs text-blue-900 font-medium">
          <Phone className="w-4 h-4 text-blue-700 shrink-0" />
          <span>📞 يرجى إبقاء هاتفك متاحًا لاستقبال مكالمة تأكيد الطلب.</span>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 8: RETURN BUTTON */}
        {/* ========================================================================= */}
        <div id="return-button-container" className="pt-2">
          <button
            onClick={onReset}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-900/15 transition-all cursor-pointer hover:shadow-xl active:scale-[0.99]"
          >
            <span>🛍️ العودة إلى المتجر</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
