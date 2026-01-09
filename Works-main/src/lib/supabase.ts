import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

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
