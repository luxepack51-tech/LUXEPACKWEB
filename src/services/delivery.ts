import { supabase } from '../lib/supabase';
import { Wilaya, Commune } from '../types/storefront';

export async function fetchWilayas(): Promise<Wilaya[]> {
  if (!supabase) {
    console.warn('Supabase client not initialized.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('wilayas')
      .select('*');

    if (error || !data) {
      console.warn('Error fetching wilayas from Supabase:', error);
      return [];
    }

    const activeWilayas: Wilaya[] = data
      .filter((row: any) => {
        if (row.is_active !== undefined && row.is_active !== null) return Boolean(row.is_active);
        if (row.active !== undefined && row.active !== null) return Boolean(row.active);
        return true;
      })
      .map((row: any) => {
        const codeNum = Number(row.code ?? row.id ?? 0);
        const codeStr = String(codeNum > 0 ? codeNum : row.code || row.id).padStart(2, '0');
        const rawName = String(row.name_ar || row.name || `ولاية ${codeStr}`);
        // Remove any leading digits, dashes, or prefix separators to keep ONLY the Wilaya name
        const justName = rawName.replace(/^\d+\s*[-—]?\s*/, '').trim();

        return {
          id: String(row.id),
          code: codeStr,
          name: justName,
          name_ar: justName,
          is_active: true,
          sort_order: Number(row.sort_order ?? codeNum ?? 0)
        };
      })
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return activeWilayas;
  } catch (err) {
    console.error('Exception fetching wilayas from Supabase:', err);
    return [];
  }
}

export async function fetchCommunesByWilaya(wilayaId: string, wilayaName?: string): Promise<Commune[]> {
  if (!supabase || !wilayaId) {
    return [];
  }

  try {
    let { data, error } = await supabase
      .from('communes')
      .select('*')
      .eq('wilaya_id', wilayaId);

    if ((error || !data || data.length === 0) && wilayaId) {
      const numId = parseInt(wilayaId);
      if (!isNaN(numId)) {
        const fallbackRes = await supabase
          .from('communes')
          .select('*')
          .eq('wilaya_id', numId);
        if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
          data = fallbackRes.data;
          error = null;
        }
      }
    }

    if (error || !data) {
      console.warn(`Error fetching communes for wilaya ${wilayaId}:`, error);
      return [];
    }

    const activeCommunes: Commune[] = data
      .filter((row: any) => {
        if (row.is_active !== undefined && row.is_active !== null) return Boolean(row.is_active);
        if (row.active !== undefined && row.active !== null) return Boolean(row.active);
        return true;
      })
      .map((row: any) => ({
        id: String(row.id),
        wilaya_id: String(row.wilaya_id),
        name: row.name || row.name_ar || 'بلدية',
        name_ar: row.name_ar || row.name || 'بلدية',
        home_delivery_price: Number(row.home_delivery_price ?? row.home_price ?? row.delivery_price ?? 0),
        home_delivery_available: row.home_delivery_available !== undefined && row.home_delivery_available !== null ? Boolean(row.home_delivery_available) : true,
        office_delivery_price: Number(row.office_delivery_price ?? row.office_price ?? row.desk_price ?? 0),
        office_delivery_available: row.office_delivery_available !== undefined && row.office_delivery_available !== null ? Boolean(row.office_delivery_available) : true,
        is_active: true,
        sort_order: Number(row.sort_order ?? row.sort ?? 0)
      }))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return activeCommunes;
  } catch (err) {
    console.error('Exception fetching communes from Supabase:', err);
    return [];
  }
}

export async function fetchCommuneById(communeId: string): Promise<Commune | null> {
  if (!supabase || !communeId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('communes')
      .select('*')
      .eq('id', communeId)
      .maybeSingle();

    if (error || !data) {
      // If integer id
      const numId = parseInt(communeId);
      if (!isNaN(numId)) {
        const { data: numData, error: numError } = await supabase
          .from('communes')
          .select('*')
          .eq('id', numId)
          .maybeSingle();

        if (!numError && numData) {
          return {
            id: String(numData.id),
            wilaya_id: String(numData.wilaya_id),
            name: numData.name || numData.name_ar || 'بلدية',
            name_ar: numData.name_ar || numData.name || 'بلدية',
            home_delivery_price: Number(numData.home_delivery_price ?? numData.home_price ?? numData.delivery_price ?? 0),
            home_delivery_available: numData.home_delivery_available !== undefined && numData.home_delivery_available !== null ? Boolean(numData.home_delivery_available) : true,
            office_delivery_price: Number(numData.office_delivery_price ?? numData.office_price ?? numData.desk_price ?? 0),
            office_delivery_available: numData.office_delivery_available !== undefined && numData.office_delivery_available !== null ? Boolean(numData.office_delivery_available) : true,
            is_active: true,
            sort_order: Number(numData.sort_order ?? 0)
          };
        }
      }
      return null;
    }

    return {
      id: String(data.id),
      wilaya_id: String(data.wilaya_id),
      name: data.name || data.name_ar || 'بلدية',
      name_ar: data.name_ar || data.name || 'بلدية',
      home_delivery_price: Number(data.home_delivery_price ?? data.home_price ?? data.delivery_price ?? 0),
      home_delivery_available: data.home_delivery_available !== undefined && data.home_delivery_available !== null ? Boolean(data.home_delivery_available) : true,
      office_delivery_price: Number(data.office_delivery_price ?? data.office_price ?? data.desk_price ?? 0),
      office_delivery_available: data.office_delivery_available !== undefined && data.office_delivery_available !== null ? Boolean(data.office_delivery_available) : true,
      is_active: true,
      sort_order: Number(data.sort_order ?? 0)
    };
  } catch (err) {
    console.error('Exception fetching commune by ID from Supabase:', err);
    return null;
  }
}

