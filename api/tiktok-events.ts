import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

interface TikTokEventPayload {
  event: string;
  event_id?: string;
  event_time?: number;
  properties?: Record<string, any>;
  user?: {
    phone?: string;
    customer_name?: string;
    ip?: string;
    user_agent?: string;
  };
}

/**
 * SHA256 helper for TikTok user data hashing
 */
function sha256(val: string): string {
  if (!val) return '';
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

/**
 * Normalized Algerian/International phone number for TikTok hashing
 */
function normalizePhone(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+213' + cleaned.substring(1);
  } else if (cleaned.startsWith('213')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

/**
 * Server-Side TikTok Events API forwarder
 */
export async function handleTikTokEvent(payload: TikTokEventPayload, reqHeaders: Record<string, any> = {}) {
  const pixelId = process.env.VITE_TIKTOK_PIXEL_ID || process.env.TIKTOK_PIXEL_ID || 'DA2OU1BC77UDVMNGDO9G';
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  const eventName = payload.event || 'PlaceAnOrder';
  const eventId = payload.event_id || `evt_${Date.now()}`;
  const eventTime = payload.event_time || Math.floor(Date.now() / 1000);
  const properties = payload.properties || {};
  const user = payload.user || {};

  // User details
  const clientIp = user.ip || reqHeaders['x-forwarded-for'] || reqHeaders['x-real-ip'] || '';
  const userAgent = user.user_agent || reqHeaders['user-agent'] || '';
  const normalizedPhone = normalizePhone(user.phone);
  const hashedPhone = normalizedPhone ? sha256(normalizedPhone) : undefined;

  // Safe developer logging (never logs access token)
  console.log(`[TIKTOK] Server Event: ${eventName}`);
  if (properties.order_id || eventId) {
    console.log(`order_id: ${properties.order_id || eventId}`);
  }
  if (properties.value !== undefined) {
    console.log(`total: ${properties.value} ${properties.currency || 'DZD'}`);
  }
  if (properties.contents) {
    console.log('items:', properties.contents);
  }

  // If no Access Token is provided, log warning and return gracefully
  if (!accessToken) {
    console.warn('[TIKTOK] Server Events API skipped: TIKTOK_ACCESS_TOKEN is not configured in server environment.');
    return {
      success: true,
      mode: 'unauthenticated_dev_mode',
      message: 'TIKTOK_ACCESS_TOKEN not set on server'
    };
  }

  // Prepare TikTok Events API v1.3 Payload
  const tiktokPayload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event: eventName,
        event_id: eventId,
        event_time: eventTime,
        user: {
          phone: hashedPhone,
          ip: clientIp ? String(clientIp).split(',')[0].trim() : undefined,
          user_agent: userAgent ? String(userAgent) : undefined
        },
        properties: {
          contents: properties.contents || [],
          value: properties.value !== undefined ? Number(properties.value) : undefined,
          currency: properties.currency || 'DZD'
        }
      }
    ]
  };

  try {
    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken
      },
      body: JSON.stringify(tiktokPayload)
    });

    const result = await response.json();

    if (result.code !== 0) {
      console.warn('[TIKTOK] TikTok Events API Error Response:', {
        code: result.code,
        message: result.message
      });
    } else {
      console.log(`[TIKTOK] Server Events API Success for event: ${eventName} (event_id: ${eventId})`);
    }

    return {
      success: true,
      tiktok_response: result
    };
  } catch (err: any) {
    console.error('[TIKTOK] Network error contacting TikTok Events API:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Network error'
    };
  }
}

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await handleTikTokEvent(payload, req.headers || {});
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[TIKTOK] Serverless Handler Exception:', error);
    return res.status(200).json({ success: false, error: error?.message || 'Server error' });
  }
}
