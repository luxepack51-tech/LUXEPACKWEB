import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Utility helper to safely run a Supabase query with graceful error handling.
 */
export async function safeQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  fallback: T
): Promise<T> {
  if (!supabase) {
    return fallback;
  }
  try {
    const { data, error } = await queryFn(supabase);
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      if (error) {
        console.warn('Supabase query returned error or empty, using fallback:', error.message || error);
      }
      return fallback;
    }
    return data;
  } catch (err) {
    console.warn('Supabase execution error, using fallback:', err);
    return fallback;
  }
}
