import React from 'react';
import { Package, Perfume, Wilaya, Commune, DeliveryType } from '../../types/storefront';
import { Loader2 } from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package | null;
  selectedPerfumes: Perfume[];
  wilayas: Wilaya[];
  communes: Commune[];
  selectedWilayaId: string;
  selectedCommuneId: string;
  deliveryType: DeliveryType | null;
  deliveryPrice: number | null;
  totalPrice: number;
  currency: string;
  fullName: string;
  phone: string;
  phoneError: string | null;
  isLoadingWilayas: boolean;
  isLoadingCommunes: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  validationMessage: string | null;
  onWilayaChange: (id: string) => void;
  onCommuneChange: (id: string) => void;
  onDeliveryTypeChange: (type: DeliveryType) => void;
  onFullNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onSubmitOrder: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  selectedPerfumes,
  wilayas,
  communes,
  selectedWilayaId,
  selectedCommuneId,
  deliveryType,
  deliveryPrice,
  totalPrice,
  currency,
  fullName,
  phone,
  phoneError,
  isLoadingWilayas,
  isLoadingCommunes,
  isSubmitting,
  canSubmit,
  validationMessage,
  onWilayaChange,
  onCommuneChange,
  onDeliveryTypeChange,
  onFullNameChange,
  onPhoneChange,
  onSubmitOrder
}) => {
  if (!isOpen) return null;

  const packagePrice = selectedPackage ? selectedPackage.price : 0;
  const perfumesCount = selectedPackage ? selectedPackage.perfumes_count : selectedPerfumes.length;

  const selectedCommune = communes.find(c => String(c.id) === selectedCommuneId);
  const isCommuneSelected = Boolean(selectedCommuneId && selectedCommune);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl animate-slide-up border border-gray-100 text-right"
        dir="rtl"
      >
        {/* Top subtle drag handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Title */}
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-4 flex items-center justify-center gap-2">
          <span>📦</span>
          <span>تفاصيل الطلب</span>
        </h2>

        {/* 1. Order Summary Card ("ملخص طلبك") */}
        <div className="bg-[#f8fafc] border border-gray-200/70 rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">ملخص طلبك</h3>

          <div className="space-y-2 text-sm text-gray-700">
            {/* Package Row */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span>🎁</span>
                <span>الباك ({perfumesCount} عطور)</span>
              </span>
              <span className="font-bold text-gray-900">
                {packagePrice.toLocaleString()} {currency}
              </span>
            </div>

            {/* Delivery Row */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span>🚚</span>
                <span>التوصيل</span>
              </span>
              <span className="font-bold text-gray-900">
                {deliveryPrice !== null ? (
                  `${deliveryPrice.toLocaleString()} ${currency}`
                ) : (
                  <span className="text-gray-400 font-normal text-xs">اختر البلدية أولاً</span>
                )}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200/80 my-2 pt-2 flex items-center justify-between text-base">
              <span className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>💰</span>
                <span>الإجمالي</span>
              </span>
              <span className="text-xl font-black text-[#2563eb]">
                {totalPrice.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Cash on Delivery Banner */}
        <div className="bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe] rounded-xl py-2.5 px-3 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 mb-5 shadow-2xs">
          <span>✅ الدفع عند الاستلام | 🚚 التوصيل لجميع الولايات</span>
        </div>

        {/* 3. Form Inputs */}
        <div className="space-y-3.5 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
              الاسم الكامل <span className="text-red-500">*</span>
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
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className={`w-full h-12 px-4 rounded-2xl bg-white border text-gray-900 placeholder-gray-400 focus:ring-1 outline-none text-sm transition-all ${
                phoneError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-600 focus:ring-indigo-600'
              }`}
            />
            {phoneError && <p className="text-xs text-red-500 mt-1 font-medium">{phoneError}</p>}
          </div>

          {/* Wilaya Select */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
              الولاية <span className="text-red-500">*</span>
            </label>
            {isLoadingWilayas ? (
              <div className="h-12 bg-gray-100 rounded-2xl animate-pulse"></div>
            ) : (
              <select
                value={selectedWilayaId}
                onChange={(e) => onWilayaChange(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-white border border-gray-300 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm transition-all cursor-pointer"
              >
                <option value="">-- اختر الولاية --</option>
                {wilayas.map((w, idx) => (
                  <option key={`${w.id}-${idx}`} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Commune Select */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
              البلدية <span className="text-red-500">*</span>
            </label>
            {isLoadingCommunes ? (
              <div className="h-12 bg-gray-100 rounded-2xl animate-pulse"></div>
            ) : (
              <select
                value={selectedCommuneId}
                onChange={(e) => onCommuneChange(e.target.value)}
                disabled={!selectedWilayaId}
                className="w-full h-12 px-4 rounded-2xl bg-white border border-gray-300 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm transition-all cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {selectedWilayaId ? '-- اختر البلدية --' : 'اختر الولاية أولاً'}
                </option>
                {communes.map((c, idx) => (
                  <option key={`${c.id}-${idx}`} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Delivery Type Select */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
              نوع التوصيل <span className="text-red-500">*</span>
            </label>
            <select
              value={deliveryType || ''}
              onChange={(e) => onDeliveryTypeChange(e.target.value as DeliveryType)}
              disabled={!isCommuneSelected}
              className="w-full h-12 px-4 rounded-2xl bg-white border border-gray-300 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm transition-all cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">
                {!isCommuneSelected ? 'اختر البلدية أولاً' : '-- اختر نوع التوصيل --'}
              </option>
              {isCommuneSelected && selectedCommune && (
                <>
                  {selectedCommune.home_delivery_available ? (
                    <option value="home">
                      🏠 للمنزل — {selectedCommune.home_delivery_price.toLocaleString()} {currency}
                    </option>
                  ) : (
                    <option value="home" disabled>
                      🏠 للمنزل — غير متاح
                    </option>
                  )}
                  {selectedCommune.office_delivery_available ? (
                    <option value="office">
                      🏢 للمكتب — {selectedCommune.office_delivery_price.toLocaleString()} {currency}
                    </option>
                  ) : (
                    <option value="office" disabled>
                      🏢 للمكتب — غير متاح
                    </option>
                  )}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Validation Warning */}
        {validationMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold text-center">
            {validationMessage}
          </div>
        )}

        {/* Submit Confirmation Button */}
        <button
          type="button"
          onClick={onSubmitOrder}
          disabled={isSubmitting || !canSubmit}
          className={`w-full py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isSubmitting || !canSubmit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-[0.99]'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري تأكيد الطلب...</span>
            </>
          ) : (
            <>
              <span>✓</span>
              <span>تأكيد الطلب</span>
            </>
          )}
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-gray-500 hover:text-gray-800 font-medium text-sm mt-3 text-center cursor-pointer block w-full py-2 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};
