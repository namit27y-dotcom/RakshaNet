import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Fallback dummy endpoint to allow safe client creation without throwing fatal top-level errors if env vars are unconfigured
const DUMMY_URL = 'https://placeholder.supabase.co';
const DUMMY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-kJomOWnNO7-WwLJSbdjEgKVj2Nm_e17jmd03i49mg';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || DUMMY_URL,
  supabaseAnonKey || DUMMY_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);



