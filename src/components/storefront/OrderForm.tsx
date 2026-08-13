import React from 'react';
import { User, Phone, MapPin, FileText } from 'lucide-react';
import { DeliveryType } from '../../types/storefront';

interface OrderFormProps {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  deliveryType: DeliveryType;
  phoneError: string | null;
  onFullNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onAddressChange: (val: string) => void;
  onNotesChange: (val: string) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  fullName,
  phone,
  address,
  notes,
  deliveryType,
  phoneError,
  onFullNameChange,
  onPhoneChange,
  onAddressChange,
  onNotesChange
}) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">4. معلومات المستلم والطلب</h3>
          <p className="text-xs text-zinc-400">يرجى كتابة المعلومات بدقة ليتواصل معك موظف التوصيل</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-400" />
            <span>الاسم واللقب الكامل <span className="text-red-400">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="مثال: محمد بن علي"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none text-sm transition-colors"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-amber-400" />
            <span>رقم الهاتف <span className="text-red-400">*</span></span>
          </label>
          <input
            type="tel"
            required
            dir="ltr"
            placeholder="05 / 06 / 07 / 02 xx xx xx xx"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={`w-full h-12 px-4 rounded-xl bg-zinc-950 border text-white placeholder-zinc-600 text-left font-mono focus:outline-none text-sm transition-colors ${
              phoneError ? 'border-red-500' : 'border-zinc-800 focus:border-amber-400'
            }`}
          />
          {phoneError ? (
            <p className="text-xs text-red-400 mt-1">{phoneError}</p>
          ) : (
            <p className="text-[11px] text-zinc-500 mt-1">سنتصل بك هاتفياً قبل شحن الطلب لتأكيد العنوان</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>العنوان التفصيلي {deliveryType === 'home' && <span className="text-red-400">*</span>}</span>
          </label>
          <input
            type="text"
            required={deliveryType === 'home'}
            placeholder={deliveryType === 'home' ? "اسم الشارع، الحي، أو بالقرب من معلم معروف" : "عنوان خياري للتوصيل إلى المكتب"}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none text-sm transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>ملاحظات إضافية (اختياري)</span>
          </label>
          <textarea
            rows={2}
            placeholder="أي توجيهات خاصة بالحي أو وقت الاستلام المفضل..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none text-sm transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
};
