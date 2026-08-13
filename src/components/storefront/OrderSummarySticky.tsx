import React from 'react';
import { Package, Perfume, DeliveryType } from '../../types/storefront';
import { ShoppingCart, Check, ShieldCheck, Truck, Sparkles, Loader2 } from 'lucide-react';

interface OrderSummaryStickyProps {
  selectedPackage: Package | null;
  selectedPerfumes: Perfume[];
  wilayaName: string;
  communeName: string;
  deliveryType: DeliveryType;
  deliveryPrice: number;
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
    <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-5 shadow-2xl sticky top-24">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-amber-400" />
          <span>ملخص طلبك</span>
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
          الدفع عند الاستلام COD
        </span>
      </div>

      <div className="space-y-4 text-xs sm:text-sm">
        {/* Package Selected */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
          <span className="text-zinc-400">الباقة المختارة:</span>
          <span className="font-bold text-white text-right">
            {selectedPackage ? selectedPackage.name : <span className="text-amber-400/80 italic">لم تُحدد بعد</span>}
          </span>
        </div>

        {/* Selected Perfumes list */}
        <div className="py-2 border-b border-zinc-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400">العطور المختارة:</span>
            <span className={`font-bold ${selectedPerfumes.length === perfumesNeeded && perfumesNeeded > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {selectedPerfumes.length} / {perfumesNeeded} عطور
            </span>
          </div>

          {selectedPerfumes.length > 0 ? (
            <div className="space-y-1.5 mt-2">
              {selectedPerfumes.map((perf, idx) => (
                <div key={`${perf.id}-${idx}`} className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-200 font-medium truncate flex-1">{perf.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500 italic">لم تختر أي عطر بعد</p>
          )}
        </div>

        {/* Delivery details */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
          <span className="text-zinc-400">الوجهة وطريقة التوصيل:</span>
          <span className="font-semibold text-zinc-200 text-left">
            {wilayaName && communeName ? (
              <span>
                {wilayaName} - {communeName} ({deliveryType === 'home' ? 'منزل' : 'مكتب'})
              </span>
            ) : (
              <span className="text-zinc-500 italic">لم تُحدد المكان بعد</span>
            )}
          </span>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-zinc-300">
            <span>سعر الباقة:</span>
            <span className="font-bold">{packagePrice.toLocaleString()} {currency}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <span>سعر الشحن والتوصيل:</span>
            <span className="font-bold text-amber-300">
              {deliveryPrice > 0 ? `${deliveryPrice.toLocaleString()} ${currency}` : 'لم يُحدد بعد'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-amber-500/30 text-white text-base sm:text-lg font-black">
            <span>المجموع الكلي:</span>
            <span className="text-xl sm:text-2xl text-amber-400">
              {totalPrice.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Message if any */}
      {validationMessage && (
        <div className="mt-4 p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{validationMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={onSubmitOrder}
        disabled={!canSubmit || isSubmitting}
        className={`w-full mt-5 py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
          canSubmit && !isSubmitting
            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-amber-500/20 transform hover:-translate-y-0.5'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
            <span>جاري إرسال الطلب...</span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            <span>تأكيد الطلب والدفع عند الاستلام</span>
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>لا يلزم إدخال بطاقة بانكية — الدفع نقداً عند استلام عطورك</span>
      </div>
    </div>
  );
};
