import { CreatedOrder } from '../types/storefront';

declare global {
  interface Window {
    ttq?: {
      track: (eventName: string, properties?: Record<string, any>, options?: { event_id?: string }) => void;
      page: () => void;
      identify: (params: Record<string, any>) => void;
      load: (pixelId: string) => void;
      [key: string]: any;
    };
  }
}

const DEFAULT_CURRENCY = 'DZD';

/**
 * TikTok strictly allows ONLY 'product' or 'product_group' as content_type.
 * Any other value ('perfume', 'package', 'featured', etc.) is invalid in TikTok Events Manager.
 */
export function normalizeContentType(type?: string): 'product' | 'product_group' {
  if (!type) return 'product';
  const lower = type.toLowerCase();
  if (lower === 'product_group' || lower === 'package' || lower === 'bundle' || lower === 'collection') {
    return 'product_group';
  }
  return 'product';
}

/**
 * Generate a unique event ID for deduplication between Browser Pixel & Server Events API
 */
export function generateEventId(prefix: string = 'evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sends event to Server-side TikTok Events API endpoint (/api/tiktok-events)
 * Safe and non-blocking (swallows errors so it never interrupts checkout or UI flows)
 */
async function sendServerEvent(
  eventName: string,
  properties: Record<string, any> = {},
  eventId?: string,
  user?: Record<string, any>
) {
  try {
    const payload = {
      event: eventName,
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      properties: {
        currency: DEFAULT_CURRENCY,
        ...properties
      },
      user: {
        ...user
      }
    };

    fetch('/api/tiktok-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn('[TIKTOK] Background Server API request failed:', err?.message || err);
    });
  } catch (e) {
    console.warn('[TIKTOK] Could not dispatch Server Event:', e);
  }
}

/**
 * Generic event tracker that syncs Browser Pixel + Server Events API
 */
export function trackTikTokEvent(
  eventName: string,
  properties: Record<string, any> = {},
  eventId?: string,
  user?: Record<string, any>
) {
  const currentEventId = eventId || generateEventId(eventName.toLowerCase());

  // 1. Browser Pixel tracking
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function') {
    try {
      window.ttq.track(eventName, properties, { event_id: currentEventId });
    } catch (e) {
      console.warn(`[TIKTOK] Browser track error for ${eventName}:`, e);
    }
  }

  // 2. Server-side Events API forwarding
  sendServerEvent(eventName, properties, currentEventId, user);

  return currentEventId;
}

/**
 * 1. PageView Event
 */
let pageViewFired = false;
export function trackTikTokPageView() {
  if (pageViewFired) return;
  pageViewFired = true;

  console.log('[TIKTOK] PageView');
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.page === 'function') {
    try {
      window.ttq.page();
    } catch (e) {
      console.warn('[TIKTOK] PageView error:', e);
    }
  }
}

/**
 * 2. ViewContent Event
 * Triggered when viewing/opening a perfume or package (only when it has a valid positive price)
 */
export function trackTikTokViewContent(item: {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  type?: 'product' | 'product_group' | 'perfume' | 'package' | 'featured' | string;
  category?: string;
}) {
  const price = Number(item.price) || 0;
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const totalValue = Number((price * quantity).toFixed(2));
  const contentType = normalizeContentType(item.type);

  // Strictly skip ViewContent if value is 0 or invalid (e.g. choosing perfumes inside a package)
  if (totalValue <= 0 || isNaN(totalValue)) {
    console.warn(`[TIKTOK] ViewContent skipped: Item has no standalone price (${price}) for:`, item.name);
    return;
  }

  // Prevent generic or invalid names such as "Image"
  let safeName = String(item.name || '').trim();
  if (!safeName || safeName.toLowerCase() === 'image') {
    safeName = contentType === 'product_group' ? 'باقة عطور' : 'عطر فاخر';
  }

  const eventId = generateEventId('view');

  const payload: Record<string, any> = {
    contents: [
      {
        content_id: String(item.id),
        content_type: contentType,
        content_name: safeName,
        content_category: item.category || (contentType === 'product_group' ? 'باقات عطور' : 'العطور'),
        quantity,
        price
      }
    ],
    content_id: String(item.id),
    content_type: contentType,
    content_name: safeName,
    content_category: item.category || (contentType === 'product_group' ? 'باقات عطور' : 'العطور'),
    quantity,
    value: totalValue,
    currency: DEFAULT_CURRENCY
  };

  console.log('[TIKTOK] ViewContent', {
    content_id: item.id,
    content_name: safeName,
    content_type: contentType,
    value: totalValue,
    currency: DEFAULT_CURRENCY
  });

  trackTikTokEvent('ViewContent', payload, eventId);
}

/**
 * Deduplication state for AddToCart (prevent rapid repeated duplicate triggers)
 */
let lastAddToCartSignature = '';
let lastAddToCartTime = 0;

/**
 * 3. AddToCart Event
 * Triggered ONLY when a user explicitly adds a package or featured perfume to the cart.
 * Strict rules:
 * - content_type MUST be 'product' or 'product_group'
 * - value MUST be a positive number (> 0)
 * - prevents duplicate calls within short intervals
 */
export function trackTikTokAddToCart(item: {
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
    console.warn(`[TIKTOK] AddToCart skipped: Invalid price/value (${totalValue}) for item:`, item.name);
    return;
  }

  const contentType = normalizeContentType(item.type);

  // Prevent generic or invalid names such as "Image"
  let safeName = String(item.name || '').trim();
  if (!safeName || safeName.toLowerCase() === 'image') {
    safeName = contentType === 'product_group' ? 'باقة عطور' : 'عطر فاخر';
  }

  // Deduplication check: ignore identical AddToCart within 750ms
  const signature = `${item.id}_${quantity}_${totalValue}`;
  const now = Date.now();
  if (signature === lastAddToCartSignature && now - lastAddToCartTime < 750) {
    console.warn('[TIKTOK] AddToCart skipped: Duplicate event detected within 750ms');
    return;
  }
  lastAddToCartSignature = signature;
  lastAddToCartTime = now;

  const eventId = generateEventId('cart');

  console.log('[TIKTOK] AddToCart', {
    content_id: item.id,
    content_name: safeName,
    content_type: contentType,
    quantity,
    value: totalValue,
    currency: DEFAULT_CURRENCY
  });

  trackTikTokEvent(
    'AddToCart',
    {
      contents: [
        {
          content_id: String(item.id),
          content_type: contentType,
          content_name: safeName,
          content_category: item.category || (contentType === 'product_group' ? 'باقات عطور' : 'العطور'),
          quantity,
          price
        }
      ],
      content_id: String(item.id),
      content_type: contentType,
      content_name: safeName,
      content_category: item.category || (contentType === 'product_group' ? 'باقات عطور' : 'العطور'),
      quantity,
      value: totalValue,
      currency: DEFAULT_CURRENCY
    },
    eventId
  );
}

/**
 * 4. InitiateCheckout Event
 * Triggered when transitioning to checkout / delivery form
 */
export function trackTikTokInitiateCheckout(data: {
  contents?: Array<{
    content_id: string;
    content_name: string;
    content_type?: string;
    quantity?: number;
    price?: number;
  }>;
  value: number;
  currency?: string;
}) {
  const totalValue = Number(data.value) || 0;
  if (totalValue <= 0 || isNaN(totalValue)) {
    console.warn(`[TIKTOK] InitiateCheckout skipped: Invalid value (${totalValue})`);
    return;
  }

  const eventId = generateEventId('checkout');
  const normalizedContents = (data.contents || []).map(item => ({
    content_id: String(item.content_id),
    content_name: item.content_name,
    content_type: normalizeContentType(item.content_type),
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Number(item.price) || 0
  }));

  const rootContentType: 'product' | 'product_group' =
    normalizedContents.length > 1 || normalizedContents.some(c => c.content_type === 'product_group')
      ? 'product_group'
      : 'product';

  console.log('[TIKTOK] InitiateCheckout', {
    content_type: rootContentType,
    value: totalValue,
    currency: data.currency || DEFAULT_CURRENCY,
    items_count: normalizedContents.length
  });

  trackTikTokEvent(
    'InitiateCheckout',
    {
      contents: normalizedContents,
      content_type: rootContentType,
      value: totalValue,
      currency: data.currency || DEFAULT_CURRENCY
    },
    eventId
  );
}

/**
 * 5. PlaceAnOrder Event (COD Compliant - strictly PlaceAnOrder, never CompletePayment)
 * Triggered ONLY after an order is successfully created in Supabase.
 * Uses order.id as event_id for guaranteed deduplication with Server Events API.
 */
export function trackTikTokPlaceAnOrder(order: CreatedOrder) {
  if (!order || !order.id) return;

  const totalValue = Number(order.total_price) || 0;
  if (totalValue <= 0 || isNaN(totalValue)) {
    console.warn(`[TIKTOK] PlaceAnOrder skipped: Invalid order total (${totalValue}) for order:`, order.id);
    return;
  }

  const eventId = String(order.id); // Crucial for deduplication: event_id = order.id

  // Prepare normalized contents list with strictly valid content_type ('product' or 'product_group')
  const contents = (order.selected_perfumes || []).map((perf, index) => {
    const isGroup = perf.type === 'package' || perf.type === 'product_group';
    const contentType = isGroup ? 'product_group' : 'product';

    return {
      content_id: String(perf.id || `item_${index}`),
      content_name: String(perf.name),
      content_type: contentType,
      content_category: perf.category || 'العطور',
      quantity: Math.max(1, Number(perf.quantity) || 1),
      price: Number((perf as any).price || order.package_price || totalValue)
    };
  });

  // If no perfumes in array, add summary package item
  if (contents.length === 0) {
    contents.push({
      content_id: String(order.package_id || 'order_pkg'),
      content_name: String(order.package_name || 'باقة عطور'),
      content_type: 'product_group',
      content_category: 'العطور',
      quantity: 1,
      price: totalValue
    });
  }

  const rootContentType: 'product' | 'product_group' =
    contents.length > 1 || contents.some(c => c.content_type === 'product_group')
      ? 'product_group'
      : 'product';

  // Exact required logging format
  console.log('[TIKTOK] PlaceAnOrder');
  console.log(`order_id: ${order.id}`);
  console.log(`total: ${totalValue} ${DEFAULT_CURRENCY}`);
  console.log('items:', contents);

  // Dispatch Browser + Server Events with matching event_id
  trackTikTokEvent(
    'PlaceAnOrder',
    {
      contents,
      content_type: rootContentType,
      value: totalValue,
      currency: DEFAULT_CURRENCY,
      order_id: order.id,
      delivery_price: Number(order.delivery_price) || 0,
      delivery_type: order.delivery_type,
      wilaya: order.wilaya_name,
      commune: order.commune_name
    },
    eventId,
    {
      phone: order.phone,
      customer_name: order.customer_name
    }
  );
}
