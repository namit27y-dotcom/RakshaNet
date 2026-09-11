import { createClient } from '@supabase/supabase-js';

// Safe default values for client-side fallbacks (ensuring production deployments never crash on missing env vars)
const DEFAULT_SUPABASE_URL = 'https://ghvsrynwjvchnuqkkzzo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodnNyeW53anZjaG51cWtrenpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjI1OTQsImV4cCI6MjA5OTkzODU5NH0.F_WsK0Srx5iLohrTCYHdrmZR61SInovfjDdYC4EBx2o';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.info('[Rakshak Supabase] Using production fallback endpoint configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
});


