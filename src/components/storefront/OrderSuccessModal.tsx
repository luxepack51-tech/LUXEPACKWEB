import React from 'react';
import { CreatedOrder, StoreSettings } from '../../types/storefront';
import { CheckCircle2, ShoppingBag, PhoneCall, MessageCircle, ArrowRight, Package, MapPin, Truck } from 'lucide-react';

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
  const whatsappNumber = settings.whatsapp_number || '213550000000';
  const whatsappMsg = encodeURIComponent(
    `مرحباً! لقد قمت بطلب جديد برقم ${order.order_number || order.id}.\n` +
    `الاسم: ${order.customer_name}\n` +
    `الباقة: ${order.package_name}\n` +
    `المجموع: ${order.total_price} ${settings.currency}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-white">
        
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 p-1 mx-auto mb-4 shadow-xl shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            تم استلام طلبك بنجاح 🎉
          </h2>
          <p className="text-amber-300 font-medium text-sm sm:text-base">
            شكراً لثقتك بنا. سنتواصل معك هاتفياً لتأكيد طلبك وتفاصيل الشحن.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 space-y-4 mb-8 text-xs sm:text-sm">
          
          {/* Order ID */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-zinc-400">رقم الطلب:</span>
            <span className="font-mono font-bold text-amber-400 text-sm bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              {order.order_number || order.id}
            </span>
          </div>

          {/* Customer name & phone */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-zinc-400">اسم المستلم:</span>
            <span className="font-bold text-white">{order.customer_name} ({order.phone})</span>
          </div>

          {/* Package */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              <span>الباقة المختارة:</span>
            </span>
            <span className="font-bold text-white">{order.package_name}</span>
          </div>

          {/* Selected Perfumes */}
          <div className="pb-3 border-b border-zinc-800">
            <span className="text-zinc-400 block mb-2">العطور المطلوبة:</span>
            <div className="space-y-1.5 pr-2">
              {order.selected_perfumes.map((perfume, idx) => (
                <div key={`${perfume.id || 'p'}-${idx}`} className="flex items-center gap-2 text-zinc-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{perfume.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Location & Method */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>الوجهة والشحن:</span>
            </span>
            <span className="font-semibold text-zinc-200">
              {order.wilaya_name} - {order.commune_name} ({order.delivery_type === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب'})
            </span>
          </div>

          {/* Total Price */}
          <div className="flex items-center justify-between pt-1 text-base sm:text-lg font-black">
            <span className="text-zinc-200">المجموع النهائي (عند الاستلام):</span>
            <span className="text-amber-400 text-xl sm:text-2xl font-black">
              {order.total_price.toLocaleString()} {settings.currency}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>تأكيد الطلب فوراً عبر واتساب WhatsApp</span>
          </a>

          <button
            onClick={onReset}
            className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى المتجر الرئيسية</span>
          </button>
        </div>

      </div>
    </div>
  );
};
