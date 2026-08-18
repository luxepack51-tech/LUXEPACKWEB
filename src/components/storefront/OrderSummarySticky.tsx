import React from 'react';
import { Package, Perfume, DeliveryType } from '../../types/storefront';
import { ShoppingCart, Check, ShieldCheck, Loader2, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface OrderSummaryStickyProps {
  selectedPackage: Package | null;
  selectedPerfumes: Perfume[];
  wilayaName: string;
  communeName: string;
  deliveryType: DeliveryType | null;
  deliveryPrice: number | null;
  totalPrice: number;
  currency: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  validationMessage: string | null;
  onSubmitOrder: () => void;
}

export const OrderSummarySticky: React.FC<OrderSummaryStickyProps> = ({
  selectedPackage,
  selectedPerfumes,
  wilayaName,
  communeName,
  deliveryType,
  deliveryPrice,
  totalPrice,
  currency,
  isSubmitting,
  canSubmit,
  validationMessage,
  onSubmitOrder
}) => {
  const { 
    cartItems, 
    featuredSubtotal,
    packageSubtotal,
    totalFeaturedQuantity,
    featuredDiscount, 
    openCart 
  } = useCart();

  const packagePrice = selectedPackage ? selectedPackage.price : 0;
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;
  
  // Strictly separate featured perfumes from packages
  const featuredItems = cartItems.filter(item => item.type === 'featured_perfume');
  const packageItemsInCart = cartItems.filter(item => item.type === 'package');
  const totalPackagesPrice = packageSubtotal + packagePrice;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm sticky top-24">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-indigo-600" />
          <span>ملخص طلبك</span>
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
          الدفع عند الاستلام
        </span>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        {/* 1. Featured Perfumes Section (Only if featured perfumes are in cart) */}
        {featuredItems.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <span>🌸</span>
                <span>العطور المميزة المختارة ({totalFeaturedQuantity}):</span>
              </span>
              <button 
                type="button" 
                onClick={openCart}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline font-bold cursor-pointer"
              >
                تعديل
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 bg-gray-50/70 p-2.5 rounded-2xl border border-gray-100">
              {featuredItems.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between text-xs text-gray-700">
                  <span className="truncate max-w-[170px] font-medium">
                    {item.name} <span className="text-gray-500 text-[11px]">× {item.quantity}</span>
                  </span>
                  <span className="font-bold text-gray-900 shrink-0">
                    {(item.unit_price * item.quantity).toLocaleString()} {currency}
                  </span>
                </div>
              ))}
            </div>

            {featuredDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60 text-xs">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span>خصم عطرين فأكثر (20%):</span>
                </span>
                <span>-{featuredDiscount.toLocaleString()} {currency}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Packages from Cart (if any) */}
        {packageItemsInCart.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-gray-100">
            {packageItemsInCart.map((pkgItem, idx) => (
              <div key={pkgItem.id || idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <span>🎁</span>
                    <span>{pkgItem.name} <span className="text-gray-500 text-xs font-normal">× {pkgItem.quantity}</span>:</span>
                  </span>
                  <span className="font-bold text-gray-900">
                    {(pkgItem.unit_price * pkgItem.quantity).toLocaleString()} {currency}
                  </span>
                </div>
                {pkgItem.selected_perfumes && pkgItem.selected_perfumes.length > 0 && (
                  <div className="text-[11px] text-gray-500 pr-4">
                    {pkgItem.selected_perfumes.map(p => p.name).join(' + ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 3. On-Screen Selected Package (if active) */}
        {selectedPackage && (
          <div className="space-y-2 pb-2 border-b border-gray-100">
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600 font-medium">الباك المختار:</span>
              <span className="font-bold text-gray-900 text-right">
                {selectedPackage.name}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600 font-medium">العطور المختارة:</span>
              <span className={`font-bold ${selectedPerfumes.length === perfumesNeeded && perfumesNeeded > 0 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                {selectedPerfumes.length} / {perfumesNeeded} عطور
              </span>
            </div>

            {selectedPerfumes.length > 0 && (
              <div className="text-[11px] text-gray-500">
                {selectedPerfumes.map(p => p.name).join(' + ')}
              </div>
            )}
          </div>
        )}

        {/* When nothing is selected yet */}
        {featuredItems.length === 0 && packageItemsInCart.length === 0 && !selectedPackage && (
          <div className="py-2 border-b border-gray-100 text-gray-400 italic text-center">
            لم يتم اختيار منتجات بعد
          </div>
        )}

        {/* Destination */}
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
          <span className="text-gray-500">الوجهة:</span>
          <span className="font-semibold text-gray-800 text-left">
            {wilayaName && communeName ? `${wilayaName} - ${communeName}` : <span className="text-gray-400 italic">غير محدد</span>}
          </span>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-1.5 pt-2">
          {totalPackagesPrice > 0 && (
            <div className="flex items-center justify-between text-gray-600">
              <span>مجموع الباكات:</span>
              <span className="font-bold text-gray-900">{totalPackagesPrice.toLocaleString()} {currency}</span>
            </div>
          )}

          {featuredSubtotal > 0 && (
            <div className="flex items-center justify-between text-gray-600">
              <span>مجموع العطور المميزة:</span>
              <span className="font-bold text-gray-900">{featuredSubtotal.toLocaleString()} {currency}</span>
            </div>
          )}

          {featuredDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60">
              <span>خصم العطور المميزة (20%):</span>
              <span>-{featuredDiscount.toLocaleString()} {currency}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-gray-600">
            <span>سعر التوصيل:</span>
            <span className="font-bold text-gray-900">
              {deliveryPrice !== null ? (
                `${deliveryPrice.toLocaleString()} ${currency}`
              ) : (
                <span className="text-gray-400 font-normal text-xs">
                  {!wilayaName || !communeName ? 'اختر البلدية أولاً' : 'اختر نوع التوصيل'}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-gray-200 text-base font-black">
            <span className="text-gray-900">💰 الإجمالي:</span>
            <span className="text-xl text-[#2563eb]">
              {totalPrice.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {validationMessage && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium">
          {validationMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmitOrder}
        disabled={!canSubmit || isSubmitting}
        className={`w-full mt-4 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
          canSubmit && !isSubmitting
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-[0.99]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>جاري تأكيد الطلب...</span>
          </>
        ) : (
          <>
            <span>✓</span>
            <span>تأكيد الطلب</span>
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>الدفع نقداً عند استلام عطورك</span>
      </div>
    </div>
  );
};
