import React from 'react';
import { Package, Perfume, DeliveryType } from '../../types/storefront';
import { ShoppingCart, Check, ShieldCheck, Loader2 } from 'lucide-react';

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
  const packagePrice = selectedPackage ? selectedPackage.price : 0;
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;

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
        {/* Package Selected */}
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
          <span className="text-gray-500">الباقة المختارة:</span>
          <span className="font-bold text-gray-900 text-right">
            {selectedPackage ? selectedPackage.name : <span className="text-gray-400 italic">لم تُحدد بعد</span>}
          </span>
        </div>

        {/* Selected Perfumes count */}
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
          <span className="text-gray-500">العطور المختارة:</span>
          <span className={`font-bold ${selectedPerfumes.length === perfumesNeeded && perfumesNeeded > 0 ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {selectedPerfumes.length} / {perfumesNeeded} عطور
          </span>
        </div>

        {/* Destination */}
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
          <span className="text-gray-500">الوجهة:</span>
          <span className="font-semibold text-gray-800 text-left">
            {wilayaName && communeName ? `${wilayaName} - ${communeName}` : <span className="text-gray-400 italic">غير محدد</span>}
          </span>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-gray-600">
            <span>سعر الباقة:</span>
            <span className="font-bold text-gray-900">{packagePrice.toLocaleString()} {currency}</span>
          </div>

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

