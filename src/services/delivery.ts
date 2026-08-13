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
        office_delivery_price: Number(row.office_delivery_price ?? row.office_price ?? row.desk_price ?? 0),
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

