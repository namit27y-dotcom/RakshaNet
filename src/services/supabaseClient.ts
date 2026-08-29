import { createClient } from '@supabase/supabase-js';

const env = typeof (import.meta as any).env !== 'undefined' ? (import.meta as any).env : (globalThis as any).process?.env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://ghvsrynwjvchnuqkkzzo.supabase.co';
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodnNyeW53anZjaG51cWtrenpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjI1OTQsImV4cCI6MjA5OTkzODU5NH0.F_WsK0Srx5iLohrTCYHdrmZR61SInovfjDdYC4EBx2o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
