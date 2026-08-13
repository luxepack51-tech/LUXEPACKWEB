declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let isPixelInitialized = false;

export function initMetaPixel(pixelId?: string) {
  if (!pixelId || isPixelInitialized || typeof window === 'undefined') return;

  try {
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

    if (window.fbq) {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      isPixelInitialized = true;
    }
  } catch (e) {
    console.warn('Meta Pixel initialization error:', e);
  }
}

export function trackPixelEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', eventName, params);
      console.log(`[Meta Pixel] Tracked: ${eventName}`, params);
    } catch (e) {
      console.warn(`[Meta Pixel] Error tracking ${eventName}:`, e);
    }
  }
}
