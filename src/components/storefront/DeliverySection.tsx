import React from 'react';
import { Wilaya, Commune, DeliveryType } from '../../types/storefront';
import { MapPin, Home, Building2, Truck } from 'lucide-react';

interface DeliverySectionProps {
  wilayas: Wilaya[];
  communes: Commune[];
  selectedWilayaId: string;
  selectedCommuneId: string;
  deliveryType: DeliveryType | null;
  deliveryPrice: number | null;
  isLoadingWilayas: boolean;
  isLoadingCommunes: boolean;
  currency: string;
  onWilayaChange: (wilayaId: string) => void;
  onCommuneChange: (communeId: string) => void;
  onDeliveryTypeChange: (type: DeliveryType) => void;
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({
  wilayas,
  communes,
  selectedWilayaId,
  selectedCommuneId,
  deliveryType,
  deliveryPrice,
  isLoadingWilayas,
  isLoadingCommunes,
  currency,
  onWilayaChange,
  onCommuneChange,
  onDeliveryTypeChange
}) => {
  const selectedCommune = communes.find(c => String(c.id) === selectedCommuneId);
  const isCommuneSelected = Boolean(selectedCommuneId && selectedCommune);

  const isHomeAvailable = Boolean(selectedCommune && selectedCommune.home_delivery_available);
  const isOfficeAvailable = Boolean(selectedCommune && selectedCommune.office_delivery_available);

  return (
    <div id="delivery" className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm scroll-mt-20">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">اختيار مكان وطريقة التوصيل</h3>
          <p className="text-xs text-gray-500">حدد الولاية والبلدية لعرض خيارات وتكلفة الشحن بدقة</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Wilaya Selection */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>الولاية:</span>
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

        {/* Commune Selection */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>البلدية:</span>
          </label>

          {!selectedWilayaId ? (
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-400">
              يرجى تحديد الولاية أولاً لعرض البلديات
            </div>
          ) : isLoadingCommunes ? (
            <div className="h-12 bg-gray-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-xs text-indigo-600 font-semibold animate-pulse">
              جاري تحميل سعر التوصيل...
            </div>
          ) : (
            <select
              value={selectedCommuneId}
              onChange={(e) => onCommuneChange(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-white border border-gray-300 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm transition-all cursor-pointer"
            >
              <option value="">-- اختر البلدية --</option>
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
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
            نوع التوصيل:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Home Option */}
            <button
              type="button"
              disabled={!isCommuneSelected || !isHomeAvailable}
              onClick={() => {
                if (isCommuneSelected && isHomeAvailable) {
                  onDeliveryTypeChange('home');
                }
              }}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between min-h-[82px] ${
                !isCommuneSelected
                  ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-60 cursor-not-allowed'
                  : !isHomeAvailable
                  ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-70 cursor-not-allowed'
                  : deliveryType === 'home'
                  ? 'border-2 border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold shadow-xs cursor-pointer'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Home className={`w-4 h-4 ${!isCommuneSelected || !isHomeAvailable ? 'text-gray-400' : 'text-indigo-600'}`} />
                <span className="text-xs sm:text-sm font-bold">🏠 التوصيل للمنزل</span>
              </div>
              <span className={`text-xs ${
                !isCommuneSelected
                  ? 'text-gray-400 font-normal'
                  : !isHomeAvailable
                  ? 'text-red-500 font-bold'
                  : 'text-indigo-700 font-bold'
              }`}>
                {!isCommuneSelected
                  ? 'اختر البلدية أولاً'
                  : !isHomeAvailable
                  ? 'غير متاح'
                  : `${selectedCommune.home_delivery_price.toLocaleString()} ${currency}`}
              </span>
            </button>

            {/* Office Option */}
            <button
              type="button"
              disabled={!isCommuneSelected || !isOfficeAvailable}
              onClick={() => {
                if (isCommuneSelected && isOfficeAvailable) {
                  onDeliveryTypeChange('office');
                }
              }}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between min-h-[82px] ${
                !isCommuneSelected
                  ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-60 cursor-not-allowed'
                  : !isOfficeAvailable
                  ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-70 cursor-not-allowed'
                  : deliveryType === 'office'
                  ? 'border-2 border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold shadow-xs cursor-pointer'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Building2 className={`w-4 h-4 ${!isCommuneSelected || !isOfficeAvailable ? 'text-gray-400' : 'text-indigo-600'}`} />
                <span className="text-xs sm:text-sm font-bold">🏢 التوصيل للمكتب</span>
              </div>
              <span className={`text-xs ${
                !isCommuneSelected
                  ? 'text-gray-400 font-normal'
                  : !isOfficeAvailable
                  ? 'text-red-500 font-bold'
                  : 'text-indigo-700 font-bold'
              }`}>
                {!isCommuneSelected
                  ? 'اختر البلدية أولاً'
                  : !isOfficeAvailable
                  ? 'غير متاح'
                  : `${selectedCommune.office_delivery_price.toLocaleString()} ${currency}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

