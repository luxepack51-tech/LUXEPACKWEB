import React from 'react';
import { User, Phone, MapPin, FileText } from 'lucide-react';
import { DeliveryType } from '../../types/storefront';

interface OrderFormProps {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  deliveryType: DeliveryType | null;
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
    <div id="order-form" className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm scroll-mt-20">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">معلومات المستلم</h3>
          <p className="text-xs text-gray-500">يرجى كتابة المعلومات بدقة ليتواصل معك موظف التوصيل</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" />
            <span>الاسم الكامل <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="مثال: أمينة بن علي"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm transition-all"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-indigo-600" />
            <span>رقم الهاتف <span className="text-red-500">*</span></span>
          </label>
          <input
            type="tel"
            required
            dir="ltr"
            inputMode="numeric"
            maxLength={10}
            minLength={10}
            placeholder="05XXXXXXXX"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={`w-full h-12 px-4 rounded-2xl bg-white border text-gray-900 placeholder-gray-400 text-left font-mono focus:ring-1 outline-none text-sm transition-all ${
              phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-600 focus:ring-indigo-600'
            }`}
          />
          {phoneError ? (
            <p className="text-xs text-red-500 mt-1 font-medium">{phoneError}</p>
          ) : (
            <p className="text-[11px] text-gray-500 mt-1">سنتصل بك هاتفياً لتأكيد الإرسال</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>العنوان التفصيلي {deliveryType === 'home' && <span className="text-red-500">*</span>}</span>
          </label>
          <input
            type="text"
            required={deliveryType === 'home'}
            placeholder={deliveryType === 'home' ? "اسم الشارع، الحي، أو بالقرب من معلم معروف" : "عنوان خياري للتوصيل إلى المكتب"}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>ملاحظات إضافية (اختياري)</span>
          </label>
          <textarea
            rows={2}
            placeholder="أي توجيهات خاصة بالحي أو وقت الاستلام..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
};

