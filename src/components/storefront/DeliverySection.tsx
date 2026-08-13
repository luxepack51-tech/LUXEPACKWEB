import React from 'react';
import { Wilaya, Commune, DeliveryType } from '../../types/storefront';
import { MapPin, Home, Building2, Truck, Check } from 'lucide-react';

interface DeliverySectionProps {
  wilayas: Wilaya[];
  communes: Commune[];
  selectedWilayaId: string;
  selectedCommuneId: string;
  deliveryType: DeliveryType;
  deliveryPrice: number;
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

  return (
    <div id="delivery" className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl scroll-mt-20">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">3. اختيار مكان وطريقة التوصيل</h3>
          <p className="text-xs text-zinc-400">اختر الولاية والبلدية لحساب سعر الشحن بدقة</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Wilaya Selection */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>الولاية:</span>
          </label>

          {isLoadingWilayas ? (
            <div className="h-12 bg-zinc-800/60 rounded-xl animate-pulse"></div>
          ) : (
            <select
              value={selectedWilayaId}
              onChange={(e) => onWilayaChange(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none text-sm transition-colors cursor-pointer"
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

        {/* Commune Selection (Only active when Wilaya selected) */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>البلدية:</span>
          </label>

          {!selectedWilayaId ? (
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-500 italic">
              يرجى تحديد الولاية أولاً لعرض البلدية المتاحة
            </div>
          ) : isLoadingCommunes ? (
            <div className="h-12 bg-zinc-800/60 rounded-xl animate-pulse"></div>
          ) : (
            <select
              value={selectedCommuneId}
              onChange={(e) => onCommuneChange(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none text-sm transition-colors cursor-pointer"
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

        {/* Delivery Type Toggle Cards (Home vs Office) */}
        {selectedCommuneId && selectedCommune && (
          <div className="pt-2">
            <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-3">
              نوع التوصيل المطلوب:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Home Delivery */}
              <div
                onClick={() => onDeliveryTypeChange('home')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  deliveryType === 'home'
                    ? 'bg-amber-950/50 border-amber-400 text-white shadow-lg'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${deliveryType === 'home' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">🏠 التوصيل إلى المنزل</h4>
                    <p className="text-[11px] text-zinc-400">توصيل مباشر إلى باب دارك</p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="font-bold text-amber-400 text-sm block">
                    {selectedCommune.home_delivery_price} {currency}
                  </span>
                  {deliveryType === 'home' && (
                    <span className="inline-block mt-1 text-[10px] bg-amber-400 text-zinc-950 px-1.5 py-0.2 rounded font-bold">محدد ✓</span>
                  )}
                </div>
              </div>

              {/* Office Delivery */}
              <div
                onClick={() => onDeliveryTypeChange('office')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  deliveryType === 'office'
                    ? 'bg-amber-950/50 border-amber-400 text-white shadow-lg'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${deliveryType === 'office' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">🏢 التوصيل إلى المكتب</h4>
                    <p className="text-[11px] text-zinc-400">استلام من مقر شركة الشحن</p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="font-bold text-amber-400 text-sm block">
                    {selectedCommune.office_delivery_price} {currency}
                  </span>
                  {deliveryType === 'office' && (
                    <span className="inline-block mt-1 text-[10px] bg-amber-400 text-zinc-950 px-1.5 py-0.2 rounded font-bold">محدد ✓</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Banner */}
            <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
              <span>تكلفة الشحن والتوصيل لهذا الخيار:</span>
              <span className="font-bold text-amber-400 text-sm">{deliveryPrice} {currency}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
