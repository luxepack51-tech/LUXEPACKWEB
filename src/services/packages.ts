import { supabase } from '../lib/supabase';
import { Package } from '../types/storefront';

export async function fetchPackages(): Promise<Package[]> {
  if (!supabase) {
    console.warn('Supabase client not initialized.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*');

    if (error || !data) {
      console.warn('Error fetching packages from Supabase:', error);
      return [];
    }

    const activePackages: Package[] = data
      .filter((row: any) => {
        if (row.is_active !== undefined && row.is_active !== null) return Boolean(row.is_active);
        if (row.active !== undefined && row.active !== null) return Boolean(row.active);
        if (row.status !== undefined && row.status !== null) return row.status === 'active' || row.status === 'enabled';
        return true;
      })
      .map((row: any) => ({
        id: String(row.id),
        name: row.name || row.title || 'باقة عطور',
        description: row.description || row.desc || '',
        price: Number(row.price || 0),
        perfumes_count: Number(row.perfumes_count ?? row.perfume_count ?? row.allowed_perfumes ?? row.count ?? 3),
        is_active: true,
        sort_order: Number(row.sort_order ?? row.sort ?? 0)
      }))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return activePackages;
  } catch (err) {
    console.error('Exception fetching packages from Supabase:', err);
    return [];
  }
}

