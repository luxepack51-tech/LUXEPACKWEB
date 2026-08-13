import { supabase, safeQuery } from '../lib/supabase';
import { StoreSettings } from '../types/storefront';
import { DEFAULT_STORE_SETTINGS } from '../data/mockData';

export async function fetchStoreSettings(): Promise<StoreSettings> {
  if (!supabase) {
    return DEFAULT_STORE_SETTINGS;
  }

  return safeQuery(async (client) => {
    // Try 'store_settings' or 'settings' table
    let { data, error } = await client
      .from('store_settings')
      .select('*')
      .limit(1);

    if ((error || !data || data.length === 0)) {
      const fallbackResult = await client.from('settings').select('*').limit(1);
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error || !data || data.length === 0) {
      return { data: null, error };
    }

    const row = data[0];
    const settings: StoreSettings = {
      store_name: row.store_name || row.site_name || row.name || DEFAULT_STORE_SETTINGS.store_name,
      currency: row.currency || DEFAULT_STORE_SETTINGS.currency,
      phone_number: row.phone_number || row.phone || DEFAULT_STORE_SETTINGS.phone_number,
      whatsapp_number: row.whatsapp_number || row.whatsapp || DEFAULT_STORE_SETTINGS.whatsapp_number,
      pixel_id: row.pixel_id || row.meta_pixel_id || row.facebook_pixel_id || '',
      hero_title: row.hero_title || DEFAULT_STORE_SETTINGS.hero_title,
      hero_subtitle: row.hero_subtitle || DEFAULT_STORE_SETTINGS.hero_subtitle
    };

    return { data: settings, error: null };
  }, DEFAULT_STORE_SETTINGS);
}
