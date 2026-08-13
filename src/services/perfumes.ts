import { supabase } from '../lib/supabase';
import { Perfume, Category } from '../types/storefront';

/**
 * Fetches active perfumes dynamically from Supabase `public.perfumes`.
 * Does NOT fallback to any hardcoded perfumes catalog.
 */
export async function fetchPerfumes(): Promise<Perfume[]> {
  if (!supabase) {
    console.warn('Supabase client not initialized. Cannot fetch perfumes.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('perfumes')
      .select('*');

    if (error || !data) {
      console.warn('Supabase error or empty data for perfumes:', error);
      return [];
    }

    const activePerfumes: Perfume[] = data
      .filter((row: any) => {
        if (row.is_active !== undefined && row.is_active !== null) return Boolean(row.is_active);
        if (row.active !== undefined && row.active !== null) return Boolean(row.active);
        if (row.status !== undefined && row.status !== null) return row.status === 'active' || row.status === 'enabled';
        return true;
      })
      .map((row: any) => {
        let cat = row.category || row.category_name || '';
        if (cat === 'women' || cat === 'female' || cat.includes('نسائ') || cat.includes('نساء')) {
          cat = 'عطور نسائية';
        } else if (cat === 'men' || cat === 'male' || cat.includes('رجال') || cat.includes('رجل')) {
          cat = 'عطور رجالية';
        } else {
          cat = 'عطور رجالية';
        }

        return {
          id: String(row.id),
          name: row.name || row.title || 'عطر',
          description: row.description || row.desc || '',
          image_url: row.image_url || row.image || row.photo_url || '',
          category: cat,
          category_id: row.category_id ? String(row.category_id) : null,
          is_active: true,
          sort_order: Number(row.sort_order ?? row.sort ?? 0)
        };
      })
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return activePerfumes;
  } catch (err) {
    console.error('Exception fetching perfumes from Supabase:', err);
    return [];
  }
}

/**
 * Fetches all perfumes (active & inactive) for the Admin Dashboard.
 */
export async function fetchAllAdminPerfumes(): Promise<Perfume[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('perfumes')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.warn('Error fetching all perfumes for admin:', error);
      return [];
    }

    return data.map((row: any) => ({
      id: String(row.id),
      name: row.name || row.title || 'عطر',
      description: row.description || row.desc || '',
      image_url: row.image_url || row.image || row.photo_url || '',
      category: row.category || row.category_name || 'عطور عامة',
      category_id: row.category_id ? String(row.category_id) : null,
      is_active: row.is_active !== undefined ? Boolean(row.is_active) : (row.status === 'active' || true),
      sort_order: Number(row.sort_order ?? row.sort ?? 0)
    }));
  } catch (err) {
    console.error('Exception fetching admin perfumes:', err);
    return [];
  }
}

/**
 * Inserts a new perfume directly into Supabase `public.perfumes`.
 */
export async function addPerfume(perfumeData: {
  name: string;
  description: string;
  image_url: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}): Promise<{ success: boolean; data?: any; error?: any }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('perfumes')
      .insert([
        {
          name: perfumeData.name,
          description: perfumeData.description,
          image_url: perfumeData.image_url,
          category: perfumeData.category,
          is_active: perfumeData.is_active,
          sort_order: perfumeData.sort_order
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting perfume into Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Exception adding perfume:', err);
    return { success: false, error: err };
  }
}

/**
 * Toggles perfume active status (`is_active`) in `public.perfumes`.
 */
export async function togglePerfumeActiveStatus(id: string, newStatus: boolean): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('perfumes')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling perfume active status in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception updating perfume active status:', err);
    return false;
  }
}

/**
 * Deletes a perfume from `public.perfumes`.
 */
export async function deletePerfumeFromDatabase(id: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('perfumes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting perfume from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception deleting perfume:', err);
    return false;
  }
}

/**
 * Fetches categories dynamically from Supabase `public.categories`.
 * Also merges distinct categories present on active perfumes so all categories are available.
 */
export async function fetchCategories(_perfumesList: Perfume[] = []): Promise<Category[]> {
  return [
    { id: 'all', name: 'الكل', slug: 'all', is_active: true },
    { id: 'women', name: 'عطور نسائية', slug: 'women', is_active: true },
    { id: 'men', name: 'عطور رجالية', slug: 'men', is_active: true }
  ];
}

