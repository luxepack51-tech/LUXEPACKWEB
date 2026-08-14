import React, { useState, useEffect } from 'react';
import { Package, Perfume, Category, Wilaya, Commune, DeliveryType, OrderPayload, CreatedOrder, StoreSettings } from '../types/storefront';
import { fetchStoreSettings } from '../services/settings';
import { fetchPackages } from '../services/packages';
import { fetchPerfumes, fetchCategories } from '../services/perfumes';
import { fetchWilayas, fetchCommunesByWilaya, fetchCommuneById } from '../services/delivery';
import { createOrder } from '../services/orders';
import { initMetaPixel, trackPixelEvent } from '../services/pixel';

import { Header } from '../components/storefront/Header';
import { Hero } from '../components/storefront/Hero';
import { PackageSection } from '../components/storefront/PackageSection';
import { PerfumeSection } from '../components/storefront/PerfumeSection';
import { DeliverySection } from '../components/storefront/DeliverySection';
import { OrderForm } from '../components/storefront/OrderForm';
import { OrderSummarySticky } from '../components/storefront/OrderSummarySticky';
import { OrderSuccessModal } from '../components/storefront/OrderSuccessModal';
import { OrderDetailsModal } from '../components/storefront/OrderDetailsModal';
import { HowItWorks } from '../components/storefront/HowItWorks';
import { DEFAULT_STORE_SETTINGS } from '../data/mockData';

export const StorefrontPage: React.FC = () => {
  // Master data states
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [packages, setPackages] = useState<Package[]>([]);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);

  // Selection states
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedPerfumes, setSelectedPerfumes] = useState<Perfume[]>([]);
  const [selectedWilayaId, setSelectedWilayaId] = useState<string>('');
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);

  // Customer details form states
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // Loading & Submission states
  const [isLoadingMain, setIsLoadingMain] = useState<boolean>(true);
  const [isLoadingWilayas, setIsLoadingWilayas] = useState<boolean>(false);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<{ message: string; code?: string; details?: string; hint?: string } | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

  // Load initial store data
  useEffect(() => {
    async function loadData() {
      setIsLoadingMain(true);
      try {
        const [st, pkgs, perfs, wils] = await Promise.all([
          fetchStoreSettings(),
          fetchPackages(),
          fetchPerfumes(),
          fetchWilayas()
        ]);

        const cats = await fetchCategories(perfs);

        setSettings(st);
        setPackages(pkgs);
        setPerfumes(perfs);
        setCategories(cats);
        setWilayas(wils);

        if (st.pixel_id) {
          initMetaPixel(st.pixel_id);
        }
      } catch (err) {
        console.error('Error loading storefront data:', err);
      } finally {
        setIsLoadingMain(false);
      }
    }

    loadData();
  }, []);

  // Handle Wilaya change & fetch communes
  const handleWilayaChange = async (wilayaId: string) => {
    setSelectedWilayaId(wilayaId);
    setSelectedCommuneId('');
    setDeliveryType(null);
    setCommunes([]);

    if (!wilayaId) return;

    setIsLoadingCommunes(true);
    const selectedWilaya = wilayas.find(w => String(w.id) === wilayaId);
    const wilName = selectedWilaya ? selectedWilaya.name : '';

    try {
      const fetchedCommunes = await fetchCommunesByWilaya(wilayaId, wilName);
      setCommunes(fetchedCommunes);
    } catch (err) {
      console.error('Error fetching communes:', err);
    } finally {
      setIsLoadingCommunes(false);
    }
  };

  // Handle Commune change
  const handleCommuneChange = async (communeId: string) => {
    setSelectedCommuneId(communeId);
    setDeliveryType(null);

    if (!communeId) return;

    try {
      const freshCommune = await fetchCommuneById(communeId);
      if (freshCommune) {
        setCommunes(prev => prev.map(c => String(c.id) === String(freshCommune.id) ? freshCommune : c));
      }
    } catch (err) {
      console.error('Error fetching commune delivery info:', err);
    }
  };

  // Handle Delivery Type Selection
  const handleDeliveryTypeChange = (type: DeliveryType) => {
    if (!selectedCommune) return;
    if (type === 'home' && !selectedCommune.home_delivery_available) return;
    if (type === 'office' && !selectedCommune.office_delivery_available) return;
    setDeliveryType(type);
  };

  // Scroll to helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Confirm perfume selection -> Smooth scroll to order form (does NOT submit order)
  const handleConfirmPerfumeSelection = () => {
    const orderSection = document.getElementById('delivery') || document.getElementById('order-form');
    if (orderSection) {
      orderSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      scrollToSection('delivery');
    }
  };

  // Handle Package Selection
  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    if (selectedPerfumes.length > pkg.perfumes_count) {
      setSelectedPerfumes(selectedPerfumes.slice(0, pkg.perfumes_count));
    }
    trackPixelEvent('AddToCart', {
      content_name: pkg.name,
      value: pkg.price,
      currency: 'DZD'
    });
    scrollToSection('perfumes');
  };

  // Handle Perfume Toggle (Add / Remove)
  const handleTogglePerfume = (perfume: Perfume) => {
    const exists = selectedPerfumes.some(p => p.id === perfume.id);
    if (exists) {
      setSelectedPerfumes(selectedPerfumes.filter(p => p.id !== perfume.id));
    } else {
      if (selectedPackage && selectedPerfumes.length < selectedPackage.perfumes_count) {
        const nextList = [...selectedPerfumes, perfume];
        setSelectedPerfumes(nextList);
        // Note: Do NOT automatically scroll or open modal here.
        // The customer manually clicks "✓ تأكيد الطلب" CTA button when ready.
      }
    }
  };

  // Calculate delivery price dynamically ONLY when commune and available deliveryType are selected
  const selectedWilaya = wilayas.find(w => String(w.id) === selectedWilayaId);
  const selectedCommune = communes.find(c => String(c.id) === selectedCommuneId);

  let deliveryPrice: number | null = null;
  if (selectedCommune && deliveryType === 'home' && selectedCommune.home_delivery_available) {
    deliveryPrice = selectedCommune.home_delivery_price;
  } else if (selectedCommune && deliveryType === 'office' && selectedCommune.office_delivery_available) {
    deliveryPrice = selectedCommune.office_delivery_price;
  }

  const packagePrice = selectedPackage ? selectedPackage.price : 0;
  const totalPrice = packagePrice + (deliveryPrice ?? 0);

  // Validation
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;
  const isPerfumeCountComplete = selectedPackage && selectedPerfumes.length === perfumesNeeded;
  const isPhoneValid = phone.trim().length >= 9 && /^[0-9+\s-]{9,15}$/.test(phone.trim());

  let validationMessage: string | null = null;
  if (!selectedPackage) {
    validationMessage = 'يرجى تحديد إحدى الباقات للاستمرار';
  } else if (!isPerfumeCountComplete) {
    validationMessage = `يرجى تحديد ${perfumesNeeded} عطور (تم تحديد ${selectedPerfumes.length} من أصل ${perfumesNeeded})`;
  } else if (!fullName.trim()) {
    validationMessage = 'يرجى إدخال الاسم واللقب الكامل';
  } else if (!isPhoneValid) {
    validationMessage = 'يرجى كتابة رقم هاتف صالح لمتابعة الطلب';
  } else if (!selectedWilayaId) {
    validationMessage = 'يرجى اختيار ولاية التوصيل';
  } else if (!selectedCommuneId) {
    validationMessage = 'يرجى اختيار بلدية التوصيل';
  } else if (!deliveryType) {
    validationMessage = 'يرجى اختيار نوع التوصيل (للمنزل أو للمكتب)';
  } else if (deliveryType === 'home' && selectedCommune && !selectedCommune.home_delivery_available) {
    validationMessage = 'التوصيل للمنزل غير متاح لهذه البلدية';
  } else if (deliveryType === 'office' && selectedCommune && !selectedCommune.office_delivery_available) {
    validationMessage = 'التوصيل للمكتب غير متاح لهذه البلدية';
  }

  const canSubmit = !validationMessage;

  // Handle Order Submit
  const handleSubmitOrder = async () => {
    if (validationMessage) {
      console.error('[ORDER TRACE VALIDATION ERROR]', validationMessage);
      return;
    }

    if (!canSubmit || !selectedPackage || !selectedCommune || !deliveryType || deliveryPrice === null) {
      console.error('[ORDER TRACE VALIDATION ERROR]', 'Missing required package or delivery selection');
      return;
    }

    setSubmitError(null);
    setIsSubmittingOrder(true);

    const wilName = selectedWilaya ? selectedWilaya.name : (selectedWilayaId || 'غير محدد');
    const comName = selectedCommune ? selectedCommune.name : (selectedCommuneId || wilName);

    const payload: OrderPayload = {
      customer_name: fullName.trim(),
      phone: phone.trim(),
      wilaya_id: String(selectedWilaya?.id || selectedWilayaId),
      wilaya_name: wilName,
      commune_id: String(selectedCommune.id),
      commune_name: comName,
      delivery_type: deliveryType,
      address: address.trim() || comName,
      notes: notes.trim(),
      package_id: selectedPackage.id,
      package_name: selectedPackage.name,
      package_price: Number(selectedPackage.price) || 0,
      selected_perfumes: selectedPerfumes.map(p => ({
        id: p.id,
        name: p.name,
        image_url: p.image_url,
        category: p.category
      })),
      delivery_price: Number(deliveryPrice),
      total_price: Number(totalPrice),
      status: 'pending'
    };

    trackPixelEvent('InitiateCheckout', {
      value: totalPrice,
      currency: 'DZD'
    });

    const result = await createOrder(payload);

    setIsSubmittingOrder(false);

    if (result.success && result.order) {
      setIsOrderModalOpen(false);
      trackPixelEvent('Purchase', {
        value: totalPrice,
        currency: 'DZD',
        order_id: result.order.id
      });
      setCreatedOrder(result.order);
    } else {
      console.error('[ORDER TRACE SUPABASE ERROR]', result.error);
      setSubmitError(result.error || {
        message: 'تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.'
      });
    }
  };

  const handleResetForm = () => {
    setCreatedOrder(null);
    setIsOrderModalOpen(false);
    setSelectedPackage(null);
    setSelectedPerfumes([]);
    setSelectedWilayaId('');
    setSelectedCommuneId('');
    setDeliveryType(null);
    setFullName('');
    setPhone('');
    setAddress('');
    setNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans dir-rtl overflow-x-hidden pb-24 sm:pb-12">
      {/* Navbar Header */}
      <Header
        settings={settings}
        selectedPackage={selectedPackage}
        selectedPerfumes={selectedPerfumes}
        onScrollToSection={scrollToSection}
        onOpenCheckout={handleConfirmPerfumeSelection}
      />

      <main className="space-y-4">
        {/* Hero Section */}
        <Hero
          settings={settings}
          onChoosePackage={() => scrollToSection('packages')}
        />

        {/* 1. Package Selection Section */}
        <PackageSection
          packages={packages}
          selectedPackage={selectedPackage}
          onSelectPackage={handleSelectPackage}
          isLoading={isLoadingMain}
          currency={settings.currency}
        />

        {/* 2. Perfume Selection Section */}
        <PerfumeSection
          perfumes={perfumes}
          categories={categories}
          selectedPackage={selectedPackage}
          selectedPerfumes={selectedPerfumes}
          onTogglePerfume={handleTogglePerfume}
          isLoading={isLoadingMain}
          onScrollToDelivery={handleConfirmPerfumeSelection}
        />

        {/* How It Works Guide */}
        <HowItWorks />

        {/* 3 & 4. Delivery & Order Form & Summary Container */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Delivery & Customer Info */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Delivery Place & Method Selector */}
              <DeliverySection
                wilayas={wilayas}
                communes={communes}
                selectedWilayaId={selectedWilayaId}
                selectedCommuneId={selectedCommuneId}
                deliveryType={deliveryType}
                deliveryPrice={deliveryPrice}
                isLoadingWilayas={isLoadingMain}
                isLoadingCommunes={isLoadingCommunes}
                currency={settings.currency}
                onWilayaChange={handleWilayaChange}
                onCommuneChange={handleCommuneChange}
                onDeliveryTypeChange={handleDeliveryTypeChange}
              />

              {/* Customer Info COD Form */}
              <OrderForm
                fullName={fullName}
                phone={phone}
                address={address}
                notes={notes}
                deliveryType={deliveryType}
                phoneError={phone && !isPhoneValid ? 'يرجى إدخال رقم هاتف صالح (مثال: 0550123456)' : null}
                onFullNameChange={setFullName}
                onPhoneChange={setPhone}
                onAddressChange={setAddress}
                onNotesChange={setNotes}
              />

              {/* Error Alert if submission failed */}
              {submitError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-800 text-base">تعذر إرسال الطلب</span>
                    <button
                      onClick={() => setSubmitError(null)}
                      className="text-xs underline text-red-800 font-bold shrink-0 cursor-pointer"
                    >
                      إغلاق
                    </button>
                  </div>
                  <p className="text-xs text-red-600">{submitError.message || 'يرجى التأكد من ملء جميع الحقول المطلوبة والمحاولة مرة أخرى.'}</p>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Sticky Order Summary & Submit Trigger */}
            <div className="lg:col-span-5">
              <OrderSummarySticky
                selectedPackage={selectedPackage}
                selectedPerfumes={selectedPerfumes}
                wilayaName={wilayas.find(w => String(w.id) === selectedWilayaId)?.name || ''}
                communeName={communes.find(c => String(c.id) === selectedCommuneId)?.name || ''}
                deliveryType={deliveryType}
                deliveryPrice={deliveryPrice}
                totalPrice={totalPrice}
                currency={settings.currency}
                isSubmitting={isSubmittingOrder}
                canSubmit={canSubmit}
                validationMessage={validationMessage}
                onSubmitOrder={handleSubmitOrder}
              />
            </div>

          </div>
        </section>
      </main>

      {/* Floating Bottom Bar on Mobile only when required perfume limit is reached */}
      {selectedPackage && selectedPerfumes.length === selectedPackage.perfumes_count && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-emerald-200 z-40 sm:hidden flex items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="text-right">
            <span className="text-[11px] text-emerald-700 font-bold block">
              ✓ تم تحديد {selectedPerfumes.length} عطور
            </span>
            <span className="font-black text-emerald-800 text-sm">
              باقة {selectedPackage.name}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirmPerfumeSelection}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-black text-sm shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            <span>✓ تأكيد الطلب</span>
          </button>
        </div>
      )}

      {/* Order Details Bottom Modal matching Screenshots 1 & 2 */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        selectedPackage={selectedPackage}
        selectedPerfumes={selectedPerfumes}
        wilayas={wilayas}
        communes={communes}
        selectedWilayaId={selectedWilayaId}
        selectedCommuneId={selectedCommuneId}
        deliveryType={deliveryType}
        deliveryPrice={deliveryPrice}
        totalPrice={totalPrice}
        currency={settings.currency}
        fullName={fullName}
        phone={phone}
        phoneError={phone && !isPhoneValid ? 'يرجى إدخال رقم هاتف صالح (مثال: 0550123456)' : null}
        isLoadingWilayas={isLoadingWilayas}
        isLoadingCommunes={isLoadingCommunes}
        isSubmitting={isSubmittingOrder}
        canSubmit={canSubmit}
        validationMessage={validationMessage}
        onWilayaChange={handleWilayaChange}
        onCommuneChange={handleCommuneChange}
        onDeliveryTypeChange={handleDeliveryTypeChange}
        onFullNameChange={setFullName}
        onPhoneChange={setPhone}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Success Modal */}
      {createdOrder && (
        <OrderSuccessModal
          order={createdOrder}
          settings={settings}
          onReset={handleResetForm}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200/80 bg-white py-8 px-4 text-center text-xs text-gray-500">
        <p className="mb-1 font-semibold text-gray-700">© {new Date().getFullYear()} {settings.store_name}. جميع الحقوق محفوظة.</p>
        <p className="text-gray-400">توصيل سريع لجميع الولايات الجزائرية مع الدفع عند الاستلام 🇩🇿</p>
      </footer>
    </div>
  );
};

