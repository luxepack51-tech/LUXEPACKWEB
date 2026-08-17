import React from 'react';
import { useCart } from '../../context/CartContext';
import { 
  ShoppingBag, X, Plus, Minus, Trash2, Gift, Sparkles, 
  ArrowLeft, ShieldCheck, Tag, CheckCircle2 
} from 'lucide-react';

interface CartDrawerProps {
  currency: string;
  onProceedToCheckout?: () => void;
  onCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  currency,
  onProceedToCheckout,
  onCheckout
}) => {
  const {
    cartItems,
    isCartDrawerOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    packageSubtotal,
    featuredSubtotal,
    totalFeaturedQuantity,
    featuredDiscount,
    productsSubtotal,
    productsTotal,
    totalItemsCount,
    isDiscountActive,
    discountMessage
  } = useCart();

  if (!isCartDrawerOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else if (onCheckout) {
      onCheckout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col animate-slide-left border-l border-gray-100">
          
          {/* 1. Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-2xs">
                🛒
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span>سلة الطلب</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                    {totalItemsCount} {totalItemsCount === 1 ? 'منتج' : 'منتجات'}
                  </span>
                </h2>
                <p className="text-xs text-gray-500">مراجعة المنتجات المختارة قبل تأكيد الطلب</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Dynamic Promotional Banner */}
          <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/70">
            <div className="flex items-start gap-2.5 text-xs">
              <span className="text-base shrink-0 mt-0.5">
                {isDiscountActive ? '🎁' : '👑'}
              </span>
              <div className="flex-1">
                <p className={`font-bold leading-relaxed ${isDiscountActive ? 'text-emerald-800' : 'text-amber-900'}`}>
                  {discountMessage}
                </p>
                {totalFeaturedQuantity > 0 && (
                  <p className="text-[11px] text-amber-700/90 mt-0.5">
                    {isDiscountActive ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 inline" />
                        تم تطبيق خصم 20% على العطور المميزة ({featuredDiscount.toLocaleString()} {currency})
                      </span>
                    ) : (
                      <span>عدد العطور المميزة الحالية بالسلة: <strong>{totalFeaturedQuantity}</strong></span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-gray-100/80">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-gray-50 text-gray-300 flex items-center justify-center text-4xl mb-4 shadow-inner">
                  🛍️
                </div>
                <h3 className="text-base font-black text-gray-800 mb-1">سلتك فارغة حالياً</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  استكشف باقاتنا الحصرية أو تشكيلة العطور المميزة وأضف ما يناسب ذوقك!
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  تصفح المنتجات الآن
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const isFeatured = item.type === 'featured_perfume';
                const itemSubtotal = item.unit_price * item.quantity;

                return (
                  <div key={item.id} className="pt-3.5 first:pt-0">
                    <div className="flex items-start gap-3">
                      {/* Image / Icon */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center relative shadow-2xs">
                        {isFeatured && item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-2xl sm:text-3xl">
                            {isFeatured ? (item.gender === 'women' ? '🌸' : '👜') : '🎁'}
                          </div>
                        )}
                        <span className="absolute top-1 right-1 text-[9px] px-1 py-0.2 rounded font-bold bg-black/60 text-white backdrop-blur-2xs">
                          {isFeatured ? 'عطر مميز' : 'باقة'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-1">
                              {item.name}
                            </h4>
                            {isFeatured && (
                              <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                item.gender === 'women'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                {item.gender === 'women' ? '🌸 نساء' : '👜 رجال'}
                              </span>
                            )}
                          </div>

                          {/* Delete Item Button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="حذف من السلة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Selected Perfumes tags for packages */}
                        {item.type === 'package' && item.selected_perfumes && item.selected_perfumes.length > 0 && (
                          <div className="mt-1.5 p-2 bg-indigo-50/60 rounded-xl border border-indigo-100/70 text-[11px] text-indigo-900">
                            <span className="font-bold block text-[10px] text-indigo-700 mb-0.5">العطور المحددة في الباقة:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.selected_perfumes.map((p, pIdx) => (
                                <span key={pIdx} className="bg-white px-1.5 py-0.5 rounded-md border border-indigo-100 text-[10px] font-medium text-gray-700">
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price & Quantity Controls */}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs sm:text-sm font-black text-gray-900">
                              {itemSubtotal.toLocaleString()} {currency}
                            </span>
                            {item.quantity > 1 && (
                              <span className="block text-[10px] text-gray-400">
                                ({item.unit_price.toLocaleString()} {currency} للقطعة)
                              </span>
                            )}
                          </div>

                          {/* Quantity selector: [-] qty [+] */}
                          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                              title="تقليل الكمية"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="w-7 text-center font-bold text-xs sm:text-sm text-gray-800">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                              title="زيادة الكمية"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Footer Summary & Checkout CTA */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-200/80 bg-gray-50/80 space-y-3">
              {/* Summary Breakdown */}
              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                {packageSubtotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">مجموع الباقات:</span>
                    <span className="font-bold text-gray-900">{packageSubtotal.toLocaleString()} {currency}</span>
                  </div>
                )}

                {featuredSubtotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">مجموع العطور المميزة:</span>
                    <span className="font-bold text-gray-900">{featuredSubtotal.toLocaleString()} {currency}</span>
                  </div>
                )}

                {featuredDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>خصم العطور المميزة (20%):</span>
                    </span>
                    <span>-{featuredDiscount.toLocaleString()} {currency}</span>
                  </div>
                )}

                {/* Subtotal Before Delivery */}
                <div className="border-t border-gray-200/80 pt-2 flex items-center justify-between text-sm sm:text-base font-black">
                  <span className="text-gray-900">مجموع المنتجات:</span>
                  <span className="text-lg sm:text-xl text-[#2563eb]">
                    {productsTotal.toLocaleString()} {currency}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 text-center">
                  🚚 تكلفة التوصيل تُحسب عند اختيار الولاية والبلدية
                </p>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✓ إتمام الطلب الآن</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg">
                  {productsTotal.toLocaleString()} {currency}
                </span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>تفريغ السلة</span>
                </button>

                <button
                  type="button"
                  onClick={closeCart}
                  className="text-[11px] text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
                >
                  متابعة التسوق
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>الدفع عند الاستلام مع ضمان الجودة</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
