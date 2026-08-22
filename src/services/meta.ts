import { CreatedOrder } from '../types/storefront';

export const META_PIXEL_ID = '1762757184972532';
const DEFAULT_CURRENCY = 'DZD';

declare global {
  interface Window {
    fbq?: {
      (action: 'init', pixelId: string, customData?: Record<string, any>): void;
      (action: 'track' | 'trackCustom', eventName: string, params?: Record<string, any>, options?: { eventID?: string }): void;
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      loaded?: boolean;
      version?: string;
      [key: string]: any;
    };
    _fbq?: any;
  }
}

/**
 * Meta content_type normalization:
 * - 'product' for single perfumes / featured perfumes
 * - 'product_group' for packages / bundles / collections
 */
export function normalizeMetaContentType(type?: string): 'product' | 'product_group' {
  if (!type) return 'product';
  const lower = type.toLowerCase();
  if (lower === 'product_group' || lower === 'package' || lower === 'bundle' || lower === 'collection') {
    return 'product_group';
  }
  return 'product';
}

/**
 * Generate a unique event ID for deduplication between Browser Pixel & future Conversions API (CAPI)
 */
export function generateMetaEventId(prefix: string = 'fb_evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

let isInitialized = false;

/**
 * Safe initializer for Meta Pixel (ensures script is loaded once and only once)
 */
export function initMetaPixel(customPixelId?: string) {
  const pixelId = customPixelId || META_PIXEL_ID;
  if (typeof window === 'undefined' || !pixelId) return;

  if (isInitialized) return;

  try {
    if (!window.fbq) {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    }

    if (window.fbq && typeof window.fbq === 'function') {
      window.fbq('init', pixelId);
      isInitialized = true;
    }
  } catch (e) {
    console.warn('[META PIXEL] Initialization error:', e);
  }
}

/**
 * Base generic Meta tracking function with eventID support
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
) {
  if (typeof window === 'undefined') return;

  const currentEventId = eventId || generateMetaEventId(eventName.toLowerCase());

  if (window.fbq && typeof window.fbq === 'function') {
    try {
      if (currentEventId) {
        window.fbq('track', eventName, params, { eventID: currentEventId });
      } else {
        window.fbq('track', eventName, params);
      }
      console.log(`[META PIXEL] Tracked: ${eventName}`, params, { eventID: currentEventId });
    } catch (e) {
      console.warn(`[META PIXEL] Error tracking ${eventName}:`, e);
    }
  }

  return currentEventId;
}

// Backward compatibility alias
export const trackPixelEvent = trackMetaEvent;

/**
 * 1. PageView Event
 * Prevents multiple duplicate firings on React re-renders
 */
let pageViewFired = false;
export function trackMetaPageView() {
  if (pageViewFired) return;
  pageViewFired = true;

  console.log('[META PIXEL] PageView');
  if (typeof window !== 'undefined' && window.fbq && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'PageView');
    } catch (e) {
      console.warn('[META PIXEL] PageView error:', e);
    }
  }
}

/**
 * 2. ViewContent Event
 * Triggered ONLY when viewing a package or a standalone featured perfume with a valid price.
 * (Will NOT fire when selecting a perfume inside a package).
 */
export function trackMetaViewContent(item: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  type?: 'product' | 'product_group' | 'package' | 'featured' | string;
  category?: string;
}) {
  const price = Number(item.price) || 0;
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const totalValue = Number((price * quantity).toFixed(2));

  // Strictly skip ViewContent if value is <= 0 or invalid (e.g. choosing perfumes inside a package)
  if (totalValue <= 0 || isNaN(totalValue)) {
    console.warn(`[META PIXEL] ViewContent skipped: Item has no valid price (${price}) for:`, item.name);
    return;
  }

  const contentType = normalizeMetaContentType(item.type);

  // Prevent generic placeholder names
  let safeName = String(item.name || '').trim();
  if (!safeName || safeName.toLowerCase() === 'image') {
    safeName = contentType === 'product_group' ? 'باقة عطور' : 'عطر فاخر';
  }

  const eventId = generateMetaEventId('view');

  const payload: Record<string, any> = {
    content_name: safeName,
    content_category: item.category || (contentType === 'product_group' ? 'باقات عطور' : 'عطور مميزة'),
    content_ids: [String(item.id)],
    content_type: contentType,
    value: totalValue,
    currency: DEFAULT_CURRENCY,
    contents: [
      {
        id: String(item.id),
        quantity,
        item_price: price
      }
    ]
  };

  console.log('[META PIXEL] ViewContent', payload);
  trackMetaEvent('ViewContent', payload, eventId);
}

/**
 * Deduplication state for AddToCart (prevent rapid repeated duplicate triggers)
 */
let lastAddToCartSignature = '';
let lastAddToCartTime = 0;

/**
 * 3. AddToCart Event
 * Triggered ONLY when user explicitly adds a package or featured perfume to the cart.
 */
export function trackMetaAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  type?: 'product' | 'product_group' | 'package' | 'featured' | string;
  category?: string;
}) {
  const price = Number(item.price) || 0;
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const totalValue = Number((price * quantity).toFixed(2));

  // Validation: value MUST be a valid number > 0
  if (totalValue <= 0 || isNaN(totalValue)) {
    console.warn(`[META PIXEL] AddToCart skipped: Invalid price/value (${totalValue}) for item:`, item.name);
    return;
  }

  const contentType = normalizeMetaContentType(item.type);

  let safeName = String(item.name || '').trim();
  if (!safeName || safeName.toLowerCase() === 'image') {
    safeName = contentType === 'product_group' ? 'باقة عطور' : 'عطر فاخر';
  }

  // Deduplication check: ignore identical AddToCart within 750ms
  const signature = `${item.id}_${quantity}_${totalValue}`;
  const now = Date.now();
  if (signature === lastAddToCartSignature && now - lastAddToCartTime < 750) {
    console.warn('[META PIXEL] AddToCart skipped: Duplicate event detected within 750ms');
    return;
  }
  lastAddToCartSignature = signature;
  lastAddToCartTime = now;

  const eventId = generateMetaEventId('cart');

  const payload: Record<string, any> = {
    content_name: safeName,
    content_category: item.category || (contentType === 'product_group' ? 'باقات عطور' : 'عطور مميزة'),
    content_ids: [String(item.id)],
    content_type: contentType,
    value: totalValue,
    currency: DEFAULT_CURRENCY,
    contents: [
      {
        id: String(item.id),
        quantity,
        item_price: price
      }
    ]
  };

  console.log('[META PIXEL] AddToCart', payload);
  trackMetaEvent('AddToCart', payload, eventId);
}

/**
 * 4. InitiateCheckout Event
 * Triggered when customer opens delivery form or clicks order button
 */
export function trackMetaInitiateCheckout(data: {
  contents?: Array<{
    content_id: string;
    content_name?: string;
    content_type?: string;
    quantity?: number;
    price?: number;
  }>;
  value: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
}) {
  const totalValue = Number(data.value) || 0;
  if (totalValue <= 0 || isNaN(totalValue)) {
    console.warn(`[META PIXEL] InitiateCheckout skipped: Invalid value (${totalValue})`);
    return;
  }

  const rawContents = data.contents || [];
  const normalizedContents = rawContents.map(item => ({
    id: String(item.content_id),
    quantity: Math.max(1, Number(item.quantity) || 1),
    item_price: Number(item.price) || 0
  }));

  const contentIds = data.content_ids && data.content_ids.length > 0 
    ? data.content_ids 
    : rawContents.map(c => String(c.content_id));

  const rootContentType: 'product' | 'product_group' =
    data.content_type === 'product_group' ||
    rawContents.length > 1 ||
    rawContents.some(c => normalizeMetaContentType(c.content_type) === 'product_group')
      ? 'product_group'
      : 'product';

  const eventId = generateMetaEventId('checkout');

  const payload: Record<string, any> = {
    content_ids: contentIds,
    content_type: rootContentType,
    value: totalValue,
    currency: data.currency || DEFAULT_CURRENCY,
    num_items: normalizedContents.reduce((sum, item) => sum + item.quantity, 0) || 1,
    contents: normalizedContents
  };

  console.log('[META PIXEL] InitiateCheckout', payload);
  trackMetaEvent('InitiateCheckout', payload, eventId);
}

/**
 * 5. Purchase Event (COD Order Created)
 * Triggered ONLY after an order is successfully created in Supabase.
 * Uses order.id as eventID for deduplication.
 */
export function trackMetaPurchase(order: CreatedOrder) {
  if (!order || !order.id) return;

  const totalValue = Number(order.total_price) || 0;
  if (totalValue <= 0 || isNaN(totalValue)) {
    console.warn(`[META PIXEL] Purchase skipped: Invalid order total (${totalValue}) for order:`, order.id);
    return;
  }

  const eventId = String(order.id);

  const contents: Array<{ id: string; quantity: number; item_price: number }> = [];
  const contentIds: string[] = [];

  if (order.selected_perfumes && order.selected_perfumes.length > 0) {
    order.selected_perfumes.forEach((perf, index) => {
      const id = String(perf.id || `item_${index}`);
      contentIds.push(id);
      contents.push({
        id,
        quantity: Math.max(1, Number(perf.quantity) || 1),
        item_price: Number((perf as any).price || order.package_price || totalValue)
      });
    });
  } else {
    const pkgId = String(order.package_id || 'order_pkg');
    contentIds.push(pkgId);
    contents.push({
      id: pkgId,
      quantity: 1,
      item_price: totalValue
    });
  }

  const rootContentType: 'product' | 'product_group' =
    contentIds.length > 1 || String(order.package_id || '').includes('pkg')
      ? 'product_group'
      : 'product';

  const payload: Record<string, any> = {
    content_name: order.package_name || 'طلب عطور فاخرة',
    content_ids: contentIds,
    content_type: rootContentType,
    value: totalValue,
    currency: DEFAULT_CURRENCY,
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0) || 1,
    contents,
    order_id: String(order.id)
  };

  console.log('[META PIXEL] Purchase (COD Order Created)', payload);
  trackMetaEvent('Purchase', payload, eventId);
}
