import { createClient } from '@supabase/supabase-js';
import { Database } from './types.js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create client for frontend (anon key)
export const createSupabaseClient = () => {
  const anonKey = process.env.SUPABASE_ANON_KEY!;
  return createClient<Database>(supabaseUrl, anonKey);
};

export default supabase;