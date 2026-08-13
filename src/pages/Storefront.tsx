import React, { useState, useEffect } from 'react';
import { Package, Perfume, Category, Wilaya, Commune, DeliveryType, OrderPayload, CreatedOrder, StoreSettings } from '../types/storefront';
import { fetchStoreSettings } from '../services/settings';
import { fetchPackages } from '../services/packages';
import { fetchPerfumes, fetchCategories } from '../services/perfumes';
import { fetchWilayas, fetchCommunesByWilaya } from '../services/delivery';
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
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('home');

  // Customer details form states
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

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

  // Scroll to helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Package Selection
  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    // If selected perfumes exceed new package count, trim list
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
        setSelectedPerfumes([...selectedPerfumes, perfume]);
      }
    }
  };

  // Calculate delivery price dynamically
  const selectedCommune = communes.find(c => String(c.id) === selectedCommuneId);
  const deliveryPrice = selectedCommune
    ? (deliveryType === 'home' ? selectedCommune.home_delivery_price : selectedCommune.office_delivery_price)
    : 0;

  const packagePrice = selectedPackage ? selectedPackage.price : 0;
  const totalPrice = packagePrice + deliveryPrice;

  // Validation
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;
  const isPerfumeCountComplete = selectedPackage && selectedPerfumes.length === perfumesNeeded;

  const isPhoneValid = phone.trim().length >= 9 && /^[0-9+\s-]{9,15}$/.test(phone.trim());

  let validationMessage: string | null = null;
  if (!selectedPackage) {
    validationMessage = 'يرجى تحديد إحدى الباقات للاستمرار';
  } else if (!isPerfumeCountComplete) {
    validationMessage = `يرجى تحديد ${perfumesNeeded} عطور (تم تحديد ${selectedPerfumes.length} من أصل ${perfumesNeeded})`;
  } else if (!selectedWilayaId) {
    validationMessage = 'يرجى اختيار ولاية التوصيل';
  } else if (!selectedCommuneId) {
    validationMessage = 'يرجى اختيار بلدية التوصيل';
  } else if (!fullName.trim()) {
    validationMessage = 'يرجى إدخال الاسم واللقب الكامل';
  } else if (!isPhoneValid) {
    validationMessage = 'يرجى كتابة رقم هاتف صحبح لمتابعة الطلب';
  } else if (deliveryType === 'home' && !address.trim()) {
    validationMessage = 'يرجى إدخال العنوان للتوصيل للمنزل';
  }

  const canSubmit = !validationMessage;

  // Handle Order Submit
  const handleSubmitOrder = async () => {
    console.log('[ORDER TRACE 1] BUTTON/SUBMIT TRIGGERED');

    const formData = {
      fullName,
      phone,
      selectedWilayaId,
      selectedCommuneId,
      deliveryType,
      address,
      notes,
      selectedPackage,
      selectedPerfumes,
      deliveryPrice,
      totalPrice
    };
    console.log('[ORDER TRACE 2] FORM DATA:', formData);

    if (validationMessage) {
      console.error('[ORDER TRACE VALIDATION ERROR]', validationMessage);
      return;
    }

    if (!canSubmit || !selectedPackage) {
      console.error('[ORDER TRACE VALIDATION ERROR]', 'Missing required package or form values');
      return;
    }

    console.log('[ORDER TRACE 3] VALIDATION PASSED');

    setSubmitError(null);
    setIsSubmittingOrder(true);

    const selectedWilaya = wilayas.find(w => String(w.id) === selectedWilayaId);
    const selectedCommune = communes.find(c => String(c.id) === selectedCommuneId);

    const payload: OrderPayload = {
      customer_name: fullName.trim(),
      phone: phone.trim(),
      wilaya_id: selectedWilayaId,
      wilaya_name: selectedWilaya ? selectedWilaya.name : selectedWilayaId,
      commune_id: selectedCommuneId,
      commune_name: selectedCommune ? selectedCommune.name : selectedCommuneId,
      delivery_type: deliveryType,
      address: address.trim(),
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
      delivery_price: Number(deliveryPrice) || 0,
      total_price: Number(totalPrice) || 0,
      status: 'pending'
    };

    console.log('[ORDER TRACE 4] ORDER PAYLOAD:', payload);

    trackPixelEvent('InitiateCheckout', {
      value: totalPrice,
      currency: 'DZD'
    });

    const result = await createOrder(payload);

    setIsSubmittingOrder(false);

    if (result.success && result.order) {
      console.log('[ORDER TRACE 6] ORDER CREATED:', result.order);
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
    setSelectedPackage(null);
    setSelectedPerfumes([]);
    setSelectedWilayaId('');
    setSelectedCommuneId('');
    setFullName('');
    setPhone('');
    setAddress('');
    setNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans dir-rtl overflow-x-hidden selection:bg-amber-500 selection:text-zinc-950">
      
      {/* Navbar Header */}
      <Header
        settings={settings}
        selectedPackage={selectedPackage}
        selectedPerfumes={selectedPerfumes}
        onScrollToSection={scrollToSection}
      />

      <main>
        {/* Hero Section */}
        <Hero
          settings={settings}
          onChoosePackage={() => scrollToSection('packages')}
        />

        {/* How It Works Guide */}
        <HowItWorks />

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
          onScrollToDelivery={() => scrollToSection('delivery')}
        />

        {/* 3 & 4. Delivery & Order Form & Summary Container */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Delivery & Customer Info */}
            <div className="lg:col-span-7 space-y-8">
              
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
                onCommuneChange={(communeId) => setSelectedCommuneId(communeId)}
                onDeliveryTypeChange={(type) => setDeliveryType(type)}
              />

              {/* Customer Info COD Form */}
              <OrderForm
                fullName={fullName}
                phone={phone}
                address={address}
                notes={notes}
                deliveryType={deliveryType}
                phoneError={phone && !isPhoneValid ? 'يرجى إدخال رقم هاتف جزائري صالح (مثال: 0550123456)' : null}
                onFullNameChange={setFullName}
                onPhoneChange={setPhone}
                onAddressChange={setAddress}
                onNotesChange={setNotes}
              />

              {/* Error Alert if submission failed */}
              {submitError && (
                <div className="p-4 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-sm shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300 text-base">تعذر إرسال الطلب</span>
                    <button
                      onClick={() => setSubmitError(null)}
                      className="text-xs underline text-red-300 font-bold shrink-0 cursor-pointer"
                    >
                      إغلاق
                    </button>
                  </div>
                  <div className="bg-zinc-950/80 p-3 rounded-lg border border-red-900/50 font-mono text-xs text-red-300 space-y-1 dir-ltr text-left overflow-x-auto">
                    <p><strong>Message:</strong> {submitError.message || 'Unknown error'}</p>
                    {submitError.code && <p><strong>Code:</strong> {submitError.code}</p>}
                    {submitError.details && <p><strong>Details:</strong> {submitError.details}</p>}
                    {submitError.hint && <p><strong>Hint:</strong> {submitError.hint}</p>}
                  </div>
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

      {/* Success Modal */}
      {createdOrder && (
        <OrderSuccessModal
          order={createdOrder}
          settings={settings}
          onReset={handleResetForm}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-900 bg-zinc-950 py-8 px-4 text-center text-xs text-zinc-500">
        <p className="mb-2">© {new Date().getFullYear()} {settings.store_name}. جميع الحقوق محفوظة.</p>
        <p className="text-zinc-600">متجر عطور فاخرة مخصص لجميع الولايات الجزائرية مع الدفع عند الاستلام 🇩🇿</p>
      </footer>
    </div>
  );
};
