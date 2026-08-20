import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import crypto from 'crypto';

function sha256(val: string): string {
  if (!val) return '';
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

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

// Vite dev server middleware for /api/tiktok-events
function tiktokEventsPlugin(): Plugin {
  return {
    name: 'tiktok-events-api',
    configureServer(server) {
      server.middlewares.use('/api/tiktok-events', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const pixelId = process.env.VITE_TIKTOK_PIXEL_ID || process.env.TIKTOK_PIXEL_ID || 'DA2OU1BC77UDVMNGDO9G';
            const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

            const eventName = payload.event || 'PlaceAnOrder';
            const eventId = payload.event_id || `evt_${Date.now()}`;
            const eventTime = payload.event_time || Math.floor(Date.now() / 1000);
            const properties = payload.properties || {};
            const user = payload.user || {};

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

            if (!accessToken) {
              console.warn('[TIKTOK] Server Events API skipped: TIKTOK_ACCESS_TOKEN is not configured in server environment.');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, mode: 'unauthenticated_dev_mode' }));
              return;
            }

            const normalizedPhone = normalizePhone(user.phone);
            const hashedPhone = normalizedPhone ? sha256(normalizedPhone) : undefined;
            const clientIp = user.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            const userAgent = user.user_agent || req.headers['user-agent'] || '';

            const rawContents = Array.isArray(properties.contents) ? properties.contents : [];
            const normalizedContents = rawContents.map((c: any) => {
              const rawType = String(c.content_type || '').toLowerCase();
              const isGroup = rawType === 'product_group' || rawType === 'package' || rawType === 'bundle';
              return {
                content_id: String(c.content_id || ''),
                content_name: String(c.content_name || ''),
                content_type: isGroup ? 'product_group' : 'product',
                content_category: c.content_category || 'العطور',
                quantity: Math.max(1, Number(c.quantity) || 1),
                price: Number(c.price) || 0
              };
            });

            const rootContentType: 'product' | 'product_group' =
              properties.content_type === 'product_group' ||
              normalizedContents.length > 1 ||
              normalizedContents.some((c: any) => c.content_type === 'product_group')
                ? 'product_group'
                : 'product';

            const numValue = properties.value !== undefined ? Number(properties.value) : undefined;

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
                    contents: normalizedContents,
                    content_type: rootContentType,
                    value: numValue !== undefined && !isNaN(numValue) && numValue > 0 ? numValue : undefined,
                    currency: properties.currency || 'DZD'
                  }
                }
              ]
            };

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
              console.warn('[TIKTOK] TikTok Events API Response:', result);
            } else {
              console.log(`[TIKTOK] Server Events API Success for event: ${eventName} (event_id: ${eventId})`);
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, tiktok_response: result }));
          } catch (err: any) {
            console.error('[TIKTOK] Server Events API Dev Exception:', err?.message || err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, error: err?.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), tiktokEventsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
