import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    '[PhD Match DE] Supabase env vars missing. Copy .env.example to .env and fill in VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', anonKey ?? 'placeholder');

export const hasSupabase = Boolean(url && anonKey);
