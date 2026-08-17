import { supabase } from '../lib/supabase';
import { FeaturedPerfume } from '../types/storefront';

/**
 * Fetch all active featured perfumes from public.featured_perfumes
 * Filter: active = true
 * Order: sort_order ASC, created_at DESC
 */
export async function fetchActiveFeaturedPerfumes(): Promise<FeaturedPerfume[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('featured_perfumes')
      .select('id,name,image_url,price,gender,description,active,sort_order,created_at')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active featured perfumes from Supabase:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: String(row.id),
      name: row.name || 'عطر مميز',
      image_url: row.image_url || '',
      price: Number(row.price || 0),
      gender: row.gender === 'women' ? 'women' : 'men',
      description: row.description || '',
      active: Boolean(row.active),
      sort_order: Number(row.sort_order ?? 0),
      created_at: row.created_at
    }));
  } catch (err) {
    console.error('Exception fetching featured perfumes from Supabase:', err);
    return [];
  }
}
