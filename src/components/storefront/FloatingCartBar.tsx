import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Tag, ChevronUp, ArrowLeft, RotateCcw } from 'lucide-react';

interface FloatingCartBarProps {
  currency: string;
  onOpenCart: () => void;
  onProceedToCheckout: () => void;
  onResetCart?: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  currency,
  onOpenCart,
  onProceedToCheckout,
  onResetCart
}) => {
  const {
    productsSubtotal,
    featuredDiscount,
    productsTotal,
    totalItemsCount,
    isDiscountActive,
    clearCart
  } = useCart();

  const [isDeliveryInView, setIsDeliveryInView] = useState(false);

  useEffect(() => {
    const checkDeliveryVisibility = () => {
      const deliveryEl = document.getElementById('delivery') || document.getElementById('order-form');
      if (!deliveryEl) {
        setIsDeliveryInView(false);
        return;
      }

      const rect = deliveryEl.getBoundingClientRect();
      // Element is considered in view if its top has entered into viewport or user scrolled past it
      const inView = rect.top < window.innerHeight - 80 && rect.bottom > 80;
      setIsDeliveryInView(inView);
    };

    window.addEventListener('scroll', checkDeliveryVisibility, { passive: true });
    window.addEventListener('resize', checkDeliveryVisibility, { passive: true });
    checkDeliveryVisibility();

    const interval = setInterval(checkDeliveryVisibility, 300);

    return () => {
      window.removeEventListener('scroll', checkDeliveryVisibility);
      window.removeEventListener('resize', checkDeliveryVisibility);
      clearInterval(interval);
    };
  }, []);

  if (totalItemsCount === 0) return null;

  const handleClearCart = () => {
    clearCart();
    if (onResetCart) {
      onResetCart();
    }
  };

  return (
    <div
      id="floating-cart-bar"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-indigo-100 shadow-[0_-8px_25px_rgba(0,0,0,0.12)] px-3 py-2.5 sm:py-3 transition-all duration-300 ${
        isDeliveryInView
          ? 'translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Right Info: Cart Count & Total Calculation */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
          {/* Cart Icon + Badge */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-3 py-1.5 rounded-2xl transition-colors cursor-pointer group"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-indigo-700 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-indigo-900 block leading-tight">
                سلة التسوق ({totalItemsCount})
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center gap-0.5">
                <span>تعديل السلة</span>
                <ChevronUp className="w-3 h-3 rotate-90" />
              </span>
            </div>
          </button>

          {/* Pricing & Discount info */}
          <div className="text-left sm:text-right flex flex-col items-end sm:items-start">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-gray-500 font-bold">المجموع:</span>
              <span className="text-base sm:text-lg font-black text-indigo-600">
                {productsTotal.toLocaleString()} {currency}
              </span>
            </div>

            {isDiscountActive && featuredDiscount > 0 ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>خصم 20% مطبق (-{featuredDiscount.toLocaleString()} {currency})</span>
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                + سعر التوصيل حسب الولاية
              </span>
            )}
          </div>
        </div>

        {/* Left Actions: Reset / Clear Cart, View Cart & Checkout Button */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          {/* Reset / Clear Cart Button */}
          <button
            type="button"
            onClick={handleClearCart}
            className="p-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-bold shrink-0 active:scale-95"
            title="إعادة تعيين السلة وتفريغها"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="inline">إعادة تعيين</span>
          </button>

          {/* View Cart Drawer Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap text-center"
          >
            عرض السلة
          </button>

          {/* Direct Checkout CTA Button */}
          <button
            type="button"
            onClick={onProceedToCheckout}
            className="flex-2 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>إتمام الطلب</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
