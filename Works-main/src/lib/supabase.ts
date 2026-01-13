import { createClient } from '@supabase/supabase-js';

// Production uchun environment variables dan olinadi
// Development uchun default qiymatlar
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lssdfboxzvctncdoxrbg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2RmYm94enZjdG5jZG94cmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzYxMTIsImV4cCI6MjA4MTY1MjExMn0.5mMptdWF88_8iHMvwV8E9qkiNFBRqHt7QxS6ZJghmaE';

// Environment variables tekshiruvi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Configure Supabase client with secure settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use cookies instead of localStorage for better security
    storage: undefined, // We'll manage authentication ourselves
    autoRefreshToken: false, // We'll handle token refresh manually
    persistSession: false, // Don't persist in browser storage
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'vakans-app',
    },
  },
});
