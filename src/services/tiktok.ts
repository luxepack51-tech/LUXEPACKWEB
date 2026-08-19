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
 * Generate a unique event ID for deduplication between Browser Pixel & Server Events API
 */
export function generateEventId(prefix: string = 'evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sends event to Server-side TikTok Events API endpoint (/api/tiktok-events)
 * Safe and non-blocking (swallows errors to never interrupt user flows or order submission)
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

    // Send in background without blocking
    fetch('/api/tiktok-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).catch(err => {
      // Server API error should never break user journey
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
 * Triggered when viewing/opening a perfume, package, or featured item
 */
export function trackTikTokViewContent(item: {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  type?: 'perfume' | 'package' | 'featured' | string;
  category?: string;
}) {
  const eventId = generateEventId('view');
  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 1;

  console.log('[TIKTOK] ViewContent', {
    content_id: item.id,
    content_name: item.name,
    content_type: item.type || 'product',
    value: price,
    currency: DEFAULT_CURRENCY
  });

  trackTikTokEvent(
    'ViewContent',
    {
      contents: [
        {
          content_id: item.id,
          content_type: item.type === 'package' ? 'package' : 'product',
          content_name: item.name,
          content_category: item.category || 'العطور',
          quantity,
          price
        }
      ],
      content_id: item.id,
      content_type: item.type === 'package' ? 'package' : 'product',
      content_name: item.name,
      content_category: item.category || 'العطور',
      quantity,
      value: price,
      currency: DEFAULT_CURRENCY
    },
    eventId
  );
}

/**
 * 3. AddToCart Event
 * Triggered when adding a regular perfume to package, package to cart, or featured perfume to cart
 */
export function trackTikTokAddToCart(item: {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  type?: 'perfume' | 'package' | 'featured' | string;
  category?: string;
}) {
  const eventId = generateEventId('cart');
  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 1;
  const totalValue = price * quantity;

  console.log('[TIKTOK] AddToCart', {
    content_id: item.id,
    content_name: item.name,
    content_type: item.type || 'product',
    quantity,
    value: totalValue,
    currency: DEFAULT_CURRENCY
  });

  trackTikTokEvent(
    'AddToCart',
    {
      contents: [
        {
          content_id: item.id,
          content_type: item.type === 'package' ? 'package' : 'product',
          content_name: item.name,
          content_category: item.category || 'العطور',
          quantity,
          price
        }
      ],
      content_id: item.id,
      content_type: item.type === 'package' ? 'package' : 'product',
      content_name: item.name,
      content_category: item.category || 'العطور',
      quantity,
      value: totalValue > 0 ? totalValue : price,
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
  const eventId = generateEventId('checkout');
  const totalValue = Number(data.value) || 0;

  console.log('[TIKTOK] InitiateCheckout', {
    value: totalValue,
    currency: data.currency || DEFAULT_CURRENCY,
    items_count: data.contents?.length || 1
  });

  trackTikTokEvent(
    'InitiateCheckout',
    {
      contents: data.contents?.map(item => ({
        content_id: item.content_id,
        content_name: item.content_name,
        content_type: item.content_type || 'product',
        quantity: item.quantity || 1,
        price: Number(item.price) || 0
      })) || [],
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
  const eventId = order.id; // Crucial for deduplication: event_id = order.id

  // Prepare normalized contents list
  const contents = (order.selected_perfumes || []).map((perf, index) => {
    const isFeatured =
      perf.type === 'featured' ||
      perf.type === 'featured_perfume' ||
      perf.category === 'عطور مميزة' ||
      (typeof perf.name === 'string' && perf.name.includes('عطر مميز'));

    return {
      content_id: perf.id || `item_${index}`,
      content_name: perf.name,
      content_type: isFeatured ? 'featured' : (order.package_name ? 'package_item' : 'perfume'),
      content_category: perf.category || (isFeatured ? 'عطور مميزة' : 'باقات عطور'),
      quantity: Number(perf.quantity) || 1,
      price: Number(order.package_price) || totalValue
    };
  });

  // If no perfumes in array, add summary package item
  if (contents.length === 0) {
    contents.push({
      content_id: order.package_id || 'order_pkg',
      content_name: order.package_name || 'باقة عطور',
      content_type: 'package',
      content_category: 'عطور',
      quantity: 1,
      price: totalValue
    });
  }

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
