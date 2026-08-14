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
        const rawCat = row.category || row.category_name || '';
        let normalizedCat = rawCat;
        if (rawCat === 'women' || rawCat === 'female' || rawCat.includes('نسائ') || rawCat.includes('نساء')) {
          normalizedCat = 'عطور نسائية';
        } else if (rawCat === 'men' || rawCat === 'male' || rawCat.includes('رجال') || rawCat.includes('رجل')) {
          normalizedCat = 'عطور رجالية';
        } else if (!normalizedCat) {
          normalizedCat = 'عطور عامة';
        }

        return {
          id: String(row.id),
          name: row.name || row.title || 'عطر',
          description: row.description || row.desc || '',
          image_url: row.image_url || row.image || row.photo_url || '',
          category: normalizedCat,
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
 * Also extracts distinct categories from the perfumes list if available.
 */
export async function fetchCategories(perfumesList: Perfume[] = []): Promise<Category[]> {
  if (!supabase) {
    return [
      { id: 'men', name: 'عطور رجالية', slug: 'men', is_active: true },
      { id: 'women', name: 'عطور نسائية', slug: 'women', is_active: true }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (!error && data && data.length > 0) {
      const activeCategories: Category[] = data
        .filter((row: any) => {
          if (row.is_active !== undefined && row.is_active !== null) return Boolean(row.is_active);
          if (row.active !== undefined && row.active !== null) return Boolean(row.active);
          return true;
        })
        .map((row: any) => ({
          id: String(row.id),
          name: row.name || row.name_ar || row.title || 'تصنيف',
          slug: row.slug || row.code || String(row.id),
          is_active: true,
          sort_order: Number(row.sort_order ?? 0)
        }))
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      if (activeCategories.length > 0) {
        return activeCategories;
      }
    }
  } catch (err) {
    console.warn('Exception querying public.categories from Supabase:', err);
  }

  // If public.categories is empty or not present, extract unique categories from perfumes
  if (perfumesList && perfumesList.length > 0) {
    const uniqueCats = Array.from(new Set(perfumesList.map(p => p.category).filter(Boolean)));
    if (uniqueCats.length > 0) {
      return uniqueCats.map((cat, idx) => ({
        id: cat,
        name: cat,
        slug: cat,
        is_active: true,
        sort_order: idx
      }));
    }
  }

  return [
    { id: 'men', name: 'عطور رجالية', slug: 'men', is_active: true },
    { id: 'women', name: 'عطور نسائية', slug: 'women', is_active: true }
  ];
}

