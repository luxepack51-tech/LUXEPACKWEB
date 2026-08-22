import React, { useState, useEffect } from 'react';
import { Package, Perfume, Category, Wilaya, Commune, DeliveryType, OrderPayload, CreatedOrder, StoreSettings, FeaturedPerfume } from '../types/storefront';
import { fetchStoreSettings } from '../services/settings';
import { fetchPackages } from '../services/packages';
import { fetchPerfumes, fetchCategories } from '../services/perfumes';
import { fetchWilayas, fetchCommunesByWilaya, fetchCommuneById } from '../services/delivery';
import { fetchActiveFeaturedPerfumes } from '../services/featuredPerfumes';
import { createOrder } from '../services/orders';
import { initMetaPixel, trackMetaInitiateCheckout, trackMetaPurchase } from '../services/meta';
import { trackTikTokInitiateCheckout, trackTikTokPlaceAnOrder } from '../services/tiktok';

import { CartProvider, useCart } from '../context/CartContext';
import { CartDrawer } from '../components/storefront/CartDrawer';
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
import { FeaturedPerfumesContent } from '../components/storefront/FeaturedPerfumesContent';
import { FloatingCartBar } from '../components/storefront/FloatingCartBar';
import { DEFAULT_STORE_SETTINGS } from '../data/mockData';

interface StorefrontPageProps {
  onNavigate?: (path: string) => void;
}

const StorefrontInner: React.FC<StorefrontPageProps> = ({ onNavigate }) => {
  // Navigation active section: 'packages' (default) vs 'featured'
  const [activeSection, setActiveSection] = useState<'packages' | 'featured'>('packages');

  // Unified Cart Context
  const { 
    cartItems, 
    productsTotal, 
    totalItemsCount, 
    featuredDiscount, 
    addPackageToCart, 
    addFeaturedPerfumeToCart, 
    clearCart,
    openCart
  } = useCart();

  // Master data states
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [packages, setPackages] = useState<Package[]>([]);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);

  // Featured perfumes state
  const [featuredPerfumes, setFeaturedPerfumes] = useState<FeaturedPerfume[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState<boolean>(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

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
  const [directOrderPerfume, setDirectOrderPerfume] = useState<FeaturedPerfume | null>(null);

  // Loading & Submission states
  const [isLoadingMain, setIsLoadingMain] = useState<boolean>(true);
  const [isLoadingWilayas, setIsLoadingWilayas] = useState<boolean>(false);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<{ message: string; code?: string; details?: string; hint?: string } | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

  const loadFeaturedData = async () => {
    setIsLoadingFeatured(true);
    setFeaturedError(null);
    try {
      const feat = await fetchActiveFeaturedPerfumes();
      setFeaturedPerfumes(feat);
    } catch (err: any) {
      console.error('Error fetching featured perfumes:', err);
      setFeaturedError('تعذر تحميل العطور المميزة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  // Load initial store data
  useEffect(() => {
    async function loadData() {
      setIsLoadingMain(true);
      try {
        const [st, pkgs, perfs, wils, feat] = await Promise.all([
          fetchStoreSettings(),
          fetchPackages(),
          fetchPerfumes(),
          fetchWilayas(),
          fetchActiveFeaturedPerfumes()
        ]);

        const cats = await fetchCategories(perfs);

        setSettings(st);
        setPackages(pkgs);
        setPerfumes(perfs);
        setCategories(cats);
        setWilayas(wils);
        setFeaturedPerfumes(feat);

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

  // Navigate section / switch shopMode tab
  const handleNavigateSection = (section: 'packages' | 'featured') => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Track if delivery/checkout section is in view
  const [isDeliveryInView, setIsDeliveryInView] = useState(false);

  useEffect(() => {
    const checkDeliveryVisibility = () => {
      const deliveryEl = document.getElementById('delivery') || document.getElementById('order-form');
      if (!deliveryEl) {
        setIsDeliveryInView(false);
        return;
      }

      const rect = deliveryEl.getBoundingClientRect();
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

  // Handle Package Selection
  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    if (selectedPerfumes.length > pkg.perfumes_count) {
      setSelectedPerfumes(selectedPerfumes.slice(0, pkg.perfumes_count));
    }
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
      }
    }
  };

  // Add currently configured package to cart
  const handleAddCurrentPackageToCart = () => {
    if (!selectedPackage) return;
    if (selectedPerfumes.length !== selectedPackage.perfumes_count) {
      alert(`يرجى تحديد ${selectedPackage.perfumes_count} عطور لإضافة الباقة إلى السلة`);
      return;
    }
    addPackageToCart(selectedPackage, selectedPerfumes);
    // Reset selection after adding to cart
    setSelectedPackage(null);
    setSelectedPerfumes([]);
  };

  // Confirm perfume selection & Proceed to checkout -> Smooth scroll down to delivery section
  const handleProceedToCheckout = () => {
    if (activeSection !== 'packages') {
      setActiveSection('packages');
    }

    const currentTotal = productsTotal || (selectedPackage ? selectedPackage.price : 0);
    if (currentTotal > 0) {
      const contents = cartItems.length > 0 ? cartItems.map(item => ({
        content_id: item.package_id || item.featured_perfume_id || item.id,
        content_name: item.name,
        content_type: item.type === 'package' ? 'product_group' : 'product',
        quantity: item.quantity || 1,
        price: Number(item.unit_price) || 0
      })) : (selectedPackage ? [{
        content_id: selectedPackage.id,
        content_name: selectedPackage.name,
        content_type: 'product_group',
        quantity: 1,
        price: Number(selectedPackage.price) || 0
      }] : []);

      trackMetaInitiateCheckout({
        contents,
        value: currentTotal,
        currency: 'DZD'
      });
      trackTikTokInitiateCheckout({
        contents,
        value: currentTotal,
        currency: 'DZD'
      });
    }

    // Smooth scroll down to delivery section
    const scrollToDelivery = () => {
      const deliverySection = document.getElementById('delivery') || document.getElementById('delivery-section') || document.getElementById('order-form');
      if (deliverySection) {
        deliverySection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    scrollToDelivery();
    setTimeout(scrollToDelivery, 100);
  };

  const handleConfirmPerfumeSelection = handleProceedToCheckout;

  // Calculate delivery price dynamically ONLY when commune and available deliveryType are selected
  const selectedWilaya = wilayas.find(w => String(w.id) === selectedWilayaId);
  const selectedCommune = communes.find(c => String(c.id) === selectedCommuneId);

  let deliveryPrice: number | null = null;
  if (selectedCommune && deliveryType === 'home' && selectedCommune.home_delivery_available) {
    deliveryPrice = selectedCommune.home_delivery_price;
  } else if (selectedCommune && deliveryType === 'office' && selectedCommune.office_delivery_available) {
    deliveryPrice = selectedCommune.office_delivery_price;
  }

  // Calculate dynamic products base price
  const hasCartItems = !directOrderPerfume && cartItems.length > 0;
  const currentPackagePrice = selectedPackage ? selectedPackage.price : 0;
  const currentProductsPrice = directOrderPerfume
    ? directOrderPerfume.price
    : (hasCartItems ? productsTotal + currentPackagePrice : currentPackagePrice);

  const totalPrice = currentProductsPrice + (deliveryPrice ?? 0);

  // Validation
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;
  const isPerfumeCountComplete = selectedPackage && selectedPerfumes.length === perfumesNeeded;
  const isPhoneValid = phone.trim().length >= 9 && /^[0-9+\s-]{9,15}$/.test(phone.trim());

  let validationMessage: string | null = null;
  if (!directOrderPerfume && !hasCartItems && !selectedPackage) {
    validationMessage = 'يرجى اختيار باقة أو إضافة منتجات إلى السلة للاستمرار';
  } else if (!directOrderPerfume && !hasCartItems && selectedPackage && !isPerfumeCountComplete) {
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

  // Handle direct featured perfume order modal trigger (without modifying the cart)
  const handleOrderFeaturedPerfume = (perfume: FeaturedPerfume) => {
    setDirectOrderPerfume(perfume);
    setIsOrderModalOpen(true);
    const itemPrice = Number(perfume.price) || 0;
    const contents = [{
      content_id: perfume.id,
      content_name: perfume.name,
      content_type: 'product',
      quantity: 1,
      price: itemPrice
    }];
    trackTikTokInitiateCheckout({
      contents,
      value: itemPrice,
      currency: 'DZD'
    });
    trackMetaInitiateCheckout({
      contents,
      value: itemPrice,
      currency: 'DZD'
    });
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setDirectOrderPerfume(null);
  };

  // Handle Order Submit (Unified Cart, Direct Perfume, or Standalone package)
  const handleSubmitOrder = async () => {
    if (validationMessage) {
      console.error('[ORDER TRACE VALIDATION ERROR]', validationMessage);
      return;
    }

    if (!selectedCommune || !deliveryType || deliveryPrice === null) {
      console.error('[ORDER TRACE VALIDATION ERROR]', 'Missing required delivery selection');
      return;
    }

    const wilName = selectedWilaya ? selectedWilaya.name : (selectedWilayaId || 'غير محدد');
    const comName = selectedCommune ? selectedCommune.name : (selectedCommuneId || wilName);

    setSubmitError(null);
    setIsSubmittingOrder(true);

    // 1. If Direct Single Featured Perfume Quick Order
    if (directOrderPerfume) {
      const directTotalPrice = Number(directOrderPerfume.price) + Number(deliveryPrice);
      const payload: OrderPayload = {
        customer_name: fullName.trim(),
        phone: phone.trim(),
        wilaya_id: String(selectedWilaya?.id || selectedWilayaId),
        wilaya_name: wilName,
        commune_id: String(selectedCommune.id),
        commune_name: comName,
        delivery_type: deliveryType,
        address: address.trim() || comName,
        notes: notes.trim() ? `${notes.trim()} | طلب مباشر: [عطر مميز: ${directOrderPerfume.name}]` : `طلب مباشر: [عطر مميز: ${directOrderPerfume.name}]`,
        package_id: `feat-${directOrderPerfume.id}`,
        package_name: `عطر مميز: ${directOrderPerfume.name}`,
        package_price: directOrderPerfume.price,
        selected_perfumes: [{
          id: directOrderPerfume.id,
          name: directOrderPerfume.name,
          image_url: directOrderPerfume.image_url,
          category: 'عطور مميزة',
          quantity: 1,
          type: 'featured_perfume'
        }],
        delivery_price: Number(deliveryPrice),
        total_price: Number(directTotalPrice),
        status: 'pending'
      };

      const directContents = [{
        content_id: directOrderPerfume.id,
        content_name: directOrderPerfume.name,
        content_type: 'product',
        quantity: 1,
        price: Number(directOrderPerfume.price) || 0
      }];

      trackMetaInitiateCheckout({
        contents: directContents,
        value: directTotalPrice,
        currency: 'DZD'
      });

      trackTikTokInitiateCheckout({
        contents: directContents,
        value: directTotalPrice,
        currency: 'DZD'
      });

      const result = await createOrder(payload);
      setIsSubmittingOrder(false);

      if (result.success && result.order) {
        setIsOrderModalOpen(false);
        setDirectOrderPerfume(null);
        trackMetaPurchase(result.order);
        // TikTok COD PlaceAnOrder tracking (deduplicated by order.id)
        trackTikTokPlaceAnOrder(result.order);
        setCreatedOrder(result.order);
      } else {
        console.error('[ORDER TRACE SUPABASE ERROR]', result.error);
        setSubmitError(result.error || {
          message: 'تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.'
        });
      }
      return;
    }

    // 2. Otherwise: Handle Unified Cart Items
    let finalCartItems = [...cartItems];
    if (selectedPackage && isPerfumeCountComplete) {
      const packageItem = {
        id: `pkg-${selectedPackage.id}-${Date.now()}`,
        type: 'package' as const,
        package_id: selectedPackage.id,
        name: selectedPackage.name,
        unit_price: selectedPackage.price,
        quantity: 1,
        selected_perfumes: selectedPerfumes
      };
      finalCartItems.push(packageItem);
    }

    if (finalCartItems.length === 0) {
      console.error('[ORDER TRACE VALIDATION ERROR]', 'Cart is empty');
      setIsSubmittingOrder(false);
      return;
    }

    // Build comprehensive order summary representation
    const packageDescriptions = finalCartItems.map(item => {
      if (item.type === 'package') {
        const perfNames = item.selected_perfumes?.map(p => p.name).join(' + ') || '';
        return `[باقة: ${item.name} × ${item.quantity} (${perfNames})]`;
      } else {
        return `[عطر مميز: ${item.name} × ${item.quantity}]`;
      }
    });

    const compositePackageName = packageDescriptions.join(' | ');

    // Aggregate all perfumes
    const allSelectedPerfumes: { id: string; name: string; image_url?: string; category?: string; quantity?: number; type?: string }[] = [];
    finalCartItems.forEach(item => {
      if (item.type === 'package' && item.selected_perfumes) {
        item.selected_perfumes.forEach(p => {
          allSelectedPerfumes.push({
            id: p.id,
            name: `${p.name} (ضمن باقة ${item.name})`,
            image_url: p.image_url,
            category: p.category || 'باقة',
            quantity: 1,
            type: 'package'
          });
        });
      } else if (item.type === 'featured_perfume') {
        allSelectedPerfumes.push({
          id: item.featured_perfume_id || item.id,
          name: item.name,
          image_url: item.image_url,
          category: 'عطور مميزة',
          quantity: item.quantity || 1,
          type: 'featured_perfume'
        });
      }
    });

    const payload: OrderPayload = {
      customer_name: fullName.trim(),
      phone: phone.trim(),
      wilaya_id: String(selectedWilaya?.id || selectedWilayaId),
      wilaya_name: wilName,
      commune_id: String(selectedCommune.id),
      commune_name: comName,
      delivery_type: deliveryType,
      address: address.trim() || comName,
      notes: notes.trim() ? `${notes.trim()} | سلة المشتريات: ${compositePackageName}` : `سلة المشتريات: ${compositePackageName}`,
      package_id: finalCartItems[0].package_id || 'unified-cart',
      package_name: compositePackageName.length > 250 ? `${compositePackageName.substring(0, 245)}...` : compositePackageName,
      package_price: Number(productsTotal) || Number(currentProductsPrice) || 0,
      selected_perfumes: allSelectedPerfumes,
      delivery_price: Number(deliveryPrice),
      total_price: Number(totalPrice),
      status: 'pending'
    };

    const cartContents = finalCartItems.map(item => ({
      content_id: item.package_id || item.featured_perfume_id || item.id,
      content_name: item.name,
      content_type: item.type === 'package' ? 'product_group' : 'product',
      quantity: item.quantity || 1,
      price: Number(item.unit_price) || 0
    }));

    trackMetaInitiateCheckout({
      contents: cartContents,
      value: totalPrice,
      currency: 'DZD'
    });

    trackTikTokInitiateCheckout({
      contents: cartContents,
      value: totalPrice,
      currency: 'DZD'
    });

    const result = await createOrder(payload);

    setIsSubmittingOrder(false);

    if (result.success && result.order) {
      setIsOrderModalOpen(false);
      clearCart();
      setSelectedPackage(null);
      setSelectedPerfumes([]);
      trackMetaPurchase(result.order);
      // TikTok COD PlaceAnOrder tracking (deduplicated by order.id)
      trackTikTokPlaceAnOrder(result.order);
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
    clearCart();
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
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans dir-rtl pb-24 sm:pb-12">
      {/* Global Shopping Cart Drawer */}
      <CartDrawer 
        currency={settings.currency}
        onProceedToCheckout={handleProceedToCheckout}
        onCheckout={handleProceedToCheckout}
      />

      {/* Navbar Header with Sticky Navigation and Cart Button */}
      <Header
        settings={settings}
        selectedPackage={selectedPackage}
        selectedPerfumes={selectedPerfumes}
        packagesCount={packages.length}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
        onOpenCheckout={handleConfirmPerfumeSelection}
      />

      <main className="space-y-6">
        {activeSection === 'packages' ? (
          /* ============================================================ */
          /* 1. PACKAGES VIEW (HERO + PACKAGES + PERFUMES + DELIVERY) */
          /* ============================================================ */
          <div id="packages-section" className="space-y-6">
            {/* Hero Section */}
            <Hero
              settings={settings}
              onChoosePackage={() => scrollToSection('packages')}
            />

            {/* Package Selection Section */}
            <PackageSection
              packages={packages}
              selectedPackage={selectedPackage}
              onSelectPackage={handleSelectPackage}
              isLoading={isLoadingMain}
              currency={settings.currency}
            />

            {/* Perfume Selection Section */}
            <PerfumeSection
              perfumes={perfumes}
              categories={categories}
              selectedPackage={selectedPackage}
              selectedPerfumes={selectedPerfumes}
              onTogglePerfume={handleTogglePerfume}
              isLoading={isLoadingMain}
              onScrollToDelivery={handleConfirmPerfumeSelection}
              onAddPackageToCart={handleAddCurrentPackageToCart}
            />

            {/* Delivery & Order Form & Summary Container */}
            <section id="delivery" className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-20 sm:scroll-mt-24">
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

            {/* How It Works Guide */}
            <HowItWorks />
          </div>
        ) : (
          /* ============================================================ */
          /* 2. FEATURED PERFUMES VIEW (STANDALONE SEPARATE PAGE) */
          /* ============================================================ */
          <div id="featured-section">
            <FeaturedPerfumesContent
              featuredPerfumes={featuredPerfumes}
              isLoading={isLoadingFeatured}
              error={featuredError}
              currency={settings.currency}
              onOrderPerfume={handleOrderFeaturedPerfume}
              onRetry={loadFeaturedData}
            />
          </div>
        )}
      </main>

      {/* Global Floating Sticky Cart Bar (Shown whenever items are in cart e.g. featured perfumes selected) */}
      {totalItemsCount > 0 && (
        <FloatingCartBar 
          currency={settings.currency}
          onOpenCart={openCart}
          onResetCart={() => {
            setSelectedPackage(null);
            setSelectedPerfumes([]);
          }}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}

      {/* Floating Bottom Bar on Mobile when required perfume limit is reached in Packages mode and no cart items */}
      {totalItemsCount === 0 && selectedPackage && selectedPerfumes.length === selectedPackage.perfumes_count && !isDeliveryInView && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-emerald-200 z-40 sm:hidden flex items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="text-right">
            <span className="text-[11px] text-emerald-700 font-bold block">
              ✓ تم تحديد {selectedPerfumes.length} عطور
            </span>
            <span className="font-black text-emerald-800 text-sm">
              باك {selectedPackage.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedPackage(null);
                setSelectedPerfumes([]);
              }}
              className="p-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 active:scale-98 cursor-pointer"
              title="إلغاء التحديد"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={handleConfirmPerfumeSelection}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <span>✓ تأكيد الطلب</span>
            </button>
          </div>
        </div>
      )}

      {/* Order Details Bottom Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        selectedPackage={selectedPackage}
        selectedPerfumes={selectedPerfumes}
        directOrderPerfume={directOrderPerfume}
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

export const StorefrontPage: React.FC<StorefrontPageProps> = (props) => {
  return (
    <CartProvider>
      <StorefrontInner {...props} />
    </CartProvider>
  );
};
